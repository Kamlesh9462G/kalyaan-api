const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { marketBetTypeService } = require('../../services');

// ✅ CREATE
const addMarketBetType = catchAsync(async (req, res) => {
    const data = await marketBetTypeService.addMarketBetType(req.body);

    return res.status(httpStatus.status.CREATED).json({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Market Bet Type created successfully",
        data
    });
});

// ✅ GET ALL
const getMarketBetType = catchAsync(async (req, res) => {
    const data = await marketBetTypeService.getMarketBetType({ isDeleted: false });

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        data
    });
});

// ✅ GET BY MARKET (AGGREGATION)
const getMarketBetTypes = catchAsync(async (req, res) => {
    const { marketId } = req.params;

    const data = await marketBetTypeService.getMarketBetTypes(marketId);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        data
    });
});

// ✅ UPDATE
const updateMarketBetType = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updated = await marketBetTypeService.updateMarketBetType(id, req.body);

    if (!updated) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Market Bet Type not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Market Bet Type updated successfully",
        data: updated
    });
});

// ✅ DELETE (SOFT DELETE)
const deleteMarketBetType = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await marketBetTypeService.deleteMarketBetType(id);

    if (!deleted) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Market Bet Type not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Market Bet Type deleted successfully"
    });
});

module.exports = {
    addMarketBetType,
    getMarketBetType,
    getMarketBetTypes,
    updateMarketBetType,
    deleteMarketBetType
};