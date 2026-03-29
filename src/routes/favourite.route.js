// routes/favourite.route.js
const router = require("express").Router();
const { favouriteController } = require("../controllers");
const auth = require("../middlewares/auth");

router.post("/", auth(), favouriteController.addFavourite);
router.get("/", auth(), favouriteController.getFavourites);
router.patch("/:id", auth(), favouriteController.updateFavourite);
router.delete("/:id", auth(), favouriteController.deleteFavourite);

module.exports = router;