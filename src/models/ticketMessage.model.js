const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema({

    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupportTicket",
        required: true,
        index: true
    },

    senderType: {
        type: String,
        enum: ["user", "admin"],
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    attachments: [
        {
            fileUrl: String,
            fileName: String
        }
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model("TicketMessage", ticketMessageSchema);