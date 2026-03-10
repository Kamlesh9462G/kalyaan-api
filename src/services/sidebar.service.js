const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Sidebar } = require('../models/index');


const addSidebar = async (sidebarData) => {
    try {
        return await Sidebar.create(sidebarData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getSidebars = async () => {
    try {
        return await Sidebar.find()
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
module.exports = {
    addSidebar,
    getSidebars
}