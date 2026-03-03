

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { authService } = require("../services/index");

const sendOtp = catchAsync(async (req, res) => {
  try {
    const data = await authService.sendOtp(req.body.email);
    return res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const verifyOtp = catchAsync(async (req, res) => {
  try {
    const data = await authService.verifyOtp(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const setMpin = catchAsync(async (req, res) => {
  try {
    const data = await authService.setMpin(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const verifyMpin = catchAsync(async (req, res) => {
  try {
    const data = await authService.verifyMpin(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin
}