import express from 'express';
import { getTodayMenu, getMenuByDate, upsertMenu } from '../controllers/menuController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', getTodayMenu);
router.get('/:date', getMenuByDate);
router.post('/', protect, adminOnly, upsertMenu);

export default router;
