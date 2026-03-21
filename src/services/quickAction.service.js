const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { QuickAction } = require('../models/index');


const addQuickAction = async (quickActionData) => {
    try {
        return await QuickAction.create(quickActionData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getQuickActions = async () => {
    try {
        return await QuickAction.find()
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const updateQuickAction = async (id, updateData) => {
    const quickAction = await QuickAction.findByIdAndUpdate(id, updateData, { new: true });

    if (!quickAction) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Quick action not found");
    }

    return quickAction;
}
const deleteQuickAction = async (id) => {
    const quickAction = await QuickAction.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!quickAction) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Quick action not found");
    }

    return quickAction;
}

module.exports = {
    addQuickAction,
    getQuickActions,
    updateQuickAction,
    deleteQuickAction
}