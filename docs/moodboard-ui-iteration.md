# Moodboard UI iteration: shape, orbit, and AR entry

## Decision

Use the interaction-first route. Keep the full-screen personal Gallery and its existing floating/collision field. Add visual shape variety and a focused orbital label treatment without turning the moodboard image sheets into static app screens.

## Screen and interaction changes

### Personal Gallery

- Keep all sound bubbles moving, colliding, and bouncing within the phone viewport. Physics continues to use each bubble's circular bounding volume; a visual silhouette can be a heart, star, flower, or soft organic shape.
- Give bubbles four restrained material families drawn from the moodboard: clear pearl, pale sky-blue glass, blush opal, and a small number of lilac/chrome accents. Keep highlights soft and the thin iridescent film low contrast.
- Make one bubble the current visual focus. A horizontal set of short tags (sound type, duration, and one short quote or response) follows an elliptical orbit around that bubble. Let the strip move slowly, pause on touch/hover, and allow horizontal swiping. The remaining bubbles keep their compact title labels.
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
2. The focused bubble's horizontal orbit labels are legible, manually browsable, and do not cover nearby controls or the bubble hit area.
3. Entering roam communicates scan → brief buffer → AR-style capture. Each state can finish, be skipped where appropriate, and responds to reduced motion.
4. Roam overlays read as 2D illustrations in a real photographed scene, while the primary capture target remains the clearest object.
5. README and demo-scope documentation describe only the capabilities present in this browser prototype.

## Out of scope

- Actual ARKit plane detection, camera permission, microphone recording, GPS placement, voice separation, ESP32 connection, or physical bubble output.
- Replacing the SwiftUI visual prototype or introducing new dependencies.
- Turning the Echo leaderboard into a full social network or adding scoring/rewards.
