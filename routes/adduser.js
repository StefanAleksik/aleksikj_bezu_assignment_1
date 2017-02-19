var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
var crypto = require('crypto');

router.post('/', function (req, res, next) {

    //check if the username is exists
    User.findOne({username:req.body.username.toLowerCase().trim()},function(err,user){
        if (user != undefined){

            req.session.error = "The username exists",
                res.redirect("/");
        }
        else {
            new User({name: req.body.name, surname: req.body.surname,username:req.body.username, age: req.body.age, gender: req.body.gender, music: req.body.music, spotifyID: null, email: null, lastFmId: null, gravatar: crypto.createHash('md5').update(req.body.gravatar).digest('hex') || null}).save(function(err) {
                if (err) {
                    console.log(err);
                    //We can use html for min and max
                    if( err.errors.username.kind === "minlength"){
                        req.session.error ="Username should has at least 5 characters";
                        res.redirect("/");
                    }
                    else if(err.errors.username.kind === "maxlength"){
                        req.session.error ="Username can has max 30 characters";
                        res.redirect("/");
                    }
                    else {
                        req.session.error = "Error in saving user";
                        res.redirect("/");
                    }

                }
                else {
                    console.log('User created!');
                    req.session.username = req.body.username;

                    req.session.gravatar = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(req.body.gravatar).digest('hex') + '/.jpg';

                    res.redirect("/");
                }

            });
        }
    })



});

module.exports = router;