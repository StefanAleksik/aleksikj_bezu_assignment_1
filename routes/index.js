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

var client_id = '4feeba43e6634d019efb83b3fdc7fe31'; // Your client id
var client_secret = 'b8401d1bb1b94c1280faa4f54d77da27'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


router.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-library-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

module.exports = router;