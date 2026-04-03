const {HelpGuide} = require("../models/index");

// CREATE
const createHelpGuide = async (data) => {
    return await HelpGuide.create(data);
};

// GET
const getHelpGuide = async () => {
    return await HelpGuide.findOne(); // only one doc expected
};

// UPDATE
const updateHelpGuide = async (id, data) => {
    return await HelpGuide.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteHelpGuide = async (id) => {
    return await HelpGuide.findByIdAndDelete(id);
};

// QUICK GUIDE CRUD
const addQuickGuide = async (id, payload) => {
    return await HelpGuide.findByIdAndUpdate(
        id,
        { $push: { quickGuides: payload } },
        { new: true }
    );
};

const updateQuickGuide = async (id, qId, payload) => {
    return await HelpGuide.findOneAndUpdate(
        { _id: id, "quickGuides._id": qId },
        {
            $set: {
                "quickGuides.$.question": payload.question,
                "quickGuides.$.answer": payload.answer,
                "quickGuides.$.isHidden": payload.isHidden
            }
        },
        { new: true }
    );
};

const deleteQuickGuide = async (id, qId) => {
    return await HelpGuide.findByIdAndUpdate(
        id,
        { $pull: { quickGuides: { _id: qId } } },
        { new: true }
    );
};

module.exports = {
    createHelpGuide,
    getHelpGuide,
    updateHelpGuide,
    deleteHelpGuide,
    addQuickGuide,
    updateQuickGuide,
    deleteQuickGuide
};