const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { walletService } = require("../services/index");

const getTransactions = catchAsync(async (req, res) => {

    let filterQuery = {};
    filterQuery["customerId"] = new ObjectId(req.customer.customerId);

    const transactions = await walletService.getWalletTransactions(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Transactions fetched successfully",
        data: transactions,
    });


})

const getCustomerWallet = catchAsync(async (req, res) => {

    const wallet = await walletService.getCustomerWallet(req.customer.customerId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Wallet fetched successfully",
        isQuizStarted: true,
        data: wallet,
    });


})


const createDeposit = catchAsync(async (req, res) => {

    req.body["customerId"] = req.customer.customerId;

    const data = await walletService.createDeposit(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Deposit request submitted",
        data: data,
    });

});


const createWithdraw = catchAsync(async (req, res) => {

    const data = await walletService.createWithdraw(
        req.customer.customerId,
        req.body
    );


    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Withdraw request submitted",
        data: data,
    });


});
const getPendingWithdraws = catchAsync(async (req, res) => {

    const data = await walletService.getPendingWithdraws(req.customer.customerId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Pending withdraws fetched successfully",
        data: data,
    });

});
module.exports = {
    getTransactions,
    createDeposit,
    createWithdraw,
    getCustomerWallet,
    getPendingWithdraws
}