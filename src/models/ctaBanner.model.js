const mongoose = require('mongoose');

const CTABannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    imageUrl: {
        type: String
    },

    redirectType: {
        type: String,
        enum: ['none', 'internal', 'external', 'app'],
        default: 'none'
    },

    redirectValue: {
        type: String
    },

    buttonText: {
        type: String
    },

    position: {
        type: String,
        enum: ['top', 'bottom', 'popup'],
        default: 'bottom'
    },

    frequency: {
        type: String,
        enum: ['once', 'always'],
        default: 'always'
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

module.exports = mongoose.model('CTABanner', CTABannerSchema);