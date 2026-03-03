const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    // 🔹 OWNER
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    // 🔹 DEVICE ID (UUID FROM APP)
    deviceId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 DEVICE INFO
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true
    },

    deviceName: {
      type: String // Samsung A12, iPhone 13
    },

    osVersion: {
      type: String // Android 13, iOS 17
    },

    appVersion: {
      type: String
    },

    // 🔹 NETWORK INFO
    ipAddress: {
      type: String
    },

    lastLoginAt: {
      type: Date,
      default: Date.now
    },

    // 🔹 SECURITY FLAGS
    isTrusted: {
      type: Boolean,
      default: true
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },

    blockedReason: {
      type: String
    },

    // 🔹 STATUS
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔐 UNIQUE DEVICE PER CUSTOMER */
deviceSchema.index(
  { customerId: 1, deviceId: 1 },
  { unique: true }
);

/* 🔐 METHODS */
deviceSchema.methods.blockDevice = function (reason) {
  this.isBlocked = true;
  this.isActive = false;
  this.blockedReason = reason;
  return this.save();
};

module.exports = mongoose.model("Device", deviceSchema);