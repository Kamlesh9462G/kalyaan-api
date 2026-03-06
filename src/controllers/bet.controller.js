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
    message: "Bet placed successfully",
    data: result
  });

});

module.exports = {
    placeBet
}