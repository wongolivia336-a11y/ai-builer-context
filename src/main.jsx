import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
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

const initialScreen = new URLSearchParams(location.search).get('screen');

function Bubble({ size, className = '', label, onClick, style = {} }) {
  return (
    <button
      className={`soap-bubble ${className}`}
      style={{ '--bubble-size': `${size}px`, ...style }}
      aria-label={label || '声音泡泡'}
      onClick={onClick}
    >
      <span className="bubble-core" />
      <span className="bubble-glint" />
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
  return (
    <nav className="tab-glass" aria-label="主导航">
      {tabs.map(([id, label]) => (
        <button key={id} className={`tab-item${active === id ? ' active' : ''}`} onClick={() => onChange(id)}>
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
      <span>{playing ? '声音正在流动' : emitting ? '泡泡正在舒展 · SIM' : 'EchoCaster · DEMO'}</span>
    </div>
  );
}

const SOUND_BUBBLES = [
  { id: 'wind', title: '河面上的风', quote: '风从河面来，像一句没说完的话。', author: '林', duration: '12 秒', saves: 86, listens: 214, distance: 8, size: 138, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 5, comments: [{ author: '阿岚', text: '听完想多走一站。' }, { author: '木木', text: '像小时候傍晚的风。' }] },
  { id: 'bell', title: '巷口的钟声', quote: '你听，巷子尽头的钟声又响了。', author: '阿岚', duration: '8 秒', saves: 54, listens: 172, distance: 18, size: 106, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 3, comments: [{ author: '小满', text: '这个回声好像从老房子里来。' }] },
  { id: 'steps', title: '刚经过的人', quote: '有人刚刚从这里走过。', author: '匿名漫游者', duration: '6 秒', saves: 31, listens: 98, distance: 23, size: 94, accent: 'rose', kind: '人声', kindKey: 'voice', age: 1, comments: [{ author: '林', text: '谢谢你把这一刻留下。' }] },
  { id: 'osmanthus', title: '桂花茶的下午', quote: '这家店的桂花茶，下午最香。', author: '小满', duration: '10 秒', saves: 22, listens: 61, distance: 31, size: 116, accent: 'lilac', kind: '碎念', kindKey: 'thought', age: 2, comments: [{ author: '匿名漫游者', text: '我也记得这个味道。' }] },
  { id: 'rain', title: '雨停以后', quote: '雨停以后，石板路会闪一下。', author: '江边散步的人', duration: '9 秒', saves: 17, listens: 44, distance: 42, size: 86, accent: 'lilac', kind: '碎念', kindKey: 'thought', age: 0, comments: [{ author: '阿岚', text: '雨后的路总像刚醒过来。' }] },
  { id: 'market', title: '收摊前的灯', quote: '收摊前最后一盏灯亮着。', author: '路过的人', duration: '7 秒', saves: 28, listens: 73, distance: 15, size: 124, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 4, comments: [{ author: '小满', text: '听见塑料袋窸窣的声音了。' }] },
  { id: 'goodnight', title: '没说出口的晚安', quote: '今天很累的话，就早点回家吧。', author: '夜行者', duration: '8 秒', saves: 42, listens: 106, distance: 26, size: 100, accent: 'rose', kind: '人声', kindKey: 'voice', age: 6, comments: [{ author: '林', text: '刚好在需要的时候听见。' }, { author: '阿岚', text: '像有人轻轻拍了拍肩。' }] },
  { id: 'bicycle', title: '车铃经过', quote: '一声车铃，穿过树影。', author: '阿禾', duration: '5 秒', saves: 19, listens: 49, distance: 37, size: 90, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 7, comments: [{ author: '路过的人', text: '画面一下就出来了。' }] },
  { id: 'smallwish', title: '给明天的小愿望', quote: '希望明天的自己轻松一点。', author: '匿名漫游者', duration: '6 秒', saves: 35, listens: 91, distance: 12, size: 108, accent: 'rose', kind: '人声', kindKey: 'voice', age: 8, comments: [{ author: '小满', text: '愿望已经收到。' }] },
  { id: 'soda', title: '窗边的汽水', quote: '汽水打开的时候，天刚刚暗下来。', author: '栗子', duration: '7 秒', saves: 25, listens: 62, distance: 28, size: 78, accent: 'gold', kind: '碎念', kindKey: 'thought', age: 9, comments: [{ author: '小满', text: '听见气泡声了。' }] },
  { id: 'morning', title: '早班车经过', quote: '早班车带着风从桥上过去。', author: '阿禾', duration: '11 秒', saves: 47, listens: 131, distance: 34, size: 88, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 10, comments: [{ author: '林', text: '这一段像电影开场。' }, { author: '阿岚', text: '桥上的风真的很特别。' }] },
  { id: 'postcard', title: '给陌生人的明信片', quote: '如果你今天有点累，记得慢慢走。', author: '匿名漫游者', duration: '9 秒', saves: 39, listens: 104, distance: 19, size: 82, accent: 'lilac', kind: '人声', kindKey: 'voice', age: 11, comments: [{ author: '路过的人', text: '谢谢，这句我收下了。' }] },
];

const BUBBLE_FIELD_SEEDS = [
  [0.03, 0.23], [0.32, 0.11], [0.81, 0.18], [0.56, 0.31],
  [0.12, 0.43], [0.94, 0.39], [0.39, 0.52], [0.7, 0.63],
  [0.08, 0.76], [0.51, 0.87], [0.88, 0.8], [0.28, 0.93],
];

function HomeBubble({ bubble, index, popped, onPop, filtered, highlighted }) {
  const buttonRef = useRef(null);
  const [burst, setBurst] = useState(false);
  const isResonant = bubble.saves >= 50 || bubble.comments.length >= 2;

  const pop = (event) => {
    const button = buttonRef.current;
    if (!button || popped) return;
    const field = button.closest('.bubble-field');
    const particles = button.querySelectorAll('.pop-bit');
    const ring = button.querySelector('.pop-ripple');
    const flash = field?.querySelector('.bubble-pop-flash');
    const radius = Math.max(86, button.getBoundingClientRect().width * 1.18);
    setBurst(true);
    gsap.timeline()
      .to(button, { scaleX: 1.24, scaleY: 0.72, filter: 'brightness(1.5)', duration: 0.11, ease: 'power2.out' })
      .to(button, { scaleX: 0.78, scaleY: 1.28, duration: 0.1, ease: 'power3.in' })
      .to(button, { scale: 0.015, opacity: 0, filter: 'brightness(2.6) blur(4px)', duration: 0.2, ease: 'power2.in' });
    if (flash && field) {
      const rect = field.getBoundingClientRect();
      gsap.killTweensOf(flash);
      gsap.set(flash, { left: event.clientX - rect.left, top: event.clientY - rect.top });
      gsap.fromTo(flash, { scale: 0.1, opacity: 0.88 }, { scale: 9, opacity: 0, duration: 0.72, ease: 'power2.out' });
      gsap.fromTo(field, { x: -3, y: 1 }, { x: 0, y: 0, duration: 0.32, ease: 'elastic.out(1, 0.42)' });
    }
    if (ring) gsap.fromTo(ring, { scale: 0.2, opacity: 0.9 }, { scale: 2.65, opacity: 0, duration: 0.66, ease: 'power2.out' });
    if (particles.length) {
      gsap.fromTo(particles, { x: 0, y: 0, scale: 0.2, rotation: 0, opacity: 1 }, {
        x: (i) => Math.cos((i / particles.length) * Math.PI * 2 + index) * radius * (0.72 + (i % 3) * 0.2),
        y: (i) => Math.sin((i / particles.length) * Math.PI * 2 + index) * radius * (0.72 + (i % 2) * 0.25),
        scale: (i) => i % 3 === 0 ? 1.05 : 0.48,
        rotation: (i) => i % 2 ? 92 : -72,
        opacity: 0,
        duration: 0.78,
        stagger: 0.012,
        ease: 'power3.out',
      });
    }
    onPop(bubble, event);
    window.setTimeout(() => setBurst(false), 860);
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (popped || !button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const rebound = gsap.fromTo(button, { scale: 0.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.56, ease: 'elastic.out(1, 0.48)' });
    return () => rebound.kill();
  }, [popped]);

  return (
    <div className={`bubble-body kind-${bubble.kindKey}${filtered ? ' is-filtered' : ''}${highlighted ? ' is-highlighted' : ''}${isResonant ? ' is-resonant' : ''}${popped ? ' is-popped' : ''}`} data-id={bubble.id} data-kind={bubble.kindKey} data-seed={index} style={{ '--bubble-size': `${bubble.size}px`, '--bubble-accent': bubble.accent }}>
      <svg className="bubble-filter-lasso" viewBox="0 0 160 142" aria-hidden="true"><path d="M81 5C119 2 154 26 153 66S132 131 84 136 7 116 7 73 36 10 81 5Z" /></svg>
      <button
        ref={buttonRef}
        className={`soap-bubble home-bubble accent-${bubble.accent}${isResonant ? ' bubble-hot' : ''}`}
        aria-label={`戳开${bubble.kind}泡泡并回听：${bubble.title}`}
        title={`${bubble.kind} · ${bubble.title}`}
        onPointerDown={(event) => gsap.to(event.currentTarget, { scaleX: 0.91, scaleY: 1.07, duration: 0.1, ease: 'power2.out' })}
        onPointerUp={(event) => gsap.to(event.currentTarget, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.32)' })}
        onPointerCancel={(event) => gsap.to(event.currentTarget, { scale: 1, duration: 0.24, ease: 'power2.out' })}
        onClick={pop}
      >
        <span className="bubble-core" />
        <span className="bubble-glint" />
        <span className="bubble-rank-aura" />
        <span className="bubble-rank-mark">{isResonant ? `共鸣 ${bubble.saves}` : ''}</span>
        <span className="pop-ripple" />
        {burst && <span className="pop-burst" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} className="pop-bit" />)}</span>}
      </button>
      <span className="bubble-label"><strong>{bubble.title}</strong><small><i /> {bubble.kind} · {bubble.duration}</small></span>
    </div>
  );
}

function HomeScreen({ bubbles, playing, emitting, onPageChange, poppedId, onBubblePop, onOpenLeaderboard }) {
  const [kindFilter, setKindFilter] = useState('all');
  const fieldRef = useRef(null);
  const kinds = [
    ['all', '全部', '◌'],
    ['voice', '人声', '◉'],
    ['ambience', '环境声', '◌'],
    ['thought', '碎念', '✳'],
  ];

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
      const speed = 17 + (index % 5) * 5;
      element.style.transform = `translate3d(${x}px,${y}px,0)`;
      return { element, diameter, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, phase: index * 1.7 };
    });
    if (motionPreference.matches || bodies.length < 2) return undefined;
    let frame = 0;
    let last = performance.now();
    const resizeObserver = new ResizeObserver(() => {
      const next = field.getBoundingClientRect();
      bodies.forEach((body) => {
        body.x = Math.min(Math.max(0, body.x), Math.max(0, next.width - body.diameter));
        body.y = Math.min(Math.max(0, body.y), Math.max(0, next.height - body.diameter));
      });
    });
    resizeObserver.observe(field);
    const animate = (now) => {
      frame = window.requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      const width = field.clientWidth;
      const height = field.clientHeight;
      bodies.forEach((body) => {
        body.vx += Math.sin(now * 0.00019 + body.phase) * 0.08 * dt;
        body.vy += Math.cos(now * 0.00017 + body.phase) * 0.1 * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const edgeX = Math.max(0, width - body.diameter);
        const edgeY = Math.max(0, height - body.diameter);
        if (body.x < 0) { body.x = 0; body.vx = Math.abs(body.vx) * 0.88; }
        if (body.x > edgeX) { body.x = edgeX; body.vx = -Math.abs(body.vx) * 0.88; }
        if (body.y < 0) { body.y = 0; body.vy = Math.abs(body.vy) * 0.88; }
        if (body.y > edgeY) { body.y = edgeY; body.vy = -Math.abs(body.vy) * 0.88; }
      });
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
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
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
      bodies.forEach((body) => { body.element.style.transform = `translate3d(${body.x}px,${body.y}px,0)`; });
    };
    frame = window.requestAnimationFrame(animate);
    return () => { window.cancelAnimationFrame(frame); resizeObserver.disconnect(); };
  }, []);

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
        <div className="gallery-filter" role="tablist" aria-label="用泡泡聚焦不同声音类型">
          {kinds.map(([key, label, symbol]) => (
            <button key={key} data-kind={key} className={kindFilter === key ? 'selected' : ''} role="tab" aria-selected={kindFilter === key} onClick={() => setKindFilter(key)}><i>{symbol}</i><span>{label}</span></button>
          ))}
        </div>
        <div className={`bubble-field${kindFilter === 'all' ? '' : ` filter-${kindFilter}`}`} ref={fieldRef} aria-label="漂浮的个人声音泡泡">
          <span className="bubble-pop-flash" aria-hidden="true" />
          {bubbles.map((bubble, index) => (
            <HomeBubble key={bubble.id} bubble={bubble} index={index} popped={poppedId === bubble.id} onPop={onBubblePop} filtered={kindFilter !== 'all' && bubble.kindKey !== kindFilter} highlighted={kindFilter !== 'all' && bubble.kindKey === kindFilter} />
          ))}
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

function RoamScreen({ selected, onSelect, captured, onCapture, playing, emitting, onPageChange, zoom, onZoom }) {
  const targetSound = selected === 1 ? SOUND_BUBBLES[0] : SOUND_BUBBLES[1];
  return (
    <Scene className={`app-roam${captured ? ' capture-done' : ''}`} style={{ '--street-image': `url("${streetBackground}")` }}>
      <div className="screen-topline">
        <span className="place-chip ar-place-chip"><i /> 江湾 · 实景 AR</span>
        <DevicePill playing={playing} emitting={emitting} />
      </div>
      <div className="roam-world">
        <div className="roam-sort glass-surface">
          <button className={selected === 1 ? 'active' : ''} onClick={() => onSelect(1)}>视线内 <i>03</i></button>
          <button className={selected === 2 ? 'active' : ''} onClick={() => onSelect(2)}>共鸣榜 <i>01</i></button>
        </div>
        <div className="floor-line floor-back"><span>二层</span></div>
        <div className="floor-line floor-front"><span>一层</span></div>
        <div className="distant-architecture" />
        <Bubble size={82 * zoom} className={`target-bubble bubble-hot${selected === 1 ? ' target-selected' : ''}${captured ? ' target-captured' : ''}`} label="二层的声音泡泡" onClick={() => onSelect(1)} />
        <Bubble size={43} className={`target-bubble target-small${selected === 2 ? ' target-selected bubble-hot' : ''}`} label="巷口的钟声" onClick={() => onSelect(2)} />
        <Bubble size={27} className="target-bubble target-tiny" label="远处的小泡泡" onClick={() => onSelect(2)} />
        <div className="aim-ring"><i /><b /></div>
        <div className="target-caption"><span>{selected === 1 ? '二层回声' : '巷口的钟声'}</span><i>·</i><span>{targetSound.distance} m</span><b>{targetSound.saves} 收藏</b></div>
        <div className="zoom-control glass-surface">
          <button aria-label="放大" onClick={() => onZoom(1)}>+</button><span /><button aria-label="缩小" onClick={() => onZoom(-1)}>−</button>
        </div>
      </div>
      <div className={`roam-card glass-surface${captured ? ' result-card' : ''}`}>
        {captured ? (
          <>
            <div className="result-heading"><span className="result-dot" />{playing ? '声音正在设备中回响' : '已收进泡泡盒'}</div>
            <div className="result-track">
              <span className="result-postcard-art"><img src={soundPostcardCover} alt="" /></span>
              <span className="result-track-copy"><strong>「风从河面来」</strong><small>一段留在林间的回声</small></span>
              <Waveform active={playing} small />
            </div>
            <div className="real-bubbles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          </>
        ) : (
          <>
            <div className="roam-card-top"><span className="eyebrow">现场共选 · {targetSound.saves} 人收藏</span><span className="crowd-count"><i /><i /><i /> 04</span></div>
            <strong className="roam-quote">「{targetSound.quote}」</strong>
            <div className="roam-card-bottom"><span>{targetSound.author} 留在这里 · {targetSound.duration}</span><button className="capture-key" onClick={onCapture}><span className="key-core" />按实体键捕捉</button></div>
          </>
        )}
      </div>
      <TabBar active="roam" onChange={onPageChange} />
    </Scene>
  );
}

function CreateScreen({ prompt, onPrompt, recording, recordingSeconds, recordingEnergy, emitting, onRecord, transcript, onPublish, published, onPageChange }) {
  return (
    <Scene className="app-create" style={{ '--create-image': `url("${createBackground}")` }}>
      <div className="screen-topline">
        <span className="place-chip"><i /> 江湾 · 01</span>
        <DevicePill playing={false} emitting={emitting} />
      </div>
      <div className="create-content">
        <div className="create-heading">
          <div className="create-title-copy">
            <span className="eyebrow">FIELD RECORDING / 01</span>
            <h1>留一句</h1>
          </div>
          <span className="create-rec"><i /> {recording ? 'REC · SIM' : 'VOICE NOTE'}</span>
        </div>
        <div className={`create-orbit${recording ? ' is-recording' : ''}`} style={{ '--record-energy': recordingEnergy }}>
          <span className="create-aura" />
          <span className="record-shape-wave" aria-hidden="true" />
          <img className="create-sticker sticker-star-mint" src={stickerStarMint} alt="" aria-hidden="true" />
          <img className="create-sticker sticker-star-blue" src={stickerStarBlue} alt="" aria-hidden="true" />
          <Bubble size={114} className={`record-bubble${recording ? ' recording' : ''}`} label={recording ? '正在录制自己的声音，泡泡会随着声音呼吸' : '录音泡泡'} style={{ '--record-energy': recordingEnergy }} />
          <Bubble size={34} className="create-satellite sat-a" />
          <Bubble size={24} className="create-satellite sat-b" />
          <Bubble size={17} className="create-satellite sat-c" />
        </div>
        <div className="prompt-switch glass-surface">
          <button className={prompt === 'next' ? 'chosen' : ''} onClick={() => onPrompt('next')}>给下一位</button>
          <button className={prompt === 'here' ? 'chosen' : ''} onClick={() => onPrompt('here')}>留在此刻</button>
        </div>
        <div className={`record-panel glass-surface${recording ? ' is-recording' : ''}`}>
          <span className="record-prompt">{prompt === 'next' ? '说一句，留给下一个路过的人' : '说一句，此刻的你和这里'}</span>
          {transcript ? <span className="transcript">“{transcript}”</span> : <span className="transcript placeholder">{published ? '声音已留在江湾' : '一段话，刚刚好'}</span>}
          <div className="record-row">
            <button className={`record-button${recording ? ' recording' : ''}`} onClick={onRecord}><span className="record-button-inner" /></button>
            <Waveform active={recording || !!transcript} />
            <span className="record-time">00:{String(recordingSeconds).padStart(2, '0')}</span>
          </div>
        </div>
        <GlassButton className="publish-button" onClick={recording ? onRecord : transcript ? onPublish : onRecord}>{recording ? '完成录音' : published ? '已留在这里' : transcript ? '留下这句话' : '开始录音'} <span className="arrow-out">↗</span></GlassButton>
      </div>
      <TabBar active="create" onChange={onPageChange} />
    </Scene>
  );
}

function AudiencePreview({ page, selected, captured, playing, emitting, recording, recordingEnergy, published, bubbles }) {
  return (
    <section className="audience-window">
      <div className="audience-chrome">
        <span className="chrome-lights"><i /><i /><i /></span>
        <span className="audience-title">现场镜像</span>
        <span className="live-pill"><i /> LIVE</span>
      </div>
      <Scene className={`projection-scene projection-${page}`} style={page === 'roam' ? { '--street-image': `url("${landscapeStreetBackground}")` } : page === 'create' ? { '--create-image': `url("${createBackground}")` } : undefined}>
        <div className="projection-location"><i /> {page === 'home' ? '我的回声' : '江湾 · 01'} <span>{page === 'home' ? '个人图鉴' : '空间回声'}</span></div>
        {page === 'roam' ? (
          <>
            <div className="projection-floor floor-two">02 <span>二层</span></div>
            <div className="projection-floor floor-one">01 <span>一层</span></div>
            <Bubble size={170} className={`projection-target${captured ? ' target-captured' : ''}`} label="大屏上的目标泡泡" />
            <Bubble size={65} className="projection-bubble pb-one" />
            <Bubble size={40} className="projection-bubble pb-two" />
            <div className="projection-cross"><i /><b /></div>
            <div className="projection-caption"><span>{captured ? '声音落进了泡泡里' : '全场选中的声音'}</span><strong>{captured ? '正在设备中播放' : selected === 1 ? '二层 · 风的留言' : '远处 · 一声回响'}</strong></div>
            {captured && <div className="projection-playback"><Waveform active={playing} /><span>风从河面来</span><div className="real-bubbles"><i /><i /><i /></div></div>}
          </>
        ) : page === 'create' ? (
          <>
            <div className={`projection-create-cluster${recording ? ' is-recording' : ''}`} style={{ '--record-energy': recordingEnergy }}><span className="projection-record-wave" /><Bubble size={135} className={`projection-record-bubble${recording ? ' recording' : ''}${published ? ' published-bubble' : ''}`} style={{ '--record-energy': recordingEnergy }} /><Bubble size={53} /><Bubble size={31} /></div>
            <div className="projection-caption"><span>{recording ? '声音正在呼吸 · REC SIM' : published ? '声音已经留下' : '一段新声音，正在诞生'}</span><strong>{published ? 'EchoCaster 泡泡发射演示' : '一句话 · 一个位置'}</strong></div>
          </>
        ) : (
          <>
            <div className="projection-issue"><span>MY SOUND GALLERY</span><b>VOL. 01</b><i>{String(bubbles.length).padStart(2, '0')} SOUNDS</i></div>
            <div className="projection-home-title">听见<br /><em>留下</em></div>
            <div className="projection-bubble-field">
              {bubbles.map((bubble, index) => {
                const coordinates = [[8, 31], [28, 29], [54, 24], [83, 30], [15, 52], [43, 47], [69, 52], [94, 58], [6, 77], [33, 75], [61, 82], [86, 79]];
                const point = coordinates[index % coordinates.length];
                const size = Math.max(48, Math.min(126, bubble.size * 0.86));
                return (
                  <div className={`projection-home-orb${bubble.saves >= 50 || bubble.comments.length >= 2 ? ' is-resonant' : ''}`} key={bubble.id} style={{ left: `${point[0]}%`, top: `${point[1]}%`, '--bubble-size': `${size}px`, '--float-delay': `${(index % 7) * -0.6}s` }}>
                    <Bubble size={size} className={`accent-${bubble.accent}`} label={bubble.title} />
                    <span>{bubble.title}</span>
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
  const [page, setPage] = useState(['home', 'roam', 'create'].includes(initialScreen) ? initialScreen : 'home');
  const [playing, setPlaying] = useState(false);
  const [deviceEmitting, setDeviceEmitting] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [selected, setSelected] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [prompt, setPrompt] = useState('next');
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingEnergy, setRecordingEnergy] = useState(0.18);
  const [transcript, setTranscript] = useState('');
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
  const recordingStartedAt = useRef(0);
  const bubbles = createdBubble ? [createdBubble, ...SOUND_BUBBLES] : SOUND_BUBBLES;

  const startBubblePlayback = (bubble) => {
    const token = ++playbackToken.current;
    window.clearTimeout(playbackTimer.current);
    window.clearTimeout(playbackFallback.current);
    setPlaying(true);
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

  const finishRecording = () => {
    setRecording(false);
    setTranscript('风从河面来，像一句没说完的话。');
    setRecordingEnergy(0.22);
  };

  const toggleRecording = () => {
    if (recording) {
      finishRecording();
      return;
    }
    setTranscript('');
    setPublished(false);
    setRecordingSeconds(0);
    setRecordingEnergy(0.2);
    recordingStartedAt.current = performance.now();
    setRecording(true);
  };

  useEffect(() => {
    if (!recording) return undefined;
    const interval = window.setInterval(() => {
      const elapsed = (performance.now() - recordingStartedAt.current) / 1000;
      const seconds = Math.min(6, Math.floor(elapsed));
      const breath = 0.16 + Math.abs(Math.sin(elapsed * 4.9)) * 0.58 + Math.abs(Math.sin(elapsed * 1.7 + 0.9)) * 0.18;
      setRecordingSeconds(seconds);
      setRecordingEnergy(Math.min(0.96, breath));
      if (elapsed >= 6) finishRecording();
    }, 90);
    return () => window.clearInterval(interval);
  }, [recording]);

  const beginCapture = () => {
    setCaptured(true);
    triggerDeviceEmission(18000);
    startBubblePlayback(SOUND_BUBBLES[0]);
  };

  const publishBubble = () => {
    if (!transcript) return;
    const bubble = {
      id: `my-echo-${Date.now()}`,
      title: '给下一位的声音',
      quote: transcript,
      author: '你',
      duration: `${Math.max(1, recordingSeconds)} 秒`,
      saves: 1,
      listens: 1,
      distance: 0,
      size: 118,
      accent: 'rose',
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

  return (
    <main className="demo-canvas">
      <div className="ambient ambient-left" /><div className="ambient ambient-right" />
      <header className="demo-header"><span className="wordmark">声景漫游</span><span className="demo-mode"><i /> DEMO 01</span></header>
      <div className="demo-stage">
        <AudiencePreview page={page} selected={selected} captured={captured} playing={playing} emitting={deviceEmitting} recording={recording} recordingEnergy={recordingEnergy} published={published} bubbles={bubbles} />
        <div className="phone-column">
          <Phone width={398} frame="pro" time="9:41" className="demo-phone" wallpaper="linear-gradient(180deg, #eff6fc, #cbdff1 48%, #eaf1f5)">
          {page === 'home' && <HomeScreen bubbles={bubbles} playing={playing} emitting={deviceEmitting} onPageChange={setPage} poppedId={poppedId} onBubblePop={popBubble} onOpenLeaderboard={() => setLeaderboardOpen(true)} />}
          {page === 'roam' && <RoamScreen selected={selected} onSelect={setSelected} captured={captured} onCapture={beginCapture} playing={playing} emitting={deviceEmitting} onPageChange={setPage} zoom={zoom} onZoom={step => setZoom(v => Math.min(1.5, Math.max(.75, v + step * .12)))} />}
            {page === 'create' && <CreateScreen prompt={prompt} onPrompt={setPrompt} recording={recording} recordingSeconds={recordingSeconds} recordingEnergy={recordingEnergy} emitting={deviceEmitting} onRecord={toggleRecording} transcript={transcript} onPublish={publishBubble} published={published} onPageChange={setPage} />}
          </Phone>
          <div className={`device-status${playing || deviceEmitting ? ' is-playing' : ''}`}><span className="device-dot" /><span>{deviceEmitting ? 'EchoCaster 发泡演示中' : playing ? 'EchoCaster 播放演示中' : 'EchoCaster 演示装置'}</span><b>SIM</b></div>
        </div>
      </div>
      <div className="stage-floor" />
      <button className={`device-launcher${deviceOpen ? ' is-open' : ''}`} onClick={() => setDeviceOpen((open) => !open)} aria-expanded={deviceOpen} aria-label={deviceOpen ? '收起声景装置' : '展开声景装置'}>
        <span className="device-launcher-orb"><i /><i /><i /></span>
        <span>{deviceOpen ? '收起 EchoCaster' : '查看 EchoCaster'}</span>
        <b>{deviceOpen ? '−' : '↗'}</b>
      </button>
      {deviceOpen && <Suspense fallback={<div className="device-viewer device-viewer-loading glass-surface" role="status">装置载入中…</div>}><DeviceViewer open onClose={() => setDeviceOpen(false)} playing={playing || deviceEmitting} /></Suspense>}
      <LeaderboardSheet open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} onRoam={() => { setLeaderboardOpen(false); setPage('roam'); }} bubbles={bubbles} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

