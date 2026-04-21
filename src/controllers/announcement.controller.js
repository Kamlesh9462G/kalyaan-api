const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");

const { announcementService } = require("../services/index");

const getAnnouncement = catchAsync(async (req, res) => {
    const announcement = await announcementService.getActiveAnnouncement();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "announcement fetched successfully",
        data: announcement
    });

});

module.exports = {
    getAnnouncement
};