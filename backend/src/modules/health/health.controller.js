import { syncHealth, getMyHealth, getMyLatestHealth, getFamilyMemberHealth } from './health.service.js';

export const sync = async (req, res, next) => {
    try {
        const result = await syncHealth(req.user.id, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getHistory = async (req, res, next) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const result = await getMyHealth(req.user.id, days);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getLatest = async (req, res, next) => {
    try {
        const result = await getMyLatestHealth(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getFamilyHealth = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
        const result = await getFamilyMemberHealth(req.user.id, memberId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
