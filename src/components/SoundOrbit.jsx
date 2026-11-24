import { useEffect, useRef, useState } from 'react'
import { BUBBLE_SCENES } from '../zine/bubble-scenes.js'
import { SOUND_ORBIT_TRACKS } from '../zine/sound-orbit-tracks.js'
import { SoundOrbitAudioController } from '../zine/sound-orbit-audio.js'
import './SoundOrbit.css'

const CX = 92
const CY = 94
const OUTER_RADIUS = 81
const INNER_RADIUS = 35
const COMMIT_LIFT_MS = 150
const COMMIT_SEEK_MS = 180
const COMMIT_DROP_MS = 180

function pointAt(radius, degrees) {
  const radians = (degrees * Math.PI) / 180
  return { x: CX + Math.cos(radians) * radius, y: CY + Math.sin(radians) * radius }
}

function sectorPath(index) {
  const start = -90 + index * 36 + 1.4
  const end = -90 + (index + 1) * 36 - 1.4
  const outerStart = pointAt(OUTER_RADIUS, start)
  const outerEnd = pointAt(OUTER_RADIUS, end)
  const innerEnd = pointAt(INNER_RADIUS, end)
  const innerStart = pointAt(INNER_RADIUS, start)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

const wrapIndex = (index) => (index + BUBBLE_SCENES.length) % BUBBLE_SCENES.length

export default function SoundOrbit({
  sceneIndex,
  committedSceneIndex,
  restoreSceneIndex,
  motionReduced,
  audioContextRef,
  onPreview,
  onRestore,
  onCommit,
  onRotationChange,
}) {
  const audioRef = useRef(null)
  const orbitSurfaceRef = useRef(null)
  const wedgeRefs = useRef([])
  const previewTimerRef = useRef(null)
  const wheelPreviewRef = useRef(null)
  const wheelRotationRef = useRef(0)
  const wheelHandlerRef = useRef(null)
  const commitTimersRef = useRef([])
  const intentRef = useRef(0)
  const unlockTokenRef = useRef(0)
  const audioRequestRef = useRef(0)
  const currentSceneIndexRef = useRef(sceneIndex)
  const pendingCommitRef = useRef(null)
  currentSceneIndexRef.current = sceneIndex
  const [hoverIndex, setHoverIndex] = useState(null)
  const [focusIndex, setFocusIndex] = useState(null)
  const [wheelPreviewIndex, setWheelPreviewIndex] = useState(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [wheelEngaged, setWheelEngaged] = useState(false)
  const [lockedSceneIndex, setLockedSceneIndex] = useState(null)
  const [armState, setArmState] = useState('parked')
  const [soundState, setSoundState] = useState('off')
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [rotationEnabled, setRotationEnabled] = useState(!motionReduced)
  const intentIndex = wheelPreviewIndex ?? hoverIndex ?? focusIndex
  const selectedIndex = intentIndex ?? sceneIndex
  const photoCardVisible = intentIndex !== null
    || pendingCommitRef.current === selectedIndex
    || lockedSceneIndex === selectedIndex
    || committedSceneIndex === selectedIndex

  if (!audioRef.current) audioRef.current = new SoundOrbitAudioController(audioContextRef)

  const playAudioAction = (action, index, fadeMs) => {
    const request = ++audioRequestRef.current
    setAudioLoading(true)
    setAudioError('')
    Promise.resolve(audioRef.current?.[action](BUBBLE_SCENES[index].id, fadeMs))
      .then((started) => {
        if (audioRequestRef.current !== request) return
        setAudioLoading(false)
        if (started === false) setAudioError('这段录音未能开始播放，请重新开启声音后再试。')
      })
      .catch((error) => {
        if (audioRequestRef.current !== request) return
        console.info('Sound Orbit could not load this scene recording.', error)
        setAudioLoading(false)
        setAudioError('声景载入失败，可继续选图。')
      })
  }

  const clearCommitSequence = () => {
    commitTimersRef.current.forEach(window.clearTimeout)
    commitTimersRef.current = []
    const pendingIndex = pendingCommitRef.current
    pendingCommitRef.current = null
    return pendingIndex
  }

  const clearWheelState = () => {
    wheelPreviewRef.current = null
    setWheelPreviewIndex(null)
    setWheelEngaged(false)
  }

  const muteSound = (fadeMs = 220) => {
    unlockTokenRef.current += 1
    audioRequestRef.current += 1
    setAudioLoading(false)
    setAudioError('')
    intentRef.current += 1
    window.clearTimeout(previewTimerRef.current)
    previewTimerRef.current = null
    clearWheelState()
    const pendingIndex = clearCommitSequence()
    setHoverIndex(null)
    setFocusIndex(null)
    if (pendingIndex !== null) {
      currentSceneIndexRef.current = pendingIndex
      onCommit?.(pendingIndex)
    } else {
      currentSceneIndexRef.current = restoreSceneIndex
      onRestore?.()
      onCommit?.(restoreSceneIndex)
    }
    audioRef.current?.disable(fadeMs)
    setSoundState('off')
    setArmState('parked')
  }

  useEffect(() => {
    setRotationEnabled(!motionReduced)
  }, [motionReduced])

  const cancelAudioPreview = () => {
    intentRef.current += 1
    window.clearTimeout(previewTimerRef.current)
    previewTimerRef.current = null
  }

  const scheduleAudioPreview = (index) => {
    if (soundState !== 'on') return
    window.clearTimeout(previewTimerRef.current)
    const intent = ++intentRef.current
    previewTimerRef.current = window.setTimeout(() => {
      previewTimerRef.current = null
      if (intentRef.current === intent && soundState === 'on') playAudioAction('preview', index)
    }, 300)
  }

  const finishWheelPreview = () => {
    setWheelEngaged(false)
    if (wheelPreviewRef.current === null) return
    clearWheelState()
    cancelAudioPreview()
    setHoverIndex(null)
    setFocusIndex(null)
    currentSceneIndexRef.current = restoreSceneIndex
    onRestore?.()
    if (soundState === 'on') playAudioAction('restoreCommitted', restoreSceneIndex)
  }

  const handleWheel = (event) => {
    if (motionReduced) return
    const rawDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (!rawDelta) return
    event.preventDefault()
    setWheelEngaged(true)
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
    const delta = rawDelta * scale
    const previousRotation = wheelRotationRef.current
    const nextRotation = previousRotation + delta * .36
    const crossedSectors = Math.trunc(nextRotation / 36) - Math.trunc(previousRotation / 36)
    let nextIndex = wheelPreviewRef.current ?? hoverIndex ?? focusIndex ?? sceneIndex
    if (crossedSectors) nextIndex = wrapIndex(nextIndex + crossedSectors)

    wheelRotationRef.current = nextRotation
    setWheelRotation(nextRotation)
    if (wheelPreviewRef.current === null) {
      cancelAudioPreview()
      setHoverIndex(null)
      setFocusIndex(null)
    }
    if (wheelPreviewRef.current !== nextIndex) {
      wheelPreviewRef.current = nextIndex
      setWheelPreviewIndex(nextIndex)
      currentSceneIndexRef.current = nextIndex
      onPreview?.(nextIndex)
      scheduleAudioPreview(nextIndex)
    }
  }

  wheelHandlerRef.current = handleWheel

  useEffect(() => {
    const surface = orbitSurfaceRef.current
    if (!surface) return undefined
    const onWheel = (event) => wheelHandlerRef.current?.(event)
    surface.addEventListener('wheel', onWheel, { passive: false })
    return () => surface.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && soundState !== 'off') {
        muteSound(100)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [soundState, restoreSceneIndex])

  useEffect(() => () => {
    intentRef.current += 1
    window.clearTimeout(previewTimerRef.current)
    commitTimersRef.current.forEach(window.clearTimeout)
    audioRef.current?.dispose()
  }, [])

  const restorePreview = () => {
    if (wheelPreviewRef.current !== null) return
    cancelAudioPreview()
    setHoverIndex(null)
    setFocusIndex(null)
    currentSceneIndexRef.current = restoreSceneIndex
    onRestore?.()
    if (soundState === 'on') playAudioAction('restoreCommitted', restoreSceneIndex)
  }

  const startPreview = (index, pointerType) => {
    if (pointerType === 'touch') return
    if (wheelPreviewRef.current !== null) clearWheelState()
    setHoverIndex(index)
    currentSceneIndexRef.current = index
    onPreview?.(index)
    scheduleAudioPreview(index)
  }

  const commitScene = (index) => {
    clearWheelState()
    cancelAudioPreview()
    commitTimersRef.current.forEach(window.clearTimeout)
    commitTimersRef.current = []
    setHoverIndex(null)
    setFocusIndex(null)
    setLockedSceneIndex(index)
    currentSceneIndexRef.current = index
    onPreview?.(index)
    if (soundState !== 'on') {
      pendingCommitRef.current = null
      setArmState('parked')
      onCommit?.(index)
      return
    }

    pendingCommitRef.current = index
    setArmState('lifted')

    const seekTimer = window.setTimeout(() => setArmState('seeking'), COMMIT_LIFT_MS)
    const lowerTimer = window.setTimeout(() => setArmState('lowered'), COMMIT_LIFT_MS + COMMIT_SEEK_MS)
    const finishTimer = window.setTimeout(() => {
      if (pendingCommitRef.current !== index) return
      pendingCommitRef.current = null
      setArmState('lowered')
      onCommit?.(index)
      playAudioAction('commit', index)
    }, COMMIT_LIFT_MS + COMMIT_SEEK_MS + COMMIT_DROP_MS)
    commitTimersRef.current = [seekTimer, lowerTimer, finishTimer]
  }

  const toggleSound = async () => {
    if (soundState === 'on' || soundState === 'unlocking') {
      muteSound(220)
      return
    }

    const intent = ++unlockTokenRef.current
    setSoundState('unlocking')
    try {
      await audioRef.current?.unlockFromGesture()
      if (intent !== unlockTokenRef.current) {
        audioRef.current?.disable(100)
        return
      }
      const selectedIndex = currentSceneIndexRef.current
      setSoundState('on')
      setArmState('lowered')
      setLockedSceneIndex(selectedIndex)
      playAudioAction('commit', selectedIndex)
      onCommit?.(selectedIndex)
    } catch (error) {
      console.info('Sound Orbit audio is unavailable in this browser.', error)
      if (intent === unlockTokenRef.current) {
        audioRef.current?.disable(0)
        setSoundState('off')
        setArmState('parked')
        setAudioLoading(false)
        setAudioError('浏览器未能开启声音，请重试。')
      }
    }
  }

  const toggleRotation = () => {
    if (motionReduced) return
    const next = !rotationEnabled
    setRotationEnabled(next)
    onRotationChange?.(next, soundState !== 'off')
  }

  const handleWedgeKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      const next = wrapIndex(index + 1)
      wedgeRefs.current[next]?.focus()
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      const next = wrapIndex(index - 1)
      wedgeRefs.current[next]?.focus()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      commitScene(index)
    }
  }

  return (
    <section className="sound-orbit" aria-label="声音唱片与照片选择">
      <div
        className="sound-orbit-visual"
        ref={orbitSurfaceRef}
        onPointerLeave={finishWheelPreview}
      >
        <svg
          className="sound-orbit-disc"
          viewBox="0 0 310 180"
          role="group"
          aria-label="十张照片构成的唱片环；滚动或使用方向键预览，回车或空格确定"
        >
          <defs>
            <linearGradient id="sound-orbit-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fffdf0" />
              <stop offset=".38" stopColor="#9ca59d" />
              <stop offset=".68" stopColor="#e5e1cf" />
              <stop offset="1" stopColor="#777f79" />
            </linearGradient>
            {BUBBLE_SCENES.map((item, index) => (
              <clipPath id={`sound-orbit-clip-${item.id}`} key={item.id}>
                <path d={sectorPath(index)} />
              </clipPath>
            ))}
          </defs>
          <g className={'sound-orbit-record' + (rotationEnabled && !motionReduced ? ' is-rotating' : '') + (intentIndex !== null || wheelEngaged ? ' is-paused' : '')}>
          <g transform={`rotate(${wheelRotation} ${CX} ${CY})`}>
          <circle cx={CX} cy={CY} r="85" fill="rgba(7, 14, 12, .56)" stroke="rgba(240, 245, 231, .58)" strokeWidth="1.2" />
          {[78, 73, 68].map((radius) => <circle key={radius} cx={CX} cy={CY} r={radius} fill="none" stroke="rgba(245, 244, 225, .12)" strokeWidth=".7" />)}
          {BUBBLE_SCENES.map((item, index) => {
            const active = selectedIndex === index
            const centerAngle = -90 + (index + 0.5) * 36
            const offset = pointAt(active ? 2.4 : 0, centerAngle)
            const transform = active
              ? `translate(${offset.x - CX} ${offset.y - CY}) translate(${CX} ${CY}) scale(1.07) translate(-${CX} -${CY})`
              : undefined
            return (
              <g
                key={item.id}
                ref={(node) => { wedgeRefs.current[index] = node }}
                className={'sound-orbit-wedge' + (active ? ' is-active' : '') + (committedSceneIndex === index ? ' is-committed' : '')}
                role="button"
                tabIndex={0}
                aria-label={`选择照片 ${String(index + 1).padStart(2, '0')}：${item.name}`}
                aria-pressed={committedSceneIndex === index}
                transform={transform}
                onPointerEnter={(event) => startPreview(index, event.pointerType)}
                onPointerLeave={() => { if (hoverIndex === index) restorePreview() }}
                onFocus={() => {
                  setFocusIndex(index)
                  currentSceneIndexRef.current = index
                  onPreview?.(index)
                  scheduleAudioPreview(index)
                }}
                onBlur={() => { if (focusIndex === index && hoverIndex === null) restorePreview() }}
                onKeyDown={(event) => handleWedgeKeyDown(event, index)}
                onClick={() => commitScene(index)}
              >
                <image
                  href={item.image}
                  x="10"
                  y="12"
                  width="164"
                  height="164"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#sound-orbit-clip-${item.id})`}
                  className="sound-orbit-photo"
                />
                <path d={sectorPath(index)} className="sound-orbit-sector-outline" />
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r="34" fill="#20251e" stroke="rgba(242, 238, 216, .7)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r="29" fill="none" stroke="rgba(236, 225, 190, .18)" strokeWidth=".7" />
          <circle cx={CX} cy={CY} r="3.2" fill="#d1c6a0" />
          <text x={CX} y="88" textAnchor="middle" className="sound-orbit-label-main">MEMO</text>
          <text x={CX} y="101" textAnchor="middle" className="sound-orbit-label-small">GARDEN · 33⅓</text>
          </g>
          </g>
          <g className={'sound-orbit-tonearm is-' + armState} aria-hidden="true">
            <circle cx="242" cy="19" r="10" fill="rgba(12,18,17,.8)" stroke="rgba(232,238,224,.66)" strokeWidth="1.3" />
            <circle cx="242" cy="19" r="3.2" fill="#cbd2c8" />
            <path d="M242 19 L208 40 Q202 44 197 50 L169 75 Q164 79 162 85" fill="none" stroke="rgba(19,24,22,.8)" strokeWidth="5.3" strokeLinecap="round" />
            <path d="M242 19 L208 40 Q202 44 197 50 L169 75 Q164 79 162 85" fill="none" stroke="url(#sound-orbit-metal)" strokeWidth="2.3" strokeLinecap="round" />
            <path d="M162 85 L155 91 L163 95" fill="none" stroke="#d8d5c5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M158 92 L155 97" fill="none" stroke="#f3e8c9" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </svg>
        <div
          className={'sound-orbit-photo-card' + (photoCardVisible ? ' is-visible' : '')}
          aria-live="polite"
          aria-hidden={!photoCardVisible}
        >
          <img key={selectedIndex} src={BUBBLE_SCENES[selectedIndex].image} alt="" />
          <span>{String(selectedIndex + 1).padStart(2, '0')} / {String(BUBBLE_SCENES.length).padStart(2, '0')}</span>
          <strong>{BUBBLE_SCENES[selectedIndex].name}</strong>
          <small>声音 · {SOUND_ORBIT_TRACKS[BUBBLE_SCENES[selectedIndex].id].label}</small>
        </div>
      </div>
      <div className="sound-orbit-controls">
        <button
          className="sound-orbit-control"
          type="button"
          onClick={toggleRotation}
          disabled={motionReduced}
          aria-label={motionReduced ? '系统已启用减少动态效果，唱片保持静止' : rotationEnabled ? '暂停唱片旋转' : '开始唱片旋转'}
          aria-pressed={rotationEnabled && !motionReduced}
        >
          <span aria-hidden="true">{rotationEnabled && !motionReduced ? 'Ⅱ' : '↻'}</span>
          <span>{motionReduced ? '静止' : rotationEnabled ? '旋转中' : '旋转'}</span>
        </button>
        <button
          className={'sound-orbit-control sound-orbit-sound-control' + (soundState === 'on' ? ' is-on' : '')}
          type="button"
          onClick={toggleSound}
          aria-label={soundState === 'on' ? '关闭十种场景录音' : soundState === 'unlocking' ? '正在开启声音，点击取消' : '开启十种场景录音'}
          aria-pressed={soundState === 'on'}
        >
          <span aria-hidden="true">{soundState === 'on' ? '♫' : '♪'}</span>
          <span>{soundState === 'unlocking' ? '开启中' : soundState === 'on' ? '声音开' : '声音关'}</span>
        </button>
        <span className="sound-orbit-demo-note" role="status" aria-live="polite">
          {audioError || (audioLoading || soundState === 'unlocking'
            ? '正在载入这段声景…'
            : soundState === 'on'
              ? `正在试听：${SOUND_ORBIT_TRACKS[BUBBLE_SCENES[selectedIndex].id].label}`
              : '十段录音 · 悬停试听')}
        </span>
      </div>
    </section>
  )
}
