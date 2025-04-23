const multer = require('multer');
const path = require('path');
const validator = require('validator');
const Item = require('../models/itemModel');
const Offer = require('../models/offerModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: File type not supported');
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

exports.upload = upload;

exports.getAllItems = async (req, res) => {
    try {
        const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
        const items = await Item.find({ active: true });
        
        const filteredItems = items.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.seller.toLowerCase().includes(searchTerm)
        );
        const sortedItems = filteredItems.sort((a, b) => a.price - b.price);
        res.render('items', { items: sortedItems, searchTerm });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId).populate('seller', 'firstName lastName');
        if (item) {
            res.render('item-detail', { 
                item: item, 
                userId: req.session.userId
            });
        } else {
            res.status(404).render('error', { errorMessage: 'Item not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};


exports.getSellItemForm = (req, res) => {
    res.render('new');
};

exports.createNewItem = async (req, res) => {
    try {
        const { title, brand, price, year, condition, details, email, phone } = req.body;

        const contactPreference = [];
        if (req.body.contactEmail === 'on') contactPreference.push('email');
        if (req.body.contactPhone === 'on') contactPreference.push('phone');

        const newItem = new Item({
            title: validator.escape(validator.trim(title || '')),
            brand: validator.escape(validator.trim(brand || '')),
            price: parseFloat(validator.trim(price || '')),
            year: parseFloat(validator.trim(year || '')),
            condition: validator.escape(validator.trim(condition || '')),
            details: validator.escape(validator.trim(details || '')),
            email: validator.escape(validator.trim(email || '')),
            phone: validator.escape(validator.trim(phone || '')),
            seller: req.session.userId,
            image: req.file ? req.file.filename : process.env.NODE_ENV === 'test' ? null : 'default.jpg',
            totalOffers: 0,
            contactPreference,
            active: true
        });

        await newItem.save();
        req.flash('success', 'Your Item has been listed successfully!');
        res.redirect('/items');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};


exports.getEditItemForm = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);
        if (item) {
            res.render('edit', { item });
        } else {
            res.status(404).render('error', { errorMessage: 'Item not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).render('error', { errorMessage: 'Item not found.' });
        }

        const { title, brand, price, year, condition, details, email, phone } = req.body;

        const contactPrefs = {
            email: req.body.contactEmail === 'on',
            phone: req.body.contactPhone === 'on'
        };

        item.title = validator.escape(validator.trim(title || ''));
        item.brand = validator.escape(validator.trim(brand || ''));
        item.price = parseFloat(validator.trim(price || ''));
        item.year = parseFloat(validator.trim(year || ''));
        item.condition = validator.escape(validator.trim(condition || ''));
        item.details = validator.escape(validator.trim(details || ''));
        item.email = validator.escape(validator.trim(email || ''));
        item.phone = validator.escape(validator.trim(phone || ''));
        item.image = req.file ? req.file.filename : item.image;
        item.contactPreference = [];
        if (req.body.contactEmail === 'on') item.contactPreference.push('email');
        if (req.body.contactPhone === 'on') item.contactPreference.push('phone');


        await item.save();
        req.flash('success', 'Your item has been updated successfully!');
        res.redirect(`/items/${itemId}`);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};


exports.deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        await Offer.deleteMany({ item: itemId });
        const item = await Item.findByIdAndDelete(itemId);
        if (item) {
            req.flash('success', 'Your Item` has been deleted successfully!');
            res.redirect('/items');
        } else {
            res.status(404).render('error', { errorMessage: 'Item not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
 };
 
 exports.index = async (req, res, next) => {
    try {
        const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
        const sortOption = req.query.sort || 'price-asc';

        let items = await Item.find({ active: true }).populate('seller', 'firstName lastName');

        if (searchTerm) {
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.details.toLowerCase().includes(searchTerm)
            );
        }

        switch (sortOption) {
            case 'price-asc':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'year-asc':
                items.sort((a, b) => a.year - b.year);
                break;
            case 'year-desc':
                items.sort((a, b) => b.year - a.year);
                break;
            case 'recent':
                items.sort((a, b) => b.createdAt - a.createdAt);
                break;
            default:
                items.sort((a, b) => a.price - b.price);
        }

        res.render('items', {
            items,
            searchTerm,
            sortOption
        });

    } catch (err) {
        console.error(err);
        res.status(500).render('error', { errorMessage: 'Server error' });
    }
};

exports.show = (req, res, next) => {
    const id = req.params.id;

    Item.findById(id)
        .populate('seller', 'firstName lastName')
        .then(item => {
            if (item) {
                res.render('item', {
                    item,
                    userId: req.session.userId
                });
            } else {
                const err = new Error('Item not found.');
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

 