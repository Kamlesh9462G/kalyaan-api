const express = require("express");
const router = express.Router();
const { helpGuideController } = require("../../controllers/admin/index");

const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
router.use(auth);


// Create
router.post("/", helpGuideController.createHelpGuide);

// Get (single)
router.get("/", helpGuideController.getHelpGuide);

// Update
router.patch("/:id", helpGuideController.updateHelpGuide);

// Delete
router.delete("/:id", helpGuideController.deleteHelpGuide);

// Add Quick Guide
router.post("/:id/quick-guide", helpGuideController.addQuickGuide);

// Update Quick Guide
router.put("/:id/quick-guide/:qId", helpGuideController.updateQuickGuide);

// Delete Quick Guide
router.delete("/:id/quick-guide/:qId", helpGuideController.deleteQuickGuide);

module.exports = router;