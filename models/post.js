const mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    author: {id: {type: mongoose.Schema.Types.ObjectId, ref:"User"}, username: String}
});

module.exports = mongoose.model("Post", PostSchema);