# MEMO Garden Zine Paper-Cut Typography Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the approved ten-page Zine with more legible editorial type, original tactile collage material, and a responsive WebGL fallback fix.

**Architecture:** Keep the existing Canvas renderer and use the generated transparent paper-scrap sheet as a source atlas. Render the real Chinese copy with local system fonts; vary glyph face, paper crop, tilt, and ink registration without rasterizing the text.

**Tech Stack:** Existing React, Canvas 2D, CSS, Vite, and built-in image generation; no new package.

**Spec:** `docs/superpowers/specs/2026-11-23-memo-zine-paper-cut-typography-refinement-design.md`

## Global Constraints

- Keep the ten-page story and 1120 × 1587 Canvas size.
- Keep the change inside the Zine and its Demo-scope documentation.
- Do not copy Pinterest art or include generated text.
- Keep body text high contrast and readable in screen and A5 output.
- Preserve the existing controls, print mechanics, route, backgrounds, and bubble scene behavior.

## Review Focus

- Chinese glyph fallback on Windows and fallback platforms; inspect real rendered output.
- Text wrapping and crop collisions after changing font metrics; inspect all ten pages.
- Resize from desktop to phone while CSS bubble fallback is active; hide nodes beyond the five-item mobile world.
- Reduced-motion and print behavior; verify five forms remain and output stays ten A5 pages.

---

### Task 1: Add the original paper atlas and refine Canvas typography

**Files:**
- Create: `public/zine/assets/collage/torn-paper-sheet-v1.png`
- Modify: `src/zine/page-art.js`
- Modify: `docs/demo-scope.md` only if the visual-scope wording needs a precise update

**Interfaces:**
- `createPages()` continues returning ten `{ src, alt, text }` items.
- The paper atlas is loaded with the existing page assets and sampled by source rectangle; exact story text remains Canvas text.

- [x] Copy the generated transparent six-scrap image into the Zine asset directory and verify alpha transparency.
- [x] Replace the KaiTi-first title/body families with a clear local editorial type stack and align title wrapping to its actual font metrics.
- [x] Update cut-letter titles to use varied weights, limited alternate faces, crop tiles, small rotation/spacing differences, and restrained ink misregistration; avoid uniform square labels.
- [x] Use paper atlas crops and hand-drawn marks on selected pages only; preserve varied composition and quiet areas.
- [x] Regenerate all page canvases and inspect ten pages at screen and A5 scale; expected: legible, unclipped Chinese copy and distinct title treatment. Widened P10's title frame after print inspection revealed an orphaned final glyph; the final ten-page PDF shows the full heading on one line.

### Task 2: Fix and verify fallback bubble layout during resize

**Files:**
- Modify: `src/components/ZineBubbleBackground.jsx`

**Interfaces:**
- Keep the five-item mobile and eight-item desktop world counts and current five shape classes.
- In fallback rendering, hide/reset nodes whose index has no corresponding bubble after a resize.

- [x] Hide fallback nodes past `world.bubbles.length` and restore them when the world grows again.
- [x] Simulate WebGL context loss on a phone viewport; expected: photo remains, five distinct shapes are visible, and unused nodes are hidden.
- [x] Simulate unavailable WebGL on initial load and verify the same fallback path.
- [x] Check normal and reduced-motion rendering at desktop and phone widths.

### Task 3: Run final review and publish a follow-up PR

**Files:**
- Review all modified Zine files and docs; no unrelated scope changes.

- [x] Run `npm run build` and `git diff --check`.
- [x] Manually verify all ten pages, cover/next/previous, arrow keys, scene selection/autoplay, 360/390/412px layout, reduced motion, WebGL fallback, and ten A5 print pages.
- [x] Capture final cover, spread, and phone screenshots for PR evidence.
- [x] Create a focused commit preserving the existing design HEAD; push the branch and open a follow-up PR without merging. Commit `1e70e47` preserves `24a2d63`; PR #11 is already merged and follow-up PR #12 is open.
