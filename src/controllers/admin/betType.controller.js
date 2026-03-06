const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { betTypeService } = require('../../services/index');

const addBetType = async (req, res) => {
    const market = await betTypeService.addBetType(req.body);
    res.status(httpStatus.status.CREATED).send(market);
}
const getBetTypes = async (req, res) => {
    const market = await betTypeService.getBetTypes({});
    res.status(httpStatus.status.OK).send(market);
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
    getBetTypeRates
}