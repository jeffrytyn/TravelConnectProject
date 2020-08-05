const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport');

router.get('/login', function(req, res){
    res.render('login'); 
});

router.post('/login', 
    passport.authenticate('local',{ successRedirect: '/',
                                    failureRedirect: '/login',
                                    successFlash: "You've been signed in!", //maps to success in req.flash
                                    failureFlash: "Invalid username or password."}), //maps to error in req.flash 
    function(req, res){
});

router.get('/register', function(req, res){
    res.render('register'); 
});

router.post('/register', function(req, res){
    if(req.body.password != req.body.confirmPass){
        req.flash('error', "Passwords don't match!");
        return res.redirect('/register');
    }
    let new_user = new User({username: req.body.username});
    User.register(new_user, req.body.password, (err, user) => {
        if(err){
            req.flash('error', "User with that name already exists.");
            return res.redirect('/register');
        }
        req.login(user, function(err) {
            if (err){
                req.flash('error', "Error with login."); 
                return res.redirect('/login');
            }
            req.flash("success", "You have been registered!");
            return res.redirect('/');
          });
    });
});

router.get('/logout', function(req, res){
    if(req.user){
        req.logout();
        req.flash('success', "You have been logged out!");
    }
    res.redirect("/");
});

module.exports = router;