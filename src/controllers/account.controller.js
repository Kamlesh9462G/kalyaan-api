const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { accountService } = require("../services/index");


const addBankAccount = async (req, res) => {

    req.body.customerId = req.customer.customerId;

    const result = await accountService.addBankAccount(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Account added successfully",
        data: result
    });

}
const getBankAccounts = async (req, res) => {

    const result = await accountService.getBankAccounts(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Account fetched successfully",
        data: result
    });

}

const addUpiAccount = async (req, res) => {
    req.body.customerId = req.customer.customerId; // Assuming auth middleware sets req.user

    const result = await accountService.addUpiAccount(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "UPI account added successfully",
        data: result
    });

}
const getUpiAccounts = async (req, res) => {

    const result = await accountService.getUpiAccounts(req.query);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "UPI accounts fetched successfully",
        data: result
    });

}

module.exports = {
    addBankAccount,
    getBankAccounts,
    addUpiAccount,
    getUpiAccounts
}