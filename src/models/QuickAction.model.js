const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    icon: {
        type: String
    },

    screen: {
        type: String
    },

    color: {
        type: String
    },

    bg: {
        type: String
    },

    isHidden: {
        type: Boolean,
        default: false
    },

    displayOrder: {
        type: Number,
        default: 0
    }

}, { _id: true });


const quickActionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    isEnabled: {
        type: Boolean,
        default: true
    },

    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    actions: [actionSchema]

}, {
    timestamps: true
});


module.exports = mongoose.model(
    "quickAction",
    quickActionSchema
);