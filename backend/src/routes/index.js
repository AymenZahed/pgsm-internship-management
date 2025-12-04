const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const hospitalRoutes = require('./hospital.routes');
const tutorRoutes = require('./tutor.routes');
const serviceRoutes = require('./service.routes');
const offerRoutes = require('./offer.routes');
const applicationRoutes = require('./application.routes');
const attendanceRoutes = require('./attendance.routes');
const logbookRoutes = require('./logbook.routes');
const evaluationRoutes = require('./evaluation.routes');
const documentRoutes = require('./document.routes');
const messageRoutes = require('./message.routes');
const notificationRoutes = require('./notification.routes');
const supportRoutes = require('./support.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/tutors', tutorRoutes);
router.use('/services', serviceRoutes);
router.use('/offers', offerRoutes);
router.use('/applications', applicationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/logbook', logbookRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/documents', documentRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
