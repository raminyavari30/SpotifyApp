//creates object to store all of my ajax calls to the back end
var ServerAPI = (function(){

  function callAPI(endpoint,method,data,dataType) {
    return new Promise(function executor(resolve,reject){
      $.ajax(endpoint,{
        method: method,
        data: data,
        dataType: dataType,
        cache: false,
        success: resolve,
        error: function onError(jq,statusText,errText){
          reject(jq.responseText || errText);
        },
      });
    });
  }

  function artistInfo(data) {
    return callAPI('/artist','GET', data, 'JSON')
  }

  function artistAlbum(data) {
    return callAPI('/artist/albums','GET', data, 'JSON')
  }

  function relatedArtists(data) {
    return callAPI('/artist/related-artists','GET', data, 'JSON')
  }

  function searchArtists(data) {
    return callAPI('/artist/search', 'GET', data, 'JSON')
  }

  function getTracks(data) {
    return callAPI('/artist/tracks', 'GET', data, 'JSON')
  }


  var publicAPI = {
    artistInfo: artistInfo,
    artistAlbum: artistAlbum,
    relatedArtists: relatedArtists,
    searchArtists: searchArtists,
    getTracks: getTracks
  };

  return publicAPI;

})();