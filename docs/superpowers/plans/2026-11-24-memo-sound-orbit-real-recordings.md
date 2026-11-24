# MEMO Garden Sound Orbit Real Recordings Implementation Plan

> **Status: approved by the user on 2026-11-24.** The user authorized pushing this repair round after checks. Keep the ten recordings marked `local-preview` until the user confirms the listening pass.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Replace the one shared synthetic noise bed with ten licensed, real recordings, each bound to the existing Sound Orbit photo it depicts.

**Architecture:** Keep the existing React Sound Orbit flow and shared Web Audio `AudioContext`. Add a local track manifest keyed only by `BUBBLE_SCENES[].id`; fetch and decode each recording on demand, bound decoded audio memory, and crossfade no more than two voices. Keep source/license and edit provenance beside the assets, and leave the audio review state visible for the user's listening pass.

**Tech Stack:** React 19, Vite 8, JavaScript modules, Web Audio API, Node.js 20.19+.

**Spec:** `docs/superpowers/specs/2026-11-24-memo-sound-orbit-real-soundscape-design.md`

## Global Constraints

- Map each of the ten recordings by the exact `sceneId` in `src/zine/bubble-scenes.js`; do not infer a mapping from candidate-list slots or Zine page numbers.
- Use real local audio files; do not use the shared synthetic noise generator or remote streaming URLs as production audio.
- Verify each recording's source and license, save source and processed SHA-256 hashes, and make the local listening review available before pushing the update.
- Keep the sound toggle as the user-gesture unlock. Do not autoplay on page load.
- Preserve the existing 300 ms hover delay, click-to-lock sequence, and 650–900 ms crossfade target; use 800 ms as the default scene transition.
- Limit playback to two concurrent voices, cancel stale scene loads, and fade/release playback on mute and hidden-page cleanup.
- Preserve all ten photos and all non-audio site behavior. Do not modify the Zine, bubbles, backgrounds, Liquid Glass controls, page turns, print, main App, routes, AR, SwiftUI, or backend.
- Do not add Howler.js unless the existing Web Audio path proves insufficient.
- Keep PR #13 open and do not merge it.

## Review Focus

- A source file is missing, rejected, or cannot decode: audio playback must report a useful error and leave the gallery usable.
- A rapid A→B→C hover or wheel sequence finishes loading out of order: only C may become audible.
- The user mutes or hides the page while a file is loading: the pending file must not start afterward, and existing voices must release.
- A crossfade is in progress as another scene is selected: no more than two sources may play at once and no old scene may replace the newest selection.
- Keyboard, touch, and reduced-motion use the same `sceneId` audio mapping while retaining the existing Sound Orbit controls and motion behavior.

---

### Task 1: Acquire and document the ten photo-matched recordings

**Files:**
- Create: `public/zine/audio/` with one edited local recording for each `sceneId`.
- Create: `docs/superpowers/specs/2026-11-24-memo-sound-orbit-audio-provenance.md`.

**Interfaces:**
- Produces ten final relative asset paths and a provenance row for each of the ten `sceneId`s.
- Each provenance row records `sceneId`, track title, source URL, creator, license and license URL, download date, source SHA-256, processed SHA-256, duration, edit/loop notes, and listening-review status.

- [ ] Recheck the source page and license for each recording. Use an authorized direct download; if a Freesound candidate requires login and no authorized download is available, replace it with a clearly licensed, directly downloadable recording. Do not bypass access controls or use preview streams as production assets.
- [ ] Select material matching the approved scene direction: park birds/air; meadow wind; meadow insects/grass; hillside birds/breeze; distant sheep/pasture; close leaf/grass rustle; evening park/insects; fine forest rain/damp foliage; soft water/birds; orchard birds/leaves. Do not force in a fire sound because none of the existing photos depicts fire.
- [ ] Edit each selection to a calm 20–45 second loop, check the seam and levels, and keep the combined compressed asset size at or below 6 MB.
- [ ] Save the source and processed hashes and mark the tracks as `local-preview` until the user has heard the ten-track preview.

**Check:** Inspect all ten provenance rows against the actual files and source/license pages; verify the measured durations, file sizes, and SHA-256 hashes recorded in the document.

### Task 2: Define the scene-keyed track manifest and asset check

**Files:**
- Create: `src/zine/sound-orbit-tracks.js`.
- Create: `scripts/verify-sound-orbit-audio.mjs`.
- Modify: `package.json`.
- Test: `scripts/verify-sound-orbit-audio.mjs`.

**Interfaces:**
- Export `SOUND_ORBIT_TRACKS`, keyed by the exact `sceneId`; each value contains `trackId`, local `src`, and the short label used in the Sound Orbit status text.
- The verification script reads `BUBBLE_SCENES` and `SOUND_ORBIT_TRACKS`, then checks exact scene coverage, unique `trackId`s, file existence, provenance rows, and each processed-file SHA-256.

- [ ] Add ten manifest entries without numeric page or candidate-slot mapping.
- [ ] Add `npm run check:sound-orbit-audio` to run the verification script with the project's existing Node runtime; do not add a test framework dependency.
- [ ] Run `npm run check:sound-orbit-audio` and verify that it fails for a removed file, duplicate track ID, missing scene, or hash mismatch, then passes for the complete manifest.

### Task 3: Replace the shared synthetic buffer with local real tracks

**Files:**
- Modify: `src/zine/sound-orbit-audio.js`.
- Test: `scripts/verify-sound-orbit-audio.mjs` (asset and mapping integrity only); browser regression below covers playback behavior.

**Interfaces:**
- Preserve `SoundOrbitAudioController(audioContextRef)` and its public methods `unlockFromGesture()`, `preview(sceneId)`, `commit(sceneId)`, `restoreCommitted(sceneId)`, `disable(fadeMs)`, and `dispose()`.
- Resolve `sceneId` through `SOUND_ORBIT_TRACKS`; decode local assets lazily with the shared `AudioContext`.

- [ ] Remove `makeSoftNoise`, `PRESETS`, and the synthetic-audio description. Fetch and decode the selected local file only after audio is enabled and a scene requests playback.
- [ ] Deduplicate in-flight requests per track, ignore results whose transition token is stale, and keep a bounded two-entry decoded-buffer cache.
- [ ] Crossfade the previous and next real sources over 800 ms by default, enforce the two-voice ceiling during rapid switching, and loop only the edited loop-safe excerpts.
- [ ] On mute/dispose, invalidate pending requests, fade current voices using the existing short mute duration, stop and disconnect sources, and clear timers/cache references. Preserve hidden-page cleanup provided by `SoundOrbit.jsx`.
- [ ] Surface load/decode failures in the Sound Orbit control area while leaving photo selection and the rest of the page usable.

**Check:** Build and manually inspect playback at each of ten scene IDs, including the error path for a deliberately unavailable local asset; confirm stale requests cannot start audio and no more than two sources overlap.

### Task 4: Update Sound Orbit copy and public-facing project notes

**Files:**
- Modify: `src/components/SoundOrbit.jsx` only if a track label or playback error state needs to be displayed.
- Modify: `docs/BUILD_IN_PUBLIC.md`.
- Modify: `docs/superpowers/specs/2026-11-23-memo-sound-orbit-media-audit.md` only if needed to record the completed source audit.

- [ ] Keep the UI's short, restrained Chinese copy aligned with real photo-matched recordings; remove any remaining wording that calls the audio synthetic.
- [ ] Record the completed source review, track mapping, asset budget, and verification results in the project notes without changing non-audio product copy.

### Task 5: Build, regression-check, preview, and publish after review

**Files:**
- Modify: `docs/BUILD_IN_PUBLIC.md` with the final verification and preview link.
- Create: local screenshot and short interaction recording in the existing visualization/evidence workspace, if the available browser tooling supports capture.

- [ ] Run `npm run check:sound-orbit-audio` and `npm run build`.
- [ ] Manually verify silent initial state; gesture unlock; all ten photo/background/recording pairings; 300 ms hover; click lift/seek/drop; 800 ms crossfade; hover restore; rapid switching; mute release; hidden-page release; keyboard, touch, mobile widths, reduced motion, and failed-file feedback.
- [ ] Check network activity and decoded-buffer retention to confirm audio files load only on selection and the cache remains bounded. Confirm all ten existing photo URLs and all non-audio UI remain unchanged.
- [ ] Leave the local preview running at `http://127.0.0.1:4177/` for the user's listening review. If a recording does not fit its photo, replace it and rerun the source, hash, build, and playback checks before publishing.
- [ ] After the requested repairs and regression checks pass, create a reversible commit, push the existing branch, update PR #13 with the source/provenance and verification summary, and leave it open.

**Check:** `npm run check:sound-orbit-audio` and `npm run build` pass; browser review covers the listed desktop/mobile and input cases; ten recordings remain marked `local-preview` until the user completes the listening review.
