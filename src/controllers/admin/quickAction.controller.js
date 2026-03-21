
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { quickActionService } = require('../../services/index');

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

    const data = await quickActionService.getQuickActions();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick action fetched successfully",
        data: data
    });
})
const updateQuickAction = catchAsync(async (req, res) => {
    const result = await quickActionService.updateQuickAction(
        req.params.id,
        req.body
    );

    res.send({
        success: true,
        message: "Quick action updated successfully",
        data: result
    });
})
const deleteQuickAction = catchAsync(async (req, res) => {
    await quickActionService.deleteQuickAction(req.params.id);

    res.send({
        success: true,
        message: "Quick section deleted successfully"
    });
})
module.exports = {
    addQuickAction,
    getQuickActions,
    updateQuickAction,
    deleteQuickAction
}