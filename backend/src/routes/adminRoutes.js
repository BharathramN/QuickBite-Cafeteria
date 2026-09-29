import express from 'express';
import {
  getAdminDashboard,
  scanOrCollectBooking,
  scanOrVerifyReward,
  getAllRedemptions,
  getAllCoinTransactions,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getAdminDashboard);
router.post('/scan/booking', scanOrCollectBooking);
router.post('/scan/reward', scanOrVerifyReward);
router.get('/redemptions', getAllRedemptions);
router.get('/transactions', getAllCoinTransactions);

export default router;
