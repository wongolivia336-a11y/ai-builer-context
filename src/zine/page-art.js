const PAGE_WIDTH = 1120
const PAGE_HEIGHT = 1587
const PAGE_COPY = [
  { alt: '封面：湖边风景上叠着 MEMO Garden 字标与手写纸签。', text: '一颗泡泡的旅行。从一阵风开始，经过一座花园，留给下一位路过的人。' },
  { alt: '湖边风景和手写便签，讲述一段路上的声音记忆。', text: '一段路的记忆，不一定要拍成照片。风穿过树叶、远处的钟声、擦肩的一句晚安，也可以有自己的形状。' },
  { alt: '城市街景与撕边照片拼贴，展示发现、捕捉、回听三个步骤。', text: '发现一处声音，捕捉一刻，把喜欢的那颗收进自己的花园。地点里的公共泡泡仍留在原处。' },
  { alt: '河岸和路线拼贴，展示八颗声音泡泡的微型路线。', text: '八颗泡泡散落在路上。识别图是预览素材，路线用来讲述发现和收藏的故事。' },
  { alt: 'MEMO Catcher 产品海报的撕边剪贴，标注为概念方向图。', text: 'MEMO Catcher 是声音捕捉器的设计方向。手机负责取景和选择，按键捕捉是目标交互。' },
  { alt: '草地与声音泡泡剪贴，图示从发现到收藏的产品流程。', text: '发现、捕捉、收藏。当前页面只展示概念流程，未连接真实装置。' },
  { alt: '暮色城市照片和私人珍藏标签，说明捕捉只新增个人收藏。', text: '捕捉后，声音成为个人珍藏。原来的公共泡泡依然留在原地，下一位经过的人也可以遇见它。' },
  { alt: '湖边草地与白鹅照片，留给下一位漫游者的一张手写纸条。', text: '轮到你，种下一颗自己的声音泡泡。希望你经过这里时，刚好需要一点风。录音功能仅为示意。' },
  { alt: '八条声音记忆的图鉴拼贴，包含环境声、人声与碎念样例。', text: '河面上的风、巷口的钟声、刚经过的人、桂花茶的下午、雨停以后、收摊前的灯、没说出口的晚安、车铃经过。颜色和形状为逐条视觉提案。' },
  { alt: '结尾湖面与泡泡，邀请读者听见一处、捕捉一刻、留给下一位。', text: 'MEMO Garden 创建并珍藏声景记忆；MEMO Catcher 的方向是捕捉声音泡泡，让声音成为可回味的记忆。听见一处，捕捉一刻，留给下一位。' },
]

const PHOTO_PATHS = {
  lake: '/zine/assets/field/lake-river.png',
  alpine: '/zine/assets/field/alpine-meadow.png',
  city: '/zine/assets/field/city-street.png',
  dusk: '/zine/assets/field/city-dusk.png',
  geese: '/zine/assets/field/geese.png',
  market: '/zine/assets/field/market.png',
  garden: '/zine/assets/field/park-lake.png',
  river: '/zine/assets/field/park-river.png',
  poster: '/zine/assets/poster-blue-yellow-editorial.jpg',
  bubblePoster: '/zine/assets/poster-blue-dream.png',
  logo: '/zine/assets/memo-garden-bubble-wordmark.png',
  doodles: '/zine/assets/handdrawn-garden-doodles.png',
  pearl: '/zine/assets/bubble-sphere-pearl.webp',
  lilac: '/zine/assets/bubble-sphere-lilac.webp',
  rim: '/zine/assets/bubble-rim-pearl.webp',
  paper: '/zine/assets/paper-stock.png',
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function tornPath(context, x, y, width, height, random, roughness = 5) {
  const points = Math.max(12, Math.round(width / 28))
  context.beginPath()
  context.moveTo(x, y + (random() - 0.5) * roughness)
  for (let i = 1; i <= points; i += 1) context.lineTo(x + (width * i) / points, y + (random() - 0.5) * roughness)
  for (let i = 1; i <= Math.max(10, Math.round(height / 28)); i += 1) context.lineTo(x + width + (random() - 0.5) * roughness, y + (height * i) / Math.max(10, Math.round(height / 28)))
  for (let i = points; i >= 0; i -= 1) context.lineTo(x + (width * i) / points, y + height + (random() - 0.5) * roughness)
  for (let i = Math.max(10, Math.round(height / 28)); i >= 0; i -= 1) context.lineTo(x + (random() - 0.5) * roughness, y + (height * i) / Math.max(10, Math.round(height / 28)))
  context.closePath()
}

function coverImage(context, image, x, y, width, height, filter = 'saturate(.88) contrast(.98)') {
  const scale = Math.max(width / image.width, height / image.height)
  const cropWidth = width / scale
  const cropHeight = height / scale
  const sourceX = (image.width - cropWidth) / 2
  const sourceY = (image.height - cropHeight) / 2
  context.save()
  context.filter = filter
  context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, x, y, width, height)
  context.restore()
}

function addPhoto(context, image, x, y, width, height, angle, seed, filter = 'saturate(.9) contrast(.97)') {
  const random = seededRandom(seed)
  context.save()
  context.translate(x + width / 2, y + height / 2)
  context.rotate(angle)
  tornPath(context, -width / 2, -height / 2, width, height, random, 8)
  context.shadowColor = 'rgba(20, 24, 20, .28)'
  context.shadowBlur = 18
  context.shadowOffsetX = 6
  context.shadowOffsetY = 13
  context.fillStyle = '#f5f3e9'
  context.fill()
  context.shadowColor = 'transparent'
  context.save()
  tornPath(context, -width / 2 + 9, -height / 2 + 9, width - 18, height - 18, random, 5)
  context.clip()
  coverImage(context, image, -width / 2 + 9, -height / 2 + 9, width - 18, height - 18, filter)
  context.restore()
  context.restore()
}

function addTape(context, x, y, width, angle = -0.08) {
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.fillStyle = 'rgba(236, 222, 189, .78)'
  context.beginPath()
  context.moveTo(0, 4)
  context.lineTo(width, 0)
  context.lineTo(width - 4, 36)
  context.lineTo(4, 34)
  context.closePath()
  context.fill()
  context.globalAlpha = 0.22
  context.strokeStyle = '#fff'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(8, 8)
  context.lineTo(width - 8, 6)
  context.stroke()
  context.restore()
}

function addLabel(context, x, y, width, lines, options = {}) {
  const height = options.height ?? Math.max(112, lines.length * 62 + 45)
  const random = seededRandom(options.seed ?? Math.round(x + y + width))
  context.save()
  context.translate(x, y)
  context.rotate(options.angle ?? -0.025)
  tornPath(context, 0, 0, width, height, random, 5)
  context.shadowColor = 'rgba(21, 26, 24, .22)'
  context.shadowBlur = 18
  context.shadowOffsetY = 9
  context.fillStyle = options.paper ?? 'rgba(251, 250, 242, .96)'
  context.fill()
  context.shadowColor = 'transparent'
  context.textAlign = options.align ?? 'left'
  context.textBaseline = 'middle'
  context.fillStyle = options.ink ?? '#233933'
  context.font = options.font ?? '52px "KaiTi", "STKaiti", "DFKai-SB", cursive'
  const textX = options.align === 'center' ? width / 2 : 34
  const lineGap = options.lineGap ?? 62
  const startY = height / 2 - ((lines.length - 1) * lineGap) / 2 + (options.offsetY ?? 0)
  lines.forEach((line, index) => context.fillText(line, textX, startY + index * lineGap, width - 64))
  if (options.note) {
    context.textAlign = 'left'
    context.fillStyle = options.noteInk ?? '#b14d43'
    context.font = '24px "KaiTi", "STKaiti", "DFKai-SB", cursive'
    context.fillText(options.note, 34, height - 25, width - 68)
  }
  context.restore()
}

function addDoodle(context, image, index, x, y, size, angle = 0) {
  const columns = 4
  const cellWidth = image.width / columns
  const cellHeight = image.height / 2
  const sx = (index % columns) * cellWidth + 18
  const sy = Math.floor(index / columns) * cellHeight + 12
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.globalAlpha = 0.86
  context.globalCompositeOperation = 'multiply'
  context.drawImage(image, sx, sy, cellWidth - 36, cellHeight - 24, -size / 2, -size / 2, size, size)
  context.restore()
}

function addBubble(context, image, x, y, size, angle = 0) {
  context.save()
  context.translate(x + size / 2, y + size / 2)
  context.rotate(angle)
  context.drawImage(image, -size / 2, -size / 2, size, size)
  context.restore()
}

function drawRoute(context, points, color = '#c95145', width = 6) {
  context.save()
  context.strokeStyle = color
  context.lineWidth = width
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.globalAlpha = 0.92
  context.beginPath()
  context.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length - 1; i += 1) {
    const midpointX = (points[i][0] + points[i + 1][0]) / 2
    const midpointY = (points[i][1] + points[i + 1][1]) / 2
    context.quadraticCurveTo(points[i][0], points[i][1], midpointX, midpointY)
  }
  context.lineTo(points.at(-1)[0], points.at(-1)[1])
  context.stroke()
  context.restore()
}

function addFolio(context, index, label) {
  context.save()
  context.fillStyle = 'rgba(255, 255, 252, .82)'
  context.font = '19px "Arial", sans-serif'
  context.textAlign = 'left'
  context.fillText(`MEMO GARDEN     ${label}`, 48, PAGE_HEIGHT - 42)
  context.textAlign = 'right'
  context.font = 'italic 27px Georgia, serif'
  context.fillStyle = '#aa5548'
  context.fillText(String(index + 1).padStart(2, '0'), PAGE_WIDTH - 48, PAGE_HEIGHT - 38)
  context.restore()
}

function addTexture(context, paper) {
  context.save()
  context.globalAlpha = 0.075
  context.globalCompositeOperation = 'soft-light'
  context.drawImage(paper, 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.restore()
  context.save()
  context.fillStyle = 'rgba(245, 244, 234, .07)'
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  context.restore()
}

function addHeading(context, eyebrow, title, options = {}) {
  context.save()
  context.textAlign = options.align ?? 'left'
  const x = options.x ?? 72
  context.fillStyle = options.eyebrowColor ?? '#f8f6eb'
  context.font = '22px "Arial", "Microsoft YaHei", sans-serif'
  context.fillText(eyebrow, x, options.y ?? 108)
  context.fillStyle = options.color ?? '#fffdf3'
  context.font = options.font ?? '66px "KaiTi", "STKaiti", "DFKai-SB", serif'
  context.fillText(title, x, (options.y ?? 108) + 96, PAGE_WIDTH - 144)
  context.restore()
}

function drawPage(index, images) {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_WIDTH
  canvas.height = PAGE_HEIGHT
  const context = canvas.getContext('2d', { alpha: false })
  const label = ['开篇', '听见', '路上', '路线', '装置', '捕捉', '珍藏', '共创', '图鉴', '留白'][index]
  const backgrounds = ['lake', 'garden', 'city', 'market', 'river', 'alpine', 'dusk', 'geese', 'market', 'lake']
  coverImage(context, images[backgrounds[index]], 0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'saturate(.9) contrast(.98)')
  context.fillStyle = 'rgba(18, 28, 24, .13)'
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  if (index === 0) {
    const mark = document.createElement('canvas')
    mark.width = 920
    mark.height = 228
    const markContext = mark.getContext('2d')
    markContext.drawImage(images.bubblePoster, images.bubblePoster.width * 0.055, images.bubblePoster.height * 0.075, images.bubblePoster.width * 0.89, images.bubblePoster.height * 0.19, 0, 0, mark.width, mark.height)
    addPhoto(context, mark, 103, 102, 914, 226, -0.008, 31, 'saturate(.96) contrast(.98)')
    addDoodle(context, images.doodles, 0, 886, 450, 170, 0.08)
    addBubble(context, images.pearl, 750, 1140, 192, -0.08)
    addBubble(context, images.rim, 140, 970, 118, 0.15)
    addLabel(context, 145, 566, 824, ['一颗泡泡的旅行'], { height: 196, font: '78px "KaiTi", "STKaiti", "DFKai-SB", cursive', align: 'center', angle: -0.018, seed: 42, note: '从一阵风开始，留给下一位路过的人', noteInk: '#ad4d42' })
    addTape(context, 448, 548, 202, -0.04)
    addFolio(context, index, 'FIELD NOTE')
  } else if (index === 1) {
    addHeading(context, '01 / SOUND LEAVES A TRACE', '一段路，也能被听见', { y: 104 })
    addPhoto(context, images.dusk, 102, 390, 435, 560, -0.035, 201, 'saturate(.72)')
    addTape(context, 225, 372, 148, -0.05)
    addLabel(context, 508, 542, 500, ['风穿过树叶', '钟声落在街角'], { height: 232, font: '48px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: 0.026, seed: 23, note: '声音也可以有自己的形状' })
    addDoodle(context, images.doodles, 2, 856, 1040, 160, -0.14)
    addBubble(context, images.lilac, 814, 1050, 136, 0.04)
    addFolio(context, index, 'LISTEN')
  } else if (index === 2) {
    addHeading(context, '02 / A WALK HAS ITS OWN MAP', '把耳朵带上路', { y: 100 })
    drawRoute(context, [[128, 540], [268, 664], [423, 586], [568, 742], [718, 656], [902, 820]], '#c95c4b', 7)
    addPhoto(context, images.garden, 114, 410, 400, 504, -0.045, 33)
    addTape(context, 235, 392, 152, -0.04)
    addLabel(context, 590, 516, 402, ['发现', '捕捉', '回听'], { height: 320, font: '55px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: 0.035, seed: 9, note: '让漫游多一条听觉路线' })
    addDoodle(context, images.doodles, 3, 899, 1046, 144, 0.11)
    addFolio(context, index, 'WALK')
  } else if (index === 3) {
    addHeading(context, '03 / EIGHT LITTLE SOUNDS', '路上藏着八颗泡泡', { y: 88, font: '60px "KaiTi", "STKaiti", "DFKai-SB", serif' })
    addPhoto(context, images.lake, 78, 428, 470, 718, -0.022, 43, 'saturate(.82)')
    drawRoute(context, [[552, 420], [662, 560], [798, 474], [914, 642], [756, 800], [902, 990], [634, 1102]], '#b24b43', 8)
    const positions = [[634, 420], [834, 488], [954, 646], [736, 724], [944, 920], [742, 1040], [560, 884], [852, 1160]]
    positions.forEach(([x, y], i) => {
      addBubble(context, i % 2 ? images.pearl : images.lilac, x, y, 96, (i % 3) * 0.06)
      context.fillStyle = '#faf7ea'
      context.font = '22px "KaiTi", "STKaiti", "DFKai-SB", cursive'
      context.fillText(String(i + 1).padStart(2, '0'), x + 10, y + 128)
    })
    addLabel(context, 552, 1250, 466, ['听见一处，', '就有一颗记忆'], { height: 204, font: '42px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: -0.02, seed: 11 })
    addFolio(context, index, 'ROUTE')
  } else if (index === 4) {
    addHeading(context, '04 / MEMO CATCHER', '给声音一个入口', { y: 94 })
    addPhoto(context, images.poster, 156, 402, 796, 806, 0.025, 88, 'saturate(.88)')
    addTape(context, 435, 384, 196, 0.035)
    addLabel(context, 98, 1232, 666, ['随身捕捉器', '设计方向图'], { height: 184, font: '47px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: -0.028, seed: 28, note: '概念图 · 未连接真实装置' })
    addDoodle(context, images.doodles, 4, 902, 1350, 145, -0.08)
    addFolio(context, index, 'OBJECT')
  } else if (index === 5) {
    addHeading(context, '05 / KEEP WHAT YOU HEARD', '轻轻接住这一刻', { y: 94 })
    addPhoto(context, images.alpine, 102, 400, 888, 666, -0.022, 15, 'saturate(.82)')
    addTape(context, 458, 380, 176, 0.025)
    addBubble(context, images.pearl, 682, 1000, 222, -0.06)
    addDoodle(context, images.doodles, 5, 286, 1208, 178, 0.06)
    addLabel(context, 186, 1136, 548, ['地点留下声音', '你带走自己的收藏'], { height: 202, font: '42px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: 0.018, seed: 71, note: '动作示意，不代表硬件已接入' })
    addFolio(context, index, 'CATCH')
  } else if (index === 6) {
    addHeading(context, '06 / A MEMORY TO KEEP', '原来的泡泡还在原地', { y: 100, font: '58px "KaiTi", "STKaiti", "DFKai-SB", serif' })
    addPhoto(context, images.city, 86, 426, 508, 568, -0.032, 64, 'saturate(.78)')
    addPhoto(context, images.geese, 552, 724, 416, 474, 0.035, 48, 'saturate(.82)')
    addTape(context, 222, 410, 170, -0.07)
    addLabel(context, 556, 444, 414, ['收进口袋的', '是你的回声'], { height: 208, font: '45px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: 0.028, seed: 105, note: '捕捉只新增个人珍藏' })
    addDoodle(context, images.doodles, 1, 880, 1290, 154, 0.1)
    addFolio(context, index, 'MEMORY')
  } else if (index === 7) {
    addHeading(context, '07 / FOR THE NEXT WALKER', '轮到你留下一点声音', { y: 90, font: '59px "KaiTi", "STKaiti", "DFKai-SB", serif' })
    addPhoto(context, images.geese, 116, 392, 870, 742, -0.018, 17, 'saturate(.86)')
    addTape(context, 444, 370, 190, -0.02)
    addLabel(context, 198, 1102, 722, ['希望你经过这里时，', '刚好需要一点风。'], { height: 216, font: '46px "KaiTi", "STKaiti", "DFKai-SB", cursive', align: 'center', angle: -0.02, seed: 32, note: '录音功能为概念示意，未打开麦克风' })
    addDoodle(context, images.doodles, 7, 932, 1280, 146, -0.08)
    addFolio(context, index, 'A NOTE')
  } else if (index === 8) {
    addHeading(context, '08 / SOUND SPECIMENS', '八种声音，八种记忆', { y: 78, font: '58px "KaiTi", "STKaiti", "DFKai-SB", serif' })
    const entries = [
      ['河面上的风', '环境声 · 雾蓝'], ['巷口的钟声', '环境声 · 雾蓝'],
      ['刚经过的人', '人声 · 玫瑰粉'], ['桂花茶的下午', '碎念 · 淡紫'],
      ['雨停以后', '碎念 · 淡紫'], ['收摊前的灯', '环境声 · 雾蓝'],
      ['没说出口的晚安', '人声 · 玫瑰粉'], ['车铃经过', '环境声 · 雾蓝'],
    ]
    const colors = ['#8fb9c1', '#8fb9c1', '#cc7184', '#9d83b3', '#9d83b3', '#8fb9c1', '#cc7184', '#d3a84d']
    entries.forEach(([title, detail], i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 68 + col * 510 + (row % 2 ? 7 : 0)
      const y = 346 + row * 265
      const random = seededRandom(i + 220)
      tornPath(context, x, y, 454, 218, random, 4)
      context.save()
      context.shadowColor = 'rgba(18, 23, 21, .18)'
      context.shadowBlur = 14
      context.shadowOffsetY = 7
      context.fillStyle = 'rgba(251,250,242,.94)'
      context.fill()
      context.restore()
      context.fillStyle = colors[i]
      context.beginPath()
      context.arc(x + 75, y + 108, 43, 0, Math.PI * 2)
      context.fill()
      context.globalAlpha = 0.78
      context.drawImage(images.rim, x + 30, y + 62, 92, 92)
      context.globalAlpha = 1
      context.fillStyle = '#283831'
      context.textAlign = 'left'
      context.font = '37px "KaiTi", "STKaiti", "DFKai-SB", cursive'
      context.fillText(title, x + 145, y + 96, 284)
      context.fillStyle = '#65736a'
      context.font = '23px "Arial", "Microsoft YaHei", sans-serif'
      context.fillText(detail, x + 147, y + 145, 278)
      addDoodle(context, images.doodles, i % 8, x + 410, y + 190, 66, (i % 3) * 0.1)
    })
    addLabel(context, 246, 1400, 630, ['颜色与形状，逐条提案'], { height: 116, font: '38px "KaiTi", "STKaiti", "DFKai-SB", cursive', align: 'center', angle: 0.01, seed: 5 })
    addFolio(context, index, 'INDEX')
  } else {
    addPhoto(context, images.garden, 94, 384, 452, 610, -0.038, 107, 'saturate(.82)')
    addHeading(context, 'A LITTLE SOUND TO CARRY', '听见一处，捕捉一刻', { y: 125, font: '57px "KaiTi", "STKaiti", "DFKai-SB", serif' })
    addLabel(context, 518, 556, 476, ['留给下一位', '路过的人'], { height: 210, font: '49px "KaiTi", "STKaiti", "DFKai-SB", cursive', angle: 0.027, seed: 400, note: 'MEMO GARDEN × MEMO CATCHER' })
    addBubble(context, images.pearl, 693, 990, 196, 0.02)
    addDoodle(context, images.doodles, 6, 212, 1210, 132, 0.06)
    context.drawImage(images.logo, 95, 1260, 448, 96)
    addFolio(context, index, 'UNTIL NEXT TIME')
  }

  addTexture(context, images.paper)
  return { src: canvas, ...PAGE_COPY[index] }
}

export async function createPages() {
  const entries = Object.entries(PHOTO_PATHS)
  const loaded = await Promise.all(entries.map(async ([key, path]) => [key, await loadImage(path)]))
  const images = Object.fromEntries(loaded)
  return PAGE_COPY.map((_, index) => drawPage(index, images))
}
