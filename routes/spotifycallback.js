/**
 * Created by Stefan Aleksik on 05.2.2017.
 */
var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
// credentials are optional
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId : '4feeba43e6634d019efb83b3fdc7fe31',
    clientSecret : 'b8401d1bb1b94c1280faa4f54d77da27',
    redirectUri : 'http://localhost:3000/spotifycallback'
});
router.get('/', function(req, res, next) {
    res.send(req.query.code);
    spotifyApi.authorizationCodeGrant(req.query.code).then(function (data) {
        /*console.log('The token expires in ' + data['expires_in']);
        console.log(data.body.access_token);
        var toke = data['refresh_token'];
        console.log('The refresh token is ' + toke);
        for (var i in data){
            console.log(data[i], i);
        }*/
        spotifyApi.setAccessToken(data.body.access_token);
        return spotifyApi.getMe();

    }).then(function (data) {

        //console.log(data);
        return spotifyApi.getUserPlaylists(data.body.id)

    }).then(function (data) {
        console.log(data.body)
    }), function (err) {
        res.status(err.code);
        res.send(err.message);
    }

});





module.exports = router;