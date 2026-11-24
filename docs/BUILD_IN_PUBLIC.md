# Build in Public — Sound Orbit

2026-11-24 · MEMO Garden Zine

The upper-left scene picker is now a slow-turning photo record with ten original photo slices and a fine SVG tonearm. Hover pauses the record, enlarges the selected image, and crossfades the existing background. Click locks the scene with a lift, seek, and drop motion.

Tap to enable sound. Ten synthesized, scene-keyed textures preview after a 300 ms hover. Scene changes crossfade over 800 ms; mute fades out and releases the audio nodes.

The wordmark, product copy, ten photo files, full-screen bubbles, stars, forest, mist, center Zine, and existing top and bottom Liquid Glass buttons remain in place. The Zine background canvas stays mounted through scene changes.

## Verification

- `npm run build` succeeds. Vite retains the existing 1.22 MB main-chunk advisory; Sound Orbit adds no dependency.
- Manual browser pass at 1440×900, 768×900, 390×844, and 375×812.
- Verified hover preview timing, background restore, click sequence, rapid scene changes with at most two active audio sources, mute and release, keyboard selection, touch selection, and reduced-motion mode.
- No browser console errors during the interaction pass. Idle JS heap measured 53.5→54.1 MB over three seconds on desktop.

## Preview

Local preview: http://127.0.0.1:4175/

The local preview and evidence were reviewed. [PR #12](https://github.com/wongolivia336-a11y/ai-builer-context/pull/12) is open for review.

## Zine atmosphere and story

2026-11-24 · MEMO Garden Zine

The desktop reading scene now has ten bubbles with a broader mix of sizes and a slow, subtle breathing rhythm. The CSS fallback keeps the same five silhouettes and size rhythm; narrow screens use five bubbles, and reduced-motion mode keeps them still.

The ten printed pages use existing city, park, river, and market photographs as softly blurred underlays beneath warm paper tint and the original collage pieces. The Chinese body copy follows the walk from first listening through leaving a voice for someone to find, with a more reflective cadence inspired by the supplied essay. Existing titles, the ten Sound Orbit photos, stickers, page-turn controls, print action, and Liquid Glass buttons remain in place.

## Verification

- `npm run build` succeeds; no dependencies or image assets were added or replaced. Vite reports the existing main bundle above 500 kB.
- Browser review at 1440×900, 768×900, 390×844, and 375×812. The Zine controls remain within the viewport and the page art renders at all sizes.
- Verified ten desktop bubbles, five mobile bubbles, five distinct fallback shapes, and breakpoint resizing from ten to five with mobile radii capped at 53 px. Reduced-motion stops the bubble animation.
- The ten page images load at 1120×1587. All ten layouts were reviewed; the longer P03 and P09 copy stays within its torn paper panels.
- Verified page turn by button and keyboard, reduced-motion, WebGL fallback, and print mode with all ten pages loaded. No browser runtime exceptions or network failures.
- Performance snapshot: the automated Edge session used Microsoft Basic Render Driver software rendering. It measured 8.1 MB JS heap and 72 ms average frame intervals over 120 samples; that frame timing describes the software-rendered review environment.
- The existing local preview remains available at http://127.0.0.1:4175/.

Local visual evidence for this round: desktop and mobile screenshots, a ten-page contact sheet, and a short page-turn recording.
