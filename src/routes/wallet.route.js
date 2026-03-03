// routes/bet.route.js
const router = require("express").Router();
const {walletController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/transaction", auth(), walletController.getTransactions);

module.exports = router;