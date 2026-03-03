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

module.exports = {
    addBetType,
    getBetTypes
}