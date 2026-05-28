(function () {
  function initMoviePlayer(id, sourceUrl) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      }
      video.controls = true;
    }

    function startVideo() {
      loadVideo();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
