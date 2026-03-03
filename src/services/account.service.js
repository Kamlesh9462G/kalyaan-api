const httpStatus = require('http-status');
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


const addUpiAccount = async (upiAccountData) => {

    try {
        return await UpiAccount.create(upiAccountData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }

}
const getUpiAccounts = async (filterQuery) => {
    try {
        return await UpiAccount.find();
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addBankAccount,
    getBankAccounts,
    addUpiAccount,
    getUpiAccounts
}