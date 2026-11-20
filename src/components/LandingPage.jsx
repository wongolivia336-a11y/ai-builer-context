import React from 'react';
import wordmark from '../assets/user-kit/memo-garden-bubble-wordmark.png';
import outdoorPoster from '../assets/posters/memo-outdoor-film.jpg';
import devicePoster from '../assets/posters/memo-blue-yellow-editorial.jpg';
import './LandingPage.css';

const journey = [
  {
    step: '01',
    english: 'Wander',
    title: '漫游，听见一处',
    description: '在城市里慢下来，遇见留在街角、风里和日常中的声音。',
  },
  {
    step: '02',
    english: 'Catch',
    title: '捕捉，一颗回声',
    description: 'MEMO Catcher 是声音泡泡的实体捕捉器概念，为相遇的回声留一份自己的收藏。',
  },
  {
    step: '03',
    english: 'Grow',
    title: '留下，下一段声音',
    description: '录下一句此刻的你，让一颗新泡泡继续长成下一位路过者的记忆。',
  },
];

export default function LandingPage({ onEnter, onOpenMotionLab }) {
  return (
    <div className="memo-landing">
      <a className="landing-skip-link" href="#landing-main">跳到主要内容</a>
      <header className="landing-header">
        <a className="landing-brand" href="#top" aria-label="MEMO Garden 首页">
          <span className="landing-brand-orb" aria-hidden="true" />
          <span><b>MEMO Garden</b><small>声景漫游</small></span>
        </a>
        <nav className="landing-nav" aria-label="产品介绍">
          <a href="#story">产品故事</a>
          <a href="#catcher">MEMO Catcher</a>
          <button type="button" className="landing-nav-cta" onClick={() => onEnter('home')}>进入体验 <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" id="top" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker"><span />声景记忆计划 <i aria-hidden="true">·</i> Wander · Catch · Grow</p>
            <h1 className="landing-wordmark" id="landing-title">
              <span className="landing-visually-hidden">MEMO Garden</span>
              <img src={wordmark} alt="" aria-hidden="true" fetchPriority="high" />
            </h1>
            <p className="landing-headline">把每天听见的声音，留给下一次回味。</p>
            <p className="landing-copy-zh">MEMO Garden 创建并珍藏声景记忆，MEMO Catcher 硬件则捕捉一个个“声音泡泡”，让声音成为可回味的记忆。</p>
            <p className="landing-copy-en" lang="en">MEMO Garden is a mini-program that creates and preserves soundscape memories, while the MEMO Catcher hardware captures “sound bubbles,” turning everyday sounds into memories you can revisit.</p>
            <div className="landing-actions">
              <button type="button" className="landing-primary" onClick={() => onEnter('home')}>进入声景花园 <span aria-hidden="true">↗</span></button>
              <a className="landing-secondary" href="#catcher">了解 MEMO Catcher</a>
            </div>
            <p className="landing-promise-note">网页产品导览 · 下方可进入可交互原型</p>
          </div>

          <figure className="landing-hero-art">
            <span className="landing-orbit landing-orbit-one" aria-hidden="true" />
            <span className="landing-orbit landing-orbit-two" aria-hidden="true" />
            <span className="landing-float-bubble landing-float-bubble-one" aria-hidden="true" />
            <span className="landing-float-bubble landing-float-bubble-two" aria-hidden="true" />
            <img src={outdoorPoster} alt="MEMO Catcher 与户外肥皂泡场景的原始产品海报" fetchPriority="high" />
            <figcaption><span>MEMO Catcher</span><small>户外声景概念海报</small></figcaption>
          </figure>
        </section>

        <section className="landing-story" id="story" aria-labelledby="landing-story-title">
          <div className="landing-section-heading">
            <p className="landing-section-kicker">Wander · Catch · Grow</p>
            <h2 id="landing-story-title">从漫游开始，让回声继续生长。</h2>
            <p>MEMO Garden 把“发现声音”变成一段可以参与的城市漫游。</p>
          </div>
          <div className="landing-journey">
            {journey.map((item, index) => (
              <article className="landing-journey-card" key={item.step}>
                <span className="landing-step-number">{item.step}</span>
                <span className="landing-step-language">{item.english}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {index < journey.length - 1 && <span className="landing-journey-bridge" aria-hidden="true"><i /></span>}
              </article>
            ))}
          </div>
        </section>

        <section className="landing-catcher" id="catcher" aria-labelledby="landing-catcher-title">
          <div className="landing-catcher-copy">
            <p className="landing-section-kicker">MEMO Catcher · 实体装置概念</p>
            <h2 id="landing-catcher-title">让声音泡泡，有一个可以握住的去处。</h2>
            <p>MEMO Catcher 的设计概念以手机取景、声音捕捉与回声播放为主线，让声音泡泡拥有一件可握持的载体。薄荷绿主体、粉色扬声器与手机夹具沿用现有装置造型。</p>
            <p className="landing-boundary-note">当前网页是交互原型；实体按键、真实设备连接、定位锚点和机械捕捉尚未在此验证或接入。</p>
            <div className="landing-actions">
              <button type="button" className="landing-primary" onClick={() => onEnter('roam')}>漫游声音图卡 <span aria-hidden="true">↗</span></button>
              <a className="landing-secondary" href="#prototype">查看网页原型</a>
            </div>
          </div>
          <figure className="landing-catcher-art">
            <img src={devicePoster} alt="MEMO Catcher 的蓝黄编辑风格产品海报，作为品牌视觉参考" loading="lazy" />
            <figcaption>MEMO Catcher · 海报视觉参考</figcaption>
          </figure>
        </section>

        <section className="landing-prototype" id="prototype" aria-labelledby="landing-prototype-title">
          <div>
            <p className="landing-section-kicker">在浏览器里继续</p>
            <h2 id="landing-prototype-title">进入声景记忆原型。</h2>
            <p>从泡泡花园、图像漫游或共创录音开始。相机、麦克风与硬件能力会按当前演示边界明确提示。</p>
          </div>
          <div className="landing-prototype-actions">
            <button type="button" className="landing-primary" onClick={() => onEnter('home')}>打开 MEMO Garden <span aria-hidden="true">↗</span></button>
            <button type="button" className="landing-lab-link" onClick={onOpenMotionLab}>比较 M01–M03 动效方案 <span aria-hidden="true">→</span></button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>MEMO Garden · 声景漫游</span>
        <span>声音留下来，记忆就有了回来的路。</span>
      </footer>
    </div>
  );
}
