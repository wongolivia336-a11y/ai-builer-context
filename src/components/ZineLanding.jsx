import React, { useEffect, useRef, useState } from 'react';
import { LeafThrough } from 'leafthrough';
import { createPages } from '../zine/page-art.js';
import { BUBBLE_SCENES } from '../zine/bubble-scenes.js';
import ZineBubbleBackground from './ZineBubbleBackground.jsx';
import SoundOrbit from './SoundOrbit.jsx';
import './ZineLanding.css';

const INITIAL_READOUT = { page: 0, visiblePages: [], pageCount: 10 };

function playPaperTurnSound(audioContextRef) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audio = audioContextRef.current || new AudioContext();
    audioContextRef.current = audio;
    if (audio.state === 'suspended') void audio.resume();

    const now = audio.currentTime + 0.006;
    const duration = 0.22;
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) {
      const fade = 1 - i / samples.length;
      samples[i] = (Math.random() * 2 - 1) * fade * fade;
    }
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.Q.value = 0.65;
    filter.frequency.setValueAtTime(1850, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.032, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(audio.destination);
    source.start(now);
    source.stop(now + duration);

    const thump = audio.createOscillator();
    const thumpGain = audio.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(175, now);
    thump.frequency.exponentialRampToValueAtTime(92, now + 0.12);
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.009, now + 0.012);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    thump.connect(thumpGain).connect(audio.destination);
    thump.start(now);
    thump.stop(now + 0.15);
  } catch (reason) {
    console.info('Paper turn audio is unavailable in this browser.', reason);
  }
}

const getPageLabel = ({ page, visiblePages = [], pageCount }) => {
  if (!visiblePages.length) return '封面';
  if (visiblePages.length > 1) {
    return `${String(visiblePages[0] + 1).padStart(2, '0')} — ${String(visiblePages.at(-1) + 1).padStart(2, '0')}`;
  }
  return `${String(visiblePages[0] + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`;
};

export default function ZineLanding({ onEnterExperience }) {
  const landingElement = useRef(null);
  const magazineElement = useRef(null);
  const magazineRef = useRef(null);
  const audioContextRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readout, setReadout] = useState(INITIAL_READOUT);
  const [printPages, setPrintPages] = useState([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(null);
  const [committedSceneIndex, setCommittedSceneIndex] = useState(null);
  const [sceneAutoPlay, setSceneAutoPlay] = useState(true);
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setMotionReduced(query.matches);
    updateMotionPreference();
    query.addEventListener?.('change', updateMotionPreference);
    return () => query.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    let active = true;
    let instance;
    const isNarrowReader = window.matchMedia('(max-width: 760px)').matches;

    createPages().then((pages) => {
      if (!active) return;
      setPrintPages(pages.map((page, index) => ({
        src: page.src.toDataURL('image/png'),
        alt: page.alt,
        number: index + 1,
      })));

      try {
        instance = new LeafThrough(magazineElement.current, {
          pages,
          startPage: 0,
          layout: 'auto',
          pageAspect: 1.4189,
          bleed: true,
          label: 'MEMO Garden《一颗泡泡的旅行》互动小志',
          formatPageLabel: ({ visiblePages, pageCount }) => {
            if (!visiblePages.length) return `封面，共 ${pageCount} 面`;
            const shown = visiblePages.map((page) => page + 1);
            return shown.length > 1 ? `第 ${shown[0]} 至 ${shown.at(-1)} 面，共 ${pageCount} 面` : `第 ${shown[0]} 面，共 ${pageCount} 面`;
          },
          maxPixelRatio: 2,
          preload: 2,
          paper: {
            grain: false,
            grainScale: 1,
            grainStrength: 0,
            showThrough: 0.025,
            inkGloss: 0,
            roughness: 0.96,
            metalness: 0,
            backColor: '#ffffff',
            wrinkles: 0.12,
            bulge: 0.42,
            sheetGap: 0.00035,
          },
          lighting: {
            ambient: { sky: '#ffffff', ground: '#66736a', intensity: 1.2 },
            sun: { color: '#fffefa', intensity: 1.35, position: [-2.4, 1.3, 4.2] },
            shadows: true,
            shadowMapSize: 1024,
            floorShadow: 0.18,
          },
          motion: {
            speed: 0.72,
            dragDistance: isNarrowReader ? 1.12 : 0.96,
            commitThreshold: isNarrowReader ? 0.27 : 0.24,
            curl: 1.2,
            maxTilt: 38,
            jitter: true,
            hoverLift: 0.035,
            reducedMotion: 'auto',
          },
          interaction: { drag: true, click: true, hold: false, hover: true, keyboard: true },
          onReady: () => {
            if (!active) return;
            setLoading(false);
            setReadout({ page: instance.page, visiblePages: [], pageCount: pages.length });
          },
          onPageChange: (detail) => {
            if (active) {
              setReadout(detail);
              playPaperTurnSound(audioContextRef);
            }
          },
          onError: (reason, page) => console.warn('Zine page could not be drawn', page, reason),
        });
        magazineRef.current = instance;
      } catch (reason) {
        console.error('The Zine reader could not start', reason);
        setLoading(false);
        setError('这台设备暂时无法运行 3D 翻页，可以继续打印或进入产品体验。');
      }
    }).catch((reason) => {
      console.error('The Zine artwork could not be prepared', reason);
      if (active) {
        setLoading(false);
        setError('小志素材暂时无法载入，请刷新页面再试。');
      }
    });

    return () => {
      active = false;
      instance?.dispose();
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
      if (magazineRef.current === instance) magazineRef.current = null;
    };
  }, []);

  const progress = Math.max(0, Math.min(100, ((readout.page + 1) / readout.pageCount) * 100));
  const activeSceneIndex = previewSceneIndex ?? committedSceneIndex ?? sceneIndex;
  const commitScene = (index) => {
    const nextIndex = (index + BUBBLE_SCENES.length) % BUBBLE_SCENES.length;
    setSceneIndex(nextIndex);
    setCommittedSceneIndex(nextIndex);
    setPreviewSceneIndex(null);
    setSceneAutoPlay(false);
  };

  return (
    <div className="zine-landing" ref={landingElement}>
      <ZineBubbleBackground
        hostRef={landingElement}
        sceneIndex={activeSceneIndex}
        autoPlay={sceneAutoPlay && !motionReduced && previewSceneIndex === null && committedSceneIndex === null}
        onSceneChange={setSceneIndex}
      />
      <div className="zine-reader-shell">
        <header className="zine-reader-topbar">
          <div className="zine-brand-block">
            <button className="zine-brand" type="button" onClick={() => magazineRef.current?.goTo(0)} aria-label="回到小志封面">
              <img src="/zine/assets/memo-garden-bubble-wordmark.png" alt="MEMO Garden" />
            </button>
            <section className="zine-product-intro" aria-label="MEMO Garden 产品概念">
              <p className="zine-product-kicker">MEMO · AI 声景漫游 <span>产品概念</span></p>
              <p className="zine-product-copy zine-product-copy-full">一款 Dreamcore 手机外设，陪你重新听见日常：沿街拾起带着地点的声音泡泡，AI 为它们整理成听觉手账；也把一句话留给后来的人。</p>
              <p className="zine-product-copy zine-product-copy-compact">沿街发现地点声音泡泡，听见他人留下的片刻，也留一句给后来的人。</p>
            </section>
          </div>
          <div className="zine-top-actions">
            <button className="zine-glass-button zine-print-button" type="button" aria-label="打印小志" onClick={() => window.print()}>
              <span className="zine-print-label">打印小志</span>
            </button>
            <button className="zine-glass-button zine-experience-button" type="button" aria-label="进入产品体验" onClick={onEnterExperience}>
              <span className="zine-experience-label">进入产品体验</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </header>

        <SoundOrbit
          sceneIndex={activeSceneIndex}
          committedSceneIndex={committedSceneIndex}
          restoreSceneIndex={committedSceneIndex ?? sceneIndex}
          motionReduced={motionReduced}
          audioContextRef={audioContextRef}
          onPreview={setPreviewSceneIndex}
          onRestore={() => setPreviewSceneIndex(null)}
          onCommit={commitScene}
          onRotationChange={(enabled, soundEnabled) => {
            setSceneAutoPlay(enabled && !soundEnabled);
            if (enabled && !soundEnabled) setCommittedSceneIndex(null);
          }}
        />

        <main className="zine-reader-main">
          <div className="zine-book-stage">
            <div
              className={`zine-magazine${readout.page === 0 ? ' zine-cover-view' : ''}`}
              ref={magazineElement}
              tabIndex={0}
              role="region"
              aria-label="MEMO Garden 一颗泡泡的旅行互动小志，可拖动页角或使用方向键翻页"
            />
            {loading && <div className="zine-book-loading" role="status">正在摊开这本小志…</div>}
            {error && <div className="zine-book-error" role="status">{error}</div>}
          </div>
        </main>

        <nav className="zine-reader-controls" aria-label="小志翻页控制">
          <button className="zine-glass-button zine-nav-button" type="button" onClick={() => magazineRef.current?.prev()} aria-label="上一页">
            <span aria-hidden="true">←</span><span className="zine-button-text">上一页</span>
          </button>
          <div className="zine-page-readout" aria-live="polite">
            <span>{getPageLabel(readout)}</span>
            <span className="zine-page-rule"><i style={{ width: `${progress}%` }} /></span>
          </div>
          <button className="zine-glass-button zine-nav-button zine-next-button" type="button" onClick={() => magazineRef.current?.next()} aria-label="下一页">
            <span className="zine-button-text">下一页</span><span aria-hidden="true">→</span>
          </button>
        </nav>
      </div>

      <section className="zine-print-edition" aria-hidden="true">
        {printPages.map((page) => (
          <article className="zine-print-sheet" key={page.number}>
            <img src={page.src} alt={page.alt} />
          </article>
        ))}
      </section>
    </div>
  );
}
