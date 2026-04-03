const express = require("express");
const router = express.Router();
const { helpGuideController } = require("../controllers/index");



// Get (single)
router.get("/", helpGuideController.getHelpGuide);



module.exports = router;