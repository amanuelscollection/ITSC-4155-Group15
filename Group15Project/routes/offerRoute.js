const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middlewares/auth');

// Make an offer
router.post('/:itemId', auth, offerController.makeOffer);

// View offers for an item
router.get('/:itemId/offers', auth, offerController.viewOffers);

// View specific item details (including offers)
router.get('/:itemId', auth, offerController.viewOffersForItem);

// Accept an offer
router.post('/:itemId/offers/:offerId/accept', auth, offerController.acceptOffer);

module.exports = router;