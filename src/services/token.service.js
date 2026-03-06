const jwt = require("jsonwebtoken");
const httpStatus = require('http-status');

const CustomerSession = require("../models/customerSession.model");
const Device = require("../models/device.model");

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