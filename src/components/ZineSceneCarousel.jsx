import { useState } from 'react'
import { BUBBLE_SCENES } from '../zine/bubble-scenes.js'

const pad = (value) => String(value).padStart(2, '0')

export default function ZineSceneCarousel({ sceneIndex, autoPlay, motionReduced, onSelect, onAutoPlayChange }) {
  const [open, setOpen] = useState(false)
  const scene = BUBBLE_SCENES[sceneIndex]
  const selectScene = (index) => {
    onSelect((index + BUBBLE_SCENES.length) % BUBBLE_SCENES.length)
    onAutoPlayChange(false)
    setOpen(false)
  }

  return (
    <div className="zine-scene-carousel">
      <div className="zine-scene-dial">
        <button
          className="zine-scene-preview"
          type="button"
          aria-label="选择风景底图"
          aria-expanded={open}
          aria-controls={open ? 'zine-scene-picker' : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          <img src={scene.image} alt="" />
          <span>{pad(sceneIndex + 1)}</span>
        </button>
        <div className="zine-scene-label" aria-live="polite">
          <span>{pad(sceneIndex + 1)} / {pad(BUBBLE_SCENES.length)}</span>
          <strong>{scene.name}</strong>
        </div>
        <button className="zine-scene-arrow" type="button" aria-label="上一张风景" onClick={() => selectScene(sceneIndex - 1)}>‹</button>
        <button className="zine-scene-arrow" type="button" aria-label="下一张风景" onClick={() => selectScene(sceneIndex + 1)}>›</button>
        <button
          className="zine-scene-autoplay"
          type="button"
          disabled={motionReduced}
          aria-label={motionReduced ? '系统已减少动态效果' : autoPlay ? '暂停自动轮播' : '开始自动轮播'}
          aria-pressed={autoPlay}
          onClick={() => onAutoPlayChange(!autoPlay)}
        >
          <span aria-hidden="true">{autoPlay ? 'Ⅱ' : '▶'}</span>
        </button>
      </div>
      {open && (
        <div className="zine-scene-picker" id="zine-scene-picker" role="group" aria-label="选择一张风景底图">
          {BUBBLE_SCENES.map((item, index) => (
            <button
              className={'zine-scene-option' + (index === sceneIndex ? ' is-current' : '')}
              type="button"
              key={item.id}
              aria-label={item.name}
              aria-pressed={index === sceneIndex}
              onClick={() => selectScene(index)}
            >
              <img src={item.image} alt="" loading="lazy" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
