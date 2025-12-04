const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutor.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Doctor dashboard and students
router.get('/dashboard', roleMiddleware('doctor'), tutorController.getDoctorDashboard);
router.get('/students', roleMiddleware('doctor'), tutorController.getDoctorStudents);
router.get('/students/:id', roleMiddleware('doctor'), idParamValidator, validate, tutorController.getDoctorStudentById);

// Hospital tutor management
router.get('/', roleMiddleware('hospital'), tutorController.getHospitalTutors);
router.get('/:id', idParamValidator, validate, tutorController.getTutorById);
router.post('/', roleMiddleware('hospital', 'admin'), tutorController.addTutor);
router.put('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, tutorController.updateTutor);
router.delete('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, tutorController.removeTutor);
router.post('/assign', roleMiddleware('hospital', 'admin'), tutorController.assignStudent);

// Get departments for filtering
router.get('/filter/departments', tutorController.getDepartments);

module.exports = router;
