const express = require('express');
const router = express.Router();
const { walletController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/balance', walletController.addWalletBalance);

router.post('/deposit/:depositId/approve', walletController.approveDeposit);

router.post('/withdraw/:withdrawId/approve', walletController.approveWithdraw);

module.exports = router;