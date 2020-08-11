const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router({mergeParams: true});
const Post = require('../models/post');
const middleware = require("../middleware/main");

router.use(middleware.isLoggedIn);
let checkPostOwnership = middleware.checkPostOwnership;
let checkAccountOwnership = middleware.checkAccountOwnership;

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, './posts');
    }, 
    filename: (req, file, cb) => { 
        cb(null, req.params.username + "_" + file.originalname); 
    } 
}); 
  
const upload = multer({ storage: storage });

router.get('/new', checkAccountOwnership, function(req, res){
    res.render('posts/create');
});

router.post('/new', [checkAccountOwnership, upload.single('postPic')], function(req, res){
    let newPost = new Post({title: req.body.title, 
                           body: req.body.body, 
                           author: req.user.username,
                           _date: Date.now()
                          });
    newPost.image = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype
    }
    fs.unlink(req.file.path, (err) => {
        if(err){
            console.log("Unable to remove image with error: " + err);
        }
    }); 
    newPost.save(function(err){
        if(err){
            req.flash("error", "There was an error submitting the post, try again.");
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
        req.flash("success", "Post deleted!");
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

router.put('/:id', [checkPostOwnership, upload.single("postPic")], function(req, res){
    let updates = {title: req.body.title, body: req.body.body};
    if(req.file){
        updates.image = {
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype
        }
        fs.unlink(req.file.path, (err) => {
            if(err){
                console.log("Unable to remove image with error: " + err);
            }
        });
    }
    Post.findByIdAndUpdate(req.params.id, updates, function(err, post){
        if(!post || err){
            req.flash("error", "Error updating post.");
            return res.redirect(`/${req.params.id}/edit`);
        }
        req.flash("success", "Post updated!");
        return res.redirect(`/accounts/${req.user.username}`);
    });
});

module.exports = router;