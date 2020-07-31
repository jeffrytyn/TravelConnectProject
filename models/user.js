const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}]
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);