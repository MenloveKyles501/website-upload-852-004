(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var list = document.querySelector('[data-movie-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterForm && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var queryInput = filterForm.querySelector('[name="q"]');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var formData = new FormData(filterForm);
      var query = normalize(formData.get('q'));
      var year = normalize(formData.get('year'));
      var type = normalize(formData.get('type'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
          ok = false;
        }

        if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
          ok = false;
        }

        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }
})();
