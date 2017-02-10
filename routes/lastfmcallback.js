var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var User = require('../models/User');
var mongoose = require('mongoose');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var lastfmapi = require('lastfmapi');
var json2csv = require('json2csv');
var fs = require('fs');

var lfm = new lastfmapi({
    'api_key': '7265542ca35620eb114c1e04fc841a79',
    'secret': '9729784b55ea1ea983fac072de515c0a'
});


router.get('/', function(req, res, next) {
    res.send(req.query.token);
    //console.log(req.session);
    //res.render('index', { title: 'Assig 1', userName: req.session.userName || null, userSurname: req.session.userSurname || null, spotifySet: req.session.spotifySet || null});
    var lastfmtoken = req.query.token;

    lfm.authenticate(lastfmtoken, function (err, session) {
        if (err) {
            res.writeHead(401, { 'Content-Type' : 'text/plain' });
            res.end('Unauthorized');

        }
// TOP TRACKS

        request('http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user='+session.username+'&api_key=7265542ca35620eb114c1e04fc841a79&format=json',function(error,response,body){

            var data = JSON.parse(body)
            var fields = ["name","playcount","mbid","artist.name", "duration", "url"]
            var csv = json2csv({data:data.toptracks.track,fields:fields})
            fs.writeFile('top_tracks.csv',csv,function(err){
                if(err) throw err;

            })
            // sendData.sendData('+session.username+', 'lastfm', 'recenttracks', fields,data);
        })

// RECENT TRACKS

        request('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+session.username+'&api_key=7265542ca35620eb114c1e04fc841a79&format=json',function(error,response,body){

            var data = JSON.parse(body);
            var fields = ["name","playcount","mbid","artist", "duration", "url"]
            var csv = json2csv({data:data.recenttracks.track,fields:fields})
            fs.writeFile('recent_tracks.csv', csv, function (err) {
                if (err) throw err;
            });
            // sendData.sendData('+session.username+', 'lastfm', 'recenttracks', fields,data);
        })

// TOP ARTISTS

        request('http://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user='+session.username+'&api_key=7265542ca35620eb114c1e04fc841a79&format=json',function(error,response,body){

            var data = JSON.parse(body)
            var fields = ["name","playcount","mbid","artist.name", "duration", "url"]
            var csv = json2csv({data:data.topartists.artist,fields:fields})
            fs.writeFile('top_artists.csv',csv,function(err){
                if(err) throw err;

            })
            // sendData.sendData('+session.username+', 'lastfm', 'recenttracks', fields,data);
        })
// TOP ALBUMS

        request('http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user='+session.username+'&api_key=7265542ca35620eb114c1e04fc841a79&format=json',function(error,response,body){

            var data = JSON.parse(body)
            var fields = ["name"]
            var csv = json2csv({data:data.topalbums.album,fields:fields})
            fs.writeFile('top_albums.csv',csv,function(err){
                if(err) throw err;

            })
            // sendData.sendData('+session.username+', 'lastfm', 'recenttracks', fields,data);
        })

// here
    });

});

module.exports = router;