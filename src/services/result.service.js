const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Result, BetItem, BetSlip, Wallet, WalletTransaction, BetType } = require('../models/index');
const ApiError = require('../utils/ApiError');

/**
 * Calculate digit from panna (sum of digits % 10)
 */
const calculateDigit = (panna) => {
    const sum = panna.split("").reduce((a, b) => a + Number(b), 0);
    return String(sum % 10);
};

/**
 * Check if a bet item is a winner for Half Sangam
 */
const isHalfSangamWinner = (betItem, openDigit, openPanna, closeDigit, closePanna) => {
    if (betItem.sangamType === 'openDigit_closePanna') {
        // Case A: Open Digit + Close Panna
        return betItem.openDigit === openDigit && betItem.closePanna === closePanna;
    } else if (betItem.sangamType === 'openPanna_closeDigit') {
        // Case B: Open Panna + Close Digit
        return betItem.openPanna === openPanna && betItem.closeDigit === closeDigit;
    }
    return false;
};

/**
 * Check if a bet item is a winner for Full Sangam
 */
const isFullSangamWinner = (betItem, openPanna, closePanna) => {
    return betItem.openPanna === openPanna && betItem.closePanna === closePanna;
};

/**
 * Check if a bet item is a winner for Jodi
 */
const isJodiWinner = (betItem, openDigit, closeDigit) => {
    const jodi = `${openDigit}${closeDigit}`;
    return betItem.digit === jodi;
};

/**
 * Check if a bet item is a winner based on bet type code
 */
const isWinner = (betItem, result) => {
    const { openDigit, openPanna, closeDigit, closePanna } = result;
    const betTypeCode = betItem.betTypeCode;

    switch (betTypeCode) {
        case 'SINGLE':
            // Single digit betting (open session only)
            return betItem.digit === openDigit;

        case 'JODI':
            // Jodi betting (needs close result) - no session
            return isJodiWinner(betItem, openDigit, closeDigit);

        case 'SINGLE_PANNA':
        case 'DOUBLE_PANNA':
        case 'TRIPLE_PANNA':
            // Panna betting (open session only)
            return betItem.digit === openPanna;

        case 'HALF_SANGAM':
            // Half Sangam (needs close result) - no session
            return isHalfSangamWinner(betItem, openDigit, openPanna, closeDigit, closePanna);

        case 'FULL_SANGAM':
            // Full Sangam (needs close result) - no session
            return isFullSangamWinner(betItem, openPanna, closePanna);

        default:
            return false;
    }
};

/**
 * Get the appropriate result based on bet type
 */
const getResultForBetType = (betTypeCode, result) => {
    const { openDigit, openPanna, closeDigit, closePanna } = result;

    switch (betTypeCode) {
        case 'SINGLE':
            return openDigit;
        case 'JODI':
            return `${openDigit}${closeDigit}`;
        case 'SINGLE_PANNA':
        case 'DOUBLE_PANNA':
        case 'TRIPLE_PANNA':
            return openPanna;
        case 'HALF_SANGAM':
        case 'FULL_SANGAM':
            return `${openPanna}-${closePanna}`;
        default:
            return '';
    }
};

/**
 * Get bet type category from bet type code
 */
const getBetTypeCategory = (betTypeCode) => {
    if (betTypeCode === 'SINGLE') return 'digit';
    if (betTypeCode === 'JODI') return 'jodi';
    if (['SINGLE_PANNA', 'DOUBLE_PANNA', 'TRIPLE_PANNA'].includes(betTypeCode)) return 'panna';
    if (betTypeCode === 'HALF_SANGAM') return 'half_sangam';
    if (betTypeCode === 'FULL_SANGAM') return 'full_sangam';
    return 'unknown';
};

/**
 * Settle open session bets (Single, Single Panna, Double Panna, Triple Panna)
 */
const settleOpenBets = async (result, session, req) => {
    const { marketId, openDigit, openPanna } = result;

    // Find all bet items for this market that need open result
    const betItems = await BetItem.find({
        marketId,
        session: "open",
        status: "pending",
        betTypeCode: { $in: ['SINGLE', 'SINGLE_PANNA', 'DOUBLE_PANNA', 'TRIPLE_PANNA'] }
    }).populate({
        path: 'betSlipId',
        populate: {
            path: 'betTypeId',
            model: 'BetType'
        }
    }).session(session);

    if (betItems.length === 0) return;

    // Group by customer for wallet updates
    const customerWins = new Map();
    const betUpdates = [];
    const betSlipStatusMap = new Map();

    for (const betItem of betItems) {
        const betSlip = betItem.betSlipId;
        if (!betSlip) continue;

        const betTypeCode = betItem.betTypeCode;

        const isWin = isWinner(betItem, result);

        if (isWin) {
            console.log('Winning open bet:', {
                betItemId: betItem._id,
                betTypeCode,
                amount: betItem.amount,
                possibleWinAmount: betItem.possibleWinAmount,
                payout: betItem.payout
            });

            const winAmount = betItem.possibleWinAmount ||
                (betItem.amount / 10) * betItem.payout.amount * betItem.payout.multiplier;

            console.log('Win amount:', winAmount);

            const customerId = betItem.customerId.toString();
            if (!customerWins.has(customerId)) {
                customerWins.set(customerId, {
                    totalWinAmount: 0,
                    betItems: []
                });
            }
            const customerData = customerWins.get(customerId);
            customerData.totalWinAmount += winAmount;
            customerData.betItems.push({
                betItemId: betItem._id,
                winAmount: winAmount,
                digit: betItem.digit,
                amount: betItem.amount,
                betTypeCode
            });

            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "won",
                        winAmount: winAmount,
                        resultDeclaredAt: new Date()
                    }
                }
            });

            betSlipStatusMap.set(betSlip._id.toString(), {
                betSlipId: betSlip._id,
                hasWon: true
            });
        } else {
            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "lost",
                        resultDeclaredAt: new Date()
                    }
                }
            });
        }
    }

    // Process wallet updates and transactions for winners
    if (customerWins.size > 0) {
        const customerIds = Array.from(customerWins.keys());
        const wallets = await Wallet.find({
            customerId: { $in: customerIds }
        }).session(session);

        const walletMap = new Map();
        wallets.forEach(w => walletMap.set(w.customerId.toString(), w));

        const walletUpdates = [];
        const transactions = [];

        for (const [customerId, customerData] of customerWins) {
            const wallet = walletMap.get(customerId);

            if (!wallet) continue;

            walletUpdates.push({
                updateOne: {
                    filter: { _id: wallet._id },
                    update: {
                        $inc: { balance: customerData.totalWinAmount },
                        lastTransactionAt: new Date()
                    }
                }
            });

            const firstBetItem = customerData.betItems[0];

            console.log('Creating transaction:', {
                customerId,
                amount: customerData.totalWinAmount,
                walletBalance: wallet.balance
            });

            transactions.push({
                customerId: new mongoose.Types.ObjectId(customerId),
                walletId: wallet._id,
                type: "credit",
                reason: "bet_won",
                amount: customerData.totalWinAmount,
                balanceBefore: wallet.balance,
                balanceAfter: wallet.balance + customerData.totalWinAmount,
                referenceType: "betItem",
                referenceId: firstBetItem.betItemId,
                status: "success",
                txnId: `WIN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                meta: {
                    note: `Open result declared - Total win amount: ₹${customerData.totalWinAmount} (${customerData.betItems.length} winning bets)`,
                    marketId: marketId.toString(),
                    result: `${openPanna}-${openDigit}`,
                    winningBets: customerData.betItems.map(b => ({
                        betItemId: b.betItemId,
                        winAmount: b.winAmount,
                        digit: b.digit,
                        betTypeCode: b.betTypeCode
                    }))
                }
            });
        }

        if (walletUpdates.length > 0) {
            await Wallet.bulkWrite(walletUpdates, { session });
        }

        if (transactions.length > 0) {
            await WalletTransaction.insertMany(transactions, { session });
        }
    }

    // Update bet items
    if (betUpdates.length > 0) {
        await BetItem.bulkWrite(betUpdates, { session });
    }

    // Update bet slip statuses for those with wins
    for (const [betSlipId, data] of betSlipStatusMap) {
        const items = await BetItem.find({ betSlipId }).session(session);
        const allSettled = items.every(item => item.status !== "pending");

        if (allSettled) {
            const hasWon = items.some(item => item.status === "won");
            await BetSlip.updateOne(
                { _id: betSlipId },
                { status: hasWon ? "won" : "lost" },
                { session }
            );
        }
    }

    // Update remaining bet slips - FIXED: Extract IDs properly
    const allBetSlipIds = betItems
        .map(item => item.betSlipId?._id?.toString())
        .filter(id => id);

    const uniqueBetSlipIds = [...new Set(allBetSlipIds)];

    if (uniqueBetSlipIds.length > 0) {
        const allBetSlips = await BetSlip.find({
            _id: { $in: uniqueBetSlipIds },
            status: "placed"
        }).session(session);

        for (const betSlip of allBetSlips) {
            if (!betSlipStatusMap.has(betSlip._id.toString())) {
                const items = await BetItem.find({ betSlipId: betSlip._id }).session(session);
                const allSettled = items.every(item => item.status !== "pending");

                if (allSettled) {
                    await BetSlip.updateOne(
                        { _id: betSlip._id },
                        { status: "lost" },
                        { session }
                    );
                }
            }
        }
    }
};

/**
 * Settle close session bets (including jodi, sangam)
 */
const settleCloseBets = async (result, session, req) => {
    const { marketId, closeDigit, closePanna, openDigit, openPanna } = result;

    // Find all bet items for this market that need close result
    // These include:
    // 1. Bet items with session = "close" (close session bets)
    // 2. Bet items with betTypeCode = 'JODI', 'HALF_SANGAM', 'FULL_SANGAM' (no session)
    const betItems = await BetItem.find({
        marketId,
        status: "pending",
        $or: [
            { session: "close" },
            { 
                session: null,
                betTypeCode: { $in: ['JODI', 'HALF_SANGAM', 'FULL_SANGAM'] }
            }
        ]
    }).populate({
        path: 'betSlipId',
        populate: {
            path: 'betTypeId',
            model: 'BetType'
        }
    }).session(session);

    console.log(betItems)
    if (betItems.length === 0) return;

    // Group by customer for wallet updates
    const customerWins = new Map(); // customerId -> { totalWinAmount: 0, betItems: [] }
    const betUpdates = [];
    const betSlipStatusMap = new Map();

    for (const betItem of betItems) {
        const betSlip = betItem.betSlipId;
        if (!betSlip) continue; // Skip if betSlip is not populated

        const betTypeCode = betItem.betTypeCode;

        const isWin = isWinner(betItem, result);

        if (isWin) {
            console.log('Winning close bet:', {
                betItemId: betItem._id,
                betTypeCode,
                amount: betItem.amount,
                possibleWinAmount: betItem.possibleWinAmount
            });

            const winAmount = betItem.possibleWinAmount ||
                (betItem.amount / 10) * betItem.payout.amount * betItem.payout.multiplier;

            const customerId = betItem.customerId.toString();
            if (!customerWins.has(customerId)) {
                customerWins.set(customerId, {
                    totalWinAmount: 0,
                    betItems: []
                });
            }
            const customerData = customerWins.get(customerId);
            customerData.totalWinAmount += winAmount;
            customerData.betItems.push({
                betItemId: betItem._id,
                winAmount: winAmount,
                digit: betItem.digit,
                openDigit: betItem.openDigit,
                closeDigit: betItem.closeDigit,
                openPanna: betItem.openPanna,
                closePanna: betItem.closePanna,
                amount: betItem.amount,
                betTypeCode,
                sangamType: betItem.sangamType
            });

            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "won",
                        winAmount: winAmount,
                        resultDeclaredAt: new Date()
                    }
                }
            });

            betSlipStatusMap.set(betSlip._id.toString(), {
                betSlipId: betSlip._id,
                hasWon: true
            });
        } else {
            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "lost",
                        resultDeclaredAt: new Date()
                    }
                }
            });
        }
    }

    // Process wallet updates for winners
    if (customerWins.size > 0) {
        const customerIds = Array.from(customerWins.keys());
        const wallets = await Wallet.find({
            customerId: { $in: customerIds }
        }).session(session);

        const walletMap = new Map();
        wallets.forEach(w => walletMap.set(w.customerId.toString(), w));

        const walletUpdates = [];
        const transactions = [];

        for (const [customerId, customerData] of customerWins) {
            const wallet = walletMap.get(customerId);

            if (!wallet) continue;

            walletUpdates.push({
                updateOne: {
                    filter: { _id: wallet._id },
                    update: {
                        $inc: { balance: customerData.totalWinAmount },
                        lastTransactionAt: new Date()
                    }
                }
            });

            const firstBetItem = customerData.betItems[0];

            transactions.push({
                customerId: new mongoose.Types.ObjectId(customerId),
                walletId: wallet._id,
                type: "credit",
                reason: "bet_won",
                amount: customerData.totalWinAmount,
                balanceBefore: wallet.balance,
                balanceAfter: wallet.balance + customerData.totalWinAmount,
                referenceType: "betItem",
                referenceId: firstBetItem.betItemId,
                status: "success",
                txnId: `WIN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                meta: {
                    note: `Close result declared - Total win amount: ₹${customerData.totalWinAmount} (${customerData.betItems.length} winning bets)`,
                    marketId: marketId.toString(),
                    result: `${closePanna}-${closeDigit}`,
                    winningBets: customerData.betItems.map(b => ({
                        betItemId: b.betItemId,
                        winAmount: b.winAmount,
                        digit: b.digit,
                        openDigit: b.openDigit,
                        closeDigit: b.closeDigit,
                        openPanna: b.openPanna,
                        closePanna: b.closePanna,
                        betTypeCode: b.betTypeCode,
                        sangamType: b.sangamType
                    }))
                }
            });
        }

        if (walletUpdates.length > 0) {
            await Wallet.bulkWrite(walletUpdates, { session });
        }

        if (transactions.length > 0) {
            await WalletTransaction.insertMany(transactions, { session });
        }
    }

    // Update bet items
    if (betUpdates.length > 0) {
        await BetItem.bulkWrite(betUpdates, { session });
    }

    // Update bet slip statuses for those with wins
    for (const [betSlipId, data] of betSlipStatusMap) {
        const items = await BetItem.find({ betSlipId }).session(session);
        const allSettled = items.every(item => item.status !== "pending");

        if (allSettled) {
            const hasWon = items.some(item => item.status === "won");
            await BetSlip.updateOne(
                { _id: betSlipId },
                { status: hasWon ? "won" : "lost" },
                { session }
            );
        }
    }

    // Update remaining bet slips - FIXED: Extract IDs properly
    const allBetSlipIds = betItems
        .map(item => item.betSlipId?._id?.toString())
        .filter(id => id); // Remove undefined/null values

    const uniqueBetSlipIds = [...new Set(allBetSlipIds)];

    if (uniqueBetSlipIds.length > 0) {
        const allBetSlips = await BetSlip.find({
            _id: { $in: uniqueBetSlipIds },
            status: "placed"
        }).session(session);

        for (const betSlip of allBetSlips) {
            if (!betSlipStatusMap.has(betSlip._id.toString())) {
                const items = await BetItem.find({ betSlipId: betSlip._id }).session(session);
                const allSettled = items.every(item => item.status !== "pending");

                if (allSettled) {
                    await BetSlip.updateOne(
                        { _id: betSlip._id },
                        { status: "lost" },
                        { session }
                    );
                }
            }
        }
    }
};

/**
 * Cancel market and refund all pending bets
 */
const cancelMarket = async (payload, adminId, req) => {
    const { marketId, date } = payload;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update result status
        const result = await Result.findOneAndUpdate(
            { marketId, date },
            {
                status: "cancelled",
                cancelledBy: adminId,
                cancelledAt: new Date()
            },
            { session, new: true }
        );

        // Find all pending bet items for this market
        const betItems = await BetItem.find({
            marketId,
            status: "pending"
        }).populate('betSlipId').session(session);

        if (betItems.length === 0) {
            await session.commitTransaction();
            session.endSession();
            return {
                success: true,
                message: "No pending bets to refund",
                refundedCount: 0,
                totalRefundAmount: 0
            };
        }

        // Get unique bet slip IDs
        const betSlipIds = [...new Set(betItems.map(item => item.betSlipId.toString()))];

        // Group refunds by customer
        const customerRefunds = new Map(); // customerId -> total refund amount
        const betUpdates = [];
        const transactions = [];

        for (const betItem of betItems) {
            const refundAmount = betItem.amount;
            const customerId = betItem.customerId.toString();

            if (!customerRefunds.has(customerId)) {
                customerRefunds.set(customerId, 0);
            }
            customerRefunds.set(customerId, customerRefunds.get(customerId) + refundAmount);

            // Update bet item to refunded
            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "refunded",
                        refundedAt: new Date()
                    }
                }
            });
        }

        // Process refunds
        if (customerRefunds.size > 0) {
            const customerIds = Array.from(customerRefunds.keys());
            const wallets = await Wallet.find({
                customerId: { $in: customerIds }
            }).session(session);

            const walletMap = new Map();
            wallets.forEach(w => walletMap.set(w.customerId.toString(), w));

            const walletUpdates = [];

            for (const [customerId, refundAmount] of customerRefunds) {
                const wallet = walletMap.get(customerId);

                if (!wallet) continue;

                walletUpdates.push({
                    updateOne: {
                        filter: { _id: wallet._id },
                        update: {
                            $inc: { balance: refundAmount },
                            lastTransactionAt: new Date()
                        }
                    }
                });

                transactions.push({
                    customerId: new mongoose.Types.ObjectId(customerId),
                    walletId: wallet._id,
                    type: "credit",
                    reason: "bet_refund",
                    amount: refundAmount,
                    balanceBefore: wallet.balance,
                    balanceAfter: wallet.balance + refundAmount,
                    referenceType: "betItem",
                    status: "success",
                    txnId: `RFND${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                    meta: {
                        note: `Market cancelled - Refund amount: ₹${refundAmount}`,
                        adminId: adminId,
                        marketId: marketId
                    }
                });
            }

            if (walletUpdates.length > 0) {
                await Wallet.bulkWrite(walletUpdates, { session });
            }
        }

        // Update bet items
        if (betUpdates.length > 0) {
            await BetItem.bulkWrite(betUpdates, { session });
        }

        // Create transaction records
        if (transactions.length > 0) {
            await WalletTransaction.insertMany(transactions, { session });
        }

        // Update all bet slips to refunded
        if (betSlipIds.length > 0) {
            await BetSlip.updateMany(
                { _id: { $in: betSlipIds } },
                { status: "refunded" },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        const totalRefundAmount = Array.from(customerRefunds.values()).reduce((sum, amount) => sum + amount, 0);

        return {
            success: true,
            message: "Market cancelled successfully",
            refundedCount: betItems.length,
            totalRefundAmount: totalRefundAmount
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

/**
 * Declare open result
 * This settles:
 * - Single Digit (session: "open")
 * - Single Panna (session: "open")
 * - Double Panna (session: "open")
 * - Triple Panna (session: "open")
 */
const declareOpenResult = async (payload, adminId, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { marketId, date, openPanna } = payload;

        // Validate panna format
        if (!/^\d{3}$/.test(openPanna)) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid panna - must be 3 digits");
        }

        const openDigit = calculateDigit(openPanna);

        // Check for existing result
        let result = await Result.findOne({ marketId, date }).session(session);

        if (!result) {
            // Create new result
            result = await Result.create([{
                marketId,
                date,
                openPanna,
                openDigit,
                status: "open_declared",
                declaredBy: adminId
            }], { session });
            result = result[0];
        } else {
            // Validate existing result status
            if (result.status !== "pending") {
                throw new ApiError(
                    httpStatus.status.BAD_REQUEST,
                    `Cannot declare open result - current status: ${result.status}`
                );
            }

            if (result.openPanna) {
                throw new ApiError(
                    httpStatus.status.BAD_REQUEST,
                    "Open result already declared for this market/date"
                );
            }

            // Update existing result
            result.openPanna = openPanna;
            result.openDigit = openDigit;
            result.status = "open_declared";
            result.declaredBy = adminId;

            await result.save({ session });
        }

        // Settle open bets
        await settleOpenBets(result, session, req);

        await session.commitTransaction();
        session.endSession();

        return result;
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

/**
 * Declare close result
 * This settles:
 * - Close session bets (session: "close")
 * - Jodi (no session)
 * - Half Sangam (no session)
 * - Full Sangam (no session)
 */
const declareCloseResult = async (payload, adminId, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { marketId, date, closePanna } = payload;

        // Validate panna format
        if (!/^\d{3}$/.test(closePanna)) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid panna - must be 3 digits");
        }

        const closeDigit = calculateDigit(closePanna);

        // Find existing result
        const result = await Result.findOne({ marketId, date }).session(session);

        if (!result) {
            throw new ApiError(
                httpStatus.status.BAD_REQUEST,
                "Open result must be declared first"
            );
        }

        // Validate result status
        if (result.status !== "open_declared") {
            throw new ApiError(
                httpStatus.status.BAD_REQUEST,
                `Cannot declare close result - current status: ${result.status}`
            );
        }

        if (result.closePanna) {
            throw new ApiError(
                httpStatus.status.BAD_REQUEST,
                "Close result already declared for this market/date"
            );
        }

        // Update with close result
        result.closePanna = closePanna;
        result.closeDigit = closeDigit;
        result.status = "close_declared";
        result.declaredBy = adminId;

        await result.save({ session });

        // Settle close bets
        await settleCloseBets(result, session, req);

        // Mark as completed after settling all bets
        result.status = "completed";
        await result.save({ session });

        await session.commitTransaction();
        session.endSession();

        return result;
    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

/**
 * Get current day results
 */
const getCurrentDayResult = async (filterQuery = {}) => {
    try {
        const results = await Result.find(filterQuery)
            .populate({
                path: 'marketId',
                select: 'name openTime closeTime status'
            })
            .populate({
                path: 'declaredBy',
                select: 'name email'
            })
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return results || [];
    } catch (error) {
        throw new ApiError(
            httpStatus.status.INTERNAL_SERVER_ERROR,
            error.message || "Failed to fetch results"
        );
    }
};

module.exports = {
    declareOpenResult,
    declareCloseResult,
    cancelMarket,
    getCurrentDayResult,
    isWinner,
    isHalfSangamWinner,
    isFullSangamWinner,
    isJodiWinner,
    getResultForBetType,
    getBetTypeCategory
};