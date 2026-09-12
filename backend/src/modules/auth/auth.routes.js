import express from 'express';
import { register, login, forgotPassword, googleLogin, getMe, updateProfile } from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, googleLoginSchema } from '../user/user.zod.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/google', validateRequest(googleLoginSchema), googleLogin);

// Authenticated profile routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
