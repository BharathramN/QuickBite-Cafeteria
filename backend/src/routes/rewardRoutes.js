import express from 'express';
import {
  getRewards,
  redeemReward,
  getMyRedemptions,
  createReward,
  updateReward,
  deleteReward,
} from '../controllers/rewardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRewards);
router.post('/:id/redeem', protect, redeemReward);
router.get('/my-redemptions', protect, getMyRedemptions);

// Admin endpoints
router.post('/', protect, adminOnly, createReward);
router.put('/:id', protect, adminOnly, updateReward);
router.delete('/:id', protect, adminOnly, deleteReward);

export default router;
