const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    // 🔹 OWNER
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    // 🔹 DEVICE IDENTIFIER
    deviceId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 PLATFORM
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true
    },

    // 🔹 DEVICE INFO
    deviceName: String, // Samsung A12 / iPhone 13
    brand: String,      // Samsung / Apple
    model: String,
    osVersion: String,  // Android 13 / iOS 17
    appVersion: String,

    // 🔹 UNIQUE DEVICE FINGERPRINT (optional but powerful)
    deviceFingerprint: {
      type: String,
      index: true
    },

    // 🔹 FCM TOKENS (MULTIPLE SUPPORT)
    fcmTokens: [fcmTokenSchema],

    // 🔹 NETWORK INFO
    ipAddress: String,

    // 🔹 SESSION TRACKING
    lastLoginAt: {
      type: Date,
      default: Date.now
    },
    lastLogoutAt: Date,

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

    blockedReason: String,

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

// // 🚫 Block Device
// deviceSchema.methods.blockDevice = function (reason) {
//   this.isBlocked = true;
//   this.isActive = false;
//   this.blockedReason = reason;
//   return this.save();
// };

// // ✅ Add / Update FCM Token
// deviceSchema.methods.addFcmToken = function (token, platform) {
//   const existing = this.fcmTokens.find(t => t.token === token);

//   if (existing) {
//     existing.isActive = true;
//     existing.lastUsedAt = new Date();
//   } else {
//     this.fcmTokens.push({
//       token,
//       platform
//     });
//   }

//   return this.save();
// };

// // ❌ Remove FCM Token (logout / uninstall)
// deviceSchema.methods.removeFcmToken = function (token) {
//   this.fcmTokens = this.fcmTokens.map(t => {
//     if (t.token === token) {
//       t.isActive = false;
//     }
//     return t;
//   });

//   return this.save();
// };

module.exports = mongoose.model("Device", deviceSchema);