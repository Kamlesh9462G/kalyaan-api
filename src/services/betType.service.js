const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { BetType, BetDigit, BetRate } = require('../models/index');


const addBetType = async (betTypeData) => {
    try {
        return await BetType.create(betTypeData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const getBetTypes = async (filterQuery) => {
    try {
        return await BetType.find(filterQuery)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const updateBetType = async (betTypeId, updateData) => {
    try {
        const betType = await BetType.findByIdAndUpdate(
            betTypeId,
            updateData,
            { new: true, runValidators: true }
        );

        return betType;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
}
const deleteBetType = async (betTypeId) => {
    try {
        const market = await BetType.findByIdAndDelete(betTypeId);
        return market;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }

}
const addBetTypeDigits = async (betTypeId, digits) => {
    try {
        const betType = await BetType.findById(betTypeId);
        if (!betType) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Bet type not found");
        }
        const betDigits = await BetDigit.insertMany(digits.map(digit => ({ digit, betTypeId })));
        return betDigits;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const getBetTypeDigits = async (betTypeId) => {
    try {
        const betType = await BetType.findById(betTypeId);
        if (!betType) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Bet type not found");
        }
        const betDigits = await BetDigit.find({ betTypeId });
        return betDigits;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const addBetTypeRates = async (betRateData) => {
    try {
        return await BetRate.create(betRateData)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const getBetTypeRates = async (filterQuery) => {
  try {
    return await BetRate.aggregate([
      {
        $match: filterQuery
      },
      {
        $lookup: {
          from: "bettypes", // collection name in MongoDB
          localField: "betTypeId",
          foreignField: "_id",
          as: "betType"
        }
      },
      {
        $unwind: {
          path: "$betType",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          rate: 1,
          betTypeId: 1,
          betTypeName: "$betType.name",
          description:1,
          baseAmount:1,
          payoutAmount:1,
          session:1,
          status:1

        }
      }
    ]);
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};


// ✅ UPDATE
const updateBetTypeRate = async (rateId, updateData) => {
    try {
        const rate = await BetRate.findByIdAndUpdate(
            rateId,
            updateData,
            { new: true, runValidators: true }
        );

        return rate;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

// ✅ DELETE
const deleteBetTypeRate = async (rateId) => {
    try {
        const rate = await BetRate.findByIdAndDelete(rateId);
        return rate;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

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