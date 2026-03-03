const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendMail = (options) => transporter.sendMail({
  from: `"Satta App" <${process.env.MAIL_USER}>`,
  ...options
});