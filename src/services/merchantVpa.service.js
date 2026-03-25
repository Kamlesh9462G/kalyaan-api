const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { MerchantVpa } = require('../models/index');

const addMerchantVpa = async (merchantVpaData) => {
    try {
        return await MerchantVpa.create(merchantVpaData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getMerchantVpas = async (filterQuery) => {
    try {
        return await MerchantVpa.find();
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const updateMerchantVpa = async (vpaId, updateData) => {
    try {
        const merchantvpa = await MerchantVpa.findByIdAndUpdate(
            vpaId,
            updateData,
            { new: true, runValidators: true }
        );
        return merchantvpa;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const deleteMerchantVpa = async (vpaId) => {
    try {
        const merchantVpa = await MerchantVpa.findByIdAndDelete(vpaId);
        return merchantVpa;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addMerchantVpa,
    getMerchantVpas,
    updateMerchantVpa,
    deleteMerchantVpa
}