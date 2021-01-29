exports.pageNotFoundRouter = (req, res, next) => {
    res.status(404);
    //res.send('<h1> Page Not Found!! </h1>');
    //res.sendFile(path.join(__dirname, 'views', 'pageNotFound.html'));
    console.log('Page not found: ' + req.url);
    res.render('pageNotFound', {
        docTitle: 'Page Not Found',
        activePath: '',
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.interalErrorRouter = (req, res, next) => {
    console.log('Interal Error Occured. Rendering 500 page!');
    res.render('500', {
        docTitle: 'Error!',
        activePath: '',
        isAuthenticated: req.session.isLoggedIn
    });
}