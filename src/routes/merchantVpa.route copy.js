const express = require('express');
const router = express.Router();
const { merchantVpaController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', merchantVpaController.addMerchantVpa);
router.get('/', merchantVpaController.getMerchantVpas);
router.patch('/:id', merchantVpaController.updateMerchantVpa);
router.delete('/:id', merchantVpaController.deleteMerchantVpa);



module.exports = router;