const express = require('express');
const router = express.Router();
const { betTypeController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', betTypeController.addBetType);
router.get('/', betTypeController.getBetTypes);



module.exports = router;