const { Otp } = require("../models/index");
const mailer = require("../utils/mailer");

exports.generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
};

exports.verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({
    email,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!record) throw new Error("Invalid or expired OTP");

  record.isUsed = true;
  await record.save();
};