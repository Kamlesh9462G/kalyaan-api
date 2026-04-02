const Notification = require("../models/notification.model");
const  admin  = require("../config/firebase");

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

const sendTestNotification = async (fcmToken) => {
    const message = {
        token: fcmToken,
        notification: {
            title: "Test Notification 🚀",
            body: "This is a test push notification",
        },
        android: {
            notification: {
                sound: "default", // 🔥 THIS enables beep
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                },
            },
        },
        data: {
            type: "TEST",
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    sendTestNotification
};