const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },

    redirectType: {
        type: String,
        enum: ['none', 'internal', 'external'],
        default: 'none'
    },

    redirectValue: {
        type: String
    },

    buttonText: {
        type: String
    },

    isDismissible: {
        type: Boolean,
        default: true
    },

    platforms: [{
        type: String,
        enum: ['web', 'android', 'ios']
    }],

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);