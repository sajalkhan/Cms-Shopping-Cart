var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');

// Get Users model
var User = require('../Models/user_model');
var page_model = require('../Models/page_model');
var category_model = require('../Models/category_model');

/*
 * GET register
 */
router.get('/register', async (req, res)=> {

    var category = await category_model.find();        
    var pages = await page_model.find({}).sort({ sorting: 1 });

    res.render('register', {
        title: 'Register',
        pages: pages,
        category: category
    });

});

/*
 * POST register
 */
router.post('/register',[
    check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Email is required!').not().isEmpty(),
    check('username', 'Username is required!').not().isEmpty(),
    check('password', 'Password is required!').not().isEmpty().custom((value, {req, loc, path})=>{  //https://stackoverflow.com/questions/46011563/access-request-body-in-check-function-of-express-validator-v4/46013025#46013025
        if(value != req.body.password2) throw new Error('Password Do not Match!');
        else return value;
    })
], async (req, res)=> {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    const errors = validationResult(req);

    var category = await category_model.find();        
    var pages = await page_model.find({}).sort({ sorting: 1 });

    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array(),
            user: null,
            category: category,
            pages: pages,
            title: 'Register'
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/user/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                // bcrypt.genSalt(10, function (err, salt) {
                //     bcrypt.hash(user.password, salt, function (err, hash) {
                //         if (err)
                //             console.log(err);

                //         user.password = hash;

                //         user.save(function (err) {
                //             if (err) {
                //                 console.log(err);
                //             } else {
                //                 req.flash('success', 'You are now registered!');
                //                 res.redirect('/user/login')
                //             }
                //         });
                //     });
                // });

                bcrypt.hash(user.password, 10, function(err, hash) {
                    user.password = hash;
                    user.save((err)=>{
                        if(err) return console.log(err);

                        req.flash('success','You are now registered!');
                        res.redirect('/user/login')
                    })
                  });
            }
        });
    }

});

/*
 * GET login
 */
router.get('/login', async (req, res)=> {

    if (res.locals.user) res.redirect('/');
    
    var category = await category_model.find();        
    var pages = await page_model.find({}).sort({ sorting: 1 });

    res.render('login', {
        title: 'Log in',
        category: category,
        pages: pages
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
    
});

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();
    
    req.flash('success', 'You are logged out!');
    res.redirect('/user/login');

});

// Exports
module.exports = router;


