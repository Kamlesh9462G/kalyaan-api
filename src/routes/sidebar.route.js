const express = require('express');
const router = express.Router();
const { sidebarController } = require('../controllers/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', sidebarController.addSidebar);
router.get('/', sidebarController.getSidebars);
router.get('/app', sidebarController.getAPPSidebars);




module.exports = router;