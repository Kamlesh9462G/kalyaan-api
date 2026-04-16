const express = require('express');
const router = express.Router();
const { bannerController } = require('../controllers/index');


// Get today's status
router.get('/hero', bannerController.getHeroBanners);



router.get("/cta", bannerController.getCtaBanners);


router.get("/announcement", bannerController.getAnnouncementBanners);





module.exports = router;