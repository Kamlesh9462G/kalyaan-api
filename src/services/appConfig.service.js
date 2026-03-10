const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PaymentFeature } = require('../models/index');

const addPaymentFeatures = async (paymentFeatureData) => {
    console.log(paymentFeatureData)
    try {
        return await PaymentFeature.create(paymentFeatureData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getPaymentFeatures = async () => {
    try {
        return await PaymentFeature.find()
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const updatePaymentFeatures = async (filterQuery, updateData) => {
    try {
        return await PaymentFeature.findOneAndUpdate(filterQuery, updateData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}

module.exports = {
    addPaymentFeatures,
    getPaymentFeatures,
    updatePaymentFeatures
}