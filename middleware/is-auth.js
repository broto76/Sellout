

module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        console.log("No active session. Cannot access " + req.url);
        return res.redirect('/login');
    }
    next();
}

