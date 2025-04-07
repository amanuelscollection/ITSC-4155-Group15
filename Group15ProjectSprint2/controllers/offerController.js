const Offer = require('../models/offerModel');
const Item = require('../models/itemModel');

exports.makeOffer = async (req, res) => {
    const { amount } = req.body;
    const itemId = req.params.itemId;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).render('error', { errorMessage: 'Item not found.' });
        }

        if (req.session.userId === item.seller) {
            return res.status(401).render('error', { errorMessage: 'You cannot make an offer on your own item.' });
        }

        const newOffer = new Offer({
            amount: parseFloat(amount), 
            item: itemId,
            user: req.session.userId
        });

        await newOffer.save();

        const updates = { $push: { offers: newOffer._id }, $inc: { totalOffers: 1 } };
        if (!item.highestOffer || parseFloat(amount) > item.highestOffer) {
            updates.highestOffer = parseFloat(amount); 
        }

        await Item.findByIdAndUpdate(itemId, updates);

        req.flash('success', 'Your offer has been made successfully!');
        res.redirect(`/items/${itemId}`);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'An error occurred while making the offer.' });
    }
};


exports.viewOffers = async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const offers = await Offer.find({ item: itemId }).populate('user', 'firstName lastName');
        res.render('offers', { offers, itemId });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};

exports.viewOffersForItem = async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).render('error', { errorMessage: 'Item not found.' });
        }

        if (req.session.userId !== item.seller) {
            return res.status(401).render('error', { errorMessage: 'You are not authorized to view offers for this item.' });
        }

        const offers = await Offer.find({ item: itemId }).populate('user', 'firstName lastName');
        res.render('offers/offers', { offers, item });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};

exports.acceptOffer = async (req, res) => {
    const { offerId } = req.params;
    const itemId = req.params.itemId;

    try {
        const offer = await Offer.findById(offerId).populate('item');
        if (!offer) return res.status(404).render('error', { errorMessage: 'Offer not found.' });

        if (!req.session.userId) {
            return res.redirect('/users/login');
        }

        if (req.session.userId !== offer.item.seller.toString()) {
            return res.status(401).render('error', { errorMessage: 'You are not authorized to accept this offer.' });
        }

        await Item.findByIdAndUpdate(itemId, { active: false });

        offer.status = 'accepted';
        await offer.save();

        await Offer.updateMany({ item: itemId, _id: { $ne: offerId } }, { status: 'rejected' });

        res.redirect(`/offers/${itemId}`);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};


