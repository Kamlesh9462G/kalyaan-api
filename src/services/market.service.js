const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Market } = require('../models/index');
const addMarket = async (marketData) => {
    try {
        return await Market.create(marketData);
    } catch (error) {
        console.log(error)
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const getMarket = async (filterQuery) => {
    try {
        return await Market.find(filterQuery);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const getMarkets = async (filterQuery = {}) => {
    try {
        const markets = await Market.find(filterQuery).lean();

        return markets || [];
    } catch (error) {
        throw new ApiError(
            httpStatus.status.INTERNAL_SERVER_ERROR,
            error.message || "Failed to fetch markets"
        );
    }
};


module.exports = {
    addMarket,
    getMarket,
    getMarkets,
}