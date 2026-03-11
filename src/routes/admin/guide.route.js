const express = require('express');
const router = express.Router();
const { guideController } = require('../../controllers/admin/index');



/* Admin */
router.post("/", guideController.createGuideSection);
router.patch("/:id", guideController.updateGuideSection);
router.delete("/:id", guideController.deleteGuideSection);

/* Public */
router.get("/", guideController.getGuideSections);
router.get("/:id", guideController.getGuideSectionById);

module.exports = router;