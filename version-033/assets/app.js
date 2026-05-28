function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHeroCarousel() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var streamUrl = video.getAttribute("data-src");
    var hls = null;

    function attach() {
      if (!streamUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== streamUrl) {
          video.src = streamUrl;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        }
      } else if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      button.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cardHtml(movie) {
  return [
    '<article class="movie-card">',
    '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
    '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
    '    <span class="poster-score">' + escapeHtml(movie.rating) + '</span>',
    '  </a>',
    '  <div class="movie-card-body">',
    '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
    '    <div class="movie-meta">',
    '      <span>' + escapeHtml(movie.year) + '</span>',
    '      <span>' + escapeHtml(movie.region) + '</span>',
    '      <span>' + escapeHtml(movie.category) + '</span>',
    '    </div>',
    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
    '  </div>',
    '</article>'
  ].join("");
}

function initSearchPage() {
  var results = document.querySelector("[data-search-results]");
  var form = document.querySelector("[data-search-filter-form]");
  var summary = document.querySelector("[data-search-summary]");
  if (!results || !form || !summary || !window.MovieSearchIndex) {
    return;
  }

  var input = form.querySelector("[data-search-input]");
  var yearFilter = form.querySelector("[data-year-filter]");
  var typeFilter = form.querySelector("[data-type-filter]");
  var categoryFilter = form.querySelector("[data-category-filter]");
  var params = new URLSearchParams(window.location.search);

  input.value = params.get("q") || "";
  yearFilter.value = params.get("year") || "";
  typeFilter.value = params.get("type") || "";
  categoryFilter.value = params.get("category") || "";

  function match(movie, keyword, year, type, category) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.category,
      movie.genre,
      movie.tags,
      movie.oneLine
    ].join(" ").toLowerCase();
    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }
    if (year && movie.year !== year) {
      return false;
    }
    if (type && movie.type !== type) {
      return false;
    }
    if (category && movie.category !== category) {
      return false;
    }
    return true;
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var year = yearFilter.value;
    var type = typeFilter.value;
    var category = categoryFilter.value;
    var matched = window.MovieSearchIndex.filter(function (movie) {
      return match(movie, keyword, year, type, category);
    });
    var limited = matched.slice(0, 120);
    summary.textContent = "找到 " + matched.length + " 部影片" + (matched.length > limited.length ? "，当前显示前 " + limited.length + " 部" : "");
    if (!limited.length) {
      results.innerHTML = '<div class="detail-article"><h2>没有找到匹配影片</h2><p>可以减少筛选条件后重新搜索。</p></div>';
      return;
    }
    results.innerHTML = limited.map(cardHtml).join("");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var next = new URLSearchParams();
    if (input.value.trim()) {
      next.set("q", input.value.trim());
    }
    if (yearFilter.value) {
      next.set("year", yearFilter.value);
    }
    if (typeFilter.value) {
      next.set("type", typeFilter.value);
    }
    if (categoryFilter.value) {
      next.set("category", categoryFilter.value);
    }
    var query = next.toString();
    window.history.replaceState(null, "", query ? "search.html?" + query : "search.html");
    render();
  });

  input.addEventListener("input", render);
  yearFilter.addEventListener("change", render);
  typeFilter.addEventListener("change", render);
  categoryFilter.addEventListener("change", render);
  render();
}

ready(function () {
  initMobileMenu();
  initHeroCarousel();
  initPlayers();
  initSearchPage();
});
