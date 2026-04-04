const mongoose = require("mongoose");

const quickGuideSchema = new mongoose.Schema({
    question: String,
    answer: String,
    icon: String, // ✅ added
    isHidden: { type: Boolean, default: false }
}, { _id: true });

const supportHoursSchema = new mongoose.Schema({
    day: String,
    openTime: String,
    closeTime: String,
    isClosed: { type: Boolean, default: false },
    icon: String, // ✅ optional (calendar icon etc)
    isHidden: { type: Boolean, default: false }
}, { _id: true });

const helpGuideSchema = new mongoose.Schema({
    emailSupport: {
        email: String,
        icon: String, // ✅ added
        isHidden: { type: Boolean, default: false }
    },

    phoneSupport: {
        phone: String,
        icon: String,
        isHidden: { type: Boolean, default: false }
    },

    whatsappSupport: {
        number: String,
        icon: String,
        isHidden: { type: Boolean, default: false }
    },

    website: {
        url: String,
        icon: String,
        isHidden: { type: Boolean, default: false }
    },

    responseTime: {
        email: String,
        phone: String,
        whatsapp: String,
        icon: String, // ✅ global icon
        isHidden: { type: Boolean, default: false }
    },

    supportHours: [supportHoursSchema],
    quickGuides: [quickGuideSchema],

    icon: String, // ✅ whole section icon
    isHidden: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("HelpGuide", helpGuideSchema);