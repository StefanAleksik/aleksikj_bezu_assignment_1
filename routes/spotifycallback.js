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
//var sendData = require('./sendData');
router.get('/', function(req, res, next) {
    res.send(req.query.code);
    spotifyApi.authorizationCodeGrant(req.query.code).then(function (data) {
        spotifyApi.setAccessToken(data.body.access_token);
        return spotifyApi.getMe();
    }).then(function (data) {
        spotifyApi.getFollowedArtists({ limit : 50 })
         .then(function(artist) {
             /*var limit = 50;*/
            /* var offset_offset = 0;*/
             var total = artist.body.artists.total;
             var counter = 1;
             /*var uplimit = Math.ceil(total/limit);*/
             var followedArtists ={spotify_id: data.body.id ,artists: []};
             if (total <= 50){
                 for (var i =0; i < artist.body.artists.items.length; i++){
                     //console.log('name: ' + artist.body.artists.items[i].name + ', spotify id: ' + artist.body.artists.items[i].id + ', popularity: ' + artist.body.artists.items[i].popularity);
                    followedArtists.artists.push({artist_name: artist.body.artists.items[i].name, artist_spotify_id: artist.body.artists.items[i].id, artist_popularity: artist.body.artists.items[i].popularity});
                 counter++;
                    if (counter == artist.body.artists.items.length){
                     console.log(followedArtists);
                 }
                 }
             }
                  }, function(err) {
         console.log('Something went wrong!', err);
         });
        spotifyApi.getMySavedTracks({limit : 50, offset : 0})
            .then(function(track) {
                var limit = 50;
                var counter = 1;
                var offset_offset = 0;
                var total = track.body.total;
                var uplimit = Math.ceil(total/limit);
                var savedTracks ={spotify_id: data.body.id ,songs: []};
                if (total <= limit){
                    for (var i =0; i < tracks.body.items.length; i++){
                        savedTracks.songs.push({song_name: tracks.body.items[i].track.name, song_spotify_id: tracks.body.items[i].track.id, song_album_name: tracks.body.items[i].track.album.name, album_spotify_id: tracks.body.items[i].track.album.id,
                            song_artist_name: tracks.body.items[i].track.artists[0].name, song_artist_spotify_id: tracks.body.items[i].track.artists[0].id});
                        counter++;
                        if (counter == savedTracks.songs.length){
                            console.log("Data ready to be send");
                        }
                    }
                } else {
                   for (var ii = 0; ii < uplimit; ii++){
                        spotifyApi.getMySavedTracks({limit: 50, offset: offset_offset}).then(function (trackss) {
                            console.log('YO YO YO');
                            for (var i =0; i < trackss.body.items.length; i++){
                                savedTracks.songs.push({song_name: trackss.body.items[i].track.name, song_spotify_id: trackss.body.items[i].track.id, song_album_name: trackss.body.items[i].track.album.name, album_spotify_id: trackss.body.items[i].track.album.id,
                                song_artist_name: trackss.body.items[i].track.artists[0].name, song_artist_spotify_id: trackss.body.items[i].track.artists[0].id});
                            }
                            if (total == savedTracks.songs.length){
                                console.log("Data ready to be send");
                            }
                        }, function(err) {
                            console.log('Something went wrong!', err);
                        });
                        offset_offset += limit;
                    } console.log('HI there');
                }
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        /*spotifyApi.getUserPlaylists(data.body.id)
         .then(function(playlist) {
         for (var i =0; i < playlist.body.items.length; i++){
         console.log('Playlist name: ' + playlist.body.items[i].name + ', Playlist ID: ' + playlist.body.items[i].id);
         }
         },function(err) {
         console.log('Something went wrong!', err);
         });*/
        //return spotifyApi.getUserPlaylists(data.body.id)
    }), function (err) {
        res.status(err.code);
        res.send(err.message);
    }
});
module.exports = router;