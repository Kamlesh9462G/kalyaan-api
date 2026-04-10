
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const ApiError = require('../utils/ApiError');

const { Customer, Deposit, BetItem, Withdrawal, SupportTicket } = require("../models/index");
const getDashboardStats = async (filterQuery) => {
    try {
        const { date, startDate, endDate } = filterQuery;

        const getDateFilter = () => {
            let filter = {};

            if (date) {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);

                const end = new Date(date);
                end.setHours(23, 59, 59, 999);

                filter = { createdAt: { $gte: start, $lte: end } };
            } else if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);

                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filter = { createdAt: { $gte: start, $lte: end } };
            } else {
                const start = new Date();
                start.setHours(0, 0, 0, 0);

                const end = new Date();
                end.setHours(23, 59, 59, 999);

                filter = { createdAt: { $gte: start, $lte: end } };
            }

            return filter;
        };

        const dateFilter = getDateFilter();

        const [
            customers,
            deposits,
            bets,
            withdraws,
            tickets,
            topUsers
        ] = await Promise.all([

            // 👤 CUSTOMERS
            Customer.aggregate([
                {
                    $facet: {
                        total: [{ $match: { isDeleted: false } }, { $count: "count" }],
                        active: [{ $match: { status: "active", isDeleted: false } }, { $count: "count" }],
                        blocked: [{ $match: { status: "blocked" } }, { $count: "count" }],
                        new: [{ $match: { ...dateFilter, isDeleted: false } }, { $count: "count" }]
                    }
                }
            ]),

            // 💰 DEPOSITS
            Deposit.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        amount: { $sum: "$amount" },
                        success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
                    }
                }
            ]),

            // 🎲 BETS
            BetItem.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        won: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } },
                        lost: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
                        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                        totalBetAmount: { $sum: "$amount" },
                        totalWinAmount: { $sum: "$winAmount" }
                    }
                }
            ]),

            // 💸 WITHDRAWS
            Withdrawal.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        amount: { $sum: "$amount" },
                        requested: { $sum: { $cond: [{ $eq: ["$status", "requested"] }, 1, 0] } },
                        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                        paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } }
                    }
                }
            ]),

            // 🎟 TICKETS
            SupportTicket.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
                        in_progress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
                        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } }
                    }
                }
            ]),

            // 🔥 TOP USERS WITH DETAILS
            BetItem.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$customerId",
                        totalBet: { $sum: "$amount" },
                        totalWin: { $sum: "$winAmount" }
                    }
                },
                {
                    $addFields: {
                        netProfit: { $subtract: ["$totalBet", "$totalWin"] }
                    }
                },
                { $sort: { totalBet: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "customers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                { $unwind: "$customer" },
                {
                    $project: {
                        customerId: "$_id",
                        name: "$customer.name",
                        email: "$customer.email",
                        phone: "$customer.phone",
                        totalBet: 1,
                        totalWin: 1,
                        netProfit: 1
                    }
                }
            ])
        ]);

        const safe = (arr) => arr[0] || {};

        const depositData = safe(deposits);
        const withdrawData = safe(withdraws);
        const betData = safe(bets);
        const ticketData = safe(tickets);

        // 💰 ADVANCED FINANCIALS
        const grossRevenue = betData.totalBetAmount || 0;
        const payout = betData.totalWinAmount || 0;
        const netProfit = grossRevenue - payout;

        // 🎟 Ticket metrics
        const pendingTickets =
            (ticketData.open || 0) + (ticketData.in_progress || 0);

        const resolutionRate =
            ticketData.total > 0
                ? ((ticketData.resolved + ticketData.closed) / ticketData.total) * 100
                : 0;

        // 💸 Withdraw rates
        const approvalRate =
            withdrawData.count > 0
                ? (withdrawData.approved / withdrawData.count) * 100
                : 0;

        const rejectionRate =
            withdrawData.count > 0
                ? (withdrawData.rejected / withdrawData.count) * 100
                : 0;

        return {
            success: true,
            data: {
                overview: {
                    totalCustomers: customers[0].total[0]?.count || 0,
                    activeCustomers: customers[0].active[0]?.count || 0,
                    blockedCustomers: customers[0].blocked[0]?.count || 0,
                    newCustomers: customers[0].new[0]?.count || 0
                },

                finance: {
                    deposits: depositData,
                    withdraws: withdrawData,
                    grossRevenue,
                    payout,
                    netProfit
                },

                bets: betData,

                tickets: {
                    ...ticketData,
                    pending: pendingTickets,
                    resolutionRate: Number(resolutionRate.toFixed(2))
                },

                withdraws: {
                    ...withdrawData,
                    approvalRate: Number(approvalRate.toFixed(2)),
                    rejectionRate: Number(rejectionRate.toFixed(2))
                },

                // 🔥 SMART RISK ENGINE
                risk: {
                    highPayout: payout > grossRevenue * 0.9,
                    platformLoss: netProfit < 0,
                    withdrawalSpike: withdrawData.count > depositData.count,
                    suspiciousUsers: topUsers.filter(u => u.totalWin > u.totalBet).length
                },

                // 🔥 TOP USERS WITH DETAILS
                top: {
                    bettors: topUsers
                }
            }
        };

    } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
    }
};

module.exports = {
    getDashboardStats
};