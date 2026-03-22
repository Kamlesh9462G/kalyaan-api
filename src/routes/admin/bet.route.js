const express = require('express');
const router = express.Router();
const { betController } = require('../../controllers/admin/index');



router.get("/", betController.getBetHistory);

module.exports = router;