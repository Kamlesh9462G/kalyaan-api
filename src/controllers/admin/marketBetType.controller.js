
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { marketBetTypeService } = require('../../services/index');


const addMarketBetType = catchAsync(async (req, res) => {
    const marketBetType = await marketBetTypeService.addMarketBetType(req.body);
    return res.status(httpStatus.status.CREATED).send(marketBetType);
})
const getMarketBetType = catchAsync(async (req, res) => {
    const marketBetTypes = await marketBetTypeService.getMarketBetType({});
    return res.status(httpStatus.status.OK).send(marketBetTypes);
})
const updateMarketBetType = catchAsync(async (req, res) => {

})
const deleteMarketBetType = catchAsync(async (req, res) => {

})

module.exports = {
    addMarketBetType,
    getMarketBetType,
    updateMarketBetType,
    deleteMarketBetType
}