const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { customerService, deviceService } = require('../services');

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
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.type !== 'access') {
      return res.status(httpStatus.status.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.status.UNAUTHORIZED,
        message: 'Invalid token type'
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

    // if (employee.refreshToken == null) {
    //   return res.status(httpStatus.status.UNAUTHORIZED).json({
    //     message: 'Session expired. Please login again.',
    //     code: 'SESSION_LOGGED_OUT',
    //   });
    // }

    // // Check if device is trusted (optional for extra security)
    // const deviceId = req.headers['x-device-id'];
    // if (deviceId) {
    //   const isDeviceTrusted = await deviceService.isDeviceTrusted(employee._id, deviceId);
    //   if (!isDeviceTrusted) {
    //     return res.status(httpStatus.status.UNAUTHORIZED).json({
    //       message: 'Untrusted device. Please login again.'
    //     });
    //   }
    // }

    req.customer = {
      customerId: customer._id,
      email: customer.email,
    };

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