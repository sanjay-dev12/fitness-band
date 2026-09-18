import { Router } from 'express';
import { sync, getHistory, getLatest, getFamilyHealth, getSummary, updateBluetooth, getBluetooth } from './health.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/sync', sync);
router.get('/history', getHistory);
router.get('/latest', getLatest);
router.get('/summary', getSummary);
router.get('/family/:memberId', getFamilyHealth);
router.get('/bluetooth', getBluetooth);
router.post('/bluetooth', updateBluetooth);

export default router;

