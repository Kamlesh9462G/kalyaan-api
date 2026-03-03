// models/betSlip.model.js
const mongoose = require("mongoose");

const betSlipSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      required: true
    },

    betTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BetType",
      required: true
    },

    session: {
      type: String,
      enum: ["open", "close"],
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["placed", "won", "lost", "cancelled"],
      default: "placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BetSlip", betSlipSchema);