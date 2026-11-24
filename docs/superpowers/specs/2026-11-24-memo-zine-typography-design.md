# MEMO Garden Zine, Sound Orbit, and Bubble Polish

## Goal

Unify the Zine's typography with the exhibition poster, restore the Sound Orbit's photographic hover card and wheel interaction, and give the existing desktop bubble field more presence.

## Direction

- Use LXGW Marker Gothic v1.012 for Chinese display glyphs and LXGW WenKai GB v1.530 for Chinese story glyphs.
- Use Special Elite for English subtitles and small editorial labels. QWERTYpe remains excluded from public assets because its web and repository redistribution rights are unconfirmed.
- Extend the cover's character-by-character cut-paper treatment to every Zine title, English line, story paragraph, and hand-marked note. Keep paragraph groupings legible through smaller, closely spaced paper tiles and per-page wrapping.
- Keep the ten real photos, page order, backgrounds, story copy, and Zine interactions. Retune type size, wrapping, and line spacing only as required by the selected faces and glyph tiles.
- Leave Typetys unused; the poster and requested hierarchy already have a clear Chinese/English pair, and a second distressed Latin face would add unnecessary competition.
- Load the selected faces before drawing the Canvas pages so screen and print output use the same typography.
- Obtain both Chinese fonts from their official upstream GitHub releases and include their OFL license text when redistributing them.

## Interaction Polish From Review

- Restore the photographic Sound Orbit hover card with a fade transition and update its thumbnail and title with the hovered, focused, or committed scene.
- Allow wheel or trackpad input over the Sound Orbit to rotate the photo ring and advance its preview. Preserve the slow idle rotation, 300 ms ASMR hover delay, click-to-lock sequence, existing audio behavior, and Liquid Glass controls.
- Increase desktop bubbles from ten to fourteen and vary their diameters slightly more. Preserve all current bubble shapes, the five mobile bubbles, scenes, stars, fog, and central Zine. Expand only the existing shader capacity required for the additional desktop bubbles.

## Scope

Change only Zine text rendering, Sound Orbit hover/wheel interaction, and desktop bubble count/radius presentation. Keep all ten photos, story copy, page order, Liquid Glass buttons, audio sequence, page turning, and print behavior intact. Do not change the main app, brand, routes, AR flow, or backend.

## Font distribution

LXGW Marker Gothic v1.012 and LXGW WenKai GB v1.530 are open-source Chinese fonts released under SIL OFL 1.1; their upstream license permits embedding and redistribution with the license included. To limit download weight, the web-delivered subsets contain the characters in the ten current Zine pages and their drawn notes; regenerate them when that text changes. The WenKai GB license's additional permission for its reserved name applies here because the subset is used only as a web font and is not made available as an installable desktop font. QWERTYpe was supplied as a TTF without its license document and is excluded from the public build. Special Elite is taken from Google Fonts under Apache 2.0.

## Review

Provide a local preview for all ten pages. Check glyph rendering, wrapping, clipping, contrast, card fade, wheel rotation, and desktop bubble density. Preserve all source text and imagery. Build and inspect the changed areas, then push the update to the existing GitHub PR without merging.
