const mongoose = require("mongoose");

const guideStepSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
});

const guideSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    icon: {
        type: String,
        required: true
    },

    steps: [guideStepSchema],

    order: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("GuideSection", guideSectionSchema);