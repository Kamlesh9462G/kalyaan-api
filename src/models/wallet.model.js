// models/wallet.model.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    lockedBalance: {
      type: Number,
      default: 0
      // future use: disputes / pending bets
    },

    status: {
      type: String,
      enum: ["active", "blocked", "suspended"],
      default: "active",
      index: true
    },

    lastTransactionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Wallet", walletSchema);