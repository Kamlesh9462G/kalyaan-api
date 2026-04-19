const express = require('express');
const router = express.Router();
const { customerController } = require('../../controllers/admin/index');

const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');



router.get("/",  customerController.getCustomers);

module.exports = router;