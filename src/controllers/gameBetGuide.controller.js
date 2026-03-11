const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { gameBetGuideService } = require("../services/index");



const getGameBetGuides = catchAsync(async (req, res) => {

  const result = await gameBetGuideService.getGameBetGuides();

  return res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "game bet guides fetched successfully",
    data: result
  });


});




module.exports = {
  getGameBetGuides,

};