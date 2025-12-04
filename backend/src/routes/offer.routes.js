const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { offerValidator, idParamValidator, paginationValidator } = require('../utils/validators');

// Public routes
router.get('/', paginationValidator, validate, offerController.getAllOffers);
router.get('/filter-options', offerController.getFilterOptions);
router.get('/departments', offerController.getDepartments);

router.use(authMiddleware);

// Hospital routes
router.get('/my-offers', roleMiddleware('hospital'), offerController.getHospitalOffers);
router.get('/:id', idParamValidator, validate, offerController.getOfferById);
router.post('/', roleMiddleware('hospital', 'admin'), offerValidator, validate, offerController.createOffer);
router.put('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, offerController.updateOffer);
router.delete('/:id', roleMiddleware('hospital', 'admin'), idParamValidator, validate, offerController.deleteOffer);
router.post('/:id/copy', roleMiddleware('hospital', 'admin'), idParamValidator, validate, offerController.copyOffer);

module.exports = router;
