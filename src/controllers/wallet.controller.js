const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { walletService } = require("../services/index");

const getTransactions = catchAsync(async (req, res) => {

    const transactions = await walletService.getWalletTransactions(req.customer.customerId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Transactions fetched successfully",
        data: transactions,
    });


})


const createDeposit = async (req, res) => {

    const data = await walletService.createDeposit(
        req.customer.customerId,
        req.body
    );

    return res.json({
        success: true,
        message: "Deposit request submitted",
        data
    });

};


const createWithdraw = async (req, res) => {

    const data = await walletService.createWithdraw(
        req.customer.customerId,
        req.body
    );

    res.json({
        success: true,
        message: "Withdraw request submitted",
        data
    });

};

module.exports = {
    getTransactions,
    createDeposit,
    createWithdraw
}