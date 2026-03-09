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
const setCustomerName = async (customerId, name) => {
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Customer not found");
        }
        customer.name = name;
        await customer.save();
        return customer;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
module.exports = {
    getCustomer,
    setCustomerName
}