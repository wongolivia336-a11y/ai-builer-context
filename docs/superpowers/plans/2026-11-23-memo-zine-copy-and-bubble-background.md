# MEMO Garden Zine Copy and Bubble Background Implementation Plan

> **For agentic workers:** Execute natively in the current feature branch, task by task. Keep the work scoped to `memo-garden`.

**Goal:** Refresh the Zine story pages as compact white-paper collages and add a ten-photo screensaver-style bubble carousel to the landing page.

**Architecture:** Keep LeafThrough as the sole page-turning engine. Separate story copy, canvas page artwork, the local photo scene list, and the background simulation; adapt the zero-dependency 2D physics and WebGL2 shader behind the existing reader.

**Tech Stack:** Existing React 19 + Vite + LeafThrough, Canvas 2D for printable page artwork, WebGL2 for background refraction, browser RAF and pointer events for bubble motion.

**Spec:** `docs/superpowers/specs/2026-11-23-memo-zine-copy-and-bubble-background-design.md`

## Global Constraints

- Do not change the app outside the independent `memo-garden` repository.
- Do not add a physics runtime dependency.
- Keep the reader fixed to the viewport and retain page-turn-only navigation.
- Do not describe the visual approximation as fluid-accurate.
- Use only title, English subtitle, and main story copy on each page; omit editorial notes, microcopy, and folios.
- Use pure-white compact paper panels and retain original image proportions in the collage.
- Exclude hardware concepts and non-round decorative bubble shapes from the visible art.
- Use all ten supplied photographs as local carousel scenes.
- Respect reduced motion and destroy WebGL resources and listeners when the landing unmounts.
- Run `npm run build` and inspect a local preview; do not add or run a test suite.

## Review Focus

- Long Chinese body copy can be clipped or become too small: wrap each paragraph into readable lines in a compact white torn panel and inspect the longest page.
- A background canvas must not capture page-turn, print, or button input: only grab a pointer when it hits a bubble and the reader controls are not the event target.
- Missing WebGL2 or shader compilation failure must leave a visible color scene and nonfatal fallback.
- Rapid scene transitions, manual carousel selection, and unmount during image loading must not retain animation frames, event listeners, or WebGL textures.
- Reduced-motion and hidden-tab states must stop automatic cycling and continuous bubble updates.

---

### Task 1: Move Zine copy and asset mapping into data

**Files:**
- Create: `src/zine/content.js`
- Create: `public/zine/assets/stickers/*.png` (8 referenced RGBA assets)
- Modify: `src/zine/page-art.js`
- Modify: `src/components/ZineLanding.jsx`

**Interfaces:**
- `ZINE_PAGES[index]` exposes `title`, `english`, `mainCopy`, `alt`, and visible `assetIds`.
- `createPages()` returns ten `{ src, alt, text }` records in page order.

- [x] Keep the supplied ten-page title, English line, and story copy; remove annotations, microcopy, and notes from visible and accessible page text.
- [x] Keep only the eight referenced transparent sticker assets; omit hardware and unused decorative bubble concepts from the public bundle.
- [x] Use one compact pure-white torn-paper panel and one or two naturally placed cutouts per page; preserve each cutout's source aspect ratio.
- [x] Keep the current A5 sheet dimensions and expose only the revised visible copy through the accessible page text.
- [ ] Inspect the rendered ten pages, including the longest paragraph, for fit and legibility.

### Task 2: Add the ten-scene bubble background

**Files:**
- Create: `src/zine/bubbles/physics.js`
- Create: `src/zine/bubbles/shaders.js`
- Create: `src/zine/bubbles/renderer.js`
- Create: `src/zine/bubble-scenes.js`
- Create: `src/components/ZineBubbleBackground.jsx`
- Create: `src/components/ZineBubbleBackground.css`

**Interfaces:**
- `ZineBubbleBackground({ hostRef, sceneIndex, autoPlay, onSceneChange })` mounts one canvas and owns the RAF, physics world, renderer, and input listeners.
- Each scene provides `id`, `name`, `base`, `accent`, and a local photograph `image` URL.

- [x] Adapt the physics model with bounded 5/8 circular bubbles, buoyant drift, soft wall and pair collisions, pointer push, and drag/release impulse.
- [x] Adapt the shader and renderer to crossfade the ten local photo textures and refract the active scene inside each bubble.
- [x] Cycle scenes every 10 seconds with a 1.25-second crossfade; provide manual previous/next and thumbnail selection at the upper left, pausing auto advance after manual selection.
- [x] Stop auto cycling and physics updates for reduced motion or hidden tabs; keep the photo visible with CSS when WebGL2 is unavailable.
- [ ] Verify bubbles collide with all viewport edges and keep page-turn, print, and entry controls responsive.

### Task 3: Integrate, document, and verify

**Files:**
- Modify: `src/components/ZineLanding.jsx`
- Modify: `src/components/ZineLanding.css`
- Modify: `docs/demo-scope.md`

- [x] Replace the static landing image with the bubble background component and preserve the Zine reader, print sheets, and product entry action.
- [x] Keep the viewport overflow hidden and retain the existing responsive book layout.
- [x] Update the demo-scope note to identify the supplied photo set and describe bubbles as a visual approximation.
- [ ] Build passes and the local preview returns HTTP 200; inspect desktop/mobile rendering, print-page count, and page-turn controls.

## Execution note

The final build passes. The dev preview at `http://127.0.0.1:4175/` returns HTTP 200, and an asset audit finds ten scenes, ten pages, no missing mapped images, and no hardware concepts in the visible map. Automated Edge screenshots could not be captured because the local Edge GPU process exits during startup, so manual visual and interaction inspection remains open.
