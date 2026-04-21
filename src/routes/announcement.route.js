const express = require('express');
const router = express.Router();
const { announcementController } = require('../controllers/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.get('/', announcementController.getAnnouncement);






module.exports = router;