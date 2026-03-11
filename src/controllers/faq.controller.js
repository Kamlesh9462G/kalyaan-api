const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { faqService } = require("../services/index");



const getFaqs = catchAsync(async (req, res) => {

    const result = await faqService.getFaqs();

    res.status(httpStatus.status.CREATED).send({
        success: true,
        message: "FAQ fetched successfully",
        data: result
    });

});

module.exports = {
    getFaqs,
};