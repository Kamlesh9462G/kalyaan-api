
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { MarketBetType } = require('../models/index');

const addMarketBetType = async (marketBetTypeData) => {
    try {
        return await MarketBetType.create(marketBetTypeData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}

const getMarketBetType = async (filterQuery) => {
    try {
        return await MarketBetType.find(filterQuery);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)

    }
}


const updateMarketBetType = async (filterQuery, updateData) => {

}


const deleteMarketBetType = async (filterQuery) => {

}


module.exports = {
    addMarketBetType,
    getMarketBetType,
    updateMarketBetType,
    deleteMarketBetType
}