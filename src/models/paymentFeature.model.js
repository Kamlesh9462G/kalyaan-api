const mongoose = require("mongoose");

const paymentFeatureSchema = new mongoose.Schema({

  bankAccount: {
    enabled: { type: Boolean, default: true }
  },

  upiAccount: {
    enabled: { type: Boolean, default: true }
  },

  deposit: {
    enabled: { type: Boolean, default: true }
  },

  withdraw: {
    enabled: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "PaymentFeatureFlags",
  paymentFeatureSchema
);