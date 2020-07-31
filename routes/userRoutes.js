const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/user');
const Post = require('../models/post');

router.get('/:username', function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        Post.find({author: user.username}).exec(function (err, posts) {
            if (err){
                req.flash('error', 'Error retrieving posts.');
                return res.render('user/show', {foundUser: user});
            }
            return res.render('user/show', {foundUser: user, posts: posts}); 
          });
    });
});

router.post('/:username', function(req, res){
    let username = req.body.searchUser;
    if(username) return res.redirect('/accounts/' + username);
    res.redirect("back");
});

module.exports = router;