const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    referredUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        unique: true // one referral per user
    },

    status: {
        type: String,
        enum: ["PENDING", "QUALIFIED", "REWARDED", "REJECTED"],
        default: "PENDING",
        index: true
    },

    totalDeposit: {
        type: Number,
        default: 0
    },

    requiredDeposit: {
        type: Number,
        default: 500
    },

    wagerCompleted: {
        type: Boolean,
        default: false
    },

    rewardAmount: {
        type: Number,
        default: 100
    },

    rewardedAt: Date,
    rejectedReason: String

}, { timestamps: true });

module.exports = mongoose.model("Referral", referralSchema);