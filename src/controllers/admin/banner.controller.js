const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const { bannerService } = require('../../services');

// ================= HERO =================

const addHeroBanner = catchAsync(async (req, res) => {
    const result = await bannerService.addHeroBanner(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Hero banner created successfully",
        data: result
    });
});

const getHeroBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getHeroBanners(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Hero banners fetched successfully",
        data: result
    });
});

const updateHeroBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    const result = await bannerService.updateHeroBanner(id, req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Hero banner updated successfully",
        data: result
    });
});

const deleteHeroBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    await bannerService.deleteHeroBanner(id);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Hero banner deleted successfully"
    });
});

// ================= CTA =================

const addCtaBanner = catchAsync(async (req, res) => {
    const result = await bannerService.addCtaBanner(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "CTA banner created successfully",
        data: result
    });
});

const getCtaBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getCtaBanners(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "CTA banners fetched successfully",
        data: result
    });
});

const updateCtaBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    const result = await bannerService.updateCtaBanner(id, req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "CTA banner updated successfully",
        data: result
    });
});

const deleteCtaBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    await bannerService.deleteCtaBanner(id);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "CTA banner deleted successfully"
    });
});

// ================= ANNOUNCEMENT =================

const addAnnouncementBanner = catchAsync(async (req, res) => {
    const result = await bannerService.addAnnouncement(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Announcement created successfully",
        data: result
    });
});

const getAnnouncementBanners = catchAsync(async (req, res) => {
    const result = await bannerService.getAnnouncements(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Announcements fetched successfully",
        data: result
    });
});

const updateAnnouncementBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    const result = await bannerService.updateAnnouncement(id, req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Announcement updated successfully",
        data: result
    });
});

const deleteAnnouncementBanner = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid banner id");
    }

    await bannerService.deleteAnnouncement(id);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Announcement deleted successfully"
    });
});

module.exports = {
    addHeroBanner,
    getHeroBanners,
    updateHeroBanner,
    deleteHeroBanner,

    addCtaBanner,
    getCtaBanners,
    updateCtaBanner,
    deleteCtaBanner,

    addAnnouncementBanner,
    getAnnouncementBanners,
    updateAnnouncementBanner,
    deleteAnnouncementBanner
};