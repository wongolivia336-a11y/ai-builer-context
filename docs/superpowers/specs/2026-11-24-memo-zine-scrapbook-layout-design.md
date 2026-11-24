# MEMO Garden Zine — scrapbook layout refinement

> **Status: approved by the user on 2026-11-24.** This addendum applies the newly supplied notebook and collage references to the existing ten-page Zine. It does not change the previously approved story text or the ten Sound Orbit photos.

## Intent

Make the ten-page Zine feel like a collected, handled notebook: fuller and more visually varied, while keeping its story easy to follow and its body copy comfortable to read. The supplied references show loose-but-compact photo placement, handwritten notes, torn paper, transparent botanical layers, and occasional circular photo arrangements.

## What changes

- Use the newly supplied city, park, garden, food, animal, and landscape photographs as additional Zine collage material. Keep the ten existing Sound Orbit photos byte-for-byte unchanged.
- Use the notebook spreads and editorial collage images as layout references. Reuse the Zine's existing transparent botanical sticker where it fits the page.
- Keep the existing ten-page story and product-concept copy. Recompose photos and visual marks around it; do not introduce new product capabilities.
- Keep the Sound Orbit hover photo card's current soft opacity fade and slight rise. Make the Zine header wordmark and short product introduction larger on desktop, while keeping them clear of the orbit and top controls.

## Goals

1. Make each page feel assembled from photographs, notes, clippings, and pencil marks instead of repeating one centered paper card.
2. Give the full book a consistent hand-made language: natural white paper, scuffed photocopy grain, rough edges, restrained tape, transparent overlays, and hand-drawn lines.
3. Vary the page rhythm. Use a clock-like ring of small photos with a drawn pointer on one or two pages, photo contact sheets on another, and more open photo-led pages between them.
4. Keep the title first, the story copy second, and decorative notes third. Preserve legibility at the existing desktop, mobile, and A5 print sizes.
5. Make the Zine header's title and introduction easier to see on desktop without covering the Sound Orbit or changing the buttons.

## Non-goals and boundaries

- Do not change the Zine story copy, page count, page-turn interaction, print behavior, route, or reading flow.
- Do not replace or edit the ten Sound Orbit scene photos.
- Do not change the bubble field, stars, forest, mist, Liquid Glass buttons, main App, AR, SwiftUI, device illustrations, or backend.
- Do not add GPS, automatic AI sorting, hardware connection, or recording upload claims to the existing demo.
- Do not use every supplied photo if it does not fit a page. Select and crop images to serve the story; retain originals and store any prepared copies as separate assets.

## Approaches considered

### A. Scrapbook notebook with selected feature layouts — chosen

Use hand-assembled collage as the page-to-page foundation. Give two or three pages distinctive structures, such as the requested circular photo clock and a compact contact sheet, and let quieter pages breathe. This matches the new references while preserving a coherent visual thread and text legibility.

### B. Clock and ring layouts throughout

Repeat circular photo clusters and drawn pointers on most pages. This would make the sound/time idea explicit, but would turn the book into a visual template and compete with long copy.

### C. City route-map layouts throughout

Connect photos with paths and location notes across the book. This reinforces the walk, but the repeated map device would leave less room for the looser notebook and image-pairing references.

The selected approach is A. The circular clock and route lines become occasional page devices rather than a repeated frame.

## Page rhythm proposal

The exact crop and placement will be tuned in the browser, but the ten pages should alternate between these roles:

| Page | Layout role | Visual elements |
| --- | --- | --- |
| 1 | Cover | Existing cover story, larger cut-paper title, one dominant photograph, a few translucent scraps |
| 2 | Listening diary | Date/time note, city photo strips, a drawn sound line |
| 3 | Photo clock | Several small circular or clipped photos around a hand-drawn pointer, with the story copy in an open paper margin |
| 4 | Found fragment | One strong image, a small botanical transparent layer, and a short handwritten observation |
| 5 | Catching a sound | One large photo with a bubble overlay, small tape tabs, and a compact recorded-moment label |
| 6 | Pocket index | Contact-sheet or label-card arrangement that makes a collection visible |
| 7 | Voice note | An open, quieter page with a handwritten line and one small image |
| 8 | Time passing | Paired crops of the same or related scene with a pencil time mark |
| 9 | Someone else arrives | Two overlapping image windows and one compact caption-like note |
| 10 | Invitation | Sparse closing composition that returns to the cover's bubble and leaves room around the final question |

The supplied urban and park photos can anchor the walk; garden, animal, food, and landscape photos can appear as collected sound fragments or small contact-sheet observations where they support the page. The existing approved story remains the reading order.

## Desktop header and Sound Orbit card

- Increase the Zine header wordmark and product-intro type on desktop by a modest step, and widen the text block enough to keep the introduction to a few short lines.
- Keep the mobile header compact so it does not collide with the top actions or reading surface.
- Preserve the Sound Orbit image card's opacity fade, short upward movement, rounded image, and dark translucent backing. Do not alter the ten images or ring behavior as part of the Zine collage work.

## Implementation notes

- Main touch points are `src/zine/page-art.js`, Zine image loading/assets, and `src/components/ZineLanding.css`.
- Keep the Canvas page size and existing font setup. Draw the new crops, torn edges, overlays, and annotations into the current page renderer rather than changing page interaction.
- Copy selected supplied photos into a clearly named Zine asset folder; leave the originals outside the app and avoid overwriting current photos. The notebook and editorial-spread screenshots are layout references, not page images.
- Continue using the currently licensed open fonts and the approved collage title treatment.

## Acceptance checks

1. Ten pages read as one story, and their layouts visibly alternate between collage, image-led, clock/contact-sheet, and quiet handwritten compositions.
2. Every body paragraph remains readable at desktop, narrow mobile, and A5 print sizes.
3. The circular photo clock is a feature on only one or two pages and includes a clearly drawn pointer.
4. Supplied images are integrated as additional collage assets; all ten original Sound Orbit photo paths and file hashes stay unchanged.
5. The header title and introduction are visibly larger on desktop and do not overlap Sound Orbit or top buttons at the supported widths.
6. The Sound Orbit card keeps its gentle fade-in/fade-out behavior.
7. Page-turn, keyboard, print, responsive, reduced-motion, and WebGL fallback behavior remain intact.
8. No copy implies GPS, live AI organization, or connected hardware is implemented in the current demo.

## Follow-up refinement

The user's review asked for less unused paper and closer, more varied image groupings. The applied pass expands the clock crops to 204 px and clips them to the photo edge so neighboring circles meet with a slight overlap, tightens the contact sheet with mixed crop sizes, adds detail-photo overlays to the paired-time spread, and increases the visibility of the blurred landscape underlay. Three optimized transparent hand-drawn PNGs (ginkgo, sparrow, and rain marks) now appear as small collage accents. The ten page texts and the ten Sound Orbit images remain unchanged.
