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

  function fetchAladhan() {
    const url = 'https://api.aladhan.com/v1/timingsByCity/22-03-2025?city=Zagreb&country=HR&method=2&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=0&timezonestring=America%2FPhoenix&calendarMethod=DIYANET';
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (!json || json.code !== 200 || !json.data) {
          nowTitleEl.text('No data');
          return;
        }
        const d = json.data;
        const methodName = d.meta && d.meta.method && d.meta.method.name ? d.meta.method.name : 'Aladhan';
        setNowTiming(methodName);
        if (d.timings) renderPrayerTimes(d.timings);
      })
      .catch(() => {
        nowTitleEl.text('Error loading times');
      });
  }

  $('#tips-accordion').accordion({
    collapsible: true,
    heightStyle: 'content',
    active: 0
  });

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

  // Theme color buttons (red / yellow / blue) toggle light theme variants
  $('.theme-btn').on('click', function () {
    const color = $(this).data('color');
    bodyEl.removeClass(function (idx, cls) {
      return (cls || '').split(' ').filter(c => c.startsWith('theme-')).join(' ');
    });
    const cls = `theme-${color}-light`;
    bodyEl.addClass(cls);
    try { localStorage.setItem(storageKeyTheme, cls); } catch (e) { /* ignore */ }
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

  fetchAladhan();
});