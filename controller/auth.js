const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const sgMail = require('@sendgrid/mail');
const crpto = require('crypto');

const { validationResult } = require('express-validator/check');

const cred = require('../creds');

sgMail.setApiKey(cred.API_KEY2);

const User = require('../models/user');

const TAG = "auth_controller";

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: cred.API_KEY1
    }
}));

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
        errorMessage: error,
        oldInput: {
            email: ''
        },
        validationErrors: []
    });
}

exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Validation has failed
        return res.status(422).render('auth/login', {
            docTitle: 'Login',
            activePath: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email
            },
            validationErrors: errors.array()
        });
    }

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
                //req.flash('error','No user found for email');
                console.log(TAG, "postLogin", 
                    "No user found for email: " + email);
                //return res.redirect('/login');
                return res.status(422).render('auth/login', {
                    docTitle: 'Login',
                    activePath: '/login',
                    errorMessage: 'No user registered with email',
                    oldInput: {
                        email: email
                    },
                    validationErrors: []
                });
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
                        //req.flash('error','Invalid password');
                        console.log(TAG, "postLogin",
                            "Invalid Password");
                        //return res.redirect('/login');
                        return res.status(422).render('auth/login', {
                            docTitle: 'Login',
                            activePath: '/login',
                            errorMessage: 'Password Wrong!',
                            oldInput: {
                                email: email
                            },
                            validationErrors: []
                        });
                    }
                })
                .catch(err => {
                    console.log(TAG, "postLogin", err);
                    return res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(TAG, "postLogin", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
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
        errorMessage: error,
        oldInput: {
            name: '',
            email: ''
        },
        validationErrors: []
    });
}

exports.postSignup = (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    // Verify input validation status
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(TAG, "postSignup", errors.array());
        return res.status(422).render('auth/signup', {
            docTitle: 'Signup',
            activePath: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name: name,
                email: email
            },
            validationErrors: errors.array()
        });
    }

    if (!name || !email || !password) {
        req.flash('error','Invalid input');
        console.log(TAG, "postSignup", "Input fields empty");
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
            // return transporter.sendMail({
            //     to: email,
            //     from: 'sellout@broto.com',
            //     subject: 'Welcome to Sellout',
            //     html: '<h1> Your Signup with Sellout was successful. </h1>'
            // });
            return sgMail.send({
                to: email,
                from: 'sahaanibrata@gmail.com',
                subject: 'Welcome to Sellout',
                html: '<h1> Your Signup with Sellout was successful. </h1>'
            });
        })
        .catch(err => {
            console.log(TAG, "postSignup", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
}

exports.getReset = (req, res) => {
    let error = req.flash('error');
    if (error.length > 0) {
        error = error[0];
    } else {
        error = null;
    }
    res.render('auth/reset', {
        docTitle: 'Reset Password',
        activePath: '/reset',
        errorMessage: error
    });
}

exports.postReset = (req, res) => {
    const email = req.body.email;
    if (!email) {
        console.log(TAG, "postReset", "Email field empty");
        req.flash('error','Email Address is empty');
        return res.redirect('/reset');
    }
    crpto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(TAG, "postReset", err);
            req.flash('error','Error encountered while ' +
                'generating reset Link');
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                console.log(TAG, "postReset", "No user registered " +
                    "with email: " + email);
                req.flash('error','No user registered!!');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiry = Date.now() + 1000*60*60;
            // save the reset token to db.
            return user.save()
            .then(result => {
                res.redirect('/login');
                sgMail.send({
                    to: email,
                    from: 'sahaanibrata@gmail.com',
                    subject: 'Sellout Password Reset',
                    html: `
                        <p> Password Reset Requested </p>
                        <p> The below reset link will be valid for 1 hour. </p>
                        <p> Follow the 
                            <a href='http://localhost:5000/reset/${token}'>link</a>
                         to reset password. </p>
                    `
                });
                console.log("Reset Link sent to " + email);
            })
            .catch(err => {
                console.log(TAG, "postReset", err);
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            });
        })
        .catch(err => {
            console.log(TAG, "postReset", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
    })
}

exports.getNewPassword = (req, res) => {

    // Verify token.
    const token = req.params.token;
    User.findOne({
        // Valid token available
        resetToken: token,
        // Token not expired
        resetTokenExpiry: {$gt: Date.now()}
    })
    .then(user => {
        if (!user) {
            console.log(TAG, "getNewPassword", "Invalid token or token expired");
            return res.redirect('/login');
        }

        // Valid token found
        let error = req.flash('error');
        if (error.length > 0) {
            error = error[0];
        } else {
            error = null;
        }
        res.render('auth/new-password', {
            docTitle: 'New Password',
            activePath: '/new-password',
            errorMessage: error,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        console.log(TAG, "getNewPassword", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}

exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        // Valid token available
        resetToken: passwordToken,
        // Token not expired
        resetTokenExpiry: {$gt: Date.now()},
        _id: userId
    })
    .then(user => {
        if (!user) {
            console.log(TAG, "postNewPassword", "No user found");
            return res.redirect('/login');
        }
        resetUser = user;
        return bcrypt.hash(newPassword, 12)
            .then(hashedPassword => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = null;
                resetUser.resetTokenExpiry = undefined;
                return resetUser.save();
            })
            .then(result => {
                res.redirect('/login');
                console.log('Password Reset Completed for ' + resetUser.name);
            })
            .catch(err => {
                console.log(TAG, "postNewPassword", err);
                const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
            });
    })
    .catch(err => {
        console.log(TAG, "postNewPassword", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
}
