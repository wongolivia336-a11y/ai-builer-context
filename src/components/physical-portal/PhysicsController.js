export const PORTAL_FIXED_STEP = 1 / 240;
const MAX_FRAME_SECONDS = 0.05;
const MAX_STEPS_PER_FRAME = 12;

function defaultRequestFrame(callback) {
  if (typeof globalThis.requestAnimationFrame === 'function') return globalThis.requestAnimationFrame(callback);
  return globalThis.setTimeout(() => callback(performance.now()), 16);
}

function defaultCancelFrame(frameId) {
  if (typeof globalThis.cancelAnimationFrame === 'function') globalThis.cancelAnimationFrame(frameId);
  else globalThis.clearTimeout(frameId);
}

export class PhysicsController {
  constructor({
    physics,
    element = null,
    geometryProvider = () => undefined,
    onFrame = () => {},
    onPhaseChange = () => {},
    requestFrame = defaultRequestFrame,
    cancelFrame = defaultCancelFrame,
    documentTarget = typeof document === 'undefined' ? null : document,
    windowTarget = typeof window === 'undefined' ? null : window,
    ResizeObserverConstructor = globalThis.ResizeObserver,
  }) {
    this.physics = physics;
    this.element = element;
    this.geometryProvider = geometryProvider;
    this.onFrame = onFrame;
    this.onPhaseChange = onPhaseChange;
    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.documentTarget = documentTarget;
    this.windowTarget = windowTarget;
    this.ResizeObserverConstructor = ResizeObserverConstructor;
    this.accumulator = 0;
    this.lastTime = null;
    this.frameId = null;
    this.running = false;
    this.disposed = false;
    this.resizeObserver = null;
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onResize = this.resize.bind(this);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
  }

  advanceFrame(timestamp) {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      this.onFrame(this.physics, timestamp, 0);
      return 0;
    }

    const elapsed = Math.min(MAX_FRAME_SECONDS, Math.max(0, (timestamp - this.lastTime) / 1000));
    this.lastTime = timestamp;
    this.accumulator = Math.min(MAX_FRAME_SECONDS, this.accumulator + elapsed);

    let steps = 0;
    while (this.accumulator >= PORTAL_FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      const previousState = this.physics.state;
      this.physics.step(PORTAL_FIXED_STEP);
      this.accumulator -= PORTAL_FIXED_STEP;
      steps += 1;
      if (previousState !== this.physics.state) this.onPhaseChange(this.physics.state);
    }
    this.onFrame(this.physics, timestamp, steps);
    return steps;
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTime = null;
    this.accumulator = 0;
    this.documentTarget?.addEventListener?.('visibilitychange', this.onVisibilityChange);
    this.windowTarget?.addEventListener?.('resize', this.onResize);
    if (this.ResizeObserverConstructor && this.element) {
      try {
        this.resizeObserver = new this.ResizeObserverConstructor(this.onResize);
        this.resizeObserver.observe(this.element);
      } catch {
        this.resizeObserver = null;
      }
    }
    this.resize();
    if (this.documentTarget?.visibilityState !== 'hidden') this.scheduleFrame();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.frameId !== null) this.cancelFrame(this.frameId);
    this.frameId = null;
    this.lastTime = null;
    this.accumulator = 0;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.documentTarget?.removeEventListener?.('visibilitychange', this.onVisibilityChange);
    this.windowTarget?.removeEventListener?.('resize', this.onResize);
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.element = null;
  }

  resize() {
    if (!this.physics) return;
    const rect = this.element?.getBoundingClientRect?.();
    const width = Math.max(1, rect?.width || this.windowTarget?.innerWidth || this.physics.w);
    const height = Math.max(1, rect?.height || this.windowTarget?.innerHeight || this.physics.h);
    const geometry = this.geometryProvider(width, height);
    if (width !== this.physics.w || height !== this.physics.h) this.physics.resize(width, height, geometry);
    else this.physics.setGeometry?.(geometry);
  }

  onVisibilityChange() {
    if (this.documentTarget?.visibilityState === 'hidden') {
      if (this.frameId !== null) this.cancelFrame(this.frameId);
      this.frameId = null;
      this.lastTime = null;
      this.accumulator = 0;
      return;
    }
    if (this.running) {
      this.lastTime = null;
      this.scheduleFrame();
    }
  }

  onAnimationFrame(timestamp) {
    this.frameId = null;
    if (!this.running || this.documentTarget?.visibilityState === 'hidden') return;
    this.advanceFrame(timestamp);
    if (this.running) this.scheduleFrame();
  }

  scheduleFrame() {
    if (this.frameId !== null || !this.running) return;
    this.frameId = this.requestFrame(this.onAnimationFrame);
  }
}
