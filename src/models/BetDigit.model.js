const mongoose = require("mongoose");

const betDigitSchema = new mongoose.Schema(
    {
        betTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BetType",
            required: true,
            index: true
        },

        digit: {
            type: String,
            required: true,
            trim: true
        },

        // optional grouping
        group: {
            type: String,
            default: null
        },

        // digit state
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        // admin block support
        isBlocked: {
            type: Boolean,
            default: false
        },

        blockedReason: {
            type: String,
            default: null
        },

        // exposure control (advanced feature)
        maxBetAmount: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/* INDEXES */

betDigitSchema.index(
    { betTypeId: 1, digit: 1 },
    { unique: true }
);

module.exports = mongoose.model("BetDigit", betDigitSchema);