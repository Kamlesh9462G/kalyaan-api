// routes/bet.route.js
const router = require("express").Router();
const { walletController,rateController } = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/activity", auth(), walletController.getTransactions);
router.get("/guide", auth(), rateController.getRates);


router.get('/', auth(), walletController.getCustomerWallet)
router.post("/deposit", auth(), walletController.createDeposit);
router.post("/withdraw", auth(), walletController.createWithdraw);
router.get('/withdraws', auth(), walletController.getPendingWithdraws)
module.exports = router;