const express = require('express');
const router = express.Router();
const { appConfigController } = require('../controllers/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.get('/payment-features', appConfigController.getPaymentFeatures);






module.exports = router;