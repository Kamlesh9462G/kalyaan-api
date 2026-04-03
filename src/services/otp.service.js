const { Otp } = require("../models/index");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const mailer = require("../utils/mailer");

const getOtpTemplate = ({ title, message, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:20px; border-radius:8px;">
              
              <tr>
                <td>
                  <h2 style="margin:0 0 10px 0; color:#333;">${title}</h2>
                  <p style="color:#555; font-size:14px; margin:0 0 20px 0;">
                    ${message}
                  </p>
                </td>
              </tr>

              <!-- OTP BOX -->
              <tr>
                <td align="center">
                  <div style="
                    display:inline-block;
                    padding:12px 24px;
                    font-size:22px;
                    letter-spacing:5px;
                    background:#f1f1f1;
                    border-radius:6px;
                    font-weight:bold;
                    color:#000;
                  ">
                    ${otp}
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <p style="font-size:12px; color:#888; margin-top:20px;">
                    This OTP is valid for a limited time. Do not share it with anyone.
                  </p>
                </td>
              </tr>

              <tr>
                <td>
                  <hr style="margin:20px 0;" />
                  <p style="font-size:12px; color:#aaa; text-align:center;">
                    If you didn’t request this, you can ignore this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

exports.generateAndSendOtp = async (email, purpose) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  if (purpose === "AUTH") {
    await mailer.sendMail({
      to: email,
      subject: "OTP Verification",
      html: getOtpTemplate({
        title: "Verify Your Account",
        message: "Use the OTP below to complete your authentication.",
        otp
      })
    });
  }
  if (purpose === "FORGOT_MPIN") {
    await mailer.sendMail({
      to: email,
      subject: "Reset MPIN OTP",
      html: getOtpTemplate({
        title: "Reset Your MPIN",
        message: "Use the OTP below to reset your MPIN securely.",
        otp
      })
    });
  }

  // await mailer.sendMail({
  //   to: email,
  //   subject: "Your OTP",
  //   text: `Your OTP is ${otp}`,
  // });
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
  return await record.save();
};