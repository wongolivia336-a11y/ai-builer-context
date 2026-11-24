import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAKING_OF_MEDIA, MAKING_OF_ROLE_LABELS, MAKING_OF_STAGES } from './media';
import { getMakingOfGeometry } from './galleryGeometry.js';
import { MAKING_OF_STAGE_NOTES } from './narrative.js';
import './MakingOfPage.css';

const STAGE_LABELS = MAKING_OF_STAGES.map((stage) => stage.label);
const SPHERE_BANDS = MAKING_OF_STAGES.map((stage) => stage.band);
const STAGE_DIFFUSE_COLORS = ['#f6b7d2', '#a4dce1', '#b8dfbb', '#c9b8e7', '#f1d891'];

function projectPoint(longitude, latitude, radius, centerX, centerY, tilt, distance) {
  const x = radius * Math.cos(latitude) * Math.sin(longitude);
  const y = radius * Math.sin(latitude);
  const z = radius * Math.cos(latitude) * Math.cos(longitude);
  const rotatedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const rotatedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  const scale = distance / (distance - rotatedZ);
  return { x: centerX + x * scale, y: centerY + rotatedY * scale, z: rotatedZ };
}

function tracePolygon(ctx, points) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index].x, points[index].y);
  ctx.closePath();
}

function drawSphereGlass(ctx, centerX, centerY, radius) {
  if (radius <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  const filmWash = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  filmWash.addColorStop(0, 'rgba(255,255,255,.08)');
  filmWash.addColorStop(.36, 'rgba(243,255,255,.015)');
  filmWash.addColorStop(.72, 'rgba(223,207,255,.025)');
  filmWash.addColorStop(1, 'rgba(255,255,255,.06)');
  ctx.fillStyle = filmWash;
  ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

  const softReflection = ctx.createRadialGradient(
    centerX - radius * .42,
    centerY - radius * .56,
    radius * .015,
    centerX - radius * .22,
    centerY - radius * .45,
    radius * .68,
  );
  softReflection.addColorStop(0, 'rgba(255,255,255,.22)');
  softReflection.addColorStop(.18, 'rgba(255,255,255,.08)');
  softReflection.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = softReflection;
  ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

  ctx.beginPath();
  ctx.ellipse(centerX - radius * .42, centerY - radius * .69, radius * .2, radius * .035, -.52, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.48)';
  ctx.shadowColor = 'rgba(255,255,255,.56)';
  ctx.shadowBlur = Math.max(4, radius * .055);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - radius * .77, centerY - radius * .2);
  ctx.bezierCurveTo(
    centerX - radius * .7,
    centerY - radius * .68,
    centerX - radius * .36,
    centerY - radius * .88,
    centerX + radius * .02,
    centerY - radius * .84,
  );
  ctx.strokeStyle = 'rgba(255,255,255,.32)';
  ctx.lineWidth = Math.max(1, radius * .012);
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,255,255,.42)';
  ctx.shadowBlur = Math.max(2, radius * .025);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  const rim = ctx.createConicGradient?.(-Math.PI / 2, centerX, centerY);
  if (rim) {
    rim.addColorStop(0, 'rgba(255,255,255,.74)');
    rim.addColorStop(.16, 'rgba(150,224,226,.24)');
    rim.addColorStop(.34, 'rgba(255,255,255,.62)');
    rim.addColorStop(.52, 'rgba(226,185,236,.42)');
    rim.addColorStop(.72, 'rgba(255,255,255,.54)');
    rim.addColorStop(.88, 'rgba(183,218,224,.32)');
    rim.addColorStop(1, 'rgba(255,255,255,.74)');
  }
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * .991, 0, Math.PI * 2);
  ctx.strokeStyle = rim || 'rgba(255,255,255,.66)';
  ctx.lineWidth = Math.max(1.2, radius * .013);
  ctx.shadowColor = 'rgba(185,219,229,.36)';
  ctx.shadowBlur = Math.max(3, radius * .035);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * .973, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.26)';
  ctx.lineWidth = Math.max(.7, radius * .004);
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();
}

function drawTexturedTriangle(ctx, image, a, b, d, u, v, w) {
  const determinant = (v.x - u.x) * (w.y - u.y) - (w.x - u.x) * (v.y - u.y);
  if (Math.abs(determinant) < 0.00001) return;

  const A = ((b.x - a.x) * (w.y - u.y) - (d.x - a.x) * (v.y - u.y)) / determinant;
  const B = ((b.y - a.y) * (w.y - u.y) - (d.y - a.y) * (v.y - u.y)) / determinant;
  const C = ((d.x - a.x) * (v.x - u.x) - (b.x - a.x) * (w.x - u.x)) / determinant;
  const E = ((d.y - a.y) * (v.x - u.x) - (b.y - a.y) * (w.x - u.x)) / determinant;
  const centerX = (a.x + b.x + d.x) / 3;
  const centerY = (a.y + b.y + d.y) / 3;

  ctx.save();
  tracePolygon(ctx, [a, b, d].map((point) => {
    const length = Math.hypot(point.x - centerX, point.y - centerY) || 1;
    return {
      x: point.x + ((point.x - centerX) * 0.65) / length,
      y: point.y + ((point.y - centerY) * 0.65) / length,
    };
  }));
  ctx.clip();
  ctx.transform(A, B, C, E, a.x - A * u.x - C * u.y, a.y - B * u.x - E * u.y);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

function isInsidePolygon(x, y, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const point = polygon[current];
    const prior = polygon[previous];
    const intersects = ((point.y > y) !== (prior.y > y))
      && (x < ((prior.x - point.x) * (y - point.y)) / ((prior.y - point.y) || 0.00001) + point.x);
    if (intersects) inside = !inside;
  }
  return inside;
}

function getStageItems(stageId) {
  return MAKING_OF_MEDIA.filter((item) => item.stage === stageId);
}

function getStagePage(stageItems, maxSlotCount, page) {
  const pageCount = Math.max(1, Math.ceil(stageItems.length / maxSlotCount));
  const baseSize = Math.floor(stageItems.length / pageCount);
  const largerPages = stageItems.length % pageCount;
  let start = 0;

  for (let index = 0; index < page; index += 1) {
    start += baseSize + (index < largerPages ? 1 : 0);
  }

  const pageSize = baseSize + (page < largerPages ? 1 : 0);
  return stageItems.slice(start, start + pageSize);
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderJournalParagraph(paragraph, collageWords = [], usedWords = new Set()) {
  const availableWords = collageWords.filter((word) => !usedWords.has(word));
  if (!availableWords.length) return paragraph;

  const words = [...availableWords].sort((a, b) => b.length - a.length);
  const wordPattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'g');
  const wordSet = new Set(words);
  return paragraph.split(wordPattern).map((part, index) => {
    if (!wordSet.has(part) || usedWords.has(part)) return part;
    usedWords.add(part);
    const tone = collageWords.indexOf(part) % 4;
    return <span className="making-of-keyword-scrap" data-tone={tone} key={`${part}-${index}`}>{part}</span>;
  });
}

function describeVideoError(video) {
  const code = video?.error?.code;
  if (code === 2) return '视频读取中断，请重试播放。';
  if (code === 3) return '视频解码失败，请刷新页面后重试。';
  if (code === 4) return '当前浏览器无法识别这段视频格式。';
  return '视频暂时无法播放，请稍后重试。';
}

export default function MakingOfPage({ onReturnToZine, surfaceRef, portalActive = false, portalPhase = 'idle' }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imageCacheRef = useRef(new Map());
  const polygonsRef = useRef([]);
  const dragRef = useRef(null);
  const angleRef = useRef(0.2);
  const tiltRef = useRef(-0.13);
  const velocityRef = useRef(0);
  const activeStageIndexRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const pauseRef = useRef(false);
  const selectedIdRef = useRef(null);
  const portalPhaseRef = useRef(portalPhase);
  portalPhaseRef.current = portalPhase;
  const [stagePages, setStagePages] = useState(() => MAKING_OF_STAGES.map(() => 0));
  const [randomizedStageItems] = useState(() => MAKING_OF_STAGES.map((stage) => shuffleItems(getStageItems(stage.id))));
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [pointerOverMedia, setPointerOverMedia] = useState(false);
  const [playbackRequested, setPlaybackRequested] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mobileView, setMobileView] = useState('sphere');
  const [textureStatus, setTextureStatus] = useState('loading');
  const [mobileLayout, setMobileLayout] = useState(() => window.matchMedia('(max-width: 760px), (max-height: 600px) and (orientation: landscape) and (max-width: 1000px)').matches);
  const setPortalSurfaceRef = useCallback((node) => {
    if (surfaceRef) surfaceRef.current = node;
    if (node && portalActive) {
      const phase = portalPhaseRef.current;
      const inside = phase === 'inside';
      node.style.opacity = phase === 'inside' || phase === 'exit' ? '1' : '0';
      node.style.pointerEvents = inside ? 'auto' : 'none';
      node.inert = !inside;
    }
  }, [portalActive, surfaceRef]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPaused(true);
    };
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px), (max-height: 600px) and (orientation: landscape) and (max-width: 1000px)');
    const update = () => setMobileLayout(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    pauseRef.current = paused || reducedMotion;
  }, [paused, reducedMotion]);

  const orbitItems = useMemo(() => MAKING_OF_STAGES.flatMap((stage, stageIndex) => {
    const pageItems = getStagePage(randomizedStageItems[stageIndex], stage.slots, stagePages[stageIndex]);
    return pageItems.map((item, slot) => ({
      ...item,
      stageIndex,
      slot,
      slotCount: pageItems.length,
      image: null,
    }));
  }), [randomizedStageItems, stagePages]);

  const textureItems = useMemo(() => orbitItems.map((item) => {
    const textureSrc = item.poster || item.src;
    let image = imageCacheRef.current.get(textureSrc);
    if (!image) {
      image = new Image();
      image.decoding = 'async';
      image.src = textureSrc;
      imageCacheRef.current.set(textureSrc, image);
    }
    return { ...item, image };
  }), [orbitItems]);

  useEffect(() => {
    if (!textureItems.length) {
      setTextureStatus('ready');
      return undefined;
    }

    let cancelled = false;
    const cleanups = [];
    const allComplete = textureItems.every(({ image }) => image.complete);
    if (!allComplete) setTextureStatus('loading');

    const imageLoads = textureItems.map(({ image }) => new Promise((resolve) => {
      if (image.complete) {
        resolve(Boolean(image.naturalWidth));
        return;
      }

      const finish = (loaded) => {
        image.removeEventListener('load', onLoad);
        image.removeEventListener('error', onError);
        resolve(loaded);
      };
      const onLoad = () => finish(true);
      const onError = () => finish(false);
      image.addEventListener('load', onLoad, { once: true });
      image.addEventListener('error', onError, { once: true });
      cleanups.push(() => {
        image.removeEventListener('load', onLoad);
        image.removeEventListener('error', onError);
      });
    }));

    Promise.all(imageLoads).then((loadedImages) => {
      if (!cancelled) setTextureStatus(loadedImages.every(Boolean) ? 'ready' : 'error');
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [textureItems]);

  const activeItem = selectedId ? MAKING_OF_MEDIA.find((item) => item.id === selectedId) : null;
  const activeStage = MAKING_OF_STAGES[activeStageIndex];
  const activeStory = MAKING_OF_STAGE_NOTES.find((entry) => entry.id === activeStage.id);
  const activeStageItems = randomizedStageItems[activeStageIndex];
  const activePageCount = Math.max(1, Math.ceil(activeStageItems.length / activeStage.slots));
  const activePage = stagePages[activeStageIndex];
  const shouldPlayVideo = activeItem?.kind === 'video' && (pointerOverMedia || playbackRequested);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    selectedIdRef.current = null;
    setPointerOverMedia(false);
    setPlaybackRequested(false);
    setMediaError('');
  }, []);

  const selectItem = useCallback((item, { hovered = false } = {}) => {
    if (!item) {
      clearSelection();
      return;
    }
    const stageIndex = item.stageIndex ?? MAKING_OF_STAGES.findIndex((stage) => stage.id === item.stage);
    setActiveStageIndex(stageIndex);
    activeStageIndexRef.current = stageIndex;
    setSelectedId(item.id);
    selectedIdRef.current = item.id;
    setPointerOverMedia(hovered && item.kind === 'video');
    setPlaybackRequested(false);
    setMediaError('');
  }, [clearSelection]);

  const selectStage = useCallback((index) => {
    const stage = MAKING_OF_STAGES[index];
    if (!stage) return;
    setActiveStageIndex(index);
    activeStageIndexRef.current = index;
    clearSelection();
  }, [clearSelection]);

  const advanceStage = useCallback((direction) => {
    const nextIndex = (activeStageIndexRef.current + direction + MAKING_OF_STAGES.length) % MAKING_OF_STAGES.length;
    selectStage(nextIndex);
    angleRef.current += direction * 0.22;
    if (!pauseRef.current) velocityRef.current += direction * 0.52;
  }, [selectStage]);

  const handleCanvasWheel = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || event.deltaY === 0) return;
    const bounds = canvas.getBoundingClientRect();
    const geometry = getMakingOfGeometry(bounds.width, bounds.height, mobileView);
    const x = event.clientX - bounds.left - geometry.centerX;
    const y = event.clientY - bounds.top - geometry.centerY;
    if ((x * x) + (y * y) > (geometry.radius * geometry.radius * 1.08)) return;

    event.preventDefault();
    const delta = event.deltaMode === 1 ? event.deltaY * 16
      : event.deltaMode === 2 ? event.deltaY * bounds.height
        : event.deltaY;
    wheelAccumulatorRef.current += delta;
    const step = Math.trunc(wheelAccumulatorRef.current / 72);
    if (!step) return;
    wheelAccumulatorRef.current -= step * 72;
    const limitedSteps = Math.max(-2, Math.min(2, step));
    for (let index = 0; index < Math.abs(limitedSteps); index += 1) advanceStage(Math.sign(limitedSteps));
  }, [advanceStage, mobileView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleCanvasWheel);
  }, [handleCanvasWheel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let radius = 0;
    let centerX = 0;
    let centerY = 0;
    let distance = 1100;
    let lastTime = performance.now();
    let animationFrame = 0;
    const stageOffsets = [0, 0.3, 0.1, 0.4, 0.2];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const geometry = getMakingOfGeometry(width, height, mobileView);
      radius = geometry.radius;
      centerX = geometry.centerX;
      centerY = geometry.centerY;
      distance = geometry.distance;
    };

    const draw = (time) => {
      const dt = Math.min(0.04, Math.max(0, (time - lastTime) / 1000));
      lastTime = time;
      if (!pauseRef.current && !dragRef.current) {
        angleRef.current += (0.035 + velocityRef.current) * dt;
        velocityRef.current *= Math.exp(-5 * dt);
        for (let stageIndex = 0; stageIndex < MAKING_OF_STAGES.length; stageIndex += 1) {
          const drift = stageIndex === activeStageIndexRef.current ? 0.035 : 0.065;
          stageOffsets[stageIndex] += dt * (selectedIdRef.current ? 0.016 : drift);
        }
      }

      ctx.clearRect(0, 0, width, height);
      if (radius > 0) {
        const glow = ctx.createRadialGradient(centerX - radius * 0.25, centerY - radius * 0.35, radius * 0.05, centerX, centerY, radius * 1.025);
        glow.addColorStop(0, '#ffffff10');
        glow.addColorStop(0.85, '#b9e6fa18');
        glow.addColorStop(0.97, '#c4adf155');
        glow.addColorStop(1, '#ffffffa0');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.025, 0, Math.PI * 2);
        ctx.fill();
      }

      const patches = [];
      for (const item of textureItems) {
        const span = (Math.PI * 2) / item.slotCount;
        const longitude = angleRef.current + stageOffsets[item.stageIndex] + item.slot * span;
        const band = SPHERE_BANDS[item.stageIndex];
        const center = projectPoint(longitude, (band[0] + band[1]) / 2, radius, centerX, centerY, tiltRef.current, distance);
        if (center.z < radius * 0.12) continue;

        const columns = 9;
        const rows = 6;
        const grid = [];
        for (let rowIndex = 0; rowIndex <= rows; rowIndex += 1) {
          const row = [];
          for (let columnIndex = 0; columnIndex <= columns; columnIndex += 1) {
            const u = columnIndex / columns;
            const v = rowIndex / rows;
            const pointLongitude = longitude + (u - 0.5) * span * 0.93;
            const pointLatitude = band[0] + v * (band[1] - band[0]);
            row.push(projectPoint(pointLongitude, pointLatitude, radius, centerX, centerY, tiltRef.current, distance));
          }
          grid.push(row);
        }
        patches.push({ item, grid, columns, rows, z: center.z });
      }

      patches.sort((a, b) => a.z - b.z);
      polygonsRef.current = [];
      for (const { item, grid, columns, rows } of patches) {
        const polygon = [
          ...grid[0],
          ...grid.slice(1).map((row) => row[columns]),
          ...grid[rows].slice(0, columns).reverse(),
          ...grid.slice(1, rows).reverse().map((row) => row[0]),
        ];
        ctx.save();
        const stageIsActive = item.stageIndex === activeStageIndexRef.current;
        const itemIsSelected = selectedIdRef.current === item.id;
        const stageColor = STAGE_DIFFUSE_COLORS[item.stageIndex];
        ctx.globalAlpha = stageIsActive ? (selectedIdRef.current && !itemIsSelected ? 0.84 : 1) : 0.58;
        ctx.filter = 'none';
        tracePolygon(ctx, polygon);
        ctx.fillStyle = '#d6eef6';
        ctx.fill();
        ctx.clip();

        const image = item.image;
        const hasImage = image?.complete && image.naturalWidth;
        if (!hasImage) {
          const placeholder = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
          placeholder.addColorStop(0, '#e4f0ea');
          placeholder.addColorStop(1, '#e8e0f0');
          ctx.fillStyle = placeholder;
          ctx.fillRect(0, 0, width, height);
          ctx.save();
          ctx.globalAlpha *= 0.18;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          for (let offset = -height; offset < width; offset += 24) {
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset + height, height);
            ctx.stroke();
          }
          ctx.restore();
        }
        if (hasImage) {
          const imageWidth = image.naturalWidth;
          const imageHeight = image.naturalHeight;
          for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
            for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
              const topLeft = grid[rowIndex][columnIndex];
              const topRight = grid[rowIndex][columnIndex + 1];
              const bottomLeft = grid[rowIndex + 1][columnIndex];
              const bottomRight = grid[rowIndex + 1][columnIndex + 1];
              if ((topLeft.z + topRight.z + bottomLeft.z + bottomRight.z) / 4 < radius * 0.16) continue;
              const u = { x: (columnIndex / columns) * imageWidth, y: (rowIndex / rows) * imageHeight };
              const v = { x: ((columnIndex + 1) / columns) * imageWidth, y: (rowIndex / rows) * imageHeight };
              const w = { x: (columnIndex / columns) * imageWidth, y: ((rowIndex + 1) / rows) * imageHeight };
              const q = { x: ((columnIndex + 1) / columns) * imageWidth, y: ((rowIndex + 1) / rows) * imageHeight };
              drawTexturedTriangle(ctx, image, topLeft, topRight, bottomLeft, u, v, w);
              drawTexturedTriangle(ctx, image, topRight, bottomRight, bottomLeft, v, q, w);
            }
          }
        }

        const sheen = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        sheen.addColorStop(0, '#ffffff65');
        sheen.addColorStop(0.4, '#fff0');
        sheen.addColorStop(0.8, '#a6dcff18');
        sheen.addColorStop(1, '#edc8ff60');
        ctx.fillStyle = sheen;
        ctx.fillRect(centerX - radius * 2, centerY - radius * 2, radius * 4, radius * 4);
        ctx.globalAlpha = stageIsActive ? 0.035 : 0.1;
        ctx.fillStyle = stageColor;
        ctx.fillRect(centerX - radius * 2, centerY - radius * 2, radius * 4, radius * 4);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = stageIsActive ? 0.18 : 0.34;
        ctx.shadowColor = stageColor;
        ctx.shadowBlur = stageIsActive ? 7 : 12;
        ctx.strokeStyle = stageColor;
        ctx.lineWidth = stageIsActive ? 2 : 2.4;
        tracePolygon(ctx, polygon);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = stageIsActive ? 1 : 0.64;
        tracePolygon(ctx, polygon);
        ctx.strokeStyle = itemIsSelected ? '#ffffff' : stageIsActive ? '#f4fff2d0' : `${stageColor}a0`;
        ctx.lineWidth = itemIsSelected ? 3 : stageIsActive ? 1.8 : 1;
        ctx.stroke();
        ctx.restore();
        polygonsRef.current.push({ item, polygon });
      }
      drawSphereGlass(ctx, centerX, centerY, radius);
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      polygonsRef.current = [];
    };
  }, [mobileView, textureItems]);

  useEffect(() => {
    if (!shouldPlayVideo || !videoRef.current) return undefined;
    const element = videoRef.current;
    element.play().catch((error) => {
      if (error.name === 'NotAllowedError') {
        setMediaError('浏览器拦截了自动播放，请按播放器的播放键继续。');
        return;
      }
      setMediaError(describeVideoError(element));
    });
    return () => {
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, [activeItem?.id, shouldPlayVideo]);

  const findItemAt = useCallback((x, y) => {
    const polygons = polygonsRef.current;
    for (let index = polygons.length - 1; index >= 0; index -= 1) {
      if (isInsidePolygon(x, y, polygons[index].polygon)) return polygons[index].item;
    }
    return null;
  }, []);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      const dx = event.clientX - drag.previousX;
      const dy = event.clientY - drag.previousY;
      drag.previousX = event.clientX;
      drag.previousY = event.clientY;
      drag.moved = drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 7;
      angleRef.current += dx * 0.007;
      tiltRef.current = Math.max(-0.45, Math.min(0.45, tiltRef.current + dy * 0.004));
      velocityRef.current = dx * 0.035;
      clearSelection();
      return;
    }
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const item = findItemAt(event.clientX - bounds.left, event.clientY - bounds.top);
    selectItem(item, { hovered: true });
  }, [clearSelection, findItemAt, selectItem]);

  const handlePointerDown = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      previousX: event.clientX,
      previousY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved || event.pointerType === 'touch') {
      const bounds = event.currentTarget.getBoundingClientRect();
      const item = findItemAt(event.clientX - bounds.left, event.clientY - bounds.top);
      selectItem(item);
    }
  }, [findItemAt, selectItem]);

  const handleCanvasKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      clearSelection();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advanceStage(event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && activeItem?.kind === 'video') {
      event.preventDefault();
      setPlaybackRequested(true);
    }
  }, [activeItem?.kind, advanceStage, clearSelection]);

  const changePage = (direction) => {
    const nextPage = Math.max(0, Math.min(activePageCount - 1, activePage + direction));
    if (nextPage === activePage) return;
    setStagePages((pages) => pages.map((page, index) => (index === activeStageIndex ? nextPage : page)));
    clearSelection();
  };

  const clearWhenLeaving = (event) => {
    if (event.relatedTarget?.closest?.('.making-of-preview')) return;
    clearSelection();
  };

  const handleStageTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % MAKING_OF_STAGES.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + MAKING_OF_STAGES.length) % MAKING_OF_STAGES.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = MAKING_OF_STAGES.length - 1;
    else return;
    event.preventDefault();
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <main className="making-of-page" data-mobile-view={mobileView} ref={setPortalSurfaceRef}>
      <canvas
        ref={canvasRef}
        className="making-of-canvas"
        role="application"
        aria-label="MEMO Garden 项目过程球体。球内滚轮、方向键或阶段页签切换五个阶段，拖动旋转，悬停或点按球面照片查看。"
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; clearSelection(); }}
        onPointerLeave={clearWhenLeaving}
        onKeyDown={handleCanvasKeyDown}
      />
      {textureStatus !== 'ready' && mobileView === 'sphere' && (
        <div className={`making-of-media-status is-${textureStatus}`} role="status" aria-live="polite">
          {textureStatus === 'loading' ? '正在把照片和视频贴进球面…' : '有几段影像暂时没有载入'}
        </div>
      )}

      <header className="making-of-header">
        <div className="making-of-brand-block zine-brand-block">
          <button type="button" className="zine-brand" onClick={onReturnToZine} aria-label="返回 MEMO Garden 小志">
            <img src="/zine/assets/memo-garden-bubble-wordmark.png" alt="MEMO Garden" />
          </button>
          <section className="zine-product-intro" aria-label="MEMO Garden 产品概念">
            <p className="zine-product-kicker">MEMO · AI 声景漫游 <span>产品概念</span></p>
            <p className="zine-product-copy zine-product-copy-full">一款 Dreamcore 手机外设，陪你重新听见日常：沿街拾起带着地点的声音泡泡，AI 为它们整理成听觉手账；也把一句话留给后来的人。</p>
            <p className="zine-product-copy zine-product-copy-compact">沿街发现地点声音泡泡，听见他人留下的片刻，也留一句给后来的人。</p>
          </section>
        </div>
        <div className="making-of-header-actions zine-top-actions">
          <button
            type="button"
            className="zine-glass-button making-of-header-button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused || reducedMotion}
            aria-label={paused || reducedMotion ? '继续自动旋转' : '暂停自动旋转'}
          >
            <span className="making-of-button-label-full">{paused || reducedMotion ? '▷ 继续旋转' : 'Ⅱ 暂停'}</span>
            <span className="making-of-button-label-short" aria-hidden="true">{paused || reducedMotion ? '▷' : 'Ⅱ'}</span>
          </button>
          <button type="button" className="zine-glass-button zine-experience-button making-of-header-button making-of-return" onClick={onReturnToZine}>
            <span className="making-of-button-label-full">返回小志</span>
            <span className="making-of-button-label-short">小志</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <div className="making-of-mobile-view-switch" role="group" aria-label="选择制作过程查看方式">
        <button
          type="button"
          className={`zine-glass-button${mobileView === 'sphere' ? ' zine-experience-button' : ''}`}
          aria-pressed={mobileView === 'sphere'}
          onClick={() => setMobileView('sphere')}
        >球体</button>
        <button
          type="button"
          className={`zine-glass-button${mobileView === 'journal' ? ' zine-experience-button' : ''}`}
          aria-pressed={mobileView === 'journal'}
          onClick={() => setMobileView('journal')}
        >手账</button>
      </div>

      <aside className="making-of-journal" aria-label="MEMO Garden 制作手账">
        <div
          className="making-of-story"
          aria-label="当前阶段手账内容"
          role="tabpanel"
          id="making-of-stage-story"
          aria-labelledby={`making-of-tab-${activeStageIndex}`}
          tabIndex={0}
        >
          <article className="making-of-story-entry" key={activeStory.id}>
            <header className="making-of-story-entry-head">
              <h2>{activeStory.title}</h2>
            </header>
            <div className="making-of-story-paragraphs">
              {(() => {
                const usedWords = new Set();
                return activeStory.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{renderJournalParagraph(paragraph, activeStory.collageWords, usedWords)}</p>
                ));
              })()}
            </div>
          </article>
        </div>
      </aside>

      <nav className="making-of-rail" aria-label="项目过程阶段" role="tablist" aria-orientation={mobileLayout ? 'horizontal' : 'vertical'}>
        {MAKING_OF_STAGES.map((stage, index) => (
          <button
            type="button"
            key={stage.id}
            id={`making-of-tab-${index}`}
            role="tab"
            className={`zine-glass-button${activeStageIndex === index ? ' is-active' : ''}`}
            aria-selected={activeStageIndex === index}
            aria-controls="making-of-stage-story"
            tabIndex={activeStageIndex === index ? 0 : -1}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') selectStage(index);
            }}
            onFocus={() => selectStage(index)}
            onClick={() => selectStage(index)}
            onKeyDown={(event) => handleStageTabKeyDown(event, index)}
          >
            <span className="making-of-stage-number">0{index + 1}</span>
            <span className="making-of-stage-label">{stage.label}</span>
            <span className="making-of-stage-short">{stage.shortLabel}</span>
          </button>
        ))}
      </nav>

      {activeItem && (
        <aside
          className="making-of-preview is-visible"
          aria-label={`${activeItem.title}，${MAKING_OF_ROLE_LABELS[activeItem.role]}`}
          onPointerEnter={() => {
            if (activeItem.kind === 'video') setPointerOverMedia(true);
          }}
          onPointerLeave={() => {
            setPointerOverMedia(false);
            setPlaybackRequested(false);
            clearSelection();
          }}
        >
          <div className="making-of-film">
            <div className={`making-of-film-media${activeItem.kind === 'video' ? ' is-video' : ''}`}>
              {activeItem.kind === 'video' && shouldPlayVideo ? (
                <video
                  key={activeItem.id}
                  ref={videoRef}
                  src={activeItem.src}
                  poster={activeItem.poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                  controls
                  preload="metadata"
                  aria-label={activeItem.alt}
                  onError={(event) => setMediaError(describeVideoError(event.currentTarget))}
                  onLoadedData={() => setMediaError('')}
                />
              ) : (
                <img src={activeItem.poster || activeItem.src} alt={activeItem.alt} />
              )}
              {activeItem.kind === 'video' && <span className="making-of-video-mark" aria-hidden="true">▶ <span>动态片段</span></span>}
            </div>
            <div className="making-of-caption">
              <div className="making-of-caption-meta">
                <span>{activeItem.stage}</span>
                <span>{MAKING_OF_ROLE_LABELS[activeItem.role]}</span>
              </div>
              <strong>{activeItem.title}</strong>
              <span className="making-of-caption-note">{activeItem.note}</span>
              <span className="making-of-caption-source">{activeItem.credit}</span>
              {mediaError && <span className="making-of-media-error" role="status">{mediaError}</span>}
              {activeItem.kind === 'video' && !shouldPlayVideo && (
                <button type="button" className="making-of-play-button zine-glass-button" onClick={() => setPlaybackRequested(true)}>
                  播放这段记录 <span aria-hidden="true">▶</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      <footer className="making-of-footer">
        <span className="making-of-footer-hint">滚轮切换分层 · 拖动转球 · 静静自转</span>
        <div className="making-of-pagination" aria-label={`${activeStage.label}，第 ${activePage + 1} / ${activePageCount} 页`}>
          <button type="button" className="zine-glass-button" onClick={() => changePage(-1)} disabled={activePage === 0} aria-label="查看本阶段上一组素材">←</button>
          <span>{String(activePage + 1).padStart(2, '0')} <i>/</i> {String(activePageCount).padStart(2, '0')}</span>
          <span className="making-of-page-rule"><i style={{ width: `${((activePage + 1) / activePageCount) * 100}%` }} /></span>
          <button type="button" className="zine-glass-button" onClick={() => changePage(1)} disabled={activePage >= activePageCount - 1} aria-label="查看本阶段下一组素材">→</button>
        </div>
        <span className="making-of-footer-note">灵感与参考 / 概念探索 / 项目过程记录</span>
      </footer>

      <p className="making-of-live-status" aria-live="polite" aria-atomic="true">
        {activeItem ? `${activeItem.title}；${STAGE_LABELS[activeStageIndex]}，${MAKING_OF_ROLE_LABELS[activeItem.role]}` : `${STAGE_LABELS[activeStageIndex]}；滚轮切换分层，拖动旋转，悬停或点按查看素材。`}
      </p>
    </main>
  );
}
