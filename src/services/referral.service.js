
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Referral, ReferralSettings } = require('../models/index');

const getReferralStatus = async () => {
    try {
        return await ReferralSettings.aggregate([
            {
                '$project': {
                    'isReferralActive': 1
                }
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getReferralSettings = async () => {
    try {
        return await ReferralSettings.aggregate([
            {
                '$project': {
                    'isReferralActive': 1,
                    'reward': 1,
                    'deposit': 1,
                    'referralLink': 1,
                    'campaign': 1
                }
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getReferralHistory = async (customerId) => {

}
module.exports = {
    getReferralStatus,
    getReferralSettings,
    getReferralHistory
}