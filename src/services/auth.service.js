const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const { Customer, Wallet, CustomerSession,Referral } = require("../models/index");
const otpService = require("./otp.service");
const tokenService = require("./token.service");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const sendOtp = async (email, purpose, referralCode) => {

  // 🔗 Validate referral only if user not already registered
  const existingCustomer = await Customer.findOne({ email });

  if (!existingCustomer && referralCode) {
    const referrer = await Customer.findOne({ referralCode });

    if (!referrer) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid referral code");
    }
  }

  await otpService.generateAndSendOtp(email, purpose);

  return {
    message: "OTP sent successfully",
    data: { email, purpose },
  };
};

const verifyOtp = async ({ email, otp, purpose, referralCode }) => {
  await otpService.verifyOtp(email, otp, purpose);

  let customer = await Customer.findOne({ email }).select("+mpin");
  let isNewCustomer = false;
  let referrer = null;

  // 👤 NEW USER FLOW
  if (!customer) {

    // 🔗 validate referral again (secure)
    if (referralCode) {
      referrer = await Customer.findOne({ referralCode });

      if (!referrer) {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid referral code");
      }
    }

    // create customer
    customer = await Customer.create({
      email,
      mpin: null,
      referredBy: referrer?._id || null
    });

    isNewCustomer = true;

    // 📊 create referral record
    if (referrer) {
      await Referral.create({
        referrer: referrer._id,
        referredUser: customer._id,
        status: "PENDING"
      });

      await Customer.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 }
      });
    }
  }

  // 💰 WALLET (safe for both new + existing)
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

  if (purpose === "FORGOT_MPIN") {
    resetToken = jwt.sign(
      { customerId: customer._id, type: "RESET_MPIN" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
  }

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
        console.log("Refresh token processing error:", error);

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
      console.log(`User ${customerId} logged out without tokens`);
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

module.exports = {
  sendOtp,
  verifyOtp,
  setMpin,
  verifyMpin,
  resetMpin,
  logout
};