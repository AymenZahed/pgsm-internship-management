const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator, paginationValidator } = require('../utils/validators');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', paginationValidator, validate, adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', idParamValidator, validate, adminController.updateUser);
router.delete('/users/:id', idParamValidator, validate, adminController.deleteUser);

// Students management
router.get('/students', paginationValidator, validate, adminController.getStudents);
router.get('/students/:id', idParamValidator, validate, adminController.getStudentById);
router.put('/students/:id', idParamValidator, validate, adminController.updateStudent);
router.delete('/students/:id', idParamValidator, validate, adminController.deleteStudent);

// Hospitals management
router.get('/hospitals', paginationValidator, validate, adminController.getHospitals);
router.get('/hospitals/:id', idParamValidator, validate, adminController.getHospitalById);
router.post('/hospitals', adminController.createHospital);
router.put('/hospitals/:id', idParamValidator, validate, adminController.updateHospital);
router.delete('/hospitals/:id', idParamValidator, validate, adminController.deleteHospital);

// Internships management
router.get('/internships', paginationValidator, validate, adminController.getInternships);
router.get('/internships/:id', idParamValidator, validate, adminController.getInternshipById);

// Activity logs
router.get('/logs', paginationValidator, validate, adminController.getActivityLogs);

// Statistics
router.get('/statistics', adminController.getStatistics);

// Support tickets
router.get('/support', paginationValidator, validate, adminController.getSupportTickets);
router.get('/support/:id', idParamValidator, validate, adminController.getSupportTicketById);
router.put('/support/:id', idParamValidator, validate, adminController.updateSupportTicket);
router.post('/support/:id/reply', idParamValidator, validate, adminController.replySupportTicket);

// Configuration
router.get('/configuration', adminController.getConfiguration);
router.put('/configuration', adminController.updateConfiguration);

// Reports
router.get('/reports', adminController.getReports);
router.post('/reports/generate', adminController.generateReport);
router.get('/reports/:id/download', idParamValidator, validate, adminController.downloadReport);

// Export endpoints
router.get('/export/users', adminController.exportUsers);
router.get('/export/students', adminController.exportStudents);
router.get('/export/internships', adminController.exportInternships);

// Send email
router.post('/send-email', adminController.sendEmail);

module.exports = router;
