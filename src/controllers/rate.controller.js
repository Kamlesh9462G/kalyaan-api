const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { rateService } = require("../services/index");

const getRates = async (req, res) => {
    const rates = await rateService.getRates(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rates fetched successfully",
        data: rates,
    });
}

module.exports = {
    getRates
}