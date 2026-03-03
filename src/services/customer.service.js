const httpStatus = require('http-status');
const { Customer } = require('../models/index');
const ApiError = require('../utils/ApiError');

const getCustomer = async (filterQuery) => {
    try {
        return await Customer.findOne(filterQuery)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    getCustomer
}