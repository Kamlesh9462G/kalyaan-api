const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { appConfigService } = require('../../services/index');

const addPaymentFeatures = catchAsync(async (req, res) => {
    const data = await appConfigService.addPaymentFeatures(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "payment feature added successfully",
        data: data
    });
})
const getPaymentFeatures = catchAsync(async (req, res) => {
    const data = await appConfigService.getPaymentFeatures();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "payment features fetched successfully",
        data: data
    });
})
const updatePaymentFeatures = catchAsync(async (req, res) => {
    const data = await appConfigService.updatePaymentFeatures(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "payment feature updated successfully",
        data: data
    });
})
const deletePaymentFeatures = catchAsync(async (req, res) => {
    await appConfigService.deletePaymentFeatures(req.params.id);

    res.send({
        success: true,
        message: "Payment feature deleted successfully"
    });
})
module.exports = {
    addPaymentFeatures,
    getPaymentFeatures,
    updatePaymentFeatures,
    deletePaymentFeatures
}