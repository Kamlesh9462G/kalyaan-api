const catchAsync = require("../utils/catchAsync");
const { betService } = require("../services/index");

const placeBet = catchAsync(async (req, res) => {
    console.log("Received place bet request for customer:", req.customer.customerId);
    console.log("Request body:", req.body);
    const result = await betService.placeBet(
        req.customer.customerId,
        req.body
    );

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Bet placed successfully",
        data: result,
    });

    res.json(result);
})

module.exports = {
    placeBet
}