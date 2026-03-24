const express = require("express");
const router = express.Router();
const { authController } = require("../controllers/index");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

router.post("/set-mpin", authController.setMpin);
router.post("/verify-mpin", authController.verifyMpin);
router.post("/reset-mpin", authController.resetMpin); // ✅ NEW

router.post("/refresh-token", authController.refreshTokens);

router.post("/logout", authController.logout);

module.exports = router;