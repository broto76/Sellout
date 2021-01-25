const bcrypt = require('bcryptjs');

const User = require('../models/user');

const TAG = "auth_controller";

exports.getLogin = (req, res) => {
    // const isLoggedIn = req.get('Cookie')
    //     .split(';')[0].trim().split('=')[1];

    let error = req.flash('error');
    if (error.length > 0) {
        error = error[0];
    } else {
        error = null;
    }
    console.log("GetLogin: " + req.session.isLoggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        activePath: '/login',
        errorMessage: error
    });
}

exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        req.flash('error','Invalid Input');
        console.log(TAG, "postLogin", "Empty Input Fields");
        return res.redirect('/');
    }

    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                req.flash('error','Invalid email');
                console.log(TAG, "postLogin", 
                    "No user found for email: " + email);
                    return res.redirect('/login');
            }
            
            bcrypt.compare(password, user.password)
                .then(isAuthed => {
                    if (isAuthed) {
                        console.log("Login Success for User: " + 
                            user.name);
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        //console.log(req.session);

                        // Sometimes updating the above session 
                        // data might get delayed. Thus we should 
                        // redirect only after ensuring the above 
                        // job is done.
                        return req.session.save(err => {
                            if (err) {
                                console.log(TAG, "postLogin", err);
                            }
                            return res.redirect('/');
                        });
                    } else {
                        req.flash('error','Invalid password');
                        console.log(TAG, "postLogin",
                            "Invalid Password");
                        return res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(TAG, "postLogin", err);
                    return res.redirect('/login');
                });
        })
        .catch(err => console.log(TAG, "postLogin", err));
}

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err)
            console.log(TAG, "postLogout", err);
        res.redirect('/login');
    });
}

exports.getSignup = (req, res) => {
    let error = req.flash('error');
    if (error.length > 0) {
        error = error[0];
    } else {
        error = null;
    }
    res.render('auth/signup', {
        docTitle: 'Signup',
        activePath: '/signup',
        errorMessage: error
    });
}

exports.postSignup = (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (!name || !email || !password || !confirmPassword) {
        req.flash('error','Invalid input');
        console.log(TAG, "postSignup", "Input fields empty");
        return res.redirect('/signup');
    }
    User.findOne({
        email: email
    })
    .then(userDoc => {
        if (userDoc) {
            req.flash('error','Email already registered');
            console.log(TAG, "postSignup", "Email Already exists");
            return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12)
        .then(hasedPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hasedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(result => {
            console.log(TAG, "postSignup", "Signup Success!");
            res.redirect('/login');
        });
    })
    .catch(err => console.log(TAG, "postSignup", err));
}
