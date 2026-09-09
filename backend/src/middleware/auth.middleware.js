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
            const error = new Error('Not authorized, no token provided');
            error.statusCode = 401;
            throw error;
        }
        
        const decoded = verifyToken(token);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            const error = new Error('Not authorized, user not found');
            error.statusCode = 401;
            throw error;
        }
        
        req.user = user;
        next();
    } catch (error) {
        error.statusCode = 401;
        error.message = 'Not authorized, token failed';
        next(error);
    }
};
