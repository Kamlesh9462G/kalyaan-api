const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");

const { helpGuideService } = require("../../services/index");

// CREATE
exports.createHelpGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.createHelpGuide(req.body);

    return res.status(httpStatus.status.CREATED).send({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Help & Guide created successfully",
        data: data
    });
});

// GET
exports.getHelpGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.getHelpGuide();

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Help & Guide fetched successfully",
        data: data
    });
});

// UPDATE
exports.updateHelpGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.updateHelpGuide(req.params.id, req.body);

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Help & Guide updated successfully",
        data: data
    });
});

// DELETE
exports.deleteHelpGuide = catchAsync(async (req, res) => {
    await helpGuideService.deleteHelpGuide(req.params.id);

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Help & Guide deleted successfully",
        data: null
    });
});

// ADD QUICK GUIDE
exports.addQuickGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.addQuickGuide(req.params.id, req.body);

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick guide added successfully",
        data: data
    });
});

// UPDATE QUICK GUIDE
exports.updateQuickGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.updateQuickGuide(
        req.params.id,
        req.params.qId,
        req.body
    );

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick guide updated successfully",
        data: data
    });
});

// DELETE QUICK GUIDE
exports.deleteQuickGuide = catchAsync(async (req, res) => {
    const data = await helpGuideService.deleteQuickGuide(
        req.params.id,
        req.params.qId
    );

    return res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Quick guide deleted successfully",
        data: data
    });
});