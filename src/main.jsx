import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { Phone } from './kit/phone';
import streetBackground from './assets/roam-street.png';
import './styles.css';
import './styles-v2.css';
import './styles-editorial.css';

const DeviceViewer = lazy(() => import('./DeviceViewer'));

const initialScreen = new URLSearchParams(location.search).get('screen');

function Bubble({ size, className = '', label, onClick }) {
  return (
    <button
      className={`soap-bubble ${className}`}
      style={{ '--bubble-size': `${size}px` }}
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

function DevicePill({ playing }) {
  return (
    <div className={`device-pill${playing ? ' playing' : ''}`}>
      <i />
      <span>{playing ? '正在播放' : '装置已连接'}</span>
    </div>
  );
}

const SOUND_BUBBLES = [
  { id: 'wind', title: '河面上的风', quote: '风从河面来，像一句没说完的话。', author: '林', duration: '12 秒', saves: 86, listens: 214, distance: 8, size: 116, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 5 },
  { id: 'bell', title: '巷口的钟声', quote: '你听，巷子尽头的钟声又响了。', author: '阿岚', duration: '8 秒', saves: 54, listens: 172, distance: 18, size: 72, accent: 'blue', kind: '环境声', kindKey: 'ambience', age: 3 },
  { id: 'steps', title: '刚经过的人', quote: '有人刚刚从这里走过。', author: '匿名漫游者', duration: '6 秒', saves: 31, listens: 98, distance: 23, size: 52, accent: 'rose', kind: '人声', kindKey: 'voice', age: 1 },
  { id: 'osmanthus', title: '桂花茶的下午', quote: '这家店的桂花茶，下午最香。', author: '小满', duration: '10 秒', saves: 22, listens: 61, distance: 31, size: 43, accent: 'lilac', kind: '碎念', kindKey: 'thought', age: 2 },
  { id: 'rain', title: '雨停以后', quote: '雨停以后，石板路会闪一下。', author: '江边散步的人', duration: '9 秒', saves: 17, listens: 44, distance: 42, size: 34, accent: 'lilac', kind: '碎念', kindKey: 'thought', age: 0 },
];

function HomeBubble({ bubble, index, popped, onPop }) {
  const buttonRef = useRef(null);
  const [burst, setBurst] = useState(false);
  const isResonant = bubble.saves >= 50;

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const float = gsap.to(button, {
      y: index % 2 ? -3 : 3,
      rotation: index % 2 ? 0.5 : -0.5,
      duration: 4.4 + index * 0.3,
      delay: index * -0.32,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => float.kill();
  }, [index]);

  const pop = (event) => {
    const button = buttonRef.current;
    if (!button || popped) return;
    const particles = button.querySelectorAll('.pop-bit');
    const ring = button.querySelector('.pop-ripple');
    const radius = Math.max(54, button.getBoundingClientRect().width * 0.8);
    setBurst(true);
    gsap.timeline()
      .to(button, { scaleX: 1.1, scaleY: 0.86, duration: 0.1, ease: 'power2.out' })
      .to(button, { scaleX: 0.76, scaleY: 1.16, duration: 0.12, ease: 'power3.in' })
      .to(button, { scale: 0.06, opacity: 0, filter: 'blur(3px)', duration: 0.18, ease: 'power2.in' });
    if (ring) gsap.fromTo(ring, { scale: 0.36, opacity: 0.72 }, { scale: 1.8, opacity: 0, duration: 0.48, ease: 'power2.out' });
    if (particles.length) {
      gsap.fromTo(particles, { x: 0, y: 0, scale: 0.25, opacity: 0.96 }, {
        x: (i) => Math.cos((i / particles.length) * Math.PI * 2) * radius,
        y: (i) => Math.sin((i / particles.length) * Math.PI * 2) * radius,
        scale: (i) => i % 3 === 0 ? 0.12 : 0.34,
        opacity: 0,
        duration: 0.56,
        stagger: 0.014,
        ease: 'power3.out',
      });
    }
    onPop(bubble, event);
    window.setTimeout(() => setBurst(false), 620);
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (popped || !button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const rebound = gsap.fromTo(button, { scale: 0.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.56, ease: 'elastic.out(1, 0.48)' });
    return () => rebound.kill();
  }, [popped]);

  return (
    <div className={`home-bubble-anchor gallery-entry${index === 0 ? ' is-featured' : ''}${isResonant ? ' is-resonant' : ''}${popped ? ' is-popped' : ''}`} style={{ '--bubble-size': `${index === 0 ? 104 : 66 + (index % 2) * 8}px`, '--bubble-accent': bubble.accent }}>
      <button
        ref={buttonRef}
        className={`soap-bubble home-bubble accent-${bubble.accent}${isResonant ? ' bubble-hot' : ''}`}
        aria-label={`戳开${bubble.kind}泡泡并回听：${bubble.title}`}
        title={`${bubble.kind} · ${bubble.title}`}
        onPointerDown={(event) => gsap.to(event.currentTarget, { scaleX: 0.94, scaleY: 1.05, duration: 0.11, ease: 'power2.out' })}
        onPointerUp={(event) => gsap.to(event.currentTarget, { scaleX: 1, scaleY: 1, duration: 0.42, ease: 'elastic.out(1, 0.38)' })}
        onPointerCancel={(event) => gsap.to(event.currentTarget, { scale: 1, duration: 0.24, ease: 'power2.out' })}
        onClick={pop}
      >
        <span className="bubble-core" />
        <span className="bubble-glint" />
        <span className="bubble-rank-aura" />
        <span className="bubble-rank-mark">{isResonant ? `共鸣 ${bubble.saves}` : ''}</span>
        <span className="pop-ripple" />
        {burst && <span className="pop-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className="pop-bit" />)}</span>}
      </button>
      <span className="bubble-label"><small className={`gallery-kind kind-${bubble.kindKey}`}>{bubble.kind}</small><strong>{bubble.title}</strong><small className="gallery-duration">{bubble.duration} · {String(index + 1).padStart(2, '0')}</small></span>
    </div>
  );
}

function HomeScreen({ onRoam, onPlay, playing, onPageChange, activeBubble, poppedId, onBubblePop, onOpenLeaderboard }) {
  const [kindFilter, setKindFilter] = useState('all');
  const kinds = [
    ['all', '全部'],
    ['voice', '人声'],
    ['ambience', '环境声'],
    ['thought', '碎念'],
  ];
  const gallery = SOUND_BUBBLES.filter((bubble) => kindFilter === 'all' || bubble.kindKey === kindFilter);

  return (
    <Scene className="app-home gallery-home">
      <div className="screen-topline">
        <span className="gallery-kicker"><i /> 我的声音集 <b>05</b></span>
        <DevicePill playing={playing} />
      </div>
      <div className="home-content gallery-content">
        <div className="gallery-heading">
          <div>
            <span className="eyebrow"><i /> FIELD NOTES / VOL. 01</span>
            <h1>我的<span>回声</span></h1>
            <p>05 段声音 <i /> <b>03 种内容</b></p>
          </div>
          <button className="gallery-board" onClick={onOpenLeaderboard} aria-label="打开回声榜">
            <span>↗</span><small>回声榜</small>
          </button>
        </div>
        <div className="gallery-filter" role="tablist" aria-label="按声音内容筛选">
            {kinds.map(([key, label]) => (
            <button key={key} data-kind={key} className={kindFilter === key ? 'selected' : ''} role="tab" aria-selected={kindFilter === key} onClick={() => setKindFilter(key)}>{label}</button>
          ))}
        </div>
        <div className="gallery-section-head"><strong>最近收录</strong><span><b>{String(gallery.length).padStart(2, '0')}</b> / SOUND LOG</span></div>
        <div className="gallery-grid" aria-label="个人声音泡泡图鉴">
          {gallery.map((bubble, index) => <HomeBubble key={bubble.id} bubble={bubble} index={index} popped={poppedId === bubble.id} onPop={onBubblePop} />)}
        </div>
        <button className={`now-playing glass-surface${playing ? ' is-playing' : ''}`} onClick={() => onPlay(activeBubble || SOUND_BUBBLES[0])}>
          <span className="play-disc">{playing ? <span className="pause-bars"><i /><i /></span> : <span className="play-triangle" />}</span>
          <span className="track-copy"><strong>{activeBubble?.title || '河面上的风'}</strong><small>{playing ? '声音正在从泡泡里流出来' : `${activeBubble?.kind || '环境声'} · ${activeBubble?.duration || '12 秒'} · 点按回听`}</small></span>
          <Waveform active={playing} small />
        </button>
        <GlassButton className="start-roam" onClick={onRoam}>继续漫游 <span className="arrow-out">↗</span></GlassButton>
      </div>
      <TabBar active="home" onChange={onPageChange} />
    </Scene>
  );
}

function LeaderboardSheet({ open, onClose, onRoam }) {
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
  const ranked = [...SOUND_BUBBLES].sort((a, b) => b.saves - a.saves).slice(0, 3);
  return (
    <div className="sheet-backdrop" ref={backdropRef} onClick={onClose}>
      <section className="leader-sheet glass-surface" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="leader-title" onClick={(event) => event.stopPropagation()}>
        <span className="sheet-grabber" />
        <div className="leader-head">
          <div><span className="eyebrow">本周共鸣</span><h2 id="leader-title">回声榜</h2></div>
          <button className="sheet-close" aria-label="关闭回声榜" onClick={onClose}>×</button>
        </div>
        <p className="leader-subtitle">被更多人收进泡泡盒的声音，会亮得更久。</p>
        <div className="leader-list">
          {ranked.map((bubble, index) => (
            <div className={`leader-row rank-${index + 1}`} key={bubble.id}>
              <span className="leader-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className={`leader-orb accent-${bubble.accent}`} />
              <span className="leader-copy"><strong>{bubble.title}</strong><small>{bubble.author} · {bubble.kind}</small></span>
              <span className="leader-saves">{bubble.saves}<small>收藏</small></span>
            </div>
          ))}
        </div>
        <button className="leader-roam" onClick={onRoam}>去找这颗声音 <span>↗</span></button>
      </section>
    </div>
  );
}

function RoamScreen({ selected, onSelect, captured, onCapture, playing, onPageChange, zoom, onZoom }) {
  const targetSound = selected === 1 ? SOUND_BUBBLES[0] : SOUND_BUBBLES[1];
  return (
    <Scene className={`app-roam${captured ? ' capture-done' : ''}`} style={{ '--street-image': `url("${streetBackground}")` }}>
      <div className="screen-topline">
        <span className="place-chip ar-place-chip"><i /> 江湾 · 实景 AR</span>
        <DevicePill playing={playing} />
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
            <div className="result-track"><strong>「风从河面来」</strong><Waveform active={playing} small /></div>
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

function CreateScreen({ prompt, onPrompt, recording, onRecord, transcript, onPublish, published, onPageChange }) {
  return (
    <Scene className="app-create">
      <div className="screen-topline">
        <span className="place-chip"><i /> 江湾 · 01</span>
        <DevicePill playing={false} />
      </div>
      <div className="create-content">
        <div className="create-heading">
          <div className="create-title-copy">
            <span className="eyebrow">FIELD RECORDING / 01</span>
            <h1>留一句</h1>
          </div>
          <span className="create-rec"><i /> REC</span>
        </div>
        <div className="create-orbit">
          <span className="create-aura" />
          <Bubble size={104} className={`record-bubble${recording ? ' recording' : ''}`} label="录音泡泡" />
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
            <span className="record-time">{recording ? '00:08' : transcript ? '00:08' : '00:00'}</span>
          </div>
        </div>
        <GlassButton className="publish-button" onClick={transcript ? onPublish : onRecord}>{published ? '已留在这里' : transcript ? '留下这句话' : '开始录音'} <span className="arrow-out">↗</span></GlassButton>
      </div>
      <TabBar active="create" onChange={onPageChange} />
    </Scene>
  );
}

function AudiencePreview({ page, selected, captured, playing, published }) {
  return (
    <section className="audience-window">
      <div className="audience-chrome">
        <span className="chrome-lights"><i /><i /><i /></span>
        <span className="audience-title">现场镜像</span>
        <span className="live-pill"><i /> LIVE</span>
      </div>
      <Scene className={`projection-scene projection-${page}`} style={page === 'roam' ? { '--street-image': `url("${streetBackground}")` } : undefined}>
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
            <div className="projection-create-cluster"><Bubble size={135} className={published ? 'published-bubble' : ''} /><Bubble size={53} /><Bubble size={31} /></div>
            <div className="projection-caption"><span>{published ? '声音已经留下' : '一段新声音，正在诞生'}</span><strong>{published ? '等下一位路过' : '一句话 · 一个位置'}</strong></div>
          </>
        ) : (
          <>
            <div className="projection-issue"><span>FIELD NOTES</span><b>VOL. 01</b><i>05 SOUNDS</i></div>
            <div className="projection-home-title">我的<br /><em>回声图鉴</em></div>
            <div className="projection-cluster">
              <Bubble size={150} className="projection-bubble p-center accent-blue" />
              <Bubble size={70} className="projection-bubble p-left accent-rose" />
              <Bubble size={46} className="projection-bubble p-right accent-lilac" />
              <Bubble size={30} className="projection-bubble p-low accent-blue" />
              <Bubble size={34} className="projection-bubble p-new accent-lilac" />
            </div>
            <div className="projection-track glass-surface"><span className="projection-play"><span className="play-triangle" /></span><span><strong>河面上的风</strong><small>环境声 · 12 秒</small></span><Waveform active={playing} small /></div>
          </>
        )}
      </Scene>
    </section>
  );
}

function App() {
  const [page, setPage] = useState(['home', 'roam', 'create'].includes(initialScreen) ? initialScreen : 'home');
  const [playing, setPlaying] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [selected, setSelected] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [prompt, setPrompt] = useState('next');
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [published, setPublished] = useState(false);
  const [activeBubble, setActiveBubble] = useState(SOUND_BUBBLES[0]);
  const [poppedId, setPoppedId] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const popTimer = useRef(null);
  const playbackTimer = useRef(null);
  const playbackFallback = useRef(null);
  const playbackToken = useRef(0);

  const startBubblePlayback = (bubble) => {
    const token = ++playbackToken.current;
    window.clearTimeout(playbackTimer.current);
    window.clearTimeout(playbackFallback.current);
    setActiveBubble(bubble);
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

  const toggleBubblePlayback = (bubble) => {
    if (playing) {
      playbackToken.current += 1;
      window.clearTimeout(playbackTimer.current);
      window.clearTimeout(playbackFallback.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    startBubblePlayback(bubble);
  };

  const popBubble = (bubble) => {
    setActiveBubble(bubble);
    setPoppedId(bubble.id);
    startBubblePlayback(bubble);
    window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => setPoppedId(null), 1650);
  };

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setTimeout(() => {
      setRecording(false);
      setTranscript('风从河面来，像一句没说完的话。');
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [recording]);

  const beginCapture = () => {
    setCaptured(true);
    startBubblePlayback(SOUND_BUBBLES[0]);
  };

  const publishBubble = () => {
    setPublished(true);
    setPage('home');
  };

  return (
    <main className="demo-canvas">
      <div className="ambient ambient-left" /><div className="ambient ambient-right" />
      <header className="demo-header"><span className="wordmark">声景漫游</span><span className="demo-mode"><i /> DEMO 01</span></header>
      <div className="demo-stage">
        <AudiencePreview page={page} selected={selected} captured={captured} playing={playing} published={published} />
        <div className="phone-column">
          <Phone width={398} frame="pro" time="9:41" className="demo-phone" wallpaper="linear-gradient(180deg, #eff6fc, #cbdff1 48%, #eaf1f5)">
            {page === 'home' && <HomeScreen onRoam={() => setPage('roam')} onPlay={toggleBubblePlayback} playing={playing} onPageChange={setPage} activeBubble={activeBubble} poppedId={poppedId} onBubblePop={popBubble} onOpenLeaderboard={() => setLeaderboardOpen(true)} />}
            {page === 'roam' && <RoamScreen selected={selected} onSelect={setSelected} captured={captured} onCapture={beginCapture} playing={playing} onPageChange={setPage} zoom={zoom} onZoom={step => setZoom(v => Math.min(1.5, Math.max(.75, v + step * .12)))} />}
            {page === 'create' && <CreateScreen prompt={prompt} onPrompt={setPrompt} recording={recording} onRecord={() => setRecording(v => !v)} transcript={transcript} onPublish={publishBubble} published={published} onPageChange={setPage} />}
          </Phone>
          <div className={`device-status${playing ? ' is-playing' : ''}`}><span className="device-dot" /><span>{playing ? '播放中' : '声景装置'}</span><b>ESP32</b></div>
        </div>
      </div>
      <div className="stage-floor" />
      <button className={`device-launcher${deviceOpen ? ' is-open' : ''}`} onClick={() => setDeviceOpen((open) => !open)} aria-expanded={deviceOpen} aria-label={deviceOpen ? '收起声景装置' : '展开声景装置'}>
        <span className="device-launcher-orb"><i /><i /><i /></span>
        <span>{deviceOpen ? '收起装置' : '看声景装置'}</span>
        <b>{deviceOpen ? '−' : '↗'}</b>
      </button>
      {deviceOpen && <Suspense fallback={<div className="device-viewer device-viewer-loading glass-surface" role="status">装置载入中…</div>}><DeviceViewer open onClose={() => setDeviceOpen(false)} playing={playing} /></Suspense>}
      <LeaderboardSheet open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} onRoam={() => { setLeaderboardOpen(false); setPage('roam'); }} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

