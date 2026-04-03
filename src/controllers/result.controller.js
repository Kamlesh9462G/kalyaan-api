const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { resultService } = require("../services/index");

const getResultHistory = catchAsync(async (req, res) => {

    const history = await resultService.getResultHistory(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Result history fetched successfully",
        data: history,
    });
})


module.exports = {
    getResultHistory
}