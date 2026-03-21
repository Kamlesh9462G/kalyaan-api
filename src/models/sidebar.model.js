const mongoose = require("mongoose");

const sidebarItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    icon: String,

    screen: String,

    badge: {
        type: String,
        default: null
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

const sidebarSchema = new mongoose.Schema({

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

    menus: [sidebarItemSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model("SidebarConfig", sidebarSchema);