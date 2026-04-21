const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { betTypeService } = require('../../services/index');

const addBetType = catchAsync(async (req, res) => {
    const betType = await betTypeService.addBetType(req.body);
    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type added successfully",
        data: betType,
    });

})
const getBetTypes = catchAsync(async (req, res) => {
    const betTypes = await betTypeService.getBetTypes({});
    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type fetched successfully",
        data: betTypes,
    });
})
const updateBetType = catchAsync(async (req, res) => {
    const { id } = req.query; // ✅ get from query

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID is required in query",
        });
    }

    const betTypes = await betTypeService.updateBetType(id, req.body);

    return res.status(200).json({
        success: true,
        message: "Bet Type updated successfully",
        data: betTypes,
    });
});
const deleteBetType = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedBetType = await betTypeService.deleteBetType(id);

    if (!deletedBetType) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Market not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type deleted successfully",
    });
})
const addBetTypeDigits = catchAsync(async (req, res) => {
    const { id } = req.params;
    const digits = await betTypeService.addBetTypeDigits(id, req.body.digits);
    res.status(httpStatus.status.OK).send(digits);
})

const getBetTypeDigits = catchAsync(async (req, res) => {
    const { id } = req.params;
    const digits = await betTypeService.getBetTypeDigits(id);
    res.status(httpStatus.status.OK).send(digits);
})

const addBetTypeRates = catchAsync(async (req, res) => {

    const betRate = await betTypeService.addBetTypeRates(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rate added successfully",
        data: betRate,
    });

})
const getBetTypeRates = catchAsync(async (req, res) => {
    const betRates = await betTypeService.getBetTypeRates({});

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rates fetched successfully",
        data: betRates,
    });
})
const updateBetTypeRate = catchAsync(async (req, res) => {
    const { id } = req.query;

    const updatedRate = await betTypeService.updateBetTypeRate(id, req.body);

    if (!updatedRate) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Rate not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rate updated successfully",
        data: updatedRate,
    });


})
const deleteBetTypeRate = catchAsync(async (req, res) => {
    const { id } = req.query;

    const deletedRate = await betTypeService.deleteBetTypeRate(id);

    if (!deletedRate) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Rate not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rate deleted successfully",
    });

})
module.exports = {
    addBetType,
    getBetTypes,
    addBetTypeDigits,
    getBetTypeDigits,
    addBetTypeRates,
    getBetTypeRates,
    updateBetType,
    deleteBetType,
    updateBetTypeRate,
    deleteBetTypeRate
}