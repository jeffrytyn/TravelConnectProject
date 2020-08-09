const mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String, //mixed types with Buffer potentially
    author: { type : String , unique : false, required : true },
    _date: Date
});

PostSchema.index({_date: -1}, {unique: false});

module.exports = mongoose.model("Post", PostSchema);