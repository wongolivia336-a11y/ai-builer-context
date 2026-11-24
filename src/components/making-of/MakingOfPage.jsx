import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAKING_OF_MEDIA, MAKING_OF_ROLE_LABELS, MAKING_OF_STAGES } from './media';
import { getMakingOfGeometry } from './galleryGeometry.js';
import './MakingOfPage.css';

const STAGE_LABELS = MAKING_OF_STAGES.map((stage) => stage.label);
const SPHERE_BANDS = MAKING_OF_STAGES.map((stage) => stage.band);

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

function getStagePage(stageItems, slotCount, page) {
  if (!stageItems.length) return [];
  const start = page * slotCount;
  const slice = stageItems.slice(start, start + slotCount);
  const currentItems = slice.length ? slice : stageItems.slice(0, slotCount);
  return Array.from({ length: slotCount }, (_, index) => currentItems[index % currentItems.length]);
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
  const pauseRef = useRef(false);
  const selectedIdRef = useRef(null);
  const portalPhaseRef = useRef(portalPhase);
  portalPhaseRef.current = portalPhase;
  const [stagePages, setStagePages] = useState(() => MAKING_OF_STAGES.map(() => 0));
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [pointerOverMedia, setPointerOverMedia] = useState(false);
  const [playbackRequested, setPlaybackRequested] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
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
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    pauseRef.current = paused || reducedMotion;
  }, [paused, reducedMotion]);

  const orbitItems = useMemo(() => MAKING_OF_STAGES.flatMap((stage, stageIndex) => (
    getStagePage(getStageItems(stage.id), stage.slots, stagePages[stageIndex]).map((item, slot) => ({
      ...item,
      stageIndex,
      slot,
      image: null,
    }))
  )), [stagePages]);

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

  const activeItem = selectedId ? MAKING_OF_MEDIA.find((item) => item.id === selectedId) : null;
  const activeStage = MAKING_OF_STAGES[activeStageIndex];
  const activeStageItems = getStageItems(activeStage.id);
  const activePageCount = Math.max(1, Math.ceil(activeStageItems.length / activeStage.slots));
  const activePage = stagePages[activeStageIndex];
  const shouldPlayVideo = activeItem?.kind === 'video' && (pointerOverMedia || playbackRequested);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    selectedIdRef.current = null;
    setPointerOverMedia(false);
    setPlaybackRequested(false);
  }, []);

  const selectItem = useCallback((item, { hovered = false } = {}) => {
    if (!item) {
      clearSelection();
      return;
    }
    setActiveStageIndex(item.stageIndex ?? MAKING_OF_STAGES.findIndex((stage) => stage.id === item.stage));
    setSelectedId(item.id);
    selectedIdRef.current = item.id;
    setPointerOverMedia(hovered && item.kind === 'video');
    setPlaybackRequested(false);
  }, [clearSelection]);

  const selectStage = useCallback((index, hovered = false) => {
    const stage = MAKING_OF_STAGES[index];
    if (!stage) return;
    setActiveStageIndex(index);
    const first = getStagePage(getStageItems(stage.id), stage.slots, stagePages[index])[0];
    if (first) selectItem(first, { hovered });
  }, [selectItem, stagePages]);

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
      const geometry = getMakingOfGeometry(width, height);
      radius = geometry.radius;
      centerX = geometry.centerX;
      centerY = geometry.centerY;
      distance = geometry.distance;
    };

    const draw = (time) => {
      const dt = Math.min(0.04, Math.max(0, (time - lastTime) / 1000));
      lastTime = time;
      if (!pauseRef.current && !dragRef.current) {
        angleRef.current += velocityRef.current * dt;
        velocityRef.current *= Math.exp(-5 * dt);
        for (let stageIndex = 0; stageIndex < MAKING_OF_STAGES.length; stageIndex += 1) {
          stageOffsets[stageIndex] += dt * (selectedIdRef.current ? 0.025 : 0.11 + stageIndex * 0.014);
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
        const stage = MAKING_OF_STAGES[item.stageIndex];
        const span = (Math.PI * 2) / stage.slots;
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
        ctx.globalAlpha = selectedIdRef.current && selectedIdRef.current !== item.id ? 0.27 : 1;
        tracePolygon(ctx, polygon);
        ctx.fillStyle = '#d6eef6';
        ctx.fill();
        ctx.clip();

        const image = item.image;
        if (image?.complete && image.naturalWidth) {
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
        ctx.restore();

        tracePolygon(ctx, polygon);
        ctx.strokeStyle = selectedIdRef.current === item.id ? '#ffffff' : '#e6faffb0';
        ctx.lineWidth = selectedIdRef.current === item.id ? 3 : 1.6;
        ctx.stroke();
        polygonsRef.current.push({ item, polygon });
      }
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
  }, [textureItems]);

  useEffect(() => {
    if (!shouldPlayVideo || !videoRef.current) return undefined;
    const element = videoRef.current;
    element.play().catch(() => {});
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
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      angleRef.current += direction * 0.2;
      const currentIndex = orbitItems.findIndex((item) => item.id === selectedIdRef.current);
      const nextIndex = (currentIndex + direction + orbitItems.length) % orbitItems.length;
      if (orbitItems[nextIndex]) selectItem(orbitItems[nextIndex]);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && activeItem?.kind === 'video') {
      event.preventDefault();
      setPlaybackRequested(true);
    }
  }, [activeItem?.kind, clearSelection, orbitItems, selectItem]);

  const changePage = (direction) => {
    const nextPage = Math.max(0, Math.min(activePageCount - 1, activePage + direction));
    if (nextPage === activePage) return;
    setStagePages((pages) => pages.map((page, index) => (index === activeStageIndex ? nextPage : page)));
    const nextItem = getStagePage(activeStageItems, activeStage.slots, nextPage)[0];
    if (nextItem) selectItem(nextItem);
  };

  const clearWhenLeaving = (event) => {
    if (event.relatedTarget?.closest?.('.making-of-preview')) return;
    clearSelection();
  };

  return (
    <main className="making-of-page" ref={setPortalSurfaceRef}>
      <canvas
        ref={canvasRef}
        className="making-of-canvas"
        role="img"
        aria-label="MEMO Garden 项目过程球体。可拖动旋转，使用方向键浏览素材，悬停或点按查看。"
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; clearSelection(); }}
        onPointerLeave={clearWhenLeaving}
        onKeyDown={handleCanvasKeyDown}
      />

      <header className="making-of-header">
        <button type="button" className="making-of-brand" onClick={onReturnToZine} aria-label="返回 MEMO Garden 小志">
          <span>MEMO Garden</span><i aria-hidden="true">✳</i>
        </button>
        <div className="making-of-header-actions">
          <button
            type="button"
            className="making-of-header-button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused || reducedMotion}
            aria-label={paused || reducedMotion ? '继续自动旋转' : '暂停自动旋转'}
          >
            <span className="making-of-button-label-full">{paused || reducedMotion ? '▷ 继续旋转' : 'Ⅱ 暂停'}</span>
            <span className="making-of-button-label-short" aria-hidden="true">{paused || reducedMotion ? '▷' : 'Ⅱ'}</span>
          </button>
          <button type="button" className="making-of-header-button making-of-return" onClick={onReturnToZine}>
            <span className="making-of-button-label-full">返回小志</span>
            <span className="making-of-button-label-short">小志</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <section className="making-of-intro" aria-labelledby="making-of-title">
        <p className="making-of-eyebrow">MAKING OF / 01—05</p>
        <h1 id="making-of-title">little things<br />in orbit.</h1>
        <p className="making-of-intro-copy">一颗泡泡的诞生</p>
        <p className="making-of-intro-detail">从声音灵感，到手绘、打样和交互页面。</p>
      </section>

      <nav className="making-of-rail" aria-label="项目过程阶段">
        {MAKING_OF_STAGES.map((stage, index) => (
          <button
            type="button"
            key={stage.id}
            className={activeStageIndex === index ? 'is-active' : ''}
            aria-current={activeStageIndex === index ? 'step' : undefined}
            onPointerEnter={() => selectStage(index, true)}
            onPointerLeave={clearWhenLeaving}
            onFocus={() => selectStage(index)}
            onBlur={clearWhenLeaving}
            onClick={() => selectStage(index)}
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
                  preload="auto"
                  aria-label={activeItem.alt}
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
              {activeItem.kind === 'video' && !shouldPlayVideo && (
                <button type="button" className="making-of-play-button" onClick={() => setPlaybackRequested(true)}>
                  播放这段记录 <span aria-hidden="true">▶</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      <footer className="making-of-footer">
        <span className="making-of-footer-hint">HOVER TO DISCOVER · DRAG TO SPIN</span>
        <div className="making-of-pagination" aria-label={`${activeStage.label}，第 ${activePage + 1} / ${activePageCount} 页`}>
          <button type="button" onClick={() => changePage(-1)} disabled={activePage === 0} aria-label="查看本阶段上一组素材">←</button>
          <span>{String(activePage + 1).padStart(2, '0')} <i>/</i> {String(activePageCount).padStart(2, '0')}</span>
          <span className="making-of-page-rule"><i style={{ width: `${((activePage + 1) / activePageCount) * 100}%` }} /></span>
          <button type="button" onClick={() => changePage(1)} disabled={activePage >= activePageCount - 1} aria-label="查看本阶段下一组素材">→</button>
        </div>
        <span className="making-of-footer-note">灵感与参考 / 概念探索 / 项目过程记录</span>
      </footer>

      <p className="making-of-live-status" aria-live="polite" aria-atomic="true">
        {activeItem ? `${activeItem.title}；${STAGE_LABELS[activeStageIndex]}，${MAKING_OF_ROLE_LABELS[activeItem.role]}` : '悬停或点按球体上的素材以查看详情。'}
      </p>
    </main>
  );
}
