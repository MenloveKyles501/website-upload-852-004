
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function normalize(text) {
    return (text || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function escapeHtml(s) {
    return (s || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMenu() {
    const btn = $('[data-toggle-menu]');
    const nav = $('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initHero() {
    const tabs = $$('[data-hero-tab]');
    const slides = $$('.hero-slide');
    if (!tabs.length || !slides.length) return;
    let current = 0;
    const show = (idx) => {
      current = idx;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
      tabs.forEach((tab, i) => tab.classList.toggle('active', i === idx));
    };
    tabs.forEach((tab, idx) => tab.addEventListener('click', () => show(idx)));
    setInterval(() => show((current + 1) % slides.length), 6500);
  }

  function filterCards(container, query, type) {
    const cards = $$('.movie-card', container);
    let count = 0;
    const q = normalize(query);
    const t = normalize(type);
    cards.forEach((card) => {
      const hay = [
        card.dataset.title,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year,
      ].map(normalize).join(' ');
      const hit = (!q || hay.includes(q)) && (!t || normalize(card.dataset.type).includes(t));
      card.style.display = hit ? '' : 'none';
      if (hit) count += 1;
    });
    return count;
  }

  function initSearchPage() {
    const input = $('#search-input');
    const select = $('#search-type');
    const clear = $('#search-clear');
    const results = $('#search-results');
    const summary = $('#search-summary');
    if (!results || !window.MOVIES) return;
    const params = new URLSearchParams(location.search);
    const initial = params.get('q') || '';
    if (input) input.value = initial;

    function render() {
      const q = (input && input.value || '').trim();
      const type = select ? select.value : '';
      const list = window.MOVIES.filter((m) => {
        const hay = [m.t, m.ty, m.r, m.g.join(' '), m.tags.join(' '), m.o, m.s, m.y]
          .map(normalize).join(' ');
        return (!q || hay.includes(normalize(q))) && (!type || normalize(m.ty).includes(normalize(type)));
      });
      if (summary) summary.textContent = q ? `找到 ${list.length} 部匹配影片` : `共 ${list.length} 部影片`;
      results.innerHTML = list.slice(0, 300).map((m) => `
        <article class="movie-card compact">
          <a href="${escapeHtml(m.u)}" class="card-link">
            <div class="card-poster-wrap">
              <img src="${escapeHtml(m.i)}" alt="${escapeHtml(m.t)}" class="card-poster" loading="lazy" />
              <div class="card-overlay"></div>
              <div class="card-meta-top"><span class="badge">${escapeHtml(m.y)}</span><span class="badge soft">${escapeHtml(m.r)}</span></div>
              <div class="card-meta-bottom"><h3>${escapeHtml(m.t)}</h3><p>${escapeHtml(m.o)}</p></div>
            </div>
            <div class="card-body">
              <div class="card-line">${escapeHtml(m.ty)}</div>
              <div class="card-sub">${escapeHtml(m.g.join('、'))}</div>
            </div>
          </a>
        </article>`).join('');
    }
    input && input.addEventListener('input', render);
    select && select.addEventListener('change', render);
    clear && clear.addEventListener('click', () => { if (input) input.value = ''; if (select) select.value = ''; render(); });
    render();
  }

  function initPlayer() {
    const config = window.__PLAYER_CONFIG__;
    const video = $('#movie-player');
    const overlay = $('[data-play-toggle]');
    const panel = $('.player-box');
    if (!config || !video) return;

    const startPlayback = async () => {
      try { await video.play(); } catch (e) {}
      if (panel) panel.classList.add('playing');
      if (overlay) overlay.style.display = 'none';
    };

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(config.hls);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (overlay) overlay.textContent = '点击播放';
      });
      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          video.src = config.mp4;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.hls;
    } else {
      video.src = config.mp4;
    }

    overlay && overlay.addEventListener('click', startPlayback);
    video.addEventListener('play', () => { if (panel) panel.classList.add('playing'); if (overlay) overlay.style.display = 'none'; });
    video.addEventListener('pause', () => { if (overlay) overlay.style.display = ''; });
    video.addEventListener('click', startPlayback);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initSearchPage();
    initPlayer();
  });
})();
