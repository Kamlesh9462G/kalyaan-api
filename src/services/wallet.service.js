const mongoose = require("mongoose");
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Wallet, WalletTransaction, Deposit, Withdrawal, Customer } = require('../models/index')

const generateTxnId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};
const getTransactions = async (customerId) => {
  try {
    const wallet = await Wallet.findOne({ customerId: customerId });
    if (!wallet) {
      throw new ApiError(httpStatus.status.NOT_FOUND, "Wallet not found for the customer")
    }
    return await WalletTransaction.find({ wallet: wallet._id });
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getCustomerWallet = async (customerId) => {
  console.log(customerId)
  try {
    return await Wallet.find({ customerId: customerId })
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)

  }
}

const getWalletTransactions = async (filterQuery, page = 1, limit = 20) => {

  const skip = (page - 1) * limit;

  const transactions = await WalletTransaction.aggregate([

    {
      $match: filterQuery
    },

    /* ---------------- BET ITEM LOOKUP ---------------- */

    {
      $lookup: {
        from: "betitems",
        localField: "referenceId",
        foreignField: "_id",
        as: "betItem"
      }
    },
    {
      $unwind: {
        path: "$betItem",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- BET SLIP LOOKUP ---------------- */

    {
      $lookup: {
        from: "betslips",
        localField: "betItem.betSlipId",
        foreignField: "_id",
        as: "betSlip"
      }
    },
    {
      $unwind: {
        path: "$betSlip",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- MARKET LOOKUP ---------------- */

    {
      $lookup: {
        from: "markets",
        localField: "betSlip.marketId",
        foreignField: "_id",
        as: "market"
      }
    },
    {
      $unwind: {
        path: "$market",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- BET TYPE LOOKUP ---------------- */

    {
      $lookup: {
        from: "bettypes",
        localField: "betSlip.betTypeId",
        foreignField: "_id",
        as: "betType"
      }
    },
    {
      $unwind: {
        path: "$betType",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- DEPOSIT LOOKUP ---------------- */

    {
      $lookup: {
        from: "deposits",
        localField: "referenceId",
        foreignField: "_id",
        as: "deposit"
      }
    },
    {
      $unwind: {
        path: "$deposit",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- WITHDRAW LOOKUP ---------------- */

    {
      $lookup: {
        from: "withdraws",
        localField: "referenceId",
        foreignField: "_id",
        as: "withdraw"
      }
    },
    {
      $unwind: {
        path: "$withdraw",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ---------------- RESPONSE FORMAT ---------------- */

    {
      $project: {

        _id: 0,

        txnId: 1,

        type: 1,

        reason: 1,

        amount: 1,

        status: 1,

        balanceBefore: 1,

        balanceAfter: 1,

        createdAt: 1,

        /* -------- BET DETAILS -------- */

        bet: {
          digit: "$betItem.digit",
          points: "$betItem.points",
          session: "$betSlip.session",
          marketName: "$market.name",
          betType: "$betType.name"
        },

        /* -------- DEPOSIT DETAILS -------- */

        deposit: {
          method: "$deposit.method",
          transactionId: "$deposit.transactionId"
        },

        /* -------- WITHDRAW DETAILS -------- */

        withdraw: {
          method: "$withdraw.method",
          accountDetails: "$withdraw.accountDetails"
        },

        /* -------- UI LABEL -------- */

        label: {
          $switch: {
            branches: [
              { case: { $eq: ["$reason", "bet_placed"] }, then: "Bet Placed" },
              { case: { $eq: ["$reason", "bet_won"] }, then: "Bet Won" },
              { case: { $eq: ["$reason", "bet_lost"] }, then: "Bet Lost" },
              { case: { $eq: ["$reason", "deposit"] }, then: "Deposit" },
              { case: { $eq: ["$reason", "withdraw"] }, then: "Withdraw" }
            ],
            default: "Wallet Transaction"
          }
        }

      }
    },

    {
      $sort: { createdAt: -1 }
    },

    {
      $skip: skip
    },

    {
      $limit: limit
    }

  ]);

  return transactions;
};

const addWalletBalance = async (payload) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { customerId, amount, note, txnId } = payload;

    if (!customerId || !amount) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "customerId and amount required");
    }

    if (amount <= 0) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Amount must be greater than 0");
    }

    // 🔎 Find wallet
    let wallet = await Wallet.findOne({ customerId }).session(session);

    // 🆕 Create wallet if not exists
    if (!wallet) {
      wallet = await Wallet.create(
        [{
          customerId,
          balance: 0
        }],
        { session }
      );

      wallet = wallet[0];
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // 💰 Update wallet balance
    wallet.balance = balanceAfter;
    wallet.lastTransactionAt = new Date();

    await wallet.save({ session });

    // 🧾 Create transaction
    const transaction = await WalletTransaction.create(
      [{
        customerId,
        walletId: wallet._id,

        type: "credit",
        reason: "admin_credit",

        amount,

        balanceBefore,
        balanceAfter,

        referenceType: "manual",

        txnId: txnId || `TXN${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10)}`,

        meta: {
          note: note || "Admin manual credit"
        }
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      wallet,
      transaction: transaction[0]
    };

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    throw new ApiError(
      httpStatus.status.INTERNAL_SERVER_ERROR,
      error.message
    );
  }

};

const getDepositRequests = async (filterQuery) => {
  try {
    return await Deposit.find();
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
  }
}
const createDeposit = async (payload) => {

  const { amount, method, meta, customerId, utrNumber, vpaId } = payload;

  const deposit = await Deposit.create({
    customerId,
    amount,
    method,
    utrNumber,
    vpaId,
    transactionId: `TXN${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10)}`,
    meta
  });

  return deposit;
};

const approveDeposit = async (depositId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(depositId).session(session);

    if (!deposit) throw new ApiError(404, "Deposit not found");

    if (deposit.status !== "pending") {
      throw new ApiError(400, "Deposit already processed");
    }

    // 🔐 Lock update (idempotency safe)
    deposit.status = "success";
    deposit.creditedAt = new Date();
    await deposit.save({ session });

    // 🔎 Get/Create wallet
    let wallet = await Wallet.findOne({ customerId: deposit.customerId }).session(session);

    if (!wallet) {
      wallet = await Wallet.create([{
        customerId: deposit.customerId,
        balance: 0
      }], { session });

      wallet = wallet[0];
    }

    const balanceBefore = wallet.balance;
    wallet.balance += deposit.amount;

    await wallet.save({ session });

    // 🧾 Transaction entry
    await WalletTransaction.create([{
      customerId: deposit.customerId,
      walletId: wallet._id,
      type: "credit",
      reason: "deposit",
      amount: deposit.amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: "deposit",
      referenceId: deposit._id,
      txnId: generateTxnId(),
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return wallet;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const rejectDeposit = async (depositId) => {
  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw new Error("Deposit not found");
  }

  if (deposit.status !== "pending") {
    throw new Error("Deposit already processed");
  }

  deposit.status = "failed";
  deposit.creditedAt = new Date();

  await deposit.save();
}
const getWithdrawRequests = async (filterQuery) => {
  try {
    return await Withdrawal.find();
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
  }
}
const createWithdraw = async (customerId, payload) => {

  const { amount, method, accountDetails } = payload;

  const wallet = await Wallet.findOne({ customerId });

  if (!wallet || wallet.balance < amount) {
    throw new ApiError(httpStatus.status.BAD_REQUEST, "Insufficient balance");
  }

  const withdraw = await Withdrawal.create({
    customerId,
    amount,
    method,
    accountDetails
  });

  return withdraw;
};
const approveWithdraw = async (withdrawId, adminId, body) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await Withdrawal.findById(withdrawId).session(session);

    if (!withdraw) throw new ApiError(httpStatus.status.NOT_FOUND, "Withdraw not found");

    if (withdraw.status !== "requested") {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Already processed");
    }

    const wallet = await Wallet.findOne({ customerId: withdraw.customerId }).session(session);

    if (!wallet) throw new ApiError(httpStatus.status.NOT_FOUND, "Wallet not found");

    if (wallet.balance < withdraw.amount) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Insufficient balance");
    }

    const balanceBefore = wallet.balance;

    wallet.balance -= withdraw.amount;
    await wallet.save({ session });

    await WalletTransaction.create([{
      customerId: withdraw.customerId,
      walletId: wallet._id,
      type: "debit",
      reason: "withdraw",
      amount: withdraw.amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: "withdraw",
      referenceId: body.referenceId,
      txnId: generateTxnId(),
    }], { session });

    withdraw.status = "paid";
    withdraw.processedBy = adminId;
    withdraw.referenceId = body.referenceId;
    withdraw.processedAt = new Date();

    await withdraw.save({ session });

    await session.commitTransaction();
    session.endSession();

    return withdraw;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const rejectWithdraw = async (withdrawId, adminId, remark) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await Withdrawal.findById(withdrawId).session(session);

    if (!withdraw) throw new ApiError(404, "Withdraw not found");

    if (withdraw.status !== "requested") {
      throw new ApiError(400, "Already processed");
    }

    withdraw.status = "rejected";
    withdraw.processedBy = adminId;
    withdraw.processedAt = new Date();
    withdraw.adminRemark = remark;

    await withdraw.save({ session });

    await session.commitTransaction();
    session.endSession();

    return withdraw;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
module.exports = {
  getTransactions,
  addWalletBalance,
  createDeposit,
  approveDeposit,
  createWithdraw,
  approveWithdraw,
  getWalletTransactions,
  getCustomerWallet,
  getDepositRequests,
  getWithdrawRequests,
  rejectDeposit,
  rejectWithdraw
}