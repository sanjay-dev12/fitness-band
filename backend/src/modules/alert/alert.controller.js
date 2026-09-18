import * as alertService from './alert.service.js';

export const sendLowHrAlert = async (req, res, next) => {
    try {
        const { heartRate } = req.body;
        const result = await alertService.notifyFamilyLowHr(req.user, heartRate);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
