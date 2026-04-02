const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { customerService } = require("../services/index");

const setCustomerName = catchAsync(async (req, res) => {

    const result = await customerService.setCustomerName(
        req.body.customerId,
        req.body.name
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Customer name updated successfully",
        data: result
    });
});
const getCustomerProfile = catchAsync(async (req, res) => {

    const result = await customerService.getCustomerProfile(
        req.customer.customerId
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Customer profile fetched successfully",
        data: result
    });
});

const updateCustomerProfile = catchAsync(async (req, res) => {
    const result = await customerService.updateCustomerProfile(
        req.customer.customerId,
        req.body
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Customer profile updated successfully",
        data: result
    });
});
module.exports = {
    setCustomerName,
    getCustomerProfile,
    updateCustomerProfile
}

