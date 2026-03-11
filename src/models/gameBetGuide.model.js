const mongoose = require("mongoose");

const gameBetGuideSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        icon: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        example: {
            type: String,
            required: true
        },

        multiplier: {
            type: String,
            required: true
        },

        order: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("GameBetGuide", gameBetGuideSchema);