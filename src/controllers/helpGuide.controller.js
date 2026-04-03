const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { helpGuideService } = require("../services/index");



// GET
exports.getHelpGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.getHelpGuide();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Help&Guides fetched successfully",
        data: data
    });
});

