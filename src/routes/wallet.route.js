// routes/bet.route.js
const router = require("express").Router();
const {walletController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/transaction", auth(), walletController.getTransactions);

router.get('/',auth(), walletController.getCustomerWallet)
router.post("/deposit", auth(), walletController.createDeposit);
router.post("/withdraw", auth(), walletController.createWithdraw);
module.exports = router;