const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { serviceValidator, idParamValidator } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', serviceController.getServices);
router.get('/departments', serviceController.getDepartments);
router.get('/:id', idParamValidator, validate, serviceController.getServiceById);
router.post('/', roleMiddleware('hospital', 'admin'), serviceValidator, validate, serviceController.createService);
router.put('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, serviceController.updateService);
router.delete('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, serviceController.deleteService);

module.exports = router;
