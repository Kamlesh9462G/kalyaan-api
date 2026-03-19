const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { resultService } = require('../../services/index')

const getResults = catchAsync(async (req, res) => {
    const { date } = req.query; // Get date from query params if provided
    const result = await resultService.getMarketResultsBoard(date);

    res.status(httpStatus.status.OK).send({
        success: true,
        message: "Result fetched successfully",
        data: result
    });
});
const declareOpenResult = catchAsync(async (req, res) => {

    const result = await resultService.declareOpenResult(
        req.body,
        "69ae7796bca0a2ddab073fdf"
    );

    res.status(httpStatus.status.OK).send({
        success: true,
        message: "Open result declared successfully",
        data: result
    });
});

const declareCloseResult = catchAsync(async (req, res) => {

    const result = await resultService.declareCloseResult(
        req.body,
        "69ae7796bca0a2ddab073fdf"
    );

    res.status(httpStatus.status.OK).send({
        success: true,
        message: "Close result declared successfully",
        data: result
    });
});

const cancelMarket = catchAsync(async (req, res) => {

    const result = await resultService.cancelMarket(
        req.body,
        req.admin.id
    );

    res.status(httpStatus.OK).send({
        success: true,
        message: "Market cancelled and refunds processed",
        data: result
    });
});

module.exports = {
    declareOpenResult,
    declareCloseResult,
    cancelMarket,
    getResults
};