window.onSpotifyWebPlaybackSDKReady = () => {
const token = 'BQCCpJRxZu_8QQKcmzGI9xLl5MNrGcDT3OuZSVb6y5J1_4fvx1ypHdqHfizR_aqf5NpzXxMqx1ftpc29DgwUKgNxpiP5DCEg-rwpNPXw_yCE3g0sHQbVEf_3GLmuv7AeFMN51pKplmm0xP0wQPy_Bo0KChS2TfK7ReyBuP6zgs5DzuDByAhsztU';
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); },
      volume:1
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
  };