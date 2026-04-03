// routes/user.routes.js
const express = require("express");
const router = express.Router();

const { userController } = require("../../controllers/admin/index");
const { auth, requireSuperAdmin } = require("../../middlewares/admin/auth.middleware");

// Public
router.post("/login", userController.login);

// Protected
router.post(
    "/create-admin",
    // auth,
    // requireSuperAdmin,
    userController.createAdmin
);

module.exports = router;