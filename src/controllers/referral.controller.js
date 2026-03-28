const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { referralService } = require("../services/index");

const getReferralStatus = catchAsync(async (req, res) => {
    const status = await referralService.getReferralStatus();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Referral status fetched successfully",
        data: status,
    });
})

const getReferralSettings = catchAsync(async (req, res) => {
    const settings = await referralService.getReferralSettings();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Referral settings fetched successfully",
        data: settings,
    });
})
const getReferralHistory = catchAsync(async (req, res) => {
    const history = await referralService.getReferralHistory(req.customer.customerId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Referral settings fetched successfully",
        data: settings,
    });
})

module.exports = {
    getReferralStatus,
    getReferralSettings,
    getReferralHistory
}