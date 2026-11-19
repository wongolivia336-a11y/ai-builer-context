import { useEffect, useRef } from 'react';
import * as brush from '../vendor/p5-brush/brush.esm.js';

const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 24;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function waterPolygon(progress, time) {
  const edge = CANVAS_WIDTH * progress;
  const points = [[0, 0], [Math.max(0, edge - 2), 0]];
  for (let y = 0; y <= CANVAS_HEIGHT; y += 2.5) {
    const ripple = Math.sin(y * 0.42 + time * 2.2) * 1.25 + Math.sin(y * 0.83 - time * 1.35) * 0.55;
    points.push([clamp(edge + ripple, 0, CANVAS_WIDTH), y]);
  }
  points.push([Math.max(0, edge - 2), CANVAS_HEIGHT], [0, CANVAS_HEIGHT]);
  return points;
}

function drawFallback(context, progress, time) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.save();
  context.beginPath();
  context.roundRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_HEIGHT / 2);
  context.clip();
  const edge = CANVAS_WIDTH * progress;
  const gradient = context.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, 'rgba(174, 248, 231, .94)');
  gradient.addColorStop(.54, 'rgba(193, 232, 250, .88)');
  gradient.addColorStop(1, 'rgba(232, 198, 237, .84)');
  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(Math.max(0, edge - 2), 0);
  for (let y = 0; y <= CANVAS_HEIGHT; y += 2) {
    const ripple = Math.sin(y * .42 + time * 2.2) * 1.25 + Math.sin(y * .83 - time * 1.35) * .55;
    context.lineTo(clamp(edge + ripple, 0, CANVAS_WIDTH), y);
  }
  context.lineTo(Math.max(0, edge - 2), CANVAS_HEIGHT);
  context.lineTo(0, CANVAS_HEIGHT);
  context.closePath();
  context.fill();
  context.restore();
}

export default function CapsuleWaterProgress({ progress }) {
  const hostRef = useRef(null);
  const progressRef = useRef(progress);
  progressRef.current = clamp(progress);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let canvas = null;
    let context2d = null;
    let useP5Brush = false;
    let frame = 0;
    let lastPaint = 0;

    const useCanvasFallback = () => {
      const previousCanvas = canvas;
      const previousGl = previousCanvas?.getContext('webgl2');
      previousGl?.getExtension('WEBGL_lose_context')?.loseContext();
      previousCanvas?.remove();
      useP5Brush = false;
      canvas = document.createElement('canvas');
      canvas.className = 'entry-water-canvas';
      canvas.width = CANVAS_WIDTH * 2;
      canvas.height = CANVAS_HEIGHT * 2;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      context2d = canvas.getContext('2d');
      context2d?.setTransform(2, 0, 0, 2, 0, 0);
      host.replaceChildren(canvas);
      host.dataset.renderer = 'canvas-fallback';
    };

    if ('WebGL2RenderingContext' in window) {
      try {
        canvas = brush.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, { parent: host, pixelDensity: 1 });
        canvas.classList.add('entry-water-canvas');
        useP5Brush = true;
        host.dataset.renderer = 'p5-brush';
      } catch {
        useCanvasFallback();
      }
    } else {
      useCanvasFallback();
    }

    const startedAt = performance.now();
    const paint = (timestamp) => {
      if (timestamp - lastPaint > 36) {
        lastPaint = timestamp;
        const progressValue = progressRef.current;
        const time = (timestamp - startedAt) / 1000;
        if (useP5Brush && canvas) {
          try {
            brush.load(canvas);
            brush.seed(241);
            brush.noiseSeed(241);
            brush.clear();
            brush.push();
            brush.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
            if (progressValue > .005) {
              brush.noStroke();
              brush.noHatch();
              brush.fillTexture(.1, .14, false, .08);
              brush.fillBleed(.035, 'in', 0, .55);
              brush.fill('#a8eee4', 210);
              brush.polygon(waterPolygon(progressValue, time));
              const glint = waterPolygon(progressValue, time).slice(1, -2).map(([x, y]) => [x - .8, y, .7]);
              brush.noFill();
              brush.set('HB', '#effffc', .42);
              brush.spline(glint, .38);
            }
            brush.pop();
            brush.render();
          } catch {
            useCanvasFallback();
            if (context2d) drawFallback(context2d, progressValue, time);
          }
        } else if (context2d) {
          drawFallback(context2d, progressValue, time);
        }
      }
      frame = window.requestAnimationFrame(paint);
    };
    frame = window.requestAnimationFrame(paint);

    return () => {
      window.cancelAnimationFrame(frame);
      if (canvas) {
        const gl = useP5Brush ? canvas.getContext('webgl2') : null;
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        canvas.remove();
      }
      delete host.dataset.renderer;
    };
  }, []);

  const fill = clamp(progress);
  return (
    <div ref={hostRef} className="entry-progress" role="progressbar" aria-label="泡泡水注入进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(fill * 100)}>
      <span className="entry-water-highlight" style={{ width: String(Math.max(0, fill * 100 - 5)) + '%' }} />
      <span className={'entry-water-pearl pearl-one' + (fill > .24 ? ' is-visible' : '')} style={{ left: String(Math.max(7, fill * 61)) + '%' }} />
      <span className={'entry-water-pearl pearl-two' + (fill > .48 ? ' is-visible' : '')} style={{ left: String(Math.max(12, fill * 79)) + '%' }} />
    </div>
  );
}
