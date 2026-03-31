const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { notificationService } = require("../services");

// ✅ Get notifications
const getNotifications = catchAsync(async (req, res) => {
    const customerId = req.customer.customerId;

    const notifications = await notificationService.getUserNotifications(customerId);

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Notifications retrieved successfully",
        data: notifications
    });
});


// ✅ Mark single as read
const markAsRead = catchAsync(async (req, res) => {
    const customerId = req.customer.customerId;
    const { id } = req.params;

    await notificationService.markAsRead(customerId, id);

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Notification marked as read"
    });
});


// ✅ Mark all as read
const markAllAsRead = catchAsync(async (req, res) => {
    const customerId = req.customer.customerId;

    await notificationService.markAllAsRead(customerId);

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "All notifications marked as read"
    });
});


// ❌ Delete single
const deleteNotification = catchAsync(async (req, res) => {
    const customerId = req.customer.customerId;
    const { id } = req.params;

    await notificationService.deleteNotification(customerId, id);

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Notification deleted"
    });
});


// ❌ Delete all
const deleteAllNotifications = catchAsync(async (req, res) => {
    const customerId = req.customer.customerId;

    await notificationService.deleteAllNotifications(customerId);

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "All notifications deleted"
    });
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};