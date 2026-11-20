# Memo Garden Asset Pack

## Project identity
- Product: Memo Garden · 声景漫游
- Device concept/model: Memo Catcher
- Configured demo URL: https://ai-builer-context.vercel.app
- Web stack: React, Vite, Three.js, MindAR

## Package contents
- assets/source-assets: project illustration and material source files, including the user-kit WebP files, roam-street.png, and the two compressed STL source parts.
- assets/markers: eight standalone, high-contrast SVG image targets. Each SVG maps to one fixed demo bubble.
- assets/ui-previews: existing home, Echo Board, and device previews, plus current 390 × 844 home/create/roam screenshots and a 1440 × 1000 Memo Catcher model view.
- references: product context, demo scope, AR image-target setup, visual direction, and asset-use map.

The device model is provided as two gzip source chunks. Preserve their byte order when concatenating; the pair represents one compressed STL payload. This package contains model source only, not firmware or a real device integration.

## Eight image targets
| Index | SVG file | Bubble |
|---:|---|---|
| 0 | memo-01-river-wind.svg | 河面上的风 |
| 1 | memo-02-alley-bell.svg | 巷口的钟声 |
| 2 | memo-03-passing-steps.svg | 刚经过的人 |
| 3 | memo-04-osmanthus-tea.svg | 桂花茶的下午 |
| 4 | memo-05-after-rain.svg | 雨停以后 |
| 5 | memo-06-market-light.svg | 收摊前的灯 |
| 6 | memo-07-goodnight.svg | 没说出口的晚安 |
| 7 | memo-08-bicycle-bell.svg | 车铃经过 |

Print targets separately, at least 65 mm square, on matte paper. Keep the complete white margin and black border. Avoid glare, folds, cropping, or combining multiple targets on one sheet.

## UI palette
The source of truth is src/styles-editorial.css in the project repository. These CSS tokens are also listed here for handoff:

| Token | Hex | Role |
|---|---|---|
| --pop-paper | #f7f4e9 | warm paper background |
| --pop-paper-light | #fcfbf4 | light surface |
| --pop-ink | #202b24 | primary text |
| --pop-forest | #203b2e | deep green |
| --pop-moss | #a8c98b | moss green |
| --pop-lime | #d9f04d | fluorescent grass green accent |
| --pop-blue | #c8e3f2 | pale blue |
| --pop-pink | #efc5d4 | mist pink |
| --glass-fill | rgba(250,249,239,.64) | translucent warm surface |
| --glass-border | rgba(255,255,255,.88) | glass edge |
| --glass-shadow | 0 18px 46px rgba(57,77,51,.12), inset 0 1px 0 rgba(255,255,255,.92) | soft depth |

The visual direction pairs translucent, fine-film bubbles with a paper-and-forest palette. Use lime sparingly for active controls and navigation. Keep small interaction labels readable and preserve the organic bubble silhouettes.

## Human and agent handoff
1. In the project repository, read the root README.md and AGENTS.md, then product-context.md, demo-scope.md, and ar-image-target-setup.md. For a standalone package handoff, start with references/project-readme.md, references/AGENTS.md, and the matching product and AR references.
2. Keep the current web-only boundary clear. Browser recordings and demo comments are local session state; there is no backend persistence.
3. AR targets are the eight fixed SVGs above. Camera access needs HTTPS or localhost and explicit user permission.
4. MindAR and Three.js load through the browser import map. Preserve the runtime import helper used by ImageTargetARStage.jsx.
5. The configurable device WebSocket is an interface only. There is no ESP32 firmware, real Wi-Fi discovery, RSSI scanning, or validated physical hardware bridge.
6. The SwiftUI file is a separate visual prototype and is not updated by Web-only changes.

## Integrity
See SHA256SUMS.txt for SHA-256 hashes of every file in this directory except the hash list itself. The repository also stores a separate backup archive at handoff/backups/Memo-Garden-Asset-Pack-backup.zip.

Current UI review images: [home](assets/ui-previews/home-390x844.png), [create](assets/ui-previews/create-390x844.png), [roam](assets/ui-previews/roam-390x844.png), [Memo Catcher desktop view](assets/ui-previews/memo-catcher-desktop-1440x1000.png).