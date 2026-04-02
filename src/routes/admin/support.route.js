const express = require('express');
const router = express.Router();
const { supportController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.get('/tickets', supportController.getTickets);
router.post('/tickets/:ticketId/reply', supportController.adminReplyToTicket);
router.patch('/tickets/:ticketId/status', supportController.updateTicketStatus);



module.exports = router;