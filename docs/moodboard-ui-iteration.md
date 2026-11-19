# Moodboard UI iteration: shape, orbit, and AR entry

## Decision

Use the interaction-first route. Keep the full-screen personal Gallery and its existing floating/collision field. Add visual shape variety and a focused orbital label treatment without turning the moodboard image sheets into static app screens.

## Second visual pass: close-up orbs and film pop

### Chosen direction

- Make the first, featured sound a clear pearl orb that reads as a small planet. Its title, sound type, duration, saves, and one short listener response form a single continuous line on a tilted elliptical orbit. The orbit turns slowly, pauses on hover, can be dragged on the ring, and does not cover the orb's tap target.
- Increase the size range and overlap of the field with one hero, a few medium bubbles, and smaller satellites. Keep the irregular heart, star, flower, and cloud silhouettes among the spheres so the gallery has both close-up volume and shape variety.
- Improve the material using layered soft reflections, a pale lower-edge tint, narrow iridescence, and a restrained depth shadow; keep the room behind the bubbles visible.
- Replace uniform CSS spark dots with a shared Canvas 2D burst: a brief membrane contraction and asymmetric rupture, followed by curved film ribbons and translucent droplets that drift, spin, fall, and fade. The burst is an authored visual simulation; it does not claim fluid or membrane physics.

### Rendering choice

Keep the current React, SVG, CSS, and GSAP setup. [`p5.brush`](https://github.com/acamposuribe/p5.brush) focuses on drawn media such as pencils, watercolor, and hatch fills, so it does not provide bubble-film refraction or rupture behavior. A Canvas 2D layer suits a small, short-lived fragment effect and avoids a second rendering framework. Revisit [p5 WEBGL](https://p5js.org/reference/p5/constants/WEBGL/) shaders only if the product later needs live refraction or environment distortion across every bubble.

### Review checks

1. The featured orb and orbit read together like a planet with a moving text ring on phone and desktop widths.
2. The gallery feels denser without hiding the filter, heading, tab bar, or target bubbles behind the orbit.
3. Each pop has a visible membrane snap and a varied, gravity-led fragment trail, and still plays the selected sound example.
4. `prefers-reduced-motion` keeps the controls usable and avoids the continuous orbit and ambient floating.
5. README and demo-scope text describe the rupture as a visual simulation, not real fluid physics.

## Screen and interaction changes

### Personal Gallery

- Keep all sound bubbles moving, colliding, and bouncing within the phone viewport. Physics continues to use each bubble's circular bounding volume; a visual silhouette can be a heart, star, flower, or soft organic shape.
- Give bubbles four restrained material families drawn from the moodboard: clear pearl, pale sky-blue glass, blush opal, and a small number of lilac/chrome accents. Keep highlights soft and the thin iridescent film low contrast.
- Make one pearl orb the current visual focus. A continuous string of short metadata (sound title, type, duration, saves, and one short listener response) follows a tilted elliptical orbit around it. Let the ring move slowly, pause on hover, and allow dragging directly on its outer stroke. The remaining bubbles keep their compact title labels.
- Preserve tap-to-pop, sound playback simulation, content filters, and the existing filter lasso. Each non-circular silhouette must have a clear hit area, visible focus state, and reduced-motion fallback.

### Roam / AR capture

- Keep the supplied night-walk photo as the real-scene visual base. Overlay a small number of thin, 2D illustrated heart/star/flower forms at varied screen positions and apparent depths; keep them behind the selected capture target and away from key controls.
- Enter roam through three visible demo states: `scan` (camera-frame sweep and plane/scene hints), `buffer` (brief glassy loading mark with “正在整理空间” copy), then `ready` (current AR-style capture UI). Use a short overall transition, roughly 1.5–2 seconds, and allow tap-to-skip after the initial scan cue.
- Tab navigation, Echo leaderboard “去听” action, direct `?screen=roam` preview, capture selection, and captured/result state must land in a valid state. Show that this is a visual AR demo; do not imply live ARKit tracking or hardware integration.

### Motion and craft

- Use GSAP for entrance and focus transitions already supported by the prototype. Keep slow movement ambient and interruptible; use short, tactile easing for tap, focus, and orbit pauses.
- Follow system reduced-motion preference: suppress looping orbit/float and shorten or remove the scan sweep while preserving state and controls.
- Maintain readable contrast over the photograph, phone safe areas, keyboard focus, and touch targets. Decorative overlays never intercept pointer input.

## Asset direction

- Treat the moodboard as a visual reference for material, shape, collage language, and color balance. Avoid placing full reference sheets into the runtime UI.
- Reuse existing user-provided scene photos where available. Render simple shape overlays as lightweight SVG/CSS so they can move, scale, and respond consistently. Use isolated moodboard cutouts only when their transparent edges and resolution work at phone scale.
- Do not use the chrome wordmark as product text or copy brand marks from reference imagery.

## Acceptance review

1. The Gallery still reads as an irregular, screen-filling bubble field, with visibly varied silhouettes and no loss of pop/playback or filter interactions.
2. The focused orb's continuous orbit text is legible, manually browsable, and does not cover nearby controls or the orb's tap area.
3. Entering roam communicates scan → brief buffer → AR-style capture. Each state can finish, be skipped where appropriate, and responds to reduced motion.
4. Roam overlays read as 2D illustrations in a real photographed scene, while the primary capture target remains the clearest object.
5. README and demo-scope documentation describe only the capabilities present in this browser prototype.

## Out of scope

- Actual ARKit plane detection, camera permission, microphone recording, GPS placement, voice separation, ESP32 connection, or physical bubble output.
- Replacing the SwiftUI visual prototype or introducing new dependencies.
- Turning the Echo leaderboard into a full social network or adding scoring/rewards.
