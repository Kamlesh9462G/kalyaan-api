const mongoose = require("mongoose");
const BetType = require("./BetType.model");

const sessionSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false
    },

    payout: {
      amount: {
        type: Number,
        required: true
      },
      multiplier: {
        type: Number,
        default: 10
      }
    }
  },
  { _id: false }
);

const marketBetTypeSchema = new mongoose.Schema(
  {
    // RELATIONS
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      required: true,
      index: true
    },

    betTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BetType",
      required: true,
      index: true
    },

    // 🔥 OPTIONAL SESSION CONFIG
    sessions: {
      type: {
        open: sessionSchema,
        close: sessionSchema
      },
      default: null
    },

    // 🔥 DEFAULT PAYOUT (when no session OR override)
    defaultPayout: {
      amount: {
        type: Number,
      },
      multiplier: {
        type: Number,
      }
    },

    // STATE
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    // SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    removedAt: {
      type: Date,
      default: null
    },

    // AUDIT
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* UNIQUE */
marketBetTypeSchema.index(
  { marketId: 1, betTypeId: 1, isDeleted: 1 },
  { unique: true }
);

/* 🔥 SMART VALIDATION */
marketBetTypeSchema.pre("save", async function (next) {
  try {
    const betType = await BetType.findById(this.betTypeId);

    if (!betType) {
      throw new Error("Invalid BetType");
    }

    const supported = betType.supportedSessions || [];

    // ❌ NO SESSION SUPPORTED (JODI / SANGAM)
    if (supported.length === 0) {
      this.sessions = null;
      return next();
    }

    // ✅ SESSION REQUIRED
    const openEnabled = this.sessions?.open?.enabled;
    const closeEnabled = this.sessions?.close?.enabled;

    if (!openEnabled && !closeEnabled) {
      throw new Error("At least one session (open or close) must be enabled");
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* METHODS */
marketBetTypeSchema.methods.softRemove = function () {
  this.isDeleted = true;
  this.removedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/* VIRTUAL */
marketBetTypeSchema.virtual("isTradable").get(function () {
  return this.status === "active" && !this.isDeleted;
});

module.exports = mongoose.model("MarketBetType", marketBetTypeSchema);