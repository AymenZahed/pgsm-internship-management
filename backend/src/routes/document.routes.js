const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

router.post('/upload', uploadSingle('document'), handleUploadError, documentController.uploadDocument);
router.get('/', documentController.getMyDocuments);
router.get('/:id', idParamValidator, validate, documentController.getDocumentById);
router.get('/:id/download', idParamValidator, validate, documentController.downloadDocument);
router.delete('/:id', idParamValidator, validate, documentController.deleteDocument);
router.put('/:id/verify', roleMiddleware('admin', 'hospital'), idParamValidator, validate, documentController.verifyDocument);

module.exports = router;
