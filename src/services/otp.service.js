const { Otp } = require("../models/index");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const mailer = require("../utils/mailer");

exports.generateAndSendOtp = async (email, purpose) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  await mailer.sendMail({
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  });
};

exports.verifyOtp = async (email, otp, purpose) => {
  const record = await Otp.findOne({
    email,
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid or expired OTP");
  }

  record.isUsed = true;
  await record.save();
};