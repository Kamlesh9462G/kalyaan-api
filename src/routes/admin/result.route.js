const express = require('express');
const router = express.Router();
const { resultController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());




router.post("/open", resultController.declareOpenResult);

router.post("/close", resultController.declareCloseResult);

router.post("/cancel-market", resultController.cancelMarket);

module.exports = router;