const router = require("express").Router();
const { notificationController } = require("../controllers");
const auth = require("../middlewares/auth");

// Get all notifications
router.get("/", auth(), notificationController.getNotifications);

// ✅ Mark single as read
router.patch("/:id/read", auth(), notificationController.markAsRead);

// ✅ Mark all as read
router.patch("/read-all", auth(), notificationController.markAllAsRead);

// ❌ Delete single notification
router.delete("/:id", auth(), notificationController.deleteNotification);

// ❌ Delete all notifications
router.delete("/", auth(), notificationController.deleteAllNotifications);

module.exports = router;