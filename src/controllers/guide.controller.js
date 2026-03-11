const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { guideService } = require("../services/index");

const getGuideSections = catchAsync(async (req, res) => {

    const result = await guideService.getGuideSections();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Guides fetched successfully",
        data: result
    });
});

module.exports = {
    getGuideSections,
}

