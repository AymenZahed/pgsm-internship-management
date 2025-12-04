const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadMultiple, handleUploadError } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { messageValidator } = require('../utils/validators');

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.getOrCreateConversation);
router.get('/conversations/:conversation_id/messages', messageController.getMessages);
router.post('/', uploadMultiple('attachment', 5), handleUploadError, messageController.sendMessage);
router.get('/unread', messageController.getUnreadCount);

module.exports = router;
