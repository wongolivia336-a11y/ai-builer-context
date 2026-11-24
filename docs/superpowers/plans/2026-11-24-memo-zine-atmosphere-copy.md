# MEMO Garden Zine Atmosphere and Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give desktop Zine bubbles more scale variation and replace the flat page base with soft landscape texture and reflective copy.

**Architecture:** Keep the existing zero-dependency `BubbleWorld`, WebGL2 shader, and Canvas page-art pipeline. Reuse existing scene photographs for ten printed page underlays; update the ten story paragraphs without changing page structure.

**Tech Stack:** React, Canvas 2D, existing WebGL2 shaders and physics; no new dependency.

**Spec:** `docs/superpowers/specs/2026-11-24-memo-zine-atmosphere-copy-design.md`

## Global Constraints

- Keep original titles, English subtitles, ten orbit photos, collage assets, Zine page-turn/print flow, Sound Orbit, and Liquid Glass controls.
- Keep mobile bubbles at 5; set desktop bubbles to 10, within shader uniform capacity.
- Reuse local scene photos. Do not edit or replace image files or add image assets.
- Limit code and docs to the Zine content, page-art and bubble implementation.
- Avoid claims that the current Demo provides GPS, AI sorting, or hardware integration.

## Review Focus

- Page 03 and Page 09 text fit their current torn-copy panels.
- Changing viewport size preserves desktop 10/mobile 5 counts and does not overflow bubble uniforms.
- Blurred photo bases stay low contrast; body text remains readable in screen and print canvases.
- Reduced motion and WebGL fallback retain the same bubble set.
- Ten original scene-photo URLs and existing Zine/Sound Orbit controls remain unchanged.

---

### Task 1: Rewrite story paragraphs and add atmospheric page bases

**Files:**
- Modify: `src/zine/content.js`
- Modify: `src/zine/page-art.js`
- Modify: `docs/demo-scope.md`

- [x] Replace the ten `mainCopy` strings using the approved copy in the design spec; preserve titles, English subtitles, `alt`, and asset IDs.
- [x] Add a 10-entry `PAGE_BACKDROPS` list using only existing `field/` images.
- [x] Change `drawPaperBase` to draw the selected image across the page at 34 px blur, then apply a warm translucent wash, paper texture, and current grain.
- [x] Keep `drawPhotoScrap`, title, sticker, copy-panel, and `createPages()` order unchanged so all foreground pieces remain sharp and print with the page.
- [x] Update the Zine description in `docs/demo-scope.md` from cold white stock to warm paper over blurred local landscape.
- [x] Inspect all ten rendered pages at 1120×1587 and verify Page 03/Page 09 copy fit.

### Task 2: Increase desktop bubble presence

**Files:**
- Modify: `src/zine/bubbles/config.js`
- Modify: `src/zine/bubbles/physics.js`
- Modify: `src/zine/bubbles/shaders.js`

- [x] Set `desktopBubbleCount` to 10 and retain `mobileBubbleCount` at 5.
- [x] Make `BubbleWorld.resize()` use `SETTINGS.desktopBubbleCount` and `SETTINGS.mobileBubbleCount` instead of literal counts.
- [x] Recalculate existing bubble radii and mass when a resize crosses 680 px so desktop-sized bubbles cannot persist on mobile.
- [x] Assign deterministic desktop size bands from 31–98 px radius on a 900 px short edge; retain the current mobile radius range.
- [x] Add a low-frequency ±2.5% radius pulse to WebGL and CSS fallback bubbles using each bubble's existing phase; stop it under reduced motion.
- [x] Verify bubble data arrays and uniforms contain 10 entries at desktop size and 5 at mobile size.

### Task 3: Review, capture, and publish

**Files:**
- Modify: `docs/BUILD_IN_PUBLIC.md`
- Modify: this plan after verification

- [x] Run `npm run build` and `git diff --check`.
- [x] Manually inspect 1440×900, 768×900, 390×844, and 375×812; check reduced motion, WebGL fallback, breakpoint radius recalculation, keyboard selection, page navigation, and print output.
- [x] Compare current scene URLs and assets to `HEAD`; confirm no original photo or sticker file changed.
- [x] Capture before/after desktop and mobile screenshots and a desktop interaction recording.
- [x] Record the copy, bubble counts, checks, and build advisory in `docs/BUILD_IN_PUBLIC.md`.
- [ ] Create a reversible commit, push the current branch normally, and update open PR #12 without merging.
- [ ] Confirm the PR head matches local HEAD and remains open.
