const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const { Customer, Wallet, CustomerSession, Referral } = require("../models/index");
const otpService = require("./otp.service");
const tokenService = require("./token.service");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");


// ✅ Dummy accounts config
const DUMMY_ACCOUNTS = [
  {
    email: "test1@gmail.com",
    otp: "123456",
  },
  {
    email: "test2@gmail.com",
    otp: "654321",
  },
];


const sendOtp = async (email, purpose, referralCode) => {

  // 🔍 Check if dummy account
  const dummyUser = DUMMY_ACCOUNTS.find((u) => u.email === email);

  // 🔗 Validate referral only if user not already registered
  const existingCustomer = await Customer.findOne({ email });

  if (!existingCustomer && referralCode) {
    const referrer = await Customer.findOne({ referralCode });

    if (!referrer) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid referral code");
    }
  }

  // ❌ Skip OTP sending for dummy users
  if (!dummyUser) {
    await otpService.generateAndSendOtp(email, purpose);
  }

  return {
    message: dummyUser
      ? "Dummy OTP bypassed"
      : "OTP sent successfully",
    data: { email, purpose },
  };
};

const verifyOtp = async ({ email, otp, purpose, referralCode }) => {

  // 🔍 Check if dummy account
  const dummyUser = DUMMY_ACCOUNTS.find((u) => u.email === email);

  // ✅ Validate OTP
  if (dummyUser) {
    if (otp !== dummyUser.otp) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid OTP");
    }
  } else {
    await otpService.verifyOtp(email, otp, purpose);
  }

  let customer = await Customer.findOne({ email }).select("+mpin");
  let isNewCustomer = false;
  let referrer = null;

  // =========================================================
  // 👤 NEW USER FLOW
  // =========================================================
  if (!customer) {

    if (referralCode) {
      referrer = await Customer.findOne({ referralCode });

      if (!referrer) {
        throw new ApiError(
          httpStatus.status.BAD_REQUEST,
          "Invalid referral code"
        );
      }

      if (referrer.email === email) {
        throw new ApiError(
          httpStatus.status.BAD_REQUEST,
          "You cannot use your own referral code"
        );
      }
    }

    customer = await Customer.create({
      email,
      mpin: null,
      referredBy: referrer?._id || null
    });

    isNewCustomer = true;

    if (referrer) {
      await Referral.create({
        referrer: referrer._id,
        referredUser: customer._id,
        status: "PENDING",
        totalDeposit: 0,
      });

      await Customer.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 }
      });
    }
  }

  // =========================================================
  // 💰 WALLET CREATION (SAFE)
  // =========================================================

  let wallet = await Wallet.findOne({ customerId: customer._id });

  if (!wallet) {
    wallet = await Wallet.create({
      customerId: customer._id,
      balance: 100000000,
      lockedBalance: 0,
      status: "active",
    });
  }

  // =========================================================
  // 🔁 FORGOT MPIN FLOW
  // =========================================================

  let resetToken = null;

  if (purpose === "FORGOT_MPIN") {
    resetToken = jwt.sign(
      { customerId: customer._id, type: "RESET_MPIN" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
  }

  // =========================================================
  // 🎯 FINAL RESPONSE
  // =========================================================

  return {
    customerId: customer._id,
    name: customer.name,
    email: customer.email,
    isNewCustomer,
    isMpinSet: Boolean(customer.mpin),
    walletBalance: wallet.balance,
    resetToken,
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
    name: customer.name,
    email: customer.email,
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
    name: customer.name,
    email: customer.email,
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
    name: customer.name,
    email: customer.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};
const logout = async ({ refreshToken, customerId, accessToken = null, logoutAll = false }) => {
  try {
    // If logoutAll is true, invalidate all sessions and blacklist all tokens
    if (logoutAll && customerId) {
      // Deactivate all sessions
      await CustomerSession.updateMany(
        { customerId: customerId, isActive: true },
        { isActive: false, loggedOutAt: new Date() }
      );

      // Note: Blacklisting all tokens would require storing them, which is complex
      // For now, deactivating sessions will prevent refresh token usage
      // Access tokens will still work until expiry, but without refresh capability

      return {
        message: "Logged out from all devices successfully",
        data: { timestamp: new Date().toISOString() }
      };
    }

    // Handle single device logout
    // 1. Blacklist access token if provided
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.customerId) {
          await tokenService.blacklistAccessToken(accessToken, decoded.customerId);
        }
      } catch (error) {
        console.log("Access token blacklist error:", error);
      }
    }

    // 2. Handle refresh token - blacklist and deactivate session
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type === "refresh" && decoded.deviceId && decoded.customerId) {
          // Blacklist the refresh token
          await tokenService.blacklistRefreshToken(refreshToken, decoded.customerId);

          // Invalidate the specific session
          await CustomerSession.findOneAndUpdate(
            {
              customerId: decoded.customerId,
              deviceId: decoded.deviceId,
              refreshToken: refreshToken,
            },
            {
              isActive: false,
              loggedOutAt: new Date(),
            }
          );
        }
      } catch (error) {
        // If token verification fails but we have customerId, deactivate all sessions for that customer
        if (customerId) {
          await CustomerSession.updateMany(
            { customerId: customerId, isActive: true },
            { isActive: false, loggedOutAt: new Date() }
          );
        }
      }
    }

    // If we have customerId but no tokens, still deactivate sessions
    if (customerId && !refreshToken && !accessToken) {
      await CustomerSession.updateMany(
        { customerId: customerId, isActive: true },
        { isActive: false, loggedOutAt: new Date() }
      );
    }

    return {
      message: "Logged out successfully",
      data: { timestamp: new Date().toISOString() }
    };
  } catch (error) {
    console.error("Logout error:", error);
    // Always return success even if something fails
    return {
      message: "Logged out successfully",
      data: { timestamp: new Date().toISOString() }
    };
  }
};


const changeMpin = async ({ customerId, currentMpin, newMpin, confirmMpin }) => {
  if (newMpin !== confirmMpin) {
    throw new ApiError(httpStatus.status.BAD_REQUEST, "New MPIN and confirm MPIN do not match");
  }

  const customer = await Customer.findById(customerId).select("+mpin");

  if (!customer || !customer.mpin) {
    throw new ApiError(httpStatus.status.BAD_REQUEST, "MPIN not set");
  }

  const isMatch = await bcrypt.compare(currentMpin, customer.mpin);

  if (!isMatch) {
    throw new ApiError(httpStatus.status.UNAUTHORIZED, "Current MPIN is incorrect");
  }

  const hashedMpin = await bcrypt.hash(newMpin, 10);
  customer.mpin = hashedMpin;
  await customer.save();

  return {
    message: "MPIN changed successfully",
    data: {
      customerId: customer._id,
      name: customer.name,
      email: customer.email,
    },
  };
};

module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin,
  resetMpin,
  logout,
  changeMpin
};