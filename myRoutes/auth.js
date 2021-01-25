const express = require('express');
const authRouter = express.Router();

const authController = require('../controller/auth');


authRouter.get('/login', authController.getLogin);
authRouter.post('/login', authController.postLogin);

authRouter.post('/logout', authController.postLogout);

authRouter.get('/signup', authController.getSignup);
authRouter.post('/signup', authController.postSignup);

authRouter.get('/reset', authController.getReset);
authRouter.post('/reset', authController.postReset);

authRouter.get('/reset/:token', authController.getNewPassword);
authRouter.post('/new-password', authController.postNewPassword);

module.exports = authRouter;