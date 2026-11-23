# MEMO Garden Zine Journey Collage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the ten-page Zine into a readable collage story about one sound bubble's journey, add the approved conceptual product introduction, and show five bubble silhouettes in normal, reduced-motion, and WebGL fallback modes.

**Architecture:** Keep LeafThrough and the existing Canvas page renderer. Move the collage to page-specific composition data in `page-art.js`, retain `ZINE_PAGES` and `createPages()` interfaces, and assign the existing shader's five shape types through `BubbleWorld` while matching them in the CSS fallback. Place the product introduction inside the screen-only reader shell.

**Tech Stack:** Existing React 19 + Vite, LeafThrough 0.1.8, Canvas 2D, WebGL2, CSS, and existing local Zine assets. No new dependency.

**Spec:** `docs/superpowers/specs/2026-11-23-memo-zine-journey-collage-redesign-design.md`

## Global Constraints

- Change only the independent Zine experience and its accurate Demo-scope description; do not change the main App, AR, SwiftUI, or backend.
- Keep ten pages, LeafThrough page turning, A5 print output, the ten-photo background carousel, and current reader controls.
- Keep the Zine full-screen. Preserve the existing Liquid Glass button treatment and behavior.
- Use a white or cool-white paper field, restrained fiber/photocopy grain, torn paper, layered real photos, cut-paper titles, and hand-drawn marks; change at least two composition variables on every page.
- Keep all five bubble forms—soap, heart, flower, star, cloud—in WebGL, reduced-motion, and WebGL fallback paths, including narrow screens.
- Use existing assets and dependencies only. Do not add hardware illustrations or describe GPS anchoring, AI sorting, or device linkage as implemented Demo capabilities.
- Keep screen-only product copy out of the printed pages.

## Review Focus

- **Long Chinese copy and A5 scaling:** page titles/body must stay readable and unclipped. Check the longest page at screen size and in print in Task 1 and Task 4.
- **Reduced motion enabled or changed while mounted:** all five shapes remain visible and stop moving. Check in Task 2.
- **WebGL2 unavailable or context lost:** the photo and five distinct translucent silhouettes remain visible. Check both fallback entry paths in Task 2.
- **Narrow phone widths and safe areas:** product copy, carousel, book, and controls do not overlap at 360–390 px. Check in Task 3.
- **Print and keyboard interaction:** print contains exactly ten A5 story pages without the homepage blurb; arrow-key page turning still works. Check in Task 4.

---

### Task 1: Edit the story and build ten distinct page collages

**Files:**
- Modify: `src/zine/content.js`
- Modify: `src/zine/page-art.js`
- Use: `public/zine/assets/paper-stock.png`, `public/zine/assets/field/`, and `public/zine/assets/stickers/`

**Interfaces:**
- Consumes: `ZINE_PAGES`, one ten-item array with `title`, optional `english`, `mainCopy`, `alt`, and `assetIds`.
- Produces: `createPages(): Promise<Array<{ src: HTMLCanvasElement, alt: string, text: string }>>`; keep this interface and the 1120 × 1587 canvas size unchanged.

- [x] **Step 1: Shorten the supplied page copy in `src/zine/content.js`.** Keep the order and cause-and-effect beats: notice street sounds, follow one, find a location bubble, touch and listen, collect it, leave a voice, and let someone later hear it. Keep the original's collected-sound titles as the listening-journal detail. Keep English on P01 (cover), P04 (first bubble), and P09 (later listener); omit it elsewhere. Do not add implementation claims.
- [x] **Step 2: Replace the shared bottom copy card in `src/zine/page-art.js` with page-specific composition layouts.** Use the existing field photos and stickers at varied crops, sizes, opacity, and angles. Add the existing paper-stock texture, restrained grain, rough torn edges, selective cut-letter title treatment, and hand-drawn route/sound marks. Include at least five visibly different composition families across the ten pages; do not let adjacent pages repeat the same title placement and photo arrangement.
- [x] **Step 3: Keep text and accessibility data in the rendered page.** `text` includes the visible title and body in reading order, `alt` describes the final image, and each page retains a readable high-contrast body size suitable for A5.
- [x] **Step 4: Build and inspect all ten rendered pages.** Run `npm run build`; expected: Vite build succeeds. Open the Zine, page through all ten pages, and inspect the longest body copy at desktop and phone widths; expected: no missing assets, clipped text, or return to a uniform card layout.

### Task 2: Restore five bubble forms in motion and fallback paths

**Files:**
- Modify: `src/zine/bubbles/physics.js`
- Modify: `src/zine/bubbles/renderer.js`
- Modify: `src/components/ZineBubbleBackground.jsx`
- Modify: `src/components/ZineBubbleBackground.css`

**Interfaces:**
- Consumes: existing `BubbleWorld(width, height, count)`, each bubble's `type`, and `ZineBubbleBackground({ hostRef, sceneIndex, autoPlay, onSceneChange })`.
- Produces: stable `type` values 0–4 in the existing order soap, heart, flower, star, cloud; no component prop or shader-uniform changes.

- [x] **Step 1: Assign bubble types cyclically in `BubbleWorld.setCount()`.** Use `type = index % 5` so both the five-bubble mobile world and eight-bubble desktop world always contain every form.
- [x] **Step 2: Keep all bubble records in the reduced-motion WebGL render.** Render their existing positions with deformation and continuous movement disabled; remove the current three-bubble cap. Preserve the regular moving path and existing shader's shape definitions.
- [x] **Step 3: Give the CSS fallback five matching silhouettes.** Assign each fallback node a shape index 0–4 and add heart, flower, star, and cloud silhouettes alongside the round form. Apply the translucent fill, rim, and highlights through each silhouette so its outline remains visible; remove reduced-motion hiding of shapes.
- [x] **Step 4: Verify every rendering path.** Run `npm run build`, then check normal motion, reduced motion, and WebGL unavailable/context-lost fallback. Expected: all five forms are visible at once on desktop and mobile; reduced motion is still; the fallback retains its photo background and shape differences. Checked desktop/mobile normal and reduced-motion rendering, forced WebGL context loss, resized the fallback world, and loaded once with WebGL unavailable.

### Task 3: Add the conceptual product introduction under the wordmark

**Files:**
- Modify: `src/components/ZineLanding.jsx`
- Modify: `src/components/ZineLanding.css`

**Interfaces:**
- Consumes: the current wordmark button, reader top bar, carousel, and responsive controls.
- Produces: a screen-only, accessible product-description element beneath the wordmark; no changes to `ZineLanding` props, buttons, or page content.

- [x] **Step 1: Add the approved introduction beneath the wordmark.** Use the design-draft copy beginning “MEMO · AI 声景漫游”; treat it as product-concept language, not a statement of current Demo capabilities.
- [x] **Step 2: Fit it into desktop and mobile header layouts.** Keep desktop text narrow and comfortably spaced; on phones show the product name and core experience in three or four lines. Reserve enough top space or reposition the carousel within the Zine header so the description does not cover the book or page controls. Do not restyle the top-right or bottom Liquid Glass buttons.
- [x] **Step 3: Check responsive and print visibility.** At 360, 390, 412, and desktop widths, expected: the copy stays legible and does not overlap the book, carousel, or controls. Use Print Preview; expected: the description is absent because printed output contains only the ten page canvases.

### Task 4: Update scope documentation and run the full Zine regression

**Files:**
- Modify: `docs/demo-scope.md`

**Interfaces:**
- Consumes: the implemented Zine behavior and current Demo-scope wording.
- Produces: an accurate Zine description covering the journey narrative, collage treatment, product-concept copy, and five-form reduced-motion/fallback behavior without overstating product capabilities.

- [x] **Step 1: Update the Zine entry in `docs/demo-scope.md`.** Replace the outdated uniform-card description; preserve the existing statements about Canvas page rendering, background photo carousel, visual-only bubble simulation, and actual Demo boundaries.
- [x] **Step 2: Run `npm run build`.** Expected: build succeeds without adding dependencies.
- [x] **Step 3: Run the manual regression.** Verify all ten pages, cover/next/previous controls, arrow-key page turns, scene selection and auto-advance, reduced motion, fallback bubbles, responsive layout, and ten-page A5 print output. Capture a desktop and phone Before/After image for PR evidence; expected: the Zine remains readable and usable and the implementation matches the approved collage direction.
- [x] **Step 4: Review the final diff.** Expected: changes stay within the four tasks' listed files and do not alter the main App, AR flow, SwiftUI, printing mechanics, or background scene system.

## Local review checkpoint

- `npm run build` succeeded; `git diff --check` reported no whitespace errors.
- Manually paged through all ten pages, verified next/previous controls and arrow keys after focusing LeafThrough's inner magazine region, and inspected long copy at desktop and 360–412 px widths.
- The final print preview contains ten portrait A5 pages; P10's final title glyph stays on its line. The product introduction is absent from print output.
- Verified scene selection and auto-advance, reduced-motion mode, all five bubble silhouettes, WebGL-unavailable startup, context-loss fallback, and mobile-to-desktop fallback resize/recovery.
- Captured final desktop, phone, and print-page screenshots in the local Codex visualization workspace.
- PR #11 was merged and closed before this implementation was published; publish a follow-up PR and leave it open.

### Task 5: Commit the Zine change and publish a follow-up PR

**Files:**
- Git commit on: `codex/memo-garden-design-fixes-20261120`
- PR #11 is already merged; create a new PR against `main` and leave it open.

- [ ] **Step 1: Create one focused implementation commit after the regression passes.** Preserve the existing HEAD and its design commit; do not reset or rewrite history.
- [ ] **Step 2: Push the branch and publish a follow-up PR.** Include the story/visual changes, scope boundaries, build and manual checks, and the desktop/phone screenshots. Keep the new PR open.
