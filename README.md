# Pitch Invader

A local-first, cartoon football survival game for landscape mobile browsers and desktop. Original graphics are drawn in Phaser; icons are bundled PNGs. No account, server or remote runtime assets.

## Run

Requires Node 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

Development: http://localhost:5173. Production preview: http://localhost:4173. These URLs work only on the machine running Vite. Codex Cloud tasks do not provide localhost snapshots, so clicking these links from the Codex phone app will fail. Cloud execution also needs permission to bind the server port; an `EPERM` on `0.0.0.0:5173` is a sandbox restriction, not a Vite compilation failure. To play from a phone, use a deployed HTTPS URL or run Vite on your own computer and open its LAN URL from a phone on the same Wi-Fi network. Serve the contents of `dist/` using any static HTTPS host. Vite's preview server is for verification, not public production hosting.

## Play

WASD or arrow keys move; Shift sprints; Escape pauses. Mobile: drag the lower-left joystick and hold the right sprint button, both overlaid inside the pitch. Two independent pointer IDs permit both controls together. Survival time is the score. Gold is you, lime jackets are stewards, blue/coral kits are the teams. Players knock you back; the referee briefly stuns you. Only stewards capture you. Run into the ball to kick in your movement direction; sprinting kicks harder. The ball slows down and bounces at the boundaries. A moving ball knocks a steward down for three seconds of simulation time, followed by a brief recovery. Downed/recovering stewards cannot capture you, and each kick can hit a given steward only once. Two stewards give you three seconds before pursuing; further stewards join as time passes. Close approaches count as near misses only after you escape.

Pause, focus loss, backgrounding and portrait orientation stop simulation time. Resume is deliberate. Landscape is required, with the whole pitch preserved without stretching. Best score, sound and language preferences use optional local storage. Gameplay uses the whole available viewport with a compact HUD over the crowd. Short landscape menus use two columns without scrolling; How to play opens the instructions separately.

## Install and offline

Production builds include a manifest, 192/512 PNG icons and a Workbox precache service worker. Load once online and wait for “Ready for offline play.” Subsequent visits work offline. Service workers require HTTPS (localhost is allowed). Chrome/compatible browsers may offer a native install prompt; Safari on iPhone: Share → Add to Home Screen. Other browsers: browser menu → Install app/Add to Home Screen where available. Browser support varies. Updates wait until all game tabs close; no forced reload interrupts a run. Development does not enable the service worker.

## Balance and structure

All gameplay balance lives in `src/config.ts`: world bounds, speeds, stamina drain/recovery and unlock threshold, pursuit turn response, head start, warning time, spawn interval, population/speed caps, hitbox radii, cooldown, stun, slow, knockback and near-miss distances. `model.ts` is the fixed-step simulation, `scene.ts` renders, `input.ts` owns input, and `main.ts` manages menus/lifecycle. `audio.ts` synthesizes interaction-unlocked stadium ambience, percussion that builds over the first 75 seconds, player/referee impacts, kicks, arrival radio chirps and crowd cheers; audio/storage failures never stop play. Decorative movement respects reduced motion.

## Verification

`npm test` checks stamina bounds/exhaustion recovery, normalized movement, paused scoring, difficulty caps, cooldown protection and capture/reset rules. Browser checks and their actual outcomes are recorded in `VERIFICATION.md`. Physical iPhone/Android testing remains a separate device QA step.

## Languages

The menu language selector offers English (UK), Português (Portugal), Español (España), Français and Italiano. The game uses your saved choice, then the first supported browser language, then UK English. Scores use local decimal formatting. All translations are bundled for offline use; the brand and installed PWA name remain Pitch Invader. The manifest uses UK English metadata.

Translation dictionaries live in `src/locales/`; `src/i18n.ts` provides selection, formatting, pluralisation and DOM translation. New dictionaries must implement every English key and preserve interpolation placeholders. Translate whole messages and use dedicated text elements for labels that accompany icons. Preferences are optional when browser storage is unavailable.

Run `npm run test:i18n:browser` with development on port 5173 and production preview on port 4173 (build first). Browser scripts use Playwright's installed Chromium by default; set `CHROMIUM_PATH` to use a local Chrome/Chromium executable. Install Playwright Chromium with `npx playwright install chromium` if needed.

Run `npm run test:updates:browser` alongside the development server and production preview to check compact multilingual menus, pitch controls, actual audio output, knockdown rendering and pause/mute behavior.
