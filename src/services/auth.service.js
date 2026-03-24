const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const { Customer, Wallet } = require("../models/index");
const otpService = require("./otp.service");
const tokenService = require("./token.service");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const sendOtp = async (email, purpose) => {
  await otpService.generateAndSendOtp(email, purpose);

  return {
    message: "OTP sent successfully",
    data: { email, purpose },
  };
};

const verifyOtp = async ({ email, otp, purpose }) => {
  await otpService.verifyOtp(email, otp, purpose);

  // 🔍 Get or create customer
  let customer = await Customer.findOne({ email }).select("+mpin");
  let isNewCustomer = false;

  if (!customer) {
    customer = await Customer.create({
      email,
      name: "Guest",
      mpin: null,
    });
    isNewCustomer = true;
  }

  // 💰 Get or create wallet
  let wallet = await Wallet.findOne({ customerId: customer._id });

  if (!wallet) {
    wallet = await Wallet.create({
      customerId: customer._id,
      balance: 0,
      lockedBalance: 0,
      status: "active",
    });
  }

  let resetToken = null;

  // 🔁 FORGOT MPIN FLOW
  if (purpose === "FORGOT_MPIN") {
    resetToken = jwt.sign(
      { customerId: customer._id, type: "RESET_MPIN" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
  }

  // 🎯 Unified response
  return {
    customerId: customer._id,
    email: customer.email,
    isNewCustomer,
    isMpinSet: Boolean(customer.mpin),
    walletBalance: wallet.balance,
    resetToken, // will be null for normal flow
  };
};

const setMpin = async ({ customerId, mpin, device }) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new ApiError(httpStatus.status.NOT_FOUND, "Customer not found");
  }

  const hashedMpin = await bcrypt.hash(mpin, 10);
  customer.mpin = hashedMpin;
  await customer.save();

  const tokens = await tokenService.createSession(customer, device);

  return {
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

const verifyMpin = async ({ customerId, mpin, device }) => {
  const customer = await Customer.findById(customerId).select("+mpin");

  if (!customer || !customer.mpin) {
    throw new ApiError(httpStatus.status.BAD_REQUEST, "MPIN not set");
  }

  const isMatch = await bcrypt.compare(mpin, customer.mpin);

  if (!isMatch) {
    throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid MPIN");
  }

  const tokens = await tokenService.createSession(customer, device);

  return {
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

// ✅ RESET MPIN
const resetMpin = async ({ resetToken, newMpin, device }) => {
  let payload;

  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid or expired token");
  }

  if (payload.type !== "RESET_MPIN") {
    throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid token type");
  }

  const customer = await Customer.findById(payload.customerId);

  if (!customer) {
    throw new ApiError(httpStatus.status.NOT_FOUND, "Customer not found");
  }

  const hashedMpin = await bcrypt.hash(newMpin, 10);
  customer.mpin = hashedMpin;
  await customer.save();

  const tokens = await tokenService.createSession(customer, device);

  return {
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin,
  resetMpin,
};