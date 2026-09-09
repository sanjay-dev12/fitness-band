import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    identifier: z.string().min(5, 'Valid email or mobile is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    accountType: z.enum(['parent', 'child']).optional().default('parent'),
});

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
});
