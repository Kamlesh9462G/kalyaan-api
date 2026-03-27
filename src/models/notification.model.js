const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        // 🔹 Notification Content
        title: {
            type: String,
            required: true,
        },

        body: {
            type: String,
            required: true,
        },

        // 🔹 Type (business logic)
        type: {
            type: String,
            enum: [
                "DEPOSIT_SUCCESS",
                "DEPOSIT_FAILED",
                "WITHDRAW_REQUESTED",
                "WITHDRAW_APPROVED",
                "WITHDRAW_REJECTED",

                "BET_PLACED",
                "BET_WON",
                "BET_LOST",
                "RESULT_DECLARED",

                "BANK_ADDED",
                "UPI_ADDED",
                "ACCOUNT_VERIFIED"
            ],
            required: true,
            index: true,
        },

        // 🔹 Category
        category: {
            type: String,
            enum: ["transactional", "betting", "account", "system"],
            default: "system",
        },

        // 🔹 Channels
        channels: [
            {
                type: String,
                enum: ["push", "in_app"],
            },
        ],

        // 🔹 Dynamic Data (IMPORTANT)
        data: {
            type: Object,
            default: {},
            /*
              Example:
              {
                amount: 500,
                betId: "123",
                transactionId: "txn_123",
                status: "success"
              }
            */
        },

        // 🔹 Status
        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
            index: true,
        },

        // 🔹 Push specific
        pushStatus: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
        },

        // 🔹 In-App Tracking
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: Date,

        // 🔹 Scheduling
        scheduledAt: Date,
        sentAt: Date,

        // 🔹 Retry system
        retryCount: {
            type: Number,
            default: 0,
        },

        // 🔹 Soft delete (optional)
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);