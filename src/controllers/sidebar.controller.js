
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sidebarService } = require('../services/index');

const addSidebar = catchAsync(async (req, res) => {

    const data = await sidebarService.addSidebar(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "sidebar added successfully",
        data: data
    });
})

const getSidebars = catchAsync(async (req, res) => {

    const data = await sidebarService.getSidebars();

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "sidebars fetched successfully",
        data: data
    });
})

module.exports = {
    addSidebar,
    getSidebars
}