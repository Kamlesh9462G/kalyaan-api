const mongoose = require("mongoose");

const betRateSchema = new mongoose.Schema(
  {
    // 🔹 GAME TYPE (MATKA / STARLINE / FUTURE)
    gameType: {
      type: String,
      enum: ["matka", "starline"],
      default: "matka",
      index: true
    },

    // 🔹 BET TYPE
    betTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BetType",
      required: true,
      index: true
    },

    // 🔹 SESSION (some games only open)
    session: {
      type: String,
      enum: ["open", "close", "both"],
      default: "both"
    },

    description: {
      type: String,
      default: null
    },

    // 🔹 RATE CONFIG
    rate: {
      type: Number,
      required: true
    },

    baseAmount: {
      type: Number,
      default: 10
    },

    payoutAmount: {
      type: Number,
      required: true
    },

    // Example:
    // baseAmount = 10
    // payoutAmount = 90

    // 🔹 STATE
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    // 🔹 SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    },

    // 🔹 AUDIT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔐 INDEXES */
betRateSchema.index({ marketId: 1, betTypeId: 1, session: 1 });
betRateSchema.index({ betTypeId: 1, gameType: 1 });

/* 🔐 METHOD */
betRateSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/* 🔐 VIRTUAL */
betRateSchema.virtual("displayRate").get(function () {
  return `${this.baseAmount} ka ${this.payoutAmount}`;
});

module.exports = mongoose.model("BetRate", betRateSchema);