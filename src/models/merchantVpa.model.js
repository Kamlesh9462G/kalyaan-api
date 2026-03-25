const mongoose = require("mongoose");

const merchantVpaSchema = new mongoose.Schema(
    {
        vpaId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        merchantName: {
            type: String,
            required: true,
            trim: true,
        },

        displayName: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
            default: "ACTIVE",
            index: true,
        },

        priority: {
            type: Number,
            default: 1, // lower = higher priority
        },

        limits: {
            minAmount: {
                type: Number,
                default: 100,
            },
            maxAmount: {
                type: Number,
                default: 50000,
            },
            dailyLimit: {
                type: Number,
                default: 100000,
            },
            monthlyLimit: {
                type: Number,
                default: 1000000,
            },
        },

        usage: {
            todayAmount: {
                type: Number,
                default: 0,
            },
            todayCount: {
                type: Number,
                default: 0,
            },
            monthAmount: {
                type: Number,
                default: 0,
            },
            monthCount: {
                type: Number,
                default: 0,
            },
            lastResetAt: Date,
        },

        isBusy: {
            type: Boolean,
            default: false,
        },

        provider: {
            type: String,
            trim: true,
        },

        bankName: {
            type: String,
            trim: true,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        blockedReason: {
            type: String,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("MerchantVpa", merchantVpaSchema);