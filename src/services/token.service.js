const jwt = require("jsonwebtoken");
const httpStatus = require('http-status');

const CustomerSession = require("../models/customerSession.model");
const Device = require("../models/device.model");
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

  // 🔑 Generate tokens
  const accessToken = jwt.sign(
    { customerId: customer._id, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    {
      customerId: customer._id,
      deviceId: device.deviceId,
      type: "refresh"
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
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Session not found");
    }

    // 🔒 Validate stored refresh token
    if (session.refreshToken !== refreshToken) {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Invalid refresh token");
    }

    // ✨ Generate new access token
    const newAccessToken = jwt.sign(
      { customerId: payload.customerId, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // 🕒 Update last used
    session.lastUsedAt = new Date();
    await session.save();


    return newAccessToken;
    

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      throw new ApiError(httpStatus.status.UNAUTHORIZED, "Refresh token expired");
    }

    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
};

// module.exports = { refreshAccessToken };