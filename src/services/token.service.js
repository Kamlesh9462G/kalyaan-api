const jwt = require("jsonwebtoken");
const httpStatus = require('http-status');
const { ObjectId } = require("mongodb");

const CustomerSession = require("../models/customerSession.model");
const Device = require("../models/device.model");
const BlacklistedToken = require("../models/blacklistedToken.model");
const ApiError = require("../utils/ApiError");

exports.createSession = async (customer, device) => {
  if (!device?.deviceId) {
    throw new ApiError(
      httpStatus.status.BAD_REQUEST,
      "Device information is required"
    );
  }

  // 📱 Upsert device
  const savedDevice = await Device.findOneAndUpdate(
    { customerId: customer._id, deviceId: device.deviceId },
    {
      ...device,
      customerId: customer._id,
      lastLoginAt: new Date(),
    },
    { upsert: true, new: true }
  );

  if (savedDevice.isBlocked) {
    throw new ApiError(
      httpStatus.status.FORBIDDEN,
      "This device has been blocked"
    );
  }

  // 🔑 Generate tokens with unique IDs (jti)
  const jti = new ObjectId().toString();
  const accessToken = jwt.sign(
    { 
      customerId: customer._id, 
      type: "access",
      jti: jti
    },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshJti = new ObjectId().toString();
  const refreshToken = jwt.sign(
    {
      customerId: customer._id,
      deviceId: device.deviceId,
      type: "refresh",
      jti: refreshJti
    },
    process.env.JWT_SECRET,
    { expiresIn: "60d" }
  );

  // 💾 Store session
  await CustomerSession.findOneAndUpdate(
    { customerId: customer._id, deviceId: device.deviceId },
    {
      refreshToken,
      isActive: true,
      lastUsedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError(httpStatus.status.BAD_REQUEST, "Refresh token required");
    }

    // Check if refresh token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token: refreshToken });
    if (isBlacklisted) {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Token has been revoked. Please login again.");
    }

    // 🔑 Verify token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (payload.type !== "refresh") {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid token type");
    }

    // 🔎 Find session
    const session = await CustomerSession.findOne({
      customerId: payload.customerId,
      deviceId: payload.deviceId,
      isActive: true,
    });

    if (!session) {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Session not found or inactive");
    }

    // 🔒 Validate stored refresh token
    if (session.refreshToken !== refreshToken) {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid refresh token");
    }

    // ✨ Generate new access token
    const newAccessToken = jwt.sign(
      { 
        customerId: payload.customerId, 
        type: "access",
        jti: new ObjectId().toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // 🕒 Update last used
    session.lastUsedAt = new Date();
    await session.save();

    return newAccessToken;
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Refresh token expired");
    }
    throw new ApiError(httpStatus.status.UNAUTHORIZED, error.message || "Invalid refresh token");
  }
};

// Blacklist access token
exports.blacklistAccessToken = async (accessToken, customerId) => {
  try {
    const decoded = jwt.decode(accessToken);
    if (!decoded || !decoded.exp) {
      return;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    
    await BlacklistedToken.create({
      token: accessToken,
      tokenType: "access",
      customerId: customerId,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Error blacklisting access token:", error);
  }
};

// Blacklist refresh token
exports.blacklistRefreshToken = async (refreshToken, customerId) => {
  try {
    const decoded = jwt.decode(refreshToken);
    if (!decoded || !decoded.exp) {
      return;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    
    await BlacklistedToken.create({
      token: refreshToken,
      tokenType: "refresh",
      customerId: customerId,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Error blacklisting refresh token:", error);
  }
};

// Invalidate all sessions for a customer (logout from all devices)
exports.invalidateAllSessions = async (customerId) => {
  // Deactivate all active sessions
  await CustomerSession.updateMany(
    { customerId: customerId, isActive: true },
    { isActive: false, loggedOutAt: new Date() }
  );
  
  // Note: Blacklisting all refresh tokens would require fetching them from sessions
  // This is optional and can be done if needed
};