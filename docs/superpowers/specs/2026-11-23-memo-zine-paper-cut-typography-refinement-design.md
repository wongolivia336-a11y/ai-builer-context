# MEMO Garden Zine Paper-Cut Typography Refinement

## Intent

Keep the approved ten-page story and collage direction, while making the printed Zine feel more authored and tactile. The current renderer uses KaiTi for both headings and body copy, and repeats evenly sized cut-letter tiles; the result makes the type feel weak and the collage too tidy.

## Goals

- Give page titles stronger editorial contrast and more deliberate Chinese letterforms.
- Use irregular, locally generated paper scraps as original print-material assets.
- Make photocopy texture, torn edges, and hand-drawn annotations feel physical while preserving readable body text and clear page rhythm.
- Fix the WebGL fallback's stale bubble nodes when the viewport changes from desktop to mobile.
- Preserve the approved story, ten-page sequence, paper dimensions, print output, Liquid Glass controls, and existing Zine interaction model.

## Approaches

- **CSS-only roughness:** Keep the existing type and simulate all texture with Canvas paths. It is fast, but retains the identical glyph faces and cannot provide the fiber detail the reader asked for.
- **Reuse Pinterest images:** Would make the collage literal, but would copy third-party work into a shipped product and would not fit the project's rights boundary.
- **Original paper textures plus a controlled type system (selected):** Use Pinterest as visual research only, create an original transparent paper-scrap sheet, draw all actual story text in Canvas using installed editorial typefaces, and vary crop, weight, angle, ink, and spacing within a consistent title system. This gives the print pages a handmade feel without compromising text accuracy or readability.

## Visual Direction

Use mixed cut-paper letters, irregular torn scraps, restrained photocopy grain, and a small amount of misregistered ink. Keep a clear title hierarchy and quiet body copy; reserve the strongest collage treatment for a few feature pages, then let neighboring pages breathe. Do not use hardware illustrations, externally copied Pins, or AI-generated text.

## Constraints

- Keep the existing 1120 × 1587 Canvas page size and current ten-page copy.
- Add no runtime dependency and no external font or image hotlink.
- Keep generated material inside `public/zine/assets/collage/` and use it only in the Zine Canvas.
- Keep concept copy labeled as a concept and preserve current Demo capability boundaries.
- Do not alter the main App, AR, SwiftUI, backend, route, print mechanics, page-turn mechanics, or scene system.

## Asset

Create one original transparent contact sheet of six torn paper scraps with subtle fiber and photocopy grain. Load it once in `createPages()` and crop its six cells for selected title and annotation layers. Keep the generated image free of text so all copy stays exact and accessible.

Pinterest research references: [a collage-lettering idea board](https://www.pinterest.com/jlunn2502/ransom-note-ideas/) and [Pinterest's creative-project guidance](https://guide.pinterest.com/diy-and-crafts/creative-project-idea/). These informed the handmade cut-letter/tactile-paper direction and the need to keep each page's message readable. Shipped paper artwork is original and generated for this project.

## Verification

Run `npm run build`, inspect all ten pages on desktop and mobile, verify keyboard and button navigation, check five bubble shapes in normal/reduced/fallback modes, and generate print output to confirm ten A5 pages with no product blurb.
