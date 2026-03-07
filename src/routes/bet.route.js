// routes/bet.route.js
const router = require("express").Router();
const {betController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.post("/place", auth(), betController.placeBet);
router.get("/history", auth(), betController.getBetHistory);


module.exports = router;