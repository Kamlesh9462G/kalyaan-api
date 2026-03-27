
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { referralSettingsService } = require('../../services/index');


const getReferralSettings = catchAsync(async (req, res) => {
    const data = await referralSettingsService.getReferralSettings();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Referral settings fetched successfully",
        data: data
    });
})

const createReferralSettings = catchAsync(async (req, res) => {
    const data = await referralSettingsService.createReferralSettings(req.body);
    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Referral settings added successfully",
        data: data
    });
})
const updateReferralSettings = catchAsync(async (req, res) => {
    const data = await referralSettingsService.updateReferralSettings(req.body);
    return res.status(httpStatus.status.OK).json({
        success: true,
        message: "Referral settings updated successfully",
        data: data
    });
})

module.exports = {
    getReferralSettings,
    createReferralSettings,
    updateReferralSettings,
}
