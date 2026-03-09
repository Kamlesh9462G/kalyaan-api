const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../utils/ApiError');

const { BankAccount, UpiAccount } = require("../models/index");


const addBankAccount = async (bankAccountData) => {

    try {
        return await BankAccount.create(bankAccountData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }

}
const getBankAccounts = async (filterQuery) => {
    try {
        return await BankAccount.find();
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}


const updateBankAccount = async (customerId, accountId, updateData) => {
    console.log(customerId, accountId, updateData)
    try {

        const filter = {
            _id: new ObjectId(accountId),
            customerId: new ObjectId(customerId)
        };

        // If setting default account
        if (updateData.isPrimary === true) {

            // remove default from other accounts
            await BankAccount.updateMany(
                { customerId: new ObjectId(customerId) },
                { $set: { isPrimary: false } }
            );

        }

        const updatedAccount = await BankAccount.findOneAndUpdate(
            filter,
            { $set: updateData },
            { new: true }
        );

        return updatedAccount;

    } catch (error) {
        throw new ApiError(
            httpStatus.status.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

const getUpiAccounts = async (filterQuery) => {
    try {
        return await UpiAccount.find();
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const updateUpiAccount = async (customerId, accountId, updateData) => {
    try {

        const filter = {
            _id: new ObjectId(accountId),
            customerId: new ObjectId(customerId)
        };

        // If setting default account
        if (updateData.isPrimary === true) {

            // remove default from other accounts
            await UpiAccount.updateMany(
                { customerId: new ObjectId(customerId) },
                { $set: { isPrimary: false } }
            );

        }

        const updatedAccount = await UpiAccount.findOneAndUpdate(
            filter,
            { $set: updateData },
            { new: true }
        );

        return updatedAccount;

    } catch (error) {
        throw new ApiError(
            httpStatus.status.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}
module.exports = {
    addBankAccount,
    getBankAccounts,
    updateBankAccount,
    getUpiAccounts,
    updateUpiAccount
}