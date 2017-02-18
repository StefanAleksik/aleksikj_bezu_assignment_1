var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Assig 1', error:req.session.error||null,userName: req.session.userName || null, userSurname: req.session.userSurname || null, spotifySet: req.session.spotifySet || null, lastFmSet: req.session.lastFmSet || null, gravatar: req.session.gravatar || null});
});
router.post('/adduser', function (req, res, next) {

    //check if the username is exists
    User.findOne({username:req.body.username.toLowerCase().trim()},function(err,user){
        if (user != undefined){

            req.session.error = "The username exists"
            res.redirect("/");
        }
        else {
            new User({name: req.body.name, surname: req.body.surname,username:req.body.username, age: req.body.age, gender: req.body.gender, music: req.body.music, spotifyID: null, email: null, lastFmId: null, gravatar: crypto.createHash('md5').update(req.body.gravatar).digest('hex') || null}).save(function(err) {
                if (err) {
                    console.log(err)
                    if( err.errors.username.kind === "minlength"){
                        req.session.error ="Username should has at least 5 characters"
                        res.redirect("/");
                    }
                    else if(err.errors.username.kind === "maxlength"){
                        req.session.error ="Username can has max 30 characters"
                        res.redirect("/");
                    }
                    else {
                        req.session.error = "Error in saving user"
                        res.redirect("/");
                    }

                }
                else {
                    console.log('User created!');
                    req.session.userName = req.body.name;
                    req.session.userSurname = req.body.surname;
                    req.session.gravatar = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(req.body.gravatar).digest('hex') + '/.jpg';

                    res.redirect("/");
                }

            });
        }
    })



});


router.get('/thread', function(req, res) {
    User.find(function(err, threads) {
        res.send(threads);
    });
});



module.exports = router;