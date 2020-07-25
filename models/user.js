const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

let User = mongoose.model('User', UserSchema);
// let user1 = new User({username: "testuser"});
// user1.save()

module.exports = User;