var express = require('express');
var router = express.Router();
var User = require('../models/User');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/adduser', function (req, res, next) {
   new User({name: req.body.name, surname: req.body.surname, age: req.body.age, gender: req.body.gender, music:req.body.music}).save(function(err) {
       if (err) throw err;

       console.log('User created!');
   });
   res.redirect("/spotifydata");
});


router.get('/thread', function(req, res) {
    User.find(function(err, threads) {
        res.send(threads);
    });
});
module.exports = router;