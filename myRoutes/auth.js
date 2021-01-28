const express = require('express');
const { check, body } = require('express-validator/check');

const authRouter = express.Router();

const authController = require('../controller/auth');
const User = require('../models/user');

const TAG = "auth_router";

authRouter.get('/login', authController.getLogin);
authRouter.post('/login', 
[
    // Email Validator
    body('email')
        .isEmail().withMessage('Invalid Email Address')
        .normalizeEmail(),
    // Password Validator
    body('password', 'Only AlphaNumeric password with length gretarer than 5 allowed')
    .isLength({
        min: 5
    })
    .isAlphanumeric()
], authController.postLogin);

authRouter.post('/logout', authController.postLogout);

authRouter.get('/signup', authController.getSignup);
authRouter.post('/signup', 
    [
        // Email validator
        check('email').isEmail()
            .withMessage('Invalid Email Address')
            // Validate that no users exists with smae email
            .custom((value, { req }) => {
                return User.findOne({
                    email: value
                })
                .then(userDoc => {
                    if (userDoc) {
                        console.log(TAG, "postSignup", 
                            "Email Already exists");
                        return Promise.reject(`
                            Email Already registered.
                        `);
                    }
                });
            })
            .normalizeEmail(), 
        // Password validator            
        body('password', 'Only AlphaNumeric password with length gretarer than 5 allowed')
        .isLength({
            min: 5
        }).isAlphanumeric(),
        // ConfirmPass === Pass validator
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
    ],
    authController.postSignup);

authRouter.get('/reset', authController.getReset);
authRouter.post('/reset', authController.postReset);

authRouter.get('/reset/:token', authController.getNewPassword);
authRouter.post('/new-password', authController.postNewPassword);

module.exports = authRouter;