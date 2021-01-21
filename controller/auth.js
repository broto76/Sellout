const User = require('../models/user')

const TAG = "auth_controller";

exports.getLogin = (req, res) => {
    // const isLoggedIn = req.get('Cookie')
    //     .split(';')[0].trim().split('=')[1];
    console.log("GetLogin: " + req.session.isLoggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        activePath: '/login',
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.postLogin = (req, res) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    const userId = "6009414811e5573b4c3e8768";
    User.findById(userId)
        .then(user => {
            if (!user) {
                console.log(TAG, "postLogin", 
                    "No user found for id: " + userId);
                    return res.redirect('/login');
            }

            console.log("Login Success for User: " + user.name);
            req.session.user = user;
            req.session.isLoggedIn = true;
            //console.log(req.session);

            // Sometimes updating the above session data might 
            // get delayed. Thus we should redirect only after
            //ensuring the above job is done.
            req.session.save(err => {
                if (err) {
                    console.log(TAG, "postLogin", err);
                }
                res.redirect('/');
            });
        })
        .catch(err => console.log(TAG, "postLogin", err));
}

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err)
            console.log(TAG, "postLogout", err);
        res.redirect('/');
    });
}