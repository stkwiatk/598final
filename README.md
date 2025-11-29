# Roadie's Corner - Dev Notes

## Run the local proxy and site

This starts a small Express server that:
- Serves the static site (index.html, assets) at `http://localhost:3000/`
- Exposes a same-origin endpoint `GET /api/klove` that fetches K-Love now playing JSON.

### Prereqs
- Node.js 16+ (recommended 18+)

### Steps
```zsh
cd /Users/sammiebeeper/Documents/GitHub/598final
npm install
npm start
open http://localhost:3000/index.html
```

The frontend will call `/api/klove` first, and if unavailable, it will fall back to public CORS proxies.

## Troubleshooting
- If images/titles stay on "Loading…": check server logs and network tab.
- K-Love API may intermittently block proxies; the local `/api/klove` route is most reliable.
- To run without the proxy, you can still open `index.html` directly; the code will attempt proxy fallbacks automatically.
