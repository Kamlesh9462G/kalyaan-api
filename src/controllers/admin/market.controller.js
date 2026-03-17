const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { marketService, resultService } = require('../../services/index');
// ✅ ADD MARKET
const addMarket = catchAsync(async (req, res) => {
    const market = await marketService.addMarket(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Market added successfully",
        data: market,
    });
});

// ✅ UPDATE MARKET
const updateMarket = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updatedMarket = await marketService.updateMarket(id, req.body);

    if (!updatedMarket) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Market not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Market updated successfully",
        data: updatedMarket,
    });
});

// ✅ DELETE MARKET
const deleteMarket = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedMarket = await marketService.deleteMarket(id);

    if (!deletedMarket) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Market not found");
    }

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Market deleted successfully",
    });
});


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
module.exports = {
    addMarket,
    updateMarket,
    deleteMarket,
    getMarketsWithResult
}