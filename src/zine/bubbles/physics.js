import { SETTINGS } from './config.js';

/**
 * Original, zero-dependency 2D bubble choreography.
 * This is a visually motivated approximation, NOT a fluid solver or precise soft-body simulation.
 * Uses per-bubble masses, slow upward buoyancy, wind, circle collisions and spring-like squash.
 */
const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const seed = n => (Math.sin(n * 127.1 + 11.7) * 43758.5453) % 1;
const rand = n => Math.abs(seed(n));
const DESKTOP_RADIUS_BANDS = [.050, .092, .064, .11, .046, .081, .125, .044, .096, .058, .115, .072, .10, .054];
const bubbleRadius = (width, height, index) => {
  const base = Math.min(width, height);
  return width < 680
    ? clamp(base * (0.049 + rand(index + 3) * 0.042), 26, 53)
      : clamp(base * (DESKTOP_RADIUS_BANDS[index % DESKTOP_RADIUS_BANDS.length] + rand(index + 101) * .01), 28, 112);
};

export class BubbleWorld {
  constructor(width, height, count = SETTINGS.desktopBubbleCount) {
    this.width = width;
    this.height = height;
    this.pointer = { x: -1000, y: -1000, active: false, down: false, lastX: 0, lastY: 0, vx: 0, vy: 0 };
    this.grab = null;
    this.time = 0;
    this.motion = true;
    this.bubbles = [];
    this.setCount(count);
  }

  setCount(count) {
    if (this.bubbles.length > count) this.bubbles.length = count;
    while (this.bubbles.length < count) {
      const i = this.bubbles.length;
      const r = bubbleRadius(this.width, this.height, i);
      this.bubbles.push({
        id: i, type: i % 5, r,
        x: this.width * (.13 + .73 * rand(i + 17)),
        y: this.height * (.24 + .60 * rand(i + 41)),
        vx: (rand(i + 21) - .5) * 54, vy: (rand(i + 12) - .5) * 42,
        squash: 0, bendX: 0, bendY: 0, phase: rand(i + 80) * TAU,
        mass: Math.max(.5, r / 47),
      });
    }
  }

  resize(width, height) {
    const sx = width / this.width, sy = height / this.height;
    const crossedLayoutBreakpoint = (this.width < 680) !== (width < 680);
    for (const b of this.bubbles) {
      if (crossedLayoutBreakpoint) {
        b.r = bubbleRadius(width, height, b.id);
        b.mass = Math.max(.5, b.r / 47);
      }
      b.x = clamp(b.x * sx, b.r, width - b.r);
      b.y = clamp(b.y * sy, b.r, height - b.r);
    }
    this.width = width;
    this.height = height;
    this.setCount(width < 680 ? SETTINGS.mobileBubbleCount : SETTINGS.desktopBubbleCount);
  }

  movePointer(x, y) {
    const p = this.pointer;
    p.vx = (x - p.lastX) * .3 + p.vx * .7;
    p.vy = (y - p.lastY) * .3 + p.vy * .7;
    p.x = p.lastX = x;
    p.y = p.lastY = y;
    p.active = true;
  }
  leavePointer() { this.pointer.active = false; }

  pointerDown(x, y) {
    this.movePointer(x, y);
    const b = [...this.bubbles].reverse().find(b => Math.hypot(b.x - x, b.y - y) < b.r * .88);
    if (!b) return false;
    this.grab = { body: b, offX: b.x - x, offY: b.y - y };
    this.pointer.down = true;
    return true;
  }
  pointerUp() {
    if (this.grab) {
      const b = this.grab.body;
      b.vx = clamp(this.pointer.vx * 15, -175, 175);
      b.vy = clamp(this.pointer.vy * 15, -175, 175);
      b.squash = Math.max(b.squash, .12);
    }
    this.grab = null;
    this.pointer.down = false;
  }

  step(dt) {
    if (!this.motion) return;
    const step = clamp(dt, 0, 1 / 30);
    const p = this.pointer;
    this.time += step;
    for (const b of this.bubbles) {
      const wind = Math.sin(this.time * .37 + b.phase) * 14 + Math.cos(this.time * .19 + b.phase * 2) * 8;
      if (this.grab?.body === b) {
        const tx = clamp(p.x + this.grab.offX, b.r, this.width - b.r);
        const ty = clamp(p.y + this.grab.offY, b.r, this.height - b.r);
        b.bendX = (tx - b.x) * .12;
        b.bendY = (ty - b.y) * .12;
        b.vx = (tx - b.x) * 19;
        b.vy = (ty - b.y) * 19;
        b.x += (tx - b.x) * Math.min(1, step * 22);
        b.y += (ty - b.y) * Math.min(1, step * 22);
        b.squash = clamp(Math.hypot(b.bendX, b.bendY) / 100, .04, .21);
        continue;
      }
      const forceY = -10.0 / b.mass + Math.sin(this.time * .51 + b.phase) * 3.2;
      b.vx += wind * step;
      b.vy += forceY * step;
      if (p.active && !p.down) {
        const dx = b.x - p.x, dy = b.y - p.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const range = b.r + 102;
        if (dist < range) {
          const k = ((range - dist) / range) ** 2 * 145;
          b.vx += dx / dist * k * step;
          b.vy += dy / dist * k * step;
          b.bendX += dx / dist * k * step * .12;
          b.bendY += dy / dist * k * step * .12;
        }
      }
      const drag = Math.exp(-.26 * step);
      b.vx *= drag;
      b.vy *= drag;
      b.x += b.vx * step;
      b.y += b.vy * step;
      const edge = b.r * .93;
      if (b.x < edge) this.bounceWall(b, 'x', edge, 1);
      if (b.x > this.width - edge) this.bounceWall(b, 'x', this.width - edge, -1);
      if (b.y < edge) this.bounceWall(b, 'y', edge, 1);
      if (b.y > this.height - edge) this.bounceWall(b, 'y', this.height - edge, -1);
      b.squash *= Math.exp(-5.5 * step);
      b.bendX *= Math.exp(-7 * step);
      b.bendY *= Math.exp(-7 * step);
      if (Math.abs(b.vx) > 180) b.vx = Math.sign(b.vx) * 180;
      if (Math.abs(b.vy) > 180) b.vy = Math.sign(b.vy) * 180;
    }
    // Pairwise lightweight collision; normals approximate circles even for jelly silhouettes.
    for (let i = 0; i < this.bubbles.length; i++) for (let j = i + 1; j < this.bubbles.length; j++) {
      const a = this.bubbles[i], b = this.bubbles[j];
      if (this.grab?.body === a || this.grab?.body === b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.max(.01, Math.hypot(dx, dy));
      const minDistance = (a.r + b.r) * .83;
      if (distance >= minDistance) continue;
      const nx = dx / distance, ny = dy / distance;
      const overlap = minDistance - distance;
      a.x -= nx * overlap * .5; a.y -= ny * overlap * .5;
      b.x += nx * overlap * .5; b.y += ny * overlap * .5;
      const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (closing < 0) {
        const impulse = -closing * .56;
        a.vx -= nx * impulse; a.vy -= ny * impulse;
        b.vx += nx * impulse; b.vy += ny * impulse;
      }
      a.squash = Math.max(a.squash, clamp(overlap / (a.r * 2), 0, .22));
      b.squash = Math.max(b.squash, clamp(overlap / (b.r * 2), 0, .22));
    }
  }

  bounceWall(b, axis, position, inward) {
    b[axis] = position;
    const vAxis = axis === 'x' ? 'vx' : 'vy';
    const towardWall = b[vAxis] * inward < 0;
    if (towardWall) b[vAxis] = -b[vAxis] * .72;
    b.squash = Math.max(b.squash, clamp(Math.abs(b[vAxis]) / 280 + .06, .07, .24));
    if (axis === 'x') b.bendX = inward * b.r * .08;
    else b.bendY = inward * b.r * .08;
  }
}
