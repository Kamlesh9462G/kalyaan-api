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

  // 🔄 TRANSACTION TYPE
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

  // 📊 BALANCE SNAPSHOT
  balanceBefore: {
    type: Number,
    required: true
  },

  balanceAfter: {
    type: Number,
    required: true
  },

  // 🔗 REFERENCE
  referenceType: {
    type: String,
    enum: ["betSlip", "betItem", "deposit", "withdraw", "manual"],
    default: null
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  // 🧾 STATUS
  status: {
    type: String,
    enum: ["success", "failed", "pending", "reversed"],
    default: "success",
    index: true
  },

  // 🔐 UNIQUE TXN ID
  txnId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  // 💳 PAYMENT INFORMATION
  meta: {
    paymentMethod: {
      type: String,
      enum: [
        "upi",
        "bank_transfer",
        "card",
        "netbanking",
        "wallet",
        "cash",
        "manual"
      ]
    },

    // deposit info
    depositInfo: {
      upiId: String,
      gateway: String, // razorpay / phonepe / paytm
      gatewayTxnId: String
    },

    // withdraw info
    withdrawInfo: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String
    },

    // admin info
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    note: String,

    ip: String
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

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);