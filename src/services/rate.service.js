const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { BetType, BetRate } = require('../models/index');

const getRates = async (filterQuery) => {
    try {
        return await BetRate.find(filterQuery).populate('betTypeId', 'name');
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}

module.exports = {
    getRates
}