# MEMO Garden Zine Scrapbook Layout Implementation Plan

## User feedback iteration — 2026-11-24

- The user reports that tracks 05 (pasture sheep), 06 (clover leaves), 08 (misty forest), 09 (pond stream), and 10 (orchard birds) are inaudible; repair these recordings before updating the existing PR #13.
- The user asks to reduce oversized blank areas across the Zine, enlarge the circular clock crops so neighboring photos nearly meet, layer more small and large photo crops over softened landscape underlays, and add a few transparent hand-drawn PNG ornaments.
- Keep the ten Sound Orbit photographs byte-for-byte unchanged, retain readable story copy, bubble background, stars, forest, mist, Liquid Glass buttons, routes, and print/page-turn behavior.
- This iteration is authorized for GitHub publication after the sound repair, Zine refinement, and regression checks are complete; leave PR #13 open and unmerged.

> **Status: approved by the user on 2026-11-24.** The user authorized updating PR #13 after this audio and layout correction round passes its checks. Keep audio review state as `local-preview` until the user confirms listening.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the ten-page Zine with user-supplied collage photos and varied scrapbook layouts while keeping the existing story, Sound Orbit photos, and interactions intact.

**Architecture:** Keep the existing 1120×1587 Canvas renderer and page-turn UI. Add a small scene-independent photo catalog for the supplied collage assets, describe feature layouts in the existing per-page layout table, and render those features through focused Canvas helpers. Increase the Zine brand block on desktop while leaving mobile header sizing and all buttons intact.

**Tech Stack:** React, JavaScript modules, Canvas 2D, CSS, Node.js built-in test runner, FFmpeg for local image-size conversion.

**Spec:** `docs/superpowers/specs/2026-11-24-memo-zine-scrapbook-layout-design.md`

## Global Constraints

- Preserve the current ten-page story, page count, page-turn interaction, and print behavior.
- Keep all ten existing Sound Orbit photo files and their scene order unchanged.
- Use user-provided photographs as additional Zine collage assets; use reference spreads only as layout references.
- Keep the existing white-paper, torn-edge, photocopy-grain, cut-letter, and open-body-copy visual language.
- Use the circular photo clock on one or two pages and the contact sheet on another page; do not make either a repeated template.
- Preserve the Sound Orbit photo card's opacity fade, slight upward movement, and translucent backing.
- Increase the desktop Zine wordmark and product-intro size; keep compact/mobile rules so the header does not collide with top controls or the reading area.
- Do not change the top or bottom Liquid Glass buttons, bubble field, stars, forest, mist, routes, AR, SwiftUI, backend, or product claims.
- Add no runtime dependencies. The user's latest feedback authorizes publishing this correction round after the five identified audio tracks and the Zine layout are corrected and regression checks pass.

## Review Focus

- A supplied image is absent, unexpectedly oriented, or too large: the asset check rejects the broken path and the Canvas renderer retains its existing error handling.
- A circular crop or pointer overlaps the story text: the page preview keeps the text readable and the drawing stays within its feature bounds.
- A long title or paragraph exceeds its panel at A5 scale: the ten-page render review catches overflow before print approval.
- A compact screen narrows the reader header: mobile styles retain their current compact wordmark, intro, and top-action separation.
- A new Zine image is accidentally used by Sound Orbit: compare all ten existing orbit photo paths and file hashes before and after the change.

---

### Task 1: Add and validate the supplied collage photographs

**Files:**
- Create: `public/zine/assets/scrapbook/` with selected optimized copies of supplied city, park, meadow, animal, orchard, and water photographs.
- Create: `src/zine/scrapbook-assets.js`.
- Create: `scripts/verify-zine-collage-assets.mjs`.
- Create: `scripts/verify-zine-collage-assets.test.mjs`.
- Modify: `package.json`.

**Interfaces:**
- `ZINE_COLLAGE_ASSETS` maps a stable asset key to `{ src, alt }`, where `src` is a local `/zine/assets/scrapbook/` path.
- `validateZineCollageAssets({ assets, referencedAssetKeys, publicDirectory })` validates catalog paths, unique keys, referenced-key coverage, and file size.

- [ ] **Step 1: Write the failing asset-catalog tests**

  Assert the catalog has at least eight unique entries, all source paths are local scrapbook paths, each file exists, and no file exceeds 600 KB. Also reject path traversal, duplicate keys, and an unknown referenced asset key.

- [ ] **Step 2: Run the tests to verify the new catalog is absent**

  Run: `node --test scripts/verify-zine-collage-assets.test.mjs`

  Expected: FAIL because `src/zine/scrapbook-assets.js` does not exist.

- [ ] **Step 3: Copy and optimize selected user-supplied photos**

  Keep separate copies for the Zine. Use FFmpeg to auto-orient and export WebP at quality 84 with a 1400 px maximum long edge. Include at least these categories: city street, city at dusk, park trees, riverside park, lambs, cow, geese, orchard apples, and flower pond. Do not copy the notebook or collage reference screenshots into the Zine pages.

  Use these supplied media as the first catalog set: `codex-clipboard-216dd1c7-6b86-470a-91d2-6d2364189afd.png` (city at night), `codex-clipboard-7c4db6c3-6718-431a-9431-2c12eea676ae.png` (city at dusk), `codex-clipboard-76ef31bb-583d-4b45-b6a4-c961abb1889c.png` (city crossing), `codex-clipboard-ed0e1c4b-534f-4cfa-87e5-baf03d4d1263.png` (tree-lined plaza), `codex-clipboard-48f29ced-a440-40ce-8d59-97ef012ad682.png` (riverside park), `codex-clipboard-270e5056-9e1a-4639-acf3-1098c5cde6f8.png` (lambs), `codex-clipboard-2cec7339-a1de-4db8-841f-eff709219439.png` (cow meadow), `codex-clipboard-54a49e13-fce6-409d-b96f-35e775b5c526.png` (geese), `codex-clipboard-28ee69ba-2316-40cd-84e9-f93f73983a65.png` (apples), `codex-clipboard-052a43b4-f4c7-4e22-9f1e-95adcb195847.png` (flower pond), and `codex-clipboard-dd088825-2d19-49d3-b5ab-5c267f735329.png` (market produce). The notebook and layout-spread images remain visual references only.

- [ ] **Step 4: Implement the photo catalog and file checker**

  Add readable alt text in `src/zine/scrapbook-assets.js`; export `validateZineCollageAssets` from the checker for the Node tests. Reject path traversal and files outside the scrapbook asset directory.

- [ ] **Step 5: Add and run the asset check command**

  Add `check:zine-collage-assets` and run `node --test scripts/verify-zine-collage-assets.test.mjs`.

  Expected: all asset tests pass with the selected image files in place.

### Task 2: Add scrapbook page compositions to the Canvas renderer

**Files:**
- Modify: `src/zine/page-art.js`.
- Modify: `src/zine/scrapbook-assets.js` only if page-specific alt text or IDs need refinement.
- Test: `scripts/verify-zine-collage-assets.test.mjs`.

**Interfaces:**
- `PAGE_LAYOUTS` is exported from `src/zine/page-art.js`; `PAGE_LAYOUTS[index].feature` is either absent or a data object with a `type` of `photo-clock`, `contact-sheet`, `paired-time`, or `note-stack`.
- `drawScrapbookFeature(context, feature, images, paperScraps, seed)` renders the feature with the existing torn-paper, photo, and collage-letter helpers.
- `createPages()` loads referenced catalog assets once, deduplicated by asset key, and passes them to `drawPage()`.

- [ ] **Step 1: Add validation for referenced collage asset IDs**

  Extend the asset test to assert ten page layouts, `photo-clock` at index 2, `contact-sheet` at index 5, and `paired-time` at index 7. Pass their asset keys to `validateZineCollageAssets` and assert every reference exists in `ZINE_COLLAGE_ASSETS`.

- [ ] **Step 2: Run the test to verify the layout references are missing**

  Run: `node --test scripts/verify-zine-collage-assets.test.mjs`

  Expected: FAIL because the named feature layouts and their asset references do not exist yet.

- [ ] **Step 3: Add per-page collage features and varied paper treatments**

  Keep the story copy unchanged. Assign the photo clock to page 3, a contact sheet to page 6, paired-time crops to page 8, and use smaller note-stack or photo-strip details on selected pages. Vary body backing between the existing torn patch, a ruled note strip, a narrow caption scrap, and an open margin while maintaining contrast.

- [ ] **Step 4: Implement `drawScrapbookFeature` and load the new assets**

  The photo clock uses six to eight selected circular crops around one hand-drawn pointer. The contact sheet uses four to six small photo scraps with irregular spacing and paper/tape tabs. Keep feature bounds clear of title and body bounds; draw annotations behind the body copy.

- [ ] **Step 5: Run the asset test and build**

  Run: `node --test scripts/verify-zine-collage-assets.test.mjs` and `npm run build`.

  Expected: the asset checks pass and Vite builds all ten Canvas pages without missing-image imports.

### Task 3: Increase the desktop Zine header scale and preserve the orbit card fade

**Files:**
- Modify: `src/components/ZineLanding.css`.
- Inspect only: `src/components/SoundOrbit.css`.

**Interfaces:**
- Desktop `.zine-brand` width becomes 208 px; `.zine-brand-block` and `.zine-product-intro` become 318 px wide.
- Desktop product kicker and copy use 11 px type with the existing short copy and a 1.5 line height.
- Existing mobile overrides remain in effect. Existing Sound Orbit card `opacity`, `visibility`, translate, and transition declarations remain unchanged.

- [ ] **Step 1: Verify current card and header transition rules**

  Confirm the Sound Orbit card still uses its fade and slight rise, and record the current mobile header overrides before adjusting the desktop base rules.

- [ ] **Step 2: Update desktop header dimensions in `ZineLanding.css`**

  Apply the values in the Interfaces block. Leave the mobile and short-landscape compact rules in place; adjust only if the desktop intro exceeds the 132 px header row during browser review.

- [ ] **Step 3: Run `npm run build`**

  Expected: Vite builds successfully with no new dependencies.

### Task 4: Review the ten pages, responsive layout, and publication preview

**Files:**
- Modify: `docs/BUILD_IN_PUBLIC.md` with this round's final evidence after preview approval.
- Create: local screenshots/contact sheet in the existing evidence workspace if browser capture is available.

**Interfaces:**
- Local preview remains available at `http://127.0.0.1:4177/`.
- The Zine remains ten pages at 1120×1587 Canvas pixels and keeps the existing page-change callback, print view, and scene picker.

- [ ] **Step 1: Run all asset checks and the production build**

  Run: `npm run check:zine-collage-assets` and `npm run build`.

  Expected: all supplied photo paths and sizes validate; Vite exits successfully.

- [ ] **Step 2: Inspect every page at desktop and mobile sizes**

  Review all ten pages at 1440×900 and 390×844, plus the 768×900 tablet width. Confirm varied page compositions, title/body order, no clipped text, readable A5 print, no collision with Sound Orbit or top controls, and unchanged ten-photo orbit ring.

- [ ] **Step 3: Check retained interactions and visual details**

  Manually verify page turn by mouse and keyboard, reduced-motion behavior, WebGL fallback, print preview, the photo-card fade, and the audio scene/photo mapping. Check the ten original orbit image hashes against the saved baseline.

- [ ] **Step 4: Review the local preview and capture the finished spreads**

  Provide the updated local preview and selected page screenshots. Keep audio marked `local-preview` until the user completes the listening pass.

- [ ] **Step 5: Publish after the requested corrections and checks pass**

  Create a reversible commit, push the current branch, update PR #13 with the Zine/audio summary and verification evidence, and leave the PR open without merging.
