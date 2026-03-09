const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
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

const getCustomerProfile = async (customerId) => {
    try {
        return await Customer.aggregate([
            {
                '$match': {
                    '_id': new ObjectId(customerId)
                }
            }, {
                '$lookup': {
                    'from': 'wallets',
                    'localField': '_id',
                    'foreignField': 'customerId',
                    'as': 'wallet'
                }
            }, {
                '$project': {
                    'name': 1,
                    'email': 1,
                    'walletBalance': {
                        '$arrayElemAt': [
                            '$wallet.balance', 0
                        ]
                    }
                }
            }
        ]);

    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
module.exports = {
    getCustomer,
    setCustomerName,
    getCustomerProfile
}