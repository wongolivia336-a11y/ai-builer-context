# Sound Orbit photo and audio source audit

Audit date: 2026-11-23. This document distinguishes the repository's real photo scenes from the handoff's separate sound-source shortlist. No audio files were downloaded or listened to during this audit.

## Actual photo scenes

The app source of truth is `src/zine/bubble-scenes.js`; each `id` points to the photo at the listed local path. The same IDs drive the current background carousel and bubble renderer. These are not Zine page IDs.

| `sceneId` | Existing photo | Observed subject |
|---|---|---|
| `canopy-rest` | `public/zine/assets/scenes/01-canopy-rest.jpg` | Person resting under a broad park tree |
| `cloud-meadow` | `public/zine/assets/scenes/02-cloud-meadow.jpg` | Open grassy landscape, road, and low cloud |
| `rolling-flowers` | `public/zine/assets/scenes/03-rolling-flowers.jpg` | Rolling flower field beneath clouds |
| `wildflower-hill` | `public/zine/assets/scenes/04-wildflower-hill.jpg` | Flower-covered green hillside |
| `lambs-in-the-field` | `public/zine/assets/scenes/05-lambs-in-the-field.jpg` | Two lambs on grass |
| `clover-light` | `public/zine/assets/scenes/06-clover-light.jpg` | Close clover leaves with dew and sunlight |
| `star-tree` | `public/zine/assets/scenes/07-star-tree.jpg` | Large park tree with decorative star overlays |
| `misty-forest` | `public/zine/assets/scenes/08-misty-forest.jpg` | Foggy conifer forest with decorative star overlays |
| `flower-pond` | `public/zine/assets/scenes/09-flower-pond.jpg` | Small pond surrounded by grass and flowers |
| `apple-tree` | `public/zine/assets/scenes/10-apple-tree.jpg` | Apple tree with decorative star overlays |

## Candidate-source page audit

All ten source pages were opened directly. Each currently displays a Creative Commons 0 label and the page action `Login to download`. This verifies the page's current license display only. It does not verify the audio's contents or suitability, and it does not mean the actual file is available locally.

| Handoff slot (source-list ID only) | Current page title / creator | Page metadata observed | Scene relevance before listening | Status |
|---:|---|---|---|---|
| 01 | [Bird Song — musicradiocreative](https://freesound.org/people/musicradiocreative/sounds/197104/) | WAV, 4:24.382, 44.5 MB; description mentions crows, rooks, and other wild birds | Possible canopy, clover, orchard, or flower-field birds | `PENDING_DOWNLOAD`, `PENDING_AUDITION` |
| 02 | [AMB-Night, QuietForest, Otepaa — soundandmelodies](https://freesound.org/people/soundandmelodies/sounds/776081/) | WAV, 4:13.125, 69.5 MB; description mentions wind and a few passing cars | Possible night tree / misty forest; car passes need listening review | `PENDING_DOWNLOAD`, `PENDING_AUDITION` |
| 03 | [Gentle rain on window — Legnalegna55](https://freesound.org/people/Legnalegna55/sounds/553390/) | MP3, 2:08.497, 2.0 MB | No window or rainy scene among the ten photos | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, no scene match yet |
| 04 | [Small brook, stream, water sound — SamsterBirdies](https://freesound.org/people/SamsterBirdies/sounds/584269/) | FLAC, 1:12.797, 15.1 MB | Strong visual fit for `flower-pond` | `PENDING_DOWNLOAD`, `PENDING_AUDITION` |
| 05 | [Walking through grassy field — Sadiquecat](https://freesound.org/people/Sadiquecat/sounds/802068/) | WAV, 1:33.012, 8.5 MB; mono footsteps | Possible field walk for a meadow image; does not contain lamb calls according to the page description | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, weak scene fit |
| 06 | [City park ambience — felix.blume](https://freesound.org/people/felix.blume/sounds/667062/) | WAV, 4:30.384, 148.5 MB; page describes birds, slight wind, distant traffic/city hum | Possible `canopy-rest`; large source would need an approved excerpt/transcode | `PENDING_DOWNLOAD`, `PENDING_AUDITION` |
| 07 | [Train interior ambience 2a — Yoyodaman234](https://freesound.org/people/Yoyodaman234/sounds/341207/) | WAV, 0:35.848, 6.0 MB | No train or transit image among the ten photos | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, no scene match yet |
| 08 | [Ocean Waves — Noted451](https://freesound.org/people/Noted451/sounds/531015/) | WAV, 1:10.884, 11.9 MB | No ocean/beach image among the ten photos | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, no scene match yet |
| 09 | [Bubbles popping on the surface of water — vintage2005](https://freesound.org/people/vintage2005/sounds/459582/) | AIFF, 0:22.619, 4.1 MB; page describes soft bubbling | Could become a sparse, occasional bubble detail; poor candidate for a continuous scene loop | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, no looping assignment |
| 10 | [The Fireplace 3 — NoOneIsReal](https://freesound.org/people/NoOneIsReal/sounds/387128/) | WAV, 1:33.500, 7.9 MB | No fireplace or warm indoor scene among the ten photos | `PENDING_DOWNLOAD`, `PENDING_AUDITION`, no scene match yet |

The handoff slot is retained only to locate a candidate in the source list. It is never used as a Zine page number or `sceneId` index. The provisional content matches are recorded in the vinyl design spec; no source ID is wired into the app.

## Rights and audition boundary

- Current CC0 page labels were rechecked for all ten entries on the audit date.
- Every page requires a logged-in user to download. This audit did not use or bypass authentication.
- No source audio, download filename/date, checksum, edit, loop, or listening result exists locally yet.
- The implementation may use a clearly labelled synthetic interaction placeholder. It must not claim to play these ten recordings.
- A final `sceneId → trackId` map requires authorized download, a recorded SHA-256, manual audition, and approval of the excerpt and loop behavior.
