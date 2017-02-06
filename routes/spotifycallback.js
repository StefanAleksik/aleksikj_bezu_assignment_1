/**
 * Created by Stefan Aleksik on 05.2.2017.
 */
var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId : '4feeba43e6634d019efb83b3fdc7fe31',
    clientSecret : 'b8401d1bb1b94c1280faa4f54d77da27',
    redirectUri : 'http://localhost:3000/spotifycallback'
});
router.get('/', function(req, res, next) {
    res.send(req.query.code);
    spotifyApi.authorizationCodeGrant(req.query.code).then(function (data) {
        spotifyApi.setAccessToken(data.body.access_token);
        return spotifyApi.getMe();
    }).then(function (data) {
 /*       spotifyApi.getMySavedAlbums({
            limit : 50
        })
            .then(function(albums) {
                // Output items
                console.log(items.body.items);
                console.log(items.body.items.length);
                console.log('asdfg')
            }, function(err) {
                console.log('Something went wrong!', err);
            });*/
        spotifyApi.getFollowedArtists({ limit : 50 })
            .then(function(artist) {
              /*  for (var i =0; i < artist.body.artists.items.length; i++){
                    console.log('name: ' + artist.body.artists.items[i].name + ', spotify id: ' + artist.body.artists.items[i].id + ', popularity: ' + artist.body.artists.items[i].popularity);
                }*/
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        spotifyApi.getMySavedTracks({limit : 50})
            .then(function(track) {
            /*    for (var i =0; i < track.body.items.length; i++){
                 console.log('Song name: ' + track.body.items[i].track.name + ', Song spotify id: ' + track.body.items[i].track.id + ', Song album-name: ' + track.body.items[i].track.album.name + ', Album  spotify-id: ' + track.body.items[i].track.album.id
                 + ', Album artist  spotify-id: ' + track.body.items[i].track.artists[0].id + ', Album artist-name: ' + track.body.items[i].track.artists[0].name);
                 }
            */}, function(err) {
                console.log('Something went wrong!', err);
            });
        spotifyApi.getUserPlaylists(data.body.id)
            .then(function(playlist) {
                for (var i =0; i < playlist.body.items.length; i++){
                    console.log('Playlist name: ' + playlist.body.items[i].name + ', Playlist ID: ' + playlist.body.items[i].id);
                }
            },function(err) {
                console.log('Something went wrong!', err);
            });
        //return spotifyApi.getUserPlaylists(data.body.id)

    }), function (err) {
        res.status(err.code);
        res.send(err.message);
    }

});
module.exports = router;