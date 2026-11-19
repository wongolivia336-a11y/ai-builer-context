# Moodboard UI iteration: shape, orbit, and AR entry

## Decision

Use the interaction-first route. Keep the full-screen personal Gallery and its existing floating/collision field. Add visual shape variety and a focused orbital label treatment without turning the moodboard image sheets into static app screens.

## Second visual pass: crossed planet orbit, touch, and liquid pop

### Chosen direction

- Make the first, featured sound a clear pearl orb that reads as a small planet. Its title, sound type, duration, saves, and one short listener response follow a close, tilted elliptical orbit; a second crossed ring carries a short echo note to give the planet more depth. The tracks turn slowly, pause on hover, can be dragged on the ring, and do not cover the orb's tap target.
- Increase the size range and overlap of the field with one hero, a few medium bubbles, and smaller satellites. Keep the irregular heart, star, flower, and cloud silhouettes among the spheres so the gallery has both close-up volume and shape variety.
- Improve the material using layered soft reflections, a pale lower-edge tint, narrow iridescence, and a restrained depth shadow; keep the room behind the bubbles visible.
- Replace uniform CSS spark dots with a shared Canvas 2D burst: a brief buckling membrane, an opening aligned to the tap point, a small pulled film tongue, two curling film lips, and teardrop-shaped droplets with an impact impulse that drift, spin, fall, and fade. The burst is an authored visual simulation; it does not claim fluid or membrane physics.
- Allow each bubble to be dragged directly. When two contact volumes overlap, move the free neighbor aside and briefly compress both surfaces toward the contact axis, with a translucent film bridge between them; the bubbles spring back when released. Keyboard/tap pop remains distinct from a drag.

### Rendering choice

Keep the current React, SVG, CSS, and GSAP setup. [`p5.brush`](https://github.com/acamposuribe/p5.brush) focuses on drawn media such as pencils, watercolor, and hatch fills, so it does not provide bubble-film refraction or rupture behavior. A Canvas 2D layer suits a small, short-lived fragment effect and avoids a second rendering framework. Revisit [p5 WEBGL](https://p5js.org/reference/p5/constants/WEBGL/) shaders only if the product later needs live refraction or environment distortion across every bubble.

### Review checks

1. The featured orb and orbit read together like a planet with a moving text ring on phone and desktop widths.
2. The gallery feels denser without hiding the filter, heading, tab bar, or target bubbles behind the orbit.
3. Dragging moves the chosen bubble under the pointer; contact pushes its neighbor aside and briefly changes both silhouettes, while a click still triggers the selected sound and liquid-like rupture.
4. Each pop has a visible membrane snap and a varied, gravity-led fragment trail, and still plays the selected sound example.
5. `prefers-reduced-motion` keeps the controls usable and avoids the continuous orbit and ambient floating.
6. README and demo-scope text describe contact and rupture as visual simulations, not real fluid physics.

## Screen and interaction changes

### Personal Gallery

- Keep all sound bubbles moving, colliding, and bouncing within the phone viewport. Physics continues to use each bubble's circular bounding volume; a visual silhouette can be a heart, star, flower, or soft organic shape.
- Give bubbles four restrained material families drawn from the moodboard: clear pearl, pale sky-blue glass, blush opal, and a small number of lilac/chrome accents. Keep highlights soft and the thin iridescent film low contrast.
- Make one pearl orb the current visual focus. Give it a tilted equatorial text orbit that passes across the bubble's volume. Paint the far-side rail and glyphs behind the bubble so its body masks them; paint the near-side rail and glyphs above the bubble, with perspective scale and soft fades as letters turn toward the viewer. The metadata string should keep circling so only its front-facing section becomes readable. Let the orbit move slowly, pause on hover, and allow dragging from the outer handles. The remaining bubbles keep their compact title labels.
- Preserve tap-to-pop, sound playback simulation, content filters, and the existing filter lasso. Let bubbles move under pointer drag and give overlaps a brief aligned squash/stretch plus a translucent contact film. Each non-circular silhouette must have a clear hit area, visible focus state, and reduced-motion fallback.

### Roam / AR capture

- Keep the supplied night-walk photo as the real-scene visual base. Overlay a small number of thin, 2D illustrated heart/star/flower forms at varied screen positions and apparent depths; keep them behind the selected capture target and away from key controls.
- Enter roam through three visible states: `scan` (camera-frame sweep), `buffer` (bubble-water progress and “正在注入泡泡水”), then `ready`. Request the rear camera from the user's navigation gesture; if permission or camera access is unavailable, keep the supplied night-walk photo as the scene fallback. After loading, release a brief screen-filling bubble burst.
- Overlay three illustrated, differently sized sound anchors on the live camera or photo background. Tap selects and zooms toward the target; the capture action draws a soft gradient water ribbon from the edge into a floating center bubble. Tapping the center bubble plays the sound example, and long-pressing any anchor opens its translucent Liquid Glass comments.
- Camera pixels are live when authorized, but the anchors are fixed screen-space demo positions; don't imply ARKit plane detection, world tracking, GPS, or hardware integration. Tab navigation, Echo leaderboard “去听”, direct `?screen=roam`, camera denial, capture, listening, and comments should remain usable.

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
2. The focused orb reads as a small volume with text passing around its equator: far-side letters disappear behind the bubble, and front-side letters cross its surface with a slow, readable rotation. The orbit remains manually browsable from its outer handles and does not block the bubble tap target.
3. Entering roam communicates scan → brief buffer → AR-style capture. Each state can finish, be skipped where appropriate, and responds to reduced motion.
4. Roam overlays read as 2D illustrations in a real photographed scene, while the primary capture target remains the clearest object.
5. README and demo-scope documentation describe only the capabilities present in this browser prototype.

## Out of scope

- Actual ARKit plane detection/world tracking, microphone recording, GPS placement, voice separation, ESP32 connection, or physical bubble output. Camera access is implemented with the browser permission API; camera-space anchors remain a visual demo.
- Replacing the SwiftUI visual prototype or introducing new dependencies.
- Turning the Echo leaderboard into a full social network or adding scoring/rewards.
