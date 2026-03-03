// models/deposit.model.js
const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 10
    },

    method: {
      type: String,
      enum: ["upi", "bank", "qr"],
      required: true
    },

    transactionId: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true
    },

    creditedAt: {
      type: Date,
      default: null
    },

    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deposit", depositSchema);