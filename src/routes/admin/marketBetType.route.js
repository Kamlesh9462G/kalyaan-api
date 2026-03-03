const express = require('express');
const router = express.Router();
const { marketBetTypeController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', marketBetTypeController.addMarketBetType);
router.get('/', marketBetTypeController.getMarketBetType);



module.exports = router;