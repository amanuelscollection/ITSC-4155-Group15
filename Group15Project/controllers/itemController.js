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
        const item = await Item.findById(itemId);
        if (item) {
            res.render('item-detail', { item: item });
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
    const { title, brand, price, condition, details } = req.body;

    const sanitizedTitle = validator.escape(validator.trim(title || ''));
    const sanitizedBrand = validator.escape(validator.trim(brand || ''));
    const sanitizedCondition = validator.escape(validator.trim(condition || ''));
    const sanitizedDetails = validator.escape(validator.trim(details || ''));
    const sanitizedPrice = validator.trim(price || '');



    if (!sanitizedTitle || !sanitizedBrand || !sanitizedPrice || !sanitizedCondition) {
        req.flash('error', 'Title, brand, price, and condition are required.');
        return res.redirect('/items/new'); 
    }

    if (!validator.isIn(sanitizedCondition, ['New', 'Like New', 'Good', 'Fair'])) {
        req.flash('error', 'Invalid condition value.');
        return res.redirect('/items/new');
    }

    if (!validator.isCurrency(sanitizedPrice, { allow_negatives: false })) {
        req.flash('error', 'Price must be a valid amount.');
        return res.redirect('/items/new');
    }


    const newItem = new Item({
        title: sanitizedTitle,  
        brand: sanitizedBrand,      
        price: parseFloat(sanitizedPrice),
        condition: sanitizedCondition, 
        details: sanitizedDetails, 
        seller: req.session.userId,  
        image: req.file ? req.file.filename : 'default.jpg',
        totalOffers: 0,
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
            res.render('edit', { item: item });
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
        if (item) {
            const { title, brand, price, condition, details } = req.body;

            const sanitizedTitle = validator.escape(validator.trim(title || ''));
            const sanitizedBrand = validator.escape(validator.trim(brand || ''));
            const sanitizedCondition = validator.escape(validator.trim(condition || ''));
            const sanitizedDetails = validator.escape(validator.trim(details || ''));
            const sanitizedPrice = validator.trim(price || '');

            if (!sanitizedTitle || !sanitizedBrand || !sanitizedPrice || !sanitizedCondition) {
                req.flash('error', 'Title, brand, price, and condition are required.');
                return res.redirect(`/items/${itemId}/edit`); 
            }

            if (!validator.isIn(sanitizedCondition, ['New', 'Like New', 'Good', 'Fair'])) {
                req.flash('error', 'Invalid condition value.');
                return res.redirect(`/items/${itemId}/edit`); // Redirect to the edit form
            }

            if (!validator.isCurrency(sanitizedPrice, { allow_negatives: false })) {
                req.flash('error', 'Price must be a valid amount.');
                return res.redirect(`/items/${itemId}/edit`); // Redirect to the edit form
            }

            item.title = sanitizedTitle;
            item.brand = sanitizedBrand;
            item.price = parseFloat(sanitizedPrice);
            item.condition = sanitizedCondition;
            item.details = sanitizedDetails;
            item.image = req.file ? req.file.filename : item.image;

            await item.save();
            req.flash('success', 'Your item has been updated successfully!');
            res.redirect(`/items/${itemId}`);
        } else {
            res.status(404).render('error', { errorMessage: 'Item not found.' });
        }
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
 
 exports.index = (req, res, next) => {
    Item.find({ active: true })
        .populate('seller', 'firstName lastName')
        .then(items => {
            if (req.query.search) {
                const searchTerm = req.query.search.toLowerCase();
                items = items.filter(item =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.details.toLowerCase().includes(searchTerm)
                );
            }
            items.sort((a, b) => a.price - b.price);
            res.render('items', { items });
        })
        .catch(err => next(err));
};

exports.show = (req, res, next) => {
    const id = req.params.id;

    Item.findById(id)
        .populate('seller', 'firstName lastName')
        .then(item => {
            if (item) {
                res.render('item', { item });
            } else {
                const err = new Error('Item not found.');
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};
 