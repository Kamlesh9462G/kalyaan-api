// routes/bet.route.js
const router = require("express").Router();
const {accountController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.post("/bank", auth(), accountController.addBankAccount);
router.get("/bank", auth(), accountController.getBankAccounts);
router.post("/upi", auth(), accountController.addUpiAccount);
router.get("/upi", auth(), accountController.getUpiAccounts);

module.exports = router;