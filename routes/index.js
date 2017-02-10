var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Assig 1', userName: req.session.userName || null, userSurname: req.session.userSurname || null, spotifySet: req.session.spotifySet || null});
});
router.post('/adduser', function (req, res, next) {
    req.session.userName = req.body.name;
    req.session.userSurname = req.body.surname;
   new User({name: req.body.name, surname: req.body.surname, age: req.body.age, gender: req.body.gender, music: req.body.music, spotifyID: null, email: null, lastFmId: null}).save(function(err) {
       if (err) throw err;

       console.log('User created!');
   });
   res.redirect("/");
});


router.get('/thread', function(req, res) {
    User.find(function(err, threads) {
        res.send(threads);
    });
});



module.exports = router;