const mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    author: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    date: Date
});

module.exports = mongoose.model("Post", PostSchema);