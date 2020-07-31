const mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    author: { type : String , unique : false, required : true },
    date: Date
});

module.exports = mongoose.model("Post", PostSchema);