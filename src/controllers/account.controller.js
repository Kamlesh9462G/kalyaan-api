const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { accountService } = require("../services/index");


const addBankAccount = async (req, res) => {

    req.body.customerId = req.customer.customerId; // Assuming auth middleware sets req.user

    const bankAccount = await accountService.addBankAccount(req.body);
    return res.status(httpStatus.status.CREATED).send(bankAccount);

}
const getBankAccounts = async (req, res) => {

    const bankAccounts = await accountService.getBankAccounts(req.query);
    return res.status(httpStatus.status.OK).send(bankAccounts);
}

const addUpiAccount = async (req, res) => {
    req.body.customerId = req.customer.customerId; // Assuming auth middleware sets req.user

    const upiAccount = await accountService.addUpiAccount(req.body);
    return res.status(httpStatus.status.CREATED).send(upiAccount);
}
const getUpiAccounts = async (req, res) => {

    const upiAccounts = await accountService.getUpiAccounts(req.query);
    return res.status(httpStatus.status.OK).send(upiAccounts);
}

module.exports = {
    addBankAccount,
    getBankAccounts,
    addUpiAccount,
    getUpiAccounts
}