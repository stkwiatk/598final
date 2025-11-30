$(function () {
  const lastPlayedEl = $('#last-played');
  const nowImgEl = $('#now-img');
  const nowTitleEl = $('#now-title');
  const nowArtistEl = $('#now-artist');
  const bodyEl = $('body');
  const storageKeyLang = 'leisure_lang';
  const storageKeyTheme = 'leisure_theme';

  // Fetch K-LOVE via CORS proxy so GitHub Pages can reach it
  function fetchKLoveNowPlaying() {
    const directUrl = 'https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291';
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(directUrl);
    nowTitleEl.text('Loading…');

    function fetchVia(url) {
      return fetch(url).then(r => {
        if (!r.ok) throw new Error('Network');
        return r.json();
      });
    }

    fetchVia(proxyUrl)
      .then(data => {
        const current = data.nowPlaying || {};
        const title = current.songTitle || 'Unknown Title';
        const artist = current.artistName || 'Unknown Artist';

        const albumVariants = current.albumImageVariants || {};
        const albumLarge = albumVariants.large || current.albumImageUrl || '';
        const albumAlt = current.albumImageAltText || `${title} — ${artist}`;

        console.log('[K-LOVE] NowPlaying image URL:', albumLarge, 'alt:', albumAlt);
        if (albumLarge) {
          nowImgEl.attr({ src: albumLarge, alt: albumAlt });
        } else {
          nowImgEl.attr({
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vinyl_record.jpg/240px-Vinyl_record.jpg',
            alt: albumAlt
          });
        }
        nowTitleEl.text(title);
        nowArtistEl.text(artist);

        const prev = Array.isArray(data.lastPlayed) ? data.lastPlayed : [];
        lastPlayedEl.empty();
        if (prev.length) {
          prev.slice(0, 4).forEach(item => {
            const pTitle = item.songTitle || 'Unknown Title';
            const pArtist = item.artistName || '';
            const pVariants = item.albumImageVariants || {};
            const primary = pVariants.medium || pVariants.large || pVariants.small || item.albumImageUrl || '';
            const pAlt = item.albumImageAltText || `${pTitle} — ${pArtist}`;

            console.log('[K-LOVE] LastPlayed image URL:', primary, 'alt:', pAlt);
            const $img = $('<img>').attr({ src: primary || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vinyl_record.jpg/240px-Vinyl_record.jpg', alt: pAlt });

            const el = $('<div class="last-track">');
            el.append($img);
            el.append(
              $('<div>')
                .append($('<strong>').text(pTitle))
                .append($('<span>').text(pArtist))
            );
            lastPlayedEl.append(el);
          });
        } else {
          lastPlayedEl.append($('<div class="last-track">').append($('<span>').text('No recent songs')));
        }
      })
      .catch(err => {
        console.warn('K-LOVE proxy fetch failed, trying direct:', err);
        return fetchVia(directUrl)
          .then(data => {
            const current = data.nowPlaying || {};
            const title = current.songTitle || 'Unknown Title';
            const artist = current.artistName || 'Unknown Artist';

            const albumVariants = current.albumImageVariants || {};
            const albumLarge = albumVariants.large || current.albumImageUrl || '';
            const albumAlt = current.albumImageAltText || `${title} — ${artist}`;

            if (albumLarge) {
              nowImgEl.attr({ src: albumLarge, alt: albumAlt });
            }
            nowTitleEl.text(title);
            nowArtistEl.text(artist);

            const prev = Array.isArray(data.lastPlayed) ? data.lastPlayed : [];
            lastPlayedEl.empty();
            if (prev.length) {
              prev.slice(0, 4).forEach(item => {
                const pTitle = item.songTitle || 'Unknown Title';
                const pArtist = item.artistName || '';
                const pVariants = item.albumImageVariants || {};
                const primary = pVariants.medium || pVariants.large || pVariants.small || item.albumImageUrl || '';
                const pAlt = item.albumImageAltText || `${pTitle} — ${pArtist}`;

                const $img = $('<img>').attr({ src: primary, alt: pAlt });
                $img.on('error', function () {
                  const tried = $(this).data('tried') || 0;
                  if (tried > 1) {
                    $(this)
                      .off('error')
                      .attr('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vinyl_record.jpg/240px-Vinyl_record.jpg');
                    return;
                  }
                  $(this).data('tried', tried + 1);
                  const fallback = pVariants.large || pVariants.small || item.albumImageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vinyl_record.jpg/240px-Vinyl_record.jpg';
                  $(this).attr('src', fallback);
                });

                const el = $('<div class="last-track">');
                el.append($img);
                el.append(
                  $('<div>')
                    .append($('<strong>').text(pTitle))
                    .append($('<span>').text(pArtist))
                );
                lastPlayedEl.append(el);
              });
            } else {
              lastPlayedEl.append($('<div class="last-track">').append($('<span>').text('No recent songs')));
            }
          })
          .catch(finalErr => {
            nowTitleEl.text('Error loading K-LOVE');
            nowArtistEl.text('');
            console.warn('K-LOVE fetch failed (proxy and direct):', finalErr);
          });
      });
  }

  $('#tips-accordion').accordion({
    collapsible: true,
    heightStyle: 'content',
    active: 0
  });

  function initCarousel() {
    if (!$.fn || !$.fn.slick) return; // will be called again by loader once available
    const $car = $('.carousel');
    if ($car.hasClass('slick-initialized')) return;
    try {
      $car.slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        adaptiveHeight: true,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true
      });
      console.log('[Carousel] Slick initialized');
    } catch (e) {
      console.warn('[Carousel] Slick init error, will retry', e);
      setTimeout(initCarousel, 200);
    }
  }
  // Defer first attempt slightly so fallback loader can engage if needed
  setTimeout(initCarousel, 100);

  // Theme color buttons (red / yellow / blue) toggle light/dark for that color
  $('.theme-btn').on('click', function () {
    const color = $(this).data('color');
    const classes = (bodyEl.attr('class') || '').split(/\s+/);
    const currentThemeClass = classes.find(c => c.startsWith('theme-')) || '';
    const isSameColor =
      currentThemeClass.startsWith(`theme-${color}-`);
    const isLight = currentThemeClass.endsWith('-light');
    const nextClass = isSameColor
      ? `theme-${color}-${isLight ? 'dark' : 'light'}`
      : `theme-${color}-light`;

    bodyEl.removeClass(function (idx, cls) {
      return (cls || '').split(' ').filter(c => c.startsWith('theme-')).join(' ');
    });
    bodyEl.addClass(nextClass);
    try { localStorage.setItem(storageKeyTheme, nextClass); } catch (e) { /* ignore */ }
  });

  // Simple i18n dictionary for visible text
  const messages = {
    en: {
      'brand.title': 'Leisure Co.',
      'brand.tagline': 'Company leisure page: prayer times, reminders, and whereabouts.',
      'reminders.title': 'Team Reminders',
      'reminders.diligence.title': 'Work Diligently',
      'reminders.diligence.text': 'Do your work very diligently. Focus on quality over speed and communicate blockers early.',
      'reminders.deadlines.title': 'Respect Deadlines',
      'reminders.deadlines.text': 'Plan ahead, break tasks into milestones, and keep stakeholders informed to meet delivery dates.',
      'reminders.wellness.title': 'Wellness & Balance',
      'reminders.wellness.text': 'Take regular breaks, hydrate, and maintain a healthy work-life balance for sustained productivity.',
      'blog.title': 'Company Notes',
      'blog.weekly.title': 'Weekly Focus',
      'blog.weekly.text': 'Prioritize high-impact tasks, collaborate proactively, and share progress updates during standup.',
      'blog.culture.title': 'Team Culture',
      'blog.culture.text': 'Support peers and maintain a friendly, constructive environment.',
      'music.now': 'Now Playing',
      'music.last': 'Recent Songs',
      'quran.title': 'Quran — Surah 113',
      'gallery.title': 'Employee Whereabouts',
      'nav.tips': 'Tips',
      'nav.blog': 'Blog',
      'nav.music': 'Music',
      'nav.gallery': 'Gallery',
      'lang.label': 'Language:'
    },
    es: {
      'brand.title': 'Leisure Co.',
      'brand.tagline': 'Página de ocio de la empresa: horarios de oración, recordatorios y paraderos.',
      'reminders.title': 'Recordatorios del equipo',
      'reminders.diligence.title': 'Trabaja diligentemente',
      'reminders.diligence.text': 'Realiza tu trabajo con mucha diligencia. Prioriza la calidad sobre la velocidad y comunica los bloqueos pronto.',
      'reminders.deadlines.title': 'Respeta los plazos',
      'reminders.deadlines.text': 'Planifica con anticipación, divide las tareas en hitos e informa a las partes interesadas.',
      'reminders.wellness.title': 'Bienestar y equilibrio',
      'reminders.wellness.text': 'Toma descansos, hidrátate y cuida tu equilibrio entre trabajo y vida personal.',
      'blog.title': 'Notas de la empresa',
      'blog.weekly.title': 'Enfoque semanal',
      'blog.weekly.text': 'Prioriza tareas de alto impacto y comparte avances en el daily.',
      'blog.culture.title': 'Cultura de equipo',
      'blog.culture.text': 'Apoya a tus compañeros y mantén un ambiente constructivo.',
      'music.now': 'Reproduciendo ahora',
      'music.last': 'Canciones recientes',
      'quran.title': 'Corán — Sura 113',
      'gallery.title': 'Dónde está el equipo',
      'nav.tips': 'Consejos',
      'nav.blog': 'Blog',
      'nav.music': 'Música',
      'nav.gallery': 'Galería',
      'lang.label': 'Idioma:'
    },
    hr: {
      'brand.title': 'Leisure Co.',
      'brand.tagline': 'Stranica za odmor tvrtke: vremena molitve, podsjetnici i gdje smo.',
      'reminders.title': 'Tim podsjetnici',
      'reminders.diligence.title': 'Radi marljivo',
      'reminders.diligence.text': 'Radi savjesno, usredotoči se na kvalitetu i rano prijavi prepreke.',
      'reminders.deadlines.title': 'Poštuj rokove',
      'reminders.deadlines.text': 'Planiraj unaprijed, razbij zadatke u manje cjeline i obavijesti dionike.',
      'reminders.wellness.title': 'Dobrobit i ravnoteža',
      'reminders.wellness.text': 'Redovito uzimaj pauze, pij vodu i čuvaj ravnotežu posao-život.',
      'blog.title': 'Bilješke tvrtke',
      'blog.weekly.title': 'Tjedni fokus',
      'blog.weekly.text': 'Daj prednost zadacima s velikim utjecajem i surađuj s timom.',
      'blog.culture.title': 'Kultura tima',
      'blog.culture.text': 'Podržavaj kolege i njeguj prijateljsko okruženje.',
      'music.now': 'Sada svira',
      'music.last': 'Nedavne pjesme',
      'quran.title': 'Kuran — sura 113',
      'gallery.title': 'Gdje su zaposlenici',
      'nav.tips': 'Savjeti',
      'nav.blog': 'Blog',
      'nav.music': 'Glazba',
      'nav.gallery': 'Galerija',
      'lang.label': 'Jezik:'
    },
    ja: {
      'brand.title': 'Leisure Co.',
      'brand.tagline': '会社レジャーページ：礼拝時間、リマインダー、居場所。',
      'reminders.title': 'チームのリマインダー',
      'reminders.diligence.title': 'ていねいに仕事する',
      'reminders.diligence.text': 'スピードより品質を大切にし、課題は早めに共有しましょう。',
      'reminders.deadlines.title': '締め切りを守る',
      'reminders.deadlines.text': '前もって計画し、タスクを小さく分け、関係者に状況を伝えます。',
      'reminders.wellness.title': 'ウェルネスとバランス',
      'reminders.wellness.text': 'こまめに休憩を取り、水分補給し、ワークライフバランスを保ちましょう。',
      'blog.title': '会社ノート',
      'blog.weekly.title': '今週のフォーカス',
      'blog.weekly.text': 'インパクトの大きい仕事を優先し、こまめに進捗を共有します。',
      'blog.culture.title': 'チーム文化',
      'blog.culture.text': '仲間を助け合い、前向きな雰囲気を保ちます。',
      'music.now': '再生中',
      'music.last': '最近の曲',
      'quran.title': 'コーラン — 第113章',
      'gallery.title': 'メンバーの所在',
      'nav.tips': 'ヒント',
      'nav.blog': 'ブログ',
      'nav.music': 'ミュージック',
      'nav.gallery': 'ギャラリー',
      'lang.label': '言語：'
    }
  };

  function applyLanguage(lang) {
    const dict = messages[lang] || messages.en;
    $('[data-i18n]').each(function () {
      const key = $(this).data('i18n');
      if (dict[key]) {
        $(this).text(dict[key]);
      }
    });
  }

  $('#lang').on('change', function () {
    const lang = $(this).val();
    try { localStorage.setItem(storageKeyLang, lang); } catch (e) { /* ignore */ }
    applyLanguage(lang);
  });

  // Initialize default language
  // Apply saved language (if any) and saved theme (if any)
  try {
    const savedLang = localStorage.getItem(storageKeyLang);
    if (savedLang) $('#lang').val(savedLang);
  } catch (e) { /* ignore */ }

  try {
    const savedTheme = localStorage.getItem(storageKeyTheme);
    if (savedTheme) bodyEl.addClass(savedTheme);
  } catch (e) { /* ignore */ }

  applyLanguage($('#lang').val() || 'en');

  fetchKLoveNowPlaying();

  // Also fetch AlQuran Surah 113 (Al-Falaq) and render a short excerpt
  function fetchAlQuranSurah() {
    const url = 'https://api.alquran.cloud/v1/surah/113';
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (!json || json.status !== 'OK' || !json.data) return;
        const surah = json.data;
        const title = (surah.englishName || surah.name || 'Surah 113') + ' — ' + (surah.englishNameTranslation || '');
        const verses = Array.isArray(surah.ayahs) ? surah.ayahs.slice(0, 5) : [];

        const block = $('<div class="last-track">');
        block.append($('<img>').attr({
          src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Quran_Koran.svg',
          alt: 'Quran'
        }));
        const textWrap = $('<div>');
        textWrap.append($('<strong>').text(title.trim()));
        if (verses.length) {
          const snippet = verses.map(v => v.text).join(' ');
          textWrap.append($('<span>').text(snippet));
        }
        block.append(textWrap);
        const quranContainer = $('#quran .quran-content');
        if (quranContainer.length) {
          quranContainer.empty().append(block);
        } else {
          // Fallback to lastPlayed if quran section is missing
          lastPlayedEl.append(block);
        }
      })
      .catch(() => {
        // Silent failure: keep UI tidy
      });
  }
  fetchAlQuranSurah();

  // Slick fallback loader if primary failed (e.g., blocked CDN)
  (function ensureSlick(attempt){
    attempt = attempt || 0;
    if ($.fn && $.fn.slick) return; // already loaded
    if (attempt > 40) { console.warn('Slick not available after retries.'); return; }
    if (attempt === 10) { // load alternate CDN after 10 failed attempts (~500ms)
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js';
      s.onload = function(){ console.log('[Slick] Fallback loaded'); initCarousel(); };
      document.head.appendChild(s);
    }
    setTimeout(function(){ ensureSlick(attempt+1); }, 50);
  })();

  // Enhance K-LOVE fetch with retry + clearer status + auto-refresh every minute
  (function enhanceKLove(){
    let attempts = 0;
    const maxAttempts = 3;

    function scheduleRefresh() {
      // Auto-refresh every 60 seconds
      setTimeout(function() {
        attempts = 0; // reset attempts for the new cycle
        run();
      }, 60000);
    }

    function run(){
      attempts++;
      fetchKLoveNowPlaying();
      // If still showing Loading after 4s, retry (possible CORS stall)
      setTimeout(function(){
        if (nowTitleEl.text().trim().match(/^Loading/i) && attempts < maxAttempts){
          console.warn('Retrying K-LOVE fetch attempt', attempts+1);
          run();
        } else if (nowTitleEl.text().trim().match(/^Loading/i)) {
          nowTitleEl.text('K-LOVE unavailable (CORS?)');
          scheduleRefresh();
        } else {
          // Successful load (or at least not stuck on Loading) – schedule next refresh
          scheduleRefresh();
        }
      }, 4000);
    }

    run();
  })();

  // Image onerror fallback for current track
    nowImgEl.on('error', function(){
      const src = $(this).attr('src');
      console.warn('[K-LOVE] NowPlaying image failed to load:', src);
    });

  // remove enhanced wrapper, basic fetch already called above

  // --- Surah retry & error message ---
  function fetchAlQuranSurahRetry(attempt){
    attempt = attempt || 0;
    const max = 2;
    const url = 'https://api.alquran.cloud/v1/surah/113';
    return fetch(url)
      .then(r => r.json())
      .then(json => {
        if (!json || json.status !== 'OK' || !json.data) throw new Error('Unexpected response');
        const surah = json.data;
        const title = (surah.englishName || surah.name || 'Surah 113') + ' — ' + (surah.englishNameTranslation || '');
        const verses = Array.isArray(surah.ayahs) ? surah.ayahs.slice(0,5) : [];
        const block = $('<div class="last-track">');
        block.append($('<img>').attr({ src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Quran_Koran.svg', alt: 'Quran' }));
        const textWrap = $('<div>');
        textWrap.append($('<strong>').text(title.trim()));
        if (verses.length) {
          const snippet = verses.map(v => v.text).join(' ');
          textWrap.append($('<span>').text(snippet));
        }
        block.append(textWrap);
        $('#quran .quran-content').empty().append(block);
      })
      .catch(err => {
        console.warn('[Quran] Fetch failed attempt', attempt+1, err);
        if (attempt < max) return fetchAlQuranSurahRetry(attempt+1);
        $('#quran .quran-content').html('<div class="error">Surah unavailable</div>');
      });
  }
  fetchAlQuranSurahRetry();
});