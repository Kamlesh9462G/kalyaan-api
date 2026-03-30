const mongoose = require("mongoose");
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Wallet, WalletTransaction, Deposit, Withdrawal, Customer, Notification, ReferralSettings, Referral } = require('../models/index')

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
    // =========================================================
    // 🔍 STEP 1: FETCH & VALIDATE DEPOSIT
    // =========================================================

    const deposit = await Deposit.findById(depositId).session(session);

    if (!deposit) throw new ApiError(404, "Deposit not found");

    if (deposit.status !== "pending") {
      throw new ApiError(400, "Deposit already processed");
    }

    // =========================================================
    // ✅ STEP 2: MARK DEPOSIT SUCCESS
    // =========================================================

    deposit.status = "success";
    deposit.creditedAt = new Date();
    await deposit.save({ session });

    // =========================================================
    // 💰 STEP 3: CREDIT USER WALLET
    // =========================================================

    let wallet = await Wallet.findOne({ customerId: deposit.customerId }).session(session);

    if (!wallet) {
      wallet = await Wallet.create([{
        customerId: deposit.customerId,
        balance: 0,
        lockedBalance: 0
      }], { session });
      wallet = wallet[0];
    }

    const balanceBefore = wallet.balance;
    wallet.balance += deposit.amount;
    await wallet.save({ session });

    // 🧾 Deposit transaction
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

    // =========================================================
    // ⚙️ STEP 4: FETCH SETTINGS
    // =========================================================

    const settings = await ReferralSettings.findOne().session(session);

    // =========================================================
    // 🎯 STEP 5: WAGERING ONLY FOR REFERRED USERS
    // =========================================================

    const customer = await Customer.findById(deposit.customerId).session(session);

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    // 👉 APPLY WAGER ONLY IF USER IS REFERRED
    if (customer.referredBy) {

      const WAGER_MULTIPLIER = settings?.deposit?.wagerMultiplier || 2;

      customer.wagering.totalDeposit += deposit.amount;

      const newRequiredWager = deposit.amount * WAGER_MULTIPLIER;

      customer.wagering.requiredWager += newRequiredWager;

      customer.wagering.lockedAmount += deposit.amount;

      customer.wagering.isWagerCompleted = false;

      await customer.save({ session });
    }

    // =========================================================
    // 🎁 STEP 6: REFERRAL LOGIC
    // =========================================================

    if (settings?.isReferralActive) {

      const referral = await Referral.findOne({
        referredUser: deposit.customerId,
        status: { $ne: "REWARDED" }
      }).session(session);

      if (referral) {

        // 📊 accumulate total deposit
        referral.totalDeposit += deposit.amount;

        const MIN_DEPOSIT = settings.deposit.minAmount;
        const REWARD_AMOUNT = settings.reward.referrerAmount;

        // ✅ FIX: use totalDeposit (not single deposit)
        if (referral.totalDeposit >= MIN_DEPOSIT) {

          // 🔎 Get/Create referrer wallet
          let referrerWallet = await Wallet.findOne({
            customerId: referral.referrer
          }).session(session);

          if (!referrerWallet) {
            referrerWallet = await Wallet.create([{
              customerId: referral.referrer,
              balance: 0,
              lockedBalance: 0
            }], { session });
            referrerWallet = referrerWallet[0];
          }

          const refBalanceBefore = referrerWallet.balance;

          // 💰 Credit reward
          referrerWallet.balance += REWARD_AMOUNT;
          await referrerWallet.save({ session });

          // 🧾 Transaction
          await WalletTransaction.create([{
            customerId: referral.referrer,
            walletId: referrerWallet._id,
            type: "credit",
            reason: "referral_bonus",
            amount: REWARD_AMOUNT,
            balanceBefore: refBalanceBefore,
            balanceAfter: referrerWallet.balance,
            referenceType: "referral",
            referenceId: referral._id,
            txnId: generateTxnId(),
          }], { session });

          // =====================================================
          // 🎯 APPLY WAGERING TO REFERRER ALSO (IMPORTANT)
          // =====================================================

          const referrer = await Customer.findById(referral.referrer).session(session);

          if (referrer) {
            const WAGER_MULTIPLIER = settings?.deposit?.wagerMultiplier || 2;

            referrer.wagering.requiredWager += REWARD_AMOUNT * WAGER_MULTIPLIER;
            referrer.wagering.lockedAmount += REWARD_AMOUNT;
            referrer.wagering.isWagerCompleted = false;

            await referrer.save({ session });
          }

          // ✅ mark rewarded
          referral.status = "REWARDED";
          referral.rewardedAt = new Date();

        } else {
          referral.status = "PENDING";
        }

        await referral.save({ session });
      }
    }

    // =========================================================
    // ✅ FINAL COMMIT
    // =========================================================

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

  // 🔎 Get wallet
  const wallet = await Wallet.findOne({ customerId });

  if (!wallet) {
    throw new ApiError(400, "Wallet not found");
  }

  // 🔎 Get customer (for wagering + restrictions)
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  // 🚫 1. Check withdraw blocked by admin
  if (customer.isWithdrawBlocked) {
    throw new ApiError(
      403,
      "Withdrawals are temporarily restricted on your account. Please contact support."
    );
  }

  // 🚫 2. Check account status
  if (customer.status !== "active") {
    throw new ApiError(
      403,
      "Your account is not active. Withdrawal is not allowed."
    );
  }

  // 🚫 3. Wagering condition check (ANTI-FRAUD)
  if (!customer.wagering?.isWagerCompleted) {
    const remaining =
      (customer.wagering.requiredWager || 0) -
      (customer.wagering.completedWager || 0);

    throw new ApiError(
      400,
      `Please complete your gameplay requirement before withdrawing. ₹${remaining} more needs to be played.`
    );
  }

  // 🚫 4. Locked balance check
  if (wallet.lockedBalance && wallet.lockedBalance > 0) {
    throw new ApiError(
      400,
      "Some amount in your wallet is locked. Complete required activity to unlock withdrawal."
    );
  }

  // 🚫 5. Balance check
  if (wallet.balance < amount) {
    throw new ApiError(
      400,
      "Insufficient balance for withdrawal"
    );
  }

  // 🚫 6. Minimum withdrawal check (optional)
  const MIN_WITHDRAW = 100; // you can move this to settings
  if (amount < MIN_WITHDRAW) {
    throw new ApiError(
      400,
      `Minimum withdrawal amount is ₹${MIN_WITHDRAW}`
    );
  }

  // 🚫 7. Prevent suspicious quick withdrawal (optional anti-fraud)
  const lastDeposit = await Deposit.findOne({ customerId })
    .sort({ createdAt: -1 });

  if (lastDeposit) {
    const diffMinutes =
      (Date.now() - new Date(lastDeposit.createdAt)) / (1000 * 60);

    if (diffMinutes < 5) {
      throw new ApiError(
        400,
        "Withdrawal is temporarily restricted. Please wait a few minutes after deposit."
      );
    }
  }

  // ✅ Create withdrawal request
  const withdraw = await Withdrawal.create({
    customerId,
    amount,
    method,
    accountDetails,
    status: "pending"
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