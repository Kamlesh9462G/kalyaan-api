const express = require('express');
const router = express.Router();
const { notificationController } = require('../../controllers/admin/index');


const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);

// Get today's status
router.post('/', notificationController.sendNotification);




module.exports = router;