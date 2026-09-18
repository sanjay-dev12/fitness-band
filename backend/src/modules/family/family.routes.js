import { Router } from 'express';
import { handleCreateFamily, handleJoinFamily, invite, getFamily, handleRemoveMember } from './family.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/create', handleCreateFamily);
router.post('/join', handleJoinFamily);
router.post('/invite', invite);
router.get('/', getFamily);
router.delete('/:id', handleRemoveMember);

export default router;
