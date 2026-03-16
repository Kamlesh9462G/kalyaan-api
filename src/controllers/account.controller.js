const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
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

    let filterQuery = {};

    filterQuery["customerId"] = new ObjectId(req.customer.customerId)

    const result = await accountService.getBankAccounts(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Account fetched successfully",
        data: result
    });

}
const updateBankAccount = async (req, res) => {

    const customerId = req.customer.customerId;
    const accountId = req.query.id;

    const result = await accountService.updateBankAccount(
        customerId,
        accountId,
        req.body
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bank account updated successfully",
        data: result
    });
};
const addUpiAccount = async (req, res) => {
    req.body.customerId = req.customer.customerId;

    const result = await accountService.addUpiAccount(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "UPI account added successfully",
        data: result
    });

}
const getUpiAccounts = async (req, res) => {

        let filterQuery = {};

    filterQuery["customerId"] = new ObjectId(req.customer.customerId)

    const result = await accountService.getUpiAccounts(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "UPI accounts fetched successfully",
        data: result
    });

}
const updateUpiAccount = async (req, res) => {
    const customerId = req.customer.customerId;
    const accountId = req.query.id;

    const result = await accountService.updateUpiAccount(
        customerId,
        accountId,
        req.body
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "UPI account updated successfully",
        data: result
    });
}
module.exports = {
    addBankAccount,
    getBankAccounts,
    addUpiAccount,
    getUpiAccounts,
    updateBankAccount,
    updateUpiAccount
}