

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const { Customer,Wallet } = require("../models/index");
const otpService = require("./otp.service");
const tokenService = require("./token.service");

const sendOtp = async (email) => {
  try {

    await otpService.generateAndSendOtp(email);
    return { message: "OTP sent to email" };
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const verifyOtp = async ({ email, otp }) => {
  try {
    // 🔐 Step 1: Verify OTP
    await otpService.verifyOtp(email, otp);

    // 🔎 Step 2: Find customer
    let customer = await Customer.findOne({ email });

    let isNewCustomer = false;

    if (!customer) {
      customer = await Customer.create({
        email,
        name: "Guest",
        mpin: null // force MPIN setup
      });
      isNewCustomer = true;
    }

    // 💰 Step 3: Ensure wallet exists (idempotent)
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
      isNewCustomer,
      isMpinSet: Boolean(customer.mpin),
      walletBalance: wallet.balance
    };

  } catch (error) {
    console.log("OTP Verification Error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const setMpin = async ({ customerId, mpin, device }) => {
  try {

    const customer = await Customer.findById(customerId);
    customer.mpin = mpin;
    await customer.save();

    return tokenService.createSession(customer, device);
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const verifyMpin = async ({ customerId, mpin, device }) => {
  try {

    const customer = await Customer.findById(customerId).select("+mpin");

    const valid = await customer.verifyMpin(mpin);
    if (!valid) throw new Error("Invalid MPIN");

    return tokenService.createSession(customer, device);
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
  }
};


module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin
}