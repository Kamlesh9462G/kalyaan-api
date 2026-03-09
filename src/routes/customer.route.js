const router = require("express").Router();
const {customerController} = require("../controllers/index");
const auth = require("../middlewares/auth");

router.post("/set-name", customerController.setCustomerName);

router.get("/profile", auth, customerController.getCustomerProfile);


module.exports = router;