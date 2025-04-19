const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middlewares/auth');

router.post('/:itemId', auth, offerController.makeOffer);

router.get('/:itemId/offers', auth, offerController.viewOffers);

router.get('/:itemId', auth, offerController.viewOffersForItem);

router.post('/:itemId/offers/:offerId/accept', auth, offerController.acceptOffer);

module.exports = router;