import { Router } from 'express';
import { sendLowHrAlert } from './alert.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/low-hr', sendLowHrAlert);

export default router;
