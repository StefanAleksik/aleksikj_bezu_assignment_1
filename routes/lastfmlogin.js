var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Assig 1', userName: req.session.userName || null, userSurname: req.session.userSurname || null, spotifySet: req.session.spotifySet || null});
    //res.send("Hi there!")
    res.redirect('http://www.last.fm/api/auth/?api_key=7265542ca35620eb114c1e04fc841a79&cb=http://localhost:3000/lastfmcallback');

});
module.exports = router;