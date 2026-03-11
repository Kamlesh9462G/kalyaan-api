const express = require('express');
const router = express.Router();
const { supportController } = require('../controllers/index');

const auth = require("../middlewares/auth");

// // All routes require authentication
router.use(auth());

// Get today's status
router.post('/tickets', auth(), supportController.createTicket);
router.post('/tickets/:ticketId/reply', auth(), supportController.replyToTicket);


router.get(
    "/tickets",
    auth(),
    supportController.getTickets
);


module.exports = router;