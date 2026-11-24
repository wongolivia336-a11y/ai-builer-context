# MEMO Zine Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify every Zine text element under the approved character-by-character collage treatment, restore Sound Orbit hover and wheel interactions, give the existing desktop bubble field more scale and variety, then publish the iteration for review.

**Architecture:** Keep the Zine as Canvas artwork and draw every page inscription as individual paper-backed glyphs. Use the open LXGW faces for Chinese and Special Elite for English. Keep the Sound Orbit audio controller and click behavior; add thumbnail card fade and wheel-driven record rotation. Change only desktop bubble count/radius bounds and matching WebGL capacities, leaving physics and mobile settings intact.

**Tech Stack:** React, JavaScript, Canvas 2D, CSS, Vite.

**Spec:** `docs/superpowers/specs/2026-11-24-memo-zine-typography-design.md`

## Global Constraints

- Use LXGW Marker Gothic v1.012 for Chinese titles and short collage notes.
- Use LXGW WenKai GB v1.530 for Chinese story copy.
- Use Special Elite for English subtitles and editorial labels so the font can be bundled with a verified open license.
- Render titles, English lines, body copy, and hand-marked notes as character-by-character collage tiles.
- Keep all ten photos, current story copy, collage layouts, page order, backgrounds, page-turning behavior, and print behavior.
- Keep Typetys unused.
- Bundle LXGW Marker Gothic and LXGW WenKai with their OFL license files and Special Elite with its Apache license.
- Do not publish or commit the user-provided QWERTYpe TTF; its rights remain unconfirmed.
- Provide a local preview before publishing.

## Review Focus

- Font load failure: block page drawing until both faces load; verify the existing Zine error state is shown rather than silently rasterizing fallback text.
- Missing glyphs: verify every Chinese code point used by the ten pages is covered by the chosen LXGW fonts before relying on them.
- Canvas text metrics: inspect all ten pages for clipping, overlap, awkward wraps, or text touching photo edges after fonts change.
- Print consistency: verify print output uses the same already-rendered page canvases as the reader.
- Small-screen readability: inspect headline and body size in the mobile Zine reader.

---

### Task 1: Load the approved font families and update Canvas typography

**Files:**
- Create: `public/zine/fonts/lxgw-marker-gothic-v1.012-subset.ttf` (official upstream release, subset to Zine glyphs)
- Create: `public/zine/fonts/lxgw-wenkai-gb-v1.530-subset.ttf` (official upstream release, subset to Zine glyphs)
- Create: `public/zine/fonts/OFL-LXGW-Marker-Gothic.txt` (official license text)
- Create: `public/zine/fonts/OFL-LXGW-WenKai-GB.txt` (official license text)
- Create: `public/zine/fonts/README.md` (subset and distribution notes)
- Create: `public/zine/fonts/SpecialElite-Regular.ttf` (official Google Fonts asset)
- Create: `public/zine/fonts/LICENSE-Special-Elite.txt` (Apache 2.0)
- Modify: `src/zine/page-art.js`

**Interfaces:**
- Consumes: official LXGW and Google Fonts releases, their licenses, and the existing `createPages()` flow.
- Produces: `createPages()` waits for all faces; all Chinese and English Zine text is drawn as cut-paper glyphs.

- [x] **Step 1: Select the official LXGW font release assets and verify Zine glyph coverage.**

  Downloaded LXGW Marker Gothic v1.012 and LXGW WenKai GB v1.530 from their official GitHub releases, retained their OFL 1.1 license files, and verified all 286 Chinese code points used by the Zine source and drawn annotations against both fonts and the generated subsets. QWERTYpe remains excluded from the public build because its rights are unconfirmed; use Special Elite from Google Fonts under Apache 2.0.

- [x] **Step 2: Add the OFL-licensed LXGW TTF subsets and license files under `public/zine/fonts/`.**

  Added both web-delivery LXGW subsets and their original OFL texts, plus Special Elite and its Apache license. The unlicensed QWERTYpe file remains excluded.

- [x] **Step 3: Add cached font loading to `src/zine/page-art.js`.**

  Added a cached `FontFace` loader for both LXGW subsets and Special Elite, added successful faces to `document.fonts`, and await the loader once at the start of `createPages()` before creating canvases.

- [x] **Step 4: Render every Zine text element as character-by-character collage.**

  Titles and short Chinese notes use LXGW Marker Gothic; body copy uses LXGW WenKai GB; English subtitles use Special Elite. Each glyph receives an individual paper tile with small angle and ink variations. Copy, photos, and page order are unchanged.

- [x] **Step 5: Tune wrapping and spacing for all ten page layouts.**

  Added glyph-aware wrapping that retains punctuation and spaces, and computes page text blocks from the new collage line metrics. Verify all ten rendered pages for clipping and legibility during preview.

### Task 2: Restore Sound Orbit card and wheel-driven rotation

**Files:**
- Modify: `src/components/SoundOrbit.jsx`
- Modify: `src/components/SoundOrbit.css`

- [x] Add a thumbnail photo to the hover card and fade the card and image in/out with hover/focus/selection.
- [x] Add wheel input over the orbit surface that rotates the ring and previews the corresponding scene; preserve default slow rotation and existing 300 ms audio-hover delay.
- [x] Preserve Liquid Glass button styling and existing audio/click/tonearm flow.

### Task 3: Increase desktop bubble presence

**Files:**
- Modify: `src/zine/bubbles/config.js`
- Modify: `src/zine/bubbles/physics.js`
- Modify: `src/zine/bubbles/renderer.js`
- Modify: `src/zine/bubbles/shaders.js`

- [x] Increase desktop bubble count to 14 and widen desktop radius variation while preserving five mobile bubbles and all current bubble shapes, background scenes, and physics behavior.
- [x] Expand existing WebGL bubble/deformation capacity and shader loop to 16 so the added bubbles render without overflow.

### Task 4: Build, inspect, and publish the iteration

**Files:**
- Modify if needed: `src/zine/page-art.js`
- Create: local Before/After preview screenshots outside the repository
- Create: GitHub PR #13 because PR #12 was merged at `b0d7f12`; do not merge

**Interfaces:**
- Consumes: the font-ready Canvas output from Task 1.
- Produces: a local preview of the updated Zine and orbit, a successful production build, and an open review PR.

- [x] **Step 1: Run `npm run build`.**

  Final build passed. Vite retains the existing advisory that the 1.224 MB main JavaScript bundle exceeds 500 kB.

- [ ] **Step 2: Run the local preview and inspect all ten pages and orbit interactions.**

  Local preview is running at `http://127.0.0.1:4175/`. HTTP checks returned 200 for the app shell, all three font files, and a Zine scene photo. A direct `BubbleWorld` check confirmed 14 desktop bubbles, five mobile bubbles, and 14 after resizing back to desktop. Browser-based page visuals, keyboard interaction, and wheel/audio interaction could not be exercised in this environment because no browser automation runtime is available; the local preview is ready for inspection.

- [x] **Step 3: Tune hover-card sizing and reduced-motion behavior, and rerun the build.**

  Adjusted the hover card position and thumbnail height for the 180 px desktop and 160 px mobile orbit surfaces so it stays clear of the control row. A fresh review also prompted keeping the card visible after a committed selection while sound is off and disabling its animations under reduced motion. The final build passed after these changes.

- [x] **Step 4: Commit the polished iteration and open PR #13 without merging.**

  Commit `26a90c8` was pushed to the existing branch. PR #12 was already merged at `b0d7f12`, so PR #13 is open for review. Keep the local preview helper and QWERTYpe out of the commit.
