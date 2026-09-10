import { verifyToken } from '../utils/jwt.js';
import User from '../modules/user/user.model.js';

export const authMiddleware = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            // In development, fallback to the latest registered user if no token provided
            if (process.env.NODE_ENV !== 'production') {
                const devUser = await User.findOne({ order: [['createdAt', 'DESC']] });
                if (devUser) {
                    req.user = devUser;
                    return next();
                }
            }
            const error = new Error('Not authorized, no token provided');
            error.statusCode = 401;
            throw error;
        }
        
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (jwtErr) {
            if (process.env.NODE_ENV !== 'production') {
                const devUser = await User.findOne({ order: [['createdAt', 'DESC']] });
                if (devUser) {
                    req.user = devUser;
                    return next();
                }
            }
            throw jwtErr;
        }

        let user = await User.findByPk(decoded.id);
        if (!user && process.env.NODE_ENV !== 'production') {
            user = await User.findOne({ order: [['createdAt', 'DESC']] });
        }
        
        if (!user) {
            const error = new Error('Not authorized, user not found');
            error.statusCode = 401;
            throw error;
        }
        
        req.user = user;
        next();
    } catch (error) {
        error.statusCode = error.statusCode || 401;
        error.message = error.message || 'Not authorized, token failed';
        next(error);
    }
};
