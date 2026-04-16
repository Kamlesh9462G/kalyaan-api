const express = require('express');
const router = express.Router();
const { bannerController } = require('../../controllers/admin/index');


// const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);

// Get today's status
router.post('/hero', bannerController.addHeroBanner);
router.get('/hero', bannerController.getHeroBanners);
router.patch('/hero/:id', bannerController.updateHeroBanner);
router.delete('/hero/:id', bannerController.deleteHeroBanner);


router.post("/cta", bannerController.addCtaBanner);
router.get("/cta", bannerController.getCtaBanners);
router.patch("/cta/:id", bannerController.updateCtaBanner);
router.delete("/cta/:id", bannerController.deleteCtaBanner);

router.post("/announcement", bannerController.addAnnouncementBanner);
router.get("/announcement", bannerController.getAnnouncementBanners);
router.patch("/announcement/:id", bannerController.updateAnnouncementBanner);
router.delete("/announcement/:id", bannerController.deleteAnnouncementBanner);




module.exports = router;