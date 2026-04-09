const express = require('express');
const router = express.Router();
const { resultController } = require('../../controllers/admin/index');


const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
router.use(auth);


router.get("/", resultController.getResults);

router.post("/open", resultController.declareOpenResult);

router.post("/close", resultController.declareCloseResult);

router.post("/cancel-market", resultController.cancelMarket);


router.post("/open-preview", resultController.openPreview);
router.post("/close-preview", resultController.closePreview);


module.exports = router;