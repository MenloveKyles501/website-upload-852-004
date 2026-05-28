(function () {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 24) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (button && header && panel) {
        button.addEventListener('click', function () {
            header.classList.toggle('menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startSlider() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
            startSlider();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startSlider();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startSlider();
        });
    }

    showSlide(0);
    startSlider();

    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get('search') || '';
    var keyword = document.querySelector('[data-filter-keyword]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var category = document.querySelector('[data-filter-category]');
    var reset = document.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-result]');

    if (keyword && initialSearch) {
        keyword.value = initialSearch;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }
        var k = normalize(keyword ? keyword.value : '');
        var y = normalize(year ? year.value : '');
        var r = normalize(region ? region.value : '');
        var c = normalize(category ? category.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var ok = true;

            if (k && text.indexOf(k) === -1) {
                ok = false;
            }
            if (y && cardYear.indexOf(y) === -1) {
                ok = false;
            }
            if (r && cardRegion.indexOf(r) === -1) {
                ok = false;
            }
            if (c && cardCategory !== c) {
                ok = false;
            }

            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('visible', visible === 0);
        }
    }

    [keyword, year, region, category].forEach(function (field) {
        if (field) {
            field.addEventListener('input', runFilter);
            field.addEventListener('change', runFilter);
        }
    });

    if (reset) {
        reset.addEventListener('click', function () {
            if (keyword) {
                keyword.value = '';
            }
            if (year) {
                year.value = '';
            }
            if (region) {
                region.value = '';
            }
            if (category) {
                category.value = '';
            }
            runFilter();
        });
    }

    runFilter();
})();

function initMoviePlayer(source) {
    var video = document.querySelector('.movie-player-video');
    var overlay = document.querySelector('.player-start');
    var attached = false;
    var hls = null;

    if (!video || !overlay || !source) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function start() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!attached) {
            start();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
