// models/withdraw.model.js
const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 100
    },

    method: {
      type: String,
      enum: ["upi", "bank"],
      required: true
    },

    accountDetails: {
      upiId: String,
      bankName: String,
      accountNumber: String,
      ifsc: String
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "paid"],
      default: "requested",
      index: true
    },

    // ✅ who processed
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    // ✅ payment reference
    referenceId: {
      type: String,
      default: null
    },


    adminRemark: {
      type: String,
      default: null
    },

    processedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdraw", withdrawSchema);