const express = require('express');
const router = express.Router();
const { supportController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/tickets/:ticketId/reply', supportController.adminReplyToTicket);



module.exports = router;