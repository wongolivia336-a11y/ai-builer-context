import { ZINE_PAGES } from './content.js'
import { ZINE_COLLAGE_ASSETS } from './scrapbook-assets.js'

const PAGE_WIDTH = 1120
const PAGE_HEIGHT = 1587
const FIELD = '/zine/assets/field/'
const STICKERS = '/zine/assets/stickers/'
const PAPER_STOCK = '/zine/assets/paper-stock.png'
const PAPER_SCRAPS = '/zine/assets/collage/torn-paper-sheet-v1.png'
const TITLE_FAMILY = '"MEMO Marker"'
const BODY_FAMILY = '"MEMO WenKai"'
const ENGLISH_FAMILY = '"MEMO Special Elite"'
const PAPER_SCRAP_CELL = 512
const FONT_FACES = [
  ['MEMO Marker', '/zine/fonts/lxgw-marker-gothic-v1.012-subset.ttf'],
  ['MEMO WenKai', '/zine/fonts/lxgw-wenkai-gb-v1.530-subset.ttf'],
  ['MEMO Special Elite', '/zine/fonts/SpecialElite-Regular.ttf'],
]
const CLOSING_PUNCTUATION = /[，。！？；：、）」』】》,.!?;:]/u
let fontLoadPromise

function loadZineFonts() {
  if (!fontLoadPromise) {
    fontLoadPromise = Promise.all(FONT_FACES.map(([family, source]) => (
      new FontFace(family, `url("${source}")`, { style: 'normal', weight: '400' }).load()
    )))
      .then((faces) => faces.forEach((face) => document.fonts.add(face)))
      .catch((error) => {
        fontLoadPromise = undefined
        throw error
      })
  }
  return fontLoadPromise
}

export const PAGE_LAYOUTS = [
  {
    title: { x: 74, y: 128, width: 970, size: 86, style: 'cut' },
    photos: [{ src: 'city-dusk.png', x: 112, y: 500, width: 890, height: 650, angle: -.022, opacity: .96 }],
    stickers: [
      { id: 'B03_osmanthus_branch.png', x: 82, y: 700, width: 320, height: 260, angle: -.11, opacity: .88 },
      { id: 'A01_round_sound_bubble.png', x: 650, y: 425, width: 300, height: 300, angle: .06, opacity: .98 },
    ],
    body: { x: 134, y: 1250, width: 840, size: 40, angle: .012, color: '#fffefa', paperStyle: 'torn' },
    marks: 'orbit',
  },
  {
    title: { x: 72, y: 102, width: 940, size: 67, style: 'ink' },
    photos: [{ src: 'city-street.png', x: 56, y: 310, width: 1010, height: 690, angle: .009, opacity: .94 }],
    stickers: [{ id: 'B01_orange_soda.png', x: 770, y: 575, width: 245, height: 345, angle: .06, opacity: .94 }],
    feature: {
      type: 'note-stack',
      items: [
        { assetId: 'city-night', x: 105, y: 844, width: 225, height: 156, angle: -.06, caption: '16:40 · 街口今天不一样', tape: 'rgba(190, 231, 224, .8)' },
        { assetId: 'city-crossing', x: 790, y: 866, width: 210, height: 150, angle: .045, caption: '车轮压过井盖', tape: 'rgba(238, 207, 218, .76)' },
      ],
    },
    body: { x: 106, y: 1100, width: 900, size: 40, angle: -.009, color: '#f7f8f2', paperStyle: 'ruled' },
    marks: 'waves',
  },
  {
    title: { x: 86, y: 105, width: 930, size: 65, style: 'cut' },
    photos: [],
    stickers: [],
    feature: {
      type: 'photo-clock',
      cx: 560,
      cy: 830,
      radius: 258,
      photoSize: 204,
      pointerAngle: -1.12,
      centerNote: '17:05',
      assetIds: ['city-night', 'city-dusk', 'city-crossing', 'tree-plaza', 'riverside-park', 'lamb-field', 'cow-meadow', 'geese-field'],
    },
    decorations: [{ assetId: 'handdrawn-ginkgo', x: 54, y: 1035, width: 135, height: 145, angle: -.12, opacity: .78, shadow: false }],
    body: { x: 125, y: 1205, width: 835, size: 40, angle: .01, color: '#fffefa', paperStyle: 'open' },
    marks: 'route',
  },
  {
    title: { x: 68, y: 102, width: 970, size: 63, style: 'cut' },
    photos: [{ src: 'market.png', x: 195, y: 420, width: 790, height: 685, angle: .028, opacity: .9 }],
    stickers: [
      { id: 'B03_osmanthus_branch.png', x: 630, y: 355, width: 380, height: 285, angle: .065, opacity: .76 },
      { id: 'A01_round_sound_bubble.png', x: 385, y: 494, width: 280, height: 280, angle: -.045, opacity: .98 },
    ],
    feature: {
      type: 'note-stack',
      items: [{ assetId: 'tree-plaza', x: 84, y: 826, width: 245, height: 176, angle: -.055, caption: '桂花树影里', tape: 'rgba(216, 236, 207, .82)' }],
    },
    body: { x: 122, y: 1240, width: 870, size: 40, angle: -.015, color: '#f8f8f4', paperStyle: 'caption' },
    marks: 'orbit',
  },
  {
    title: { x: 82, y: 122, width: 750, size: 70, style: 'banner' },
    photos: [{ src: 'city-dusk.png', x: 555, y: 350, width: 475, height: 710, angle: .036, opacity: .92 }],
    stickers: [{ id: 'A01_round_sound_bubble.png', x: 120, y: 500, width: 290, height: 290, angle: .075, opacity: .98 }],
    feature: {
      type: 'note-stack',
      items: [{ assetId: 'flower-pond', x: 732, y: 818, width: 258, height: 182, angle: .045, caption: '一段留在原地的水声', tape: 'rgba(191, 224, 227, .8)' }],
    },
    body: { x: 100, y: 1162, width: 800, size: 42, angle: .014, color: '#fffefa', paperStyle: 'tissue' },
    marks: 'route',
  },
  {
    title: { x: 66, y: 92, width: 990, size: 60, style: 'banner' },
    photos: [],
    stickers: [],
    feature: {
      type: 'contact-sheet',
      x: 88,
      y: 286,
      cellWidth: 300,
      cellHeight: 250,
      gapX: 18,
      gapY: 28,
      columns: 3,
      photoSizes: [[300, 236], [280, 220], [312, 250], [270, 240], [300, 232], [285, 255]],
      offsets: [[0, 10], [15, 0], [0, 18], [20, 0], [0, 14], [10, 0]],
      assetIds: ['market-produce', 'orchard-apples', 'flower-pond', 'geese-field', 'lamb-field', 'cow-meadow'],
      captions: ['收摊前的灯', '树下的下午', '池边一圈风', '草地上的叫声', '两声很轻', '山坡慢下来'],
    },
    decorations: [{ assetId: 'handdrawn-ginkgo', x: 15, y: 882, width: 105, height: 108, angle: -.1, opacity: .82, shadow: false }],
    body: { x: 104, y: 1000, width: 900, size: 38, angle: -.008, color: '#f4f8f4', paperStyle: 'tissue' },
    marks: 'labels',
  },
  {
    title: { x: 72, y: 104, width: 970, size: 62, style: 'cut' },
    photos: [{ src: 'city-dusk.png', x: 738, y: 285, width: 300, height: 660, angle: .045, opacity: .82 }],
    stickers: [
      { id: 'A01_round_sound_bubble.png', x: 170, y: 475, width: 300, height: 300, angle: -.05, opacity: .96 },
      { id: 'D01_streetlamp_warm.png', x: 662, y: 428, width: 280, height: 490, angle: .025, opacity: .94 },
    ],
    feature: {
      type: 'note-stack',
      items: [
        { assetId: 'riverside-park', x: 754, y: 782, width: 246, height: 180, angle: .04, caption: '今天经过这里', tape: 'rgba(229, 221, 189, .78)' },
        { assetId: 'city-night', x: 78, y: 838, width: 245, height: 176, angle: -.035, caption: '街口的一点风', tape: 'rgba(190, 224, 217, .8)' },
      ],
    },
    decorations: [{ assetId: 'handdrawn-sparrow', x: 344, y: 906, width: 132, height: 100, angle: .035, opacity: .9, shadow: false }],
    body: { x: 155, y: 1155, width: 790, size: 40, angle: .018, color: '#fffefa', handwritten: true, paperStyle: 'handwritten' },
    marks: 'handwritten',
  },
  {
    title: { x: 74, y: 102, width: 920, size: 65, style: 'ink' },
    photos: [],
    stickers: [],
    feature: {
      type: 'paired-time',
      x: 115,
      y: 350,
      width: 890,
      height: 470,
      gap: 54,
      assetIds: ['city-crossing', 'city-dusk'],
      captions: ['那天 · 21:15', '两天后 · 18:07'],
      details: [
        { assetId: 'tree-plaza', x: 72, y: 927, width: 236, height: 145, angle: -.035, caption: '雨后的路面', tape: 'rgba(188, 220, 210, .82)' },
        { assetId: 'city-night', x: 433, y: 950, width: 232, height: 142, angle: .025, caption: '傍晚换了一层光', tape: 'rgba(230, 199, 213, .78)' },
        { assetId: 'riverside-park', x: 790, y: 916, width: 250, height: 152, angle: -.02, caption: '树影还停在这里', tape: 'rgba(216, 227, 183, .78)' },
      ],
    },
    decorations: [{ assetId: 'handdrawn-rain', x: 922, y: 1027, width: 145, height: 126, angle: .045, opacity: .86, shadow: false }],
    body: { x: 125, y: 1175, width: 870, size: 40, angle: .008, color: '#f9faf7', paperStyle: 'ruled' },
    marks: 'time',
  },
  {
    title: { x: 72, y: 105, width: 960, size: 62, style: 'banner' },
    photos: [
      { src: 'city-street.png', x: 76, y: 385, width: 690, height: 690, angle: -.038, opacity: .88 },
      { src: 'city-dusk.png', x: 494, y: 633, width: 540, height: 520, angle: .048, opacity: .78 },
    ],
    stickers: [
      { id: 'D03_two_seasons_leaves.png', x: 103, y: 817, width: 370, height: 260, angle: -.08, opacity: .94 },
      { id: 'A01_round_sound_bubble.png', x: 676, y: 450, width: 200, height: 200, angle: .035, opacity: .9 },
    ],
    feature: {
      type: 'note-stack',
      items: [
        { assetId: 'tree-plaza', x: 82, y: 880, width: 246, height: 172, angle: -.045, caption: '她停了片刻', tape: 'rgba(235, 205, 216, .76)' },
        { assetId: 'riverside-park', x: 812, y: 381, width: 208, height: 150, angle: .055, caption: '同一阵风', tape: 'rgba(198, 225, 226, .78)' },
      ],
    },
    body: { x: 572, y: 1220, width: 465, size: 34, angle: -.012, color: '#f7f8f3', paperStyle: 'caption' },
    marks: 'time',
  },
  {
    title: { x: 78, y: 116, width: 1000, size: 72, style: 'cut' },
    photos: [{ src: 'park-river.png', x: 348, y: 430, width: 640, height: 660, angle: .032, opacity: .84 }],
    stickers: [
      { id: 'A01_round_sound_bubble.png', x: 635, y: 325, width: 285, height: 285, angle: -.06, opacity: .99 },
      { id: 'B03_osmanthus_branch.png', x: 128, y: 755, width: 350, height: 270, angle: .09, opacity: .88 },
    ],
    body: { x: 148, y: 1224, width: 810, size: 42, angle: -.008, color: '#fffefa', paperStyle: 'torn' },
    marks: 'invite',
  },
]

const PAGE_BACKDROPS = [
  'city-dusk.png',
  'city-street.png',
  'park-river.png',
  'market.png',
  'city-dusk.png',
  'park-river.png',
  'city-dusk.png',
  'park-river.png',
  'city-street.png',
  'city-dusk.png',
]

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('Missing Zine image: ' + src))
  image.src = src
})

function coverImage(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height)
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function tornPath(context, x, y, width, height, seed, roughness = 6) {
  const random = seededRandom(seed)
  const edgeStep = 28
  context.beginPath()
  context.moveTo(x, y + (random() - .5) * roughness)
  for (let px = x + edgeStep; px < x + width; px += edgeStep) context.lineTo(px, y + (random() - .5) * roughness)
  context.lineTo(x + width, y + (random() - .5) * roughness)
  for (let py = y + edgeStep; py < y + height; py += edgeStep) context.lineTo(x + width + (random() - .5) * roughness, py)
  context.lineTo(x + width + (random() - .5) * roughness, y + height)
  for (let px = x + width - edgeStep; px > x; px -= edgeStep) context.lineTo(px, y + height + (random() - .5) * roughness)
  context.lineTo(x + (random() - .5) * roughness, y + height)
  for (let py = y + height - edgeStep; py > y; py -= edgeStep) context.lineTo(x + (random() - .5) * roughness, py)
  context.closePath()
}

function drawPaperBase(context, paperImage, sceneryImage, index) {
  context.fillStyle = '#f2eee2'
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.save()
  if ('filter' in context) {
    context.filter = 'blur(34px) saturate(.62) brightness(1.08)'
    context.globalAlpha = .48
  } else context.globalAlpha = .18
  coverImage(context, sceneryImage, -72, -72, PAGE_WIDTH + 144, PAGE_HEIGHT + 144)
  context.restore()

  context.fillStyle = 'rgba(247, 244, 233, .42)'
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.save()
  context.globalAlpha = .115
  context.drawImage(paperImage, 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.restore()

  const random = seededRandom(index * 941 + 127)
  context.save()
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = 'rgba(55, 67, 56, .08)'
  for (let i = 0; i < 1550; i += 1) {
    const size = random() > .94 ? 2 : .8
    context.fillRect(random() * PAGE_WIDTH, random() * PAGE_HEIGHT, size, size)
  }
  context.restore()
}

function drawPaperPatch(context, x, y, width, height, seed, color = '#fffefa', angle = 0, roughness = 5) {
  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate(angle)
  tornPath(context, -width / 2, -height / 2, width, height, seed, roughness)
  context.shadowColor = 'rgba(28, 38, 30, .18)'
  context.shadowBlur = 14
  context.shadowOffsetX = 3
  context.shadowOffsetY = 7
  context.fillStyle = color
  context.fill()
  context.restore()
}

function drawPhotoScrap(context, image, item, seed) {
  context.save()
  context.translate(item.x + item.width / 2, item.y + item.height / 2)
  context.rotate(item.angle || 0)
  tornPath(context, -item.width / 2, -item.height / 2, item.width, item.height, seed, item.roughness || 11)
  context.shadowColor = 'rgba(21, 30, 24, .26)'
  context.shadowBlur = 22
  context.shadowOffsetX = 4
  context.shadowOffsetY = 12
  context.fillStyle = '#fff'
  context.fill()
  context.clip()
  context.shadowColor = 'transparent'
  context.globalAlpha = item.opacity ?? 1
  coverImage(context, image, -item.width / 2, -item.height / 2, item.width, item.height)
  context.restore()

  if (item.tape) drawTape(context, item.x + item.width * .42, item.y - 13, 96, item.angle || 0, item.tape)
}

function drawCollageCaption(context, text, x, y, width, paperScraps, seed, angle = 0) {
  const size = 22
  const font = '400 ' + size + 'px ' + TITLE_FAMILY
  const lines = wrapCollageText(context, text, width - 24, font, size, .13, .045)
  const lineHeight = size * 1.25
  const height = Math.max(42, lines.length * lineHeight + 15)
  drawPaperPatch(context, x, y, width, height, seed, '#fffdf4', angle, 4)
  drawCollageLines(context, lines, {
    x: x + 12,
    y: y + 8,
    size,
    lineHeight,
    font,
    paperScraps,
    seed: seed + 3,
    palette: ['#34453b', '#755049', '#475b50'],
    tileHeightRatio: 1.02,
    paperAlpha: .84,
    inkAlpha: .94,
  })
  return height
}

function drawClockPhoto(context, image, cx, cy, size, angle, seed) {
  const radius = size / 2
  context.save()
  context.translate(cx, cy)
  context.rotate(angle)
  context.shadowColor = 'rgba(23, 31, 25, .22)'
  context.shadowBlur = 11
  context.shadowOffsetX = 2
  context.shadowOffsetY = 5
  context.fillStyle = '#fffdf6'
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()
  context.clip()
  context.shadowColor = 'transparent'
  coverImage(context, image, -radius, -radius, size, size)
  context.restore()

  const wobble = (seed % 7) - 3
  context.save()
  context.strokeStyle = 'rgba(56, 65, 55, .72)'
  context.lineWidth = 2.2
  context.beginPath()
  context.arc(cx, cy, radius + wobble * .18, .04, Math.PI * 2 - .06)
  context.stroke()
  context.restore()
}

function drawPhotoClock(context, feature, images, seed) {
  const { cx, cy, radius, photoSize, assetIds, pointerAngle, centerNote } = feature
  context.save()
  context.strokeStyle = 'rgba(53, 67, 56, .62)'
  context.lineWidth = 2.4
  context.setLineDash([2, 10])
  context.beginPath()
  context.arc(cx, cy, radius, -.06, Math.PI * 2 - .06)
  context.stroke()
  context.setLineDash([])
  context.strokeStyle = 'rgba(77, 70, 59, .36)'
  context.lineWidth = 1.5
  context.beginPath()
  context.arc(cx, cy, radius + 9, .08, Math.PI * 2 - .12)
  context.stroke()

  for (let tick = 0; tick < 24; tick += 1) {
    const angle = (Math.PI * 2 * tick) / 24 - Math.PI / 2
    const inner = radius - (tick % 3 === 0 ? 20 : 10)
    context.beginPath()
    context.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    context.lineTo(cx + Math.cos(angle) * (radius - 2), cy + Math.sin(angle) * (radius - 2))
    context.stroke()
  }

  assetIds.forEach((assetId, index) => {
    const angle = (Math.PI * 2 * index) / assetIds.length - Math.PI / 2
    const photoX = cx + Math.cos(angle) * radius
    const photoY = cy + Math.sin(angle) * radius
    drawClockPhoto(context, images['collage:' + assetId], photoX, photoY, photoSize, (index % 2 ? -.045 : .035), seed + index * 17)
  })

  const tipX = cx + Math.cos(pointerAngle) * (radius - 58)
  const tipY = cy + Math.sin(pointerAngle) * (radius - 58)
  context.lineCap = 'round'
  context.strokeStyle = 'rgba(116, 58, 48, .82)'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(cx - 3, cy + 5)
  context.quadraticCurveTo(cx + 20, cy - 28, tipX, tipY)
  context.stroke()
  context.strokeStyle = 'rgba(248, 246, 231, .85)'
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(cx + 1, cy + 3)
  context.quadraticCurveTo(cx + 22, cy - 27, tipX, tipY)
  context.stroke()

  context.fillStyle = '#f7f3e7'
  context.beginPath()
  context.arc(cx, cy, 52, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = 'rgba(58, 65, 54, .72)'
  context.lineWidth = 2
  context.beginPath()
  context.arc(cx, cy, 52, .12, Math.PI * 2 - .09)
  context.stroke()
  context.fillStyle = '#39493d'
  context.font = '400 22px ' + TITLE_FAMILY
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(centerNote, cx, cy - 4)
  context.font = '400 12px ' + ENGLISH_FAMILY
  context.fillText('ONE SMALL SOUND', cx, cy + 19)
  context.fillStyle = '#a64e40'
  context.beginPath()
  context.arc(cx, cy, 7, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawContactSheet(context, feature, images, paperScraps, seed) {
  const { x, y, cellWidth, cellHeight, gapX, gapY, columns, assetIds, captions, photoSizes = [], offsets = [] } = feature
  assetIds.forEach((assetId, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const [photoWidth, photoHeight] = photoSizes[index] || [cellWidth, cellHeight]
    const [nudgeX, nudgeY] = offsets[index] || [(index % 3 - 1) * 5, index % 2 ? 8 : -3]
    const itemX = x + column * (cellWidth + gapX) + nudgeX
    const itemY = y + row * (cellHeight + gapY) + nudgeY
    const angle = ((index % 3) - 1) * .018 + (row ? .014 : -.008)
    drawPhotoScrap(context, images['collage:' + assetId], {
      x: itemX,
      y: itemY,
      width: photoWidth,
      height: photoHeight,
      angle,
      opacity: .98,
      tape: index % 2 ? 'rgba(223, 192, 211, .72)' : 'rgba(180, 224, 217, .78)',
    }, seed + index * 23)
    const labelY = itemY + photoHeight + 5
    const captionWidth = photoWidth - 14
    const captionHeight = drawCollageCaption(context, captions[index], itemX + 4, labelY, captionWidth, paperScraps, seed + index * 29 + 4, angle * -.3)
    context.save()
    context.fillStyle = 'rgba(72, 83, 69, .62)'
    context.font = '12px ' + ENGLISH_FAMILY
    context.textAlign = 'right'
    context.fillText(String(index + 1).padStart(2, '0'), itemX + photoWidth - 7, labelY + captionHeight + 11)
    context.restore()
  })

  context.save()
  context.strokeStyle = 'rgba(58, 108, 95, .66)'
  context.lineWidth = 2.2
  context.setLineDash([4, 12])
  context.beginPath()
  context.moveTo(x + 15, y + 25)
  context.bezierCurveTo(x - 2, y + 185, x + 17, y + 370, x + 31, y + 515)
  context.stroke()
  context.restore()
}

function drawPairedTime(context, feature, images, paperScraps, seed) {
  const { x, y, width, height, gap, assetIds, captions, details = [] } = feature
  const panelWidth = (width - gap) / 2
  assetIds.forEach((assetId, index) => {
    const itemX = x + index * (panelWidth + gap)
    const angle = index === 0 ? -.025 : .032
    drawPhotoScrap(context, images['collage:' + assetId], {
      x: itemX,
      y: y + (index ? 12 : 0),
      width: panelWidth,
      height,
      angle,
      opacity: .98,
      tape: index ? 'rgba(230, 202, 216, .72)' : 'rgba(193, 224, 205, .78)',
    }, seed + index * 31)
    drawCollageCaption(context, captions[index], itemX + 24, y + height + 18, panelWidth - 44, paperScraps, seed + index * 37 + 9, angle * -.45)
  })

  details.forEach((item, index) => {
    drawPhotoScrap(context, images['collage:' + item.assetId], item, seed + 71 + index * 47)
    const captionWidth = Math.min(item.width + 8, 252)
    drawCollageCaption(context, item.caption, item.x + (item.width - captionWidth) / 2, item.y + item.height + 8, captionWidth, paperScraps, seed + 79 + index * 53, (item.angle || 0) * -.35)
  })

  context.save()
  context.strokeStyle = 'rgba(122, 70, 60, .72)'
  context.lineWidth = 2.2
  context.setLineDash([3, 10])
  context.beginPath()
  context.moveTo(x + panelWidth + 10, y + height * .54)
  context.quadraticCurveTo(x + panelWidth + gap / 2, y + height * .43, x + panelWidth + gap - 10, y + height * .51)
  context.stroke()
  context.restore()
  drawPaperScrap(context, paperScraps, seed % 6, x + width / 2 - 17, y + height * .48, 34, 34, -.08, .92)
}

function drawNoteStack(context, feature, images, paperScraps, seed) {
  feature.items.forEach((item, index) => {
    drawPhotoScrap(context, images['collage:' + item.assetId], item, seed + index * 41)
    const captionWidth = Math.min(item.width + 6, 250)
    drawCollageCaption(context, item.caption, item.x + (item.width - captionWidth) / 2, item.y + item.height + 11, captionWidth, paperScraps, seed + index * 43 + 7, (item.angle || 0) * -.4)
  })
}

function drawScrapbookFeature(context, feature, images, paperScraps, seed) {
  if (!feature) return
  if (feature.type === 'photo-clock') drawPhotoClock(context, feature, images, seed)
  else if (feature.type === 'contact-sheet') drawContactSheet(context, feature, images, paperScraps, seed)
  else if (feature.type === 'paired-time') drawPairedTime(context, feature, images, paperScraps, seed)
  else if (feature.type === 'note-stack') drawNoteStack(context, feature, images, paperScraps, seed)
}

function drawTape(context, x, y, width, angle = 0, color = 'rgba(222, 231, 199, .74)') {
  context.save()
  context.translate(x + width / 2, y + 13)
  context.rotate(angle - .035)
  context.fillStyle = color
  context.fillRect(-width / 2, -13, width, 26)
  context.globalAlpha = .28
  context.strokeStyle = '#fff'
  context.lineWidth = 2
  context.setLineDash([5, 8])
  context.beginPath()
  context.moveTo(-width / 2 + 6, 0)
  context.lineTo(width / 2 - 6, 0)
  context.stroke()
  context.restore()
}

function drawPaperScrap(context, atlas, cell, x, y, width, height, angle = 0, alpha = 1) {
  const sourceX = (cell % 3) * PAPER_SCRAP_CELL
  const sourceY = Math.floor(cell / 3) * PAPER_SCRAP_CELL
  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate(angle)
  context.globalAlpha = alpha
  context.shadowColor = 'rgba(29, 34, 31, .16)'
  context.shadowBlur = 7
  context.shadowOffsetX = 2
  context.shadowOffsetY = 4
  context.drawImage(atlas, sourceX, sourceY, PAPER_SCRAP_CELL, PAPER_SCRAP_CELL, -width / 2, -height / 2, width, height)
  context.restore()
}

function addSticker(context, image, item) {
  const scale = Math.min(item.width / image.width, item.height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  context.save()
  context.translate(item.x + item.width / 2, item.y + item.height / 2)
  context.rotate(item.angle || 0)
  context.globalAlpha = item.opacity ?? 1
  context.filter = item.shadow === false ? 'none' : 'drop-shadow(1px 8px 10px rgba(17, 25, 21, .18))'
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  context.restore()
}

function wrapCollageText(context, text, maxWidth, font, size, tilePadRatio = .16, gapRatio = .055) {
  context.font = font
  const lines = []
  let line = []
  let lineWidth = 0
  for (const character of [...text]) {
    if (character === '\n') {
      if (line.length) lines.push(line)
      line = []
      lineWidth = 0
      continue
    }
    const isSpace = /\s/u.test(character)
    const glyphWidth = context.measureText(character).width
    const tileWidth = isSpace ? 0 : glyphWidth + Math.max(3, size * tilePadRatio)
    const advance = isSpace ? Math.max(glyphWidth, size * .3) : tileWidth + size * gapRatio
    const mustWrap = line.length > 0 && lineWidth + advance > maxWidth
    if (mustWrap && !CLOSING_PUNCTUATION.test(character)) {
      lines.push(line)
      line = []
      lineWidth = 0
    }
    if (isSpace && line.length === 0) continue
    line.push({ character, glyphWidth, tileWidth, advance, isSpace })
    lineWidth += advance
    if (mustWrap && CLOSING_PUNCTUATION.test(character)) {
      lines.push(line)
      line = []
      lineWidth = 0
    }
  }
  if (line.length) lines.push(line)
  return lines
}

function collageLineWidth(line) {
  return line.reduce((width, glyph) => width + glyph.advance, 0)
}

function drawCollageLines(context, lines, options) {
  const {
    x, y, size, lineHeight, font, paperScraps, seed, palette,
    tileHeightRatio = 1.14, paperAlpha = .9, inkAlpha = .97,
  } = options
  const random = seededRandom(seed)
  let glyphIndex = 0
  lines.forEach((line, rowIndex) => {
    let cursorX = x
    line.forEach((glyph) => {
      if (glyph.isSpace) {
        cursorX += glyph.advance
        return
      }
      const tileHeight = size * tileHeightRatio
      const tilt = (random() - .5) * .15
      const yJitter = (random() - .5) * Math.min(7, size * .12)
      context.save()
      drawPaperScrap(context, paperScraps, (seed + glyphIndex * 2 + rowIndex * 3) % 6, cursorX, y + rowIndex * lineHeight + yJitter, glyph.tileWidth, tileHeight, tilt, paperAlpha)
      context.translate(cursorX + glyph.tileWidth / 2, y + rowIndex * lineHeight + tileHeight / 2 + yJitter)
      context.rotate(tilt * .2)
      context.font = font
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      if (glyphIndex % 5 === 2) {
        context.globalAlpha = .16
        context.fillStyle = '#a95443'
        context.fillText(glyph.character, 1.4, 1)
      }
      context.globalAlpha = inkAlpha
      context.fillStyle = palette[glyphIndex % palette.length]
      context.fillText(glyph.character, 0, 0)
      context.restore()
      cursorX += glyph.advance
      glyphIndex += 1
    })
  })
  return y + lines.length * lineHeight
}

function drawCutLetterTitle(context, title, layout, index, paperScraps) {
  const font = '400 ' + layout.size + 'px ' + TITLE_FAMILY
  const lines = wrapCollageText(context, title, layout.width - 18, font, layout.size, .18, .055)
  const lineHeight = layout.size * 1.22
  const width = Math.min(layout.width, Math.max(...lines.map(collageLineWidth)) + 12)
  const height = lines.length * lineHeight + 6
  if (layout.style === 'banner') {
    drawPaperPatch(context, layout.x - 8, layout.y - 8, width + 14, height + 12, index * 53 + 9, '#fffefa', layout.angle || -.01, 7)
  }
  return drawCollageLines(context, lines, {
    x: layout.x,
    y: layout.y,
    size: layout.size,
    lineHeight,
    font,
    paperScraps,
    seed: index * 17 + 71,
    palette: ['#202a24', '#293b49', '#803e35', '#455b45'],
    tileHeightRatio: 1.08,
  })
}

function drawTitle(context, page, layout, index, paperScraps) {
  const titleBottom = drawCutLetterTitle(context, page.title, layout, index, paperScraps)
  if (page.english) {
    const size = 22
    const font = '400 ' + size + 'px ' + ENGLISH_FAMILY
    const lines = wrapCollageText(context, page.english, layout.width - 24, font, size, .2, .09)
    drawCollageLines(context, lines, {
      x: layout.x + 8,
      y: titleBottom + 3,
      size,
      lineHeight: size * 1.28,
      font,
      paperScraps,
      seed: index * 29 + 19,
      palette: ['#405b49', '#536d5b', '#744d49'],
      tileHeightRatio: 1.04,
      paperAlpha: .82,
      inkAlpha: .92,
    })
  }
}

function drawBody(context, page, layout, index, paperScraps) {
  const paddingX = 28
  const paddingY = 24
  const maxHeight = PAGE_HEIGHT - layout.y - 35
  let size = layout.size
  let font = '400 ' + size + 'px ' + BODY_FAMILY
  let lines = wrapCollageText(context, page.mainCopy, layout.width - paddingX * 2, font, size, .13, .045)
  let lineHeight = size * 1.42
  let height = Math.max(100, paddingY * 2 + lines.length * lineHeight)
  while (height > maxHeight && size > 30) {
    size -= 1
    font = '400 ' + size + 'px ' + BODY_FAMILY
    lines = wrapCollageText(context, page.mainCopy, layout.width - paddingX * 2, font, size, .13, .045)
    lineHeight = size * 1.42
    height = Math.max(100, paddingY * 2 + lines.length * lineHeight)
  }

  const angle = layout.angle || 0
  if (layout.paperStyle !== 'open') {
    const paperColor = layout.paperStyle === 'tissue'
      ? 'rgba(255, 254, 249, .84)'
      : layout.paperStyle === 'caption'
        ? 'rgba(255, 254, 246, .93)'
        : layout.color || '#fffefa'
    drawPaperPatch(context, layout.x, layout.y, layout.width, height, index * 101 + 23, paperColor, angle, layout.paperStyle === 'tissue' ? 11 : 6)
    context.save()
    context.translate(layout.x + layout.width / 2, layout.y + height / 2)
    context.rotate(angle)
    if (layout.paperStyle === 'ruled' || layout.paperStyle === 'handwritten') {
      context.strokeStyle = layout.paperStyle === 'handwritten' ? 'rgba(169, 99, 88, .3)' : 'rgba(105, 137, 137, .22)'
      context.lineWidth = 1.1
      for (let row = 1; row < lines.length + 1; row += 1) {
        const ruleY = -height / 2 + paddingY + row * lineHeight - 5
        context.beginPath()
        context.moveTo(-layout.width / 2 + 14, ruleY)
        context.lineTo(layout.width / 2 - 14, ruleY)
        context.stroke()
      }
    }
    if (layout.paperStyle === 'handwritten') {
      context.strokeStyle = 'rgba(171, 101, 89, .58)'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(-layout.width / 2 + 40, -height / 2 + 12)
      context.lineTo(-layout.width / 2 + 40, height / 2 - 12)
      context.stroke()
    }
    if (layout.paperStyle === 'caption') {
      context.strokeStyle = 'rgba(96, 113, 91, .28)'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(-layout.width / 2 + 14, -height / 2 + 11)
      context.lineTo(layout.width / 2 - 14, -height / 2 + 11)
      context.stroke()
    }
    context.restore()
  }
  context.save()
  context.translate(layout.x + layout.width / 2, layout.y + height / 2)
  context.rotate(angle)
  drawCollageLines(context, lines, {
    x: -layout.width / 2 + paddingX,
    y: -height / 2 + paddingY,
    size,
    lineHeight,
    font,
    paperScraps,
    seed: index * 103 + 29,
    palette: ['#26352b', '#2e3a32', '#4d493c', '#3c5148'],
    tileHeightRatio: 1.12,
    paperAlpha: .88,
    inkAlpha: .96,
  })
  context.restore()
}
function drawMarks(context, style, index, paperScraps) {
  const random = seededRandom(index * 37 + 401)
  context.save()
  context.strokeStyle = 'rgba(43, 90, 65, .72)'
  context.fillStyle = 'rgba(43, 90, 65, .72)'
  context.lineWidth = 3
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (style === 'waves') {
    for (let row = 0; row < 3; row += 1) {
      context.beginPath()
      context.moveTo(130, 925 + row * 24)
      context.bezierCurveTo(285, 900 + row * 25, 400, 968 + row * 23, 580, 925 + row * 25)
      context.bezierCurveTo(705, 896 + row * 24, 835, 965 + row * 20, 966, 918 + row * 27)
      context.stroke()
    }
  } else if (style === 'route') {
    const points = [[146, 936], [292, 885], [420, 925], [550, 835], [712, 858], [870, 740]]
    context.setLineDash([2, 15])
    context.beginPath()
    context.moveTo(points[0][0], points[0][1])
    points.slice(1).forEach(([x, y], i) => context.quadraticCurveTo(points[i][0] + (random() - .5) * 34, y + (random() - .5) * 24, x, y))
    context.stroke()
    context.setLineDash([])
    for (const [x, y] of [points[0], points[3], points[5]]) {
      context.beginPath()
      context.arc(x, y, 8, 0, Math.PI * 2)
      context.fill()
    }
  } else if (style === 'orbit') {
    context.setLineDash([2, 12])
    context.beginPath()
    context.ellipse(650, 615, 220, 170, -.28, -.5, 2.75)
    context.stroke()
    context.setLineDash([])
    context.beginPath()
    context.moveTo(862, 420)
    context.quadraticCurveTo(916, 382, 966, 416)
    context.stroke()
    context.beginPath()
    context.moveTo(950, 408)
    context.lineTo(970, 416)
    context.lineTo(952, 428)
    context.stroke()
  } else if (style === 'labels') {
    const notes = [
      { x: 132, y: 880, text: '巷口' },
      { x: 804, y: 390, text: '河風' },
      { x: 748, y: 980, text: '收攤前' },
    ]
    notes.forEach((note, i) => {
      context.save()
      context.translate(note.x, note.y)
      context.rotate((i % 2 ? -.04 : .035))
      const size = 24
      const font = '400 ' + size + 'px ' + TITLE_FAMILY
      const lines = wrapCollageText(context, note.text, 180, font, size, .16, .05)
      const width = Math.max(...lines.map(collageLineWidth)) + 18
      tornPath(context, -8, -27, width, 44, index * 71 + i, 4)
      context.fillStyle = ['#edf4ea', '#f3e9ec', '#eff0f7'][i]
      context.fill()
      drawCollageLines(context, lines, {
        x: 1,
        y: -18,
        size,
        lineHeight: 27,
        font,
        paperScraps,
        seed: index * 71 + i * 11,
        palette: ['#3c5545', '#4c4c46', '#684a4b'],
        tileHeightRatio: 1,
        paperAlpha: .78,
        inkAlpha: .95,
      })
      context.restore()
    })
  } else if (style === 'handwritten') {
    context.beginPath()
    context.moveTo(420, 930)
    context.quadraticCurveTo(530, 990, 634, 920)
    context.quadraticCurveTo(698, 878, 760, 914)
    context.stroke()
    context.beginPath()
    context.moveTo(750, 900)
    context.lineTo(764, 914)
    context.lineTo(746, 923)
    context.stroke()
    const size = 25
    const font = '400 ' + size + 'px ' + TITLE_FAMILY
    const note = '留在这里'
    const lines = wrapCollageText(context, note, 240, font, size, .16, .05)
    drawPaperPatch(context, 464, 949, Math.max(...lines.map(collageLineWidth)) + 22, 42, index * 83 + 5, '#f0f0df', -.025, 4)
    drawCollageLines(context, lines, {
      x: 476,
      y: 956,
      size,
      lineHeight: 29,
      font,
      paperScraps,
      seed: index * 97 + 3,
      palette: ['#49634f', '#6d846f', '#425a58'],
      tileHeightRatio: 1,
      paperAlpha: .82,
      inkAlpha: .95,
    })
  } else if (style === 'time') {
    context.setLineDash([3, 14])
    context.beginPath()
    context.moveTo(126, 1135)
    context.quadraticCurveTo(460, 1082, 994, 1168)
    context.stroke()
    context.setLineDash([])
    for (const x of [170, 557, 920]) {
      context.beginPath()
      context.arc(x, 1130 + random() * 18, 6, 0, Math.PI * 2)
      context.fill()
    }
  } else if (style === 'invite') {
    context.beginPath()
    context.moveTo(260, 1030)
    context.quadraticCurveTo(548, 1150, 838, 1040)
    context.stroke()
    context.beginPath()
    context.arc(870, 1025, 15, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
}

function drawPage(index, page, images, stickerByName) {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_WIDTH
  canvas.height = PAGE_HEIGHT
  const context = canvas.getContext('2d', { alpha: false })
  const layout = PAGE_LAYOUTS[index]
  const scenicImage = images['field:' + PAGE_BACKDROPS[index]]
  drawPaperBase(context, images.paperStock, scenicImage, index)

  layout.photos.forEach((item, photoIndex) => drawPhotoScrap(context, images['field:' + item.src], item, index * 113 + photoIndex * 31))
  drawScrapbookFeature(context, layout.feature, images, images.paperScraps, index * 127 + 43)
  drawMarks(context, layout.marks, index, images.paperScraps)
  layout.stickers.forEach((item) => addSticker(context, stickerByName[item.id], item))
  ;(layout.decorations || []).forEach((item) => addSticker(context, images['collage:' + item.assetId], item))
  drawTitle(context, page, layout.title, index, images.paperScraps)
  drawBody(context, page, layout.body, index, images.paperScraps)

  return {
    src: canvas,
    alt: page.alt,
    text: [page.title, page.english, page.mainCopy].filter(Boolean).join('\n'),
  }
}

export async function createPages() {
  await loadZineFonts()
  const stickerNames = [...new Set(ZINE_PAGES.flatMap((page) => page.assetIds))]
  const fieldNames = [...new Set(PAGE_LAYOUTS.flatMap((layout) => layout.photos.map((photo) => photo.src)))]
  const collageNames = [...new Set(PAGE_LAYOUTS.flatMap((layout) => [
    ...(layout.feature?.assetIds || []),
    ...(layout.feature?.items || []).map((item) => item.assetId),
    ...(layout.feature?.details || []).map((item) => item.assetId),
    ...(layout.decorations || []).map((item) => item.assetId),
  ]))]
  const sources = [
    ['paperStock', PAPER_STOCK],
    ['paperScraps', PAPER_SCRAPS],
    ...fieldNames.map((name) => ['field:' + name, FIELD + name]),
    ...stickerNames.map((name) => ['sticker:' + name, STICKERS + name]),
    ...collageNames.map((name) => ['collage:' + name, ZINE_COLLAGE_ASSETS.find((asset) => asset.id === name)?.src]),
  ]
  if (sources.some(([, src]) => !src)) throw new Error('Missing Zine collage asset mapping')
  const loaded = await Promise.all(sources.map(async ([key, src]) => [key, await loadImage(src)]))
  const images = Object.fromEntries(loaded)
  const stickerByName = Object.fromEntries(stickerNames.map((name) => [name, images['sticker:' + name]]))
  return ZINE_PAGES.map((page, index) => drawPage(index, page, images, stickerByName))
}
