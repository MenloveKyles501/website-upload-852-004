(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function normalized(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      if (!cards.length) {
        return;
      }
      var input = scope.querySelector("[data-search-input]");
      var type = scope.querySelector("[data-type-filter]");
      var region = scope.querySelector("[data-region-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var empty = scope.querySelector("[data-empty]");

      function apply() {
        var query = normalized(input ? input.value : "");
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalized([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matches = matchesQuery && matchesType && matchesRegion && matchesYear;
          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, region, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector("video[data-src]");
    var button = player.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    var started = false;

    function playNative() {
      video.src = source;
      return video.play();
    }

    function playWithHls() {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    }

    function start() {
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (button) {
        button.hidden = true;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        playNative().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        playWithHls();
        return;
      }
      loadScript("https://cdn.jsdelivr.net/npm/hls.js@latest")
        .then(function () {
          if (window.Hls && window.Hls.isSupported()) {
            playWithHls();
          } else {
            playNative().catch(function () {});
          }
        })
        .catch(function () {
          playNative().catch(function () {});
        });
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-video-player]")).forEach(setupPlayer);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
