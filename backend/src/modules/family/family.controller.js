import { inviteMember, getMyFamily } from './family.service.js';

export const invite = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        const result = await inviteMember(req.user.id, identifier);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getFamily = async (req, res, next) => {
    try {
        const result = await getMyFamily(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
