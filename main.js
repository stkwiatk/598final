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

  // Removed API override UI for GitHub Pages simplicity

  // Language switching (inline dictionaries to avoid fetch issues on GitHub Pages)
  const langSelect = $('#lang');
  const I18N = {
    en: { brand:{title:'Leisure Co.',tagline:'Company leisure page: music, reminders, and whereabouts.'}, nav:{tips:'Tips',blog:'Blog',music:'Music',gallery:'Gallery'}, lang:{label:'Language:'}, reminders:{ title:'Team Reminders', diligence:{title:'Work Diligently',text:'Do your work very diligently. Focus on quality over speed and communicate blockers early.'}, deadlines:{title:'Respect Deadlines',text:'Plan ahead, break tasks into milestones, and keep stakeholders informed to meet delivery dates.'}, wellness:{title:'Wellness & Balance',text:'Take regular breaks, hydrate, and maintain a healthy work-life balance for sustained productivity.'}}, blog:{ title:'Company Notes', weekly:{title:'Weekly Focus',text:'Prioritize high-impact tasks, collaborate proactively, and share progress updates during standup.'}, culture:{title:'Team Culture',text:'Support peers and maintain a friendly, constructive environment.'}}, music:{now:'Now Playing',last:'Last Played'}, gallery:{title:'Employee Whereabouts'}, api:{label:'API URL:',button:'Use API'} },
    es: { brand:{title:'Leisure Co.',tagline:'Página de ocio de la empresa: música, recordatorios y paraderos.'}, nav:{tips:'Consejos',blog:'Blog',music:'Música',gallery:'Galería'}, lang:{label:'Idioma:'}, reminders:{ title:'Recordatorios del equipo', diligence:{title:'Trabaja con diligencia',text:'Haz tu trabajo con mucha diligencia. Prioriza la calidad sobre la velocidad y comunica bloqueos pronto.'}, deadlines:{title:'Respeta los plazos',text:'Planifica con antelación, divide tareas en hitos e informa a las partes interesadas para cumplir fechas.'}, wellness:{title:'Bienestar y equilibrio',text:'Toma descansos regulares, hidrátate y mantén un equilibrio saludable entre trabajo y vida.'}}, blog:{ title:'Notas de la empresa', weekly:{title:'Enfoque semanal',text:'Prioriza tareas de alto impacto, colabora proactivamente y comparte avances en el standup.'}, culture:{title:'Cultura de equipo',text:'Apoya a tus compañeros y mantén un entorno amigable y constructivo.'}}, music:{now:'Reproduciendo ahora',last:'Últimas reproducidas'}, gallery:{title:'Paraderos de empleados'}, api:{label:'URL de la API:',button:'Usar API'} },
    hr: { brand:{title:'Leisure Co.',tagline:'Stranica za slobodno vrijeme: glazba, podsjetnici i lokacije.'}, nav:{tips:'Savjeti',blog:'Blog',music:'Glazba',gallery:'Galerija'}, lang:{label:'Jezik:'}, reminders:{ title:'Tim podsjetnici', diligence:{title:'Radite marljivo',text:'Radite vrlo marljivo. Dajte prednost kvaliteti nad brzinom i rano komunicirajte blokade.'}, deadlines:{title:'Poštujte rokove',text:'Planirajte unaprijed, podijelite zadatke na prekretnice i obavještavajte dionike kako biste ispunili rokove.'}, wellness:{title:'Zdravlje i ravnoteža',text:'Uzimajte redovite pauze, hidrirajte se i održavajte zdravu ravnotežu između posla i života.'}}, blog:{ title:'Bilješke tvrtke', weekly:{title:'Tjedni fokus',text:'Prioritet dajte zadacima velikog utjecaja, surađujte proaktivno i dijelite napredak na dnevnim sastancima.'}, culture:{title:'Tim kultura',text:'Podržavajte kolege i održavajte prijateljsko, konstruktivno okruženje.'}}, music:{now:'Sada svira',last:'Zadnje reproducirano'}, gallery:{title:'Lokacije zaposlenika'}, api:{label:'API URL:',button:'Koristi API'} },
    ja: { brand:{title:'Leisure Co.',tagline:'会社のレジャーページ：音楽、リマインダー、所在情報。'}, nav:{tips:'ヒント',blog:'ブログ',music:'音楽',gallery:'ギャラリー'}, lang:{label:'言語:'}, reminders:{ title:'チームのリマインダー', diligence:{title:'勤勉に働く',text:'非常に勤勉に仕事をしましょう。速度より品質を重視し、課題は早めに共有します。'}, deadlines:{title:'締め切りを守る',text:'事前に計画し、タスクをマイルストーンに分割し、関係者に情報共有して締め切りを守ります。'}, wellness:{title:'健康とバランス',text:'定期的に休憩を取り、水分補給をし、健全なワークライフバランスを保ちましょう。'}}, blog:{ title:'会社ノート', weekly:{title:'今週の注力',text:'影響の大きいタスクを優先し、積極的に協力し、スタンドアップで進捗を共有します。'}, culture:{title:'チーム文化',text:'仲間を支援し、友好的で建設的な環境を維持します。'}}, music:{now:'再生中',last:'最近再生'}, gallery:{title:'従業員の所在'}, api:{label:'API URL:',button:'APIを使用'} }
  };
  function applyTranslations(dict) {
    $('[data-i18n]').each(function () {
      const key = $(this).data('i18n');
      const parts = key.split('.');
      let cur = dict;
      for (let p of parts) { if (cur && typeof cur === 'object' && p in cur) cur = cur[p]; else { cur = null; break; } }
      if (typeof cur === 'string') $(this).text(cur);
    });
  }
  const storedLang = localStorage.getItem('rc_lang') || 'en';
  langSelect.val(storedLang);
  applyTranslations(I18N[storedLang] || I18N.en);
  langSelect.on('change', function () {
    const code = $(this).val();
    localStorage.setItem('rc_lang', code);
    applyTranslations(I18N[code] || I18N.en);
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
    // Prefer mock on GitHub Pages to ensure content loads
    chain.push(mockUrl);
    if (override) chain.push(override);
    chain.push(
      proxyUrl,
      liveUrl,
      'https://corsproxy.io/?' + encodeURIComponent(liveUrl),
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(liveUrl),
      'https://cors.isomorphic-git.org/' + liveUrl,
      'https://thingproxy.freeboard.io/fetch/' + liveUrl,
      // mock already first
    );
    (function next(i) {
      if (i >= chain.length) { nowTitleEl.text('Error loading K-Love'); return; }
      safeFetch(chain[i]).then(applyData).catch(() => next(i + 1));
    })(0);
  }

  fetchKLove();
});
