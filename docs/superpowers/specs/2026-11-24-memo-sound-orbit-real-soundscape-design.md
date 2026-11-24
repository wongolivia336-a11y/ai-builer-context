# MEMO Garden Sound Orbit — Ten Photo-Matched Recordings

**Status:** Approved by the user on 2026-11-24; local listening review remains open before publication.
**Date:** 2026-11-24

## Intent

Give each of the ten existing Sound Orbit photographs its own real environmental recording, so moving to another photograph also changes the audible place. The sound should feel like a small, calm memory attached to the image, rather than ten variations of one noise bed.

## Current behavior

`src/zine/bubble-scenes.js` provides ten stable `sceneId` values and their existing photographs. `SoundOrbit.jsx` already routes hover previews and committed selections by those IDs, with a 300 ms hover delay and click-to-lock behavior. The current audio controller creates one eight-second filtered-noise buffer and reuses it for all ten scene presets. Its filters and playback rates vary, but the source recording does not, which explains why the scenes sound similar. No production sound files are currently bundled.

## Goals

- Add ten distinct, real recordings and map one to each existing `sceneId` and photo.
- Make photo preview, background preview, and sound preview use the same scene ID. After sound is enabled, a stable hover previews that scene's recording; clicking locks it. Muted mode remains silent.
- Preserve the existing 300 ms hover delay, 650–900 ms transition target, fast-switch cancellation, and audio-instance cleanup.
- Verify each recording's source page and license, record source and processed-file SHA-256 hashes, audition the selected excerpt, and use an edited loop that does not click or repeat conspicuously.
- Keep bundled audio compact and compatible with current desktop and mobile browsers.

## Recommended scene-to-sound direction

The rows below describe the intended sound character, not final source-file assignments. Final `trackId` values remain independent of Zine page numbers and candidate-list slots.

| Existing `sceneId` | Existing photo subject | Intended recording character |
|---|---|---|
| `canopy-rest` | Person resting beneath a park tree | Soft park ambience, distant birds, and light air |
| `cloud-meadow` | Open meadow and low cloud | Broad, gentle field wind |
| `rolling-flowers` | Rolling flower field | Meadow insects with soft grass movement |
| `wildflower-hill` | Flowered hillside | Light birdsong and hillside breeze |
| `lambs-in-the-field` | Two lambs on grass | Quiet pasture with a few distant sheep calls |
| `clover-light` | Close clover leaves and dew | Close leaf/grass rustle with a restrained outdoor bed |
| `star-tree` | Large park tree with star overlays | Calm evening park ambience and sparse insects |
| `misty-forest` | Foggy conifer forest | Fine forest rain or damp foliage, without loud thunder |
| `flower-pond` | Small pond and surrounding flowers | Small stream or soft water movement with distant birds |
| `apple-tree` | Apple tree | Quiet orchard birds and leaf movement |

These are ten unique recordings, not a promise that every row has a different generic sound category. The match should follow the visible place. The supplied images contain no fire, so a fireplace recording should not be forced into the map; the orchard or tree photos can instead use an appropriate outdoor recording.

## Source and audition gate

- Use the handoff shortlist where the recording fits the image and can be legally obtained. Recheck each source page before use.
- The handoff records that Freesound requires login for downloading these candidates. Do not bypass that requirement or use a preview stream as a production asset. If no authorized download is available, replace the candidate with a directly downloadable, clearly licensed recording.
- Candidate options identified during research include CC0 park field recordings (birds, river, wind), CC0 bird ambience, and loopable CC0 rain. These remain candidates until the source page, actual file, and recording contents are reviewed.
- Before an asset is treated as final, inspect the license and page metadata; audition it for voice/music, harsh peaks, artifacts, and fit; trim it to a calm 20–45 second excerpt; test the loop seam; and record both source and processed hashes.
- Provide a local listening preview for the chosen excerpts before publishing them as production tracks. No candidate that is still unaudited or unapproved by the listening review goes into the public audio map.

## Implementation approach

- Keep the existing `AudioContext` controller and scene event flow. Use local audio files decoded on demand by `sceneId`; do not add Howler.js unless the existing browser support proves insufficient.
- Replace the shared noise buffer with a scene-to-track manifest. Store provenance, license, hashes, edit notes, and audition state alongside the audio asset documentation.
- Decode lazily and keep the decoded-buffer cache bounded. Continue to allow no more than two active voices during a crossfade; use request tokens so an older load cannot replace a newer scene.
- Keep the sound toggle as the only audio unlock gesture. Do not autoplay on page load. Keep the current needle lift/seek/drop sequence and connect its committed scene to the same track ID as the selected photo.
- Use a modest, consistent level. Prefer a crossfaded loop for continuous ambience; avoid making footsteps, animal calls, or other sparse events repeat mechanically.
- Update Sound Orbit copy that currently labels the output as synthesized only when the ten reviewed recordings are ready.

## Approaches considered

1. **Real recordings per photo — selected.** Natural, distinctive ambience and an auditable relationship to each image. Requires license review, asset editing, audition, and file-size care.
2. Ten procedural Web Audio beds. Compact and license-simple, but still synthetic; it risks repeating the problem that prompted this request.
3. Hybrid field recordings plus procedural detail. Flexible, but adds sound-design complexity without a clear need in the current ten-photo gallery.

## Scope and anti-goals

- Change only Sound Orbit audio assets, its scene-to-track mapping, and local audio review/provenance documentation.
- Do not alter the ten photos, photo order, Zine content, page turning, Liquid Glass buttons, bubbles, stars, forest, mist, main App, routes, AR, SwiftUI, or backend.
- Do not autoplay, upload audio to a third-party playback service, or claim a recording is CC0 without checking its own source page.
- Do not add a campfire sound solely because it was suggested as an example when no current photo depicts a fire.

## Verification

- Verify all ten `sceneId`s resolve to ten locally bundled tracks, with no slot/page-number assumptions.
- Build the app and check missing/decode failures, silent default, 300 ms preview timing, photo/background/audio synchronization, 650–900 ms fades, hover restoration, rapid A→B→C input, mute cleanup, and page-hidden cleanup.
- Provide a local listening preview for sound review. Browser playback, keyboard, and mobile interaction must be checked in an available browser before calling those checks complete.
- Keep the existing PR #13 open and update it after the approved recordings and implementation are ready; do not merge.
