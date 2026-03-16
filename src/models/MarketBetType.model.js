const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false
    },

    payout: {
      amount: {
        type: Number,       // 9 (means 10 ka 90)
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
    // 🔹 RELATIONS
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

    // 🔹 SESSION CONFIG
    sessions: {
      open: sessionSchema,
      close: sessionSchema
    },

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
      default: false,
      index: true
    },

    removedAt: {
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

/* 🔐 UNIQUE */
marketBetTypeSchema.index(
  { marketId: 1, betTypeId: 1, isDeleted: 1 },
  { unique: true }
);

/* 🔐 VALIDATION */
marketBetTypeSchema.pre("save", async function () {
  const openEnabled = this.sessions?.open?.enabled;
  const closeEnabled = this.sessions?.close?.enabled;

  if (!openEnabled && !closeEnabled) {
    throw new Error("At least one session (open or close) must be enabled");
  }
});

/* 🔐 METHODS */
marketBetTypeSchema.methods.softRemove = function () {
  this.isDeleted = true;
  this.removedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/* 🔐 VIRTUAL */
marketBetTypeSchema.virtual("isTradable").get(function () {
  return this.status === "active" && !this.isDeleted;
});

module.exports = mongoose.model("MarketBetType", marketBetTypeSchema);