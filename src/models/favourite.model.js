const mongoose = require("mongoose");

const favouriteNumberSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["OPEN_PANNA", "CLOSE_PANNA", "OPEN_DIGIT", "CLOSE_DIGIT"],
            required: true,
        },
        value: {
            type: String, // keep string because panna can be 3-digit like "123"
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const favouriteSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true,
        },

        marketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Market",
            required: true,
            index: true,
        },

        date: {
            type: Date,
            required: true,
            index: true,
        },

        numbers: {
            type: [favouriteNumberSchema],
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: "At least one favourite number is required",
            },
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// 🔒 Prevent duplicate favorites for same user + market + date
favouriteSchema.index(
    { customerId: 1, marketId: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model("Favourite", favouriteSchema);