const express = require('express');
const router = express.Router();
const { betController } = require('../../controllers/admin/index');



const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
router.use(auth);

router.get("/", betController.getBetHistory);

module.exports = router;