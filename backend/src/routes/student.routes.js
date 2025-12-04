const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Student dashboard
router.get('/dashboard', roleMiddleware('student'), studentController.getStudentDashboard);

// Student internships (own)
router.get('/my-internships', roleMiddleware('student'), studentController.getMyInternships);
router.get('/my-internships/:id', roleMiddleware('student'), idParamValidator, validate, studentController.getMyInternshipById);

// Admin/Hospital/Doctor access
router.get('/', roleMiddleware('admin', 'hospital', 'doctor'), studentController.getAllStudents);
router.get('/departments', studentController.getDepartments);
router.get('/:id', roleMiddleware('admin', 'hospital', 'doctor'), idParamValidator, validate, studentController.getStudentById);
router.get('/:id/internships', idParamValidator, validate, studentController.getStudentInternships);
router.get('/:id/applications', idParamValidator, validate, studentController.getStudentApplications);

module.exports = router;
