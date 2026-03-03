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
      type: String,    // "2026-03-01"
      required: true,
      index: true
    },

    session: {
      type: String,
      enum: ["open", "close"],
      required: true
    },

    resultDigit: {
      type: String,    // "5", "23", "456"
      required: true
    },

    isDeclared: {
      type: Boolean,
      default: true
    },

    declaredAt: {
      type: Date,
      default: Date.now
    },

    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔐 UNIQUE RESULT PER MARKET + DATE + SESSION */
resultSchema.index(
  { marketId: 1, date: 1, session: 1 },
  { unique: true }
);

module.exports = mongoose.model("Result", resultSchema);