const express = require('express');
const router = express.Router();
const { quickActionController } = require('../controllers/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.get('/', quickActionController.getQuickActions);



module.exports = router;