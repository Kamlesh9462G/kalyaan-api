const httpStatus = require("http-status");
const mongoose = require("mongoose");

const { BetSlip, BetItem, BetType, Wallet, WalletTransaction } = require("../models/index");
const ApiError = require("../utils/ApiError");

const placeBet = async (customerId, payload) => {

    console.log("Customer ID:", customerId);
    console.log("Placing bet with payload:", payload);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { marketId, betTypeId, digits, session: betSession } = payload;

        console.log(payload)

        const betType = await BetType.findOne({ _id: betTypeId });

        console.log(betType)
        if (!betType) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid bet type");
        }

        if (!betType.supportedSessions.includes(betSession)) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Session not allowed for this bet type");
        }

        let totalAmount = 0;

        digits.forEach(d => {
            if (d.digit.length !== betType.digitLength) {
                throw new ApiError(httpStatus.status.BAD_REQUEST, `Invalid digit ${d.digit}`);
            }
            totalAmount += d.amount;
        });

        const wallet = await Wallet.findOne({ customerId }).session(session);
        if (!wallet || wallet.balance < totalAmount) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Insufficient wallet balance");
        }

        wallet.balance -= totalAmount;
        await wallet.save({ session });

        const betSlip = await BetSlip.create(
            [
                {
                    customerId,
                    marketId,
                    betTypeId,
                    session: betSession,
                    totalAmount
                }
            ],
            { session }
        );

        const betItems = digits.map(d => ({
            customerId,
            betSlipId: betSlip[0]._id,
            digit: d.digit,
            amount: d.amount,
            rate: betType.rate,
            potentialWin: d.amount * betType.rate
        }));

        await BetItem.insertMany(betItems, { session });

        let transactions = digits.map(d => ({
            customerId,
            walletId: wallet._id,
            type: "debit",
            reason: "bet_placed",
            amount: d.amount,
            balanceBefore: wallet.balance + d.amount,
            balanceAfter: wallet.balance,
            txnId: new Date().getTime() + Math.floor(Math.random() * 1000)
        }));

        await WalletTransaction.insertMany(transactions);


        await session.commitTransaction();
        session.endSession();

        return {
            betSlipId: betSlip[0]._id,
            totalAmount
        };

    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

module.exports = {
    placeBet
}