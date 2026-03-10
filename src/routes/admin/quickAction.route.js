const express = require('express');
const router = express.Router();
const { quickActionController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', quickActionController.addQuickAction);
router.get('/', quickActionController.getQuickActions);



module.exports = router;