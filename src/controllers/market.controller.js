const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { resultService, marketService,marketBetTypeService } = require("../services/index");
const getMarketsWithResult = catchAsync(async (req, res, next) => {

    const today = new Date().toISOString().slice(0, 10);

    // Fetch active markets
    const markets = await marketService.getMarkets({
        status: "active",
        isDeleted: false,
    });

    if (!markets || markets.length === 0) {
        return res.status(httpStatus.status.OK).json({
            success: true,
            status: httpStatus.status.OK,
            message: "No active markets found",
            data: [],
        });
    }

    // Fetch today's results
    const results = await resultService.getCurrentDayResult({
        date: today,
    });

    const resultMap = new Map();

    if (results && results.length) {
        results.forEach((result) => {
            resultMap.set(result.marketId.toString(), result);
        });
    }

    const formattedMarkets = markets.map((market) => {
        const result = resultMap.get(market._id.toString());

        let resultString = "***-**-***";

        if (result) {
            const openPanna = result.openPanna || "***";
            const closePanna = result.closePanna || "***";
            const openDigit =
                result.openDigit !== undefined && result.openDigit !== null
                    ? result.openDigit
                    : "*";
            const closeDigit =
                result.closeDigit !== undefined && result.closeDigit !== null
                    ? result.closeDigit
                    : "*";

            resultString = `${openPanna}-${openDigit}${closeDigit}-${closePanna}`;
        }

        return {
            _id: market._id,
            name: market.name,
            timings: market.timings,
            result: resultString,
        };
    });

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Markets fetched successfully",
        data: formattedMarkets,
    });

});

const getMarketBetTypes = catchAsync(async (req, res, next) => {

    const id = req.params.id;

    if (!id) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            success: false,
            status: httpStatus.status.BAD_REQUEST,
            message: "Market ID is required",
        });
    }

    const betTypes = await marketBetTypeService.getMarketBetTypes(id);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet types fetched successfully",
        data: betTypes,
    });

})
module.exports = {
    getMarketsWithResult,
    getMarketBetTypes
};