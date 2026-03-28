const router = require("express").Router();
const { referralController } = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/status", referralController.getReferralStatus);
router.get("/settings", referralController.getReferralSettings);
router.get("/history", auth(), referralController.getReferralHistory);


module.exports = router;