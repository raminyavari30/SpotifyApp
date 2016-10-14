var Main = (function() {

  var storage = {};
  var myAudio = null;

  storage.interval = null;

  //get access token and request token
  storage.getHashParams = function() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    if(hashParams.access_token) {
      $('#login').remove();
      this.relatedArtists();
      this.getArtistData();
      this.createProfile();
      this.artistAlbum();
      this.getTracks();
    }
    return hashParams;   
  },
  /*makes a call to /artist route using the ServerAPI and templates
  an image for the artist profile, the artist name, and the artist followers
  to render to the DOM
  */
  storage.getArtistData = function(data) {
    var that = this;
    ServerAPI.artistInfo(data).then(function(res) {
      var image = _.template('<div class="artist"><img id="artist" src=<%- image %>></div>');
      $('.main').append(image({image: res.images[0].url}))

      var name = _.template('<h1><%- name %></h1>');
      $('.artist').prepend(name({ 'name': res.name }));

      var followers = _.template('<h2 id="followers">Followers: <%- followers %></h2>');
      $('.navbar-form').append(followers({ 'followers': res.followers.total.toLocaleString() }));
    });
  },
  // storage.getFollowers = function(data) {
  //   var interval = setInterval(function() {
  //     $('#followers').remove();
  //     var followers = _.template('<h2 id="followers">Followers: <%- followers %></h2>');
  //     $('.navbar-form').append(followers({ 'followers': data.toLocaleString() }));
  //   },3000);
  // },
  /*makes a call to /arist/albums route using the ServerAPI and templates
  the albums to render to the DOM
  */
  storage.artistAlbum = function(data) {
    ServerAPI.artistAlbum(data).then(function(res) {
      var albums = _.template('<h3>Top Albums </h3><ul id="albums" class="list-inline"><% _.forEach(albums, function(album) { %><li id="tracks"><img src=<%- album.images[1].url %>></li><% }); %></ul>');
      $('.bottom').append(albums({ 'albums': res.items.slice(0,4) }));
    }); 
  },
  /*makes a call to /artist/related-artists route using the ServerAPI and templates
  the related artists info to render to the DOM
  */
  storage.relatedArtists = function(data) {
    ServerAPI.relatedArtists(data).then(function(res) {
      var relatedArtists = _.template('<ul class="playlist list-group" id="relatedArtists"><span id="related">Related Artists</span><% _.forEach(artists, function(artist) { %><li class="list-group-item"><%- artist.name %></li><% }); %></ul>');
      $('.main').prepend(relatedArtists({ 'artists': res.artists.slice(0,9) }));
    });
  },
  /*makes a call to /artist/tracks route using the ServerAPI and templates
  the track names to render to the DOM. The value attribute of each list 
  element was populated the the url to do a 30 second preview of each track.
  That value attribute is then used to populate new intances of the audio object
  to sample the songs when clicked on.
  */
  storage.getTracks = function(data) {
    ServerAPI.getTracks(data).then(function(res) {
      var myAudio = null;

      var tracks = _.template(
        `<ul class="playlist list-group" id="tracks">
          <span id="play">Click Songs to Play!</span>
            <% _.forEach(tracks, function(track) { %><li value="<%= track.preview_url %>" class="list-group-item song"><%- track.name %></li><% });%>
        </ul>`
      );
      $('.main').append(tracks({ 'tracks': res.tracks.slice(0,9) }));

      var pause;

      $('.song').on('click',function(e) {
        if(myAudio) {
          myAudio.pause();
          myAudio = null;
        }
        myAudio = new Audio($(this).attr('value'));
        myAudio.play();

        if(pause === undefined) {
          pause = true
          stop = _.template('<a id="stop" class="btn btn-danger">Stop</a>');
          $('#tracks').append(stop); 
          $('#stop').on('click', function(e) {
            myAudio.pause();
          });
        }
      });
      
      $('#search').on('click', function() {
        if(myAudio) {
          myAudio.pause();
        }
      });
    });
  },
  /*
  createProfile is used to build the form for searching artists to render to the DOM.
  On submit of form, grab the value being submitted, use the ServerAPI to
  find that artist's id, clear the DOM except the form, and invoke the above
  functions with the id being passed in to create the DOM with the new artist info
  */
  storage.createProfile = function() {

    var that = this;
    var value;
    var form = "<div class='navbar-form'><form ><input type='text' id='query' value='' class='form-control' placeholder='Type an Artist Name'/><input type='submit' id='search' class='btn btn-primary' value='Search'/></form></div>";
    $('body').prepend(form);
    $('form').submit(function(event) {
      event.preventDefault();
      value = $('#query').val();
      $('#query').val('');

      ServerAPI.searchArtists(value).then(function(res) {
        var id = res.artists.items[0].id;
        $('h1').remove();
        $('h2').remove();
        $('h3').remove();
        $('.artist').remove();
        $('#artist').remove();
        $('#albums').remove();
        $('#relatedArtists').remove();
        $('#tracks').remove();
        that.getArtistData(id);
        that.artistAlbum(id);
        that.relatedArtists(id);
        that.getTracks(id);
        // that.getFollowers(res.artists.items[0].followers.total);
      });
    });
  }
  return storage;
})();


$( document ).ready(function() {
    Main.getHashParams();
});



