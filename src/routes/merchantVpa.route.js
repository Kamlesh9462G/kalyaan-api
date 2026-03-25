const express = require('express');
const router = express.Router();
const { merchantVpaController } = require('../controllers/index');
const auth = require("../middlewares/auth");


// // All routes require authentication
// router.use(auth());

// Get today's status
router.get('/', auth(), merchantVpaController.getMerchantVpas);




module.exports = router;