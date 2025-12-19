const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const documentController = require('../controllers/document.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

router.use(authMiddleware);

// Profile-level documents (student uploads reusable docs to their profile)
router.post(
    '/profile/documents',
    uploadSingle('document'),
    handleUploadError,
    documentController.uploadProfileDocument
);

router.get('/profile/documents', documentController.getMyProfileDocuments);

router.delete('/profile/documents/:id', documentController.deleteProfileDocument);

// User profile & settings
router.get('/profile', userController.getProfile);
router.get('/profile/:id', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/avatar', uploadSingle('avatar'), handleUploadError, userController.updateAvatar);
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

module.exports = router;
