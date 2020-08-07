const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Post = require("./post")

let UserSchema = new mongoose.Schema({
    username: { type : String, required : true, unique: true, dropDups: true },
    password: String,
    profile_pic: {
        data: Buffer,
        contentType: String
    },
    following: [String],
    followers: [String]
});
UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.changeUserName = function(new_name){
    this.model('User').findOne({username: this.username}, async function(err, user){
        if(err){
            console.log(err);
        }else{
            await Post.updateMany({author: user.username}, {author: new_name});
            user.username = new_name;
            user.save();
        }
    });
}

UserSchema.pre('deleteOne', {document: true}, async function(next) {
    try {
        await Post.deleteMany({author: this.username});
        next();
    } catch (err) {
        console.log(err);
    }
  });

module.exports = mongoose.model('User', UserSchema);