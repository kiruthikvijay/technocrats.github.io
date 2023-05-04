var redirect_uri = "http://127.0.0.1:5000";
 
var client_id = "cf8e6f7993504e8bb11c50d48d99b018"; 
var client_secret ="165ada7edf8f4798816d188847b7663d"; // In a real app you should not expose your client_secret to the user

var access_token = null;
var refresh_token = null;
var currentPlaylist = "";
var radioButtons = [];
var track_ids = [];

//https://open.spotify.com/playlist/?si=ujUJYhpnQS-kvLkHU1Q8rA&utm_source=whatsapp

var tracklist = [];
var playlistcollection = [];
var EnergyCollection = [];
var emotion = "happy";
var sad_playlist = '0jrlHA5UmxRxJjoykf7qRY'; //2EXuokh7WCL819SuBJGGmL
var happy_playlist = '0jrlHA5UmxRxJjoykf7qRY';//'6yjHeCW9O0EpvJyN0IP05P'; //spotify:playlist:5BOhvGTLPSHgFT6xjXOkOL
var neutral_playlist = '4KfJccfGchz4uOOPAlxKkz';
var angry_playlist = '1ofJSOJDpcRRBW6tMOyfdv';
var fear_playlist = '5PO4rDoRiRYJHqfZRdS1DW';
var emotion_playlist = '';
var playlistcollectionNumber = []
var ran_num;
var user_id = "31ovtdo4t2fvazkv44q6cfhfarka";
var user_playlist = ""; //https://open.spotify.com/playlist/6wOhOSHMUArKuClWxiqhrO?si=632tXdyjT_2uGtOOd6FaPw
var play_count = ""


const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";
const AUDIO_FEATURES = "https://api.spotify.com/v1/audio-features/{id}";

function onPageLoad(){
    client_id = !localStorage.getItem("client_id")?localStorage.getItem("client_id"):client_id;
    client_secret = !localStorage.getItem("client_secret")?localStorage.getItem("client_secret"):client_secret;
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            // we don't have an access token so present token section
            // document.getElementById("tokenSection").style.display = 'block';  
        }
        else {
            // we have an access token so present device section
            // document.getElementById("deviceSection").style.display = 'block';  
            refreshDevices();
            refreshPlaylists();
            currentlyPlaying();
        }
    }
    refreshRadioButtons();
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addDevice(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node); 
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function refreshPlaylists(){
    callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
}

function handlePlaylistsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "playlists" );
        data.items.forEach(item => addPlaylist(item));
        document.getElementById('playlists').value=currentPlaylist;
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addPlaylist(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node); 
}

function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function play(){
    let playlist_id = document.getElementById("playlists").value;
    let trackindex = document.getElementById("tracks").value;
    alert(trackindex);
    let album = document.getElementById("album").value;
    alert(album);
    let body = {};
    if ( album.length > 0 ){
        body.context_uri = album;
    }
    else{
        body.context_uri = "spotify:playlist:" + playlist_id;
    }
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse );
}

function shuffle(){
    callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId(), null, handleApiResponse );
    play(); 
}

function pause(){
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
}

function next(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse );
}

function previous(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse );
}

function transfer(){
    let body = {};
    body.device_ids = [];
    body.device_ids.push(deviceId())
    callApi( "PUT", PLAYER, JSON.stringify(body), handleApiResponse );
}

function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}

function deviceId(){
    return document.getElementById("devices").value;
}

function fetchTracks(){
    let playlist_id = document.getElementById("playlists").value;
    console.log(playlist_id);
    if ( playlist_id.length > 0 ){
        url = TRACKS.replace("{{PlaylistId}}", playlist_id);
        callApi( "GET", url, null, handleTracksResponse );
    }
}

function handleTracksResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "tracks" );
        data.items.forEach( (item, index) => addTrack(item, index));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item, index){
    let node = document.createElement("option");
    node.value = index;
    node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
    document.getElementById("tracks").appendChild(node); 
}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.item != null ){
            document.getElementById("albumImage").src = data.item.album.images[0].url;
            document.getElementById("trackTitle").innerHTML = data.item.name;
            document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
        }


        if ( data.device != null ){
            // select device
            currentDevice = data.device.id;
            document.getElementById('devices').value=currentDevice;
        }

        if ( data.context != null ){
            // select playlist
            currentPlaylist = data.context.uri;
            currentPlaylist = currentPlaylist.substring( currentPlaylist.lastIndexOf(":") + 1,  currentPlaylist.length );
            document.getElementById('playlists').value=currentPlaylist;
        }
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function saveNewRadioButton(){
    let item = {};
    item.deviceId = deviceId();
    item.playlistId = document.getElementById("playlists").value;
    radioButtons.push(item);
    localStorage.setItem("radio_button", JSON.stringify(radioButtons));
    refreshRadioButtons();
}

function refreshRadioButtons(){
    let data = localStorage.getItem("radio_button");
    if ( data != null){
        radioButtons = JSON.parse(data);
        if ( Array.isArray(radioButtons) ){
            removeAllItems("radioButtons");
            radioButtons.forEach( (item, index) => addRadioButton(item, index));
        }
    }
}

function onRadioButton( deviceId, playlistId ){
    let body = {};
    body.context_uri = "spotify:playlist:" + playlistId;
    body.offset = {};
    body.offset.position = 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId, JSON.stringify(body), handleApiResponse );
    //callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId, null, handleApiResponse );
}

function addRadioButton(item, index){
    let node = document.createElement("button");
    node.className = "btn btn-primary m-2";
    node.innerText = index;
    node.onclick = function() { onRadioButton( item.deviceId, item.playlistId ) };
    document.getElementById("radioButtons").appendChild(node);
}

function suggestSong(lol){
    user_playlist = document.getElementById("playlist").value;
    console.log(access_token);
    emotion = lol;
    EnergyCollection = [];
    track_ids = [];
    tracklist = [];
    if(user_playlist != "lol"){
        emotion_playlist = user_playlist.substring(34, 56);
        // alert(emotion_playlist);
    }
    else{
    if(emotion.localeCompare("happy") == 0 || emotion.localeCompare("surprise") == 0){
        emotion_playlist = happy_playlist;
    }
    else if(emotion.localeCompare("sad") == 0){
        emotion_playlist = sad_playlist;
    }
    else if(emotion.localeCompare("neutral") == 0){
        emotion_playlist = neutral_playlist;
    }
    else if(emotion.localeCompare("angry") == 0){
        emotion_playlist = angry_playlist;
    }
    else if(emotion.localeCompare("fear") == 0){
        emotion_playlist = fear_playlist;
    }
    else if(emotion.localeCompare("disgust") == 0){
        emotion_playlist = angry_playlist;
    }
    else{
        emotion_playlist = neutral_playlist;
    }
    }
    callApi( "GET", PLAYLISTS, null, handlePlaylistResponse1 );
    playlistcollection = [];
    playlistcollectionNumber = [];
    EnergyCollection = [];

}

function handlePlaylistResponse1(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "playlists" );
        data.items.forEach(item => addPlaylist1(item));
        // document.getElementById('playlists').value=currentPlaylist;
        if(user_playlist == "lol"){
            play1();
        }
        else{
        fetchTracks1();
        }
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        // alert(this.responseText);
    }
}

function addPlaylist1(item){
    // let node = document.createElement("option");
    // node.value = item.id;
    // node.innerHTML = item.name + " (" + item.tracks.total + ")";
    // document.getElementById("playlists").appendChild(node); 
    playlistcollection.push(item.name + " (" + item.tracks.total + ")");
}


function fetchTracks1(){
    // window.alert(playlistcollection);
    // let playlist_id = document.getElementById("playlists").value;
    // if ( playlist_id.length > 0 ){
        url = TRACKS.replace("{{PlaylistId}}", emotion_playlist); //Tamil Playlist
        callApi( "GET", url, null, handleTracksResponse1 );
    // }
}

function handleTracksResponse1(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "tracks" );
        data.items.forEach( (item, index) => addTrack1(item, index));
        audio_features();
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else if ( this.status == 404 ){
        play1();
    }
    else {
        console.log(this.responseText);
        // alert(this.responseText);
    }
}

function addTrack1(item, index){
    // let node = document.createElement("option");
    // node.value = index;
    // node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")" + "  " +item.track.uri;
    tracklist.push(item.track.uri.substring(14));
    // document.getElementById("tracks").appendChild(node);
    
}

function audio_features(){
    for(var i = 0; i < tracklist.length || i < 50; i++){
        url = AUDIO_FEATURES.replace("{id}", tracklist[i]);
        
        if(i == 49 || i == tracklist.length-1){
            callApi( "GET", url, null, handleaudioResponse2 );
        }
        else{
            callApi( "GET", url, null, handleaudioResponse1 );
        }
        }
        // play1();
    
}

function handleaudioResponse1(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if(emotion == "happy"){
            if(data.mode==1){
                if(data.key==2||data.key==4||data.key==6||data.key==8||data.key==10||data.key==12){
                    EnergyCollection.push(1);
                    track_ids.push(data.id);
                }
                else{
                    EnergyCollection.push(0);
                }
            }
            else{
                EnergyCollection.push(0);
            }
        
        }
        else if(emotion == "sad"){
            if(data.mode==0){
                if(data.key==0||data.key==1||data.key==3||data.key==5||data.key==7||data.key==9||data.key==11){
                    EnergyCollection.push(1);
                    track_ids.push(data.id);
                }
                else{
                    EnergyCollection.push(0);
                }
            }
            else{
                EnergyCollection.push(0);
            }
        }
        else if(emotion == "angry"){
            if(data.loudness>=-8){
                EnergyCollection.push(1);
                track_ids.push(data.id);
            }
            else{
                EnergyCollection.push(0);
            }
        }
        else if(emotion == "neutral"){
            if(data.tempo>=80&&data.tempo<=145){
                EnergyCollection.push(1);
                track_ids.push(data.id);
            }
            else{
                EnergyCollection.push(0);
            }
        }
        // play1()
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        // alert(this.responseText);
    }
}



function handleaudioResponse2(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if(emotion == "happy"){
            if(data.mode==1){
                if(data.key==2||data.key==4||data.key==6||data.key==8||data.key==10||data.key==12){
                    EnergyCollection.push(1);
                    track_ids.push(data.id);
                }
                else{
                    EnergyCollection.push(0);
                }
            }
            else{
                EnergyCollection.push(0);
            }
        
        }
        else if(emotion == "sad"){
            if(data.mode==0){
                if(data.key==0||data.key==1||data.key==3||data.key==5||data.key==7||data.key==9||data.key==11){
                    EnergyCollection.push(1);
                    track_ids.push(data.id);
                }
                else{
                    EnergyCollection.push(0);
                }
            }
            else{
                EnergyCollection.push(0);
            }
        }
        else if(emotion == "angry"){
            if(data.loudness>=-8){
                EnergyCollection.push(1);
                track_ids.push(data.id);
            }
            else{
                EnergyCollection.push(0);
            }
        }
        else if(emotion == "neutral"){
            if(data.tempo>=80&&data.tempo<=145){
                EnergyCollection.push(1);
                track_ids.push(data.id);
            }
            else{
                EnergyCollection.push(0);
            }
        }
        play1();
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        // alert(this.responseText);
    }
}




function play1(){
    var lol_i;
    if(user_playlist == "lol"){
        lol_i = Math.floor(Math.random()*10);
        
        if(emotion == 'happy'){
           lol_i = Math.floor(Math.random()*10);
        }
        else{
            lol_i = Math.floor(Math.random()*10);
        }
    
    }
    else{
        // var i = 0;
        // var ran = Math.floor(Math.random() * EnergyCollection.length);
        // while(EnergyCollection[ran] == 0 || i > EnergyCollection.length){
        //     ran = Math.floor(Math.random() * EnergyCollection.length);
        //     i++;
        // }
        // lol_i = ran;

        var ran1 = Math.floor(Math.random() * track_ids.length);
        var play_string = track_ids[ran1];
        lol_i = tracklist.indexOf(play_string);
        
        if(track_ids.length == 0){
            lol_i = Math.floor(Math.random()*10);
            if(emotion.localeCompare("happy") == 0 || emotion.localeCompare("surprise") == 0){
                emotion_playlist = happy_playlist;
            }
            else if(emotion.localeCompare("sad") == 0){
                emotion_playlist = sad_playlist;
            }
            else if(emotion.localeCompare("neutral") == 0){
                emotion_playlist = neutral_playlist;
            }
            else if(emotion.localeCompare("angry") == 0){
                emotion_playlist = angry_playlist;
            }
            else if(emotion.localeCompare("fear") == 0){
                emotion_playlist = fear_playlist;
            }
            else if(emotion.localeCompare("disgust") == 0){
                emotion_playlist = angry_playlist;
            }
            else{
                emotion_playlist = neutral_playlist;
            }
        }
    }

    
    // if(emotion == 'happy'){
    //     let lol_i = Math.floor(Math.random()*10);
    // }
    // else{
    //     let lol_i = Math.floor(Math.random()*10);
    // }
    // alert(EnergyCollection[lol_i]);
    let playlist_id =  emotion_playlist;     //document.getElementById("playlists").value;
    let trackindex =    lol_i.toString();   //document.getElementById("tracks").value;
    play_count = trackindex;
    let album = document.getElementById("album").value;
    let body = {};
    if ( album.length > 0 ){
        body.context_uri = album;
    }
    else{
        body.context_uri = "spotify:playlist:" + playlist_id;
    }
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse1 );
}

function play2(){
    let playlist_id =  emotion_playlist;     //document.getElementById("playlists").value;
    let trackindex =    play_count;   //document.getElementById("tracks").value;
    let album = document.getElementById("album").value;
    let body = {};
    if ( album.length > 0 ){
        body.context_uri = album;
    }
    else{
        body.context_uri = "spotify:playlist:" + playlist_id;
    }
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse1 );
}

function shuffle1(){
    callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId(), null, handleApiResponse1 );
    play1(); 
}

function pause1(){
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse1 );
}

function next1(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse1 );
}

function previous1(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse1 );
}



function handleApiResponse1(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        // alert(this.responseText);
    }    
}

































// The buttons to start & stop stream and to capture the image
var btnStart = document.getElementById( "btn-start" );
var btnStop = document.getElementById( "btn-stop" );
var btnCapture = document.getElementById( "btn-capture" );

// The stream & capture
var stream = document.getElementById( "stream" );
var capture = document.getElementById( "capture" );
var snapshot = document.getElementById( "snapshot" );

// The video stream
var cameraStream = null;

// Attach listeners
btnStart.addEventListener( "click", startStreaming );
btnStop.addEventListener( "click", stopStreaming );
btnCapture.addEventListener( "click", captureSnapshot );

// Start Streaming
function startStreaming() {

var mediaSupport = 'mediaDevices' in navigator;

if( mediaSupport && null == cameraStream ) {

    navigator.mediaDevices.getUserMedia( { video: true } )
    .then( function( mediaStream ) {

    cameraStream = mediaStream;

    stream.srcObject = mediaStream;

    stream.play();
    })
    .catch( function( err ) {

    console.log( "Unable to access camera: " + err );
    });
}
else {

    alert( 'Your browser does not support media devices.' );

    return;
}
}

// Stop Streaming
function stopStreaming() {

if( null != cameraStream ) {

    var track = cameraStream.getTracks()[ 0 ];

    track.stop();
    stream.load();

    cameraStream = null;
}
}
        function dataURItoBlob( dataURI ) {

    var byteString = atob( dataURI.split( ',' )[ 1 ] );
    var mimeString = dataURI.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];
    
    var buffer	= new ArrayBuffer( byteString.length );
    var data	= new DataView( buffer );
    
    for( var i = 0; i < byteString.length; i++ ) {
    
        data.setUint8( i, byteString.charCodeAt( i ) );
    }
    
    return new Blob( [ buffer ], { type: mimeString } );
}

function captureSnapshot() {

    btnCapture.disabled = true;
    btnCapture.innerHTML = "wait 5 sec"

    setTimeout(()=>{
        btnCapture.disabled = false;
        btnCapture.innerHTML = "Capture Image"
    },5000)

if( null != cameraStream ) {

    var ctx = capture.getContext( '2d' );
    var img = new Image();

    ctx.drawImage( stream, 0, 0, capture.width, capture.height );

    img.src   = capture.toDataURL( "image/png" );
    img.height = 324;
    img.width = 432;

    var data	= new FormData();
    var dataURI	= img.src;
    var imageData   = dataURItoBlob( dataURI );

    snapshot.innerHTML = '';


    stream.style.borderColor = "#ba312d";
    stream.style.borderWidth = "6px";

    setTimeout(() => {
        stream.style.borderWidth = "3.5px";
        stream.style.borderColor = "#524A4E";

    },1000);

    // $("video").fadeOut(100,()=>{
    //     snapshot.style.display = " inline-block"
    //     snapshot.appendChild( img );
    //     setTimeout(()=>{
    //         snapshot.innerHTML = '';
    //         snapshot.style.display = "none"
    //         $("video").fadeIn(100);
    //     },300);
    // });
    
    
    var formdata = new FormData();    
    formdata.append("image", imageData, "faceimage.jpg");

    var advin = document.getElementById("adv");

    
    fetch("/emotion",
                {
                    method:"POST",
                    body: formdata
                })
                .then((res)=>{
                    transfer();
                    return res.json();
                })
                .then((data) => {
                    console.log(data.emotion); 
                    // data.emotion = "sad"
                    
                    if(!data)
                    {
                        $("#emoji").html("&#128064");
                        $("#sugg").html("Suggestions");
                        advin.innerHTML = "-"
                    }
                    else if(!data.emotion)
                    {
                        $("#emoji").html("&#128064");
                        $("#sugg").html("Suggestions");
                        advin.innerHTML = "-"
                    }
                    else if(data.emotion == "neutral")
                    {
                        $("#emoji").html("&#128528");
                        $("#sugg").html("Suggestions");
                        suggestSong(data.emotion);
                        advin.innerHTML = "<span style=\"font-size: 50px;\">&#127926;</span><br>";
                    }
                    else if(data.emotion == "happy")
                    {
                        $("#emoji").html("&#128515");
                        $("#sugg").html("Looks like you're happy");
                        suggestSong(data.emotion);
                        advin.innerHTML = "<span style=\"font-size: 50px;\">&#128077;</span><br>";
                    }
                    else if(data.emotion == "sad")
                    {
                        $("#emoji").html("&#128532");
                        $("#sugg").html("Looks like you're sad.Suggestions to improve your mood");
                        suggestSong(data.emotion);
                        advin.innerHTML = "&#8226;Brisk walking<br>&#8226;Jogging<br>&#8226;Weight training<br>&#8226;Water aerobics<br>&#8226;Swimming<br>";
                    }
                    else if(data.emotion == "surprise")
                    {
                        $("#emoji").html("&#128561");
                        $("#sugg").html("Looks like you're suprised");
                        suggestSong(data.emotion);
                        advin.innerHTML = "<span style=\"font-size: 50px;\">&#128077;</span><br>";
                    }
                    else if(data.emotion == "fear")
                    {
                        $("#emoji").html("&#128551");
                        $("#sugg").html("Looks like you're afraid.Suggestions to improve your mood");
                        suggestSong(data.emotion);
                        advin.innerHTML = "&#8226;breathing<br>&#8226;visualizing<br>&#8226;Be aware of how you feel<br>&#8226;counting<br>&#8226;stay present<br>";
                    }
                    else if(data.emotion == "angry")
                    {
                        $("#emoji").html("&#128545");
                        $("#sugg").html("Looks like you're angry.Suggestions to improve your mood");
                        suggestSong(data.emotion);
                        advin.innerHTML = " &#8226;Deep Breathing<br>&#8226;Progressive Relaxation<br>&#8226;Boxing<br>&#8226;Brisk Walking<br>&#8226;Weight Lifting<br>";
                    }
                    else if(data.emotion == "disgust")
                    {
                        $("#emoji").html("&#129314");
                        $("#sugg").html("Looks like you're disgusted.Suggestions to improve your mood");
                        suggestSong(data.emotion);
                        advin.innerHTML = "&#8226;Allow rather than accept<br>&#8226;Respond with flexibility<br>";
                    }
                    else if(data.emotion == "nil")
                    {
                        $("#emoji").html("&#128064");
                        $("#sugg").html("Suggestions");
                        advin.innerHTML = "-";
                    }
                })
                .catch(err=>{
                    console.log(err);
                });
}
}