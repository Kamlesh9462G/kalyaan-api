const express = require('express');
const router = express.Router();
const { walletController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/balance', walletController.addWalletBalance);
router.get("/transaction", walletController.getTransactions);

router.get('/deposit', walletController.getDepositRequests)
router.post('/deposit/:depositId/approve', walletController.approveDeposit);
router.post('/deposit/:depositId/reject', walletController.rejectDeposit);


router.get('/withdraw', walletController.getWithdrawRequests)
router.post('/withdraw/:withdrawId/approve', walletController.approveWithdraw);
router.post('/withdraw/:withdrawId/reject', walletController.rejectWithdraw);

module.exports = router;