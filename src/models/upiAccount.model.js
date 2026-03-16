// models/customerUpiAccount.model.js
const mongoose = require("mongoose");

const customerUpiAccountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    upiId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // 🔐 CONTROL FLAGS
    isPrimary: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // 🛡️ ADMIN AUDIT
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔥 INDEXES */
customerUpiAccountSchema.index(
  { customerId: 1, upiId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CustomerUpiAccount",
  customerUpiAccountSchema
);