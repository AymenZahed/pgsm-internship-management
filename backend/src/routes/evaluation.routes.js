const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { evaluationValidator, idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

// Doctor routes
router.post('/', roleMiddleware('doctor'), evaluationValidator, validate, evaluationController.createEvaluation);
router.get('/my-evaluations', roleMiddleware('doctor'), evaluationController.getDoctorEvaluations);
router.get('/pending', roleMiddleware('doctor'), evaluationController.getPendingEvaluations);
router.put('/:id', roleMiddleware('doctor', 'admin'), idParamValidator, validate, evaluationController.updateEvaluation);

// Student routes
router.get('/student', roleMiddleware('student'), evaluationController.getStudentEvaluations);

// Common
router.get('/:id', idParamValidator, validate, evaluationController.getEvaluationById);

module.exports = router;
