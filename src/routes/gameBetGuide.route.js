const express = require("express");
const { gameBetGuideController } = require("../controllers/index");

const router = express.Router();



router.get("/", gameBetGuideController.getGameBetGuides);

module.exports = router;