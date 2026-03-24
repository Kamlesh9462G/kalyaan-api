const mongoose = require("mongoose");

const customerSessionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    deviceId: {
      type: String,          // unique per device (UUID)
      required: true
    },

    deviceInfo: {
      platform: String,      // android / ios
      model: String,
      osVersion: String
    },

    refreshToken: {
      type: String,
      required: true,
      index: true
    },

    lastUsedAt: {
      type: Date,
      default: Date.now
    },

    isActive: {
      type: Boolean,
      default: true
    },
    loggedOutAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

customerSessionSchema.index(
  { customerId: 1, deviceId: 1 },
  { unique: true }
);

module.exports = mongoose.model("CustomerSession", customerSessionSchema);