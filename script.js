'use strict';

// ===== jQuery UI Accordion =====
$(function () {
  $('#tips-accordion').accordion({ heightStyle: 'content', collapsible: true, active: 0 });

  // ===== Slideshow (Slick) =====
  if ($('.carousel').length && typeof $('.carousel').slick === 'function') {
    $('.carousel').slick({
      dots: true,
      arrows: true,
      autoplay: true,
      autoplaySpeed: 3000,
      adaptiveHeight: true,
    });
  }

  // ===== Web Storage: username + theme =====
  const welcomeEl = $('#welcome');
  const usernameInput = $('#username');
  const saveBtn = $('#save-prefs');

  const storedName = localStorage.getItem('rc_username');
  const storedThemeColor = localStorage.getItem('rc_theme_color');
  const storedThemeMode = localStorage.getItem('rc_theme_mode');

  function applyWelcome(name) {
    if (name && name.trim().length > 0) {
      welcomeEl.text(`Welcome back, ${name}!`);
    } else {
      welcomeEl.text('');
    }
  }

  // ===== Color Theme (red/yellow/blue light/dark) =====
  const THEME_COLORS = ['red','yellow','blue'];
  function applyColorTheme(color, mode) {
    const body = $('body');
    // Remove existing theme-* classes
    THEME_COLORS.forEach(function (c) {
      body.removeClass('theme-' + c + '-light').removeClass('theme-' + c + '-dark');
    });
    if (color && mode) {
      body.addClass(`theme-${color}-${mode}`);
    }
  }

  if (storedName) {
    usernameInput.val(storedName);
    applyWelcome(storedName);
  }

  if (storedThemeColor && storedThemeMode) {
    applyColorTheme(storedThemeColor, storedThemeMode);
  }

  saveBtn.on('click', function () {
    const name = (usernameInput.val() || '').trim();
    localStorage.setItem('rc_username', name);
    applyWelcome(name);
  });

  // Button cycle logic: first press => light, second => dark, repeats
  $('.theme-btn').on('click', function () {
    const color = $(this).data('color');
    const body = $('body');
    const lightClass = `theme-${color}-light`;
    const darkClass = `theme-${color}-dark`;
    let nextMode = 'light';
    if (body.hasClass(lightClass)) {
      nextMode = 'dark';
    } else if (body.hasClass(darkClass)) {
      nextMode = 'light';
    }
    applyColorTheme(color, nextMode);
    localStorage.setItem('rc_theme_color', color);
    localStorage.setItem('rc_theme_mode', nextMode);
  });

  // ===== Dynamic API: iTunes Search (3+ items) =====
  // Using K-Love API: nowPlaying + lastPlayed
  const lastPlayedEl = $('#last-played');
  const nowImgEl = $('#now-img');
  const nowTitleEl = $('#now-title');
  const nowArtistEl = $('#now-artist');

  function renderLastPlayed(items) {
    lastPlayedEl.empty();
    items.forEach(function (t) {
      const el = $('<div class="last-track">');
      const mediumImg = t.albumImageVariants && t.albumImageVariants.medium;
      el.append($('<img>').attr({
        src: mediumImg || 'https://via.placeholder.com/40?text=Album',
        alt: `${t.songTitle || 'Unknown'} album art`
      }));
      el.append($('<div>')
        .append($('<strong>').text(t.songTitle || 'Unknown'))
        .append($('<span>').text(t.artistName || 'Unknown artist'))
      );
      lastPlayedEl.append(el);
    });
  }

  function setNowPlaying(np) {
    const largeImg = np.albumImageVariants && np.albumImageVariants.large;
    nowImgEl.attr('src', largeImg || nowImgEl.attr('src'));
    if (largeImg) {
      nowImgEl.attr('alt', `${np.songTitle || 'Unknown'} album art`);
    }
    nowTitleEl.text(np.songTitle || 'Unknown Title');
    nowArtistEl.text(np.artistName || '');
  }

  function fetchKLove() {
    const baseUrl = 'https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291';
    const localProxy = '/api/klove';

    function applyData(data) {
      if (!data) {
        nowTitleEl.text('No data');
        return;
      }
      if (data.nowPlaying) {
        setNowPlaying(data.nowPlaying);
      }
      if (Array.isArray(data.lastPlayed) && data.lastPlayed.length > 0) {
        renderLastPlayed(data.lastPlayed.slice(0, 3));
      }
    }

    // Helper: fetch and parse JSON safely (handles unknown content-type)
    function fetchJson(url) {
      return fetch(url, { headers: { 'Accept': 'application/json,text/plain' } })
        .then(function (r) {
          if (!r.ok) throw new Error('Network not ok');
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) return r.json();
          return r.text().then(function (txt) {
            try { return JSON.parse(txt); } catch (e) { throw e; }
          });
        });
    }

    // Proxy chain: try local same-origin proxy → direct → corsproxy.io → AllOrigins (raw) → isomorphic-git → thingproxy
    const chain = [
      { name: 'local-proxy', url: localProxy, parse: 'auto' },
      { name: 'direct', url: baseUrl, parse: 'json' },
      { name: 'corsproxy', url: 'https://corsproxy.io/?' + encodeURIComponent(baseUrl), parse: 'auto' },
      { name: 'allorigins-raw', url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(baseUrl), parse: 'text-json' },
      { name: 'isomorphic-cors', url: 'https://cors.isomorphic-git.org/' + baseUrl, parse: 'auto' },
      { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' + baseUrl, parse: 'auto' },
    ];

    (function tryNext(i) {
      if (i >= chain.length) {
        nowTitleEl.text('Error loading K-Love');
        return;
      }
      const step = chain[i];
      fetchJson(step.url)
        .then(applyData)
        .catch(function () { tryNext(i + 1); });
    })(0);
  }

  fetchKLove();
});
