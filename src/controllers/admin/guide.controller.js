const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { guideService } = require("../../services/index");

const createGuideSection = catchAsync(async (req, res) => {
    const result = await guideService.createGuideSection(req.body);

    res.status(httpStatus.status.CREATED).send({
        success: true,
        message: "Guide section created successfully",
        data: result
    });
});

const getGuideSections = catchAsync(async (req, res) => {
    const result = await guideService.getGuideSections();

    res.send({
        success: true,
        data: result
    });
});

const getGuideSectionById = catchAsync(async (req, res) => {
    const result = await guideService.getGuideSectionById(req.params.id);

    res.send({
        success: true,
        data: result
    });
});

const updateGuideSection = catchAsync(async (req, res) => {
    const result = await guideService.updateGuideSection(
        req.params.id,
        req.body
    );

    res.send({
        success: true,
        message: "Guide section updated successfully",
        data: result
    });
});

const deleteGuideSection = catchAsync(async (req, res) => {
    await guideService.deleteGuideSection(req.params.id);

    res.send({
        success: true,
        message: "Guide section deleted successfully"
    });
});

module.exports = {
    createGuideSection,
    getGuideSections,
    getGuideSectionById,
    updateGuideSection,
    deleteGuideSection
};