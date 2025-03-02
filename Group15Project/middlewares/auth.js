module.exports = (req, res, next) => {
    console.log('auth');
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    next();
};