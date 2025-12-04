const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Public contact form (no auth required)
router.post('/contact', supportController.submitContactForm);

// Authenticated routes
router.use(authMiddleware);

// User support tickets
router.get('/my-tickets', supportController.getMyTickets);
router.post('/tickets', supportController.createTicket);
router.get('/tickets/:id', supportController.getTicketById);
router.post('/tickets/:id/reply', supportController.replyToTicket);

module.exports = router;
