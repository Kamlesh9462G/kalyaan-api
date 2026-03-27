const express = require('express');
const router = express.Router();
const { referralSettingsController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', referralSettingsController.createReferralSettings);
router.get('/', referralSettingsController.getReferralSettings);
router.patch('/', referralSettingsController.updateReferralSettings);



module.exports = router;