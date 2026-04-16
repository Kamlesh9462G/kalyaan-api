const mongoose = require('mongoose');

const HeroBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    subtitle: {
        type: String
    },

    imageUrl: {
        type: String,
        required: true
    },

    redirectType: {
        type: String,
        enum: ['none', 'internal', 'external', 'app'],
        default: 'none'
    },

    redirectValue: {
        type: String // URL / route / deep link
    },

    buttonText: {
        type: String
    },

    platforms: [{
        type: String,
        enum: ['web', 'android', 'ios']
    }],

    priority: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model('HeroBanner', HeroBannerSchema);