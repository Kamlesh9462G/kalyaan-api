const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { gameBetGuideService } = require("../../services/index");

const createGameBetGuide = catchAsync(async (req, res) => {

  const result = await gameBetGuideService.createGameBetGuide(req.body);

  res.status(httpStatus.status.CREATED).send({
    success: true,
    message: "Bet guide created successfully",
    data: result
  });

});

const getGameBetGuides = catchAsync(async (req, res) => {

  const result = await gameBetGuideService.getGameBetGuides();

  res.send({
    success: true,
    data: result
  });

});

const updateGameBetGuide = catchAsync(async (req, res) => {

  const result = await gameBetGuideService.updateGameBetGuide(
    req.params.id,
    req.body
  );

  res.send({
    success: true,
    message: "Bet guide updated successfully",
    data: result
  });

});

const deleteGameBetGuide = catchAsync(async (req, res) => {

  await gameBetGuideService.deleteGameBetGuide(req.params.id);

  res.send({
    success: true,
    message: "Bet guide deleted successfully"
  });

});

module.exports = {
  createGameBetGuide,
  getGameBetGuides,
  updateGameBetGuide,
  deleteGameBetGuide
};