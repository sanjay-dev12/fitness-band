import User from './user.model.js';

export const findUserByIdentifier = async (identifier) => {
    return await User.findOne({ where: { identifier } });
};

export const findUserById = async (id) => {
    return await User.findByPk(id);
};

export const createUser = async (userData) => {
    return await User.create(userData);
};
