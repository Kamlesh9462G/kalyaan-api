const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { walletService } = require("../services/index");

const getTransactions = catchAsync(async (req, res) => {

    const transactions = await walletService.getTransactions(req.query);
    return res.status(httpStatus.status.OK).send(transactions);



})


module.exports = {
    getTransactions
}