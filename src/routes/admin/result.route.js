const express = require('express');
const router = express.Router();
const { resultController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/open', resultController.declareOpenResult);
router.post('/close', resultController.declareCloseResult);



module.exports = router;