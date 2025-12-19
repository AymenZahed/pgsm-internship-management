const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { validate } = require('../middlewares/validation.middleware');
// Add validator later if needed

router.post('/contact', supportController.contactSupport);

module.exports = router;
