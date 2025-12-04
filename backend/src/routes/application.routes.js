const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { applicationValidator, idParamValidator, paginationValidator } = require('../utils/validators');

router.use(authMiddleware);

// Student routes
router.post('/', roleMiddleware('student'), applicationValidator, validate, applicationController.createApplication);
router.get('/my-applications', roleMiddleware('student'), applicationController.getMyApplications);
router.post('/:id/withdraw', roleMiddleware('student'), idParamValidator, validate, applicationController.withdrawApplication);

// Hospital routes
router.get('/received', roleMiddleware('hospital'), paginationValidator, validate, applicationController.getHospitalApplications);
router.put('/:id/status', roleMiddleware('hospital', 'admin'), idParamValidator, validate, applicationController.updateApplicationStatus);

// Get filter options (departments)
router.get('/departments', applicationController.getDepartments);

// Common
router.get('/:id', idParamValidator, validate, applicationController.getApplicationById);

module.exports = router;
