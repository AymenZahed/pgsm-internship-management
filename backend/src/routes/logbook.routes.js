const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbook.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { logbookValidator, idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Student routes
router.post('/', roleMiddleware('student'), logbookValidator, validate, logbookController.createEntry);
router.get('/my-entries', roleMiddleware('student'), logbookController.getMyEntries);
router.put('/:id', roleMiddleware('student'), idParamValidator, validate, logbookController.updateEntry);
router.delete('/:id', roleMiddleware('student'), idParamValidator, validate, logbookController.deleteEntry);

// Doctor routes
router.get('/pending', roleMiddleware('doctor'), logbookController.getPendingEntries);
router.get('/reviewed', roleMiddleware('doctor'), logbookController.getReviewedEntries);
router.put('/:id/review', roleMiddleware('doctor', 'admin'), idParamValidator, validate, logbookController.reviewEntry);

// Common
router.get('/:id', idParamValidator, validate, logbookController.getEntryById);

module.exports = router;
