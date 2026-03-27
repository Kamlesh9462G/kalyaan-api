// routes/bet.route.js
const router = require("express").Router();
const {accountController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.post("/bank", auth(), accountController.addBankAccount);
router.get("/bank", auth(), accountController.getBankAccounts);
router.patch("/bank",auth(),accountController.updateBankAccount)
router.delete("/bank",auth(),accountController.deleteBankAccount)


router.post("/upi", auth(), accountController.addUpiAccount);
router.get("/upi", auth(), accountController.getUpiAccounts);
router.patch("/upi",auth(),accountController.updateUpiAccount)
router.delete("/upi",auth(),accountController.deleteUpiAccount)

module.exports = router;