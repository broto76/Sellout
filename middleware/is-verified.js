const User = require('../models/user');

module.exports = (req, res, next) => {
    if (!req.user) {
        console.log('No user assocoiated. Request rejected!');
        res.redirect('/');
    }
    if (req.user.isVerified) {
        next();
    } else {
        console.log('User not verified. Cannot access Admin space!');
        //console.log('User: ' + req.user.name);
        res.status(403).render('admin/non-verified', {
            docTitle: 'Not verified!',
            activePath: '',
            userName: req.user.name,
            isAuthenticated: req.session.isLoggedIn
        });
    }
}