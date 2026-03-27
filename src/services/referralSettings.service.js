const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { ReferralSettings } = require('../models/index');

const getReferralSettings = async (filterQuery) => {
    try {
        return await ReferralSettings.find()
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)

    }
}

const createReferralSettings = async (referralData) => {
    try {

        let settings = await ReferralSettings.findOne();

        if (!settings) {
            settings = await ReferralSettings.create(referralData);
        }
        return settings;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const updateReferralSettings = async (updateData) => {
    const settings = await ReferralSettings.findOne();

    if (!settings) {
        return await ReferralSettings.create(updateData);
    }

    Object.assign(settings, updateData);
    await settings.save();

    return settings;
}

module.exports = {
    getReferralSettings,
    createReferralSettings,
    updateReferralSettings,
}