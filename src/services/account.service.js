const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../utils/ApiError');

const { BankAccount, UpiAccount } = require("../models/index");


const addBankAccount = async (bankAccountData) => {
    const { customerId, accountNumber, ifsc } = bankAccountData;
    try {

        // 🔍 Check duplicate
        const existingAccount = await BankAccount.findOne({
            accountNumber,
            ifsc,
            customerId
        });

        if (existingAccount) {
            throw new ApiError(
                httpStatus.status.BAD_REQUEST,
                "Bank account already exists"
            );
        }

        bankAccountData.status = "verified"; // New accounts are verified by default
        return await BankAccount.create(bankAccountData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }

}
const getBankAccounts = async (filterQuery) => {
    try {
        return await BankAccount.find(filterQuery);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}


const updateBankAccount = async (customerId, accountId, updateData) => {
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
const deleteBankAccount = async (customerId, accountId) => {

    const bankAccount = await BankAccount.findOneAndUpdate(
        { customerId: customerId, _id: new ObjectId(accountId) },
        { isActive: false },
        { new: true }
    );

    if (!bankAccount) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Bank account not found");
    }

    return bankAccount;

}
const addUpiAccount = async (upiAccountData) => {

    const { upiId, customerId } = upiAccountData;
    try {

        // 🔍 Check duplicate
        const existingAccount = await UpiAccount.findOne({
            upiId,
            customerId
        });

        if (existingAccount) {
            throw new ApiError(
                httpStatus.status.BAD_REQUEST,
                "UPI account already exists"
            );
        }

        upiAccountData.status = "verified"; // New accounts are verified by default
        return await UpiAccount.create(upiAccountData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }

}
const getUpiAccounts = async (filterQuery) => {
    try {
        return await UpiAccount.find(filterQuery);
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

const deleteUpiAccount = async (customerId, accountId) => {

    const upiAccount = await UpiAccount.findOneAndUpdate(
        { customerId: customerId, _id: new ObjectId(accountId) },
        { isActive: false },
        { new: true }
    );

    if (!upiAccount) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "UPI account not found");
    }

    return upiAccount;

}
module.exports = {
    addBankAccount,
    getBankAccounts,
    updateBankAccount,
    getUpiAccounts,
    updateUpiAccount,
    addUpiAccount,
    deleteBankAccount,
    deleteUpiAccount
}