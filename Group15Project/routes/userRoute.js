const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/signup', userController.getSignup);
router.post('/', userController.signup);
router.get('/login', userController.getLogin);
router.post('/login', userController.login);
router.get('/profile', userController.getProfile);
router.get('/logout', userController.logout);




module.exports = router;
