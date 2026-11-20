import React, { Suspense, lazy, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import ImageTargetARStage from './components/ImageTargetARStage';
import LandingPage from './components/LandingPage';
import CapsuleWaterProgress from './components/CapsuleWaterProgress';
import { Phone } from './kit/phone';
import streetBackground from './assets/user-kit/roam-night-portrait.webp';
import landscapeStreetBackground from './assets/user-kit/roam-night-landscape.webp';
import createBackground from './assets/user-kit/create-open-sky.webp';
import soundPostcardCover from './assets/user-kit/sound-postcard-collage.webp';
import stickerStarMint from './assets/user-kit/sticker-star-mint.webp';
import stickerStarBlue from './assets/user-kit/sticker-star-blue.webp';
import './styles.css';
import './styles-v2.css';
import './styles-editorial.css';

const DeviceViewer = lazy(() => import('./DeviceViewer'));
const MotionLab = lazy(() => import('./components/MotionLab'));

const initialScreen = new URLSearchParams(location.search).get('screen');
const initialPreview = new URLSearchParams(location.search).get('preview');

function Bubble({ size, className = '', label, onClick, onPointerDown, onPointerUp, onPointerCancel, onContextMenu, style = {}, bubble }) {
  return (
    <button
      className={`soap-bubble ${className}${bubble?.shape ? ` has-silhouette shape-${bubble.shape}` : ''}`}
      style={{ '--bubble-size': `${size}px`, ...style }}
      aria-label={label || '声音泡泡'}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={onContextMenu}
    >
      {bubble?.shape ? <BubbleSilhouette key={bubble.shape} bubble={bubble} /> : <><span className="bubble-core" /><span className="bubble-glint" /></>}
    </button>
  );
}

function Waveform({ active = false, small = false }) {
  const heights = [7, 13, 20, 11, 26, 15, 9, 22, 14, 28, 12, 19, 8, 23, 14, 26, 10, 18, 7, 21, 12, 27, 9, 17, 24, 12, 20, 8, 15, 23, 11, 18];
  return (
    <span className={`waveform${active ? ' is-active' : ''}${small ? ' is-small' : ''}`} aria-hidden="true">
      {heights.map((height, i) => <i key={i} style={{ '--wave-height': `${small ? Math.max(4, height * .48) : height}px`, '--wave-delay': `${(i % 11) * 45}ms` }} />)}
    </span>
  );
}

function Scene({ children, className = '', style }) {
  return <div className={`scene ${className}`} style={style}><div className="scene-sky" /><div className="scene-water" /><div className="scene-horizon" />{children}</div>;
}

function GlassButton({ children, className = '', onClick, disabled = false }) {
  return <button className={`glass-button ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function TabBar({ active, onChange }) {
  const tabs = [
    ['home', '泡泡'],
    ['roam', '漫游'],
    ['create', '共创'],
  ];
  const activeIndex = Math.max(0, tabs.findIndex(([id]) => id === active));
  const [dragProgress, setDragProgress] = useState(activeIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPhysics, setDragPhysics] = useState({ stretch: 1, tailLeft: 0, tailRight: 0 });
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);

  useEffect(() => {
    if (!isDragging) setDragProgress(activeIndex);
  }, [activeIndex, isDragging]);

  const progressAtPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const inset = 5;
    const slotWidth = (rect.width - inset * 2) / tabs.length;
    return Math.max(0, Math.min(tabs.length - 1, (event.clientX - rect.left - inset) / slotWidth - 0.5));
  };
  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    suppressClickRef.current = false;
    window.clearTimeout(suppressClickTimerRef.current);
    suppressClickTimerRef.current = null;
    const progress = progressAtPointer(event);
    gestureRef.current = { pointerId: event.pointerId, startX: event.clientX, previousX: event.clientX };
    setDragProgress(progress);
    setDragPhysics({ stretch: 1.035, tailLeft: 0, tailRight: 0 });
    setIsDragging(true);
  };
  const handlePointerMove = (event) => {
    const gesture = gestureRef.current;
    if (gesture?.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.previousX;
    gesture.previousX = event.clientX;
    const tail = Math.min(24, Math.abs(dx) * 0.7);
    setDragProgress(progressAtPointer(event));
    setDragPhysics({
      stretch: 1 + Math.min(0.24, Math.abs(dx) / 100),
      tailLeft: dx > 0 ? tail : 0,
      tailRight: dx < 0 ? tail : 0,
    });
  };
  const finishGesture = (event, cancelled = false) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const progress = cancelled ? activeIndex : progressAtPointer(event);
    const targetIndex = Math.round(progress);
    const didSwipe = !cancelled && Math.abs(event.clientX - gesture.startX) > 14;
    gestureRef.current = null;
    setIsDragging(false);
    setDragProgress(targetIndex);
    setDragPhysics({ stretch: 1, tailLeft: 0, tailRight: 0 });
    if (!didSwipe) return;
    suppressClickRef.current = true;
    if (targetIndex !== activeIndex) onChange(tabs[targetIndex][0]);
    window.clearTimeout(suppressClickTimerRef.current);
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 220);
  };

  return (
    <nav
      className={`tab-glass${isDragging ? ' is-dragging' : ''}`}
      aria-label="主导航"
      style={{
        '--tab-progress': `${(isDragging ? dragProgress : activeIndex) * 100}%`,
        '--tab-stretch': dragPhysics.stretch,
        '--tab-tail-left': `${dragPhysics.tailLeft}px`,
        '--tab-tail-right': `${dragPhysics.tailRight}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={(event) => finishGesture(event, true)}
    >
      <span className="tab-liquid-indicator" aria-hidden="true"><i className="tab-liquid-tail tail-left" /><i className="tab-liquid-tail tail-right" /></span>
      {tabs.map(([id, label]) => (
        <button
          key={id}
          className={`tab-item${active === id ? ' active' : ''}`}
          aria-current={active === id ? 'page' : undefined}
          onClick={(event) => {
            if (suppressClickRef.current && event.detail !== 0) {
              suppressClickRef.current = false;
              window.clearTimeout(suppressClickTimerRef.current);
              suppressClickTimerRef.current = null;
              return;
            }
            onChange(id);
          }}
        >
          <span className={`tab-mark mark-${id}`} aria-hidden="true">{id === 'home' ? <span className="mini-orbs"><i /><i /><i /></span> : id === 'roam' ? <span className="aim-mark" /> : <span className="plus-mark">+</span>}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
function DevicePill({ playing, emitting = false }) {
  return (
    <div className={`device-pill${playing ? ' playing' : ''}`}>
      <i />
      <span>{playing ? '声音正在流动' : emitting ? '泡泡正在舒展' : 'Memo Catcher'}</span>
    </div>
  );
}

const SOUND_BUBBLES = [
  { id: 'wind', title: '河面上的风', quote: '风从河面来，像一句没说完的话。', author: '林', duration: '12 秒', saves: 86, listens: 214, distance: 8, size: 190, accent: 'blue', shape: 'orb', kind: '环境声', kindKey: 'ambience', age: 5, comments: [{ author: '阿岚', text: '听完想多走一站。' }, { author: '木木', text: '像小时候傍晚的风。' }] },
  { id: 'bell', title: '巷口的钟声', quote: '你听，巷子尽头的钟声又响了。', author: '阿岚', duration: '8 秒', saves: 54, listens: 172, distance: 18, size: 146, accent: 'blue', shape: 'star', kind: '环境声', kindKey: 'ambience', age: 3, comments: [{ author: '小满', text: '这个回声好像从老房子里来。' }] },
  { id: 'steps', title: '刚经过的人', quote: '有人刚刚从这里走过。', author: '匿名漫游者', duration: '6 秒', saves: 31, listens: 98, distance: 23, size: 128, accent: 'rose', shape: 'heart', kind: '人声', kindKey: 'voice', age: 1, comments: [{ author: '林', text: '谢谢你把这一刻留下。' }] },
  { id: 'osmanthus', title: '桂花茶的下午', quote: '这家店的桂花茶，下午最香。', author: '小满', duration: '10 秒', saves: 22, listens: 61, distance: 31, size: 154, accent: 'lilac', shape: 'flower', kind: '碎念', kindKey: 'thought', age: 2, comments: [{ author: '匿名漫游者', text: '我也记得这个味道。' }] },
  { id: 'rain', title: '雨停以后', quote: '雨停以后，石板路会闪一下。', author: '江边散步的人', duration: '9 秒', saves: 17, listens: 44, distance: 42, size: 118, accent: 'lilac', shape: 'cloud', kind: '碎念', kindKey: 'thought', age: 0, comments: [{ author: '阿岚', text: '雨后的路总像刚醒过来。' }] },
  { id: 'market', title: '收摊前的灯', quote: '收摊前最后一盏灯亮着。', author: '路过的人', duration: '7 秒', saves: 28, listens: 73, distance: 15, size: 170, accent: 'blue', shape: 'flower', kind: '环境声', kindKey: 'ambience', age: 4, comments: [{ author: '小满', text: '听见塑料袋窸窣的声音了。' }] },
  { id: 'goodnight', title: '没说出口的晚安', quote: '今天很累的话，就早点回家吧。', author: '夜行者', duration: '8 秒', saves: 42, listens: 106, distance: 26, size: 136, accent: 'rose', shape: 'heart', kind: '人声', kindKey: 'voice', age: 6, comments: [{ author: '林', text: '刚好在需要的时候听见。' }, { author: '阿岚', text: '像有人轻轻拍了拍肩。' }] },
  { id: 'bicycle', title: '车铃经过', quote: '一声车铃，穿过树影。', author: '阿禾', duration: '5 秒', saves: 19, listens: 49, distance: 37, size: 120, accent: 'blue', shape: 'star', kind: '环境声', kindKey: 'ambience', age: 7, comments: [{ author: '路过的人', text: '画面一下就出来了。' }] },
  { id: 'smallwish', title: '给明天的小愿望', quote: '希望明天的自己轻松一点。', author: '匿名漫游者', duration: '6 秒', saves: 35, listens: 91, distance: 12, size: 148, accent: 'rose', shape: 'flower', kind: '人声', kindKey: 'voice', age: 8, comments: [{ author: '小满', text: '愿望已经收到。' }] },
  { id: 'soda', title: '窗边的汽水', quote: '汽水打开的时候，天刚刚暗下来。', author: '栗子', duration: '7 秒', saves: 25, listens: 62, distance: 28, size: 108, accent: 'gold', shape: 'cloud', kind: '碎念', kindKey: 'thought', age: 9, comments: [{ author: '小满', text: '听见气泡声了。' }] },
  { id: 'morning', title: '早班车经过', quote: '早班车带着风从桥上过去。', author: '阿禾', duration: '11 秒', saves: 47, listens: 131, distance: 34, size: 130, accent: 'blue', shape: 'star', kind: '环境声', kindKey: 'ambience', age: 10, comments: [{ author: '林', text: '这一段像电影开场。' }, { author: '阿岚', text: '桥上的风真的很特别。' }] },
  { id: 'postcard', title: '给陌生人的明信片', quote: '如果你今天有点累，记得慢慢走。', author: '匿名漫游者', duration: '9 秒', saves: 39, listens: 104, distance: 19, size: 116, accent: 'lilac', shape: 'flower', kind: '人声', kindKey: 'voice', age: 11, comments: [{ author: '路过的人', text: '谢谢，这句我收下了。' }] },
];

const BUBBLE_FIELD_SEEDS = [
  [0.5, 0.39], [0.32, 0.11], [0.81, 0.18], [0.56, 0.31],
  [0.12, 0.43], [0.94, 0.39], [0.39, 0.52], [0.7, 0.63],
  [0.08, 0.76], [0.51, 0.87], [0.88, 0.8], [0.28, 0.93],
];

const BUBBLE_SHAPE_PATHS = {
  orb: 'M50 4 C76 3 96 23 96 49 C97 75 77 96 51 96 C25 97 4 77 4 51 C3 25 24 5 50 4 Z',
  heart: 'M50 94 C43 88 5 60 5 34 C5 15 29 6 50 28 C71 6 95 15 95 34 C95 60 57 88 50 94 Z',
  star: 'M50 4 C54 4 57 27 63 33 C69 39 90 34 94 39 C98 44 80 57 78 64 C76 71 88 89 83 94 C78 99 59 83 52 83 C45 83 27 99 22 94 C17 89 29 71 27 64 C25 57 7 44 11 39 C15 34 36 39 42 33 C48 27 46 4 50 4 Z',
  flower: 'M50 12 C41 1 27 7 29 21 C15 12 5 23 15 35 C1 41 7 56 22 58 C11 70 21 84 36 77 C39 93 56 95 62 79 C76 89 89 78 79 64 C96 59 93 44 79 40 C86 25 75 13 62 21 C59 15 55 12 50 12 Z',
  cloud: 'M24 72 C10 72 5 62 9 51 C12 42 20 39 29 40 C29 23 43 15 56 21 C64 9 83 15 83 31 C98 34 99 55 87 62 C85 73 74 78 63 75 C52 84 37 81 32 74 C29 73 27 72 24 72 Z',
};

function BubbleSilhouette({ bubble }) {
  const instanceId = useId().replace(/[^a-z0-9-]/gi, '-');
  const path = BUBBLE_SHAPE_PATHS[bubble.shape];
  if (!path) return null;
  const safeId = `${bubble.id.replace(/[^a-z0-9-]/gi, '-')}-${instanceId}`;
  const fillId = `bubble-fill-${safeId}`;
  const filmId = `bubble-film-${safeId}`;
  const clipId = `bubble-clip-${safeId}`;
  return (
    <svg className={`bubble-silhouette silhouette-${bubble.shape}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={fillId} cx="30%" cy="23%" r="82%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".99" />
          <stop offset="22%" stopColor="var(--bubble-tint)" stopOpacity=".82" />
          <stop offset="64%" stopColor="var(--bubble-tint)" stopOpacity=".64" />
          <stop offset="88%" stopColor="var(--bubble-edge)" stopOpacity=".46" />
          <stop offset="100%" stopColor="#fff" stopOpacity=".88" />
        </radialGradient>
        <radialGradient id={`${fillId}-volume`} cx="69%" cy="78%" r="66%">
          <stop offset="0%" stopColor="var(--bubble-edge)" stopOpacity=".36" />
          <stop offset="52%" stopColor="var(--bubble-tint)" stopOpacity=".18" />
          <stop offset="100%" stopColor="#fff" stopOpacity=".1" />
        </radialGradient>
        <linearGradient id={filmId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" stopOpacity=".96" />
          <stop offset=".34" stopColor="var(--bubble-edge)" stopOpacity=".82" />
          <stop offset=".62" stopColor="#e7b9d7" stopOpacity=".72" />
          <stop offset=".82" stopColor="#f4e7c8" stopOpacity=".72" />
          <stop offset="1" stopColor="#fff" stopOpacity=".92" />
        </linearGradient>
        <clipPath id={clipId}><path d={path} /></clipPath>
      </defs>
      <path className="bubble-silhouette-surface" d={path} fill={`url(#${fillId})`} />
      <path d={path} fill={`url(#${fillId}-volume)`} />
      <path className="bubble-silhouette-rim" d={path} fill="none" stroke={`url(#${filmId})`} strokeWidth="2.3" />
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx="31" cy="24" rx="22" ry="10" transform="rotate(-28 31 24)" fill="#fff" opacity=".64" />
        <ellipse cx="70" cy="76" rx="39" ry="29" fill="var(--bubble-edge)" opacity=".22" />
        <path d="M20 43 C24 29 34 20 47 19" fill="none" stroke="#fff" strokeWidth="3.8" strokeLinecap="round" opacity=".84" />
        <path d="M33 82 C46 87 66 85 77 76" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" opacity=".52" />
      </g>
      {bubble.shape === 'flower' && <circle cx="50" cy="49" r="9" fill="#fff2cb" fillOpacity=".68" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" />}
      {bubble.shape === 'star' && <path d="M50 15 L53 43 L80 40 L57 53 L68 79 L50 59 L31 80 L43 53 L18 49 L45 44 Z" fill="#fff" fillOpacity=".1" />}
    </svg>
  );
}

function paintOrbitHemisphere(context, { width, height, bubbleSize, chars, phase, nearSide, outlinePoints, fontSize }) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = bubbleSize * 0.76;
  const ry = bubbleSize * 0.28;
  const tilt = -0.16;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const shapeTrackScale = (bubbleSize + 44) / 100;
  const pointOnOutline = (index) => {
    const count = outlinePoints.length;
    const position = ((index % count) + count) % count;
    const firstIndex = Math.floor(position);
    const fraction = position - firstIndex;
    const first = outlinePoints[firstIndex];
    const second = outlinePoints[(firstIndex + 1) % count];
    const previous = outlinePoints[(firstIndex + count - 1) % count];
    const next = outlinePoints[(firstIndex + 2) % count];
    const x = first.x + (second.x - first.x) * fraction;
    const y = first.y + (second.y - first.y) * fraction;
    const tangentX = (next.x - previous.x) * (1 - fraction) + (second.x - first.x) * fraction;
    const tangentY = (next.y - previous.y) * (1 - fraction) + (second.y - first.y) * fraction;
    return {
      x: cx + (x - 50) * shapeTrackScale,
      y: cy + (y - 50) * shapeTrackScale,
      depth: (y - 50) / 50,
      tangent: Math.atan2(tangentY, tangentX),
    };
  };
  const pointAt = (angle) => {
    if (outlinePoints?.length) return pointOnOutline((angle / (Math.PI * 2)) * outlinePoints.length);
    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);
    return { x: cx + x * cosTilt - y * sinTilt, y: cy + x * sinTilt + y * cosTilt };
  };
  const smoothstep = (edge0, edge1, value) => {
    const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  context.save();
  context.beginPath();
  if (outlinePoints?.length) {
    let drawing = false;
    outlinePoints.forEach((_, index) => {
      const point = pointOnOutline(index);
      const belongsToHemisphere = nearSide ? point.depth >= 0 : point.depth < 0;
      if (!belongsToHemisphere) { drawing = false; return; }
      if (!drawing) { context.moveTo(point.x, point.y); drawing = true; }
      else context.lineTo(point.x, point.y);
    });
  } else {
    const start = nearSide ? 0 : Math.PI;
    const end = nearSide ? Math.PI : Math.PI * 2;
    for (let step = 0; step <= 64; step += 1) {
      const point = pointAt(start + ((end - start) * step) / 64);
      if (step === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
  }
  context.lineWidth = outlinePoints ? (nearSide ? 1.45 : 0.8) : (nearSide ? 1.35 : 0.95);
  context.strokeStyle = outlinePoints
    ? (nearSide ? 'rgba(255,255,255,.94)' : 'rgba(255,255,255,.22)')
    : (nearSide ? 'rgba(255,255,255,.91)' : 'rgba(255,255,255,.37)');
  context.shadowColor = nearSide ? 'rgba(229,213,238,.82)' : 'rgba(210,224,236,.48)';
  context.shadowBlur = nearSide ? 8 : 4;
  context.setLineDash(nearSide ? [] : outlinePoints ? [1.8, 3.8] : [2.2, 3.2]);
  context.stroke();
  context.setLineDash([]);
  context.shadowBlur = 0;

  const count = chars.length;
  if (!count) { context.restore(); return; }
  context.font = `700 ${fontSize}px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.lineWidth = Math.max(2.1, fontSize * (nearSide ? 0.43 : 0.34));
  context.strokeStyle = nearSide ? 'rgba(255,255,255,.99)' : 'rgba(247,250,255,.42)';
  context.fillStyle = nearSide ? 'rgba(28,43,58,.99)' : 'rgba(62,78,96,.4)';

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + phase;
    const point = pointAt(angle);
    const depth = outlinePoints?.length ? point.depth : Math.sin(angle);
    const sideDistance = Math.abs(Math.cos(angle));
    const opacity = nearSide
      ? smoothstep(0.02, outlinePoints ? 0.25 : 0.32, depth)
      : outlinePoints?.length ? smoothstep(0.02, 0.42, -depth) * 0.1 : smoothstep(0.82, 0.98, sideDistance) * 0.2;
    if (!opacity) continue;

    const glyphIndex = nearSide
      ? (count - 1 - index + count * 2) % count
      : (index + count * 2) % count;
    const glyph = chars[glyphIndex];
    if (!glyph || glyph === ' ') continue;

    let tangent = outlinePoints?.length ? point.tangent : Math.atan2(
      -rx * Math.sin(angle) * sinTilt + ry * Math.cos(angle) * cosTilt,
      -rx * Math.sin(angle) * cosTilt - ry * Math.cos(angle) * sinTilt,
    );
    while (tangent > Math.PI / 2) tangent -= Math.PI;
    while (tangent < -Math.PI / 2) tangent += Math.PI;
    if (!outlinePoints?.length) tangent = Math.max(-0.28, Math.min(0.28, tangent));
    else tangent = Math.max(-0.72, Math.min(0.72, tangent));
    const scale = outlinePoints
      ? nearSide ? 0.96 + Math.max(0, depth) * 0.16 : 0.82
      : nearSide ? 0.94 + Math.max(0, depth) * 0.13 : 0.9;

    context.save();
    context.globalAlpha = opacity;
    context.translate(point.x, point.y);
    context.rotate(tangent);
    context.scale(scale, scale);
    context.shadowColor = nearSide ? 'rgba(255,255,255,.48)' : 'rgba(255,255,255,.26)';
    context.shadowBlur = nearSide ? 2.2 : 0.8;
    context.strokeText(glyph, 0, 0);
    context.shadowBlur = 0;
    context.fillText(glyph, 0, 0);
    context.restore();
  }
  context.restore();
}

function OrbitTagTrack({ bubble, size = bubble.size, children, focused = false, visible = false }) {
  const backCanvasRef = useRef(null);
  const frontCanvasRef = useRef(null);
  const outlinePathRef = useRef(null);
  const rotationRef = useRef(0);
  const dragRef = useRef(null);
  const pausedRef = useRef(false);
  const drawRef = useRef(() => {});
  const [hovered, setHovered] = useState(false);
  const showOrbit = visible || focused || hovered;
  const note = bubble.comments[0]?.text || bubble.quote;
  const outlinePath = bubble.shape && bubble.shape !== 'orb' ? BUBBLE_SHAPE_PATHS[bubble.shape] : null;
  const compactText = `${bubble.title} · ${bubble.kind}`;
  const compactNote = focused ? `${note.slice(0, 10)} · ` : '';
  const orbitText = outlinePath
    ? `${compactText}   ✦   ${compactNote}${compactText}   ✦   ${compactText}`
    : `${compactText}   ✦   ${compactNote}${compactText}   ✦`;
  const orbitFontSize = outlinePath
    ? Math.max(9.3, Math.min(12.1, size * 0.067))
    : Math.max(7, Math.min(9.6, size * 0.048));
  const orbitChars = Array.from(orbitText);
  const shapeGlyphCount = Math.ceil(((size + 44) * 2.28) / (orbitFontSize * 0.98));
  const chars = outlinePath ? orbitChars.slice(0, Math.max(42, shapeGlyphCount)) : orbitChars;
  const width = size + (outlinePath ? 76 : 124);
  const height = size + (outlinePath ? 76 : 88);
  const cx = width / 2;
  const cy = height / 2;
  const rx = size * 0.76;
  const ry = size * 0.28;
  const rightHandle = `M ${cx + rx * 0.8} ${cy - ry * 0.55} C ${cx + rx * 1.13} ${cy - ry * 0.46} ${cx + rx * 1.13} ${cy + ry * 0.46} ${cx + rx * 0.8} ${cy + ry * 0.55}`;
  const leftHandle = `M ${cx - rx * 0.8} ${cy + ry * 0.55} C ${cx - rx * 1.13} ${cy + ry * 0.46} ${cx - rx * 1.13} ${cy - ry * 0.46} ${cx - rx * 0.8} ${cy - ry * 0.55}`;

  useEffect(() => {
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    const backContext = backCanvas?.getContext('2d');
    const frontContext = frontCanvas?.getContext('2d');
    if (!backCanvas || !frontCanvas || !backContext || !frontContext) return undefined;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.25 : 1.65);
    [backCanvas, frontCanvas].forEach((canvas) => {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext('2d').setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    });

    if (!showOrbit) {
      backContext.clearRect(0, 0, width, height);
      frontContext.clearRect(0, 0, width, height);
      drawRef.current = () => {};
      return () => { drawRef.current = () => {}; };
    }

    let outlinePoints = null;
    if (outlinePath && outlinePathRef.current) {
      const path = outlinePathRef.current;
      const length = path.getTotalLength();
      const sampleCount = Math.max(120, Math.ceil(length * 0.72));
      outlinePoints = Array.from({ length: sampleCount }, (_, index) => {
        const point = path.getPointAtLength((length * index) / sampleCount);
        return { x: point.x, y: point.y };
      });
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frameInterval = window.matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 1000 / 45;
    let frame = 0;
    let lastDraw = 0;
    let previousTime = performance.now();
    const draw = (time) => {
      const delta = Math.min(48, time - previousTime);
      previousTime = time;
      if (!pausedRef.current && !reduced) rotationRef.current += delta * 0.00018;
      [backContext, frontContext].forEach((context) => context.clearRect(0, 0, width, height));
      paintOrbitHemisphere(backContext, { width, height, bubbleSize: size, chars, phase: rotationRef.current, nearSide: false, outlinePoints, fontSize: orbitFontSize });
      paintOrbitHemisphere(frontContext, { width, height, bubbleSize: size, chars, phase: rotationRef.current, nearSide: true, outlinePoints, fontSize: orbitFontSize });
    };
    drawRef.current = draw;
    if (reduced) draw(performance.now());
    else {
      const tick = (time) => {
        if (time - lastDraw >= frameInterval) {
          draw(time);
          lastDraw = time;
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      drawRef.current = () => {};
    };
  }, [bubble.id, chars.join(''), focused, height, outlinePath, orbitFontSize, showOrbit, size, width]);

  const startDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pausedRef.current = true;
    dragRef.current = { x: event.clientX, rotation: rotationRef.current, pointerId: event.pointerId };
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    rotationRef.current = drag.rotation + ((event.clientX - drag.x) / width) * Math.PI * 2;
    drawRef.current(performance.now());
  };
  const endDrag = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    pausedRef.current = event.currentTarget.matches(':hover');
    drawRef.current(performance.now());
  };
  const pauseOnHover = (event) => { if (event.pointerType === 'mouse') pausedRef.current = true; };
  const resumeAfterHover = (event) => { if (event.pointerType === 'mouse' && !dragRef.current) pausedRef.current = false; };
  const pointerProps = focused ? { onPointerEnter: pauseOnHover, onPointerLeave: resumeAfterHover, onPointerDown: startDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag } : {};

  return (
    <div
      className={`bubble-orbit-position${showOrbit ? ' is-visible' : ''}`}
      style={{ width, height }}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovered(false); }}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}
    >
      <canvas ref={backCanvasRef} className="bubble-orbit-canvas bubble-orbit-back" aria-hidden="true" />
      {children}
      <canvas ref={frontCanvasRef} className="bubble-orbit-canvas bubble-orbit-front" aria-hidden="true" />
      {outlinePath ? (
        <svg className={`bubble-orbit-input${focused ? '' : ' is-passive'}`} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <g transform={`translate(${cx} ${cy}) scale(${(size + 30) / 100}) translate(-50 -50)`}>
            <path ref={outlinePathRef} className={focused ? '' : 'is-passive'} d={outlinePath} {...pointerProps} />
          </g>
        </svg>
      ) : focused && (
        <svg className="bubble-orbit-input" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <path d={rightHandle} {...pointerProps} />
          <path d={leftHandle} {...pointerProps} />
        </svg>
      )}
    </div>
  );
}

function BubbleBurstLayer({ bursts }) {
  const canvasRef = useRef(null);
  const burstsRef = useRef([]);
  const rendererRef = useRef(null);
  const lastIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !field || !context) return undefined;
    let raf = 0;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let lastFrame = 0;
    const palette = {
      blue: ['#c6e0ed', '#ffffff', '#789caf'],
      rose: ['#f0cbd9', '#ffffff', '#b87896'],
      lilac: ['#ddd2ef', '#ffffff', '#9481b1'],
      gold: ['#f0dfb7', '#ffffff', '#a18959'],
    };
    const resize = () => {
      const rect = field.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    const createParticles = (burst, now) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const colors = palette[burst.accent] || palette.blue;
      const isMobile = window.matchMedia('(pointer: coarse)').matches;
      const filmCount = isMobile ? 5 : 8;
      const count = isMobile ? 16 : 22;
      const particles = Array.from({ length: reducedMotion ? 0 : count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.32;
        const shell = index < filmCount;
        const speed = shell ? 86 + Math.random() * 150 : 58 + Math.random() * 228;
        const impactKick = shell ? 58 : 34;
        return {
          kind: shell ? 'film' : 'drop',
          x: burst.x + Math.cos(angle) * burst.radius * (shell ? 0.78 : 0.42 + Math.random() * 0.5),
          y: burst.y + Math.sin(angle) * burst.radius * (shell ? 0.78 : 0.42 + Math.random() * 0.5),
          vx: Math.cos(angle) * speed + Math.cos(burst.impactAngle) * impactKick + (Math.random() - 0.5) * 54,
          vy: Math.sin(angle) * speed + Math.sin(burst.impactAngle) * impactKick - 28 - Math.random() * 62,
          radius: shell ? 2.4 + Math.random() * 3.2 : 3.4 + Math.random() * 9.8,
          length: shell ? 17 + Math.random() * 26 : 6 + Math.random() * 12,
          spin: (Math.random() - 0.5) * 12,
          rotation: angle + Math.PI / 2,
          life: shell ? 0.58 + Math.random() * 0.22 : 0.66 + Math.random() * 0.28,
          age: 0,
          colors,
        };
      });
      return { ...burst, colors, particles, reducedMotion, startedAt: now };
    };
    const drawRupture = (burst, elapsed) => {
      const progress = Math.min(1, elapsed / 0.94);
      const snap = Math.min(1, elapsed / 0.085);
      const open = Math.max(0, elapsed - 0.085);
      const pinch = burst.reducedMotion ? 0.98 : elapsed < 0.085 ? 1 - snap * 0.3 : 0.7 + (1 - Math.exp(-open * 9)) * 0.39;
      const alpha = burst.reducedMotion ? 0.82 : elapsed < 0.48 ? 1 : Math.max(0, 1 - (elapsed - 0.48) / 0.46);
      const gap = burst.reducedMotion ? 0 : burst.impactAngle;
      const gapWidth = burst.reducedMotion ? 0 : 0.14 + Math.min(1, elapsed / 0.26) * 0.76;
      const radius = burst.radius * pinch;
      context.save();
      context.translate(burst.x, burst.y);
      context.rotate(burst.reducedMotion ? 0 : elapsed * -0.12);

      // A thin, iridescent sheet buckles before the rim tears open.
      if (!burst.reducedMotion && elapsed < 0.28) {
        const sheetFade = 1 - elapsed / 0.28;
        const points = 48;
        context.beginPath();
        for (let index = 0; index <= points; index += 1) {
          const angle = (index / points) * Math.PI * 2;
          const wobble = 1 + Math.sin(angle * 3 + elapsed * 19) * 0.018 + Math.sin(angle * 7 - elapsed * 13) * 0.012;
          const x = Math.cos(angle) * radius * wobble;
          const y = Math.sin(angle) * radius * 0.92 * wobble;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        const filmSheet = context.createRadialGradient(0, 0, radius * 0.34, 0, 0, radius * 1.05);
        filmSheet.addColorStop(0, 'rgba(255,255,255,0)');
        filmSheet.addColorStop(0.7, `${burst.colors[0]}${Math.round(0.055 * sheetFade * 255).toString(16).padStart(2, '0')}`);
        filmSheet.addColorStop(0.9, `${burst.colors[2]}${Math.round(0.13 * sheetFade * 255).toString(16).padStart(2, '0')}`);
        filmSheet.addColorStop(1, `rgba(255,255,255,${0.2 * sheetFade})`);
        context.globalAlpha = 1;
        context.fillStyle = filmSheet;
        context.fill();
        context.lineWidth = 1.15;
        context.strokeStyle = `rgba(255,255,255,${0.42 * sheetFade})`;
        context.stroke();
      }

      // A brief pressure ring gives the rupture a readable outward snap.
      if (!burst.reducedMotion && elapsed < 0.32) {
        const ripple = Math.min(1, elapsed / 0.32);
        context.beginPath();
        context.ellipse(0, 0, radius * (0.42 + ripple * 0.72), radius * (0.42 + ripple * 0.72) * 0.92, 0, 0, Math.PI * 2);
        context.strokeStyle = `rgba(255,255,255,${(1 - ripple) * 0.78})`;
        context.lineWidth = 1.8 - ripple * 0.7;
        context.shadowColor = burst.colors[0];
        context.shadowBlur = 13;
        context.stroke();
      }

      // Keep the membrane open at the impact point instead of closing it with a chord.
      context.beginPath();
      const rimStart = gap + gapWidth;
      const rimSweep = Math.PI * 2 - gapWidth * 2;
      const rimSegments = 104;
      for (let index = 0; index <= rimSegments; index += 1) {
        const angle = rimStart + (index / rimSegments) * rimSweep;
        const ripple = Math.sin(angle * 3 + elapsed * 17) * 0.018 + Math.sin(angle * 6 - elapsed * 12) * 0.012;
        const impactPull = Math.cos(angle - gap) * 0.045 * Math.exp(-elapsed * 7);
        const rimRadius = radius * (1 + ripple + impactPull);
        const x = Math.cos(angle) * rimRadius;
        const y = Math.sin(angle) * rimRadius * 0.92;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const sheen = context.createLinearGradient(-radius, -radius, radius, radius);
      sheen.addColorStop(0, `rgba(255,255,255,${0.98 * alpha})`);
      sheen.addColorStop(0.28, `${burst.colors[0]}${Math.round(0.96 * alpha * 255).toString(16).padStart(2, '0')}`);
      sheen.addColorStop(0.54, `${burst.colors[2]}${Math.round(0.88 * alpha * 255).toString(16).padStart(2, '0')}`);
      sheen.addColorStop(0.77, `rgba(255,255,255,${0.95 * alpha})`);
      sheen.addColorStop(1, `${burst.colors[0]}${Math.round(0.94 * alpha * 255).toString(16).padStart(2, '0')}`);
      context.lineCap = 'round';
      context.strokeStyle = `${burst.colors[2]}${Math.round(0.62 * alpha * 255).toString(16).padStart(2, '0')}`;
      context.lineWidth = Math.max(3.5, burst.radius * 0.043 * (1 - progress * 0.14));
      context.shadowColor = `${burst.colors[2]}99`;
      context.shadowBlur = 12;
      context.stroke();
      context.strokeStyle = sheen;
      context.lineWidth = Math.max(2.2, burst.radius * 0.025 * (1 - progress * 0.1));
      context.shadowColor = `${burst.colors[0]}ee`;
      context.shadowBlur = 16;
      context.stroke();

      // Two curved film lips peel away from the puncture before breaking into droplets.
      if (!burst.reducedMotion) {
        // The puncture briefly draws a glossy tongue of film toward the impact.
        const tongueFade = Math.max(0, 1 - elapsed / 0.3);
        if (tongueFade > 0) {
          context.save();
          context.rotate(gap);
          const tongueLength = radius * (0.28 + Math.min(1, elapsed / 0.09) * 0.28);
          context.beginPath();
          context.moveTo(radius * 0.72, -radius * 0.11);
          context.quadraticCurveTo(radius * 0.86, -radius * 0.02, radius + tongueLength, 0);
          context.quadraticCurveTo(radius * 0.88, radius * 0.1, radius * 0.72, radius * 0.11);
          const tongue = context.createLinearGradient(radius * 0.72, 0, radius + tongueLength, 0);
          tongue.addColorStop(0, `rgba(255,255,255,${0.76 * tongueFade})`);
          tongue.addColorStop(0.48, `${burst.colors[0]}${Math.round(0.44 * tongueFade * 255).toString(16).padStart(2, '0')}`);
          tongue.addColorStop(1, `${burst.colors[2]}${Math.round(0.08 * tongueFade * 255).toString(16).padStart(2, '0')}`);
          context.fillStyle = tongue;
          context.shadowColor = burst.colors[0];
          context.shadowBlur = 10;
          context.fill();
          context.restore();
        }
        [-1, 1].forEach((side) => {
          const rootAngle = gap + side * gapWidth;
          const tipAngle = gap + side * (gapWidth + 0.48);
          const drift = elapsed * 58;
          const root = { x: Math.cos(rootAngle) * radius * 0.99, y: Math.sin(rootAngle) * radius * 0.91 };
          const control = { x: Math.cos(rootAngle + side * 0.14) * (radius + 13 + drift), y: Math.sin(rootAngle + side * 0.14) * (radius * 0.91 + 11 + drift) };
          const tip = { x: Math.cos(tipAngle) * (radius + 24 + drift), y: Math.sin(tipAngle) * (radius * 0.92 + 20 + drift) };
          context.beginPath();
          context.moveTo(root.x, root.y);
          context.quadraticCurveTo(control.x, control.y, tip.x, tip.y);
          context.quadraticCurveTo(control.x * 0.9, control.y * 0.88, root.x, root.y);
          const flap = context.createLinearGradient(root.x, root.y, tip.x, tip.y);
          flap.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
          flap.addColorStop(0.48, `${burst.colors[0]}${Math.round(0.7 * alpha * 255).toString(16).padStart(2, '0')}`);
          flap.addColorStop(1, `${burst.colors[2]}${Math.round(0.2 * alpha * 255).toString(16).padStart(2, '0')}`);
          context.fillStyle = flap;
          context.globalAlpha = Math.max(0, 1 - elapsed / 0.82);
          context.shadowColor = burst.colors[0];
          context.shadowBlur = 12;
          context.fill();
          context.globalAlpha = alpha * Math.max(0, 1 - elapsed / 0.82);
          context.lineWidth = 1.35;
          context.strokeStyle = 'rgba(255,255,255,.92)';
          context.stroke();
        });
      }
      context.restore();
    };
    const drawParticle = (particle, dt) => {
      particle.age += dt;
      const fade = Math.max(0, 1 - particle.age / particle.life);
      if (fade <= 0) return;
      particle.vx *= Math.pow(0.985, dt * 60);
      particle.vy = particle.vy * Math.pow(0.992, dt * 60) + 390 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
      if (particle.kind === 'film') {
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.globalAlpha = fade * 0.94;
        context.lineWidth = 1.3 + particle.radius * 0.34;
        context.lineCap = 'round';
        context.strokeStyle = particle.colors[0];
        context.shadowColor = particle.colors[2];
        context.shadowBlur = 11;
        context.beginPath();
        context.moveTo(-particle.length * 0.6, 0);
        context.quadraticCurveTo(-particle.length * 0.12, -particle.radius * 1.45, particle.length * 0.65, particle.radius * 0.2);
        context.stroke();
        context.globalAlpha = fade * 0.9;
        context.lineWidth = 1;
        context.strokeStyle = particle.colors[1];
        context.beginPath();
        context.moveTo(-particle.length * 0.5, -0.5);
        context.quadraticCurveTo(0, -particle.radius, particle.length * 0.44, 0.8);
        context.stroke();
        context.restore();
        return;
      }
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.scale(0.72, 1.18);
      const speed = Math.hypot(particle.vx, particle.vy);
      const tail = Math.min(particle.radius * 2.1, speed * 0.018) * fade;
      if (tail > 1) {
        context.globalAlpha = fade * 0.38;
        context.lineWidth = Math.max(0.8, particle.radius * 0.24);
        context.lineCap = 'round';
        context.strokeStyle = particle.colors[0];
        context.shadowColor = particle.colors[1];
        context.shadowBlur = 5;
        context.beginPath();
        context.moveTo(0, particle.radius * 0.8);
        context.quadraticCurveTo(particle.radius * 0.5, particle.radius + tail * 0.6, 0, particle.radius + tail);
        context.stroke();
      }
      context.globalAlpha = fade;
      const drop = context.createRadialGradient(-particle.radius * 0.32, -particle.radius * 0.42, 0.4, 0, 0, particle.radius * 1.3);
      drop.addColorStop(0, `rgba(255,255,255,${0.92 * fade})`);
      drop.addColorStop(0.34, `${particle.colors[0]}${Math.round(0.86 * fade * 255).toString(16).padStart(2, '0')}`);
      drop.addColorStop(0.78, `${particle.colors[2]}${Math.round(0.72 * fade * 255).toString(16).padStart(2, '0')}`);
      drop.addColorStop(1, `rgba(255,255,255,${0.95 * fade})`);
      context.fillStyle = drop;
      context.shadowColor = particle.colors[1];
      context.shadowBlur = 10;
      context.beginPath();
      context.moveTo(0, -particle.radius * 1.42);
      context.bezierCurveTo(particle.radius * 0.98, -particle.radius * 0.72, particle.radius * 1.04, particle.radius * 0.58, 0, particle.radius * 1.18);
      context.bezierCurveTo(-particle.radius * 1.04, particle.radius * 0.58, -particle.radius * 0.98, -particle.radius * 0.72, 0, -particle.radius * 1.42);
      context.fill();
      context.globalAlpha = fade * 0.82;
      context.fillStyle = '#fff';
      context.beginPath();
      context.ellipse(-particle.radius * 0.28, -particle.radius * 0.36, Math.max(0.8, particle.radius * 0.2), Math.max(0.6, particle.radius * 0.42), -0.42, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };
    const animate = (now) => {
      raf = 0;
      const dt = lastFrame ? Math.min(0.032, (now - lastFrame) / 1000) : 0.016;
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      burstsRef.current = burstsRef.current.filter((burst) => now - burst.startedAt < (burst.reducedMotion ? 240 : 1250));
      burstsRef.current.forEach((burst) => {
        const elapsed = (now - burst.startedAt) / 1000;
        if (elapsed < (burst.reducedMotion ? 0.24 : 0.94)) drawRupture(burst, elapsed);
        burst.particles.forEach((particle) => drawParticle(particle, dt));
      });
      if (burstsRef.current.length) raf = window.requestAnimationFrame(animate);
      else lastFrame = 0;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(field);
    resize();
    rendererRef.current = (burst) => {
      if (burst) {
        const pointerAngle = Math.atan2(burst.pointerY - burst.y, burst.pointerX - burst.x);
        burstsRef.current.push(createParticles({ ...burst, impactAngle: pointerAngle }, performance.now()));
        if (burstsRef.current.length > 3) burstsRef.current.splice(0, burstsRef.current.length - 3);
      }
      if (!raf) raf = window.requestAnimationFrame(animate);
    };
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      rendererRef.current = null;
      burstsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const fresh = bursts.filter((burst) => burst.id > lastIdRef.current);
    if (!fresh.length) return;
    fresh.forEach((burst) => {
      lastIdRef.current = Math.max(lastIdRef.current, burst.id);
      rendererRef.current?.(burst);
    });
  }, [bursts]);

  return <canvas ref={canvasRef} className="bubble-burst-canvas" aria-hidden="true" />;
}

function ARIllustrations() {
  const decals = [
    { shape: 'flower', className: 'ar-decal-flower', left: '12%', top: '38%', size: 43 },
    { shape: 'star', className: 'ar-decal-star', left: '82%', top: '29%', size: 34 },
    { shape: 'heart', className: 'ar-decal-heart', left: '77%', top: '61%', size: 38 },
    { shape: 'flower', className: 'ar-decal-small-flower', left: '20%', top: '70%', size: 25 },
  ];
  return (
    <div className="ar-illustration-field" aria-hidden="true">
      {decals.map((decal, index) => (
        <svg key={decal.className} className={`ar-decal ${decal.className}`} viewBox="0 0 100 100" style={{ left: decal.left, top: decal.top, width: decal.size, height: decal.size, '--decal-delay': `${index * -0.7}s` }}>
          <path d={BUBBLE_SHAPE_PATHS[decal.shape]} />
          <path className="ar-decal-shine" d={decal.shape === 'heart' ? 'M27 42 C30 30 39 26 48 30' : 'M31 34 C36 24 46 21 54 25'} />
          {decal.shape === 'flower' && <circle cx="50" cy="50" r="10" />}
        </svg>
      ))}
      <svg className="ar-brush-overlay" viewBox="0 0 400 700" preserveAspectRatio="none">
        <path className="brush-sun-ray" d="M318 118c-18-20-26-46-20-69m19 57c4-25 18-47 38-60m-34 65c20-15 44-21 68-16" />
        <path className="brush-loop" d="M35 272c26-27 61-20 68 4 7 25-23 37-43 22-17-13-9-34 12-42" />
        <path className="brush-flower-stem" d="M306 522c-12-38 2-70 28-92m-29 79c-20-13-34-28-42-48" />
        <path className="brush-arrow" d="M31 566c25 4 41-3 53-20m-12 1 13-2-1 14" />
        <path className="brush-dash" d="M235 204c9-7 18-8 28-4m-21 12c8-3 14-3 20 0m66 315c8-7 17-9 26-6" />
        <circle className="brush-dot" cx="88" cy="130" r="3" /><circle className="brush-dot" cx="105" cy="144" r="2" /><circle className="brush-dot" cx="352" cy="330" r="3" />
      </svg>
    </div>
  );
}

function CameraPreview({ stream, className = '' }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return undefined;
    video.srcObject = stream;
    video.play().catch(() => {});
    return () => { video.srcObject = null; };
  }, [stream]);
  return <video ref={videoRef} className={`ar-camera-video ${className}`} autoPlay muted playsInline aria-hidden="true" />;
}

function ARCommentsSheet({ bubble, onClose, global = false }) {
  const [draft, setDraft] = useState('');
  const [comments, setComments] = useState(() => bubble?.comments || []);
  useEffect(() => {
    setComments(bubble?.comments || []);
    setDraft('');
  }, [bubble?.id]);
  useEffect(() => {
    if (!bubble) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [bubble, onClose]);
  if (!bubble) return null;
  const submitComment = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((current) => [...current, { author: '你', text }]);
    setDraft('');
  };
  return (
    <div className={`ar-comments-backdrop${global ? ' is-global' : ''}`} onClick={onClose}>
      <section className="ar-comments-sheet" role="dialog" aria-modal="true" aria-label={`${bubble.title}的留言`} onClick={(event) => event.stopPropagation()}>
        <span className="ar-sheet-grabber" />
        <div className="ar-comments-heading">
          <div><small>泡泡里的回声 · {comments.length} 条</small><h2>{bubble.title}</h2></div>
          <button onClick={onClose} aria-label="关闭留言">×</button>
        </div>
        <p className="ar-comments-quote">“{bubble.quote}”</p>
        <div className="ar-comments-list">
          {comments.length ? comments.map((comment, index) => (
            <article className="ar-comment" key={`${comment.author}-${index}`}>
              <span className={`comment-orb orb-${index % 3}`}><i /></span>
              <div><strong>{comment.author}</strong><p>{comment.text}</p></div>
              <small>{index === comments.length - 1 ? '刚刚' : '稍早'}</small>
            </article>
          )) : <p className="ar-comment-empty">这颗泡泡还没有留言，听完后留下一句吧。</p>}
        </div>
        <form className="ar-comment-form" onSubmit={submitComment}>
          <input aria-label="写一条留言" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="留一句回声…" maxLength={80} />
          <button type="submit" disabled={!draft.trim()}>发送</button>
        </form>
        <div className="ar-comment-footnote"><i /> 本次演示可见 · 后端尚未接入</div>
      </section>
    </div>
  );
}

function CaptureWaterFlow({ anchorIndex }) {
  const edge = Math.abs(Number(anchorIndex) || 1) % 4;
  const starts = [[4, 42], [96, 38], [12, 92], [88, 92]];
  const [startX, startY] = starts[edge];
  const path = `M ${startX} ${startY} C ${startX < 50 ? 28 : 72} ${Math.max(8, startY - 22)}, ${startX < 50 ? 72 : 28} 72, 50 47`;
  return (
    <svg className="capture-water-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="capture-water-gradient" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#a8f5ec" stopOpacity="0" /><stop offset=".38" stopColor="#c3fff4" stopOpacity=".86" /><stop offset=".7" stopColor="#e4c9ff" stopOpacity=".93" /><stop offset="1" stopColor="#fff" /></linearGradient>
        <filter id="capture-water-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path className="water-flow-trail" d={path} />
      <path className="water-flow-ribbon" d={path} pathLength="100" stroke="url(#capture-water-gradient)" filter="url(#capture-water-glow)" />
      <path className="water-flow-core" d={path} pathLength="100" stroke="url(#capture-water-gradient)" filter="url(#capture-water-glow)" />
      <circle className="water-flow-pearl" r="1.35" filter="url(#capture-water-glow)"><animateMotion dur="1.18s" fill="freeze" path={path} /></circle>
    </svg>
  );
}

function RoamArrivalBurst() {
  const bubbles = [
    [-38, -34, 16], [-26, -44, 10], [-11, -38, 20], [8, -46, 12], [25, -40, 18], [41, -30, 9], [-44, -14, 12], [-31, 2, 19], [-17, 14, 10], [3, 0, 14], [19, 16, 20], [38, 4, 13], [-40, 30, 18], [-20, 41, 12], [1, 34, 21], [23, 43, 11], [42, 29, 16], [4, -18, 8], [28, -13, 8], [-7, 29, 8],
  ];
  return <div className="roam-arrival-burst" aria-hidden="true">{bubbles.map(([x, y, size], index) => <i key={index} style={{ '--burst-x': `${x}vw`, '--burst-y': `${y}vh`, '--burst-size': `${size}px`, '--burst-delay': `${(index % 6) * 28}ms` }} />)}</div>;
}

function RoamEntryOverlay({ phase, progress, onSkip, locationStatus }) {
  const [skipVisible, setSkipVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSkipVisible(true);
      return undefined;
    }
    const timeout = window.setTimeout(() => setSkipVisible(true), 420);
    return () => window.clearTimeout(timeout);
  }, []);
  const scanning = phase === 'scan';
  const scanHint = locationStatus === 'requesting' ? '正在准备镜头与位置' : locationStatus === 'denied' ? '允许定位，寻找身边的声音' : locationStatus === 'unavailable' ? '移动镜头，寻找声音图卡' : locationStatus === 'weak' ? '继续移动镜头，寻找声音图卡' : locationStatus === 'active' ? '位置已准备好' : '镜头就绪，寻找声音图卡';
  return (
    <div className={`roam-entry-overlay phase-${phase}`} aria-live="polite" aria-label="漫游取景准备">
      <div className={`roam-entry-visual${scanning ? ' is-scanning' : ' is-buffering'}`} aria-hidden="true">
        <span className="entry-corner corner-tl" /><span className="entry-corner corner-tr" /><span className="entry-corner corner-bl" /><span className="entry-corner corner-br" />
        <span className="entry-scan-beam" /><span className="entry-scan-dot dot-one" /><span className="entry-scan-dot dot-two" /><span className="entry-scan-dot dot-three" />
        <span className="entry-buffer-ring"><i /></span>
      </div>
      <div className="roam-entry-copy">
        <span className="entry-eyebrow">MEMO GARDEN</span>
        <strong>{scanning ? '正在扫描' : '泡泡正在聚集'}</strong>
        <small>{scanning ? scanHint : '泡泡水正在注入漫游视野'}</small>
      </div>
      <CapsuleWaterProgress progress={progress} />
      {skipVisible && <button className="entry-skip" onClick={onSkip}>立即进入取景 <span>↗</span></button>}
    </div>
  );
}

function HomeBubble({ bubble, index, popped, onPop, onDragStart, onDragMove, onDragEnd, onFocus, focused, filtered, highlighted }) {
  const buttonRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const showOrbit = focused || hovered;
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);
  const isResonant = bubble.saves >= 50 || bubble.comments.length >= 2;

  useEffect(() => () => window.clearTimeout(suppressClickTimerRef.current), []);

  const pop = (event) => {
    const button = buttonRef.current;
    if (!button || popped) {
      suppressClickRef.current = false;
      return;
    }
    gsap.killTweensOf(button);
    gsap.timeline()
      .to(button, { scaleX: 1.1, scaleY: 0.88, filter: 'brightness(1.35)', duration: 0.075, ease: 'power2.out' })
      .to(button, { scaleX: 0.82, scaleY: 1.18, filter: 'brightness(1.85)', duration: 0.11, ease: 'power3.inOut' })
      .to(button, { scaleX: 1.04, scaleY: 0.76, duration: 0.07, ease: 'power2.out' })
      .to(button, { scale: 0.015, opacity: 0, filter: 'brightness(2.4) blur(4px)', duration: 0.19, ease: 'power2.in' });
    const ripple = button.querySelector('.pop-ripple');
    if (ripple) gsap.fromTo(ripple, { scale: 0.24, opacity: 0.9 }, { scale: 1.55, opacity: 0, duration: 0.34, ease: 'power1.out' });
    onPop(bubble, event);
  };

  const pointerDown = (event) => {
    if (popped || (event.pointerType === 'mouse' && event.button !== 0)) return;
    suppressClickRef.current = false;
    window.clearTimeout(suppressClickTimerRef.current);
    suppressClickTimerRef.current = null;
    gestureRef.current = { id: event.pointerId, pointerType: event.pointerType, x: event.clientX, y: event.clientY, dragged: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gsap.to(event.currentTarget, { scaleX: 0.94, scaleY: 1.05, duration: 0.12, ease: 'power2.out' });
  };

  const pointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.dragged && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > (gesture.pointerType === 'touch' ? 12 : 7)) {
      gesture.dragged = true;
      gsap.killTweensOf(event.currentTarget);
      gsap.set(event.currentTarget, { clearProps: 'transform' });
      onDragStart?.(bubble, event);
    }
    if (gesture.dragged) onDragMove?.(bubble, event);
  };

  const pointerEnd = (event) => {
    const button = event.currentTarget;
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    gestureRef.current = null;
    if (gesture.dragged) {
      suppressClickRef.current = true;
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 220);
      gsap.set(button, { clearProps: 'transform' });
      onDragEnd?.(bubble, event);
    }
    else gsap.to(button, { scaleX: 1, scaleY: 1, duration: 0.44, ease: 'elastic.out(1, 0.34)', onComplete: () => gsap.set(button, { clearProps: 'transform' }) });
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (popped || !button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const rebound = gsap.fromTo(button, { scale: 0.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.56, ease: 'elastic.out(1, 0.48)', onComplete: () => gsap.set(button, { clearProps: 'transform' }) });
    return () => rebound.kill();
  }, [popped]);

  const bubbleButton = (
    <button
      ref={buttonRef}
      className={`soap-bubble home-bubble accent-${bubble.accent}${bubble.shape ? ` has-silhouette shape-${bubble.shape}` : ''}${isResonant ? ' bubble-hot' : ''}`}
      aria-label={`拖动或戳开${bubble.kind}泡泡并回听：${bubble.title}`}
      title={`${bubble.kind} · ${bubble.title}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerEnd}
      onFocus={onFocus}
      onClick={(event) => {
        if (suppressClickRef.current && event.detail !== 0) {
          suppressClickRef.current = false;
          window.clearTimeout(suppressClickTimerRef.current);
          suppressClickTimerRef.current = null;
          return;
        }
        onFocus?.();
        pop(event);
      }}
    >
      <span className="bubble-contact-film" aria-hidden="true" />
      <span className="bubble-core" />
      <span className="bubble-glint" />
      <BubbleSilhouette bubble={bubble} />
      <span className="bubble-rank-aura" />
      <span className="bubble-rank-mark">{isResonant ? `共鸣 ${bubble.saves}` : ''}</span>
      <span className="pop-ripple" />
    </button>
  );

  return (
    <div
      className={`bubble-body kind-${bubble.kindKey}${showOrbit ? ' has-orbit is-orbit-focus' : ''}${filtered ? ' is-filtered' : ''}${highlighted ? ' is-highlighted' : ''}${isResonant ? ' is-resonant' : ''}${popped ? ' is-popped' : ''}`}
      data-id={bubble.id}
      data-kind={bubble.kindKey}
      data-seed={index}
      style={{ '--bubble-size': `${bubble.size}px`, '--bubble-accent': bubble.accent }}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovered(false); }}
    >
      <svg className="bubble-filter-lasso" viewBox="0 0 160 142" aria-hidden="true"><path d="M81 5C119 2 154 26 153 66S132 131 84 136 7 116 7 73 36 10 81 5Z" /></svg>
      {!popped ? <OrbitTagTrack bubble={bubble} size={bubble.size} focused={focused} visible={showOrbit}>{bubbleButton}</OrbitTagTrack> : bubbleButton}
      <span className="bubble-label"><strong>{bubble.title}</strong><small><i /> {bubble.kind} · {bubble.duration}</small></span>
    </div>
  );
}

function HomeScreen({ bubbles, playing, emitting, onPageChange, poppedId, onBubblePop, onOpenLeaderboard }) {
  const [kindFilter, setKindFilter] = useState('all');
  const [focusedId, setFocusedId] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [filterDragProgress, setFilterDragProgress] = useState(0);
  const [isFilterDragging, setIsFilterDragging] = useState(false);
  const [filterPhysics, setFilterPhysics] = useState({ stretch: 1.06, tailLeft: 0, tailRight: 0 });
  const burstIdRef = useRef(0);
  const fieldRef = useRef(null);
  const filterGestureRef = useRef(null);
  const suppressFilterClickRef = useRef(false);
  const suppressFilterClickTimerRef = useRef(null);
  const physicsRef = useRef({ bodies: [] });
  const kinds = [
    ['all', '全部', '◌'],
    ['voice', '人声', '◉'],
    ['ambience', '环境声', '◌'],
    ['thought', '碎念', '✳'],
  ];
  const selectedFilterIndex = Math.max(0, kinds.findIndex(([key]) => key === kindFilter));

  useEffect(() => {
    if (!isFilterDragging) setFilterDragProgress(selectedFilterIndex);
  }, [selectedFilterIndex, isFilterDragging]);

  const filterProgressAtPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const inset = 4;
    const slotWidth = (rect.width - inset * 2) / kinds.length;
    return Math.max(0, Math.min(kinds.length - 1, (event.clientX - rect.left - inset) / slotWidth - 0.5));
  };
  const updateFilterGesture = (event) => {
    if (filterGestureRef.current?.pointerId !== event.pointerId) return;
    const dx = event.clientX - filterGestureRef.current.previousX;
    filterGestureRef.current.previousX = event.clientX;
    const tail = Math.min(17, Math.abs(dx) * 0.68);
    setFilterPhysics({ stretch: 1 + Math.min(0.23, Math.abs(dx) / 105), tailLeft: dx > 0 ? tail : 0, tailRight: dx < 0 ? tail : 0 });
    const progress = filterProgressAtPointer(event);
    const targetIndex = Math.round(progress);
    filterGestureRef.current.targetIndex = targetIndex;
    setFilterDragProgress(progress);
    const nextKind = kinds[targetIndex][0];
    setKindFilter((current) => current === nextKind ? current : nextKind);
  };
  const beginFilterGesture = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    suppressFilterClickRef.current = false;
    window.clearTimeout(suppressFilterClickTimerRef.current);
    suppressFilterClickTimerRef.current = null;
    const progress = filterProgressAtPointer(event);
    filterGestureRef.current = { pointerId: event.pointerId, startX: event.clientX, previousX: event.clientX };
    setFilterDragProgress(progress);
    setFilterPhysics({ stretch: 1.12, tailLeft: 0, tailRight: 0 });
    setIsFilterDragging(true);
  };
  const finishFilterGesture = (event, cancelled = false) => {
    const gesture = filterGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const progress = cancelled ? selectedFilterIndex : filterProgressAtPointer(event);
    const targetIndex = Math.round(progress);
    const didSwipe = !cancelled && Math.abs(event.clientX - gesture.startX) > 12;
    filterGestureRef.current = null;
    setIsFilterDragging(false);
    setFilterDragProgress(targetIndex);
    setFilterPhysics({ stretch: 1.06, tailLeft: 0, tailRight: 0 });
    if (didSwipe) {
      setKindFilter(kinds[targetIndex][0]);
      suppressFilterClickRef.current = true;
      window.clearTimeout(suppressFilterClickTimerRef.current);
      suppressFilterClickTimerRef.current = window.setTimeout(() => {
        suppressFilterClickRef.current = false;
        suppressFilterClickTimerRef.current = null;
      }, 220);
    }
  };
  useEffect(() => {
    if (kindFilter === 'all') return;
    const firstMatch = bubbles.find((bubble) => bubble.kindKey === kindFilter);
    if (firstMatch) setFocusedId(firstMatch.id);
  }, [kindFilter]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const bounds = field.getBoundingClientRect();
    const bodies = [...field.querySelectorAll('.bubble-body')].map((element, index) => {
      const diameter = element.querySelector('.soap-bubble')?.offsetWidth || 80;
      const seed = BUBBLE_FIELD_SEEDS[index % BUBBLE_FIELD_SEEDS.length];
      const maxX = Math.max(0, bounds.width - diameter);
      const maxY = Math.max(0, bounds.height - diameter);
      const x = Math.min(maxX, Math.max(0, seed[0] * maxX + (index % 2 ? 18 : -9)));
      const y = Math.min(maxY, Math.max(0, seed[1] * maxY + (index % 3 ? 12 : -8)));
      const angle = (index * 2.399) + 0.7;
      const speed = motionPreference.matches ? 0 : 17 + (index % 5) * 5;
      element.style.transform = `translate3d(${x}px,${y}px,0)`;
      return { element, diameter, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, phase: index * 1.7, dragging: false, squish: 0, squishAngle: 0, contactAngle: 0 };
    });
    physicsRef.current.bodies = bodies;
    if (bodies.length < 2) return () => { physicsRef.current.bodies = []; };
    const ambientMotion = !motionPreference.matches;
    const frameInterval = window.matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 1000 / 45;
    let frame = 0;
    let last = performance.now();
    let lastFrame = last;
    const resizeObserver = new ResizeObserver(() => {
      const next = field.getBoundingClientRect();
      bodies.forEach((body) => {
        body.x = Math.min(Math.max(0, body.x), Math.max(0, next.width - body.diameter));
        body.y = Math.min(Math.max(0, body.y), Math.max(0, next.height - body.diameter));
      });
    });
    resizeObserver.observe(field);
    const animate = (now) => {
      if (document.hidden) { frame = 0; return; }
      if (now - lastFrame < frameInterval) { frame = window.requestAnimationFrame(animate); return; }
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      lastFrame = now;
      const width = field.clientWidth;
      const height = field.clientHeight;
      bodies.forEach((body) => {
        if (ambientMotion && !body.dragging) {
          body.vx += Math.sin(now * 0.00019 + body.phase) * 0.08 * dt;
          body.vy += Math.cos(now * 0.00017 + body.phase) * 0.1 * dt;
        }
        if (!body.dragging) {
          body.x += body.vx * dt;
          body.y += body.vy * dt;
        }
        body.squish *= Math.exp(-dt * 7.5);
        const edgeX = Math.max(0, width - body.diameter);
        const edgeY = Math.max(0, height - body.diameter);
        const minX = 0;
        const maxX = edgeX;
        const minY = 0;
        const maxY = edgeY;
        if (body.x < minX) { body.x = minX; body.vx = body.dragging ? 0 : Math.abs(body.vx) * 0.88; }
        if (body.x > maxX) { body.x = maxX; body.vx = body.dragging ? 0 : -Math.abs(body.vx) * 0.88; }
        if (body.y < minY) { body.y = minY; body.vy = body.dragging ? 0 : Math.abs(body.vy) * 0.88; }
        if (body.y > maxY) { body.y = maxY; body.vy = body.dragging ? 0 : -Math.abs(body.vy) * 0.88; }
      });
      const currentContacts = new Set();
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = bodies[i];
          const b = bodies[j];
          const ax = a.x + a.diameter / 2;
          const ay = a.y + a.diameter / 2;
          const bx = b.x + b.diameter / 2;
          const by = b.y + b.diameter / 2;
          let dx = bx - ax;
          let dy = by - ay;
          const distance = Math.hypot(dx, dy) || 0.001;
          const minDistance = (a.diameter + b.diameter) / 2;
          if (distance >= minDistance) continue;
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          currentContacts.add(`${i}:${j}`);
          const squeeze = Math.min(1, Math.max(0.18, overlap / (minDistance * 0.3) + (a.dragging || b.dragging ? 0.22 : 0)));
          a.squish = Math.max(a.squish, squeeze);
          b.squish = Math.max(b.squish, squeeze);
          a.squishAngle = Math.atan2(ny, nx);
          b.squishAngle = a.squishAngle;
          a.contactAngle = a.squishAngle;
          b.contactAngle = a.squishAngle + Math.PI;
          if (!a.dragging) {
            const correction = b.dragging ? overlap : overlap * 0.5;
            a.x -= nx * correction;
            a.y -= ny * correction;
          }
          if (!b.dragging) {
            const correction = a.dragging ? overlap : overlap * 0.5;
            b.x += nx * correction;
            b.y += ny * correction;
          }
          const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (relative < 0) {
            const impulse = -(1 + 0.86) * relative * 0.5;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;
          }
        }
      }
      bodies.forEach((body, index) => {
        let touching = false;
        for (let otherIndex = 0; otherIndex < bodies.length; otherIndex += 1) {
          if (otherIndex !== index && currentContacts.has(`${Math.min(index, otherIndex)}:${Math.max(index, otherIndex)}`)) { touching = true; break; }
        }
        body.element.classList.toggle('is-colliding', touching);
        body.element.style.setProperty('--squish-compress', (1 - body.squish * 0.19).toFixed(3));
        body.element.style.setProperty('--squish-stretch', (1 + body.squish * 0.13).toFixed(3));
        body.element.style.setProperty('--squish-angle', `${body.squishAngle}rad`);
        body.element.style.setProperty('--squish-angle-reverse', `${-body.squishAngle}rad`);
        body.element.style.setProperty('--contact-angle', `${body.contactAngle}rad`);
        body.element.style.setProperty('--contact-strength', body.squish.toFixed(3));
        body.element.style.transform = `translate3d(${body.x}px,${body.y}px,0)`;
      });
      frame = window.requestAnimationFrame(animate);
    };
    const handleVisibility = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) { last = performance.now(); lastFrame = last; frame = window.requestAnimationFrame(animate); }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    frame = window.requestAnimationFrame(animate);
    return () => { document.removeEventListener('visibilitychange', handleVisibility); window.cancelAnimationFrame(frame); resizeObserver.disconnect(); physicsRef.current.bodies = []; };
  }, []);

  const beginBubbleDrag = (bubble, event) => {
    const body = physicsRef.current.bodies.find((item) => item.element.dataset.id === bubble.id);
    const field = fieldRef.current;
    if (!body || !field) return;
    const rect = field.getBoundingClientRect();
    body.dragging = true;
    body.dragOffsetX = event.clientX - rect.left - body.x - body.diameter / 2;
    body.dragOffsetY = event.clientY - rect.top - body.y - body.diameter / 2;
    body.dragLastX = body.x;
    body.dragLastY = body.y;
    body.dragLastAt = performance.now();
    body.vx = 0;
    body.vy = 0;
    body.element.classList.add('is-dragging');
  };

  const moveBubbleDrag = (bubble, event) => {
    const body = physicsRef.current.bodies.find((item) => item.element.dataset.id === bubble.id);
    const field = fieldRef.current;
    if (!body?.dragging || !field) return;
    const rect = field.getBoundingClientRect();
    const now = performance.now();
    const nextX = event.clientX - rect.left - body.dragOffsetX - body.diameter / 2;
    const nextY = event.clientY - rect.top - body.dragOffsetY - body.diameter / 2;
    const elapsed = Math.max(0.012, (now - body.dragLastAt) / 1000);
    body.vx = Math.max(-360, Math.min(360, (nextX - body.dragLastX) / elapsed * 0.2));
    body.vy = Math.max(-360, Math.min(360, (nextY - body.dragLastY) / elapsed * 0.2));
    body.x = Math.max(0, Math.min(field.clientWidth - body.diameter, nextX));
    body.y = Math.max(0, Math.min(field.clientHeight - body.diameter, nextY));
    body.dragLastX = body.x;
    body.dragLastY = body.y;
    body.dragLastAt = now;
    body.element.style.transform = `translate3d(${body.x}px,${body.y}px,0)`;
  };

  const endBubbleDrag = (bubble) => {
    const body = physicsRef.current.bodies.find((item) => item.element.dataset.id === bubble.id);
    if (!body?.dragging) return;
    body.dragging = false;
    body.element.classList.remove('is-dragging');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) body.vx = body.vy = 0;
  };

  const handleBubblePop = (bubble, event) => {
    const field = fieldRef.current;
    const rect = field?.getBoundingClientRect();
    const bubbleRect = event.currentTarget.getBoundingClientRect();
    if (rect) {
      setBursts((current) => [...current.slice(-2), {
        id: ++burstIdRef.current,
        x: bubbleRect.left + bubbleRect.width / 2 - rect.left,
        y: bubbleRect.top + bubbleRect.height / 2 - rect.top,
        pointerX: event.clientX - rect.left,
        pointerY: event.clientY - rect.top,
        radius: bubbleRect.width * 0.48,
        accent: bubble.accent,
      }]);
    }
    onBubblePop(bubble);
  };

  return (
    <Scene className="app-home gallery-home">
      <div className="screen-topline">
        <span className="gallery-kicker"><i /> MY SOUND GALLERY <b>{String(bubbles.length).padStart(2, '0')}</b></span>
        <DevicePill playing={playing} emitting={emitting} />
      </div>
      <div className="home-content gallery-content">
        <div className="gallery-heading">
          <span className="eyebrow"><i /> FIELD NOTES / VOL. 01</span>
          <h1>听见<span>留下</span></h1>
          <p>每一颗泡泡，都有一个人的路过。</p>
          <button className="gallery-board" onClick={onOpenLeaderboard} aria-label="打开回声留言榜">
            <span>↗</span><small>回声留言榜</small>
          </button>
        </div>
        <div
          className={`gallery-filter${isFilterDragging ? ' is-filter-dragging' : ''}`}
          role="tablist"
          aria-label="用泡泡聚焦不同声音类型"
          style={{ '--filter-progress': `${(isFilterDragging ? filterDragProgress : selectedFilterIndex) * 100}%`, '--filter-stretch': filterPhysics.stretch, '--filter-tail-left': `${filterPhysics.tailLeft}px`, '--filter-tail-right': `${filterPhysics.tailRight}px` }}
          onPointerDown={beginFilterGesture}
          onPointerMove={updateFilterGesture}
          onPointerUp={finishFilterGesture}
          onPointerCancel={(event) => finishFilterGesture(event, true)}
        >
          <span className="filter-liquid-indicator" aria-hidden="true"><i className="filter-liquid-tail tail-left" /><i className="filter-liquid-tail tail-right" /></span>
          {kinds.map(([key, label, symbol]) => (
            <button key={key} data-kind={key} className={kindFilter === key ? 'selected' : ''} role="tab" aria-selected={kindFilter === key} onClick={() => {
              if (suppressFilterClickRef.current) {
                suppressFilterClickRef.current = false;
                window.clearTimeout(suppressFilterClickTimerRef.current);
                suppressFilterClickTimerRef.current = null;
                return;
              }
              setKindFilter(key);
            }}><i>{symbol}</i><span>{label}</span></button>
          ))}
        </div>
        <div className={`bubble-field${kindFilter === 'all' ? '' : ` filter-${kindFilter}`}`} ref={fieldRef} aria-label="可拖动、相撞并戳开的个人声音泡泡">
          {bubbles.map((bubble, index) => (
            <HomeBubble key={bubble.id} bubble={bubble} index={index} popped={poppedId === bubble.id} onPop={handleBubblePop} onDragStart={beginBubbleDrag} onDragMove={moveBubbleDrag} onDragEnd={endBubbleDrag} onFocus={() => setFocusedId(bubble.id)} focused={focusedId === bubble.id} filtered={kindFilter !== 'all' && bubble.kindKey !== kindFilter} highlighted={kindFilter !== 'all' && bubble.kindKey === kindFilter} />
          ))}
          <BubbleBurstLayer bursts={bursts} />
        </div>
      </div>
      <TabBar active="home" onChange={onPageChange} />
    </Scene>
  );
}

function LeaderboardSheet({ open, onClose, onRoam, bubbles }) {
  const panelRef = useRef(null);
  const backdropRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !panelRef.current || !backdropRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power1.out' });
      gsap.fromTo(panelRef.current, { y: 48, scale: 0.97, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.52, ease: 'back.out(1.35)' });
      gsap.fromTo('.leader-row', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.07, delay: 0.12, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, [open]);

  if (!open) return null;
  const ranked = [...bubbles].sort((a, b) => b.saves + b.comments.length * 8 - (a.saves + a.comments.length * 8)).slice(0, 3);
  return (
    <div className="sheet-backdrop" ref={backdropRef} onClick={onClose}>
      <section className="leader-sheet glass-surface" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="leader-title" onClick={(event) => event.stopPropagation()}>
        <span className="sheet-grabber" />
        <div className="leader-head">
          <div><span className="eyebrow">SAVES × NOTES / WEEKLY</span><h2 id="leader-title">回声热榜</h2></div>
          <button className="sheet-close" aria-label="关闭回声榜" onClick={onClose}>×</button>
        </div>
        <p className="leader-subtitle">收藏是回声，留言让它继续往前走。</p>
        <div className="leader-list">
          {ranked.map((bubble, index) => (
            <div className={`leader-row rank-${index + 1}`} key={bubble.id}>
              <span className="leader-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className={`leader-orb accent-${bubble.accent}`} />
              <div className="leader-copy"><strong>{bubble.title}</strong><small>{bubble.author} · {bubble.kind}</small><span className="leader-comment">“{bubble.comments[0]?.text || '还没有留言，来写下第一句。'}”</span></div>
              <span className="leader-saves"><span>{bubble.saves}<small>收藏</small></span><i /><span>{bubble.comments.length}<small>留言</small></span></span>
            </div>
          ))}
        </div>
        <button className="leader-roam" onClick={onRoam}>去听大家留下的声音 <span>↗</span></button>
      </section>
    </div>
  );
}

function RoamScreen({ selected, onSelect, captured, capturedBubble, capturePhase, onCapture, onListen, onResetCapture, playing, emitting, onPageChange, zoom, onZoom, arActive, onModeChange, onCloseCamera }) {
  const [commentBubble, setCommentBubble] = useState(null);
  return (
    <Scene className={`app-roam image-target-roam${captured ? ' capture-done' : ''}`} style={{ '--street-image': `url("${streetBackground}")` }}>
      <div className="screen-topline">
        <span className="place-chip ar-place-chip"><i /> 漫游</span>
        <DevicePill playing={playing} emitting={emitting} />
      </div>
      <div className="roam-world">
        <div className="ar-zoom-stage">
          <div className="floor-line floor-back" />
          <div className="floor-line floor-front" />
          <div className="distant-architecture" />
          <ARIllustrations />
        </div>
        <ImageTargetARStage
          sounds={SOUND_BUBBLES}
          zoom={zoom}
          onZoom={onZoom}
          onSelect={onSelect}
          onCapture={onCapture}
          onCloseCamera={onCloseCamera}
          onModeChange={onModeChange}
          capturedBubble={capturedBubble}
          capturePhase={capturePhase}
          playing={playing}
          onListen={onListen}
          onComments={setCommentBubble}
        />
      </div>
      {captured && capturedBubble && !arActive && (
        <div className="roam-card glass-surface result-card">
          <div className="result-heading"><span className="result-dot" />
            {capturePhase === 'travelling' ? '回声正沿着水光靠近' : capturePhase === 'absorbing' ? '泡泡正被右侧花园收下' : capturePhase === 'absorbed' ? '已收入个人回声' : playing ? '声音正在回响' : '这颗泡泡已抵达'}
          </div>
          <div className="result-track">
            <span className="result-postcard-art"><img src={soundPostcardCover} alt="" /></span>
            <span className="result-track-copy"><strong>「{capturedBubble.title}」</strong><small>{capturePhase === 'absorbed' ? '播放结束，泡泡已被花园吸收' : playing ? '播放结束后会沿右侧边缘收入花园' : '轻点泡泡，再听一次'}</small></span>
            <Waveform active={playing} small />
          </div>
          <div className="roam-result-actions"><span>{capturedBubble.author} · {capturedBubble.duration}</span>
            <button onClick={() => setCommentBubble(capturedBubble)}>查看留言 <i>♡ {capturedBubble.comments?.length || 0}</i></button>
            <button onClick={onResetCapture} disabled={capturePhase === 'travelling' || capturePhase === 'listening' || capturePhase === 'absorbing'}>继续寻找 <i>↗</i></button>
          </div>
          {!playing && capturePhase === 'absorbed' && <button className="roam-replay-action" onClick={() => onListen(capturedBubble)}>再听一次 <i>♫</i></button>}
        </div>
      )}
      <TabBar active="roam" onChange={onPageChange} />
      {commentBubble && arActive
        ? createPortal(<ARCommentsSheet bubble={commentBubble} onClose={() => setCommentBubble(null)} global />, document.body)
        : <ARCommentsSheet bubble={commentBubble} onClose={() => setCommentBubble(null)} />}
    </Scene>
  );
}

const RECORDING_FORMS = [
  { id: 'echo-orb', shape: 'orb', accent: 'blue', label: '露珠' },
  { id: 'echo-heart', shape: 'heart', accent: 'rose', label: '心泡' },
  { id: 'echo-star', shape: 'star', accent: 'gold', label: '星沫' },
  { id: 'echo-flower', shape: 'flower', accent: 'lilac', label: '花音' },
];

function CreateScreen({ prompt, onPrompt, recording, recordingSeconds, recordingEnergy, recordingForm, onRecordingForm, emitting, onRecord, recordingAudio, recordError, previewingRecording, onPreviewRecording, onPublish, published, onPageChange }) {
  const form = recordingForm || RECORDING_FORMS[0];
  const formIndex = Math.max(0, RECORDING_FORMS.findIndex(item => item.id === form.id));
  const previousForm = RECORDING_FORMS[(formIndex + RECORDING_FORMS.length - 1) % RECORDING_FORMS.length];
  const nextForm = RECORDING_FORMS[(formIndex + 1) % RECORDING_FORMS.length];
  const hasAudio = Boolean(recordingAudio);
  const seconds = Math.max(0, recordingSeconds | 0);
  const timeLabel = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const [squeezing, setSqueezing] = useState(false);
  const [leverPull, setLeverPull] = useState(0);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const leverDragRef = useRef(null);
  const suppressLeverClickRef = useRef(false);
  const suppressLeverClickTimerRef = useRef(null);
  const leverAudioRef = useRef(null);
  useEffect(() => () => {
    leverAudioRef.current?.close?.().catch?.(() => {});
    leverAudioRef.current = null;
  }, []);
  const cycleRecordingForm = () => onRecordingForm(RECORDING_FORMS[(formIndex + 1) % RECORDING_FORMS.length]);
  const playLeverFeedback = (isStopping = false, isCarousel = false) => {
    if (!feedbackEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const context = leverAudioRef.current || (leverAudioRef.current = new AudioContextClass());
        if (context.state === 'suspended') context.resume();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(isCarousel ? 420 : isStopping ? 142 : 205, now);
        oscillator.frequency.exponentialRampToValueAtTime(isCarousel ? 310 : 92, now + (isCarousel ? .075 : .13));
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(isCarousel ? .018 : .045, now + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + (isCarousel ? .085 : .15));
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + (isCarousel ? .09 : .16));
      }
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(isCarousel ? 8 : isStopping ? [12, 24, 10] : 16);
    } catch {}
  };
  const turnForm = (direction) => {
    onRecordingForm(RECORDING_FORMS[(formIndex + direction + RECORDING_FORMS.length) % RECORDING_FORMS.length]);
    playLeverFeedback(false, true);
  };
  const startLeverPull = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    suppressLeverClickRef.current = false;
    window.clearTimeout(suppressLeverClickTimerRef.current);
    suppressLeverClickTimerRef.current = null;
    leverDragRef.current = { y: event.clientY, pulled: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveLeverPull = (event) => {
    if (!leverDragRef.current) return;
    const pull = Math.max(0, Math.min(1, (event.clientY - leverDragRef.current.y) / 62));
    leverDragRef.current.pulled = pull >= .56;
    setLeverPull(pull);
  };
  const releaseLeverPull = () => {
    if (!leverDragRef.current) return;
    const pulled = leverDragRef.current.pulled;
    leverDragRef.current = null;
    setLeverPull(0);
    if (pulled) {
      suppressLeverClickRef.current = true;
      window.clearTimeout(suppressLeverClickTimerRef.current);
      suppressLeverClickTimerRef.current = window.setTimeout(() => {
        suppressLeverClickRef.current = false;
        suppressLeverClickTimerRef.current = null;
      }, 220);
      triggerRecordAction();
    }
  };
  const triggerRecordAction = () => {
    playLeverFeedback(recording);
    onRecord();
  };
  const activateLever = (event) => {
    if (suppressLeverClickRef.current && event.detail !== 0) {
      suppressLeverClickRef.current = false;
      window.clearTimeout(suppressLeverClickTimerRef.current);
      suppressLeverClickTimerRef.current = null;
      return;
    }
    triggerRecordAction();
  };
  const pressRecordingBubble = (event) => {
    if (!recording) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSqueezing(true);
  };
  const releaseRecordingBubble = () => setSqueezing(false);
  useEffect(() => { if (!recording) setSqueezing(false); }, [recording]);
  return (
    <Scene className="app-create" style={{ '--create-image': `url("${createBackground}")` }}>
      <div className="screen-topline">
        <span className="place-chip"><i /> 江湾 · 01</span>
        <DevicePill playing={false} emitting={emitting} />
      </div>
      <div className="create-content">
        <div className="create-heading">
          <div className="create-title-copy">
            <span className="eyebrow">一段声音 · 一颗泡泡</span>
            <h1>留一句</h1>
          </div>
          <span className="create-rec"><i /> {recording ? '正在录音' : hasAudio ? '已录好' : '声音备忘'}</span>
        </div>
        <div className={`create-orbit${recording ? ' is-recording' : ''}`} style={{ '--record-energy': recordingEnergy }}>
          <span className="create-aura" />
          <span className="record-shape-wave" aria-hidden="true" />
          <span className="record-form-orbit" style={{ '--carousel-turn': `${formIndex * 90}deg` }} aria-hidden="true" />
          <img className="create-sticker sticker-star-mint" src={stickerStarMint} alt="" aria-hidden="true" />
          <img className="create-sticker sticker-star-blue" src={stickerStarBlue} alt="" aria-hidden="true" />
          <Bubble key={form.id} size={128} className={`record-bubble accent-${form.accent}${recording ? ' recording' : ''}${squeezing ? ' is-squeezed' : ''}`} label={recording ? `正在录音，${form.label}泡泡随声音起伏；按住挤压，松开回弹` : `当前是${form.label}泡泡；轻点切换`} onClick={recording ? undefined : cycleRecordingForm} onPointerDown={pressRecordingBubble} onPointerUp={releaseRecordingBubble} onPointerCancel={releaseRecordingBubble} style={{ '--record-energy': recordingEnergy }} bubble={form} />
          <Bubble size={38} className={`record-form-side previous accent-${previousForm.accent}`} label={`切换到${previousForm.label}`} onClick={() => turnForm(-1)} bubble={previousForm} />
          <Bubble size={38} className={`record-form-side next accent-${nextForm.accent}`} label={`切换到${nextForm.label}`} onClick={() => turnForm(1)} bubble={nextForm} />
          <Bubble size={17} className="create-satellite sat-c" />
          <span className={`create-bubble-caption${recording ? ' is-recording' : ''}`} aria-live="polite">{recording ? (squeezing ? '泡泡正在回弹' : '声音正在让泡泡呼吸') : `轻点两侧换形 · ${form.label}`}</span>
        </div>

        <span className="create-record-link" aria-hidden="true"><i /></span>
        <div className={`record-panel glass-surface${recording ? ' is-recording' : ''}`}>
          <div className="record-panel-head">
            <span className="record-prompt">{prompt === 'next' ? '说一句，留给下一个路过的人' : '说一句，此刻的你和这里'}</span>
            <button className={`feedback-toggle${feedbackEnabled ? ' is-on' : ''}`} type="button" aria-pressed={feedbackEnabled} aria-label={`声音与触感反馈${feedbackEnabled ? '已开启' : '已关闭'}`} onClick={() => setFeedbackEnabled(value => !value)}><span>声 · 触</span><i /></button>
          </div>
          <div className="prompt-switch glass-surface">
            <button className={prompt === 'next' ? 'chosen' : ''} onClick={() => onPrompt('next')}>给下一位</button>
            <button className={prompt === 'here' ? 'chosen' : ''} onClick={() => onPrompt('here')}>留在此刻</button>
          </div>
          <span className={`transcript${hasAudio || recording ? '' : ' placeholder'}`} aria-live="polite">{recordError || (recording ? '正在录下你此刻的声音' : hasAudio ? '声音已收下，可以试听' : published ? '声音已留在这里' : '轻轻说下此刻的想法')}</span>
          <div className="record-row">
            <button className={`lever-control${recording ? ' recording' : ''}${leverPull > .15 ? ' is-pulling' : ''}`} type="button" style={{ '--lever-shift': `${leverPull * 30}px`, '--lever-tilt': `${leverPull * 18}deg` }} aria-label={recording ? '下拉拉杆停止录音' : '下拉拉杆开始录音'} onPointerDown={startLeverPull} onPointerMove={moveLeverPull} onPointerUp={releaseLeverPull} onPointerCancel={() => { leverDragRef.current = null; setLeverPull(0); }} onClick={activateLever}>
              <span className="lever-track" aria-hidden="true" /><span className="lever-rod" aria-hidden="true" /><span className="lever-handle" aria-hidden="true" /><span className="lever-label">{recording ? '下拉停止' : '下拉开始'}</span>
            </button>
            <Waveform active={recording || previewingRecording} />
            <div className="record-time-group">
              <span className="record-time">{timeLabel}</span>
              {hasAudio && !recording && <button className="record-preview" type="button" onClick={onPreviewRecording}>{previewingRecording ? '暂停' : '试听'}</button>}
            </div>
          </div>
          <small className="record-storage-note">录音仅保留在本次演示中</small>
        </div>
        <GlassButton className="publish-button" onClick={recording ? triggerRecordAction : hasAudio ? onPublish : triggerRecordAction}>{recording ? '完成录音' : published ? '已留在这里' : hasAudio ? '留下这段声音' : '轻触也能开始留声'} <span className="arrow-out">↗</span></GlassButton>
      </div>
      <TabBar active="create" onChange={onPageChange} />
    </Scene>
  );
}

function AudiencePreview({ page, selected, captured, capturedBubble, playing, emitting, recording, recordingEnergy, recordingForm, published, bubbles, roamPhase }) {
  return (
    <section className="audience-window">
      <div className="audience-chrome">
        <span className="chrome-lights"><i /><i /><i /></span>
        <span className="audience-title">空间回声</span>
      </div>
      <Scene className={`projection-scene projection-${page}`} style={page === 'roam' ? { '--street-image': `url("${landscapeStreetBackground}")` } : page === 'create' ? { '--create-image': `url("${createBackground}")` } : undefined}>
        <div className="projection-location"><i /> {page === 'home' ? '我的回声' : '江湾 · 01'} <span>{page === 'home' ? '个人图鉴' : '空间回声'}</span></div>
        {page === 'roam' ? (
          <>
            <ARIllustrations />
            {roamPhase !== 'ready' && <div className={`projection-ar-status phase-${roamPhase}`}><i />{roamPhase === 'scan' ? '正在扫描空间' : '正在整理取景画面'}</div>}
            <div className="projection-floor floor-two">02 <span>二层</span></div>
            <div className="projection-floor floor-one">01 <span>一层</span></div>
            <Bubble size={170} className={`projection-target${captured ? ' target-captured' : ''}`} label="大屏上的目标泡泡" />
            <Bubble size={65} className="projection-bubble pb-one" />
            <Bubble size={40} className="projection-bubble pb-two" />
            <div className="projection-cross"><i /><b /></div>
            <div className="projection-caption"><span>{captured ? '声音落进了泡泡里' : '全场选中的声音'}</span><strong>{captured ? capturedBubble?.title || '正在设备中播放' : (SOUND_BUBBLES[selected - 1] || SOUND_BUBBLES[0]).title}</strong></div>
            {captured && <div className="projection-playback"><Waveform active={playing} /><span>{capturedBubble?.title || '声音已捕捉'}</span><div className="real-bubbles"><i /><i /><i /></div></div>}
          </>
        ) : page === 'create' ? (
          <>
            <div className={`projection-create-cluster${recording ? ' is-recording' : ''}`} style={{ '--record-energy': recordingEnergy }}><span className="projection-record-wave" /><Bubble size={135} className={`projection-record-bubble accent-${recordingForm.accent}${recording ? ' recording' : ''}${published ? ' published-bubble' : ''}`} style={{ '--record-energy': recordingEnergy }} bubble={recordingForm} /><Bubble size={53} /><Bubble size={31} /></div>
            <div className="projection-caption"><span>{recording ? '声音正在呼吸' : published ? '声音已经留下' : '一段新声音，正在诞生'}</span><strong>{published ? '声音泡泡已浮现' : '一句话 · 一个位置'}</strong></div>
          </>
        ) : (
          <>
            <div className="projection-issue"><span>MY SOUND GALLERY</span><b>VOL. 01</b><i>{String(bubbles.length).padStart(2, '0')} SOUNDS</i></div>
            <div className="projection-home-title">听见<br /><em>留下</em></div>
            <div className="projection-bubble-field">
              {bubbles.map((bubble, index) => {
                const coordinates = [[48, 51], [14, 24], [82, 24], [13, 51], [85, 53], [17, 79], [48, 81], [83, 79], [30, 35], [68, 35], [31, 67], [67, 68]];
                const point = coordinates[index % coordinates.length];
                const featured = index === 0;
                const size = featured ? 164 : Math.max(58, Math.min(118, bubble.size * 0.76));
                return (
                  <div className={`projection-home-orb${featured ? ' is-featured' : ''}${bubble.saves >= 50 || bubble.comments.length >= 2 ? ' is-resonant' : ''}`} key={bubble.id} style={{ left: `${point[0]}%`, top: `${point[1]}%`, '--bubble-size': `${size}px`, '--float-delay': `${(index % 7) * -0.6}s` }}>
                    {featured ? (
                      <OrbitTagTrack bubble={bubble} size={size}>
                        <Bubble size={size} bubble={bubble} className={`accent-${bubble.accent}`} label={bubble.title} />
                      </OrbitTagTrack>
                    ) : <Bubble size={size} bubble={bubble} className={`accent-${bubble.accent}`} label={bubble.title} />}
                    <span>{featured ? '' : bubble.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="projection-home-note">轻轻戳开一颗 · 听见留下的声音</div>
          </>
        )}
      </Scene>
    </section>
  );
}

function App() {
  const [page, setPage] = useState(() => ['home', 'roam', 'create'].includes(initialScreen) ? initialScreen : 'landing');
  const [motionPreview, setMotionPreview] = useState(initialPreview === 'motion');
  const phoneColumnRef = useRef(null);
  const previousPageRef = useRef(page);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 701px)');
    const update = () => setShowAudiencePreview(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useLayoutEffect(() => {
    const column = phoneColumnRef.current;
    const scene = column?.querySelector('.scene');
    if (!scene) return undefined;
    const previousPage = previousPageRef.current;
    previousPageRef.current = page;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (previousPage === page) return undefined;
    const order = { home: 0, roam: 1, create: 2 };
    const direction = (order[page] ?? 0) >= (order[previousPage] ?? 0) ? 1 : -1;
    const context = gsap.context(() => {
      gsap.fromTo(scene,
        { autoAlpha: 0, x: direction * 10, y: 5, scale: 0.992, filter: 'blur(2px)' },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out', clearProps: 'transform,filter,opacity,visibility' },
      );
    }, column);
    return () => context.revert();
  }, [page]);
  const [roamPhase, setRoamPhase] = useState('ready');
  const [roamProgress, setRoamProgress] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [deviceEmitting, setDeviceEmitting] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [capturedBubble, setCapturedBubble] = useState(null);
  const [capturePhase, setCapturePhase] = useState('idle');
  const [selected, setSelected] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [arActive, setArActive] = useState(false);
  const [showAudiencePreview, setShowAudiencePreview] = useState(() => window.matchMedia('(min-width: 701px)').matches);
  const [prompt, setPrompt] = useState('next');
  const [recordingForm, setRecordingForm] = useState(RECORDING_FORMS[0]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingEnergy, setRecordingEnergy] = useState(0.18);
  const [recordingAudio, setRecordingAudio] = useState(null);
  const [recordError, setRecordError] = useState('');
  const [previewingRecording, setPreviewingRecording] = useState(false);
  const [published, setPublished] = useState(false);
  const [createdBubble, setCreatedBubble] = useState(null);
  const [poppedId, setPoppedId] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const popTimer = useRef(null);
  const playbackTimer = useRef(null);
  const playbackFallback = useRef(null);
  const playbackToken = useRef(0);
  const deviceEmissionTimer = useRef(null);
  const captureTimer = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraRequestId = useRef(0);
  const locationWatchId = useRef(null);
  const locationRequestId = useRef(0);
  const locationTimeout = useRef(null);
  const locationPositionRef = useRef(null);
  const roamStartedAt = useRef(0);
  const recordingStartedAt = useRef(0);
  const recordingStartGuardRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const analyserDataRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recordingUrlsRef = useRef(new Set());
  const bubbles = createdBubble ? [createdBubble, ...SOUND_BUBBLES] : SOUND_BUBBLES;

  const closeCamera = () => {
    cameraRequestId.current += 1;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraStream(null);
    setCameraStatus('idle');
  };

  const clearLocationWatch = () => {
    window.clearTimeout(locationTimeout.current);
    locationTimeout.current = null;
    if (locationWatchId.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
  };

  const stopLocation = () => {
    locationRequestId.current += 1;
    clearLocationWatch();
    locationPositionRef.current = null;
    setLocationStatus('idle');
    setLocationAccuracy(null);
  };

  const requestLocation = () => {
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    clearLocationWatch();
    const requestId = ++locationRequestId.current;
    locationPositionRef.current = null;
    setLocationStatus('requesting');
    setLocationAccuracy(null);
    try {
      locationWatchId.current = navigator.geolocation.watchPosition((position) => {
        if (requestId !== locationRequestId.current) return;
        const { latitude, longitude, accuracy } = position.coords;
        const roundedAccuracy = Math.max(1, Math.round(accuracy));
        locationPositionRef.current = { latitude, longitude, accuracy: roundedAccuracy };
        setLocationAccuracy(roundedAccuracy);
        setLocationStatus(accuracy <= 60 ? 'active' : 'weak');
        if (accuracy <= 60) clearLocationWatch();
      }, (error) => {
        if (requestId !== locationRequestId.current) return;
        clearLocationWatch();
        if (error.code === 1) setLocationStatus('denied');
        else if (locationPositionRef.current) setLocationStatus('weak');
        else setLocationStatus('unavailable');
      }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 14000 });
      locationTimeout.current = window.setTimeout(() => {
        if (requestId !== locationRequestId.current) return;
        clearLocationWatch();
        setLocationStatus((status) => status === 'requesting' ? 'unavailable' : status);
      }, 15000);
    } catch {
      clearLocationWatch();
      setLocationStatus('unavailable');
    }
  };

  const openCamera = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable');
      return;
    }
    const requestId = ++cameraRequestId.current;
    setCameraStatus('requesting');
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      } catch (firstError) {
        if (firstError?.name === 'NotAllowedError' || firstError?.name === 'SecurityError' || firstError?.name === 'NotFoundError') throw firstError;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      if (requestId !== cameraRequestId.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraStatus('active');
    } catch (error) {
      if (requestId !== cameraRequestId.current) return;
      setCameraStatus(error?.name === 'NotAllowedError' || error?.name === 'SecurityError' ? 'denied' : 'unavailable');
    }
  };

  useEffect(() => () => {
    cameraRequestId.current += 1;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current?.stop?.();
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioPlayerRef.current?.pause?.();
    audioContextRef.current?.close?.().catch?.(() => {});
    recordingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    window.clearTimeout(captureTimer.current);
    locationRequestId.current += 1;
    window.clearTimeout(locationTimeout.current);
    if (locationWatchId.current !== null) navigator.geolocation?.clearWatch(locationWatchId.current);
  }, []);

  const requestPageChange = (nextPage) => {
    if (nextPage === page) return;
    if (recording) finishRecording();
    if (nextPage === 'roam') {
      if (page !== 'roam') {
        setPage('roam');
        setRoamProgress(1);
        setRoamPhase('ready');
      }
      return;
    }
    closeCamera();
    stopLocation();
    setPage(nextPage);
    setRoamPhase('ready');
    setRoamProgress(0);
  };

  const startBubblePlayback = (bubble) => {
    const token = ++playbackToken.current;
    window.clearTimeout(playbackTimer.current);
    window.clearTimeout(playbackFallback.current);
    audioPlayerRef.current?.pause?.();
    audioPlayerRef.current = null;
    setPreviewingRecording(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlaying(true);
    if (bubble.audioUrl) {
      const player = new Audio(bubble.audioUrl);
      audioPlayerRef.current = player;
      player.onended = () => {
        if (token !== playbackToken.current) return;
        audioPlayerRef.current = null;
        setPlaying(false);
      };
      player.onerror = () => {
        if (token !== playbackToken.current) return;
        audioPlayerRef.current = null;
        setPlaying(false);
      };
      player.play().catch(() => {
        if (token !== playbackToken.current) return;
        audioPlayerRef.current = null;
        setPlaying(false);
      });
      return;
    }
    const minDuration = Math.max(2200, bubble.quote.length * 130);
    const startedAt = Date.now();
    const finish = () => {
      if (token !== playbackToken.current) return;
      window.clearTimeout(playbackFallback.current);
      const remaining = Math.max(0, minDuration - (Date.now() - startedAt));
      playbackTimer.current = window.setTimeout(() => setPlaying(false), remaining);
    };
    if (!('speechSynthesis' in window)) {
      playbackTimer.current = window.setTimeout(() => setPlaying(false), minDuration);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(bubble.quote);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.86;
    utterance.pitch = 1.02;
    utterance.volume = 0.9;
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith('zh'));
    if (voice) utterance.voice = voice;
    utterance.onend = finish;
    utterance.onerror = finish;
    playbackFallback.current = window.setTimeout(() => setPlaying(false), minDuration + 9000);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (captured && capturePhase === 'listening' && !playing) setCapturePhase('absorbing');
  }, [captured, capturePhase, playing]);

  useEffect(() => {
    if (!captured || capturePhase !== 'absorbing') return undefined;
    const timer = window.setTimeout(() => setCapturePhase('absorbed'), 920);
    return () => window.clearTimeout(timer);
  }, [captured, capturePhase]);

  const triggerDeviceEmission = (duration = 10000) => {
    setDeviceEmitting(true);
    window.clearTimeout(deviceEmissionTimer.current);
    deviceEmissionTimer.current = window.setTimeout(() => setDeviceEmitting(false), duration);
  };

  const popBubble = (bubble) => {
    setPoppedId(bubble.id);
    startBubblePlayback(bubble);
    triggerDeviceEmission();
    window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => setPoppedId(null), 1650);
  };

  const releaseRecordingInputs = () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
    analyserRef.current = null;
    analyserDataRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
  };

  const finishRecording = () => {
    const recorder = mediaRecorderRef.current;
    const elapsed = Math.min(30, Math.max(0, (performance.now() - recordingStartedAt.current) / 1000));
    setRecordingSeconds(Math.floor(elapsed));
    setRecording(false);
    setRecordingEnergy(0.22);
    if (recorder && recorder.state === 'recording') recorder.stop();
    else releaseRecordingInputs();
  };

  const stopRecordingPreview = () => {
    audioPlayerRef.current?.pause?.();
    audioPlayerRef.current = null;
    setPreviewingRecording(false);
  };

  const previewRecording = () => {
    if (previewingRecording) {
      stopRecordingPreview();
      return;
    }
    if (!recordingAudio?.url) return;
    const player = new Audio(recordingAudio.url);
    audioPlayerRef.current = player;
    player.onended = stopRecordingPreview;
    player.onerror = stopRecordingPreview;
    setPreviewingRecording(true);
    player.play().catch(stopRecordingPreview);
  };

  const toggleRecording = async () => {
    if (recording) {
      finishRecording();
      return;
    }
    if (recordingStartGuardRef.current) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setRecordError('请在安全连接下打开麦克风。');
      return;
    }
    if (typeof window.MediaRecorder !== 'function') {
      setRecordError('当前浏览器暂不支持录音。');
      return;
    }
    recordingStartGuardRef.current = true;
    setRecordError('');
    setPublished(false);
    setRecordingSeconds(0);
    setRecordingEnergy(0.2);
    stopRecordingPreview();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      recordingChunksRef.current = [];
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = supportedTypes.find((type) => window.MediaRecorder.isTypeSupported?.(type));
      const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          const analyser = context.createAnalyser();
          analyser.fftSize = 512;
          context.createMediaStreamSource(stream).connect(analyser);
          audioContextRef.current = context;
          analyserRef.current = analyser;
          analyserDataRef.current = new Uint8Array(analyser.fftSize);
        }
      } catch {
        analyserRef.current = null;
      }
      recorder.ondataavailable = (event) => {
        if (event.data?.size) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const duration = Math.max(1, Math.min(30, Math.round((performance.now() - recordingStartedAt.current) / 1000)));
        if (blob.size) {
          const url = URL.createObjectURL(blob);
          recordingUrlsRef.current.add(url);
          setRecordingAudio({ url, duration, type: blob.type });
          setRecordingSeconds(duration);
        } else {
          setRecordError('没有录到声音，再试一次吧。');
        }
        releaseRecordingInputs();
        mediaRecorderRef.current = null;
        recordingChunksRef.current = [];
      };
      recorder.onerror = () => {
        setRecordError('录音中断了，请再试一次。');
        setRecording(false);
        releaseRecordingInputs();
        mediaRecorderRef.current = null;
      };
      recordingStartedAt.current = performance.now();
      recorder.start(250);
      setRecording(true);
    } catch (error) {
      releaseRecordingInputs();
      mediaRecorderRef.current = null;
      const message = error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? '允许使用麦克风，才能录下这段声音。'
        : error?.name === 'NotFoundError'
          ? '没有找到可用的麦克风。'
          : '无法开始录音，请再试一次。';
      setRecordError(message);
    } finally {
      recordingStartGuardRef.current = false;
    }
  };

  useEffect(() => {
    if (!recording) return undefined;
    const interval = window.setInterval(() => {
      const elapsed = (performance.now() - recordingStartedAt.current) / 1000;
      const seconds = Math.min(30, Math.floor(elapsed));
      let breath;
      if (analyserRef.current && analyserDataRef.current) {
        analyserRef.current.getByteTimeDomainData(analyserDataRef.current);
        let sum = 0;
        analyserDataRef.current.forEach((sample) => { const wave = (sample - 128) / 128; sum += wave * wave; });
        breath = Math.min(0.96, Math.max(0.12, Math.sqrt(sum / analyserDataRef.current.length) * 3.4));
      } else {
        breath = 0.16 + Math.abs(Math.sin(elapsed * 4.9)) * 0.58 + Math.abs(Math.sin(elapsed * 1.7 + 0.9)) * 0.18;
      }
      setRecordingSeconds(seconds);
      setRecordingEnergy(Math.min(0.96, breath));
      if (elapsed >= 30) finishRecording();
    }, 90);
    return () => window.clearInterval(interval);
  }, [recording]);

  const beginCapture = (bubble) => {
    const sound = bubble || SOUND_BUBBLES[selected - 1] || SOUND_BUBBLES[0];
    setCaptured(true);
    setCapturedBubble(sound);
    setCapturePhase('travelling');
    triggerDeviceEmission(18000);
    window.clearTimeout(captureTimer.current);
    captureTimer.current = window.setTimeout(() => setCapturePhase('arrived'), 1180);
  };

  const listenCapturedBubble = (bubble = capturedBubble) => {
    if (!bubble) return;
    if (captured && bubble.id === capturedBubble?.id) setCapturePhase('listening');
    startBubblePlayback(bubble);
  };

  const resetCapture = () => {
    window.clearTimeout(captureTimer.current);
    setCaptured(false);
    setCapturedBubble(null);
    setCapturePhase('idle');
  };

  const publishBubble = () => {
    if (!recordingAudio) return;
    const bubble = {
      id: `my-echo-${Date.now()}`,
      title: prompt === 'next' ? '给下一位的声音' : '留给此刻的声音',
      quote: prompt === 'next' ? '一段留给下一位路过者的声音。' : '一段留给此刻自己的声音。',
      audioUrl: recordingAudio.url,
      author: '你',
      duration: `${recordingAudio.duration} 秒`,
      saves: 1,
      listens: 1,
      distance: 0,
      size: 118,
      accent: recordingForm.accent,
      shape: recordingForm.shape,
      kind: '人声',
      kindKey: 'voice',
      age: 0,
      comments: [],
    };
    setCreatedBubble(bubble);
    setPublished(true);
    setPage('home');
    setDeviceOpen(true);
    triggerDeviceEmission(24000);
    startBubblePlayback(bubble);
  };
  const enterApp = (screen = 'home') => {
    const nextScreen = ['home', 'roam', 'create'].includes(screen) ? screen : 'home';
    window.history.replaceState({}, '', `${window.location.pathname}?screen=${nextScreen}`);
    setMotionPreview(false);
    setPage(nextScreen);
  };
  const openMotionLab = () => {
    window.history.replaceState({}, '', `${window.location.pathname}?preview=motion`);
    setMotionPreview(true);
  };
  const closeMotionLab = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setMotionPreview(false);
    setPage('landing');
  };

  if (motionPreview) {
    return <Suspense fallback={<main className="motion-lab-loading" role="status">动效预览载入中</main>}><MotionLab onExit={closeMotionLab} /></Suspense>;
  }
  if (page === 'landing') {
    return <LandingPage onEnter={enterApp} onOpenMotionLab={openMotionLab} />;
  }

  return (
    <main className="demo-canvas">
      <div className="ambient ambient-left" /><div className="ambient ambient-right" />
      <header className="demo-header"><span className="wordmark">MEMO Garden</span></header>
      <div className="demo-stage">
        {showAudiencePreview && <AudiencePreview page={page} selected={selected} captured={captured} capturedBubble={capturedBubble} playing={playing} emitting={deviceEmitting} recording={recording} recordingEnergy={recordingEnergy} recordingForm={recordingForm} published={published} bubbles={bubbles} roamPhase={roamPhase} />}
        <div className="phone-column" ref={phoneColumnRef}>
          <Phone width={398} frame="android" island={false} status={false} time="20:31" className="demo-phone" wallpaper="linear-gradient(180deg, #eff6fc, #cbdff1 48%, #eaf1f5)">
          {page === 'home' && <HomeScreen bubbles={bubbles} playing={playing} emitting={deviceEmitting} onPageChange={requestPageChange} poppedId={poppedId} onBubblePop={popBubble} onOpenLeaderboard={() => setLeaderboardOpen(true)} />}
          {page === 'roam' && <RoamScreen selected={selected} onSelect={(index) => { setSelected(index); }} arActive={arActive} onModeChange={setArActive} captured={captured} capturedBubble={capturedBubble} capturePhase={capturePhase} onCapture={beginCapture} onListen={listenCapturedBubble} onResetCapture={resetCapture} playing={playing} emitting={deviceEmitting} onPageChange={requestPageChange} zoom={zoom} onZoom={value => setZoom(Math.max(.72, Math.min(2.2, value)))} onCloseCamera={closeCamera} />}
          {page === 'create' && <CreateScreen prompt={prompt} onPrompt={setPrompt} recording={recording} recordingSeconds={recordingSeconds} recordingEnergy={recordingEnergy} recordingForm={recordingForm} onRecordingForm={setRecordingForm} emitting={deviceEmitting} onRecord={toggleRecording} recordingAudio={recordingAudio} recordError={recordError} previewingRecording={previewingRecording} onPreviewRecording={previewRecording} onPublish={publishBubble} published={published} onPageChange={requestPageChange} />}
          </Phone>
        </div>
      </div>
      <div className="stage-floor" />
      <button className={`device-launcher${deviceOpen ? ' is-open' : ''}`} onClick={() => setDeviceOpen((open) => !open)} aria-expanded={deviceOpen} aria-label={deviceOpen ? '收起 Memo Catcher' : '查看 Memo Catcher'}>
        <span className="device-launcher-orb"><i /><i /><i /></span>
        <span>{deviceOpen ? '收起 Memo Catcher' : '查看 Memo Catcher'}</span>
        <b>{deviceOpen ? '−' : '↗'}</b>
      </button>
      {deviceOpen && <Suspense fallback={<div className="device-viewer device-viewer-loading glass-surface" role="status">装置载入中…</div>}><DeviceViewer open onClose={() => setDeviceOpen(false)} playing={playing || deviceEmitting} /></Suspense>}
      <LeaderboardSheet open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} onRoam={() => { setLeaderboardOpen(false); requestPageChange('roam'); }} bubbles={bubbles} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
