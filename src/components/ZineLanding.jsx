import React, { useEffect, useRef, useState } from 'react';
import { LeafThrough } from 'leafthrough';
import { createPages } from '../zine/page-art.js';
import './ZineLanding.css';

const INITIAL_READOUT = { page: 0, visiblePages: [], pageCount: 10 };

const getPageLabel = ({ page, visiblePages = [], pageCount }) => {
  if (!visiblePages.length) return '封面';
  if (visiblePages.length > 1) {
    return `${String(visiblePages[0] + 1).padStart(2, '0')} — ${String(visiblePages.at(-1) + 1).padStart(2, '0')}`;
  }
  return `${String(visiblePages[0] + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`;
};

export default function ZineLanding({ onEnterExperience }) {
  const magazineElement = useRef(null);
  const magazineRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readout, setReadout] = useState(INITIAL_READOUT);
  const [printPages, setPrintPages] = useState([]);

  useEffect(() => {
    let active = true;
    let instance;

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
            grain: true,
            grainScale: 1.36,
            grainStrength: 0.18,
            showThrough: 0.075,
            inkGloss: 0.1,
            roughness: 0.86,
            metalness: 0.025,
            backColor: '#f5f4eb',
            wrinkles: 0.72,
            bulge: 0.82,
            sheetGap: 0.00035,
          },
          lighting: {
            ambient: { sky: '#fff9ee', ground: '#64766e', intensity: 1.35 },
            sun: { color: '#fff2d8', intensity: 1.7, position: [-2.4, 1.3, 4.2] },
            shadows: true,
            shadowMapSize: 1024,
            floorShadow: 0.26,
          },
          motion: {
            speed: 0.92,
            dragDistance: 0.74,
            commitThreshold: 0.18,
            curl: 1.08,
            maxTilt: 42,
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
            if (active) setReadout(detail);
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
      if (magazineRef.current === instance) magazineRef.current = null;
    };
  }, []);

  const progress = Math.max(0, Math.min(100, ((readout.page + 1) / readout.pageCount) * 100));

  return (
    <div className="zine-landing">
      <div className="zine-photo-atmosphere" aria-hidden="true" />
      <div className="zine-reader-shell">
        <header className="zine-reader-topbar">
          <button className="zine-brand" type="button" onClick={() => magazineRef.current?.goTo(0)} aria-label="回到小志封面">
            <img src="/zine/assets/memo-garden-bubble-wordmark.png" alt="MEMO Garden" />
          </button>
          <div className="zine-top-actions">
            <div className="zine-issue-mark"><span>FIELD NOTES</span><span>NO. 01 / 2026</span></div>
            <button className="zine-glass-button zine-print-button" type="button" onClick={() => window.print()}>
              <span>打印小志</span>
            </button>
            <button className="zine-glass-button zine-experience-button" type="button" onClick={onEnterExperience}>
              <span>进入产品体验</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </header>

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
        <p className="zine-reader-hint">{error ? '也可以直接进入产品体验' : readout.page === 0 ? '拖住右侧纸角，慢慢翻开' : '拖住页角翻阅 · 方向键也可以'}</p>
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
