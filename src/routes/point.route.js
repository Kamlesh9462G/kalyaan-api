// routes/bet.route.js
const router = require("express").Router();
const { walletController } = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/activity", auth(), walletController.getTransactions);

router.get('/', auth(), walletController.getCustomerWallet)
router.post("/deposit", auth(), walletController.createDeposit);
router.post("/withdraw", auth(), walletController.createWithdraw);
router.get('/withdraws', auth(), walletController.getPendingWithdraws)
module.exports = router;