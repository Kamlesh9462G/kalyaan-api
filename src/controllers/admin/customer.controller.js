const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { customerService } = require("../../services");



const getCustomers = catchAsync(async (req, res) => {

    const result = await customerService.getCustomers();

    res.status(httpStatus.status.OK).send({
        success: true,
        data: result
    });
});



module.exports = {
    getCustomers,
};