const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { marketService } = require('../../services/index');
const addMarket = catchAsync(async (req, res) => {
    const market = await marketService.addMarket(req, res);
    res.status(httpStatus.status.CREATED).send(market);
});
const getMarket = catchAsync(async (req, res) => {
    const market = await marketService.getMarket({});
    res.status(httpStatus.status.OK).send(market);
})
module.exports = {
    addMarket,
    getMarket
}