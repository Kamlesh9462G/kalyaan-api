const router = require("express").Router();
const { rateController } = require("../controllers/index");
const auth = require("../middlewares/auth");

router.get("/",
    //  auth(), 
     rateController.getRates);


module.exports = router;