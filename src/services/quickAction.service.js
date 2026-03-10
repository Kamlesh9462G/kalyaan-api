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
module.exports = {
    addQuickAction,
    getQuickActions
}