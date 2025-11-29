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

function getImageUrl(track, size = "large") {
  if (track?.albumImageVariants?.[size]) return track.albumImageVariants[size];
  if (track?.artistImageVariants?.[size]) return track.artistImageVariants[size];

  if (track?.albumImageUrl) return track.albumImageUrl;
  if (track?.artistImageUrl) return track.artistImageUrl;
  if (track?.imageUrl) return track.imageUrl;

  return size === "small"
    ? "https://via.placeholder.com/40?text=RR"
    : "https://via.placeholder.com/150?text=Beep+Beep!";
}

async function fetchMusic() {
  const apiUrl = "https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291";
  const proxyUrl = "https://corsproxy.io/?url=" + encodeURIComponent(apiUrl);

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const parsed = await res.json();

    console.log("API response:", parsed);

    const now = parsed?.nowPlaying;
    const last = parsed?.lastPlayed;

    const nowImg = getImageUrl(now, "large");
    document.getElementById("now-img").src = nowImg;
    document.getElementById("now-title").textContent =
      now?.songTitle || "Beep beep, no tunes right now";
    document.getElementById("now-artist").textContent =
      now?.artistName || "Road Runner";

    const lastPlayedContainer = document.getElementById("last-played");
    lastPlayedContainer.innerHTML = "";

    (last || []).slice(0, 5).forEach(track => {
      const img = getImageUrl(track, "small");
      const div = document.createElement("div");
      div.classList.add("last-track");
      div.innerHTML = `
        <img src="${img}" alt="Album Art" style="width:40px;height:40px;margin-right:10px;">
        <div>
          <strong>${track.songTitle || "Unknown Song"}</strong><br>
          <span>${track.artistName || "Unknown Artist"}</span>
        </div>
      `;
      lastPlayedContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Music fetch failed:", err);
  }
}

fetchMusic();
setInterval(fetchMusic, 30000);

});