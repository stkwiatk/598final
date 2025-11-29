'use strict';

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2 CommonJS

const app = express();
const PORT = process.env.PORT || 3000;

// Allow cross-origin when serving files from elsewhere
app.use(cors({ origin: '*'}));

// Serve static files (opens index.html at the same origin)
app.use(express.static(__dirname));

app.get('/api/klove', async (req, res) => {
  try {
    const url = 'https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291';
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const ct = resp.headers.get('content-type') || '';
    let data;
    if (ct.includes('application/json')) {
      data = await resp.json();
    } else {
      const txt = await resp.text();
      data = JSON.parse(txt);
    }
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy fetch failed', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
