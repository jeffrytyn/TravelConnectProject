const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Post = require("./post")

let UserSchema = new mongoose.Schema({
    username: { type : String, required : true, unique: true, dropDups: true },
    password: String,
    following: [String],
    followers: [String]
});
UserSchema.plugin(passportLocalMongoose);

UserSchema.pre('deleteOne', {document: true}, async function(next) {
    try {
        await Post.deleteMany({author: this.username}).exec();
        next();
    } catch (err) {
        console.log(err);
    }
  });
module.exports = mongoose.model('User', UserSchema);