'use strict';

$(function () {
  $('#tips-accordion').accordion({ heightStyle: 'content', collapsible: true, active: 0 });

  if ($('.carousel').length && typeof $('.carousel').slick === 'function') {
    $('.carousel').slick({ dots: true, arrows: true, autoplay: true, autoplaySpeed: 3000, adaptiveHeight: true });
  }

  const THEME_COLORS = ['red','yellow','blue'];
  function applyColorTheme(color, mode) {
    const body = $('body');
    THEME_COLORS.forEach(c => body.removeClass('theme-' + c + '-light').removeClass('theme-' + c + '-dark'));
    if (color && mode) body.addClass(`theme-${color}-${mode}`);
  }
  const storedThemeColor = localStorage.getItem('rc_theme_color');
  const storedThemeMode = localStorage.getItem('rc_theme_mode');
  if (storedThemeColor && storedThemeMode) applyColorTheme(storedThemeColor, storedThemeMode);
  $('.theme-btn').on('click', function () {
    const color = $(this).data('color');
    const body = $('body');
    const lightClass = `theme-${color}-light`;
    const darkClass = `theme-${color}-dark`;
    let nextMode = 'light';
    if (body.hasClass(lightClass)) nextMode = 'dark';
    else if (body.hasClass(darkClass)) nextMode = 'light';
    applyColorTheme(color, nextMode);
    localStorage.setItem('rc_theme_color', color);
    localStorage.setItem('rc_theme_mode', nextMode);
  });

  const apiOverrideInput = $('#api-override');
  const apiOverrideBtn = $('#save-api');
  const storedApiOverride = localStorage.getItem('rc_api_override');
  if (storedApiOverride) apiOverrideInput.val(storedApiOverride);
  apiOverrideBtn.on('click', function () {
    const url = (apiOverrideInput.val() || '').trim();
    if (url) localStorage.setItem('rc_api_override', url); else localStorage.removeItem('rc_api_override');
    fetchKLove(true);
  });

  // Language switching (i18n)
  const langSelect = $('#lang');
  const storedLang = localStorage.getItem('rc_lang') || 'en';
  langSelect.val(storedLang);

  function applyTranslations(dict) {
    $('[data-i18n]').each(function () {
      const key = $(this).data('i18n');
      const parts = key.split('.');
      let cur = dict;
      for (let p of parts) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p]; else { cur = null; break; }
      }
      if (typeof cur === 'string') {
        $(this).text(cur);
      }
    });
  }

  function loadLang(code) {
    const url = `./data/i18n/${code}.json`;
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error('lang not found'); return r.json(); })
      .then(applyTranslations)
      .catch(() => {});
  }

  loadLang(storedLang);
  langSelect.on('change', function () {
    const code = $(this).val();
    localStorage.setItem('rc_lang', code);
    loadLang(code);
  });

  const lastPlayedEl = $('#last-played');
  const nowImgEl = $('#now-img');
  const nowTitleEl = $('#now-title');
  const nowArtistEl = $('#now-artist');
  function renderLastPlayed(items) {
    lastPlayedEl.empty();
    items.forEach(t => {
      const mediumImg = t.albumImageVariants && t.albumImageVariants.medium;
      const el = $('<div class="last-track">');
      el.append($('<img>').attr({ src: mediumImg || 'https://via.placeholder.com/40?text=Album', alt: `${t.songTitle || 'Unknown'} album art` }));
      el.append($('<div>').append($('<strong>').text(t.songTitle || 'Unknown')).append($('<span>').text(t.artistName || 'Unknown artist')));
      lastPlayedEl.append(el);
    });
  }
  function setNowPlaying(np) {
    const largeImg = np.albumImageVariants && np.albumImageVariants.large;
    nowImgEl.attr('src', largeImg || nowImgEl.attr('src'));
    if (largeImg) nowImgEl.attr('alt', `${np.songTitle || 'Unknown'} album art`);
    nowTitleEl.text(np.songTitle || 'Unknown Title');
    nowArtistEl.text(np.artistName || '');
  }

  // Resilient fetch chain with overrides and local mock
  function fetchKLove() {
    const liveUrl = 'https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291';
    const proxyUrl = '/api/klove';
    const mockUrl = './data/klove-mock.json';
    function getOverride() {
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('api');
        if (q && /^https?:\/\//.test(q)) return q;
        const ls = localStorage.getItem('rc_api_override');
        if (ls && /^https?:\/\//.test(ls)) return ls;
      } catch (e) {}
      return null;
    }
    function applyData(data) {
      if (!data) { nowTitleEl.text('No data'); return; }
      if (data.nowPlaying) setNowPlaying(data.nowPlaying);
      if (Array.isArray(data.lastPlayed) && data.lastPlayed.length > 0) renderLastPlayed(data.lastPlayed.slice(0, 3));
    }
    function safeFetch(url) {
      return fetch(url, { headers: { 'Accept': 'application/json,text/plain' } })
        .then(r => {
          if (!r.ok) throw new Error('Bad status');
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) return r.json();
          return r.text().then(txt => JSON.parse(txt));
        });
    }
    const override = getOverride();
    const chain = [];
    if (override) chain.push(override);
    chain.push(
      proxyUrl,
      liveUrl,
      'https://corsproxy.io/?' + encodeURIComponent(liveUrl),
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(liveUrl),
      'https://cors.isomorphic-git.org/' + liveUrl,
      'https://thingproxy.freeboard.io/fetch/' + liveUrl,
      mockUrl
    );
    (function next(i) {
      if (i >= chain.length) { nowTitleEl.text('Error loading K-Love'); return; }
      safeFetch(chain[i]).then(applyData).catch(() => next(i + 1));
    })(0);
  }

  fetchKLove();
});
