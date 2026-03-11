const express = require("express");
const { faqController } = require("../../controllers/admin/index");

const router = express.Router();

/* Admin */
router.post("/", faqController.createFaq);
router.patch("/:id", faqController.updateFaq);
router.delete("/:id", faqController.deleteFaq);

/* App */
router.get("/", faqController.getFaqs);

module.exports = router;