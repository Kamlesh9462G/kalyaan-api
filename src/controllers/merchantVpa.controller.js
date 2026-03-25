const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { merchantVpaService } = require('../services');


const getMerchantVpas = catchAsync(async (req, res) => {
    const data = await merchantVpaService.getMerchantVpas();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Merchant VPA's fetched successfully",
        data
    });
})


module.exports = {
    getMerchantVpas,
}