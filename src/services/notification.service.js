const Notification = require("../models/notification.model");

// Get notifications
const getUserNotifications = async (customerId) => {
    return Notification.find({
        customerId: customerId,
        isDeleted: false
    }).sort({ createdAt: -1 });
};


// Mark single as read
const markAsRead = async (customerId, id) => {
    return Notification.findOneAndUpdate(
        { _id: id, customerId: customerId },
        {
            isRead: true,
            readAt: new Date()
        },
        { new: true }
    );
};


// Mark all as read
const markAllAsRead = async (customerId) => {
    return Notification.updateMany(
        { customerId: customerId, isRead: false },
        {
            isRead: true,
            readAt: new Date()
        }
    );
};


// Delete single (soft delete)
const deleteNotification = async (customerId, id) => {
    return Notification.findOneAndUpdate(
        { _id: id, customerId: customerId },
        { isDeleted: true },
        { new: true }
    );
};


// Delete all
const deleteAllNotifications = async (customerId) => {
    return Notification.updateMany(
        { customerId: customerId },
        { isDeleted: true }
    );
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};