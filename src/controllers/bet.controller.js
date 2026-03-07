const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { betService } = require("../services/index");

const placeBet = catchAsync(async (req, res) => {

  const result = await betService.placeBet(
    req.customer.customerId,
    req.body
  );

  return res.status(httpStatus.status.OK).json({
    success: true,
    status:httpStatus.status.OK,
    message: "Bet placed successfully",
    data: result
  });

});
const getBetHistory = catchAsync(async (req, res) => {

    const customerId = req.customer.customerId;

    const data = await betService.getBetHistory(customerId);

  return res.status(httpStatus.status.OK).json({
    success: true,
    status:httpStatus.status.OK,
    message: "Bet history fetched successfully",
    data: data
  });

});
module.exports = {
    placeBet,
    getBetHistory
}