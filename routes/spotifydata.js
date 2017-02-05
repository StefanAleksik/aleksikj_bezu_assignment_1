/**
 * Created by Stefan Aleksik on 05.2.2017.
 */
var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');

router.get('/', function(req, res, next) {
    res.render('spotifydata', { title: 'Spotify' });
});

module.exports = router;