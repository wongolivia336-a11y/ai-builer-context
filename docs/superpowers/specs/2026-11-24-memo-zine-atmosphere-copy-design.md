# MEMO Garden Zine Atmosphere and Copy Design

## Intent

Give the desktop Zine landing a more generous field of drifting bubbles, and let the ten printed pages feel like memory layered over landscape. Rewrite the story in a reflective, first-person cadence while preserving its six-part journey: overlook, listen, discover, collect, leave a trace, meet again.

## Approaches

### Desktop bubbles

- **Selected:** Raise the desktop count from 8 to the WebGL shader's existing limit of 10. Use a wider deterministic radius range and a gentle low-frequency pulse in both WebGL and CSS fallback rendering. Keep the mobile count at 5.
- **More than 10 bubbles:** This requires expanding the shader uniform arrays and raises per-pixel work. The selected 10-bubble limit gives a visible density increase without changing the shader interface.
- **Scale only:** This preserves render cost but does not answer the request for a fuller desktop field.

### Zine page atmosphere

- **Selected:** Reuse the existing local city, river, park, and market photographs as low-contrast, blurred full-page underlays. Add a warm paper wash, fiber texture, and the existing grain above them; keep collage photos, titles, and torn copy panels crisp.
- **Flat color or gradient only:** This would keep text legible but would not add the landscape feeling requested.
- **New or replacement photos:** This changes the image set without need. Existing images remain unchanged and provide the underlays.

### Story copy

- **Selected:** Rewrite the ten visible paragraphs in a quiet, reflective voice inspired by the supplied essay's sense of looking back and finding direction through walking. Keep the existing titles and journey, avoid borrowing its sentences, and avoid claims about GPS, AI sorting, or hardware being available in the current Demo.
- **Keep current copy with light edits:** This would retain the brisk tone the user asked to change.

## Page copy

1. **一颗泡泡的旅行** — 我们以为要走远一点，才会遇见值得记住的事。后来才发现，街角一阵风，也足以让时间停一下。
2. **原来，城市一直在说话** — 摘下耳机，街道没有忽然变响；只是我终于听见，井盖、树叶和摊前的塑料袋，各自说着不同的今天。日常并不重复，是我走得太快。
3. **今天，换耳朵带路** — 回家的车开走了。我没有追，站在路口听了几秒。左边是炒栗子的铲声，右边是练到一半的吉他。方向有时是在停下以后，才慢慢出现。
4. **嘿，那里有一颗泡泡** — 旧招牌后，桂花树影里浮着一颗泡泡。我靠近时，听见一段陌生的午后。它并不属于我，却让我想起许多说不清的黄昏。
5. **把这一秒，接住吧** — 声音不能被握住。我把手机举向那点微光，轻轻按下。几秒钟落进口袋，泡泡仍留在街角——同一阵风，开始走两条路。
6. **口袋里，装着一个下午** — 回家再听，桂花、河风和收摊前的灯又回来了。它们有了名字，也有了顺序；一个下午，忽然不只发生过一次。
7. **那我也留下一点什么吧** — 听完别人的声音，我也想留下一点。我没有准备好一句漂亮的话，只在路灯下轻声说：今天经过这里，风很舒服。
8. **它留在了原来的地方** — 我走以后，雨把路面洗亮，清晨又换了几批行人。树叶落下又被风带走，那句话却还在原处，等时间从这里经过。
9. **后来，有人听见了** — 两天后，她在灯柱前停下。听见那句「风很舒服」后，她没有寻找说话的人，只站在风里片刻，然后继续往前走。
10. **下次，把声音留给我** — 后来我才明白，留下声音不是把一个下午收好，而是把它交给尚未遇见的人。如果是你，会让哪一阵风继续走？

## Goals

- Show 10 desktop bubbles with a more legible range of small, medium, and large scales; retain 5 bubbles on mobile.
- Recompute existing bubble radii and mass when crossing the 680 px mobile/desktop breakpoint so mobile sizes stay within their cap.
- Retain collisions, wall bounce, pointer interaction, reduced-motion behavior, WebGL fallback, and the existing background canvas lifecycle.
- Render a distinct, soft landscape color field behind each Zine page while keeping copy panels and collage imagery readable.
- Keep the current titles, English subtitles, ten original photos, stickers, Liquid Glass controls, Zine navigation, and print flow.
- Keep the copy conceptually framed; describe no unimplemented GPS, AI, or hardware capability.

## Constraints and non-goals

- Work only within the Zine page art, Zine background bubble system, and related Zine documentation.
- Do not replace or edit the existing ten scene photos or sticker assets.
- Do not change the main App, AR flow, SwiftUI, backend, routes, Zine page-turn interaction, print action, Sound Orbit, or top/bottom button styling.
- Add no dependency and no new photo assets.
- Keep mobile bubble count at 5. The shader remains capped at 10 bubbles.

## Implementation decisions

- `src/zine/bubble-scenes.js` remains the source for the landing background photos; `src/zine/page-art.js` reuses already-loaded field photos for page backgrounds.
- Desktop bubble count becomes 10, mobile remains 5. Deterministic size bands use the current 2D physics model; a subtle pulse adds a slower breathing rhythm in WebGL and CSS fallback rendering, and stops with reduced motion.
- The page base uses a 34 px canvas blur with warm paper tint and existing texture/grain. Foreground collage assets and readable copy retain their current sharpness.
- `ZINE_PAGES` keeps all ten existing titles, English lines, and asset mappings. Only the visible story paragraphs change.

## Review focus

- Text remains inside its torn panels at all ten pages, especially the narrow Page 09 block and the longer Page 03 paragraph.
- Desktop shader arrays stay aligned with a count of 10 after resize; mobile returns to 5.
- Canvas filter and photo underlay are included in print output, with a paper fallback when filter is unavailable.
- WebGL, reduced-motion, and CSS fallback paths keep the same page and bubble counts.
- CSS fallback bubbles keep their varied silhouettes and breathing rhythm, with the pulse stopped under reduced motion.
- Crossing the 680 px breakpoint recalculates existing bubbles to the target layout's radius range.
- No non-Zine route, scene photo file, Sound Orbit control, or page-turn state changes.
