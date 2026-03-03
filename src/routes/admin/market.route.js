const express = require('express');
const router = express.Router();
const { marketController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', marketController.addMarket);
router.get('/', marketController.getMarket);



module.exports = router;