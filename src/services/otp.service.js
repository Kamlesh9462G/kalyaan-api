const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const { Otp } = require("../models/index");
const mailer = require("../utils/mailer");

exports.generateAndSendOtp = async (email) => {
  try {
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    console.log(`Generated OTP for ${email}: ${otp}`);
    console.log({
      email,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    })
    await Otp.create({
      email,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    });
  
    await mailer.sendMail({
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}`
    });
  } catch (error) {
    console.log("OTP Generation Error:", error);
  }
};

exports.verifyOtp = async (email, otp) => {

  const record = await Otp.findOne({
    email,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    throw new ApiError(
      httpStatus.status.BAD_REQUEST,
      "Invalid or expired OTP"
    );
  }

  // Mark OTP used
  record.isUsed = true;
  await record.save();

  return true;
};