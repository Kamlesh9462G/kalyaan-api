const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Wallet, WalletTransaction } = require('../models/index')

const getTransactions = async (customerId) => {
    try {
        const wallet = await Wallet.findOne({ customer: customerId });
        if (!wallet) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Wallet not found for the customer")
        }
        return await WalletTransaction.find({ wallet: wallet._id });
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}

module.exports = {
    getTransactions
}