$(function () {
  const lastPlayedEl = $('#last-played');
  const nowImgEl = $('#now-img');
  const nowTitleEl = $('#now-title');
  const nowArtistEl = $('#now-artist');

  function renderPrayerTimes(timings) {
    lastPlayedEl.empty();
    const order = [
      ['Fajr', 'Dawn prayer'],
      ['Dhuhr', 'Noon prayer'],
      ['Asr', 'Afternoon prayer'],
      ['Maghrib', 'Sunset prayer'],
      ['Isha', 'Night prayer']
    ];
    order.forEach(([key, label]) => {
      if (!timings[key]) return;
      const el = $('<div class="last-track">');
      el.append(
        $('<img>').attr({
          src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Clock_Face_Flat_Icon_Vector.svg/64px-Clock_Face_Flat_Icon_Vector.svg.png',
          alt: 'Clock icon'
        })
      );
      el.append(
        $('<div>')
          .append($('<strong>').text(label))
          .append($('<span>').text(timings[key]))
      );
      lastPlayedEl.append(el);
    });
  }

  function setNowTiming(dateReadable, city, country, methodName) {
    nowImgEl.attr('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mosque_Cairo.jpg/320px-Mosque_Cairo.jpg');
    nowImgEl.attr('alt', 'City skyline');
    nowTitleEl.text(`${city}, ${country}`);
    nowArtistEl.text(`${dateReadable} • ${methodName}`);
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
        setNowTiming(
          d.date && d.date.readable ? d.date.readable : 'Unknown date',
          'Zagreb',
          'HR',
          d.meta && d.meta.method && d.meta.method.name ? d.meta.method.name : 'Aladhan'
        );
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

  fetchAladhan();
});