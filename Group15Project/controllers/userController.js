const User = require('../models/userModel');
const Item = require('../models/itemModel');
const Offer = require('../models/offerModel');
const validator = require('validator');


exports.getSignup = (req, res) => {
    res.render('users/new');
};

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const sanitizedFirstName = validator.escape(validator.trim(firstName));
    const sanitizedLastName = validator.escape(validator.trim(lastName));
    const sanitizedEmail =validator.trim(email);

    if (!sanitizedFirstName || !sanitizedLastName || !sanitizedEmail) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/users/signup');
    }

    if (!validator.isEmail(sanitizedEmail)) {
        req.flash('error', 'Invalid email format.');
        return res.redirect('/users/signup');
    }

    if (!validator.isLength(password, { min: 8, max: 64 })) {
        req.flash('error', 'Password must be between 8 and 64 characters.');
        return res.redirect('/users/signup');
    }

    try {
        const user = new User({ firstName: sanitizedFirstName, lastName: sanitizedLastName, email: sanitizedEmail, password: password });
        await user.save();
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/users/login');
    } catch (error) {
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/users/signup');
    }
};


exports.getLogin = (req, res) => {
    res.render('users/login');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const sanitizedEmail = validator.trim(email);
    const sanitizedPassword = validator.trim(password);

    if (!sanitizedEmail || !sanitizedPassword) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/users/login');
    }

    if (!validator.isEmail(sanitizedEmail)) {
        req.flash('error', 'Invalid email format.');
        return res.redirect('/users/login');
    }

    try {
        const user = await User.findOne({ email: sanitizedEmail });
        if (user && await user.comparePassword(sanitizedPassword)) {
            req.session.userId = user._id;
            req.flash('success', 'Login successful!');
            res.redirect('/users/profile');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/users/login');
        }
    } catch (error) {
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/users/login');
    }
};


exports.getProfile = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    try {
    const user = await User.findById(req.session.userId)
    const items = await Item.find({ seller: req.session.userId });
    const offers = await Offer.find({ user: req.session.userId }).populate('item');
    res.render('users/profile', { user, items, offers });
    } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while fetching user profile.');
    res.redirect('/users/profile');
        }
    };


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('back');
        }
        res.redirect('/');
    });
};


