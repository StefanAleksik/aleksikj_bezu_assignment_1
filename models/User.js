var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    surname: String,
    username:{type: String, lowercase: true, trim: true,minlength:5, maxlength:30},
    age: Number,
    gender: String,
    music: Array,
    spotifyID: String,
    email: String,
    lastFmId: String,
    gravatar: String
}, {
    versionKey: false // You should be aware of the outcome after set to false
});



module.exports = mongoose.model('User', userSchema);
