var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.setLocale(req.cookies.lang || 'en');
    res.render('index', { title: 'Assig 1', userName: req.session.userName || null, userSurname: req.session.userSurname || null, spotifySet: req.session.spotifySet || null, lastFmSet: req.session.lastFmSet || null, gravatar: req.session.gravatar || null});
});
router.post('/adduser', function (req, res, next) {
    req.session.userName = req.body.name;
    req.session.userSurname = req.body.surname;
    req.session.gravatar = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(req.body.gravatar).digest('hex') + '/.jpg';
    console.log(req.body.music)
   new User({name: req.body.name, surname: req.body.surname, age: req.body.age, gender: req.body.gender, music: req.body.music, spotifyID: null, email: null, lastFmId: null, gravatar: crypto.createHash('md5').update(req.body.gravatar).digest('hex') || null}).save(function(err) {
       if (err) throw err;

       console.log('User created!');

   });
   res.redirect("/");
});

router.get('/sw', function (req, res) {
    res.cookie('lang', 'sw');
    res.redirect('/')
});

router.get('/en', function (req, res) {
    res.cookie('lang', 'en');
    res.redirect('/')
});

router.get('/thread', function(req, res) {
    User.find(function(err, threads) {
        res.send(threads);
    });
});



module.exports = router;