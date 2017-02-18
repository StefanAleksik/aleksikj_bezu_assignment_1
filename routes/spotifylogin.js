var express = require('express');
var router = express.Router();
var querystring = require('querystring');

var client_id = '4feeba43e6634d019efb83b3fdc7fe31'; // Your client id
var client_secret = 'b8401d1bb1b94c1280faa4f54d77da27'; // Your secret
var redirect_uri = 'http://localhost:3000/spotifycallback'; // Your redirect uri

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';
router.get('/', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-library-read user-follow-read user-top-read';
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