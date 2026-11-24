# MEMO Garden Sound Orbit Vinyl Implementation Plan

> **Execution status:** The user reviewed the local preview and authorized the GitHub update on 2026-11-24.

**Goal:** Turn only the Zine's upper-left scene selector into a ten-photo vinyl-style Sound Orbit with a fine SVG tonearm and explicit, accessible sound controls.

**Architecture:** Reuse `BUBBLE_SCENES` as the single photo/scene source. Keep `previewSceneId`, `committedSceneId`, visual rotation, and audio enablement separate. Drive the existing background through its existing scene prop so the bubble renderer stays mounted. Add one local native Web Audio controller that shares the Zine AudioContext and plays labelled procedural demo tones until source audio is approved.

**Tech Stack:** React, SVG, CSS, existing Web Audio API and Zine `AudioContext`; no new package, Three.js, or Howler.

**Spec:** `docs/superpowers/specs/2026-11-23-memo-sound-orbit-vinyl-design.md`

## Constraints

- Preserve the full-screen shaped bubbles, stars, forest/mist background, centered Zine, Zine page navigation, printing, route action, and existing Liquid Glass buttons.
- Keep all ten photos mapped by their existing `sceneId`. Never treat shortlist slot numbers as Zine page numbers.
- No Freesound candidate enters application playback until its file is obtained through an authorized route, source/CC0 state is recorded, the audio is auditioned, and the user approves it.
- Publish only after preview review; the user reviewed the preview and authorized this push on 2026-11-24.
- Do not alter main App audio logic, AR, SwiftUI, routing, printing mechanics, backend, or the global bubble renderer.

### Task 1: Record the actual photo/source mapping and capture baseline

**Files:**
- Create: `docs/superpowers/specs/2026-11-23-memo-sound-orbit-vinyl-design.md`
- Create: this plan
- Create: `docs/superpowers/specs/2026-11-23-memo-sound-orbit-media-audit.md`

- [x] Read the handoff's start page, interaction/audio/scope/architecture/license/build-in-public/decision docs, and inspect its reference previews.
- [x] Inspect the real `BUBBLE_SCENES`, all ten actual photos, current Zine component, dependencies, and existing audio paths.
- [x] Reopen all ten Freesound source pages; record current CC0 page status, download login requirement, actual visual candidate matches, and unresolved listening/download states.
- [x] Save current local desktop and 390 px mobile screenshots as the Sound Orbit before state. Reuse the same pre-Sound-Orbit Zine state captured immediately before this phase: `memo-garden-zine-desktop-final.png` and `memo-garden-zine-mobile-final.png` in the local visualization workspace.

### Task 2: Build the local ambient controller and scene-keyed sound demo

**Files:**
- Create: `src/zine/sound-orbit-audio.js`
- Modify: `src/components/ZineLanding.jsx`

- [x] Reuse the Zine AudioContext ref and create no audio node on mount.
- [x] Unlock audio only from the explicit sound button gesture; provide ten low-volume, scene-keyed procedural sound profiles.
- [x] Implement scene-keyed preview/commit/restore/mute/dispose, 300 ms preview intent, 800 ms crossfade, 220 ms stop fade, stale-request protection, and at-most-two active source graphs.
- [x] Make unsupported/rejected audio nonfatal and keep all visual controls usable.

### Task 3: Create the SVG photo orbit and tonearm

**Files:**
- Create: `src/components/SoundOrbit.jsx`
- Create: `src/components/SoundOrbit.css`
- Modify: `src/components/ZineLanding.jsx`
- Modify: `src/components/ZineLanding.css`

- [x] Render ten clipped photo wedges from `BUBBLE_SCENES`, stable under scene rotation and keyed by ID.
- [x] Add a restrained SVG pivot, fine rod, bend, headshell, and stylus tip; keep SVG hit-testing disabled over wedges.
- [x] Implement 6°/s rotation, hover/focus pause, photo enlargement, hover photo card, park/lift/seek/lower tonearm, and independent center rotation and sound controls.
- [x] Integrate preview/commit states with the existing background scene without remounting its bubble renderer or changing Zine page state.
- [x] Add keyboard arrows, Enter/Space, pressed state, visible focus, 375/390 px touch layout, and reduced-motion behavior.
- [x] Keep existing top-right and bottom button styles/actions unchanged.

### Task 4: Manual QA and local preview handoff

**Files:**
- Modify: `docs/demo-scope.md` only if copy needs an accurate Demo boundary update.
- Create/update: `docs/BUILD_IN_PUBLIC.md`
- Create: `docs/superpowers/specs/2026-11-23-memo-sound-orbit-media-audit.md`

- [x] Run `npm run build`.
- [x] Manually verify default silence, explicit audio unlock, <300 ms no-preview, >300 ms preview, hover restore, commit animation/audio alignment, rapid A→B→C crossfade with a two-source cap, mute fade, node release, and unsupported audio behavior.
- [x] Check 1440×900, 390×844, 375×812, 768 px tablet, focus order, arrow preview, Enter/Space commit, and reduced motion.
- [x] Verify the original bubble shapes, stars, forest, mist, Zine and buttons remain intact and the bubble renderer is not remounted.
- [x] Capture same-size desktop/mobile before-after screenshots and a 10–20 second interaction recording; include a reduced-motion frame.
- [x] Present local preview and evidence.

### Task 5: Publish after local preview approval

- [ ] Create a reversible commit, preserve all existing commits, push the current branch with a normal fast-forward, and update the open follow-up PR #12. Do not merge.
- [ ] Verify the PR head SHA, open state, changed-files scope, and preview links.
