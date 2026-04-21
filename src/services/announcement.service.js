const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../utils/ApiError');

const { Announcement } = require("../models/index");

const getActiveAnnouncement = async () => {
    try {
        const announcement = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
        return announcement;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    getActiveAnnouncement
}