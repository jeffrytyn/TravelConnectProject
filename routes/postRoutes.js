const express = require('express');
const router = express.Router({mergeParams: true});
const Post = require('../models/post');

let checkPostOwnership = function(req, res, next){
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
                           author: req.user.username,
                           date: Date.now()
                          });
    newPost.save(function(err, post){
        if(err){
            req.flash(error, "There was an error submitting the post, try again.");
            return res.redirect(`/accounts/${req.user.username}/posts/new`);
        }
        return res.redirect(`/accounts/${req.user.username}`);
    });
});

router.delete('/:id', checkPostOwnership, function(req, res){
    Post.findByIdAndDelete(req.params.id, function(err, post){
        if(!post || err){
            req.flash("error", "Error deleting post.");
        }
        return res.redirect(`/accounts/${req.user.username}`);
    })
});

router.get('/:id/edit', checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(!post || err){
            req.flash('error', "Error finding post");
            return res.redirect(`/accounts/${req.user.username}`);
        }
        return res.render('posts/edit', {post: post});
    })
});

router.put('/:id', checkPostOwnership, function(req, res){
    Post.findByIdAndUpdate(req.params.id, {title: req.body.title, body: req.body.body, image: req.body.image}, function(err, post){
        if(!post || err){
            req.flash("error", "Error updating post.");
            return res.redirect(`/${req.params.id}/edit`);
        }
        return res.redirect(`/accounts/${req.user.username}`);
    });
});

module.exports = router;