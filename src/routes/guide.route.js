const router = require("express").Router();
const {guideController} = require("../controllers/index");
const auth = require("../middlewares/auth");


router.get("/", auth(), guideController.getGuideSections);


module.exports = router;