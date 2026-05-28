function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('play-button');

  if (!video || !button || !streamUrl) {
    return;
  }

  var loaded = false;
  var hls = null;

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
    video.load();
  }

  function startPlayback() {
    loadStream();
    button.classList.add('is-hidden');
    video.controls = true;

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
