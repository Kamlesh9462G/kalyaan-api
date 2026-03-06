
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { MarketBetType } = require('../models/index');

const addMarketBetType = async (marketBetTypeData) => {
    try {
        return await MarketBetType.create(marketBetTypeData);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}

const getMarketBetType = async (filterQuery) => {
    try {
        return await MarketBetType.find(filterQuery);
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)

    }
}

const getMarketBetTypes = async (marketId) => {
  try {

    const data = await MarketBetType.aggregate([
      {
        $match: {
          marketId: new mongoose.Types.ObjectId(marketId),
          isDeleted: false
        }
      },

      // 🔹 MARKET LOOKUP
      {
        $lookup: {
          from: "markets",
          localField: "marketId",
          foreignField: "_id",
          as: "market"
        }
      },

      { $unwind: "$market" },

      // 🔹 BET TYPE LOOKUP
      {
        $lookup: {
          from: "bettypes",
          localField: "betTypeId",
          foreignField: "_id",
          as: "betType"
        }
      },

      { $unwind: "$betType" },

      // 🔹 RESPONSE FORMAT
      {
        $project: {
          _id: 1,

          marketId: 1,
          marketName: "$market.name",
          marketTimings: "$market.timings",

          betTypeId: 1,
          betTypeName: "$betType.name",
          digitConfig: "$betType.digitConfig",
          description: "$betType.description",
          

          sessions: 1,
          status: 1,

          createdAt: 1,
          updatedAt: 1
        }
      }

    ]);

    return data;

  } catch (error) {
    throw new ApiError(
      httpStatus.status.INTERNAL_SERVER_ERROR,
      error.message || "Failed to fetch market bet types"
    );
  }
};


const updateMarketBetType = async (filterQuery, updateData) => {

}


const deleteMarketBetType = async (filterQuery) => {

}


module.exports = {
    addMarketBetType,
    getMarketBetType,
    updateMarketBetType,
    deleteMarketBetType,
    getMarketBetTypes
}