const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/user');
const Post = require('../models/post');

const isLoggedIn = function(req, res, next){
    if (req.user) {
        return next();
    }
    req.flash('error', 'You need to login first!');
    res.redirect('/login');
};

router.get('/:username', function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        Post.find({author: user.username}).exec(function (err, posts) {
            if (!posts || err){
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

router.patch('/:username', isLoggedIn, function(req, res){
    const inspec = req.params.username;
    if(inspec != req.user.username){
        User.findOne({username: inspec}, function(err, user){
            if(err || !user){
                req.flash('error', "Error finding user");
                return res.redirect('/accounts/' + inspec);
            }
            if(!("followers" in user)){
                user.updateOne({followers: []}).exec();
            }
            if(!("following" in req.user)){
                req.user.updateOne({following: []}).exec();
            }
            const index = req.user.following.indexOf(inspec);
            if(index < 0){
                req.user.updateOne({$push: {following: inspec}}).exec();
                user.updateOne({$addToSet: {followers: req.user.username}}).exec();
            }else{
                req.user.following.splice(index, 1);
                req.user.save(function(err){
                    if(err){
                        req.flash("error", "Error removing user from following.");
                        return res.redirect('/accounts/' + inspec);
                    }
                });
                const currIndex = user.followers.indexOf(req.user.username);
                if(currIndex > -1){
                    user.followers.splice(currIndex, 1);
                    user.save(function(err){
                        if(err){
                            req.flash("error", "Error removing yourself as a follower.");
                            return res.redirect('/accounts/' + inspec);
                        }
                    });
                }
            }
        });
    }
    return res.redirect('/accounts/' + inspec);
});

module.exports = router;