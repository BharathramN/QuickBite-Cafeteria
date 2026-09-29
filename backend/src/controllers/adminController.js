import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Redemption } from '../models/Redemption.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { DailyMenu } from '../models/DailyMenu.js';
import { getTodayDateString } from '../utils/dateHelper.js';

// @desc    Get dashboard metrics & today's bookings
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    const today = req.query.date || getTodayDateString();
    const searchQuery = req.query.search ? req.query.search.trim() : '';

    // Filter bookings for the date
    let filter = { date: today };

    // Search filter if provided
    if (searchQuery) {
      // Find matching students first
      const matchingStudents = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { studentId: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
      }).select('_id');

      const studentIds = matchingStudents.map((s) => s._id);

      filter.$or = [
        { bookingId: { $regex: searchQuery, $options: 'i' } },
        { student: { $in: studentIds } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('student', 'name studentId email phone')
      .sort({ createdAt: -1 });

    // Calculate analytics for non-cancelled bookings
    const activeAndCollected = bookings.filter((b) => b.status !== 'Cancelled');
    
    let totalVegQty = 0;
    let totalNonVegQty = 0;
    let totalMealsBooked = 0;
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalPending = 0;

    for (const b of activeAndCollected) {
      if (b.mealType === 'veg') {
        totalVegQty += b.quantity;
      } else {
        totalNonVegQty += b.quantity;
      }
      totalMealsBooked += b.quantity;
      totalRevenue += b.totalPrice;

      if (b.status === 'Collected') {
        totalCollected++;
      } else if (b.status === 'Pending') {
        totalPending++;
      }
    }

    const currentMenu = await DailyMenu.findOne({ date: today });

    return res.json({
      date: today,
      stats: {
        totalVegQty,
        totalNonVegQty,
        totalMealsBooked,
        totalRevenue,
        totalCollected,
        totalPending,
        totalCancelled: bookings.filter((b) => b.status === 'Cancelled').length,
        totalBookingsCount: bookings.length,
      },
      menu: currentMenu,
      bookings,
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Scan or enter booking code & mark breakfast as Collected
// @route   POST /api/admin/scan/booking
// @access  Private (Admin)
export const scanOrCollectBooking = async (req, res) => {
  try {
    const { code } = req.body; // Can be raw QR JSON string or bookingId

    if (!code) {
      return res.status(400).json({ message: 'Booking ID or QR payload is required' });
    }

    let bookingId = code.trim();

    // Check if code is JSON payload from QR scanner
    if (code.startsWith('{') && code.endsWith('}')) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.bookingId) {
          bookingId = parsed.bookingId;
        }
      } catch (e) {
        // Not JSON, continue with raw code
      }
    }

    const booking = await Booking.findOne({ bookingId }).populate('student', 'name studentId email coins');

    if (!booking) {
      return res.status(404).json({ message: `No booking found with ID: ${bookingId}` });
    }

    // Business rule: Prevent duplicate collection / reuse of same QR pass
    if (booking.status === 'Collected') {
      return res.status(400).json({
        message: `⚠️ Breakfast ALREADY COLLECTED on ${new Date(booking.collectedAt).toLocaleTimeString()}`,
        booking,
        alreadyCollected: true,
      });
    }

    // Business rule: Cancelled booking cannot be collected
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        message: '❌ This booking was CANCELLED and cannot be collected.',
        booking,
      });
    }

    // Mark as collected
    booking.status = 'Collected';
    booking.collectedAt = new Date();

    // STRICT BUSINESS RULE: Award 5 Campus Coins ONLY upon successful collection
    const COINS_PER_BREAKFAST = 5;
    const student = await User.findById(booking.student._id);

    if (student) {
      student.coins += COINS_PER_BREAKFAST;
      await student.save();
      booking.coinsAwarded = true;

      // Add audit transaction ledger
      await CoinTransaction.create({
        student: student._id,
        amount: COINS_PER_BREAKFAST,
        type: 'EARNED_BOOKING',
        description: `Collected ${booking.mealName} (${booking.quantity}x)`,
        balanceAfter: student.coins,
        referenceId: booking.bookingId,
      });
    }

    await booking.save();

    return res.json({
      message: `🎉 Breakfast Verified & Collected! ${COINS_PER_BREAKFAST} Campus Coins awarded to ${student ? student.name : 'student'}.`,
      booking,
      studentNewBalance: student ? student.coins : 0,
      coinsAwarded: COINS_PER_BREAKFAST,
    });
  } catch (error) {
    console.error('scanOrCollectBooking error:', error);
    return res.status(500).json({ message: error.message || 'Error processing breakfast collection' });
  }
};

// @desc    Scan or enter reward redemption code & mark as Redeemed
// @route   POST /api/admin/scan/reward
// @access  Private (Admin)
export const scanOrVerifyReward = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Redemption code or QR payload is required' });
    }

    let redemptionCode = code.trim();

    if (code.startsWith('{') && code.endsWith('}')) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.redemptionCode) {
          redemptionCode = parsed.redemptionCode;
        }
      } catch (e) {
        // Not JSON
      }
    }

    const redemption = await Redemption.findOne({ redemptionCode })
      .populate('student', 'name studentId email')
      .populate('reward');

    if (!redemption) {
      return res.status(404).json({ message: `No reward voucher found with code: ${redemptionCode}` });
    }

    if (redemption.status === 'Redeemed') {
      return res.status(400).json({
        message: `⚠️ This reward pass was ALREADY REDEEMED on ${new Date(redemption.redeemedAt).toLocaleTimeString()}`,
        redemption,
        alreadyRedeemed: true,
      });
    }

    if (redemption.status === 'Cancelled') {
      return res.status(400).json({ message: 'This reward redemption pass was cancelled.', redemption });
    }

    redemption.status = 'Redeemed';
    redemption.redeemedAt = new Date();
    await redemption.save();

    return res.json({
      message: `✅ Reward successfully claimed: "${redemption.rewardName}" for ${redemption.student ? redemption.student.name : 'student'}!`,
      redemption,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all redemptions (Admin view)
// @route   GET /api/admin/redemptions
// @access  Private (Admin)
export const getAllRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find()
      .populate('student', 'name studentId email')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(redemptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all campus coin transactions (Admin audit)
// @route   GET /api/admin/transactions
// @access  Private (Admin)
export const getAllCoinTransactions = async (req, res) => {
  try {
    const transactions = await CoinTransaction.find()
      .populate('student', 'name studentId email')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
