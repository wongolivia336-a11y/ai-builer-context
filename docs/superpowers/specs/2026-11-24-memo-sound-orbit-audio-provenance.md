# Sound Orbit audio provenance

Date: 2026-11-24
Review state: local preview; awaiting the user's listening review.

The app maps tracks by the existing `sceneId` values in `src/zine/bubble-scenes.js`. The candidate-list number and Zine page number are not used as mapping keys. Machine-readable source hashes, processed hashes, file sizes, durations, edit notes, and the full scene mapping are stored in [`public/zine/audio/provenance.json`](../../../public/zine/audio/provenance.json). The source SHA-256 values were captured when the original recordings were downloaded; the originals are not bundled, so the repository checker validates their format but cannot recompute them. It does recompute and verify each processed MP3 hash and file size from the bundled files.

## Scene mapping and source records

| Scene | Track | Source recording | Rights |
|---|---|---|---|
| `canopy-rest` | Tree shade, breeze and birds | [Gentle breeze and birds singing](https://commons.wikimedia.org/wiki/File:Gentle_breeze_and_birds_singing.ogg), ezwa | Public domain, released by the author through PDSounds |
| `cloud-meadow` | Meadow air | [Nature Sounds Pack — AmbientNatureOutside.wav](https://opengameart.org/content/nature-sounds-pack), AntoineMax | CC BY 4.0 |
| `rolling-flowers` | Bee among flowers | [Hummel bee](https://commons.wikimedia.org/wiki/File:Hummel_bee.ogg), soerena | Public domain, released by the author through PDSounds |
| `wildflower-hill` | Birds on the hill | [Ambient Bird Sounds](https://opengameart.org/content/ambient-bird-sounds), isaiah658 | CC0 1.0 |
| `lambs-in-the-field` | Sheep call and open-air bed | [Sheep Baa](https://opengameart.org/content/sheep-baa), recording by mikewest, uploaded by AntumDeluge; with a soft outdoor bed from the Nature Sounds Pack | CC0 1.0 and CC BY 4.0 |
| `clover-light` | Leaf rustle and air | Foliage03.wav and Foliage06.wav with a soft outdoor bed from the [Nature Sounds Pack](https://opengameart.org/content/nature-sounds-pack), AntoineMax | CC BY 4.0 |
| `star-tree` | Village night ambience | [Country night noise](https://commons.wikimedia.org/wiki/File:Country_night_noise.ogg), HC | Public domain, released by the author through PDSounds |
| `misty-forest` | Rainy-night forest ambience | [Nature Sounds Pack — AmbientNatureNightRainy.wav](https://opengameart.org/content/nature-sounds-pack), AntoineMax | CC BY 4.0 |
| `flower-pond` | Stream and birds | [Nature Sounds Pack — StreamAndBirds03.wav](https://opengameart.org/content/nature-sounds-pack), AntoineMax | CC BY 4.0 |
| `apple-tree` | Orchard birds and water ambience | [Nature Sounds Pack — AmbientNatureBirdsWater01.wav](https://opengameart.org/content/nature-sounds-pack), AntoineMax | CC BY 4.0 |

The OpenGameArt Nature Sounds Pack page lists the author and CC BY 4.0 license. Attribution for those edits is: **“Nature Sounds Pack” by AntoineMax, used under CC BY 4.0; edited and mixed for MEMO Garden.** The sheep source is a single short call, so it appears once over ambience. The clover track uses two short leaf details placed over ambience rather than looping the transients. Each file is encoded as a compact local MP3. All scene files remain marked `local-preview` until the user confirms the listening pass.

## Level repair

The user's first audition found tracks 05, 06, 08, 09, and 10 inaudible. Those five outputs were rebuilt and normalized; meadow ambience and hillside birds were level-matched as well. FFmpeg `ebur128=peak=true` measurements now place all ten tracks between −22.3 and −18.4 LUFS integrated, with true peaks between −5.4 and −1.7 dBFS. Measurements verify signal level; the user still needs to confirm the full set by ear.

## Audition checklist

- Compare each track with its mapped photo, not its file number.
- Check for speech, music, clipping, harsh peaks, or conspicuous loop repetition.
- Listen to rapid photo changes and confirm the selected image and audible scene stay aligned.
- Accept or revise the ten tracks before changing their review state or publishing them.
