const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Post = require('../models/post');

router.use(function(req, res, next){
    if (req.user) {
        return next();
    }
    req.flash('error', 'You need to login first!');
    res.redirect('/login');
});

router.get('/new', function(req, res){
    res.render('posts/create');
});

router.post('/new', function(req, res){
    let newPost = new Post({title: req.body.title, 
                           body: req.body.body, 
                           image: req.body.image, 
                           author: req.user._id,
                           date: Date.now()
                          });
    newPost.save(function(err, post){
        if(err){
            req.flash(error, "There was an error submitting the post, try again.");
            return res.redirect(`/accounts/${req.user.username}/posts/new`);
        }
        res.redirect(`/accounts/${req.user.username}`);
    });
});

module.exports = router;