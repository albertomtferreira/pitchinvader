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
