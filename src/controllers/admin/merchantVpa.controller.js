const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { merchantVpaService } = require('../../services');

const addMerchantVpa = catchAsync(async (req, res) => {

    const data = await merchantVpaService.addMerchantVpa(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Merchant VPA created successfully",
        data
    });

})
const getMerchantVpas = catchAsync(async (req, res) => {
    const data = await merchantVpaService.getMerchantVpas();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Merchant VPA's fetched successfully",
        data
    });
})
const updateMerchantVpa = catchAsync(async (req, res) => {

    const { id } = req.params;

    const updateMerchantVpa = await merchantVpaService.updateMerchantVpa(id, req.body);

    if (!updateMerchantVpa) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Merchant Vpa not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Merchant VPA updated successfully",
        data: updateMerchantVpa,
    });

})
const deleteMerchantVpa = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedMerchantVpa = await merchantVpaService.deleteMerchantVpa(id);

    if (!deletedMerchantVpa) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Merchant VPA not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Merchant VPA deleted successfully",
    });
})

module.exports = {
    addMerchantVpa,
    getMerchantVpas,
    updateMerchantVpa,
    deleteMerchantVpa
}