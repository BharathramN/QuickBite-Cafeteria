import { Reward } from '../models/Reward.js';
import { Redemption } from '../models/Redemption.js';
import { User } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { generateQrCodeDataUrl } from '../utils/qr.js';
import { getTodayDateString } from '../utils/dateHelper.js';

// @desc    Get all active rewards (or all if admin)
// @route   GET /api/rewards
// @access  Public
export const getRewards = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin ? {} : { isActive: true };
    const rewards = await Reward.find(filter).sort({ coinCost: 1 });
    return res.json(rewards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Redeem a reward with Campus Coins
// @route   POST /api/rewards/:id/redeem
// @access  Private (Student)
export const redeemReward = async (req, res) => {
  try {
    const rewardId = req.params.id;
    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student account not found' });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(400).json({ message: 'This reward is currently unavailable' });
    }

    // Server-side validation: Check sufficient coin balance
    if (student.coins < reward.coinCost) {
      return res.status(400).json({
        message: `Insufficient coins! You have ${student.coins} coins, but ${reward.name} requires ${reward.coinCost} coins.`,
        currentBalance: student.coins,
        requiredCoins: reward.coinCost,
      });
    }

    // Deduct coins from student
    student.coins -= reward.coinCost;
    await student.save();

    // Generate unique redemption code: RDM-YYYYMMDD-XXXX
    const today = getTodayDateString().replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const redemptionCode = `RDM-${today}-${randomHex}`;

    // Generate QR code for reward redemption
    const qrPayload = JSON.stringify({
      type: 'REWARD_REDEMPTION',
      redemptionCode,
      rewardId: reward._id,
      rewardName: reward.name,
      studentId: student.studentId || student._id,
      studentName: student.name,
    });
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

    // Create redemption record
    const redemption = await Redemption.create({
      redemptionCode,
      student: student._id,
      reward: reward._id,
      rewardName: reward.name,
      coinCost: reward.coinCost,
      status: 'Pending',
      qrCodeDataUrl,
    });

    // Record ledger transaction for deduction
    await CoinTransaction.create({
      student: student._id,
      amount: -reward.coinCost,
      type: 'REDEEMED_REWARD',
      description: `Redeemed ${reward.name}`,
      balanceAfter: student.coins,
      referenceId: redemptionCode,
    });

    return res.status(201).json({
      message: `Reward redeemed successfully! Present your QR pass at the cafeteria counter to claim ${reward.name}.`,
      redemption,
      newBalance: student.coins,
    });
  } catch (error) {
    console.error('redeemReward error:', error);
    return res.status(500).json({ message: error.message || 'Error redeeming reward' });
  }
};

// @desc    Get student's active and past redemptions
// @route   GET /api/rewards/my-redemptions
// @access  Private (Student)
export const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ student: req.user._id })
      .populate('reward')
      .sort({ createdAt: -1 });

    return res.json(redemptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Create new reward
// @route   POST /api/rewards
// @access  Private (Admin)
export const createReward = async (req, res) => {
  try {
    const { name, description, coinCost, category, imageUrl } = req.body;

    if (!name || !coinCost) {
      return res.status(400).json({ message: 'Reward name and coin cost are required' });
    }

    const reward = await Reward.create({
      name,
      description: description || '',
      coinCost: Number(coinCost),
      category: category || 'Snack & Beverage',
      imageUrl: imageUrl || '',
      isActive: true,
    });

    return res.status(201).json(reward);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update reward
// @route   PUT /api/rewards/:id
// @access  Private (Admin)
export const updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    return res.json(reward);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete/Disable reward
// @route   DELETE /api/rewards/:id
// @access  Private (Admin)
export const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    // Soft toggle or delete
    reward.isActive = !reward.isActive;
    await reward.save();
    return res.json({ message: `Reward is now ${reward.isActive ? 'active' : 'disabled'}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
