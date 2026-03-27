const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");

const { authService, tokenService } = require("../services/index");

const sendOtp = catchAsync(async (req, res) => {
  const { email, purpose = "AUTH",referralCode } = req.body;

  const result = await authService.sendOtp(email, purpose,referralCode);

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: result.message,
    data: result.data,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp, purpose = "AUTH",referralCode } = req.body;

  const result = await authService.verifyOtp({ email, otp, purpose,referralCode });

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "OTP verified successfully",
    data: result,
  });
});

const setMpin = catchAsync(async (req, res) => {
  const { customerId, mpin, device } = req.body;

  const result = await authService.setMpin({ customerId, mpin, device });

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "MPIN set successfully",
    data: result,
  });
});

const verifyMpin = catchAsync(async (req, res) => {
  const { customerId, mpin, device } = req.body;

  const result = await authService.verifyMpin({ customerId, mpin, device });

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "MPIN verified successfully",
    data: result,
  });
});

// ✅ NEW
const resetMpin = catchAsync(async (req, res) => {
  const { resetToken, newMpin, device } = req.body;

  const result = await authService.resetMpin({ resetToken, newMpin, device });

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "MPIN reset successfully",
    data: result,
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await tokenService.refreshAccessToken(refreshToken);

  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: "Tokens refreshed successfully",
    data: { accessToken: tokens },
  });
});
const logout = catchAsync(async (req, res) => {
  const { refreshToken, logoutAll = false } = req.body;
  
  // Get access token from authorization header
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  // Get customer ID from request (from auth middleware)
  const customerId = req.customer?.customerId;
  
  const result = await authService.logout({ 
    refreshToken, 
    accessToken, 
    customerId, 
    logoutAll 
  });
  
  res.status(httpStatus.status.OK).json({
    success: true,
    status: httpStatus.status.OK,
    message: result.message,
    data: result.data,
  });
});
module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin,
  resetMpin,
  refreshTokens,
  logout
};