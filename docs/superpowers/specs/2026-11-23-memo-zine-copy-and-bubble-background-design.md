# MEMO Garden Zine Copy and Bubble Background Design

## Intent

Refresh the ten printed Zine pages with the supplied story, place a few transparent cutouts into a looser collage, and make the landing background feel like a playful bubble screensaver using the ten photographs supplied with the handoff.

## Goals

- Use only each page's title, English line, and story copy; omit microcopy, folios, explanatory labels, and editorial notes from the page and accessible reading text.
- Preserve the existing LeafThrough page turning and the current print action.
- Keep each page grounded in a full-bleed photograph, with one compact pure-white torn-paper panel and one or two supplied cutouts that keep their original proportions.
- Add a ten-photo background carousel with gentle crossfades, a compact selector at the upper left, manual scene selection, and automatic advance every 10 seconds.
- Animate 5 circular soap bubbles on narrow screens and 8 on larger screens; support buoyant drift, soft collisions, edge bounce, pointer push, and drag/release.
- Keep all new behavior scoped to the Zine landing, with no new physics dependency.
- Respect reduced motion, pause offscreen animation, release animation and WebGL resources on unmount, and provide a graceful rendering fallback.

## Non-goals

- This does not claim fluid-accurate simulation or spectral thin-film optics; the supplied model and shader are visual approximations.
- This does not add audio playback, backend behavior, or changes to the existing App screens.
- Hardware concept cutouts and stylized heart, flower, star, cloud, or jelly-wave bubble stickers are excluded from the visible collage; the screen-saver bubbles stay round and optically irregular.
- Editorial transition notes and visual cues guide page layout; they are not printed as body copy.

## Approaches

- Reuse the supplied zero-dependency 2D bubble world and WebGL2 background-refracting shader, adapted to React lifecycle and ten generated gradient placeholders. This gives the requested collisions and screensaver-like optical effect without adding a second physics package.
- Use CSS gradients and DOM bubbles only. This is simpler and more resilient, but cannot refract the current background image and will look flatter.
- Build a second Three.js scene with a physics library. This duplicates the app's existing rendering stack and adds weight for a small background interaction.

The supplied handoff and the user's request point to the first approach. Keep the Zine book renderer unchanged and mount the background as a separate, disposable layer.

## Content and visual direction

- The supplied ten-page copy is the source of truth for visible titles, English subtitles, and story paragraphs; editorial notes and microcopy do not render.
- Eight selected RGBA PNGs are placed with varied positions and small rotations, preserving their aspect ratios; unused hardware and decorative bubble cutouts are omitted from the public bundle.
- The landing background uses the ten supplied local photographs as WebGL textures and as CSS fallback images.
- Background changes crossfade over roughly 1.25 seconds and advance every ten seconds while motion is allowed; manual selection pauses automatic advance until it is turned back on.
- Bubble size and position vary. Bubbles stay circular with subtle optical wobble, edge rebound, and pointer-driven drag/release; they remain behind the book and controls.

## Constraints and acceptance

- Only edit the independent `memo-garden` repository.
- Do not add a runtime physics dependency.
- The screen remains a single fixed viewport; reading uses page turning, not vertical scrolling.
- Page labels remain readable over photography and preserve the hand-cut collage feel.
- Print continues to render one A5 portrait sheet per page with the revised copy.
- Build succeeds; local desktop and narrow-screen previews show the Zine, background transition, bubble motion, and working page controls.
