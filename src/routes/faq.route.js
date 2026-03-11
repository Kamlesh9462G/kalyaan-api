const express = require("express");
const { faqController } = require("../controllers/index");

const router = express.Router();



/* App */
router.get("/", faqController.getFaqs);

module.exports = router;