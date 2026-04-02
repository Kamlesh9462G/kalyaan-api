const express = require('express');
const router = express.Router();
const { notificationController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', notificationController.sendNotification);




module.exports = router;