const httpStatus = require('http-status')
const { GuideSection } = require("../models/index");
const ApiError = require("../utils/ApiError");

const createGuideSection = async (data) => {
    try {

        return await GuideSection.create(data);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const getGuideSections = async () => {
    try {

        return await GuideSection.find({ isActive: true }).sort({ order: 1 });
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const getGuideSectionById = async (id) => {
    try {

        return await GuideSection.findById(id);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const updateGuideSection = async (id, data) => {
    try {
        return await GuideSection.findByIdAndUpdate(id, data, { new: true });

    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const deleteGuideSection = async (id) => {
    try {

        return await GuideSection.findByIdAndDelete(id);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

module.exports = {
    createGuideSection,
    getGuideSections,
    getGuideSectionById,
    updateGuideSection,
    deleteGuideSection
};