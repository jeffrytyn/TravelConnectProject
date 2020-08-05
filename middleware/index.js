const Post = require("../models/post")

let middleware = {}

middleware.isLoggedIn = function(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to login first!');
    res.redirect('/login');
};

middleware.checkAccountOwnership = function(req, res, next){
    if (req.params.username === req.user.username) {
        return next();
    }
    req.flash('error', 'You are not on the right account!');
    res.redirect('/');
};

middleware.checkPostOwnership = function(req, res, next){
    Post.findById(req.params.id, function(err, post){
        if(!post || err){
            req.flash('error', 'No such post exists.');
            return res.redirect('back');
        }
        if(post.author === req.user.username){
            return next();
        }
        req.flash("error, "`This post was not authored by user ${req.params.username}.`);
        return res.redirect('back');
    });
};

module.exports = middleware