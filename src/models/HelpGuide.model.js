const mongoose = require("mongoose");

const quickGuideSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
}, { _id: true });

const supportHoursSchema = new mongoose.Schema({
    day: { type: String, required: true }, // Monday, Tuesday...
    openTime: { type: String }, // "09:00 AM"
    closeTime: { type: String }, // "06:00 PM"
    isClosed: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false }
}, { _id: true });

const helpGuideSchema = new mongoose.Schema({
    emailSupport: {
        email: String,
        isHidden: { type: Boolean, default: false }
    },

    phoneSupport: {
        phone: String,
        isHidden: { type: Boolean, default: false }
    },

    whatsappSupport: {
        number: String,
        isHidden: { type: Boolean, default: false }
    },

    website: {
        url: String,
        isHidden: { type: Boolean, default: false }
    },

    responseTime: {
        email: String,       // "< 1 hour"
        phone: String,       // "Immediate"
        whatsapp: String,    // "< 30 min"
        isHidden: { type: Boolean, default: false }
    },

    supportHours: [supportHoursSchema],

    quickGuides: [quickGuideSchema],

    isHidden: { type: Boolean, default: false } // whole section
}, { timestamps: true });

module.exports = mongoose.model("HelpGuide", helpGuideSchema);