import { useEffect, useId } from 'react';

const REST_LIFT = 0.08;
const CORNERS = [
  { name: 'top-left', x: 0, y: 0 },
  { name: 'top-right', x: 1, y: 0 },
  { name: 'bottom-left', x: 0, y: 1 },
  { name: 'bottom-right', x: 1, y: 1 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Interaction references: Nodlik/StPageFlip and javocsoft/grabfold (MIT).
// This local spring-peek adapts their corner-hover and fold-lighting ideas without vendoring code or adding a runtime dependency.
export default function PaperCornerCurl({ targetRef }) {
  const id = useId().replaceAll(':', '');

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    const states = CORNERS.map(() => ({ value: REST_LIFT, velocity: 0, target: REST_LIFT }));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let previousTime = 0;

    const paintCorner = (corner, state) => {
      const { name, x, y } = corner;
      const lift = state.value;
      target.style.setProperty(`--curl-size-${name}`, `${22 + lift * 34}px`);
      target.style.setProperty(`--curl-opacity-${name}`, `${0.4 + lift * 0.58}`);
      target.style.setProperty(`--curl-rotate-x-${name}`, `${(y === 0 ? 1 : -1) * (1.5 + lift * 16)}deg`);
      target.style.setProperty(`--curl-rotate-y-${name}`, `${(x === 0 ? -1 : 1) * (1.5 + lift * 17)}deg`);
      target.style.setProperty(`--curl-shift-x-${name}`, `${(x === 0 ? 1 : -1) * lift * 4}px`);
      target.style.setProperty(`--curl-shift-y-${name}`, `${(y === 0 ? 1 : -1) * lift * 4}px`);
      target.style.setProperty(`--curl-depth-${name}`, `${lift * 8}px`);
      target.style.setProperty(`--curl-shadow-${name}`, `${1 + lift * 5}px`);
    };

    states.forEach((state, index) => paintCorner(CORNERS[index], state));

    const animate = (time) => {
      const dt = Math.min(0.04, Math.max(0.001, (time - (previousTime || time)) / 1000));
      previousTime = time;
      let moving = false;

      states.forEach((state, index) => {
        if (reducedMotion.matches) {
          state.value = state.target;
          state.velocity = 0;
        } else {
          const acceleration = (state.target - state.value) * 180 - state.velocity * 24;
          state.velocity += acceleration * dt;
          state.value += state.velocity * dt;
          if (Math.abs(state.target - state.value) < 0.001 && Math.abs(state.velocity) < 0.01) {
            state.value = state.target;
            state.velocity = 0;
          } else {
            moving = true;
          }
        }
        paintCorner(CORNERS[index], state);
      });

      if (moving) animationFrame = window.requestAnimationFrame(animate);
      else animationFrame = 0;
    };

    const schedule = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
    };

    const setRestTargets = () => {
      states.forEach((state) => { state.target = REST_LIFT; });
      schedule();
    };

    const onPointerMove = (event) => {
      if (event.pointerType === 'touch' || event.buttons > 0) return;
      const rect = target.getBoundingClientRect();
      const threshold = Math.max(68, Math.min(142, Math.min(rect.width, rect.height) * 0.24));

      CORNERS.forEach((corner, index) => {
        const cornerX = corner.x === 0 ? rect.left : rect.right;
        const cornerY = corner.y === 0 ? rect.top : rect.bottom;
        const distance = Math.hypot(event.clientX - cornerX, event.clientY - cornerY);
        const proximity = clamp(1 - distance / threshold, 0, 1);
        states[index].target = REST_LIFT + proximity * proximity * 0.82;
      });
      schedule();
    };

    target.addEventListener('pointermove', onPointerMove, { passive: true });
    target.addEventListener('pointerleave', setRestTargets, { passive: true });

    return () => {
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerleave', setRestTargets);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      CORNERS.forEach(({ name }) => {
        [
          `--curl-size-${name}`,
          `--curl-opacity-${name}`,
          `--curl-rotate-x-${name}`,
          `--curl-rotate-y-${name}`,
          `--curl-shift-x-${name}`,
          `--curl-shift-y-${name}`,
          `--curl-depth-${name}`,
          `--curl-shadow-${name}`,
        ].forEach((property) => target.style.removeProperty(property));
      });
    };
  }, [targetRef]);

  return (
    <div className="making-of-paper-curl-layer" aria-hidden="true">
      {CORNERS.map(({ name }) => (
        <span className="making-of-paper-curl" data-corner={name} key={name}>
          <svg className="making-of-paper-curl-shape" viewBox="0 0 76 76" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id={`${id}-${name}-paper`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fffdf3" />
                <stop offset=".35" stopColor="#f9f1dc" />
                <stop offset=".58" stopColor="#cdbd9b" />
                <stop offset=".73" stopColor="#eee4cd" />
                <stop offset="1" stopColor="#fffaf0" />
              </linearGradient>
              <linearGradient id={`${id}-${name}-crease`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity=".86" />
                <stop offset="1" stopColor="#816f51" stopOpacity=".34" />
              </linearGradient>
            </defs>
            <path d="M2 2 C23 4 51 27 74 74 C57 68 39 58 29 43 C23 25 10 11 2 2Z" fill={`url(#${id}-${name}-paper)`} />
            <path d="M4 4 C22 10 46 34 70 70" fill="none" stroke={`url(#${id}-${name}-crease)`} strokeWidth="1.6" />
            <path d="M9 7 C24 14 42 31 56 49" fill="none" stroke="#fffdf6" strokeOpacity=".52" strokeWidth="1.1" />
          </svg>
        </span>
      ))}
    </div>
  );
}
