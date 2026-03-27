const mongoose = require("mongoose");

const referralSettingsSchema = new mongoose.Schema({
    // 🔘 Enable / Disable
    isReferralActive: {
        type: Boolean,
        default: true,
    },

    // 💰 Reward Config
    reward: {
        referrerAmount: { type: Number, default: 100 }, // User A
        referredUserAmount: { type: Number, default: 0 }, // optional
    },

    // 💳 Deposit Condition
    deposit: {
        minAmount: { type: Number, default: 500 },

        triggerType: {
            type: String,
            enum: ["FIRST_DEPOSIT", "TOTAL_DEPOSIT"],
            default: "TOTAL_DEPOSIT",
        },
    },

    // ⏱️ Reward Timing
    rewardProcessing: {
        mode: {
            type: String,
            enum: ["AUTO", "MANUAL"],
            default: "MANUAL",
        },

        delayMinutes: { type: Number, default: 30 },
    },

    // 🔗 Referral Link Settings
    referralLink: {
        baseUrl: {
            type: String,
            default: "https://yourapp.page.link",
        },

        expiryDays: {
            type: Number,
            default: 0, // 0 = no expiry
        },

        codeType: {
            type: String,
            enum: ["AUTO", "CUSTOM"],
            default: "AUTO",
        },
    },

    // 🔁 Limits
    limits: {
        maxReferralsPerUser: {
            type: Number,
            default: 0, // 0 = unlimited
        },
    },

    // 🔐 Fraud Controls
    fraudControl: {
        blockSameDevice: { type: Boolean, default: true },
        blockSameIP: { type: Boolean, default: false },
        blockSameUPI: { type: Boolean, default: true },
        requireKYC: { type: Boolean, default: false },
    },

    // 🔙 Reward Safety
    safety: {
        allowRewardReversal: { type: Boolean, default: true },
    },

    // 📢 Marketing
    campaign: {
        name: { type: String, default: "Default Campaign" },

        messageTemplate: {
            type: String,
            default: "Join & earn ₹{amount}! Use my code {code}",
        },
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model("ReferralSettings", referralSettingsSchema);