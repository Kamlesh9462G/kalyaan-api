// models/walletTransaction.model.js
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    // 🔗 OWNER
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true
    },

    // 🔄 TRANSACTION NATURE
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
      index: true
    },

    // 🎯 BUSINESS REASON
    reason: {
      type: String,
      enum: [
        "bet_placed",
        "bet_won",
        "bet_lost",
        "bet_refund",
        "deposit",
        "withdraw",
        "admin_credit",
        "admin_debit"
      ],
      required: true,
      index: true
    },

    // 💰 AMOUNT
    amount: {
      type: Number,
      required: true,
      min: 1
    },

    // 📊 BALANCE SNAPSHOT (AUDIT SAFE)
    balanceBefore: {
      type: Number,
      required: true
    },

    balanceAfter: {
      type: Number,
      required: true
    },

    // 🔗 REFERENCE (TRACEABILITY)
    referenceType: {
      type: String,
      enum: [
        "betSlip",
        "betItem",
        "deposit",
        "withdraw",
        "manual"
      ],
      default: null
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // index: true
    },

    // 🧾 TRANSACTION STATUS (FOR ASYNC FLOWS)
    status: {
      type: String,
      enum: ["success", "failed", "reversed"],
      default: "success",
      index: true
    },

    // 🔐 IDEMPOTENCY / DUPLICATE PROTECTION
    txnId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
      // example: BET_65fa_xxx, DEP_razorpay_xxx
    },

    // 📦 EXTRA INFO (GATEWAY / ADMIN / IP)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔥 IMPORTANT INDEXES */
walletTransactionSchema.index({ customerId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);