var request = require('request');
var querystring = require('querystring');
var axios = require('axios');

var client_id = process.env.SPOTIFY_CLIENT_ID; 
var client_secret = process.env.SPOTFIY_CLIENT_SECRET;
var redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
var spotify_base_url = process.env.SPOTIFY_BASE_URL;
var spotify_search_artist = process.env.SPOTIFY_SEARCH_ARTIST;

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

//checks to see if artist exists. If not, set default one to Taylor Swift
var generateArtistID = function(id) {
  if(id === '_') {
    id = '06HL4z0CvFAxyc27GXpf02'; 
  }
  return id;  
}

var stateKey = 'spotify_auth_state';

module.exports = function(app) {

  app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

  app.get('/callback', function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
              refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });

  app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });

  app.get('/artist', function(req, res) {
    var data = generateArtistID(Object.keys(req.query)[0]);
    axios.get(spotify_base_url + data).then(function(response) {
      res.send(response.data);
    });
  });

  app.get('/artist/albums', function(req, res) {
    var data = generateArtistID(Object.keys(req.query)[0]);
    axios.get(spotify_base_url + data + '/albums').then(function(response) {
      res.send(response.data);
    });
  });

  app.get('/artist/related-artists', function(req, res) {
    var data = Object.keys(req.query)[0];
    var data = generateArtistID(Object.keys(req.query)[0]);
    axios.get(spotify_base_url + data + '/related-artists').then(function(response) {
      res.send(response.data);
    });
  });

  app.get('/artist/search', function(req, res) {
    var val = Object.keys(req.query)[0];
    var param = val = val.split(' ').join('%20');
    axios.get(spotify_search_artist + '?q=' + val + '&type=artist').then(function(response) {
      res.send(response.data);
    });
  });

  app.get('/artist/tracks', function(req, res) {
    var data = generateArtistID(Object.keys(req.query)[0]);
    axios.get(spotify_base_url + data + '/top-tracks?country=US').then(function(response) {
      res.send(response.data);
    });
  });
}
