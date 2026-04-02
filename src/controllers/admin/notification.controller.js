const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { notificationService } = require('../../services');
const sendNotification = catchAsync(async (req, res) => {
    await notificationService.sendTestNotification(req.body.fcmToken);

    res.status(httpStatus.status.OK).json({
        message: "Test notification sent",
    });
});

module.exports = {
    sendNotification
};