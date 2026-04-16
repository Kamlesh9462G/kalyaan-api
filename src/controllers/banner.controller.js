const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { bannerService } = require('../services');

// ================= HERO =================



const getHeroBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getHeroBanners(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Hero banners fetched successfully",
        data: result
    });
});


// ================= CTA =================



const getCtaBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getCtaBanners(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "CTA banners fetched successfully",
        data: result
    });
});



// ================= ANNOUNCEMENT =================



const getAnnouncementBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getAnnouncements(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Announcements fetched successfully",
        data: result
    });
});



module.exports = {
    getHeroBanners,


    getCtaBanners,


    getAnnouncementBanners,
};