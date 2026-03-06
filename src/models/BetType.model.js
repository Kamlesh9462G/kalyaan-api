const mongoose = require("mongoose");

const betTypeSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true       // SINGLE, JODI, PANEL
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },

    description: {
      type: String,
      default: ""
    },

    // 🔹 DIGIT CONFIG
    digitLength: {
      type: Number,
      required: true,   // 1, 2, 3
      min: 1,
      max: 4
    },

    digitRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 9 }
    },

    // 🔹 SESSION SUPPORT
    supportedSessions: {
      type: [String],
      enum: ["open", "close"],
      default: ["open", "close"]
    },

    // 🔹 PAYOUT CONFIG
    payout: {
      amount: {
        type: Number,
        required: true    // e.g. 9 (means 10 ka 90 handled at market level)
      },
      multiplier: {
        type: Number,
        default: 10
      }
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

    deletedAt: {
      type: Date,
      default: null
    },

    // 🔹 AUDIT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔐 INDEXES */
betTypeSchema.index({ code: 1, isDeleted: 1 });
betTypeSchema.index({ status: 1, isDeleted: 1 });

/* 🔐 PRE SAVE */
betTypeSchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }

  if (this.digitRange.min > this.digitRange.max) {
    throw new Error("Invalid digit range");
  }

  if (
    this.allowedDigits.length &&
    this.allowedDigits.some(
      d => Number(d) < this.digitRange.min || Number(d) > this.digitRange.max
    )
  ) {
    throw new Error("Allowed digits out of range");
  }
});

/* 🔐 METHODS */
betTypeSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/* 🔐 VIRTUALS */
betTypeSchema.virtual("displayRate").get(function () {
  return `10 ka ${this.payout.amount * this.payout.multiplier}`;
});

module.exports = mongoose.model("BetType", betTypeSchema);