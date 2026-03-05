const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendMail = (options) => transporter.sendMail({
  from: `"Satta App" <${process.env.SMTP_USER}>`,
  ...options
});