const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      required: true,
      index: true
    },

    date: {
      type: String, // "2026-03-05"
      required: true,
      index: true
    },

    openPanna: {
      type: String, // "120"
      default: null
    },

    openDigit: {
      type: String, // "3"
      default: null
    },

    closePanna: {
      type: String, // "157"
      default: null
    },
    closeDigit: {
      type: String, // "3"
      default: null
    },
    status: {
      type: String,
      enum: ["pending", "open_declared", "close_declared", "completed"],
      default: "pending"
    },

    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// one result per market per day
resultSchema.index({ marketId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);