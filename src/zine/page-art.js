import { ZINE_PAGES } from './content.js'

const PAGE_WIDTH = 1120
const PAGE_HEIGHT = 1587
const FIELD = '/zine/assets/field/'
const STICKERS = '/zine/assets/stickers/'
const PAPER_STOCK = '/zine/assets/paper-stock.png'
const PAPER_SCRAPS = '/zine/assets/collage/torn-paper-sheet-v1.png'
const TITLE_FAMILY = '"Microsoft YaHei UI", "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif'
const BODY_FAMILY = '"Microsoft YaHei", "Microsoft YaHei UI", "PingFang SC", "Noto Sans SC", sans-serif'
const CUT_TITLE_FACES = [
  '"Microsoft YaHei UI", "Microsoft YaHei", sans-serif',
  '"SimHei", "Microsoft YaHei", sans-serif',
  '"SimSun", "Songti SC", serif',
]
const PAPER_SCRAP_CELL = 512

const PAGE_LAYOUTS = [
  {
    title: { x: 74, y: 128, width: 970, size: 86, style: 'cut' },
    photos: [{ src: 'city-dusk.png', x: 112, y: 500, width: 890, height: 650, angle: -.022, opacity: .96 }],
    stickers: [
      { id: 'B03_osmanthus_branch.png', x: 82, y: 700, width: 320, height: 260, angle: -.11, opacity: .88 },
      { id: 'A01_round_sound_bubble.png', x: 650, y: 425, width: 300, height: 300, angle: .06, opacity: .98 },
    ],
    body: { x: 134, y: 1250, width: 840, size: 40, angle: .012, color: '#fffefa' },
    marks: 'orbit',
  },
  {
    title: { x: 72, y: 102, width: 940, size: 67, style: 'ink' },
    photos: [{ src: 'city-street.png', x: 56, y: 310, width: 1010, height: 690, angle: .009, opacity: .94 }],
    stickers: [{ id: 'B01_orange_soda.png', x: 770, y: 575, width: 245, height: 345, angle: .06, opacity: .94 }],
    body: { x: 106, y: 1100, width: 900, size: 40, angle: -.009, color: '#f7f8f2' },
    marks: 'waves',
  },
  {
    title: { x: 86, y: 105, width: 930, size: 65, style: 'cut' },
    photos: [
      { src: 'city-street.png', x: 82, y: 358, width: 665, height: 590, angle: -.045, opacity: .96 },
      { src: 'park-river.png', x: 450, y: 676, width: 590, height: 480, angle: .052, opacity: .78 },
    ],
    stickers: [{ id: 'B02_ginkgo_pair.png', x: 610, y: 390, width: 320, height: 240, angle: .08, opacity: .94 }],
    body: { x: 125, y: 1268, width: 835, size: 40, angle: .01, color: '#fffefa' },
    marks: 'route',
  },
  {
    title: { x: 68, y: 102, width: 970, size: 63, style: 'cut' },
    photos: [{ src: 'market.png', x: 195, y: 420, width: 790, height: 685, angle: .028, opacity: .9 }],
    stickers: [
      { id: 'B03_osmanthus_branch.png', x: 630, y: 355, width: 380, height: 285, angle: .065, opacity: .76 },
      { id: 'A01_round_sound_bubble.png', x: 385, y: 494, width: 280, height: 280, angle: -.045, opacity: .98 },
    ],
    body: { x: 122, y: 1240, width: 870, size: 40, angle: -.015, color: '#f8f8f4' },
    marks: 'orbit',
  },
  {
    title: { x: 82, y: 122, width: 750, size: 70, style: 'banner' },
    photos: [{ src: 'city-dusk.png', x: 555, y: 350, width: 475, height: 710, angle: .036, opacity: .92 }],
    stickers: [{ id: 'A01_round_sound_bubble.png', x: 120, y: 500, width: 290, height: 290, angle: .075, opacity: .98 }],
    body: { x: 100, y: 1162, width: 800, size: 42, angle: .014, color: '#fffefa' },
    marks: 'route',
  },
  {
    title: { x: 66, y: 92, width: 990, size: 60, style: 'banner' },
    photos: [
      { src: 'city-street.png', x: 80, y: 330, width: 550, height: 530, angle: -.028, opacity: .91 },
      { src: 'park-river.png', x: 530, y: 480, width: 500, height: 485, angle: .045, opacity: .8 },
    ],
    stickers: [{ id: 'B05_memory_pouch.png', x: 343, y: 780, width: 390, height: 310, angle: -.04, opacity: .96 }],
    body: { x: 104, y: 1162, width: 900, size: 38, angle: -.008, color: '#f4f8f4' },
    marks: 'labels',
  },
  {
    title: { x: 72, y: 104, width: 970, size: 62, style: 'cut' },
    photos: [{ src: 'city-dusk.png', x: 738, y: 285, width: 300, height: 660, angle: .045, opacity: .82 }],
    stickers: [
      { id: 'A01_round_sound_bubble.png', x: 170, y: 475, width: 300, height: 300, angle: -.05, opacity: .96 },
      { id: 'D01_streetlamp_warm.png', x: 662, y: 428, width: 280, height: 490, angle: .025, opacity: .94 },
    ],
    body: { x: 155, y: 1155, width: 790, size: 40, angle: .018, color: '#fffefa', handwritten: true },
    marks: 'handwritten',
  },
  {
    title: { x: 74, y: 102, width: 920, size: 65, style: 'ink' },
    photos: [
      { src: 'city-dusk.png', x: 110, y: 350, width: 900, height: 535, angle: -.018, opacity: .5 },
      { src: 'city-dusk.png', x: 250, y: 700, width: 720, height: 470, angle: .036, opacity: .88 },
    ],
    stickers: [
      { id: 'D02_rain_puddle_ripples.png', x: 490, y: 855, width: 280, height: 235, angle: -.065, opacity: .89 },
      { id: 'B02_ginkgo_pair.png', x: 110, y: 815, width: 290, height: 215, angle: .08, opacity: .91 },
    ],
    body: { x: 125, y: 1260, width: 870, size: 40, angle: .008, color: '#f9faf7' },
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
    body: { x: 572, y: 1220, width: 465, size: 34, angle: -.012, color: '#f7f8f3' },
    marks: 'time',
  },
  {
    title: { x: 78, y: 116, width: 1000, size: 72, style: 'cut' },
    photos: [{ src: 'park-river.png', x: 348, y: 430, width: 640, height: 660, angle: .032, opacity: .84 }],
    stickers: [
      { id: 'A01_round_sound_bubble.png', x: 635, y: 325, width: 285, height: 285, angle: -.06, opacity: .99 },
      { id: 'B03_osmanthus_branch.png', x: 128, y: 755, width: 350, height: 270, angle: .09, opacity: .88 },
    ],
    body: { x: 148, y: 1224, width: 810, size: 42, angle: -.008, color: '#fffefa' },
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

  context.fillStyle = 'rgba(247, 244, 233, .52)'
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
  context.filter = 'drop-shadow(1px 8px 10px rgba(17, 25, 21, .18))'
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
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

function wrapTitle(context, title, width, size, cutLetters = false) {
  const font = `800 ${size}px ${TITLE_FAMILY}`
  context.font = font
  const rows = []
  let current = ''
  let currentWidth = 0
  for (const character of [...title]) {
    const characterWidth = context.measureText(character).width + (cutLetters ? 34 : 0)
    if (current && currentWidth + characterWidth > width) {
      rows.push(current)
      current = character
      currentWidth = characterWidth
    } else {
      current += character
      currentWidth += characterWidth
    }
  }
  if (current) rows.push(current)
  return { rows, font }
}

function drawCutLetterTitle(context, title, layout, index, paperScraps) {
  const { rows } = wrapTitle(context, title, layout.width, layout.size, true)
  const random = seededRandom(index * 17 + 71)
  const palette = ['#202a24', '#293b49', '#803e35', '#455b45']
  let rowY = layout.y
  rows.forEach((row, rowIndex) => {
    let cursorX = layout.x
    for (const [charIndex, character] of [...row].entries()) {
      const face = CUT_TITLE_FACES[(index + rowIndex + charIndex) % CUT_TITLE_FACES.length]
      const fontSize = layout.size * (.93 + random() * .12)
      const fontWeight = face.includes('SimSun') ? 700 : (random() > .48 ? 900 : 800)
      const font = `${fontWeight} ${fontSize}px ${face}`
      context.font = font
      const glyphWidth = context.measureText(character).width
      const tileWidth = glyphWidth + 15 + random() * 14
      const tileHeight = layout.size * (.98 + random() * .16)
      const tilt = (random() - .5) * .18
      const yJitter = (random() - .5) * 8
      context.save()
      drawPaperScrap(context, paperScraps, (index + charIndex * 2 + rowIndex) % 6, cursorX - 4, rowY + yJitter - 5, tileWidth + 8, tileHeight + 10, tilt, .9)
      context.translate(cursorX + tileWidth / 2, rowY + tileHeight / 2 + yJitter)
      context.rotate(tilt * .22)
      if ((charIndex + rowIndex) % 3 === 1) {
        context.globalAlpha = .2
        context.fillStyle = '#a95443'
        context.font = font
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(character, 1.8, 1.1)
      }
      context.globalAlpha = .97
      context.fillStyle = palette[(index + charIndex + rowIndex) % palette.length]
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = font
      context.fillText(character, 0, 0)
      context.restore()
      cursorX += tileWidth + (random() > .56 ? 1 : 5)
    }
    rowY += layout.size * 1.19
  })
  return rowY
}

function drawTitle(context, page, layout, index, paperScraps) {
  const { rows, font } = wrapTitle(context, page.title, layout.width - 24, layout.size, layout.style === 'cut')
  const lineHeight = layout.size * 1.25
  let titleBottom
  if (layout.style === 'cut') {
    titleBottom = drawCutLetterTitle(context, page.title, layout, index, paperScraps)
  } else {
    const widths = rows.map((row) => {
      context.font = font
      return context.measureText(row).width
    })
    const patchWidth = Math.min(layout.width, Math.max(...widths) + 46)
    const patchHeight = rows.length * lineHeight + 32
    if (layout.style === 'banner') drawPaperPatch(context, layout.x - 10, layout.y - 10, patchWidth, patchHeight, index * 53 + 9, '#fffefa', layout.angle || -.01, 7)
    context.save()
    if (layout.angle) {
      context.translate(layout.x + patchWidth / 2, layout.y + patchHeight / 2)
      context.rotate(layout.angle)
      context.translate(-(layout.x + patchWidth / 2), -(layout.y + patchHeight / 2))
    }
    context.font = font
    context.textAlign = 'left'
    context.textBaseline = 'top'
    context.fillStyle = '#202a24'
    rows.forEach((row, lineIndex) => {
      const y = layout.y + 3 + lineIndex * lineHeight
      if ((index + lineIndex) % 2 === 0) {
        context.globalAlpha = .18
        context.fillStyle = '#a95443'
        context.fillText(row, layout.x + 13.5, y + .8)
        context.globalAlpha = 1
        context.fillStyle = '#202a24'
      }
      context.fillText(row, layout.x + 12, y)
    })
    context.restore()
    titleBottom = layout.y + rows.length * lineHeight
  }

  if (page.english) {
    context.save()
    context.font = 'italic 22px Georgia, "Times New Roman", serif'
    context.fillStyle = '#5f7566'
    context.textAlign = 'left'
    context.textBaseline = 'top'
    context.fillText(page.english, layout.x + 8, titleBottom + 4, layout.width - 20)
    context.restore()
  }
}

function drawBody(context, page, layout, index) {
  const paddingX = 34
  const paddingY = 28
  const font = `${layout.size}px ${BODY_FAMILY}`
  const lines = wrapText(context, page.mainCopy, layout.width - paddingX * 2, font)
  const lineHeight = layout.size * 1.55
  const height = Math.max(100, paddingY * 2 + lines.length * lineHeight)

  drawPaperPatch(context, layout.x, layout.y, layout.width, height, index * 101 + 23, layout.color || '#fffefa', layout.angle || 0, 6)
  context.save()
  context.translate(layout.x + layout.width / 2, layout.y + height / 2)
  context.rotate(layout.angle || 0)
  context.font = font
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = '#26352b'
  lines.forEach((line, lineIndex) => context.fillText(line, -layout.width / 2 + paddingX, -height / 2 + paddingY + lineIndex * lineHeight))
  context.restore()
}

function drawMarks(context, style, index) {
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
      context.font = '24px ' + TITLE_FAMILY
      const width = context.measureText(note.text).width + 32
      tornPath(context, -8, -27, width, 44, index * 71 + i, 4)
      context.fillStyle = ['#edf4ea', '#f3e9ec', '#eff0f7'][i]
      context.fill()
      context.fillStyle = '#3c5545'
      context.textBaseline = 'middle'
      context.fillText(note.text, 8, -1)
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
    context.font = '25px "Microsoft YaHei", sans-serif'
    context.fillStyle = '#6d846f'
    context.fillText('留在这里', 476, 975)
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
  drawMarks(context, layout.marks, index)
  layout.stickers.forEach((item) => addSticker(context, stickerByName[item.id], item))
  drawTitle(context, page, layout.title, index, images.paperScraps)
  drawBody(context, page, layout.body, index)

  return {
    src: canvas,
    alt: page.alt,
    text: [page.title, page.english, page.mainCopy].filter(Boolean).join('\n'),
  }
}

export async function createPages() {
  const stickerNames = [...new Set(ZINE_PAGES.flatMap((page) => page.assetIds))]
  const fieldNames = [...new Set(PAGE_LAYOUTS.flatMap((layout) => layout.photos.map((photo) => photo.src)))]
  const sources = [
    ['paperStock', PAPER_STOCK],
    ['paperScraps', PAPER_SCRAPS],
    ...fieldNames.map((name) => ['field:' + name, FIELD + name]),
    ...stickerNames.map((name) => ['sticker:' + name, STICKERS + name]),
  ]
  const loaded = await Promise.all(sources.map(async ([key, src]) => [key, await loadImage(src)]))
  const images = Object.fromEntries(loaded)
  const stickerByName = Object.fromEntries(stickerNames.map((name) => [name, images['sticker:' + name]]))
  return ZINE_PAGES.map((page, index) => drawPage(index, page, images, stickerByName))
}
