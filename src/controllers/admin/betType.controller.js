const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { betTypeService } = require('../../services/index');

const addBetType = async (req, res) => {
    const betType = await betTypeService.addBetType(req.body);
    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type added successfully",
        data: betType,
    });

}
const getBetTypes = async (req, res) => {
    const betTypes = await betTypeService.getBetTypes({});
    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type fetched successfully",
        data: betTypes,
    });
}
const updateBetType = async (req, res) => {
    const { id } = req.params;

    const betTypes = await betTypeService.updateBetType(id, req.body);
    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet Type updated successfully",
        data: betTypes,
    });
}
const deleteBetType = async (req, res) => {
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
}
const addBetTypeDigits = async (req, res) => {
    const { id } = req.params;
    const digits = await betTypeService.addBetTypeDigits(id, req.body.digits);
    res.status(httpStatus.status.OK).send(digits);
}

const getBetTypeDigits = async (req, res) => {
    const { id } = req.params;
    const digits = await betTypeService.getBetTypeDigits(id);
    res.status(httpStatus.status.OK).send(digits);
}

const addBetTypeRates = async (req, res) => {

    const betRate = await betTypeService.addBetTypeRates(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rate added successfully",
        data: betRate,
    });

}
const getBetTypeRates = async (req, res) => {
    const betRates = await betTypeService.getBetTypeRates({});

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Rates fetched successfully",
        data: betRates,
    });
}

module.exports = {
    addBetType,
    getBetTypes,
    addBetTypeDigits,
    getBetTypeDigits,
    addBetTypeRates,
    getBetTypeRates,
    updateBetType,
    deleteBetType
}