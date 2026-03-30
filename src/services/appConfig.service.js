const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PaymentFeature } = require('../models/index');

const addPaymentFeatures = async (paymentFeatureData) => {
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
const deletePaymentFeatures = async () => {
    const paymentFeature = await PaymentFeature.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!paymentFeature) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Payment feature not found");
    }

    return paymentFeature;
}

module.exports = {
    addPaymentFeatures,
    getPaymentFeatures,
    updatePaymentFeatures,
    deletePaymentFeatures
}