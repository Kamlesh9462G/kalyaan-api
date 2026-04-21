
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { quickActionService } = require('../services/index');

const addQuickAction = catchAsync(async (req, res) => {

    const data = await quickActionService.addQuickAction(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick action added successfully",
        data: data
    });
})

const getQuickActions = catchAsync(async (req, res) => {

    let filterQuery = {};

    filterQuery.isEnabled = true;
    filterQuery.name = "APP";

    const data = await quickActionService.getQuickActions(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick action fetched successfully",
        data: data
    });
})

module.exports = {
    addQuickAction,
    getQuickActions
}