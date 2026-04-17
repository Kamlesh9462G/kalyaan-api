const router = require("express").Router();
const { marketController,betController } = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/", auth(), marketController.getMarketsWithResult);

router.get("/category/:id",
    // auth(),
    marketController.getMarketBetTypes);



router.post("/submit", auth(), betController.placeBet);

module.exports = router;