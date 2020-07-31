const express = require('express');
const router = express.Router();
const Post = require('../models/post')

router.use(function(req, res, next){
    if (req.user) {
        return next();
    }
    req.flash('error', 'You need to login first!');
    res.redirect('/login');
});

router.get('/new', function(req, res){
    res.render('posts/create');
})


module.exports = router;