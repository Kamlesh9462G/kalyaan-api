const router = require("express").Router();
const {marketController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/", auth(), marketController.getMarketsWithResult);

router.get("/:id/bet-type", 
    // auth(),
     marketController.getMarketBetTypes);


module.exports = router;