
(function () {
  const state = {
    heroIndex: 0,
    heroTimer: null,
  };

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function initMobileNav() {
    const menuBtn = qs('[data-menu-toggle]');
    const menuPanel = qs('[data-mobile-panel]');
    const searchBtn = qs('[data-search-toggle]');
    const searchBox = qs('[data-search-box]');

    if (menuBtn && menuPanel) {
      menuBtn.addEventListener('click', () => {
        const open = menuPanel.classList.toggle('is-open');
        menuBtn.setAttribute('aria-expanded', String(open));
      });
    }
    if (searchBtn && searchBox) {
      searchBtn.addEventListener('click', () => {
        const open = searchBox.classList.toggle('is-open');
        searchBtn.setAttribute('aria-expanded', String(open));
        const input = qs('input', searchBox);
        if (open && input) setTimeout(() => input.focus(), 30);
      });
    }
  }

  function initBackToTop() {
    const btn = qs('[data-to-top]');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('is-visible', window.scrollY > 640);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initHeroCarousel() {
    const shell = qs('[data-hero-carousel]');
    if (!shell) return;
    const slides = qsa('[data-hero-slide]', shell);
    const dots = qsa('[data-hero-dot]', shell);
    if (!slides.length) return;

    const setSlide = (index) => {
      state.heroIndex = index;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      setSlide(i);
      restart();
    }));

    const restart = () => {
      if (state.heroTimer) clearInterval(state.heroTimer);
      state.heroTimer = setInterval(() => setSlide((state.heroIndex + 1) % slides.length), 5000);
    };

    setSlide(0);
    restart();
  }

  function initFilters() {
    const inputs = qsa('[data-live-filter]');
    if (!inputs.length) return;
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        const value = input.value.trim().toLowerCase();
        const scope = input.closest('[data-filter-scope]') || document;
        const cards = qsa('[data-card]', scope);
        const sections = qsa('[data-filter-section]', scope);
        let visible = 0;
        cards.forEach((card) => {
          const haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.dataset.genre,
            card.dataset.summary,
          ].join(' ').toLowerCase();
          const show = !value || haystack.includes(value);
          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });
        sections.forEach((section) => {
          const anyVisible = qsa('[data-card]', section).some((card) => card.style.display !== 'none');
          section.style.display = anyVisible ? '' : 'none';
        });
        const empty = qs('[data-empty-state]', scope);
        if (empty) empty.style.display = visible ? 'none' : '';
      });
    });
  }

  function initBadgeSorting() {
    const sortButtons = qsa('[data-sort-btn]');
    if (!sortButtons.length) return;
    sortButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.sortTarget ? qs(btn.dataset.sortTarget) : null;
        if (!target) return;
        const cards = qsa('[data-card]', target);
        const mode = btn.dataset.sortBtn;
        cards.sort((a, b) => {
          const ay = Number(a.dataset.year || 0);
          const by = Number(b.dataset.year || 0);
          if (mode === 'year-desc') return by - ay;
          if (mode === 'year-asc') return ay - by;
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        });
        cards.forEach(card => target.appendChild(card));
        qsa('[data-sort-btn]').forEach((x) => x.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }

  function initProgressBar() {
    const bar = qs('[data-progress]');
    if (!bar) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initBackToTop();
    initHeroCarousel();
    initFilters();
    initBadgeSorting();
    initProgressBar();
  });
})();
