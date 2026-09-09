import { Router } from 'express';
import { sync, getHistory, getLatest, getFamilyHealth } from './health.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/sync', sync);
router.get('/history', getHistory);
router.get('/latest', getLatest);
router.get('/family/:memberId', getFamilyHealth);

export default router;
