const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', idParamValidator, validate, notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', idParamValidator, validate, notificationController.deleteNotification);
router.delete('/clear-all', notificationController.clearAllNotifications);

module.exports = router;
