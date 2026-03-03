const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { BetType } = require('../models/index');


const addBetType = async (betTypeData) => {
    try {
        return await BetType.create(betTypeData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const getBetTypes = async (filterQuery) => {
    try {
        return await BetType.find(filterQuery)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}


module.exports = {
    addBetType,
    getBetTypes
}