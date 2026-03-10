const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { appConfigService } = require('../services/index');


const getPaymentFeatures = async (req, res) => {
    const data = await appConfigService.getPaymentFeatures();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "payment features fetched successfully",
        data: data
    });
}


module.exports = {
    getPaymentFeatures,
}