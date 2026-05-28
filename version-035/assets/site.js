(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setActiveSlide(carousel) {
    const slides = qsa('.hero-slide', carousel);
    const dots = qsa('[data-hero-dot]', carousel);
    if (!slides.length) return;

    let index = 0;
    const activate = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    };

    let timer = window.setInterval(() => activate(index + 1), 5500);

    carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
    carousel.addEventListener('mouseleave', () => {
      timer = window.setInterval(() => activate(index + 1), 5500);
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => activate(i));
    });

    const prev = qs('[data-hero-prev]', carousel);
    const next = qs('[data-hero-next]', carousel);
    if (prev) prev.addEventListener('click', () => activate(index - 1));
    if (next) next.addEventListener('click', () => activate(index + 1));

    activate(0);
  }

  function setupMobileMenu() {
    const btn = qs('[data-menu-toggle]');
    const menu = qs('[data-mobile-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 2).map((tag) => `<span class="chip chip-soft">${tag}</span>`).join('');
    return `
      <a class="movie-card" href="movie-${movie.id}.html" style="--hue:${movie.h1};--hue2:${movie.h2};--hue3:${movie.h3};">
        <div class="movie-poster">
          <div class="poster-badge">${movie.type}</div>
          <div class="poster-year">${movie.year || ''}</div>
          <div class="poster-main">
            <div class="poster-title">${movie.title}</div>
            <div class="poster-sub">${movie.region} · ${movie.genre || '内容精选'}</div>
          </div>
          <div class="poster-glow"></div>
        </div>
        <div class="movie-meta">
          <div class="movie-meta-top">
            <span class="chip chip-accent">${movie.region}</span>
            <span class="chip chip-muted">${movie.year || '未知年份'}</span>
          </div>
          <p class="movie-title-line">${movie.title}</p>
          <p class="movie-one-line">${movie.one_line || movie.summary || ''}</p>
          <div class="movie-tags">${tags}</div>
        </div>
      </a>`;
  }

  function renderSearchPage() {
    const root = qs('[data-search-root]');
    if (!root || !window.MOVIES_DATA) return;

    const resultGrid = qs('[data-search-results]', root);
    const countEl = qs('[data-search-count]', root);
    const emptyEl = qs('[data-search-empty]', root);
    const input = qs('[data-search-input]', root);
    const categorySelect = qs('[data-search-category]', root);
    const regionSelect = qs('[data-search-region]', root);
    const yearSelect = qs('[data-search-year]', root);
    const clearBtn = qs('[data-search-clear]', root);

    const all = window.MOVIES_DATA.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    const params = new URLSearchParams(window.location.search);
    let state = {
      query: params.get('q') || '',
      category: '',
      region: '',
      year: '',
      page: 1,
    };

    if (input) input.value = state.query;

    const categoryMap = {
      '悬疑精选': '悬疑精选',
      '动作精选': '动作精选',
      '喜剧精选': '喜剧精选',
      '爱情精选': '爱情精选',
      '动画精选': '动画精选',
      '奇幻精选': '奇幻精选',
      '经典精选': '经典精选',
      '剧情精选': '剧情精选',
    };

    function pageCategory(movie) {
      return movie.category || '剧情精选';
    }

    function matches(movie) {
      const q = state.query.trim().toLowerCase();
      const text = [movie.title, movie.one_line, movie.summary, movie.genre, movie.region, movie.type, ...(movie.tags || [])].join(' ').toLowerCase();
      const byQuery = !q || text.includes(q);
      const byCategory = !state.category || pageCategory(movie) === state.category;
      const byRegion = !state.region || movie.region === state.region;
      const byYear = !state.year || String(movie.year) === String(state.year);
      return byQuery && byCategory && byRegion && byYear;
    }

    function render() {
      const filtered = all.filter(matches);
      countEl.textContent = filtered.length.toLocaleString('zh-CN');
      emptyEl.hidden = filtered.length > 0;
      resultGrid.innerHTML = filtered.map(movieCardTemplate).join('');
    }

    const form = qs('[data-search-form]', root);
    if (form) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        state.query = input.value || '';
        state.page = 1;
        history.replaceState(null, '', `?q=${encodeURIComponent(state.query)}`);
        render();
      });
    }

    [input, categorySelect, regionSelect, yearSelect].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', () => {
        state.query = input.value || '';
        state.category = categorySelect ? categorySelect.value : '';
        state.region = regionSelect ? regionSelect.value : '';
        state.year = yearSelect ? yearSelect.value : '';
        render();
      });
      el.addEventListener('change', () => {
        state.query = input.value || '';
        state.category = categorySelect ? categorySelect.value : '';
        state.region = regionSelect ? regionSelect.value : '';
        state.year = yearSelect ? yearSelect.value : '';
        render();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.query = '';
        state.category = '';
        state.region = '';
        state.year = '';
        if (input) input.value = '';
        if (categorySelect) categorySelect.value = '';
        if (regionSelect) regionSelect.value = '';
        if (yearSelect) yearSelect.value = '';
        history.replaceState(null, '', window.location.pathname);
        render();
      });
    }

    render();
  }

  function renderRankingPage() {
    const root = qs('[data-ranking-root]');
    if (!root || !window.MOVIES_DATA) return;
    const grid = qs('[data-ranking-grid]', root);
    if (!grid) return;
    const top = window.MOVIES_DATA.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 100);
    grid.innerHTML = top.map((movie, index) => `
      <article class="rank-row">
        <div class="rank-no">${index + 1}</div>
        <div class="rank-main">
          <a class="rank-title" href="movie-${movie.id}.html">${movie.title}</a>
          <div class="rank-meta">${movie.year || ''} · ${movie.region} · ${movie.type} · ${movie.genre || ''}</div>
          <div class="rank-snippet">${movie.one_line || movie.summary || ''}</div>
        </div>
        <a class="rank-link" href="movie-${movie.id}.html">查看</a>
      </article>
    `).join('');
  }

  function setupDetailPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const playBtn = qs('[data-player-play]', shell);
    const sourceButtons = qsa('[data-player-source]', shell);
    const status = qs('[data-player-status]', shell);
    const mp4 = shell.getAttribute('data-mp4') || '';
    const hls = shell.getAttribute('data-hls') || '';
    let hlsInstance = null;
    let currentSource = 'mp4';

    function destroyHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function loadMp4() {
      destroyHls();
      video.removeAttribute('src');
      video.src = mp4;
      video.load();
      currentSource = 'mp4';
      setStatus('当前线路：MP4');
    }

    function loadHls() {
      if (!hls) {
        setStatus('当前线路：HLS 不可用');
        loadMp4();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        destroyHls();
        video.removeAttribute('src');
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hlsInstance.loadSource(hls);
        hlsInstance.attachMedia(video);
        currentSource = 'hls';
        setStatus('当前线路：HLS');
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        destroyHls();
        video.src = hls;
        currentSource = 'hls';
        setStatus('当前线路：HLS（原生支持）');
      } else {
        setStatus('当前线路：HLS 不可用，已切换到 MP4');
        loadMp4();
      }
    }

    sourceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const source = button.getAttribute('data-player-source');
        sourceButtons.forEach((b) => b.classList.toggle('is-active', b === button));
        if (source === 'hls') {
          loadHls();
        } else {
          loadMp4();
        }
        video.play().catch(() => {});
      });
    });

    if (mp4) loadMp4();
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (currentSource === 'hls' && !video.src && hls) {
          loadHls();
        }
        video.play().catch(() => {});
      });
    }

    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => shell.classList.remove('is-playing'));
    video.addEventListener('ended', () => shell.classList.remove('is-playing'));

    const autoPlayOnClick = qs('[data-player-open]');
    if (autoPlayOnClick) {
      autoPlayOnClick.addEventListener('click', () => video.play().catch(() => {}));
    }
  }

  function copyLink() {
    const btn = qs('[data-copy-link]');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = '链接已复制';
        window.setTimeout(() => (btn.textContent = '复制链接'), 1500);
      } catch (err) {
        btn.textContent = '复制失败';
        window.setTimeout(() => (btn.textContent = '复制链接'), 1500);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    qsa('[data-hero-carousel]').forEach(setActiveSlide);
    renderSearchPage();
    renderRankingPage();
    setupDetailPlayer();
    copyLink();
  });
})();
