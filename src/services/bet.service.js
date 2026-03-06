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
  console.log("Placing bet for customer:", customerId, "with payload:", payload);

    
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { marketId, marketBetTypeId, session: betSession, bets } = payload;

    console.log("Market ID:", marketId);
    console.log("Market Bet Type ID:", marketBetTypeId);
    console.log("Bet Session:", betSession);
    console.log("Bets:", bets);
    if (!bets || !bets.length) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "No bets provided");
    }

    // 1️⃣ Validate Market
    const market = await Market.findById(marketId);

    if (!market || market.isDeleted || market.status !== "active") {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Market not active");
    }

    // 2️⃣ Validate MarketBetType
    const marketBetType = await MarketBetType
      .findOne({
        _id: marketBetTypeId,
        marketId,
      })
      .populate("betTypeId");

    if (!marketBetType) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid market bet type");
    }

    const betType = marketBetType.betTypeId;

    // 3️⃣ Validate Session
    if (!marketBetType.sessions[betSession]?.enabled) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Session disabled");
    }

    // // 4️⃣ Fetch Bet Rate
    // const rateDoc = await BetRate.findOne({
    //   marketId,
    //   betTypeId: betType._id
    // });

    // if (!rateDoc) {
    //   throw new ApiError(httpStatus.status.BAD_REQUEST, "Bet rate not configured");
    // }

    // const rate = rateDoc[betSession]?.payout;

    // if (!rate) {
    //   throw new ApiError(httpStatus.status.BAD_REQUEST, "Rate not configured for session");
    // }

    let rate = 10;

    // 5️⃣ Validate Digits
    let totalAmount = 0;

    bets.forEach(b => {

      if (!b.digit) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Digit required");
      }

      if (b.digit.length !== betType.digitLength) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid digit ${b.digit}`);
      }

      if (b.amount <= 0) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid bet amount");
      }

      totalAmount += b.amount;

    });

    // 6️⃣ Wallet Check
    const wallet = await Wallet
      .findOne({ customerId })
      .session(session);

    if (!wallet || wallet.balance < totalAmount) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Insufficient wallet balance");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - totalAmount;

    wallet.balance = balanceAfter;
    await wallet.save({ session });

    // 7️⃣ Create BetSlip
    const betSlip = await BetSlip.create(
      [{
        customerId,
        marketId,
        marketBetTypeId,
        session: betSession,
        totalAmount,
        status: "placed"
      }],
      { session }
    );

    const slipId = betSlip[0]._id;

    // 8️⃣ Create BetItems
    const betItems = bets.map(b => ({
      customerId,
      betSlipId: slipId,
      marketBetTypeId,
      digit: b.digit,
      amount: b.amount,
      rate,
      potentialWin: b.amount * rate
    }));

    const insertedItems = await BetItem.insertMany(betItems, { session });

    // 9️⃣ Wallet Transactions (per item)
    const walletTxns = insertedItems.map(item => ({
      customerId,
      walletId: wallet._id,
      type: "debit",
      reason: "bet_placed",
      amount: item.amount,
      balanceBefore,
      balanceAfter,
      referenceType: "betItem",
      referenceId: item._id
    }));

    await WalletTransaction.insertMany(walletTxns, { session });

    await session.commitTransaction();
    session.endSession();

    return {
      betSlipId: slipId,
      totalAmount,
      totalBets: bets.length,
      walletBalance: balanceAfter
    };

  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    throw error;

  }
};

module.exports = {
  placeBet
};