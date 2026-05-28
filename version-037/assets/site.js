(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function restart(next) {
            if (timer) {
                window.clearInterval(timer);
            }
            show(next);
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                restart(i);
            });
        });
        start();
    }

    function textValue(element, name) {
        return (element.getAttribute("data-" + name) || "").toLowerCase();
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var list = area.parentElement.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var keyword = area.querySelector("[data-filter-keyword]");
            var type = area.querySelector("[data-filter-type]");
            var year = area.querySelector("[data-filter-year]");
            var empty = area.parentElement.querySelector("[data-empty-message]");
            var params = new URLSearchParams(window.location.search);
            if (keyword && params.get("q")) {
                keyword.value = params.get("q");
            }
            if (year && params.get("year")) {
                year.value = params.get("year");
            }
            function apply() {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var visible = 0;
                Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
                    var haystack = ["title", "region", "genre", "tags", "type", "year"].map(function (name) {
                        return textValue(card, name);
                    }).join(" ");
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }
            [keyword, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initializeMoviePlayer = function (streamUrl, playerId) {
        var holder = document.getElementById(playerId);
        if (!holder) {
            return;
        }
        var video = holder.querySelector("video");
        var cover = holder.querySelector(".player-cover");
        var attached = false;
        var hls = null;
        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
