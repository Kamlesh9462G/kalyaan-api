
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

    const data = await walletService.approveWithdraw(req.params.withdrawId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Withdraw approved successfully",
        data: data
    });
})

module.exports = {
    addWalletBalance,
    approveDeposit,
    approveWithdraw,
    getDepositRequests,
    getWithdrawRequests
}