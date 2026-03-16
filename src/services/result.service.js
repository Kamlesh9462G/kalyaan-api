const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Result, BetItem, BetSlip, Wallet, WalletTransaction, BetType } = require('../models/index');
const ApiError = require('../utils/ApiError');

/**
 * Settle open session bets
 */
const settleOpenBets = async (result, session, req) => {
    const { marketId, openDigit, openPanna } = result;

    // First find all bet slips for this market and open session
    const betSlips = await BetSlip.find({
        marketId,
        session: "open",
        status: "placed"
    }).select('_id').session(session);

    const betSlipIds = betSlips.map(slip => slip._id);

    if (betSlipIds.length === 0) return;

    // Find all pending bet items for these bet slips
    const betItems = await BetItem.find({
        betSlipId: { $in: betSlipIds },
        status: "pending"
    }).populate({
        path: 'betSlipId',
        populate: {
            path: 'betTypeId',
            model: 'BetType'
        }
    }).session(session);

    if (betItems.length === 0) return;

    // Group by customer for wallet updates
    const customerWins = new Map(); // customerId -> { totalWinAmount: 0, transactions: [] }
    const betUpdates = [];
    const betSlipStatusMap = new Map(); // betSlipId -> { hasWon: boolean }

    for (const betItem of betItems) {
        const betSlip = betItem.betSlipId;
        const betType = betSlip.betTypeId;

        let isWin = false;

        // Determine win based on bet type category
        switch (betType.category) {
            case "digit":
                // Single digit betting (0-9)
                isWin = betItem.digit === openDigit;
                break;

            case "panna":
                // Panna betting (3-digit numbers)
                // Check pattern from betType
                if (betType.pattern === "SINGLE_PANNA" ||
                    betType.pattern === "DOUBLE_PANNA" ||
                    betType.pattern === "TRIPLE_PANNA") {
                    isWin = betItem.digit === openPanna;
                }
                break;

            default:
                // Other bet types might not be valid for open session
                isWin = false;
        }

        if (isWin) {
            console.log(betItem.possibleWinAmount)
            console.log(betItem.amount)
            console.log(betItem.payout.amount)
            console.log(betItem.payout.multiplier)


            // Calculate win amount (already stored in possibleWinAmount from pre-save)
            const winAmount = betItem.possibleWinAmount ||
                (betItem.amount / 10) * betItem.payout.amount * betItem.payout.multiplier;

            console.log(winAmount)
            // Track customer win total and store bet item reference for transaction
            const customerId = betItem.customerId.toString();
            if (!customerWins.has(customerId)) {
                customerWins.set(customerId, {
                    totalWinAmount: 0,
                    betItems: [] // Store winning bet items for this customer
                });
            }
            const customerData = customerWins.get(customerId);
            customerData.totalWinAmount += winAmount;
            customerData.betItems.push({
                betItemId: betItem._id,
                winAmount: winAmount,
                digit: betItem.digit,
                amount: betItem.amount
            });

            // Update bet item to won
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

            // Track bet slip for status update
            betSlipStatusMap.set(betSlip._id.toString(), {
                betSlipId: betSlip._id,
                hasWon: true
            });
        } else {
            // Update bet item to lost
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
        // Get all wallets for winning customers
        const customerIds = Array.from(customerWins.keys());
        const wallets = await Wallet.find({
            customerId: { $in: customerIds }
        }).session(session);

        const walletMap = new Map();
        wallets.forEach(w => walletMap.set(w.customerId.toString(), w));

        // Prepare wallet updates and transactions
        const walletUpdates = [];
        const transactions = [];

        for (const [customerId, customerData] of customerWins) {
            const wallet = walletMap.get(customerId);

            if (!wallet) continue;

            // Wallet balance update
            walletUpdates.push({
                updateOne: {
                    filter: { _id: wallet._id },
                    update: {
                        $inc: { balance: customerData.totalWinAmount },
                        lastTransactionAt: new Date()
                    }
                }
            });

            // Create a transaction record for this customer's total win
            // You can either create one transaction for total win or multiple transactions per bet item
            // Here I'm creating one transaction for total win with reference to first bet item
            const firstBetItem = customerData.betItems[0];

            console.log({
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
                    // ip: req.ip,
                    marketId: marketId.toString(),
                    result: `${openPanna}-${openDigit}`,
                    winningBets: customerData.betItems.map(b => ({
                        betItemId: b.betItemId,
                        winAmount: b.winAmount,
                        digit: b.digit
                    }))
                }
            })
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
                    // ip: req.ip,
                    marketId: marketId.toString(),
                    result: `${openPanna}-${openDigit}`,
                    winningBets: customerData.betItems.map(b => ({
                        betItemId: b.betItemId,
                        winAmount: b.winAmount,
                        digit: b.digit
                    }))
                }
            });
        }

        // Execute wallet updates
        if (walletUpdates.length > 0) {
            await Wallet.bulkWrite(walletUpdates, { session });
        }

        // Create transaction records
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
        // Check if all items in this bet slip are settled
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

    // Update bet slips that have all items lost (no wins tracked)
    const allBetSlips = await BetSlip.find({
        _id: { $in: betSlipIds },
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
};

/**
 * Settle close session bets (including jodi, sangam)
 */
const settleCloseBets = async (result, session, req) => {
    const { marketId, closeDigit, closePanna, openDigit, openPanna } = result;

    // Find all bet slips for this market
    const betSlips = await BetSlip.find({
        marketId,
        status: "placed"
    }).select('_id session betTypeId').populate('betTypeId').session(session);

    const betSlipIds = betSlips.map(slip => slip._id);

    if (betSlipIds.length === 0) return;

    // Find all pending bet items
    const betItems = await BetItem.find({
        betSlipId: { $in: betSlipIds },
        status: "pending"
    }).populate({
        path: 'betSlipId',
        populate: {
            path: 'betTypeId',
            model: 'BetType'
        }
    }).session(session);

    // Create a map of bet slip data for quick access
    const betSlipMap = new Map();
    betSlips.forEach(slip => {
        betSlipMap.set(slip._id.toString(), slip);
    });

    // Filter items that need to be settled now:
    // 1. Close session bets
    // 2. Jodi bets (category: "jodi")
    // 3. Sangam bets (category: "sangam")
    const itemsToSettle = betItems.filter(item => {
        const betSlip = item.betSlipId;
        if (!betSlip) return false;

        const betType = betSlip.betTypeId;

        // Close session bets
        if (betSlip.session === "close") return true;

        // Jodi and Sangam bets (need close result)
        if (betType && (betType.category === "jodi" || betType.category === "sangam")) return true;

        return false;
    });

    if (itemsToSettle.length === 0) return;

    // Group by customer for wallet updates
    const customerWins = new Map(); // customerId -> { totalWinAmount: 0, betItems: [] }
    const betUpdates = [];
    const betSlipStatusMap = new Map();

    for (const betItem of itemsToSettle) {
        const betSlip = betItem.betSlipId;
        const betType = betSlip.betTypeId;

        let isWin = false;

        // Determine win based on bet type category and session
        switch (betType.category) {
            case "digit":
                // Close digit betting
                if (betSlip.session === "close") {
                    isWin = betItem.digit === closeDigit;
                }
                break;

            case "panna":
                // Close panna betting
                if (betSlip.session === "close") {
                    if (betType.pattern === "SINGLE_PANNA" ||
                        betType.pattern === "DOUBLE_PANNA" ||
                        betType.pattern === "TRIPLE_PANNA") {
                        isWin = betItem.digit === closePanna;
                    }
                }
                break;

            case "jodi":
                // Jodi is combination of open and close digits
                if (betType.category === "jodi") {
                    const jodi = `${openDigit}${closeDigit}`;
                    isWin = betItem.digit === jodi;
                }
                break;

            case "sangam":
                if (betType.pattern === "HALF_SANGAM") {
                    // Half Sangam: open digit + close panna
                    const [digit, panna] = betItem.digit.split('-');
                    isWin = digit === openDigit && panna === closePanna;
                } else if (betType.pattern === "FULL_SANGAM") {
                    // Full Sangam: open panna + close panna
                    const [open, close] = betItem.digit.split('-');
                    isWin = open === openPanna && close === closePanna;
                }
                break;

            default:
                isWin = false;
        }

        if (isWin) {
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
                amount: betItem.amount,
                betType: betType.category,
                pattern: betType.pattern
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
                    // ip: req?.ip,
                    marketId: marketId.toString(),
                    result: `${closePanna}-${closeDigit}`,
                    winningBets: customerData.betItems.map(b => ({
                        betItemId: b.betItemId,
                        winAmount: b.winAmount,
                        digit: b.digit,
                        betType: b.betType,
                        pattern: b.pattern
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

    // Update remaining bet slips
    const allBetSlips = await BetSlip.find({
        _id: { $in: betSlipIds },
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
                status: "completed",
                declaredBy: adminId
            },
            { session, new: true }
        );

        // Find all placed bet slips for this market
        const betSlips = await BetSlip.find({
            marketId,
            status: "placed"
        }).select('_id').session(session);

        const betSlipIds = betSlips.map(slip => slip._id);

        if (betSlipIds.length === 0) {
            await session.commitTransaction();
            session.endSession();
            return {
                success: true,
                message: "No pending bets to refund",
                refundedCount: 0,
                totalRefundAmount: 0
            };
        }

        // Find all pending bet items
        const betItems = await BetItem.find({
            betSlipId: { $in: betSlipIds },
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

            // Update bet item to cancelled
            betUpdates.push({
                updateOne: {
                    filter: { _id: betItem._id },
                    update: {
                        status: "cancelled",
                        resultDeclaredAt: new Date()
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
                        // ip: req.ip,
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

        // Update all bet slips to cancelled
        await BetSlip.updateMany(
            { _id: { $in: betSlipIds } },
            { status: "cancelled" },
            { session }
        );

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
 * Calculate digit from panna (sum of digits % 10)
 */
const calculateDigit = (panna) => {
    const sum = panna.split("").reduce((a, b) => a + Number(b), 0);
    return String(sum % 10);
};

/**
 * Declare open result
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
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

/**
 * Declare close result
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
    getCurrentDayResult
};