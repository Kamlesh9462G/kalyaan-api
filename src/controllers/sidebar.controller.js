
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

    let filterQuery = {};

    filterQuery.isEnabled = true;
    filterQuery.name = "APP";

    const data = await sidebarService.getSidebars(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "sidebars fetched successfully",
        data: data
    });
})

const getAPPSidebars = catchAsync(async (req, res) => {

    let filterQuery = {};

    filterQuery.isEnabled = true;
    filterQuery.name = "APP";

    const data = await sidebarService.getSidebars(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "sidebars fetched successfully",
        data: data
    });
})

module.exports = {
    addSidebar,
    getSidebars,
    getAPPSidebars
}