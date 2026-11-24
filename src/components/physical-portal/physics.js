export const presets = {
  soft: { e: 0.62, offset: 0, modes: [[175, 1], [485, 0.27], [1040, 0.09]], decay: 0.12 },
  glass: { e: 0.69, offset: 0.11, modes: [[850, 1], [2140, 0.22], [3370, 0.09]], decay: 0.19 },
  rubber: { e: 0.52, offset: -0.18, modes: [[115, 1], [260, 0.21]], decay: 0.07 },
};

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const DEFAULT_ORIGIN = (width) => ({ x: width - 52, y: 55 });
const originScale = (origin) => (origin.radius || 32) / 32;
const DEFAULT_DESTINATION = (width, height) => ({
  x: width / 2,
  y: height * 0.41,
  radius: Math.min(width * 0.28, height * 0.28),
});

export class PortalPhysics {
  constructor(width, height, onImpact = () => {}, geometry = {}) {
    this.w = width;
    this.h = height;
    this.onImpact = onImpact;
    this.material = 'soft';
    this.e = 0.62;
    this.damping = 0.85;
    this.state = 'idle';
    this.origin = geometry.origin || DEFAULT_ORIGIN(width);
    this.destination = geometry.destination || DEFAULT_DESTINATION(width, height);
    this.x = this.origin.x;
    this.y = this.origin.y;
    this.vx = 0;
    this.vy = 0;
    this.scale = 1;
    this.squash = 0;
    this.sv = 0;
    this.t = 0;
    this.reveal = 0;
    this.impacts = 0;
    this.grounded = false;
    this.exitFade = 0;
  }

  setGeometry({ origin, destination } = {}) {
    if (origin) this.origin = origin;
    if (destination) this.destination = destination;

    if (this.state === 'idle') {
      this.x = this.origin.x;
      this.y = this.origin.y;
    } else if (this.state === 'inside') {
      this.x = this.destination.x;
      this.y = this.destination.y;
      this.scale = this.destination.radius / 32;
    }
  }

  resize(width, height, geometry) {
    const scaleX = width / this.w || 1;
    const scaleY = height / this.h || 1;
    this.x *= scaleX;
    this.y *= scaleY;
    if (this.from) {
      this.from.x *= scaleX;
      this.from.y *= scaleY;
    }
    this.w = width;
    this.h = height;
    this.setGeometry(geometry || {
      origin: DEFAULT_ORIGIN(width),
      destination: DEFAULT_DESTINATION(width, height),
    });
  }

  launch(reduced = false) {
    if (this.state !== 'idle') return false;
    this.state = reduced ? 'inside' : 'launch';
    this.x = this.origin.x;
    this.y = this.origin.y;
    this.vx = -(this.origin.x - this.destination.x) * 1.7;
    this.vy = -55;
    this.scale = originScale(this.origin);
    this.squash = 0.09;
    this.sv = 0;
    this.t = 0;
    this.impacts = 0;
    this.reveal = reduced ? 1 : 0;
    this.grounded = false;
    this.exitFade = 0;
    if (reduced) this.step(0);
    return true;
  }

  exit(reduced = false) {
    if (!['launch', 'expand', 'inside'].includes(this.state)) return false;
    this.exitFade = this.fade;
    this.from = { x: this.x, y: this.y, scale: this.scale, reveal: this.reveal };
    this.state = reduced ? 'idle' : 'exit';
    this.t = 0;
    if (reduced) {
      this.reveal = 0;
      this.step(0);
      this.from = null;
      this.exitFade = 0;
    }
    return true;
  }

  finishInside() {
    this.state = 'inside';
    this.t = 0;
    this.x = this.destination.x;
    this.y = this.destination.y;
    this.scale = this.destination.radius / 32;
    this.reveal = 1;
    this.vx = 0;
    this.vy = 0;
    this.squash = 0;
    this.sv = 0;
    this.from = null;
  }

  step(dt) {
    const p = this;
    const w = p.w;
    const h = p.h;
    const radius = 32;
    const floor = h * 0.65;

    p.sv += (-520 * p.squash - 22 * p.sv) * dt;
    p.squash += p.sv * dt;
    p.t += dt;

    if (p.state === 'launch') {
      p.vx += (38 * (p.destination.x - p.x) - 9.7 * p.vx) * dt;
      p.x += p.vx * dt;
      if (!p.grounded) {
        p.vy += 1550 * dt;
        p.vy *= Math.exp(-p.damping * dt);
        p.y += p.vy * dt;
        if (p.y + radius >= floor && p.vy > 0) {
          p.y = floor - radius;
          const speed = p.vy;
          if (speed > 38) {
            p.impacts += 1;
            p.squash = clamp(speed / 3500, 0, 0.14);
            p.sv = 0;
            try {
              p.onImpact(speed, p.x, p.material);
            } catch {
              // A failed visual or audio callback must not stop the physical transition.
            }
            p.vy = -speed * clamp(p.e + presets[p.material].offset, 0.15, 0.88);
            p.vx *= 0.83;
          } else {
            p.vy = 0;
            p.grounded = true;
          }
        }
      }
      if ((p.grounded && Math.abs(p.vx) < 25) || p.t > 3.2) {
        p.from = { x: p.x, y: p.y, scale: p.scale, reveal: p.reveal };
        p.state = 'expand';
        p.t = 0;
      }
    } else if (p.state === 'expand') {
      const q = smooth(p.t / 0.65);
      p.x = p.from.x + (p.destination.x - p.from.x) * q;
      p.y = p.from.y + (p.destination.y - p.from.y) * q;
      p.scale = p.from.scale + (p.destination.radius / radius - p.from.scale) * q;
      p.reveal = smooth((p.t - 0.14) / 0.51);
      if (p.t >= 0.65) {
        p.state = 'inside';
        p.t = 0;
        p.x = p.destination.x;
        p.y = p.destination.y;
        p.scale = p.destination.radius / radius;
        p.reveal = 1;
      }
    } else if (p.state === 'exit') {
      const q = smooth(p.t / 0.85);
      p.x = p.from.x + (p.origin.x - p.from.x) * q;
      p.y = p.from.y + (p.origin.y - p.from.y) * q;
      const targetScale = originScale(p.origin);
      p.scale = p.from.scale + (targetScale - p.from.scale) * q;
      p.reveal = p.from.reveal * (1 - q);
      if (p.t >= 0.85) {
        p.state = 'idle';
        p.t = 0;
        p.impacts = 0;
        p.vy = 0;
        p.squash = 0;
        p.scale = targetScale;
        p.reveal = 0;
        p.exitFade = 0;
        p.from = null;
        p.x = p.origin.x;
        p.y = p.origin.y;
      }
    } else if (p.state === 'idle') {
      p.x = p.origin.x;
      p.y = p.origin.y + Math.sin(p.t * 2.1) * 2.8;
      p.scale = originScale(p.origin);
      p.reveal = 0;
      p.vy = 0;
    } else if (p.state === 'inside') {
      p.x = p.destination.x;
      p.y = p.destination.y;
      p.scale = p.destination.radius / radius;
      p.reveal = 1;
      p.vy = 0;
    }
  }

  get fade() {
    if (this.state === 'idle') return 0;
    if (this.state === 'launch') return smooth(this.t / 0.8) * 0.61;
    if (this.state === 'exit') return this.exitFade * (1 - smooth(this.t / 0.85));
    return 0.61 + this.reveal * 0.39;
  }
}
