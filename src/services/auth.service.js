
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const { Customer, Wallet } = require("../models/index");
const otpService = require("./otp.service");
const tokenService = require("./token.service");

const sendOtp = async (email) => {
  // const customer = await Customer.findOne({ email });

  await otpService.generateAndSendOtp(email);

  return {
    message: "OTP sent successfully",
    data: {
      email,
    },
  };
};

const verifyOtp = async ({ email, otp }) => {

  // 🔐 Step 1: Verify OTP
  await otpService.verifyOtp(email, otp);

  // 🔎 Step 2: Find customer
  let customer = await Customer.findOne({ email });

  let isNewCustomer = false;

  if (!customer) {
    customer = await Customer.create({
      email,
      name: "Guest",
      mpin: null
    });

    isNewCustomer = true;
  }

  // 💰 Step 3: Ensure wallet exists
  let wallet = await Wallet.findOne({ customerId: customer._id });

  if (!wallet) {
    wallet = await Wallet.create({
      customerId: customer._id,
      balance: 0,
      lockedBalance: 0,
      status: "active"
    });
  }

  // 🧠 Step 4: Response
  return {
    customerId: customer._id,
    email: customer.email,
    isNewCustomer,
    isMpinSet: Boolean(customer.mpin),
    walletBalance: wallet.balance
  };
};

const setMpin = async ({ customerId, mpin, device }) => {

  const customer = await Customer.findOne({_id: new ObjectId(customerId)});

  if (!customer) {
    throw new ApiError(
      httpStatus.status.NOT_FOUND,
      "Customer not found"
    );
  }

  // 🔐 Hash MPIN
  const hashedMpin = await bcrypt.hash(mpin, 10);
  

  customer.mpin = hashedMpin;
  await customer.save();

  // 🚀 Create login session
  const tokens = await tokenService.createSession(customer, device);

  return {
    customerId: customer._id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const verifyMpin = async ({ customerId, mpin, device }) => {

  const customer = await Customer.findById(customerId).select("+mpin");

  if (!customer) {
    throw new ApiError(
      httpStatus.status.NOT_FOUND,
      "Customer not found"
    );
  }

  if (!customer.mpin) {
    throw new ApiError(
      httpStatus.status.BAD_REQUEST,
      "MPIN not set for this customer"
    );
  }

  // 🔐 Compare MPIN using bcrypt
  const isMatch = await bcrypt.compare(mpin, customer.mpin);

  if (!isMatch) {
    throw new ApiError(
      httpStatus.status.UNAUTHORIZED,
      "Invalid MPIN"
    );
  }


  // 🚀 Create session
  const tokens = await tokenService.createSession(customer, device);

  return {
    customerId: customer._id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};


module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin
}