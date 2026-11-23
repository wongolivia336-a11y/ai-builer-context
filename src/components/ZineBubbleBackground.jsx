import { useEffect, useRef, useState } from 'react'
import { BUBBLE_SCENES } from '../zine/bubble-scenes.js'
import { SETTINGS } from '../zine/bubbles/config.js'
import { BubbleWorld } from '../zine/bubbles/physics.js'
import { BubbleRenderer } from '../zine/bubbles/renderer.js'
import './ZineBubbleBackground.css'

const BLOCKED_SELECTOR = 'button, a, input, textarea, select, .zine-magazine, .zine-book-stage, .zine-reader-controls, .zine-top-actions, .zine-scene-carousel'

export default function ZineBubbleBackground({ hostRef, sceneIndex, autoPlay, onSceneChange }) {
  const layerRef = useRef(null)
  const canvasRef = useRef(null)
  const bubbleNodes = useRef([])
  const sceneIndexRef = useRef(sceneIndex)
  const autoPlayRef = useRef(autoPlay)
  const sceneChangeRef = useRef(onSceneChange)
  const selectSceneRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => { sceneChangeRef.current = onSceneChange }, [onSceneChange])
  useEffect(() => { autoPlayRef.current = autoPlay }, [autoPlay])
  useEffect(() => {
    sceneIndexRef.current = sceneIndex
    selectSceneRef.current?.(sceneIndex)
  }, [sceneIndex])

  useEffect(() => {
    const layer = layerRef.current
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!layer || !host || !canvas) return undefined

    let active = true
    let frameId = 0
    let lastTime = performance.now()
    let cycleTime = 0
    let currentScene = sceneIndexRef.current
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sceneQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const firstRect = layer.getBoundingClientRect()
    const world = new BubbleWorld(Math.max(1, firstRect.width), Math.max(1, firstRect.height), firstRect.width < 680 ? SETTINGS.mobileBubbleCount : SETTINGS.desktopBubbleCount)
    world.motion = !reducedMotion

    let renderer
    try {
      renderer = new BubbleRenderer(canvas, BUBBLE_SCENES)
      if (currentScene !== 0) renderer.select(currentScene, true)
      setFallback(false)
    } catch (error) {
      console.info('Using the lightweight bubble scene fallback.', error)
      setFallback(true)
    }

    const applyFallbackScene = (index) => {
      const scene = BUBBLE_SCENES[index]
      layer.style.setProperty('--zine-scene', scene.gradient)
      layer.style.setProperty('--zine-photo', 'url("' + scene.image + '")')
    }
    applyFallbackScene(currentScene)

    const selectScene = (index, notify = false) => {
      const nextScene = (index + BUBBLE_SCENES.length) % BUBBLE_SCENES.length
      if (nextScene === currentScene) return
      currentScene = nextScene
      sceneIndexRef.current = nextScene
      renderer?.select(nextScene)
      applyFallbackScene(nextScene)
      if (notify) sceneChangeRef.current?.(nextScene)
    }
    selectSceneRef.current = (index) => selectScene(index)

    const resize = () => {
      const rect = layer.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      world.resize(width, height)
      renderer?.resize(width, height)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(layer)

    const onReducedMotionChange = (event) => {
      reducedMotion = event.matches
      world.motion = !reducedMotion && document.visibilityState === 'visible'
      cycleTime = 0
      lastTime = performance.now()
    }
    const onVisibilityChange = () => {
      world.motion = !reducedMotion && document.visibilityState === 'visible'
      lastTime = performance.now()
    }
    sceneQuery.addEventListener?.('change', onReducedMotionChange)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const isBlocked = (target) => target instanceof Element && Boolean(target.closest(BLOCKED_SELECTOR))
    const pointFrom = (event) => {
      const rect = layer.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onPointerMove = (event) => {
      if (isBlocked(event.target)) {
        if (!world.grab) world.leavePointer()
        return
      }
      const point = pointFrom(event)
      world.movePointer(point.x, point.y)
      if (world.grab) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return
      if (isBlocked(event.target)) return
      const point = pointFrom(event)
      if (!world.pointerDown(point.x, point.y)) return
      event.preventDefault()
      event.stopPropagation()
      host.setPointerCapture?.(event.pointerId)
    }
    const onPointerUp = (event) => {
      if (!world.grab) return
      world.pointerUp()
      if (host.hasPointerCapture?.(event.pointerId)) host.releasePointerCapture(event.pointerId)
      event.preventDefault()
      event.stopPropagation()
    }
    const onPointerLeave = () => { if (!world.grab) world.leavePointer() }

    host.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
    host.addEventListener('pointerdown', onPointerDown, { capture: true, passive: false })
    host.addEventListener('pointerup', onPointerUp, true)
    host.addEventListener('pointercancel', onPointerUp, true)
    host.addEventListener('pointerleave', onPointerLeave, true)

    const renderFrame = (now) => {
      if (!active) return
      frameId = requestAnimationFrame(renderFrame)
      if (document.visibilityState !== 'visible') { lastTime = now; return }
      const dt = Math.min(.05, Math.max(0, (now - lastTime) / 1000))
      lastTime = now
      if (!reducedMotion && autoPlayRef.current) {
        cycleTime += dt * 1000
        if (cycleTime >= SETTINGS.autoIntervalMs) {
          cycleTime %= SETTINGS.autoIntervalMs
          selectScene((currentScene + 1) % BUBBLE_SCENES.length, true)
        }
      } else cycleTime = 0

      world.step(dt)
      try {
        renderer?.render(world, dt, reducedMotion)
      } catch (error) {
        console.info('Switching to the lightweight bubble scene fallback.', error)
        renderer?.destroy()
        renderer = undefined
        setFallback(true)
      }
      if (!renderer || canvas.dataset.contextLost === 'true') {
        bubbleNodes.current.forEach((node, index) => {
          if (!node) return
          const bubble = world.bubbles[index]
          if (!bubble) {
            node.style.width = '0px'
            node.style.height = '0px'
            node.style.opacity = '0'
            return
          }
          const squashX = 1 + bubble.squash * .55 + bubble.bendX / 450
          const squashY = 1 - bubble.squash * .38 - bubble.bendY / 600
          node.style.width = (bubble.r * 2) + 'px'
          node.style.height = (bubble.r * 2) + 'px'
          node.style.transform = 'translate3d(' + (bubble.x - bubble.r) + 'px, ' + (bubble.y - bubble.r) + 'px, 0) scale(' + squashX + ', ' + squashY + ')'
          node.style.opacity = '1'
        })
      }
    }

    const onContextLost = (event) => {
      event.preventDefault()
      canvas.dataset.contextLost = 'true'
      setFallback(true)
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    resize()
    frameId = requestAnimationFrame(renderFrame)

    return () => {
      active = false
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      sceneQuery.removeEventListener?.('change', onReducedMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      host.removeEventListener('pointermove', onPointerMove, true)
      host.removeEventListener('pointerdown', onPointerDown, true)
      host.removeEventListener('pointerup', onPointerUp, true)
      host.removeEventListener('pointercancel', onPointerUp, true)
      host.removeEventListener('pointerleave', onPointerLeave, true)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      selectSceneRef.current = null
      renderer?.destroy()
    }
  }, [hostRef])

  return (
    <div ref={layerRef} className={'zine-bubble-background' + (fallback ? ' is-fallback' : '')} data-scene={sceneIndex} aria-hidden="true">
      <canvas ref={canvasRef} className="zine-bubble-canvas" />
      <div className="zine-fallback-bubbles">
        {Array.from({ length: SETTINGS.desktopBubbleCount }, (_, index) => (
          <span
            key={index}
            ref={(node) => { bubbleNodes.current[index] = node }}
            className={'zine-fallback-bubble zine-fallback-bubble-' + (index % 5)}
          />
        ))}
      </div>
    </div>
  )
}
