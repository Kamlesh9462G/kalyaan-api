const httpStatus = require('http-status');
const { Result } = require('../models/index')
const ApiError = require('../utils/ApiError');
const { getDigitFromPanna } = require('../utils/pannaUtils');
// const { settleOpenBids, settleCloseBids } = require('./bid.service');

const declareOpenResult = async ({ marketId, date, openPanna }) => {

    const openDigit = getDigitFromPanna(openPanna);

    let result = await Result.findOne({
        marketId,
        date
    });

    if (result?.openPanna) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, 'Open result already declared');
    }

    if (!result) {
        result = await Result.create({
            marketId,
            date,
            openPanna,
            openDigit
        });
    } else {
        result.openPanna = openPanna;
        result.openDigit = openDigit;
        await result.save();
    }

    // await settleOpenBids(result);

    return result;
};

const declareCloseResult = async ({ marketId, date, closePanna }) => {

    const closeDigit = getDigitFromPanna(closePanna);

    const result = await Result.findOne({
        marketId,
        date
    });

    if (!result) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, 'Open result not declared yet');
    }

    if (result.closePanna) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, 'Close result already declared');
    }

    result.closePanna = closePanna;
    result.closeDigit = closeDigit;

    await result.save();

    // await settleCloseBids(result);

    return result;
};

const getCurrentDayResult = async (filterQuery = {}) => {
    try {
        const results = await Result.find(filterQuery).lean();

        return results || [];
    } catch (error) {
        throw new ApiError(
            httpStatus.status.INTERNAL_SERVER_ERROR,
            error.message || "Failed to fetch results"
        );
    }
};


module.exports = {
    declareOpenResult,
    declareCloseResult,
    getCurrentDayResult
}