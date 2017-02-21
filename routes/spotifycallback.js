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
var forEach = require('async-foreach').forEach;
var sendData = require('./sendData');
router.get('/', function(req, res, next) {

    spotifyApi.authorizationCodeGrant(req.query.code).then(function (data) {
        spotifyApi.setAccessToken(data.body.access_token);
        return spotifyApi.getMe();
    }).then(function (data) {

        User.findOneAndUpdate({username: req.session.username}, {  spotifyID: data.body.id, email: data.body.email }, function(err, user) {
            if (err) throw err;
            // we have the updated user returned to us
            //console.log(user);
        });
        req.session.spotifySet = data.body.id;
//console.log('Here here : '+data.body.id);
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
                      /*sendData.sendData(data.body.id, 'spotify', 'followed-artists', fields, followedArtists.artists);*/
                       console.log('number of followed artist ' + followedArtists.artists.length);
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
                                 /*sendData.sendData(data.body.id, 'spotify', 'followed-artists', fields, followedArtists.artists);*/
                                 console.log('number of followed artist' + followedArtists.artists.length);
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
                var savedTracks ={songs: []};
                var fileds = ['song_name', 'song_spotify_id', 'song_album_name', 'album_spotify_id', 'song_artist_name', 'song_artist_spotify_id'];
                if (total <= limit){
                    for (var i =0; i < tracks.body.items.length; i++){
                        savedTracks.songs.push({song_name: tracks.body.items[i].track.name, song_spotify_id: tracks.body.items[i].track.id, song_album_name: tracks.body.items[i].track.album.name, album_spotify_id: tracks.body.items[i].track.album.id,
                            song_artist_name: tracks.body.items[i].track.artists[0].name, song_artist_spotify_id: tracks.body.items[i].track.artists[0].id});
                        counter++;
                        if (counter == savedTracks.songs.length){
                            console.log('number of saved sonngs ' + savedTracks.songs.length);
                            //sendData.sendData(data.body.id, 'spotify', saved-tracks, fileds, savedTracks.songs);
                        }
                    }
                } else {
                   for (var ii = 0; ii < uplimit; ii++){
                        spotifyApi.getMySavedTracks({limit: 50, offset: offset_offset}).then(function (trackss) {

                            for (var i =0; i < trackss.body.items.length; i++){
                                savedTracks.songs.push({song_name: trackss.body.items[i].track.name, song_spotify_id: trackss.body.items[i].track.id, song_album_name: trackss.body.items[i].track.album.name, album_spotify_id: trackss.body.items[i].track.album.id,
                                song_artist_name: trackss.body.items[i].track.artists[0].name, song_artist_spotify_id: trackss.body.items[i].track.artists[0].id});
                                counter++;
                                if (total == savedTracks.songs.length){
                                    console.log('number of saved sonngs ' + savedTracks.songs.length);
                                    //sendData.sendData(data.body.id, 'spotify', saved-tracks, fileds, savedTracks.songs);
                                }
                            }

                        }, function(err) {
                            console.log('Something went wrong!', err);
                        });
                        offset_offset += limit;
                    }
                }
            }, function(err) {
                console.log('Something went wrong!', err);
            });

        //get user's top tracks
        var usersTopTracks ={spotify_id: data.body.id ,topTracks: []};
        getUsersTopTracks(0,50,usersTopTracks,function(){
            //Data ready to be saved
            console.log("Top tracks collected: " + usersTopTracks.topTracks.length);
            console.log(req.session.username);
            var fields = ["song_name","song_spotify_id","song_album_name","album_spotify_id","song_artist_name","song_artist_spotify_id"];
            //sendData.sendData(req.session.username, 'spotify', 'top_tracks', fields, usersTopTracks.topTracks);

        });
        //get user's top artists
        var usersTopArtists ={spotify_id: data.body.id ,topArtists: []};
        getUsersTopArtists(0,50,usersTopArtists,function(){
            //Data ready to be saved
            console.log("Top artists collected:" + usersTopArtists.topArtists.length);
            var fields = ["genres","artist_spotify_id","artist_name","artist_popularity"];
            //sendData.sendData(req.session.username, 'spotify', 'top_artists', fields, usersTopArtists.topArtists);
        });




        spotifyApi.getUserPlaylists(data.body.id)
            .then(function(playlist) {
                //console.log(playlist.body.items)
                var playlistsNew = [];
                for (var i=0;i<playlist.body.items.length;i++){
                    if(playlist.body.items[i].owner.id === data.body.id){
                        playlistsNew.push({id:playlist.body.items[i].id, name:playlist.body.items[i].name, songs:[]})
                    }
                }

                getPlaylistsWithSongs(0,playlistsNew,data.body.id,function(){
                    //console.log("Done");
                    //console.log(playlistsNew.);
                    var fields = ['playlist_name', 'playlist_id', 'song_name', 'song_spotify_id', 'song_album_name', 'song_album_spotify_id',
                    'song_artist_name', 'song_artists_spotify_id'];

                    var playlistSongs = [];
                    var counter = 0;
                    for (var ii = 0; ii < playlistsNew.length; ii++){

                        forEach(playlistsNew[ii].songs, function(e, index, arr){
                            /*console.log(playlistsNew[ii].name +' ' + e.song_name + index);*/
                            playlistSongs.push({playlist_name: playlistsNew[ii].name, playlist_id: playlistsNew[ii].id,
                                song_name: e.song_name, song_spotify_id: e.song_spotify_id, song_album_name: e.song_album_name,
                                song_album_spotify_id: e.song_album_spotify_id, song_artists_name: e.song_artists_name, song_artists_spotify_id: e.song_artists_spotify_id});

                        })
                        counter++
                        if(counter == playlistsNew.length){
                            //data ready to be send
                            //sendData.sendData(req.session.username, 'spotify', 'user-playlists_with_songs', fields, playlistSongs);

                            //send Shazam playlits if availbale

                            var shazamPlaylist = hasShazamPlaylist(playlistsNew)
                            if (shazamPlaylist != null){
                                //send the Shazam playlist to the extrenal server
                                console.log("User has Shazam playlist")
                                //get songs from Shazam playlist
                                var shazamPlaylistWithSongs = playlistSongs.filter(function(playlist){return playlist.playlist_name === "My Shazam Tracks"})
                                console.log(shazamPlaylistWithSongs)
                                //sendData.sendData(req.session.username, 'spotify', 'shazam-playlist', fields, shazamPlaylistWithSongs);
                            }
                        }
                    }

                });
                //return playlist.body.items.map(function(p) { return p.id; });
            });



   }), function (err) {
        res.status(err.code);
        res.send(err.message);
    }

});

/**
 * This function checks if the user has Shazam playlist, if yes, returns true, if not returns false
 * @param playlists - an JSON array of users playlists
 */
function hasShazamPlaylist(playlists){
    var index = playlists.map(function(playlist){return playlist.name}).indexOf("My Shazam Tracks")

    if (index == -1){
        return null
    }
    else {
        return playlists[index]
    }

}

function getPlaylistsWithSongs(index,playlists,spotify_id,callback){

    spotifyApi.getPlaylistTracks(spotify_id, playlists[index].id, {limit: 100})
        .then(function(tracks) {

            //console.log('number of songs in playlist ' + tracks.body.items.length);
            for (var iii = 0; iii < tracks.body.items.length; iii++ ){
                playlists[index].songs.push({song_name: tracks.body.items[iii].track.name, song_spotify_id: tracks.body.items[iii].track.id,
                song_album_name: tracks.body.items[iii].track.album.name, song_album_spotify_id: tracks.body.items[iii].track.album.id,
                song_artists_name: tracks.body.items[iii].track.artists[0].name, song_artists_spotify_id: tracks.body.items[iii].track.artists[0].id});
            }


            index++;
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

/**
 * Get User's Top Tracks
 * @param limit - The number of entities to return (max 50)
 * @param offset - The index of the first entity to return.
 * @param usersTopTracks - An array of results
 */
function getUsersTopTracks(limit,offset,usersTopTracks){
    spotifyApi.getMyTopTracks({limit : limit, offset : offset})
        .then(function(track) {

            var total = track.body.total;
            console.log("Total tracks" + total);
            console.log(track.body);
            for (var i =0; i < track.body.items.length; i++){
                usersTopTracks.topTracks.push({song_name: track.body.items[i].track.name, song_spotify_id: track.body.items[i].track.id, song_album_name: track.body.items[i].track.album.name, album_spotify_id: track.body.items[i].track.album.id,
                    song_artist_name: track.body.items[i].track.artists[0].name, song_artist_spotify_id: track.body.items[i].track.artists[0].id});
            }


            if (usersTopTracks.songs.length<total){
                offset += limit;
                getUsersTopTracks(offset,limit,usersTopTracks,callback)
            }
            else {
                callback()
            }

        })
}
/**
 * Get User's Top Artists
 * @param limit - The number of entities to return (max 50)
 * @param offset - The index of the first entity to return.
 * @param usersTopArtists - An array of results
 */
function getUsersTopArtists(limit,offset,usersTopArtists){
    spotifyApi.getMyTopTracks({limit : limit, offset : offset})
        .then(function(result) {
            var total = result.body.total;
            console.log("Total artists " + total);

            for (var i =0; i < result.body.items.length; i++){
                usersTopArtists.topArtists.push({genres: result.body.items[i].genres, artist_spotify_id: result.body.items[i].id, artist_name: result.body.items[i].name, artist_popularity: result.body.items[i].popularity});
            }


            if (usersTopArtists.topArtists.length<total){
                offset += limit;
                getUsersTopArtists(offset,limit,usersTopArtists,callback)
            }
            else {
                callback()
            }

        })
}

module.exports = router;