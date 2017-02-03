var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    surname: String,
    age: Number,
    gender: String,
    music: Array,
    none: String
}, {
    versionKey: false // You should be aware of the outcome after set to false
});
module.exports = mongoose.model('User', userSchema);
