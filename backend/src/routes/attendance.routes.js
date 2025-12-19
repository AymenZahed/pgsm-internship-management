const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { attendanceValidator, idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Student routes
router.post('/', roleMiddleware('student'), attendanceValidator, validate, attendanceController.recordAttendance);
router.get('/my-attendance', roleMiddleware('student'), attendanceController.getMyAttendance);

// Doctor routes
router.get('/tutor/attendance', roleMiddleware('doctor'), attendanceController.getTutorAttendance);
router.get('/pending', roleMiddleware('doctor'), attendanceController.getPendingAttendance);
router.get('/history', roleMiddleware('doctor'), attendanceController.getAttendanceHistory);
router.get('/by-date', roleMiddleware('doctor'), attendanceController.getAttendanceByDate);
router.put('/:id/validate', roleMiddleware('doctor', 'admin'), idParamValidator, validate, attendanceController.validateAttendance);

module.exports = router;
