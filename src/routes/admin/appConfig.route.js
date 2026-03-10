const express = require('express');
const router = express.Router();
const { appConfigController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/payment-features', appConfigController.addPaymentFeatures);
router.get('/payment-features', appConfigController.getPaymentFeatures);
router.patch('/payment-features', appConfigController.updatePaymentFeatures);






module.exports = router;