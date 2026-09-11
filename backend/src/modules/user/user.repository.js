import User from './user.model.js';

export const findUserByIdentifier = async (identifier) => {
    return await User.findOne({ where: { identifier } });
};

export const findUserByName = async (fullName) => {
    return await User.findOne({ where: { fullName } });
};

export const findUserById = async (id) => {
    return await User.findByPk(id);
};

export const findUserByGoogleId = async (googleId) => {
    return await User.findOne({ where: { googleId } });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};
