import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Phone } from './kit/phone';
import './styles.css';

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

function Scene({ children, className = '' }) {
  return <div className={`scene ${className}`}><div className="scene-sky" /><div className="scene-water" /><div className="scene-horizon" />{children}</div>;
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

function HomeScreen({ onRoam, onPlay, playing, published, onPageChange }) {
  return (
    <Scene className="app-home">
      <div className="screen-topline">
        <span className="place-chip"><i /> 江湾 · 01</span>
        <DevicePill playing={playing} />
      </div>
      <div className="home-content">
        <div className="home-title">
          <span className="eyebrow">今日收集 · {published ? '04' : '03'}</span>
          <h1>泡泡</h1>
        </div>
        <div className="home-orbit" aria-label="漂浮的声音泡泡">
          <span className="orbit-halo halo-one" />
          <span className="orbit-halo halo-two" />
          <Bubble size={128} className="home-bubble bubble-center" label="午后的风" onClick={onPlay} />
          <Bubble size={62} className="home-bubble bubble-left" label="远处的钟声" onClick={onPlay} />
          <Bubble size={44} className="home-bubble bubble-right" label="树叶" onClick={onPlay} />
          <Bubble size={29} className="home-bubble bubble-low" label="脚步声" onClick={onPlay} />
          <Bubble size={20} className="home-bubble bubble-high" label="小泡泡" onClick={onPlay} />
          {published && <Bubble size={35} className="home-bubble bubble-new" label="新留下的声音" onClick={onPlay} />}
          <span className="orbit-caption">江湾 · 03 段回声</span>
        </div>
        <button className={`now-playing glass-surface${playing ? ' is-playing' : ''}`} onClick={onPlay}>
          <span className="play-disc">{playing ? <span className="pause-bars"><i /><i /></span> : <span className="play-triangle" />}</span>
          <span className="track-copy"><strong>{published ? '风从河面来' : '午后的风'}</strong><small>留在这里的一句话</small></span>
          <Waveform active={playing} small />
        </button>
        <GlassButton className="start-roam" onClick={onRoam}>开始漫游 <span className="arrow-out">↗</span></GlassButton>
      </div>
      <TabBar active="home" onChange={onPageChange} />
    </Scene>
  );
}

function RoamScreen({ selected, onSelect, captured, onCapture, playing, onPageChange, zoom, onZoom }) {
  return (
    <Scene className={`app-roam${captured ? ' capture-done' : ''}`}>
      <div className="screen-topline">
        <span className="place-chip"><i /> 江湾 · 漫游中</span>
        <DevicePill playing={playing} />
      </div>
      <div className="roam-world">
        <div className="floor-line floor-back"><span>二层</span></div>
        <div className="floor-line floor-front"><span>一层</span></div>
        <div className="distant-architecture" />
        <Bubble size={82 * zoom} className={`target-bubble${selected === 1 ? ' target-selected' : ''}${captured ? ' target-captured' : ''}`} label="二层的声音泡泡" onClick={() => onSelect(1)} />
        <Bubble size={43} className={`target-bubble target-small${selected === 2 ? ' target-selected' : ''}`} label="远处的钟声" onClick={() => onSelect(2)} />
        <Bubble size={27} className="target-bubble target-tiny" label="远处的小泡泡" onClick={() => onSelect(2)} />
        <div className="aim-ring"><i /><b /></div>
        <div className="target-caption"><span>二层回声</span><i>·</i><span>8 m</span></div>
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
            <div className="roam-card-top"><span className="eyebrow">现场共选</span><span className="crowd-count"><i /><i /><i /> 04</span></div>
            <strong className="roam-quote">「风从河面来，像一句没说完的话。」</strong>
            <div className="roam-card-bottom"><span>林留在这里 · 12 秒</span><button className="capture-key" onClick={onCapture}><span className="key-core" />捕捉</button></div>
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
        <div className="create-heading"><span className="eyebrow">共创一段声音</span><h1>留一句</h1></div>
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
      <Scene className={`projection-scene projection-${page}`}>
        <div className="projection-location"><i /> 江湾 · 01 <span>空间回声</span></div>
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
            <div className="projection-home-title">声音<br /><em>轻轻浮上来</em></div>
            <div className="projection-cluster">
              <Bubble size={150} className="projection-bubble p-center" />
              <Bubble size={70} className="projection-bubble p-left" />
              <Bubble size={46} className="projection-bubble p-right" />
              <Bubble size={30} className="projection-bubble p-low" />
              {published && <Bubble size={34} className="projection-bubble p-new" />}
            </div>
            <div className="projection-track glass-surface"><span className="projection-play"><span className="play-triangle" /></span><span><strong>{published ? '风从河面来' : '午后的风'}</strong><small>江湾 · 留声</small></span><Waveform active={playing} small /></div>
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
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 4200);
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
          <Phone width={398} frame="pro" time="9:41" className="demo-phone" wallpaper="linear-gradient(180deg, #e9f8f8, #b9e5e7 48%, #e6f2ee)">
            {page === 'home' && <HomeScreen onRoam={() => setPage('roam')} onPlay={() => setPlaying(v => !v)} playing={playing} published={published} onPageChange={setPage} />}
            {page === 'roam' && <RoamScreen selected={selected} onSelect={setSelected} captured={captured} onCapture={beginCapture} playing={playing} onPageChange={setPage} zoom={zoom} onZoom={step => setZoom(v => Math.min(1.5, Math.max(.75, v + step * .12)))} />}
            {page === 'create' && <CreateScreen prompt={prompt} onPrompt={setPrompt} recording={recording} onRecord={() => setRecording(v => !v)} transcript={transcript} onPublish={publishBubble} published={published} onPageChange={setPage} />}
          </Phone>
          <div className={`device-status${playing ? ' is-playing' : ''}`}><span className="device-dot" /><span>{playing ? '播放中' : '声景装置'}</span><b>ESP32</b></div>
        </div>
      </div>
      <div className="stage-floor" />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
