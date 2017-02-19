var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var User = require('../models/User');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.setLocale(req.cookies.lang || 'en');
    res.render('index', { title: 'Assig 1', error:req.session.error||null,userName: req.session.username || null, spotifySet: req.session.spotifySet || null, lastFmSet:req.session.lastFmSet || null, gravatar: req.session.gravatar || null});
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