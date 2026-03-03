const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true
    },

    otp: {
      type: String,
      required: true
    },

    purpose: {
      type: String,
      enum: ["login", "register", "reset-mpin"],
      required: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // auto delete
    },

    isUsed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);