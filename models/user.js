const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    username: { type : String , unique : true, required : true, dropDups: true },
    password: String,
    following: [String],
    followers: [String]
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