const express = require('express');
const router = express.Router();
const { resultController } = require('../controllers/index');


// // All routes require authentication
// router.use(auth());



router.get("/history", resultController.getResultHistory);



module.exports = router;