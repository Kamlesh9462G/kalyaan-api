const express = require("express");
const { dashboardController } = require("../../controllers/admin/index");

const router = express.Router();


// const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);


router.get("/stats", dashboardController.getDashboardStats);



module.exports = router;