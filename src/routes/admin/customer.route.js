const express = require('express');
const router = express.Router();
const { customerController } = require('../../controllers/admin/index');




router.get("/", customerController.getCustomers);

module.exports = router;