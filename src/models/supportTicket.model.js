const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    category: {
        type: String,
        enum: [
            "general",
            "technical",
            "withdrawal",
            "deposit",
            "game",
            "account",
            "feedback",
            "other"
        ],
        required: true
    },

    subject: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    attachments: [
        {
            fileUrl: String,
            fileName: String
        }
    ],

    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open",
        index: true
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },

    closedAt: {
        type: Date
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);