import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './MotionLab.css';

const modules = [
  { id: 'M01', name: '液态玻璃导航', english: 'Liquid Glass Tab', summary: '切换像一滴水沿着玻璃滑向下一站。' },
  { id: 'M02', name: '液体成泡', english: 'Liquid to Bloom', summary: '等待可以被看见，完成后才长出记忆泡泡。' },
  { id: 'M03', name: '触碰与回声', english: 'Bubble Memory', summary: '一触打开记忆，轻柔收拢而不删除。' },
];

const variants = {
  M01: [
    { id: 'A', name: '薄膜拉伸', note: '轻薄的膜沿着手势拉长，再贴合到新位置。' },
    { id: 'B', name: '双滴连桥', note: '两个圆润端点先牵出一条液桥，再合成选中态。' },
    { id: 'C', name: '柔性惯性', note: '选中胶囊带一点惯性，短暂回弹后安定下来。' },
  ],
  M02: [
    { id: 'A', name: '清澈液体', note: '用连续的水面收束，完成后轻轻鼓起。' },
    { id: 'B', name: '虹彩薄膜', note: '一层克制的虹彩随液面移动，泡泡在中央聚拢。' },
    { id: 'C', name: '蓝紫雾光', note: '蓝紫色雾层由边缘收拢，形成更柔软的绽放。' },
  ],
  M03: [
    { id: 'A', name: '接触破膜', note: '从手指落点向外展开一圈薄膜，打开声音卡。' },
    { id: 'B', name: '记忆展开', note: '泡泡像一张折起的声音明信片，翻开后仍可收回。' },
    { id: 'C', name: '声纹共振', note: '点击时波纹向外传开，再把声音记忆显现出来。' },
  ],
};

function VariantSwitch({ module, value, onChange }) {
  return (
    <div className="motion-variants" role="group" aria-label={`${module} 设计方案`}>
      {variants[module].map((variant) => (
        <button
          type="button"
          className={`motion-variant${value === variant.id ? ' is-selected' : ''}`}
          aria-pressed={value === variant.id}
          onClick={() => onChange(variant.id)}
          key={variant.id}
        >
          <span>{variant.id}</span><b>{variant.name}</b>
        </button>
      ))}
    </div>
  );
}

function TabDemo({ variant }) {
  const [active, setActive] = useState(0);
  const indicatorRef = useRef(null);
  const tabsRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const tab = tabsRef.current?.querySelector(`[data-tab-index="${active}"]`);
    if (!indicator || !tab) return undefined;
    const left = tab.offsetLeft;
    const width = tab.offsetWidth;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(indicator, {
      left,
      width,
      scaleX: variant === 'C' ? 1 : 1.04,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.56,
      ease: variant === 'C' ? 'elastic.out(1, 0.72)' : 'power3.out',
      overwrite: true,
    });
    return () => tweenRef.current?.kill();
  }, [active, variant]);

  useEffect(() => {
    const update = () => {
      const tab = tabsRef.current?.querySelector(`[data-tab-index="${active}"]`);
      if (!tab || !indicatorRef.current) return;
      gsap.set(indicatorRef.current, { left: tab.offsetLeft, width: tab.offsetWidth });
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [active]);

  return (
    <div className={`motion-tab-demo variant-${variant.toLowerCase()}`}>
      <nav className="motion-tab-rail" aria-label="声音花园分区">
        <span className="motion-tab-indicator" ref={indicatorRef} aria-hidden="true" />
        <div className="motion-tab-items" ref={tabsRef}>
          {['花园', '漫游', '共创'].map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`motion-tab-item${active === index ? ' is-active' : ''}`}
              data-tab-index={index}
              aria-current={active === index ? 'page' : undefined}
              onClick={() => setActive(index)}
            >
              <span className={`motion-tab-glyph glyph-${index}`} aria-hidden="true" />
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <div className="motion-tab-message" aria-live="polite">
        <span className="motion-message-orb" aria-hidden="true" />
        <div><small>当前页面</small><strong>{['泡泡花园', '声音漫游', '声音共创'][active]}</strong></div>
        <span className="motion-message-arrow" aria-hidden="true">↗</span>
      </div>
      <p className="motion-hint">连续快速切换也会跟手；点击上方标签试试。</p>
    </div>
  );
}

function FillDemo({ variant }) {
  const [phase, setPhase] = useState('idle');
  const [outcome, setOutcome] = useState('ready');
  const timerRef = useRef(null);
  const timer2Ref = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(timer2Ref.current);
  }, []);

  const start = () => {
    if (phase === 'filling') return;
    window.clearTimeout(timerRef.current);
    window.clearTimeout(timer2Ref.current);
    setPhase('filling');
    timerRef.current = window.setTimeout(() => {
      setPhase(outcome === 'ready' ? 'bloom' : outcome);
      timer2Ref.current = window.setTimeout(() => setPhase('idle'), outcome === 'ready' ? 2200 : 1500);
    }, 1550);
  };
  const cancel = () => {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(timer2Ref.current);
    setPhase('cancel');
    timer2Ref.current = window.setTimeout(() => setPhase('idle'), 550);
  };

  return (
    <div className={`motion-fill-demo variant-${variant.toLowerCase()} phase-${phase}`}>
      <div className="motion-fill-scene" aria-live="polite">
        <span className="motion-fill-wisp wisp-a" aria-hidden="true" />
        <span className="motion-fill-wisp wisp-b" aria-hidden="true" />
        <div className="motion-fill-vessel" aria-label="液体收束演示">
          <span className="motion-vessel-highlight" aria-hidden="true" />
          <span className="motion-vessel-liquid" aria-hidden="true" />
          <span className="motion-vessel-ripple ripple-one" aria-hidden="true" />
          <span className="motion-vessel-ripple ripple-two" aria-hidden="true" />
          <span className="motion-vessel-bubble" aria-hidden="true" />
        </div>
        <div className="motion-fill-status">
          {phase === 'filling' ? '液体正在收束' : phase === 'bloom' ? '一颗声音泡泡出现了' : phase === 'error' ? '这次没有收集成功' : phase === 'cancel' ? '已取消，液体回到原处' : '点按开始一次演示'}
        </div>
      </div>
      <div className="motion-outcome-row" role="group" aria-label="选择预览情境">
        <span>预览情境</span>
        {[
          ['ready', '完成'], ['error', '失败'], ['cancel', '取消'],
        ].map(([key, label]) => (
          <button key={key} type="button" className={outcome === key ? 'is-selected' : ''} aria-pressed={outcome === key} onClick={() => setOutcome(key)}>{label}</button>
        ))}
      </div>
      <div className="motion-fill-actions">
        <button className="motion-primary-action" type="button" onClick={phase === 'filling' ? cancel : start}>{phase === 'filling' ? '取消这次演示' : '开始液体成泡'}</button>
        <p>没有百分比进度。只有成功时才出现泡泡。</p>
      </div>
    </div>
  );
}

function BubbleDemo({ variant }) {
  const [opened, setOpened] = useState(false);
  const [contact, setContact] = useState({ x: 50, y: 50 });
  const bubbleRef = useRef(null);
  const touchStart = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = event.nativeEvent;
    setContact({ x: Math.max(12, Math.min(88, ((point.clientX - rect.left) / rect.width) * 100)), y: Math.max(12, Math.min(88, ((point.clientY - rect.top) / rect.height) * 100)) });
  };
  useEffect(() => {
    const el = bubbleRef.current;
    if (!el || !opened) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = gsap.fromTo(el, { scale: reduce ? 1 : 0.78, rotate: -2 }, { scale: 1, rotate: 0, duration: reduce ? 0 : 0.58, ease: 'back.out(1.35)', overwrite: true });
    return () => tween.kill();
  }, [opened]);

  return (
    <div className={`motion-memory-demo variant-${variant.toLowerCase()}${opened ? ' is-open' : ''}`} style={{ '--touch-x': `${contact.x}%`, '--touch-y': `${contact.y}%` }}>
      <div className="motion-memory-stage">
        <button
          className="motion-memory-bubble"
          type="button"
          ref={bubbleRef}
          aria-expanded={opened}
          aria-label={opened ? '收回声音泡泡' : '打开声音泡泡'}
          onPointerDown={touchStart}
          onClick={() => setOpened((value) => !value)}
        >
          <span className="motion-bubble-specular" aria-hidden="true" />
          <span className="motion-bubble-core" aria-hidden="true" />
          <span className="motion-bubble-contact" aria-hidden="true" />
          <span className="motion-bubble-label">{opened ? '收回' : '轻触打开'}</span>
        </button>
        <article className="motion-memory-card" aria-hidden={!opened}>
          <span className="motion-card-meta">声音明信片 · 01</span>
          <h3>河面上的风</h3>
          <p>傍晚的水面，把经过的风留了下来。</p>
          <div className="motion-card-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <button type="button" inert={!opened} onClick={() => setOpened(false)}>合上记忆 <span aria-hidden="true">↘</span></button>
        </article>
      </div>
      <p className="motion-hint">单次轻触即可打开；内容可收回，不会删除。</p>
    </div>
  );
}

export default function MotionLab({ onExit }) {
  const [activeModule, setActiveModule] = useState('M01');
  const [selected, setSelected] = useState({ M01: 'A', M02: 'B', M03: 'C' });
  const current = modules.find((module) => module.id === activeModule);
  const activeVariant = selected[activeModule];

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onExit?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  return (
    <main className="motion-lab">
      <header className="motion-lab-header">
        <button className="motion-back" type="button" onClick={onExit}><span aria-hidden="true">←</span> 返回产品介绍</button>
        <span className="motion-lab-brand"><i aria-hidden="true" /> MEMO Garden <small>动效实验室</small></span>
        <span className="motion-preview-badge">交互概念预览</span>
      </header>

      <div className="motion-lab-layout">
        <aside className="motion-lab-sidebar" aria-label="动效模块">
          <p className="motion-sidebar-eyebrow">MOTION STUDIES · 01—03</p>
          <h1>让每次触碰，<br />都有回声。</h1>
          <p className="motion-sidebar-copy">比较三种核心动效。点击不同方案，感受材质、形变和节奏。</p>
          <nav className="motion-module-list" aria-label="选择动效模块">
            {modules.map((module) => (
              <button type="button" key={module.id} className={`motion-module-link${activeModule === module.id ? ' is-current' : ''}`} aria-current={activeModule === module.id ? 'page' : undefined} onClick={() => setActiveModule(module.id)}>
                <span className="motion-module-index">{module.id}</span><span className="motion-module-label"><b>{module.name}</b><small>{module.english}</small></span><span className="motion-module-chevron" aria-hidden="true">↗</span>
              </button>
            ))}
          </nav>
          <p className="motion-sidebar-foot">这些选择只在预览中生效<br />当前正式体验没有被覆盖。</p>
        </aside>

        <section className={`motion-lab-workbench module-${activeModule.toLowerCase()}`} aria-labelledby="motion-module-title">
          <div className="motion-workbench-top">
            <div><span className="motion-workbench-index">{current.id} / 03</span><h2 id="motion-module-title">{current.name}</h2><p>{current.summary}</p></div>
            <span className="motion-workbench-orbit" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <VariantSwitch module={activeModule} value={activeVariant} onChange={(id) => setSelected((state) => ({ ...state, [activeModule]: id }))} />
          <p className="motion-variant-note" aria-live="polite">{variants[activeModule].find((item) => item.id === activeVariant)?.note}</p>
          <div className="motion-demo-shell" key={`${activeModule}-${activeVariant}`}>
            {activeModule === 'M01' && <TabDemo variant={activeVariant} />}
            {activeModule === 'M02' && <FillDemo variant={activeVariant} />}
            {activeModule === 'M03' && <BubbleDemo variant={activeVariant} />}
          </div>
          <div className="motion-workbench-footer"><span>鼠标 / 手指均可操作</span><span>ESC 返回 · prefers-reduced-motion 已支持</span></div>
        </section>
      </div>
    </main>
  );
}
