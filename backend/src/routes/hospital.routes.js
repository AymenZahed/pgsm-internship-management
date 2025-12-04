const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Hospital dashboard
router.get('/dashboard', roleMiddleware('hospital'), hospitalController.getHospitalDashboard);
router.get('/students', roleMiddleware('hospital'), hospitalController.getHospitalStudents);
router.get('/statistics', roleMiddleware('hospital'), hospitalController.getHospitalStatistics);

// Hospital profile
router.get('/profile', roleMiddleware('hospital'), hospitalController.getHospitalProfile);
router.put('/profile', roleMiddleware('hospital'), hospitalController.updateHospitalProfile);

// Public listing
router.get('/', hospitalController.getAllHospitals);
router.get('/:id', idParamValidator, validate, hospitalController.getHospitalById);

module.exports = router;
