const mongoose = require("mongoose");

const betItemSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },

  betSlipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BetSlip",
    required: true
  },

  marketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Market",
    required: true,
    index: true
  },

  betTypeCode: {
    type: String,
    required: true,
    index: true
  },

  session: {
    type: String,
    enum: ["open", "close", null],
    default: null
  },

  // 🔥 NORMAL DIGIT (for simple bets)
  digit: {
    type: String,
    default: null
  },

  // 🔥 SANGAM STRUCTURE
  openDigit: {
    type: String,
    default: null
  },

  closeDigit: {
    type: String,
    default: null
  },

  openPanna: {
    type: String,
    default: null
  },

  closePanna: {
    type: String,
    default: null
  },

  // 🔥 TYPE OF SANGAM ENTRY
  sangamType: {
    type: String,
    enum: ["openDigit_closePanna", "openPanna_closeDigit", "full"],
    default: null
  },

  amount: {
    type: Number,
    required: true
  },

  payout: {
    amount: Number,
    multiplier: Number
  },

  possibleWinAmount: Number,

  winAmount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["pending", "won", "lost", "cancelled"],
    default: "pending",
    index: true
  },

  resultDeclaredAt: Date

}, { timestamps: true });

/* 🔐 INDEX */
betItemSchema.index({ marketId: 1, session: 1, status: 1 });

/* 🔐 PRE SAVE */
betItemSchema.pre("save", async function () {
  if (!this.possibleWinAmount) {
    this.possibleWinAmount =
      (this.amount / 10) *
      this.payout.amount *
      this.payout.multiplier;
  }
});

module.exports = mongoose.model("BetItem", betItemSchema);
