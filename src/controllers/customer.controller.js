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

module.exports = {
    setCustomerName
}

