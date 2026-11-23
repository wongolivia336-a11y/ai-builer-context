import { ZINE_PAGES } from './content.js'

const PAGE_WIDTH = 1120
const PAGE_HEIGHT = 1587
const FIELD = '/zine/assets/field/'
const STICKERS = '/zine/assets/stickers/'
const PAGE_PHOTOS = ['city-dusk.png', 'city-street.png', 'market.png', 'park-river.png', 'city-street.png', 'market.png', 'city-dusk.png', 'city-street.png', 'city-dusk.png', 'park-river.png']

const COPY_LAYOUTS = [
  { x: 142, y: 1020, width: 836, angle: -.006, titleSize: 62, bodySize: 36 },
  { x: 84, y: 1040, width: 866, angle: .005, titleSize: 50, bodySize: 32 },
  { x: 204, y: 1070, width: 824, angle: -.008, titleSize: 50, bodySize: 32 },
  { x: 96, y: 1030, width: 854, angle: .006, titleSize: 50, bodySize: 32 },
  { x: 210, y: 1080, width: 826, angle: -.005, titleSize: 50, bodySize: 33 },
  { x: 100, y: 1038, width: 884, angle: -.007, titleSize: 50, bodySize: 31 },
  { x: 176, y: 1054, width: 862, angle: .007, titleSize: 48, bodySize: 31 },
  { x: 76, y: 1080, width: 854, angle: -.006, titleSize: 50, bodySize: 32 },
  { x: 202, y: 1054, width: 834, angle: .006, titleSize: 50, bodySize: 32 },
  { x: 106, y: 1064, width: 876, angle: -.007, titleSize: 50, bodySize: 33 },
]

const COLLAGES = [
  [
    { id: 'A01_round_sound_bubble.png', x: 365, y: 170, width: 390, height: 390, angle: -.06, opacity: .98 },
    { id: 'B03_osmanthus_branch.png', x: 165, y: 485, width: 290, height: 230, angle: .1, opacity: .94 },
  ],
  [
    { id: 'B01_orange_soda.png', x: 755, y: 300, width: 250, height: 470, angle: .055, opacity: .96 },
    { id: 'B03_osmanthus_branch.png', x: 170, y: 610, width: 310, height: 240, angle: -.08, opacity: .9 },
  ],
  [
    { id: 'B02_ginkgo_pair.png', x: 575, y: 355, width: 430, height: 270, angle: .045, opacity: .97 },
    { id: 'A01_round_sound_bubble.png', x: 180, y: 510, width: 210, height: 210, angle: .08, opacity: .96 },
  ],
  [
    { id: 'B03_osmanthus_branch.png', x: 625, y: 350, width: 360, height: 275, angle: .035, opacity: .95 },
    { id: 'A01_round_sound_bubble.png', x: 245, y: 510, width: 245, height: 245, angle: -.08, opacity: .96 },
  ],
  [
    { id: 'A01_round_sound_bubble.png', x: 590, y: 345, width: 315, height: 315, angle: .04, opacity: .97 },
  ],
  [
    { id: 'B05_memory_pouch.png', x: 650, y: 350, width: 355, height: 360, angle: .045, opacity: .96 },
    { id: 'B03_osmanthus_branch.png', x: 160, y: 585, width: 330, height: 250, angle: -.09, opacity: .9 },
  ],
  [
    { id: 'D01_streetlamp_warm.png', x: 700, y: 310, width: 280, height: 470, angle: .025, opacity: .96 },
    { id: 'A01_round_sound_bubble.png', x: 260, y: 565, width: 220, height: 220, angle: -.07, opacity: .95 },
  ],
  [
    { id: 'D02_rain_puddle_ripples.png', x: 640, y: 340, width: 375, height: 380, angle: .035, opacity: .96 },
    { id: 'B02_ginkgo_pair.png', x: 205, y: 590, width: 300, height: 210, angle: -.08, opacity: .92 },
  ],
  [
    { id: 'D03_two_seasons_leaves.png', x: 605, y: 380, width: 415, height: 315, angle: .04, opacity: .96 },
    { id: 'A01_round_sound_bubble.png', x: 180, y: 555, width: 220, height: 220, angle: .07, opacity: .94 },
  ],
  [
    { id: 'A01_round_sound_bubble.png', x: 620, y: 335, width: 300, height: 300, angle: -.045, opacity: .98 },
    { id: 'B03_osmanthus_branch.png', x: 190, y: 540, width: 325, height: 250, angle: .085, opacity: .91 },
  ],
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

function tornPath(context, x, y, width, height, seed, roughness = 2.4) {
  const random = seededRandom(seed)
  const edgeStep = 24
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

function addPaper(context, x, y, width, height, seed, angle = 0) {
  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate(angle)
  tornPath(context, -width / 2, -height / 2, width, height, seed)
  context.shadowColor = 'rgba(14, 23, 19, .18)'
  context.shadowBlur = 15
  context.shadowOffsetX = 3
  context.shadowOffsetY = 8
  context.fillStyle = '#ffffff'
  context.fill()
  context.restore()
}

function wrapText(context, text, maxWidth, font) {
  context.font = font
  const lines = []
  let line = ''
  for (const character of [...text]) {
    const next = line + character
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line.trimEnd())
      line = character.trimStart()
    } else line = next
  }
  if (line) lines.push(line.trimEnd())
  return lines
}

function addSticker(context, image, x, y, width, height, angle = 0, opacity = 1) {
  const scale = Math.min(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate(angle)
  context.globalAlpha = opacity
  context.filter = 'drop-shadow(1px 7px 8px rgba(17, 25, 21, .17))'
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  context.restore()
}

function drawCopyPanel(context, page, index) {
  const layout = COPY_LAYOUTS[index]
  const paddingX = 48
  const paddingY = 36
  const innerWidth = layout.width - paddingX * 2
  const titleFont = layout.titleSize + 'px "KaiTi", "STKaiti", "Kaiti SC", serif'
  const englishFont = (index === 0 ? 23 : 20) + 'px Georgia, serif'
  const bodyFont = layout.bodySize + 'px "KaiTi", "STKaiti", "Kaiti SC", "Songti SC", serif'
  const titleLines = wrapText(context, page.title, innerWidth, titleFont)
  const bodyLines = wrapText(context, page.mainCopy, innerWidth, bodyFont)
  const titleLineHeight = layout.titleSize * 1.2
  const englishLineHeight = index === 0 ? 31 : 28
  const bodyLineHeight = layout.bodySize * 1.43
  const titleHeight = titleLines.length * titleLineHeight
  const bodyHeight = bodyLines.length * bodyLineHeight
  const height = paddingY * 2 + titleHeight + 11 + englishLineHeight + 18 + bodyHeight
  addPaper(context, layout.x, layout.y, layout.width, height, index * 79 + 13, layout.angle)

  context.save()
  context.translate(layout.x + layout.width / 2, layout.y + height / 2)
  context.rotate(layout.angle)
  const left = -layout.width / 2 + paddingX
  let top = -height / 2 + paddingY
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = '#242d28'
  context.font = titleFont
  titleLines.forEach((line) => {
    context.fillText(line, left, top)
    top += titleLineHeight
  })
  top += 11
  context.fillStyle = '#6b756e'
  context.font = englishFont
  context.fillText(page.english, left + 2, top, innerWidth)
  top += englishLineHeight + 18
  context.fillStyle = '#333a35'
  context.font = bodyFont
  bodyLines.forEach((line) => {
    context.fillText(line, left, top)
    top += bodyLineHeight
  })
  context.restore()
}

function drawPage(index, page, images, stickerByName) {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_WIDTH
  canvas.height = PAGE_HEIGHT
  const context = canvas.getContext('2d', { alpha: false })
  coverImage(context, images[PAGE_PHOTOS[index]], 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.fillStyle = 'rgba(16, 25, 20, .045)'
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  for (const item of COLLAGES[index]) {
    addSticker(context, stickerByName[item.id], item.x, item.y, item.width, item.height, item.angle, item.opacity)
  }
  drawCopyPanel(context, page, index)

  return { src: canvas, alt: page.alt, text: [page.title, page.english, page.mainCopy].join('\n') }
}

export async function createPages() {
  const stickerNames = [...new Set(ZINE_PAGES.flatMap((page) => page.assetIds))]
  const sources = [...new Set(PAGE_PHOTOS), ...stickerNames.map((name) => 'sticker:' + name)]
  const loaded = await Promise.all(sources.map(async (entry) => {
    if (entry.startsWith('sticker:')) {
      const name = entry.slice('sticker:'.length)
      return [name, await loadImage(STICKERS + name)]
    }
    return [entry, await loadImage(FIELD + entry)]
  }))
  const images = Object.fromEntries(loaded)
  const stickerByName = Object.fromEntries(stickerNames.map((name) => [name, images[name]]))
  return ZINE_PAGES.map((page, index) => drawPage(index, page, images, stickerByName))
}
