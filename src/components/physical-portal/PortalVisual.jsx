import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ImpactAudio } from './audio.js';
import { PhysicsController } from './PhysicsController.js';
import { clamp, PortalPhysics } from './physics.js';
import { PortalTransitionMachine } from './TransitionMachine.js';
import { getMakingOfGeometry } from '../making-of/galleryGeometry.js';
import './PortalVisual.css';

const BUBBLE_RADIUS = 32;

function getTriggerOrigin(width, height, suppliedOrigin) {
  if (suppliedOrigin) {
    return { x: suppliedOrigin.x, y: suppliedOrigin.y, radius: suppliedOrigin.radius || 32 };
  }

  const trigger = document.querySelector('[data-physical-portal-trigger]');
  const bubble = trigger?.querySelector('.zine-portal-bubble');
  if (bubble) {
    const bounds = bubble.getBoundingClientRect();
    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
      radius: bounds.width / 2,
    };
  }

  const narrow = width <= 760;
  const radius = width <= 360 ? 25 : narrow ? 28 : 31;
  const right = width <= 360 ? 12 : narrow ? 14 : 28;
  const top = narrow ? 54 : 90;
  return { x: width - right - radius, y: top + radius, radius };
}

function getGeometry(width, height, suppliedOrigin) {
  const gallery = getMakingOfGeometry(width, height);
  return {
    origin: getTriggerOrigin(width, height, suppliedOrigin),
    destination: { x: gallery.centerX, y: gallery.centerY, radius: gallery.radius },
  };
}

function isReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function describePhase(physics) {
  if (!physics) return 'idle';
  return physics.state;
}

const PhysicalPortal = forwardRef(function PhysicalPortal({
  homeSurfaceRef,
  makingOfSurfaceRef,
  onPhaseChange = () => {},
  onRequestExit = () => {},
}, ref) {
  const rootRef = useRef(null);
  const ballRef = useRef(null);
  const shadowRef = useRef(null);
  const physicsRef = useRef(null);
  const audioRef = useRef(null);
  const machineRef = useRef(null);
  const controllerRef = useRef(null);
  const phaseRef = useRef('idle');
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onRequestExitRef = useRef(onRequestExit);
  const impactIdRef = useRef(0);
  const [phase, setPhase] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [impacts, setImpacts] = useState([]);

  onPhaseChangeRef.current = onPhaseChange;
  onRequestExitRef.current = onRequestExit;

  const renderFrame = useCallback((physics) => {
    const root = rootRef.current;
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!root || !ball || !physics) return;

    const radius = BUBBLE_RADIUS * physics.scale;
    const floor = physics.h * 0.65;
    const heightAboveGround = Math.max(0, floor - physics.y - radius);

    if (physics.state === 'idle') {
      ball.style.opacity = '0';
      ball.style.visibility = 'hidden';
      if (shadow) shadow.style.opacity = '0';
      const home = homeSurfaceRef?.current;
      const makingOf = makingOfSurfaceRef?.current;
      if (home) {
        home.style.opacity = '';
        home.style.filter = '';
        home.style.transform = '';
        home.style.pointerEvents = '';
        home.inert = false;
        const trigger = home.querySelector('[data-physical-portal-trigger]');
        if (trigger) {
          trigger.style.opacity = '';
          trigger.style.pointerEvents = '';
        }
      }
      if (makingOf) {
        makingOf.style.opacity = '';
        makingOf.style.pointerEvents = '';
        makingOf.inert = false;
      }
      return;
    }

    const homeOpacity = 1 - clamp(physics.fade);
    const pageOpacity = clamp(physics.reveal);
    let ballOpacity = 0;

    if (physics.state === 'launch') ballOpacity = 1;
    else if (physics.state === 'expand') ballOpacity = 1 - pageOpacity;
    else if (physics.state === 'exit') ballOpacity = physics.exitFade > 0
      ? clamp(physics.fade / physics.exitFade)
      : 0;

    ball.style.transform = `translate3d(${physics.x - BUBBLE_RADIUS}px, ${physics.y - BUBBLE_RADIUS}px, 0) scale(${physics.scale * (1 + physics.squash)}, ${physics.scale * (1 - physics.squash)})`;
    ball.style.opacity = String(ballOpacity);
    ball.style.visibility = ballOpacity > 0.001 ? 'visible' : 'hidden';

    if (shadow) {
      shadow.style.width = `${radius * 1.7}px`;
      shadow.style.marginLeft = `${-radius * 0.85}px`;
      shadow.style.transform = `translate3d(${physics.x}px, ${floor + 3}px, 0) scale(${0.9 + heightAboveGround * 0.002}, 1)`;
      shadow.style.opacity = String(clamp((1 - pageOpacity) * 0.32 / (1 + heightAboveGround * 0.012)));
      shadow.style.filter = `blur(${4 + heightAboveGround * 0.045}px)`;
    }

    const home = homeSurfaceRef?.current;
    if (home) {
      home.style.opacity = String(homeOpacity);
      home.style.filter = `blur(${clamp(physics.fade) * 5}px)`;
      home.style.transform = `scale(${1 - clamp(physics.fade) * 0.025})`;
      home.style.pointerEvents = physics.state === 'idle' ? '' : 'none';
      home.inert = physics.state !== 'idle';
      const trigger = home.querySelector('[data-physical-portal-trigger]');
      if (trigger) {
        trigger.style.opacity = physics.state === 'exit' ? String(1 - ballOpacity) : '0';
        trigger.style.pointerEvents = physics.state === 'idle' ? '' : 'none';
      }
    }

    const makingOf = makingOfSurfaceRef?.current;
    if (makingOf) {
      makingOf.style.opacity = String(pageOpacity);
      makingOf.style.pointerEvents = phaseRef.current === 'inside' ? 'auto' : 'none';
      makingOf.inert = phaseRef.current !== 'inside';
    }

    root.dataset.physicsState = describePhase(physics);
  }, [homeSurfaceRef, makingOfSurfaceRef]);

  useEffect(() => {
    const audio = new ImpactAudio();
    audio.enabled = true;
    audioRef.current = audio;

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const physics = new PortalPhysics(
      initialWidth,
      initialHeight,
      (speed, x, material) => {
        try {
          audio.play(speed, (x / physics.w - 0.5) * 2, material);
        } catch {
          // Sound failure must not interfere with the collision or route transition.
        }
        const event = {
          id: impactIdRef.current += 1,
          x,
          y: physics.h * 0.65,
          strength: clamp(speed / 600),
        };
        setImpacts((current) => [...current.slice(-3), event]);
      },
      getGeometry(initialWidth, initialHeight, null),
    );
    physicsRef.current = physics;

    let controller;
    const machine = new PortalTransitionMachine((nextPhase) => {
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
      onPhaseChangeRef.current(nextPhase);
      if (nextPhase === 'inside' || nextPhase === 'idle') controller?.stop();
      if (nextPhase === 'idle') {
        const home = homeSurfaceRef?.current;
        const makingOf = makingOfSurfaceRef?.current;
        if (home) {
          home.style.opacity = '';
          home.style.filter = '';
          home.style.transform = '';
          home.style.pointerEvents = '';
          home.inert = false;
          const trigger = home.querySelector('[data-physical-portal-trigger]');
          if (trigger) {
            trigger.style.opacity = '';
            trigger.style.pointerEvents = '';
          }
        }
        if (makingOf) {
          makingOf.style.opacity = '';
          makingOf.style.pointerEvents = '';
          makingOf.inert = false;
        }
        setImpacts([]);
      }
    });
    machineRef.current = machine;

    controller = new PhysicsController({
      physics,
      element: rootRef.current,
      geometryProvider: (width, height) => getGeometry(width, height, null),
      onFrame: renderFrame,
      onPhaseChange: (nextPhysicsState) => {
        if (nextPhysicsState === 'idle') machine.finishExit();
        else machine.advance(nextPhysicsState);
      },
    });
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      audio.dispose();
      controllerRef.current = null;
      physicsRef.current = null;
      machineRef.current = null;
      audioRef.current = null;
      const home = homeSurfaceRef?.current;
      const makingOf = makingOfSurfaceRef?.current;
      if (home) {
        home.style.opacity = '';
        home.style.filter = '';
        home.style.transform = '';
        home.style.pointerEvents = '';
        home.inert = false;
      }
      if (makingOf) {
        makingOf.style.opacity = '';
        makingOf.style.pointerEvents = '';
        makingOf.inert = false;
      }
    };
  }, [homeSurfaceRef, makingOfSurfaceRef, renderFrame]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.enabled = !muted;
  }, [muted]);

  useEffect(() => {
    if (phase === 'idle') return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || phase === 'exit') return;
      event.preventDefault();
      event.stopPropagation();
      onRequestExitRef.current();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [phase]);

  useImperativeHandle(ref, () => ({
    enter({ origin } = {}) {
      const physics = physicsRef.current;
      const machine = machineRef.current;
      const controller = controllerRef.current;
      const audio = audioRef.current;
      if (!physics || !machine || !controller || machine.phase !== 'idle') return false;

      const reduced = isReducedMotion();
      const geometry = getGeometry(window.innerWidth, window.innerHeight, origin);
      physics.setGeometry(geometry);
      if (!machine.startEntry(reduced)) return false;
      if (!physics.launch(reduced)) {
        machine.advance('idle');
        return false;
      }
      if (!reduced) {
        void audio?.unlock();
        controller.start();
      }
      renderFrame(physics);
      return true;
    },
    exit() {
      const physics = physicsRef.current;
      const machine = machineRef.current;
      const controller = controllerRef.current;
      if (!physics || !machine || !controller || machine.phase === 'idle' || machine.phase === 'exit') return false;

      const reduced = isReducedMotion();
      controller.resize();
      if (!machine.startExit(reduced)) return false;
      if (!physics.exit(reduced)) {
        if (machine.phase === 'exit') machine.resumeInside();
        return false;
      }
      if (!reduced) {
        controller.start();
        renderFrame(physics);
      }
      return true;
    },
    resumeInside() {
      const physics = physicsRef.current;
      const machine = machineRef.current;
      if (!physics || !machine || machine.phase !== 'exit') return false;
      physics.finishInside();
      const resumed = machine.resumeInside();
      if (resumed) renderFrame(physics);
      return resumed;
    },
    refreshGeometry() {
      controllerRef.current?.resize();
    },
    syncSurfaceState() {
      renderFrame(physicsRef.current);
    },
    getPhase() {
      return machineRef.current?.phase || 'idle';
    },
  }), [renderFrame]);

  const toggleMuted = () => {
    setMuted((current) => {
      const next = !current;
      if (audioRef.current) audioRef.current.enabled = !next;
      return next;
    });
  };

  return (
    <div ref={rootRef} className="physical-portal" data-phase={phase} aria-label="物理星球转场">
      <div ref={shadowRef} className="physical-portal-shadow" aria-hidden="true" />
      {impacts.map((impact) => (
        <span
          className="physical-portal-impact"
          key={impact.id}
          aria-hidden="true"
          onAnimationEnd={() => setImpacts((current) => current.filter((item) => item.id !== impact.id))}
          style={{
            left: impact.x,
            top: impact.y,
            '--impact-strength': impact.strength,
          }}
        />
      ))}
      <div ref={ballRef} className="physical-portal-ball" aria-hidden="true">
        <i className="physical-portal-ball-glint" />
        <i className="physical-portal-ball-core" />
      </div>
      <button
        className="physical-portal-mute"
        type="button"
        aria-label={muted ? '开启触地声' : '静音触地声'}
        aria-pressed={muted}
        onClick={toggleMuted}
        hidden={phase !== 'launch' && phase !== 'expand'}
      >
        <span aria-hidden="true">{muted ? '◖' : '♫'}</span>
        <span>{muted ? '声音已静音' : '触地声'}</span>
      </button>
    </div>
  );
});

export default PhysicalPortal;
