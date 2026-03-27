const pushLogSchema = new mongoose.Schema(
    {
        notificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification",
            index: true,
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        deviceToken: String,

        status: {
            type: String,
            enum: ["sent", "failed"],
        },

        error: String,

        response: Object,

        sentAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("PushLog", pushLogSchema);