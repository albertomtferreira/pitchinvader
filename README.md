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

WASD or arrow keys move; Shift sprints; Escape pauses. Mobile: drag in the lower-left joystick area and hold the right sprint button. Two independent pointer IDs permit both controls together. Survival time is the score. Gold is you, lime jackets are stewards, blue/coral kits are the teams. Players knock you back; the referee briefly stuns you. Only stewards capture you. Two stewards give you three seconds before pursuing; further stewards join as time passes. Close approaches count as near misses only after you escape.

Pause, focus loss, backgrounding and portrait orientation stop simulation time. Resume is deliberate. Landscape is required, with the whole pitch preserved without stretching. Best score and sound preference use optional local storage.

## Install and offline

Production builds include a manifest, 192/512 PNG icons and a Workbox precache service worker. Load once online and wait for “Ready for offline play.” Subsequent visits work offline. Service workers require HTTPS (localhost is allowed). Chrome/compatible browsers may offer a native install prompt; Safari on iPhone: Share → Add to Home Screen. Other browsers: browser menu → Install app/Add to Home Screen where available. Browser support varies. Updates wait until all game tabs close; no forced reload interrupts a run. Development does not enable the service worker.

## Balance and structure

All gameplay balance lives in `src/config.ts`: world bounds, speeds, stamina drain/recovery and unlock threshold, pursuit turn response, head start, warning time, spawn interval, population/speed caps, hitbox radii, cooldown, stun, slow, knockback and near-miss distances. `model.ts` is the fixed-step simulation, `scene.ts` renders, `input.ts` owns input, and `main.ts` manages menus/lifecycle. `audio.ts` synthesizes short interaction-unlocked sounds; audio/storage failures never stop play. Decorative movement respects reduced motion.

## Verification

`npm test` checks stamina bounds/exhaustion recovery, normalized movement, paused scoring, difficulty caps, cooldown protection and capture/reset rules. Browser checks and their actual outcomes are recorded in `VERIFICATION.md`. Physical iPhone/Android testing remains a separate device QA step.
