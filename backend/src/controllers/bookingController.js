import { Booking } from '../models/Booking.js';
import { DailyMenu } from '../models/DailyMenu.js';
import { getTodayDateString, isPastCutoff } from '../utils/dateHelper.js';
import { generateQrCodeDataUrl } from '../utils/qr.js';

// @desc    Pre-book breakfast
// @route   POST /api/bookings
// @access  Private (Student)
export const createBooking = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { mealType, quantity = 1, pickupPoint = 'Cafeteria TP1', notes = '' } = req.body;

    const validPickupPoints = ['Cafeteria TP1', 'Food joint UB building', 'Cafeteria Main block'];
    if (!pickupPoint || !validPickupPoints.includes(pickupPoint)) {
      return res.status(400).json({
        message: 'Please select a valid SRM campus pick-up point: Cafeteria TP1, Food joint UB building, or Cafeteria Main block',
      });
    }

    if (!mealType || !['veg', 'non_veg'].includes(mealType)) {
      return res.status(400).json({ message: 'Valid meal type (veg or non_veg) is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 10' });
    }

    const today = getTodayDateString();

    // 1. Fetch today's menu to get item details and verify cutoff
    const menu = await DailyMenu.findOne({ date: today });
    if (!menu) {
      return res.status(400).json({ message: "Today's breakfast menu has not been published yet." });
    }

    // 2. Enforce Cutoff Time
    if (isPastCutoff(menu.cutoffTime, today)) {
      return res.status(400).json({
        message: `Booking closed! Daily breakfast booking cutoff time was ${menu.cutoffTime}.`,
      });
    }

    // 3. Prevent duplicate active bookings for the same day
    const existingActiveBooking = await Booking.findOne({
      student: studentId,
      date: today,
      status: { $ne: 'Cancelled' },
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        message: 'You already have an active breakfast pre-booking for today! Check "My Bookings".',
        existingBookingId: existingActiveBooking.bookingId,
      });
    }

    // 4. Determine selected meal info & price
    const selectedItem = mealType === 'veg' ? menu.veg : menu.nonVeg;
    if (!selectedItem || !selectedItem.isAvailable) {
      return res.status(400).json({ message: `Sorry, the ${mealType === 'veg' ? 'Veg' : 'Non-Veg'} option is currently sold out.` });
    }

    const unitPrice = selectedItem.price;
    const totalPrice = unitPrice * qty;

    // 5. Generate unique Booking ID: e.g. QB-YYYYMMDD-XXXX
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const cleanDate = today.replace(/-/g, '');
    const bookingId = `QB-${cleanDate}-${randomHex}`;

    // 6. Generate secure scannable QR Code with pickup point
    const qrPayload = JSON.stringify({
      type: 'BREAKFAST_BOOKING',
      bookingId,
      studentId: req.user.studentId || req.user._id,
      studentName: req.user.name,
      mealType,
      quantity: qty,
      pickupPoint,
      date: today,
    });

    const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

    // 7. Save booking (coins are NOT awarded here!)
    const booking = await Booking.create({
      bookingId,
      student: studentId,
      date: today,
      mealType,
      mealName: selectedItem.name,
      unitPrice,
      quantity: qty,
      totalPrice,
      pickupPoint,
      status: 'Pending',
      qrCodeDataUrl,
      notes,
    });

    return res.status(201).json({
      message: 'Breakfast pre-booked successfully! Show your QR code at the cafeteria counter to collect.',
      booking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create booking' });
  }
};

// @desc    Get logged in student's bookings (active + history)
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const studentId = req.user._id;
    const today = getTodayDateString();

    const bookings = await Booking.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Separate active (today & pending) from past/history
    const activeBooking = bookings.find(
      (b) => b.date === today && b.status === 'Pending'
    ) || null;

    return res.json({
      activeBooking,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a pending booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, student: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot cancel booking that is already ${booking.status}` });
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return res.json({
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
