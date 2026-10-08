# Verification — 8 October 2026

- Production build and strict TypeScript checking: passed (`npm run build`).
- Unit checks: 8 passed (`npm test`): paused score/movement, diagonal normalization, difficulty limits, stamina drain/lock/recovery, obstacle cooldown, capture/reset, pursuit around an obstacle, near-miss encounter accounting.
- Chromium via Playwright: passed (`node tests/browser.mjs`, with dev on port 5173 and production preview on port 4173). Uses installed `/usr/bin/chromium`.
- Browser flow: started, keyboard movement and sprint/stamina drain, pause freezes score, deliberate resume, controlled player/referee encounters, controlled steward capture, stored best, three consecutive resets, portrait pause and landscape resume.
- Mobile input: Chromium CDP dispatched real simultaneous touch contacts to joystick and sprint; movement and sprint states both active, then touch cancellation cleared both. Tested landscape viewport 844×390 and portrait 390×844.
- Production offline: waited for precache readiness, reloaded under service worker control, switched context offline, reloaded successfully, rendered canvas and started play.
- Browser checks completed without uncaught page errors. Menu screenshot inspected for visual layout.

## Limits

Physical iPhone/Android devices, Safari, native OS installation and long-session phone performance were not tested here. Browser encounters are deliberately positioned for repeatability; the unit test verifies pursuit and obstacle clearance, but this is not a full long-run AI playtest. The production Phaser bundle is about 1.23 MB uncompressed (339 KB gzip); Vite reports its expected large-chunk advisory. Ambience is omitted; short generated collision, whistle, near-miss and capture sounds are included. PWA installation/offline needs HTTPS, except on localhost.

Current upstream references consulted before implementation: Phaser Scale Manager documentation (https://docs.phaser.io/phaser/concepts/scale-manager), Phaser scenes documentation (https://docs.phaser.io/phaser/concepts/scenes), and Vite PWA prompt registration/Workbox configuration (https://github.com/vite-pwa/vite-plugin-pwa).

## Multilingual implementation — 8 October 2026

- Added UK English, Portugal Portuguese, Spain Spanish, French and Italian; browser language detection, saved choice, translated accessibility labels, pluralised results and locale-aware scores.
- `npm test`: 12 tests passed, including dictionary/placeholder completeness, locale selection, formatting, pluralisation and optional storage.
- `npm run build`: passed TypeScript and production/PWA generation. Existing Phaser bundle size advisory remains.
- Chromium browser checks passed for all five locales: detection, persistence after reload, translated start/pause/results/install messages, preservation of paused simulation state, restricted storage, mobile card width and production offline language switching. Screenshots inspected at 844×390.
- Existing gameplay browser suite passed: keyboard/sprint, pause, collisions, capture, retries, orientation, independent touch cancellation and offline reload.
- Physical device and Safari validation remain outstanding. Translation wording has not had an independent native-speaker review.

## Stadium audio, ball play and mobile layout — 8 October 2026

- Added synthesised crowd ambience and escalating percussion, distinct player impacts, referee whistle, kicks, steward arrival chirps and crowd cheers. Audio is interaction-unlocked, optional and stopped during pauses/backgrounding. Muting stops current effects and ambience.
- Ball contact kicks follow movement direction, with stronger sprint kicks, friction and boundary rebounds. Swept collision knocks stewards down for three simulation seconds, with orbiting stars, capture immunity and a short standing recovery. One hit per steward per kick.
- Arena fills the viewport; compact HUD overlays the crowd and controls follow the actual visible pitch bounds. The whole field remains visible. Short landscape menus use two columns and instructions open in a separate Help panel.
- `npm test`: 18 tests passed, including kick strength, rest/contact rules, friction/rebound/reset, swept hits, pause-safe knockdown duration, recovery/capture rules, per-kick hit limits, arrival events and impacts during the shared damage cooldown.
- Production build and PWA generation passed. Existing Phaser bundle-size advisory remains.
- Chromium update browser suite passed: all five menus fit at 844×390, 568×320, 667×375 and 1200×800; controls remain inside the arena; AudioContext runs and analyser records non-zero audio output; visible knockdown/stars; paused timer/ambience; resume; mute; Help close.
- Existing gameplay and multilingual browser suites passed, including independent touch controls and production offline language switching. Mobile menu and knockdown screenshots inspected.
- Physical phone/Safari testing and subjective listening on actual phone speakers remain outstanding.
