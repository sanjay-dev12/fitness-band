import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        const result = await authService.loginUser(identifier, password);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        // Mock implementation for now
        res.status(200).json({
            success: true,
            message: 'If the account exists, a reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

export const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        const result = await authService.googleLoginUser(idToken);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
