// models/customerBankAccount.model.js
const mongoose = require("mongoose");

const customerBankAccountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },

    bankName: {
      type: String,
      required: true,
      trim: true
    },

    accountNumber: {
      type: String,
      required: true
    },

    ifsc: {
      type: String,
      required: true
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
customerBankAccountSchema.index(
  { customerId: 1, accountNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CustomerBankAccount",
  customerBankAccountSchema
);