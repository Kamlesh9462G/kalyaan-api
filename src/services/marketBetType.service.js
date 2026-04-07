const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { MarketBetType, Market, BetType } = require('../models');

// // ✅ CREATE
// const addMarketBetType = async (data) => {
//   try {
//     // 🔹 Validate Market
//     const marketExists = await Market.findById(data.marketId);
//     if (!marketExists) {
//       throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid marketId");
//     }

//     // 🔹 Validate BetType
//     const betTypeExists = await BetType.findById(data.betTypeId);
//     if (!betTypeExists) {
//       throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid betTypeId");
//     }

//     // 🔹 Prevent duplicate
//     const existing = await MarketBetType.findOne({
//       marketId: data.marketId,
//       betTypeId: data.betTypeId,
//       isDeleted: false
//     });

//     if (existing) {
//       throw new ApiError(httpStatus.status.BAD_REQUEST, "Bet type already exists for this market");
//     }

//     return await MarketBetType.create(data);

//   } catch (error) {
//     throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
//   }
// };

const addMarketBetType = async (data) => {
  try {
    const { marketId, betTypeId } = data;

    // 🔹 Validate Market
    const marketExists = await Market.findById(marketId);
    if (!marketExists) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid marketId");
    }

    // 🔹 Ensure array
    const betTypeIds = Array.isArray(betTypeId) ? betTypeId : [betTypeId];

    // 🔹 Fetch all bet types
    const betTypes = await BetType.find({
      _id: { $in: betTypeIds },
      isDeleted: false
    });

    if (betTypes.length !== betTypeIds.length) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Some betTypes are invalid");
    }

    const bulkData = [];

    for (const betType of betTypes) {

      // 🔹 Check duplicate
      const exists = await MarketBetType.findOne({
        marketId,
        betTypeId: betType._id,
        isDeleted: false
      });

      if (exists) continue; // skip duplicates

      const supported = betType.supportedSessions || [];

      let payload = {
        marketId,
        betTypeId: betType._id
      };

      // ✅ CASE 1: SESSION BASED
      if (supported.length > 0) {
        payload.sessions = {
          open: supported.includes("open")
            ? {
              enabled: true,
              payout: betType.payout
            }
            : undefined,

          close: supported.includes("close")
            ? {
              enabled: true,
              payout: betType.payout
            }
            : undefined
        };
      }

      // ❌ CASE 2: NO SESSION (JODI / SANGAM)
      else {
        payload.sessions = null;
        payload.defaultPayout = betType.payout;
      }

      bulkData.push(payload);
    }

    if (!bulkData.length) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "All bet types already exist");
    }

    // 🔥 BULK INSERT
    const result = await MarketBetType.insertMany(bulkData);

    return result;

  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getMarketBetType = async (filterQuery) => {
  try {
    const matchStage = {
      isDeleted: false,
      ...filterQuery
    };

    const data = await MarketBetType.aggregate([
      {
        $match: matchStage
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
      {
        $unwind: {
          path: "$market",
          preserveNullAndEmptyArrays: true
        }
      },

      // 🔹 BET TYPE LOOKUP
      {
        $lookup: {
          from: "bettypes",
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

      // 🔹 FINAL RESPONSE
      {
        $project: {
          _id: 1,

          marketId: 1,
          marketName: "$market.name",

          betTypeId: 1,
          betTypeName: "$betType.name",

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
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// // ✅ AGGREGATE (already good)
// const getMarketBetTypes = async (marketId) => {
//   try {
//     return await MarketBetType.aggregate([
//       {
//         $match: {
//           marketId: new mongoose.Types.ObjectId(marketId),
//           isDeleted: false
//         }
//       },
//       {
//         $lookup: {
//           from: "markets",
//           localField: "marketId",
//           foreignField: "_id",
//           as: "market"
//         }
//       },
//       { $unwind: "$market" },
//       {
//         $lookup: {
//           from: "bettypes",
//           localField: "betTypeId",
//           foreignField: "_id",
//           as: "betType"
//         }
//       },
//       { $unwind: "$betType" },
//       {
//         $project: {
//           _id: 1,
//           marketId: 1,
//           marketName: "$market.name",
//           marketTimings: "$market.timings",
//           betTypeId: 1,
//           betTypeName: "$betType.name",
//           digitConfig: "$betType.digitConfig",
//           description: "$betType.description",
//           sessions: 1,
//           defaultPayout:1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1
//         }
//       }
//     ]);
//   } catch (error) {
//     throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
//   }
// };

const getMarketBetTypes = async (marketId) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    return await MarketBetType.aggregate([
      {
        $match: {
          marketId: new mongoose.Types.ObjectId(marketId),
          isDeleted: false
        }
      },

      // ✅ Market lookup
      {
        $lookup: {
          from: "markets",
          localField: "marketId",
          foreignField: "_id",
          as: "market"
        }
      },
      { $unwind: "$market" },

      // ✅ BetTypes lookup
      {
        $lookup: {
          from: "bettypes",
          localField: "betTypeId",
          foreignField: "_id",
          as: "betType"
        }
      },
      { $unwind: "$betType" },

      // ✅ Results lookup (without unwind)
      {
        $lookup: {
          from: "results",
          let: { marketId: "$marketId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$marketId", "$$marketId"] },
                    { $eq: ["$date", today] }
                  ]
                }
              }
            },
            {
              $project: {
                openPanna: 1,
                _id: 0
              }
            }
          ],
          as: "result"
        }
      },

      // ✅ Extract first result safely
      {
        $addFields: {
          resultObj: { $arrayElemAt: ["$result", 0] },
          hasResultForToday: { $gt: [{ $size: "$result" }, 0] }
        }
      },

      // ✅ Conditional logic
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ["$hasResultForToday", false] },
              {
                $and: [
                  { $eq: ["$hasResultForToday", true] },
                  { $eq: ["$resultObj.openPanna", null] }
                ]
              },
              {
                $and: [
                  { $eq: ["$hasResultForToday", true] },
                  { $ne: ["$resultObj.openPanna", null] },
                  { $not: { $in: ["$betType.code", ["JD", "HS", "FS"]] } }
                ]
              }
            ]
          }
        }
      },

      // ✅ SORT ADDED HERE (based on betType._id)
      {
        $sort: {
          "betType._id": 1
        }
      },

      // ✅ Final projection
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
          defaultPayout: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);
  } catch (error) {
    throw new ApiError(
      httpStatus.status.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// ✅ UPDATE
const updateMarketBetType = async (id, updateData) => {
  try {
    const updated = await MarketBetType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    return updated;
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ✅ DELETE (SOFT DELETE)
const deleteMarketBetType = async (id) => {
  try {
    const deleted = await MarketBetType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    return deleted;
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  addMarketBetType,
  getMarketBetType,
  getMarketBetTypes,
  updateMarketBetType,
  deleteMarketBetType
};