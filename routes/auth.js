const { check } = require('express-validator/check')

const express = require('express')

const User = require('../models/user');

const authController = require('../controllers/auth')

const router = express.Router();

router.get('/login', authController.getLogin)

router.post('/login',[
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({min:5, max:15}).withMessage('Password must be between 5 to 15 characters')
], authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post('/signup',[
    check('email')
    .isEmail().withMessage('Email id invalid').custom((value, { req })=>{
        // if(value === 'test@test.com'){
        //     throw new Error('This email is forbidden!')
        // }

        return User.findOne({email : value})
        .then(userDoc=>{
            if(userDoc){
                return Promise.reject('Email already exists! Login with existing or use a different one to signup')
            }
            return true
        })
    }).normalizeEmail(),
    check('password','Password should be between 5-15 characters and alphanumeric')
    .isLength({min : 5, max : 15}).isAlphanumeric().trim(),
    check('confirmPassword')
    .custom((value , { req })=>{
        if(value !== req.body.password)
        {
            throw new Error('password does not match') 
        }
        return true;

    })
], authController.postSignup)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router;