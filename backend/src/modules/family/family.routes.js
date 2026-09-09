import { Router } from 'express';
import { invite, getFamily } from './family.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/invite', invite);
router.get('/', getFamily);

export default router;
