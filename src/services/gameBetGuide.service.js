const httpStatus = require('http-status')
const ApiError = require("../utils/ApiError");

const { GameBetGuide } = require("../models/index");

const createGameBetGuide = async (data) => {
    try {
        return GameBetGuide.create(data);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const getGameBetGuides = async () => {

    return GameBetGuide.find({ isActive: true }).sort({ order: 1 });
};

const updateGameBetGuide = async (id, data) => {
    return GameBetGuide.findByIdAndUpdate(id, data, { new: true });
};

const deleteGameBetGuide = async (id) => {
    return GameBetGuide.findByIdAndDelete(id);
};

module.exports = {
    createGameBetGuide,
    getGameBetGuides,
    updateGameBetGuide,
    deleteGameBetGuide
};