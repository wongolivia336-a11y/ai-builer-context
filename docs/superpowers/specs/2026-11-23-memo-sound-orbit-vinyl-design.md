# MEMO Garden Sound Orbit: Vinyl Gallery Design

## Intent

Deepen only the existing Zine landing's upper-left scene control into a quiet photo record with a fine 2D tonearm. Keep the current forest, stars, mist, full-screen translucent shape bubbles, centered Zine, page controls, and Liquid Glass buttons intact.

## Repository findings

- `src/zine/bubble-scenes.js` already defines ten stable `sceneId` records, each pointing to one real local photo in `public/zine/assets/scenes/`. Their photo meanings were checked directly: canopy rest, cloud meadow, rolling flowers, wildflower hill, lambs in a field, clover light, star tree, misty forest, flower pond, and apple tree.
- These ten `sceneId` records are background-photo scenes, not Zine page numbers. The ring, hover card, background, and sound demo will all use the same `sceneId`.
- The Zine currently has a small scene selector and a WebGL background crossfade. `ZineBubbleBackground` accepts scene selection without remounting its bubble renderer.
- The Zine has a short Web Audio page-turn cue. The main App uses a separate single-play bubble audio callback and text-to-speech fallback; it is not an ambient crossfade manager. The repository contains no approved ambient recording files and no Howler dependency.
- The handoff's ten Freesound pages currently show CC0 and a login-required download control. Their files are not present locally and have not been auditioned. The candidate order is not a scene or page mapping.

## Scene and source audit

These are provisional semantic suggestions from the actual photographs and each Freesound page's title/description. They are not deployment mappings. No candidate is assigned in code until its audio file is downloaded through the authorized account, auditioned, and approved.

| Existing `sceneId` / photo | Visual subject | Possible sound direction | Candidate evidence | Status |
|---|---|---|---|---|
| `canopy-rest` / `01-canopy-rest.jpg` | A person resting beneath a broad park tree | Soft birds, leaf movement, distant park air | [Bird Song](https://freesound.org/people/musicradiocreative/sounds/197104/); [City park ambience](https://freesound.org/people/felix.blume/sounds/667062/) | Pending download and audition |
| `cloud-meadow` / `02-cloud-meadow.jpg` | Open meadow with a road and a low cloud | Open air; possibly quiet grass footsteps | [Walking through a grassy field](https://freesound.org/people/Sadiquecat/sounds/802068/) | Weak fit; pending audition |
| `rolling-flowers` / `03-rolling-flowers.jpg` | Rolling flower field | Light field air or distant birds | [Bird Song](https://freesound.org/people/musicradiocreative/sounds/197104/) | Pending audition |
| `wildflower-hill` / `04-wildflower-hill.jpg` | Flower-covered hillside | Soft wind and field ambience | No direct candidate; do not force a mapping | Unmapped |
| `lambs-in-the-field` / `05-lambs-in-the-field.jpg` | Two lambs on grass | Field ambience; the list has no sheep recording | [Walking through a grassy field](https://freesound.org/people/Sadiquecat/sounds/802068/) is footsteps, not sheep | Unmapped pending better source |
| `clover-light` / `06-clover-light.jpg` | Close clover leaves with dew and sun | Gentle leaves or birds | [Bird Song](https://freesound.org/people/musicradiocreative/sounds/197104/) | Weak fit; pending audition |
| `star-tree` / `07-star-tree.jpg` | A large park tree under star graphics | Quiet night park/forest | [Quiet night forest](https://freesound.org/people/soundandmelodies/sounds/776081/) | Provisional; includes wind and car passes per source description |
| `misty-forest` / `08-misty-forest.jpg` | Foggy conifer forest with decorative stars | Muffled forest air | [Quiet night forest](https://freesound.org/people/soundandmelodies/sounds/776081/) | Provisional; pending audition |
| `flower-pond` / `09-flower-pond.jpg` | Small pond among flowers | Flowing water | [Small brook](https://freesound.org/people/SamsterBirdies/sounds/584269/) | Strong semantic fit; pending audition |
| `apple-tree` / `10-apple-tree.jpg` | Apple tree with decorative stars | Orchard birds and leaf movement | [Bird Song](https://freesound.org/people/musicradiocreative/sounds/197104/) | Provisional; includes crows/rooks per source description |

The rain-on-window, train, ocean, and fireplace candidates do not correspond to these ten images. The soft bubble recording describes bubbling water and may be an occasional one-shot later; it should not be looped as the ambience of every scene. Source page CC0 labels were rechecked on 2026-11-23, but every file remains `PENDING_DOWNLOAD` and `PENDING_AUDITION`; no checksum can be recorded before an authorized file is obtained.

## Interaction model

- The ten local photo slices rotate at about 6 degrees per second. A hover or keyboard focus pauses the ring, lifts the matching slice slightly, shows its photo/name card, and selects the matching background `sceneId`.
- Hover sound intent is debounced by 300 ms and is active only after the user explicitly enables sound. Pointer exit cancels pending intent and restores the committed scene and sound.
- Click commits a scene. The tonearm raises, seeks symbolically, then lowers. It remains parked while muted; enabling sound from a user gesture starts the current/committed scene's local demo profile.
- `previewSceneId`, `committedSceneId`, `audioEnabled`, and `visualRotating` stay separate. Zine page index remains unchanged and independent.
- Visual ring rotation is controlled by the center button only. Sound enable/mute is a separate labelled control.
- Background switching uses the existing renderer crossfade and current scene state; changing a scene must not remount the forest/bubble renderer. Muting fades out over about 220 ms, stops and releases all demo audio nodes, and parks the tonearm.
- Scene audio changes crossfade in about 800 ms with no more than two active source graphs. Request tokens cancel stale hover/commit work.
- Keyboard Left/Right previews adjacent slices; Enter/Space commits. Every slice exposes its scene name and pressed state; focus-visible styling remains clear.
- Reduced motion stops ring rotation without blocking direct selection or sound controls. On touch, one tap commits and the independent sound button controls audio; there is no touch auto-preview.

## Temporary sound behavior

Until a Freesound file is authorized and auditioned, local preview uses a low-level procedural Web Audio texture clearly labelled **合成演示音 · 真实录音待试听**. It is an interaction placeholder, not an ASMR recording or a candidate-source mapping. Use the Zine's existing AudioContext reference and no new dependency. Do not add Freesound URLs or remote streams to production code.

## Scope and non-goals

- Modify only the Zine header/scene-control module, its local CSS/audio bridge, and relevant Zine documentation.
- Keep the ten real photos, current background/bubble component, star layer, forest, mist, Zine, flip/print actions, product-route action, and established Liquid Glass button styling.
- Do not alter the main App audio business, sound data, AR, SwiftUI, routes, print mechanics, backend, or global particle system.
- Do not add Three.js, Howler, external images, or unreviewed audio assets.

## Acceptance

- Ten actual scene photos remain selectable as ring slices with scene IDs aligned across ring, hover card, background, and demo sound profile.
- The arm has a pivot, fine metal rod, bend, and stylus tip without blocking slice input.
- No sound is created on page load. Opening sound requires a user gesture; hovering under 300 ms remains silent; commit, preview restore, 800 ms crossfade, mute fade/release, and arm parking work.
- Original background bubbles, stars, forest, mist, and Zine remain visually present and usable.
- Keyboard, reduced motion, 375/390 px touch, 768 px tablet, and 1440 px desktop work without overlap.
- Local build and manual regressions pass. Deliver same-size before/after captures, 10–20 second desktop/mobile recordings where the local browser permits, a source-status record, and a reversible commit only after local preview review.
