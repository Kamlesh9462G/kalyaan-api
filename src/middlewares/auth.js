const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { customerService, deviceService } = require('../services');
const {BlacklistedToken,CustomerSession} = require('../models/index');

const auth = () => catchAsync(async (req, res, next) => {
  console.log("Auth middleware called");
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(httpStatus.status.UNAUTHORIZED).json({
      success: false,
      status: httpStatus.status.UNAUTHORIZED,
      message: 'Authentication required'
    });
  }

  try {
    // ✅ CRITICAL: Check if token is blacklisted FIRST
    const isBlacklisted = await BlacklistedToken.findOne({ token: token });
    if (isBlacklisted) {
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'Session expired. Please login again.',
        code: 'TOKEN_REVOKED'
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log(payload)
    if (payload.type !== 'access') {
      console.log("came inside this")
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'Invalid token type'
      });
    }

    console.log("came here")

    // Optional: Check if session is still active
    const session = await CustomerSession.findOne({
      customerId: payload.customerId,
      isActive: true,
    });

    console.log(session)

    // If you want to also check if ANY session is active (not just device-specific)
    // This ensures if user logged out from all devices, all tokens are invalid
    if (!session) {
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'No active session found. Please login again.',
        code: 'NO_ACTIVE_SESSION'
      });
    }

    const customer = await customerService.getCustomer({ _id: payload.customerId });

    if (!customer) {
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'User not found or inactive'
      });
    }

    req.customer = {
      customerId: customer._id,
      email: customer.email,
    };
    req.accessToken = token; // Store token for potential blacklisting

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(httpStatus.status.UNAUTHORIZED).json({
      success: false,
      status: httpStatus.status.UNAUTHORIZED,
      message: 'Invalid token'
    });
  }
});

module.exports = auth;