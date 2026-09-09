import { findUserByIdentifier, createUser } from '../user/user.repository.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';

export const registerUser = async (userData) => {
    const existingUser = await findUserByIdentifier(userData.identifier);
    if (existingUser) {
        const error = new Error('User with this email or mobile already exists');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashPassword(userData.password);

    const newUser = await createUser({
        ...userData,
        password: hashedPassword,
    });

    const token = generateToken({ id: newUser.id, accountType: newUser.accountType });

    return {
        user: {
            id: newUser.id,
            fullName: newUser.fullName,
            identifier: newUser.identifier,
            accountType: newUser.accountType,
        },
        token,
    };
};

export const loginUser = async (identifier, password) => {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({ id: user.id, accountType: user.accountType });

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            identifier: user.identifier,
            accountType: user.accountType,
        },
        token,
    };
};
