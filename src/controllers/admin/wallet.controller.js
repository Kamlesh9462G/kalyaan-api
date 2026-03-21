
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { walletService } = require('../../services/index')

const addWalletBalance = catchAsync(async (req, res) => {

    const data = await walletService.addWalletBalance(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Wallet balance added successfully",
        data: data
    });
})
const getTransactions = catchAsync(async (req, res) => {

    let filterQuery = {};

    const transactions = await walletService.getWalletTransactions(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Transactions fetched successfully",
        data: transactions,
    });


})

const getDepositRequests = catchAsync(async (req, res) => {
    const data = await walletService.getDepositRequests(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Deposit requests fetched successfully",
        data: data
    });
})
const approveDeposit = catchAsync(async (req, res) => {

    const data = await walletService.approveDeposit(req.params.depositId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Deposit approved successfully",
        data: data
    });
})
const rejectDeposit = catchAsync(async (req, res) => {
    const data = await walletService.rejectDeposit(req.params.depositId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Deposit rejected successfully",
        data: data
    });
})
const getWithdrawRequests = catchAsync(async (req, res) => {

    const data = await walletService.getWithdrawRequests(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Withdrawl requests fetched successfully",
        data: data
    });

})
const approveWithdraw = catchAsync(async (req, res) => {

    const data = await walletService.approveWithdraw(req.params.withdrawId,"69be44b7e7d088d883b15d60",req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Withdraw approved successfully",
        data: data
    });
})
const rejectWithdraw = catchAsync(async (req, res) => {
    const data = await walletService.rejectWithdraw(
        req.params.withdrawId,
        "69be44b7e7d088d883b15d60", // assuming auth
        req.body.remark
    );

    return res.status(200).json({
        success: true,
        message: "Withdraw rejected successfully",
        data
    });
});
module.exports = {
    addWalletBalance,
    approveDeposit,
    rejectDeposit,
    approveWithdraw,
    getDepositRequests,
    getWithdrawRequests,
    rejectWithdraw,
    getTransactions
}