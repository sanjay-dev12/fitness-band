import { OAuth2Client } from 'google-auth-library';
import { findUserByIdentifier, createUser, findUserByName, findUserByGoogleId } from '../user/user.repository.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';

const client = new OAuth2Client();

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
        authProvider: 'local',
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
    // identifier here is the user's fullName based on new flow
    const user = await findUserByName(identifier);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    if (!user.password) {
        const error = new Error('This account was registered using Google. Please log in with Google.');
        error.statusCode = 400;
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

export const googleLoginUser = async (idToken) => {
    if (!idToken) {
        const error = new Error('Google ID token is required');
        error.statusCode = 400;
        throw error;
    }

    let payload;
    try {
        const googleClientIds = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_WEB_CLIENT_ID,
            process.env.GOOGLE_IOS_CLIENT_ID,
            process.env.GOOGLE_ANDROID_CLIENT_ID,
        ].filter(Boolean);

        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientIds.length > 0 ? googleClientIds : undefined,
        });

        payload = ticket.getPayload();
    } catch (err) {
        console.error('Google token verification failed:', err.message);
        const error = new Error('Invalid or expired Google authentication token');
        error.statusCode = 401;
        throw error;
    }

    const googleId = payload.sub;
    const email = payload.email || `google_${googleId}@handband.app`;
    const name = payload.name || 'Google User';

    // 1. Search by googleId
    let user = await findUserByGoogleId(googleId);

    if (!user) {
        // 2. Search by email/identifier to check conflict with local account
        const existingLocalUser = await findUserByIdentifier(email);
        if (existingLocalUser) {
            if (existingLocalUser.authProvider === 'local') {
                const error = new Error(
                    'An account with this email already exists using password login. Please log in using your password.'
                );
                error.statusCode = 409;
                throw error;
            }
            user = existingLocalUser;
        } else {
            // 3. Create new Google user
            user = await createUser({
                fullName: name,
                identifier: email,
                googleId,
                authProvider: 'google',
                password: null,
                accountType: 'parent',
            });
        }
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
