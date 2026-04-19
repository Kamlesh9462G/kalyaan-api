const express = require('express');
const router = express.Router();
const { appConfigController } = require('../../controllers/admin/index');


const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);

// Get today's status
router.post('/payment-features', appConfigController.addPaymentFeatures);
router.get('/payment-features', appConfigController.getPaymentFeatures);
router.patch('/payment-features/:id', appConfigController.updatePaymentFeatures);
router.delete('/payment-features/:id', appConfigController.deletePaymentFeatures);






module.exports = router;