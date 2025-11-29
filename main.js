$(function () {
  const lastPlayedEl = $('#last-played');
  const nowImgEl = $('#now-img');
  const nowTitleEl = $('#now-title');
  const nowArtistEl = $('#now-artist');
  const bodyEl = $('body');
  const storageKeyLang = 'leisure_lang';
  const storageKeyTheme = 'leisure_theme';

  function renderPrayerTimes(timings) {
    lastPlayedEl.empty();
    const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    order.forEach((key) => {
      if (!timings[key]) return;
      const el = $('<div class="last-track">');
      el.append(
        $('<img>').attr({
          src: 'https://jesusprayerministry.com/wp-content/uploads/2023/12/Importance-of-Fajr-Prayer.jpg',
          alt: 'Clock icon'
        })
      );
      el.append(
        $('<div>')
          .append($('<strong>').text(key))
          .append($('<span>').text(timings[key]))
      );
      lastPlayedEl.append(el);
    });
  }

  function setNowTiming(methodName) {
    nowImgEl.attr('src', 'https://www.visboo.com/wp-content/uploads/2019/12/Sheikh-Zayed-Grand-Mosque.jpg');
    nowImgEl.attr('alt', 'Prayer illustration');
    nowTitleEl.text('Daily Prayer Schedule');
    nowArtistEl.text(methodName);
  }

  // Attempt K-LOVE Now Playing API
  function fetchKLoveNowPlaying() {
    const url = 'https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291';
    nowTitleEl.text('Loading…');
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Network');
        return r.json();
      })
      .then(data => {
        const current = data.current || data.nowPlaying || data.song || data.currentSong || {};
        const title = current.title || current.songTitle || current.name || 'Unknown Title';
        const artist = current.artist || current.artistName || (current.artists && current.artists[0]) || 'Unknown Artist';

        function getVariantUrl(v, desired) {
          if (!v) return '';
          const desiredLower = desired.toLowerCase();
          // Object with direct keys (small/medium/large)
          if (!Array.isArray(v) && typeof v === 'object') {
            for (const k of Object.keys(v)) {
              if (k.toLowerCase() === desiredLower) {
                const val = v[k];
                if (typeof val === 'string') return val;
                if (val && typeof val === 'object') return val.url || val.imageUrl || val.src || '';
              }
            }
          }
          // Array of variant objects
          if (Array.isArray(v)) {
            const desiredUpper = desired.toUpperCase();
            const obj = v.find(o => {
              const sizeKey = (o.size || o.variant || o.name || '').toString().toUpperCase();
              return sizeKey === desiredUpper;
            });
            if (obj) return obj.url || obj.imageUrl || obj.src || '';
          }
          return '';
        }

        const variants = current.albumImageVariants || current.coverArtVariants || current.albumVariants || null;
        const img = getVariantUrl(variants, 'large') || current.imageUrl || current.image || current.artwork || current.albumArtUrl || '';

        if (img) {
          nowImgEl.attr('src', img);
          nowImgEl.attr('alt', `${title} cover`);
        }
        nowTitleEl.text(title);
        nowArtistEl.text(artist);

        const prev = data.previous || data.previousSongs || data.history || [];
        lastPlayedEl.empty();
        if (Array.isArray(prev) && prev.length) {
          prev.slice(0, 10).forEach(item => {
            const pTitle = item.title || item.songTitle || item.name || 'Unknown Title';
            const pArtist = item.artist || item.artistName || (item.artists && item.artists[0]) || '';
            const pVariants = item.albumImageVariants || item.coverArtVariants || item.albumVariants || null;
            const pImg = getVariantUrl(pVariants, 'medium') || item.imageUrl || item.image || item.artwork || item.albumArtUrl || '';
            const el = $('<div class="last-track">');
            el.append($('<img>').attr({ src: pImg || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vinyl_record.jpg/240px-Vinyl_record.jpg', alt: 'Album art' }));
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
        nowTitleEl.text('Error loading K-LOVE');
        nowArtistEl.text('');
        console.warn('K-LOVE fetch failed:', err);
      });
  }

  $('#tips-accordion').accordion({
    collapsible: true,
    heightStyle: 'content',
    active: 0
  });

  function initCarousel() {
    if (!$.fn || !$.fn.slick) {
      // Try again shortly if Slick isn't available yet
      setTimeout(initCarousel, 50);
      return;
    }
    if ($('.carousel').hasClass('slick-initialized')) return;
    $('.carousel').slick({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      adaptiveHeight: true,
      autoplay: true,
      autoplaySpeed: 4000,
      arrows: true
    });
  }
  initCarousel();

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
      'music.now': "Today's Prayer Times",
      'music.last': 'All Prayer Times',
      'gallery.title': 'Employee Whereabouts',
      'nav.tips': 'Tips',
      'nav.blog': 'Blog',
      'nav.music': 'Prayer Times',
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
      'music.now': 'Horarios de oración de hoy',
      'music.last': 'Todos los horarios de oración',
      'gallery.title': 'Dónde está el equipo',
      'nav.tips': 'Consejos',
      'nav.blog': 'Blog',
      'nav.music': 'Oración',
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
      'music.now': 'Današnji namaz',
      'music.last': 'Sva vremena namaza',
      'gallery.title': 'Gdje su zaposlenici',
      'nav.tips': 'Savjeti',
      'nav.blog': 'Blog',
      'nav.music': 'Namaz',
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
      'music.now': '本日の礼拝時間',
      'music.last': 'すべての礼拝時間',
      'gallery.title': 'メンバーの所在',
      'nav.tips': 'ヒント',
      'nav.blog': 'ブログ',
      'nav.music': '礼拝時間',
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
    const url = 'http://api.alquran.cloud/v1/surah/113';
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
        lastPlayedEl.append(block);
      })
      .catch(() => {
        // Silent failure: keep UI tidy
      });
  }
  fetchAlQuranSurah();
});