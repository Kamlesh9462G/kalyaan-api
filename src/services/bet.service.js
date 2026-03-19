const httpStatus = require("http-status");
const mongoose = require("mongoose");

const {
    BetSlip,
    BetItem,
    Wallet,
    WalletTransaction,
    Market,
    MarketBetType,
    BetRate
} = require("../models");

const ApiError = require("../utils/ApiError");

const placeBet = async (customerId, payload) => {
    console.log(customerId, payload)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { marketId, marketBetTypeId, session: betSession, bets } = payload;

        if (!bets || !bets.length) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "No bets provided");
        }

        // 1️⃣ Market Validation
        const market = await Market.findById(marketId);
        if (!market || market.isDeleted || market.status !== "active") {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Market not active");
        }

        // 2️⃣ MarketBetType Validation
        const marketBetType = await MarketBetType
            .findOne({ _id: marketBetTypeId, marketId })
            .populate("betTypeId");

        if (!marketBetType) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid market bet type");
        }

        const betType = marketBetType.betTypeId;

        const betTypeCode = betType.code; // IMPORTANT (add code in BetType)

        console.log(betTypeCode)

        // 3️⃣ Session Validation (skip for sangam)
        if (!["HS", "FS", "JD"].includes(betTypeCode)) {
            if (!betSession) {
                throw new ApiError(httpStatus.status.BAD_REQUEST, "Session required");
            }

            if (!marketBetType.sessions[betSession]?.enabled) {
                throw new ApiError(httpStatus.status.BAD_REQUEST, "Session disabled");
            }
        }

        let totalAmount = 0;
        let preparedItems = [];

        // 4️⃣ Validate Each Bet
        for (const b of bets) {

            let item = {
                customerId,
                marketId,
                marketBetTypeId,
                betTypeCode,
                amount: b.amount,
                payout: betType.payout
            };

            if (!b.amount || b.amount <= 0) {
                throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid amount");
            }

            // 🔥 SINGLE / JODI / PANNA
            if (["SD", "JD", "SP", "DP", "TP"].includes(betTypeCode)) {

                if (!b.digit) {
                    throw new ApiError(httpStatus.status.BAD_REQUEST, "Digit required");
                }

                if (b.digit.length !== betType.digitConfig.digitLength) {
                    throw new ApiError(httpStatus.status.BAD_REQUEST, `Invalid digit ${b.digit}`);
                }

                item.digit = b.digit;
                item.session = betSession;
            }

            // 🔥 HALF SANGAM
            else if (betTypeCode === "HS") {

                if (b.openDigit && b.closePanna) {
                    if (b.openDigit.length !== 1 || b.closePanna.length !== 3) {
                        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid Half Sangam format");
                    }

                    item.openDigit = b.openDigit;
                    item.closePanna = b.closePanna;
                    item.sangamType = "openDigit_closePanna";
                }

                else if (b.openPanna && b.closeDigit) {
                    if (b.openPanna.length !== 3 || b.closeDigit.length !== 1) {
                        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid Half Sangam format");
                    }

                    item.openPanna = b.openPanna;
                    item.closeDigit = b.closeDigit;
                    item.sangamType = "openPanna_closeDigit";
                }

                else {
                    throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid Half Sangam input");
                }

                item.session = null;
            }

            // 🔥 FULL SANGAM
            else if (betTypeCode === "FS") {

                if (!b.openPanna || !b.closePanna) {
                    throw new ApiError(httpStatus.status.BAD_REQUEST, "Full Sangam requires both pannas");
                }

                if (b.openPanna.length !== 3 || b.closePanna.length !== 3) {
                    throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid Full Sangam format");
                }

                item.openPanna = b.openPanna;
                item.closePanna = b.closePanna;
                item.sangamType = "full";
                item.session = null;
            }

            else {
                throw new ApiError(httpStatus.status.BAD_REQUEST, "Unsupported bet type");
            }

            totalAmount += b.amount;

            // 🔥 WIN CALCULATION
            item.possibleWinAmount =
                (b.amount / 10) *
                betType.payout.amount *
                betType.payout.multiplier;

            preparedItems.push(item);
        }

        // 5️⃣ Wallet Check
        const wallet = await Wallet.findOne({ customerId }).session(session);

        if (!wallet || wallet.balance < totalAmount) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Insufficient balance");
        }

        const balanceBefore = wallet.balance;
        wallet.balance -= totalAmount;
        const balanceAfter = wallet.balance;

        await wallet.save({ session });

        // 6️⃣ Create BetSlip
        const betSlip = await BetSlip.create([{
            customerId,
            marketId,
            betTypeId: betType._id,
            marketBetTypeId,
            totalAmount,
            status: "placed"
        }], { session });

        const slipId = betSlip[0]._id;

        // 7️⃣ Attach Slip ID
        preparedItems = preparedItems.map(item => ({
            ...item,
            betSlipId: slipId
        }));

        const insertedItems = await BetItem.insertMany(preparedItems, { session });

        // 8️⃣ Wallet Transactions
        const walletTxns = insertedItems.map(item => ({
            customerId,
            walletId: wallet._id,
            type: "debit",
            reason: "bet_placed",
            amount: item.amount,
            balanceBefore,
            balanceAfter,
            referenceType: "betItem",
            referenceId: item._id,
            txnId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
        }));

        await WalletTransaction.insertMany(walletTxns, { session });

        await session.commitTransaction();
        session.endSession();

        return {
            betSlipId: slipId,
            totalAmount,
            totalBets: preparedItems.length,
            walletBalance: balanceAfter
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const getBetHistory = async (filterQuery) => {

    try {
        return await BetSlip.aggregate(
            [
                {
                    '$match': filterQuery
                }, {
                    '$lookup': {
                        'from': 'betitems',
                        'localField': '_id',
                        'foreignField': 'betSlipId',
                        'as': 'betItems'
                    }
                }, {
                    '$lookup': {
                        'from': 'markets',
                        'localField': 'marketId',
                        'foreignField': '_id',
                        'as': 'market'
                    }
                }, {
                    '$unwind': '$market'
                }, {
                    '$lookup': {
                        'from': 'bettypes',
                        'localField': 'betTypeId',
                        'foreignField': '_id',
                        'as': 'betType'
                    }
                }, {
                    '$unwind': '$betType'
                }, {
                    '$sort': {
                        'createdAt': -1
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'session': 1,
                        'totalAmount': 1,
                        'status': 1,
                        'createdAt': 1,
                        'market': {
                            '_id': '$market._id',
                            'name': '$market.name',
                            'openTime': '$market.timings.openTime',
                            'closeTime': '$market.timings.closeTime'
                        },
                        'betType': {
                            '_id': '$betType._id',
                            'name': '$betType.name',
                            'category': '$betType.category'
                        },
                        'betItems': {
                            '_id': 1,
                            'digit': 1,
                            "openDigit": 1,
                            "closeDigit": 1,
                            "openPanna": 1,
                            "closePanna": 1,
                            "sangamType": 1,
                            "betTypeCode": 1,
                            'amount': 1,
                            'status': 1,
                            'possibleWinAmount': 1,
                            'winAmount': 1
                        }
                    }
                }
            ]

        ).exec();
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message || "Failed to fetch bet history");
    }
};
module.exports = {
    placeBet,
    getBetHistory
};