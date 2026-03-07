const mongoose = require("mongoose");

const betItemSchema = new mongoose.Schema(
  {
    // 🔹 USER
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

    // 🔹 BET DATA
    digit: {
      type: String,   // "5", "12", "123"
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 10
    },

    // 🔹 SNAPSHOT (VERY IMPORTANT)
    payout: {
      amount: Number,      // 9
      multiplier: Number   // 10
    },

    possibleWinAmount: {
      type: Number
    },
    winAmount: {
      type: Number,
      default: 0
    },


    // 🔹 RESULT
    status: {
      type: String,
      enum: ["pending", "won", "lost", "cancelled"],
      default: "pending",
      index: true
    },

    resultDeclaredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

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
