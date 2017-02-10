/**
 * Created by Stefan Aleksik on 05.2.2017.
 */
var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var User = require('../models/User');
var mongoose = require('mongoose');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId : '4feeba43e6634d019efb83b3fdc7fe31',
    clientSecret : 'b8401d1bb1b94c1280faa4f54d77da27',
    redirectUri : 'http://localhost:3000/spotifycallback'
});
var sendData = require('./sendData');
router.get('/', function(req, res, next) {
   // res.send(req.query.code);
    spotifyApi.authorizationCodeGrant(req.query.code).then(function (data) {
        spotifyApi.setAccessToken(data.body.access_token);
        return spotifyApi.getMe();
    }).then(function (data) {

        User.findOneAndUpdate({$and: [{name: req.session.userName}, {surname: req.session.userSurname}]  }, {  spotifyID: data.body.id, email: data.body.email }, function(err, user) {
            if (err) throw err;
            // we have the updated user returned to us
            console.log(user);
        });
        console.log("SESSION")

        req.session.spotifySet = data.body.id;

        res.redirect("/");



        spotifyApi.getFollowedArtists({ limit : 50 })
         .then(function(artist) {
             var limit = 50;
             var offset_offset = 0;
             var total = artist.body.artists.total;
             var counter = 1;
             var uplimit = Math.ceil(total/limit);
             var followedArtists ={artists: []};
             var fields = ['artist_name', 'artist_spotify_id', 'artist_popularity'];
             if (total <= 50){
                 for (var i =0; i < artist.body.artists.items.length; i++){
                     //console.log('name: ' + artist.body.artists.items[i].name + ', spotify id: ' + artist.body.artists.items[i].id + ', popularity: ' + artist.body.artists.items[i].popularity);
                    followedArtists.artists.push({artist_name: artist.body.artists.items[i].name, artist_spotify_id: artist.body.artists.items[i].id, artist_popularity: artist.body.artists.items[i].popularity});
                 counter++;
                    if (counter == artist.body.artists.items.length){
                      sendData.sendData(data.body.id, 'spotify', 'followed-artists', fields, followedArtists.artists);
                       console.log(followedArtists);
                 }
                 }
             } else {for (var ii = 0; ii < uplimit; ii++){
                 spotifyApi.getFollowedArtists({ limit : 50, offset: offset_offset })
                     .then(function(artists) {
                         for (var i =0; i < artists.body.artists.items.length; i++){
                             //console.log('name: ' + artist.body.artists.items[i].name + ', spotify id: ' + artist.body.artists.items[i].id + ', popularity: ' + artist.body.artists.items[i].popularity);
                             followedArtists.artists.push({artist_name: artists.body.artists.items[i].name, artist_spotify_id: artists.body.artists.items[i].id, artist_popularity: artists.body.artists.items[i].popularity});
                             counter++;
                             if (counter == artists.body.artists.items.length){
                                 console.log(followedArtists);
                             }
                         }
                     }, function(err) {
                         console.log('Something went wrong!', err);
                     });
             }}
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
                                counter++;
                                if (total == savedTracks.songs.length){
                                    console.log(savedTracks.songs.length);
                                }
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

        spotifyApi.getUserPlaylists(data.body.id)
            .then(function(playlist) {
                //console.log(playlist.body.items)
                var playlistsNew = []
                for (var i=0;i<playlist.body.items.length;i++){
                    if(playlist.body.items[i].owner.id === data.body.id){
                        playlistsNew.push({id:playlist.body.items[i].id, name:playlist.body.items[i].name, songs:[]})
                    }

                }

                getPlaylistsWithSongs(0,playlistsNew,data.body.id,function(){
                    console.log("Done")
                   // console.log(playlistsNew)

                })
                //return playlist.body.items.map(function(p) { return p.id; });
            })

        /*.then(function (playlist_track) {
            var spotifyUserPlaylist = {spotify_id: data.body.id, playlist_song: []};
                for(var i = 0; i < playlist_track.length; i++){
                    console.log(playlist_track[i]);
                    var playListId = playlist_track[i];
                    //playListId += playlist_track[i];
                    spotifyApi.getPlaylistTracks(data.body.id, playlist_track[i], {limit: 100})
                        .then(function(playlist_track_track) {
                            console.log("id" + playListId);
                            for (var ii = 0; ii <playlist_track_track.body.items.length; ii++){
                                spotifyUserPlaylist.playlist_song.push({song_name: playlist_track_track.body.items[ii].track.name});
                                //console.log(playlist_track_track.body.items[ii].track.name);
                                if (ii == playlist_track_track.body.items.length - 1){
                                    console.log(spotifyUserPlaylist.playlist_song.length);
                                    //console.log(playListId);
                                }
                            }
                        }, function(err) {
                            console.log('Something went wrong!', err);
                        });

                }

        }).catch(function(error) {
            console.error(error);
        });*/
        //return spotifyApi.getUserPlaylists(data.body.id)


    }), function (err) {
        res.status(err.code);
        res.send(err.message);
    }

});

function getPlaylistsWithSongs(index,playlists,spotify_id,callback){

    spotifyApi.getPlaylistTracks(spotify_id, playlists[index].id, {limit: 100})
        .then(function(tracks) {

            console.log(tracks)
            playlists[index].songs.push(tracks)

            index++
            if(index<playlists.length){
                getPlaylistsWithSongs(index,playlists,spotify_id,callback)
            }
            else{
                callback()
            }

        }, function(err) {
            console.log('Something went wrong!', err);
        });

}

module.exports = router;