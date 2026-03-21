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
const updateSidebar = async (id, updateData) => {
    const sidebar = await Sidebar.findByIdAndUpdate(id, updateData, { new: true });

    if (!sidebar) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Sidebar  not found");
    }
    return sidebar;
}
const deleteSidebar = async (id) => {
    const sidebar = await Sidebar.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!sidebar) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Sidebar  not found");
    }

    return sidebar;
}
module.exports = {
    addSidebar,
    getSidebars,
    updateSidebar,
    deleteSidebar
}