const { ObjectId } = require('mongodb');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const { HeroBanner, CTABanner, Announcement } = require('../models');

// ================= COMMON HELPER =================

const cleanRedirect = (payload) => {
    if (payload.redirectType === 'none') {
        payload.redirectValue = null;
        payload.buttonText = null;
    }
    return payload;
};

// ================= HERO =================

const addHeroBanner = async (payload) => {
    payload = cleanRedirect(payload);
    return await HeroBanner.create(payload);
};

const getHeroBanners = async (query) => {
    const filter = {};

    if (query.isActive) {
        filter.isActive = query.isActive === 'true';
    }

    return await HeroBanner.find(filter).sort({ priority: -1, createdAt: -1 });
};

const updateHeroBanner = async (id, payload) => {
    payload = cleanRedirect(payload);

    const banner = await HeroBanner.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Hero banner not found");
    }

    return banner;
};

const deleteHeroBanner = async (id) => {
    const banner = await HeroBanner.findByIdAndDelete(id);

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Hero banner not found");
    }

    return true;
};

// ================= CTA =================

const addCtaBanner = async (payload) => {
    payload = cleanRedirect(payload);
    return await CTABanner.create(payload);
};

const getCtaBanners = async (query) => {
    const filter = {};

    if (query.isActive) {
        filter.isActive = query.isActive === 'true';
    }

    return await CTABanner.find(filter).sort({ createdAt: -1 });
};

const updateCtaBanner = async (id, payload) => {
    payload = cleanRedirect(payload);

    const banner = await CTABanner.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "CTA banner not found");
    }

    return banner;
};

const deleteCtaBanner = async (id) => {
    const banner = await CTABanner.findByIdAndDelete(id);

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "CTA banner not found");
    }

    return true;
};

// ================= ANNOUNCEMENT =================

const addAnnouncement = async (payload) => {
    payload = cleanRedirect(payload);
    return await Announcement.create(payload);
};

const getAnnouncements = async (query) => {
    const filter = {};

    if (query.isActive) {
        filter.isActive = query.isActive === 'true';
    }

    return await Announcement.find(filter).sort({ createdAt: -1 });
};

const updateAnnouncement = async (id, payload) => {
    payload = cleanRedirect(payload);

    const banner = await Announcement.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Announcement not found");
    }

    return banner;
};

const deleteAnnouncement = async (id) => {
    const banner = await Announcement.findByIdAndDelete(id);

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Announcement not found");
    }

    return true;
};

module.exports = {
    addHeroBanner,
    getHeroBanners,
    updateHeroBanner,
    deleteHeroBanner,

    addCtaBanner,
    getCtaBanners,
    updateCtaBanner,
    deleteCtaBanner,

    addAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
};