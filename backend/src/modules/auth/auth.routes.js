import express from 'express';
import { register, login, forgotPassword, googleLogin } from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, googleLoginSchema } from '../user/user.zod.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/google', validateRequest(googleLoginSchema), googleLogin);

export default router;
