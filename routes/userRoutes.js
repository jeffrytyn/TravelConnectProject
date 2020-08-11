const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router({mergeParams: true});
const User = require('../models/user');
const Post = require('../models/post');
const middleware = require("../middleware/main");

let isLoggedIn = middleware.isLoggedIn;
let checkAccountOwnership = middleware.checkAccountOwnership;

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, './propics');
    }, 
    filename: (req, file, cb) => { 
        cb(null, req.params.username + "_" + file.originalname); 
    } 
}); 
  
const upload = multer({ storage: storage });

router.get('/:username', function(req, res){
    User.findOne({username: req.params.username}, async function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        if(!user.profile_pic.data){
            user.profile_pic = {
                data: fs.readFileSync(path.resolve(__dirname, "../propics/user-default.png")),
                contentType: "image/png"
            }
            await user.save();
        }
        Post.find({author: user.username}).sort({_date:-1}).exec(function (err, posts) {
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

router.delete('/:username', [isLoggedIn, checkAccountOwnership], function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(err){
            req.flash("error", "Error deleting your account.");
            return res.redirect("/accounts/" + req.params.username);
        }
        user.deleteOne();
        req.flash("success", "Account deleted.");
        return res.redirect('/logout');
    });
})

router.post('/:username/followtoggle', isLoggedIn, function(req, res){
    const inspec = req.params.username;
    if(inspec !== req.user.username){
        User.findOne({username: inspec}, async function(err, user){
            if(err || !user){
                req.flash('error', "Error finding user");
                return res.redirect('/accounts/' + inspec);
            }
            if(!("followers" in user)){
                user.followers = [];
                await user.save();
            }
            if(!("following" in req.user)){
                req.user.following = [];
                await req.user.save();
            }
            if(req.user.following.includes(inspec)){
                req.user.updateOne({$pull: {following: inspec}}).exec();
                user.updateOne({$pull: {followers: req.user.username}}).exec();
            }else{
                req.user.updateOne({$push: {following: inspec}}).exec();
                user.updateOne({$push: {followers: req.user.username}}).exec();
            }
        });
    }
    res.redirect('/accounts/' + inspec);
});

router.get('/:username/edit', [isLoggedIn, checkAccountOwnership], function(req, res){
    res.render("user/edit");
});

router.put('/:username/edit', [isLoggedIn, checkAccountOwnership, upload.single('propic')], function(req, res){
    User.findOne({username: req.params.username}, async function(err, user){
        if(!user || err){
            req.flash("error", "Error retrieving user.");
            return res.redirect(`/accounts/${req.params.username}/edit`);
        }
        if(req.body.username !== req.params.username){
            const existing = await User.exists({username: req.body.username});
            if(existing){
                req.flash("error", "That username is taken, try again.");
                return res.redirect(`/accounts/${req.params.username}/edit`);
            }
            Post.updateMany({author: user.username}, {author: req.body.username}, async function(err, result){
                if(err){
                    req.flash("error", "Unable to update post author, try again.");
                    return res.redirect(`/accounts/${req.params.username}/edit`);
                }
                user.username = req.body.username;
                await user.save();
                currentUsername = req.body.username;
            });
        }
        if(req.body.password || req.body.confirmPass){
            if(req.body.password !== req.body.confirmPass){
                req.flash("error", "Those two passwords didn't match.");
                return res.redirect(`/accounts/${req.params.username}/edit`)
            }
            await user.setPassword(req.body.password);
            await user.save();
        }
        if(req.file){
            user.profile_pic = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            }
            await user.save();
            fs.unlink(req.file.path, (err) => {
                if(err){
                    console.log("Unable to remove image with error: " + err);
                }
            });
        }
        req.flash("success", "Changes saved. You must login again.");
        res.redirect("/login");
    });
});

router.get('/:username/followers', function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        return res.render("user/follow", {followers: user.followers, following: undefined});
    });
});

router.get('/:username/following', function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        return res.render("user/follow", {following: user.following, followers: undefined});
    });
});

module.exports = router;