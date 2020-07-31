const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
UserSchema.plugin(passportLocalMongoose);

// UserSchema.pre('remove', async function(next) {
//     try {
//         await Campground.remove({ 'author': { '_id': this._id } });
//         await Comment.remove({ 'author': { '_id': this._id } });
//         next();
//     } catch (err) {
//         console.log(err);
//     }
//   });

module.exports = mongoose.model('User', UserSchema);