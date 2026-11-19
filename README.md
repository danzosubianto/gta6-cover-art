# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/danzosubianto/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/danzosubianto/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Tide Cover Studio** turns your own photo and a headline into GTA-poster-style cover art: tilted multi-panel layouts with paper gutters, a Vice City sunset or neon colour grade, and bold letter-by-letter caption lettering, exported as a PNG in the common post sizes — 1080 × 1080, 1080 × 1350 and 1920 × 1080. It is a static web app with no build step and no network: open `app/index.html` from any static host and everything runs on your machine; photos are read locally and never uploaded.

What it does:

- **Any photo, every panel.** Load several photos, then either split one photo across all panels (each panel crops its own window on the scene) or give each panel its own photo. Click a panel to select it, drag to reposition its photo, scroll or use the slider to zoom.
- **Four panel layouts** — Poster Grid, Hero & Strips, Triptych and Full Bleed with inset panels — drawn as skewed polygons with poster-paper gutters.
- **Four colour grades** (Sunset Boulevard, Neon Nights, Golden Hour, Clean Press) with a strength slider: a filter pass, a three-stop colour wash and a vignette, applied once per photo and cached.
- **Lettering drawn in code** — tracked, slightly tilted headline letters with a hard shadow, a thick outline and a gradient fill, in three styles (Sunset Chrome, Neon Pop, Newsprint Bold), plus a letterspaced strapline on a dark band. No font files and nothing of Rockstar's: the design, the name and the artwork are this app's own.
- **Built-in demo scenes** (a sunset boulevard, a neon pier, a palm beach) painted procedurally in `app/src/demo.js`, so the studio opens on living cover art before you upload a thing.
- **One-click export** at the chosen artboard size, rendered by the same `renderCover` that paints the live preview.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 — or serve `app/` with any static file server. To hand the entry in the way the bounty asks (copies `app/` and `screenshots/` out and writes `dossier.json` with the vendored make.fun library):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are reproducible scenes: `shots.json` lists each shot's query string (`?shot=cover` shows the artwork alone, `?shot=editor` the studio at work), and `window.__shotReady` is set once a shot scene has painted.

---

<sub>Entered on [make.fun](https://make.fun/?ref=tv86zvxh&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
