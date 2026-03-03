const jwt = require("jsonwebtoken");
const CustomerSession = require("../models/customerSession.model");
const Device = require("../models/device.model");

exports.createSession = async (customer, device) => {
  // upsert device
  const savedDevice = await Device.findOneAndUpdate(
    { customerId: customer._id, deviceId: device.deviceId },
    { ...device, customerId: customer._id, lastLoginAt: new Date() },
    { upsert: true, new: true }
  );

  if (savedDevice.isBlocked) {
    throw new Error("Device blocked");
  }

  const accessToken = jwt.sign(
    { customerId: customer._id, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { customerId: customer._id, deviceId: device.deviceId },
    process.env.JWT_SECRET,
    { expiresIn: "60d" }
  );

  await CustomerSession.findOneAndUpdate(
    { customerId: customer._id, deviceId: device.deviceId },
    { refreshToken, isActive: true, lastUsedAt: new Date() },
    { upsert: true }
  );

  return { accessToken, refreshToken };
};