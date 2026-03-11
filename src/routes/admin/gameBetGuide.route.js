const express = require("express");
const {gameBetGuideController} = require("../../controllers/admin/index");

const router = express.Router();

/* Admin */
router.post("/", gameBetGuideController.createGameBetGuide);
router.patch("/:id", gameBetGuideController.updateGameBetGuide);
router.delete("/:id", gameBetGuideController.deleteGameBetGuide);

/* App */
router.get("/", gameBetGuideController.getGameBetGuides);

module.exports = router;