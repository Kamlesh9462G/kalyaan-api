const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const { accountService } = require("../../services/index");


const updateBankAccount = async (req, res) => {

    const customerId = req.body.customerId;
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

const updateUpiAccount = async (req, res) => {
    const customerId = req.body.customerId;
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
    updateBankAccount,
    updateUpiAccount
}