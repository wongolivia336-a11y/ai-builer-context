import { FRAGMENT, VERTEX } from './shaders.js';
import { SETTINGS } from './config.js';

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('WebGL shader compile failed: ' + error);
  }
  return shader;
}
function createProgram(gl) {
  const p = gl.createProgram();
  const v = compile(gl, gl.VERTEX_SHADER, VERTEX), f = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
function solidTexture(gl, color = [204, 229, 244, 255]) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
export class BubbleRenderer {
  constructor(canvas, scenes) {
    this.canvas = canvas;
    this.destroyed = false;
    this.gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!this.gl) throw new Error('WebGL2 is unavailable.');
    const gl = this.gl;
    this.program = createProgram(gl);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const vbo = gl.createBuffer(); this.vbo = vbo;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.locations = {};
    for (const n of ['uImageA','uImageB','uSizeA','uSizeB','uResolution','uBlend','uTime','uBubbleCount','uBubbles[0]','uDeforms[0]'])
      this.locations[n] = gl.getUniformLocation(this.program, n);
    this.frames = scenes.map(() => ({ texture: solidTexture(gl), width: 1, height: 1, ready: false }));
    this.current = 0; this.next = 0; this.mix = 1; this.time = 0;
    this.frameCount = 0;
    this.verifiedFirstFrame = false;
    this.dpr = 1; this.renderWidth = 1; this.renderHeight = 1;
    this.bubbleData = new Float32Array(64); this.deformData = new Float32Array(64);
    this.loaders = scenes.map((s, i) => this.loadImage(s.image, i));
  }
  loadImage(src, index) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        if (this.destroyed) { resolve(false); return; }
        const {gl} = this;
        if (!gl || gl.isContextLost()) { resolve(false); return; }
        const f = this.frames[index];
        f.width = img.naturalWidth; f.height = img.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, f.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        f.ready = true;
        resolve(true);
      };
      img.onerror = () => { console.warn('[MEMO] Scene not loaded:', src); resolve(false); };
      img.src = src;
    });
  }
  resize(width, height) {
    this.dpr = Math.min(window.devicePixelRatio || 1, SETTINGS.maxDevicePixelRatio);
    this.renderWidth = Math.max(1, Math.round(width * this.dpr));
    this.renderHeight = Math.max(1, Math.round(height * this.dpr));
    this.canvas.width = this.renderWidth; this.canvas.height = this.renderHeight;
    this.gl.viewport(0, 0, this.renderWidth, this.renderHeight);
  }
  select(index, immediate = false) {
    if (index === this.next) return;
    // A new selection during a transition snaps to its current destination first.
    if (this.mix >= .5) this.current = this.next;
    this.next = index;
    this.mix = immediate ? 1 : 0;
    if (immediate) this.current = index;
  }
  render(world, dt, reducedMotion = false) {
    const {gl,locations:l} = this;
    if (!gl || gl.isContextLost()) return;
    if (!reducedMotion) this.time += Math.min(.05,dt);
    if (this.mix < 1) {
      this.mix = reducedMotion ? 1 : Math.min(1, this.mix + dt * 1000 / SETTINGS.transitionMs);
      if (this.mix >= 1) this.current = this.next;
    }
    const a = this.frames[this.current], b = this.frames[this.next];
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.texture);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.texture);
    gl.uniform1i(l.uImageA, 0); gl.uniform1i(l.uImageB, 1);
    gl.uniform2f(l.uSizeA, a.width, a.height);
    gl.uniform2f(l.uSizeB, b.width, b.height);
    gl.uniform2f(l.uResolution, this.renderWidth, this.renderHeight);
    gl.uniform1f(l.uBlend, this.mix);
    gl.uniform1f(l.uTime, this.time);
    const bubbles = reducedMotion || world.motion ? world.bubbles : [];
    for (let i = 0; i < bubbles.length; i++) {
      const x = bubbles[i], idx = i * 4;
      this.bubbleData[idx] = x.x * this.dpr;
      this.bubbleData[idx+1] = (world.height - x.y) * this.dpr;
      this.bubbleData[idx+2] = x.r * this.dpr;
      this.bubbleData[idx+3] = x.type;
      this.deformData[idx] = reducedMotion ? 0 : x.squash;
      this.deformData[idx+1] = reducedMotion ? 0 : x.bendX * this.dpr;
      this.deformData[idx+2] = reducedMotion ? 0 : -x.bendY * this.dpr;
      this.deformData[idx+3] = x.phase;
    }
    gl.uniform1i(l.uBubbleCount, bubbles.length);
    gl.uniform4fv(l['uBubbles[0]'], this.bubbleData);
    gl.uniform4fv(l['uDeforms[0]'], this.deformData);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    if (!this.verifiedFirstFrame) {
      gl.finish();
      const probes = [[.08,.1],[.5,.1],[.92,.1],[.08,.5],[.92,.5],[.08,.9],[.5,.9],[.92,.9]];
      const pixel = new Uint8Array(4);
      let litSamples = 0;
      for (const [x, y] of probes) {
        gl.readPixels(Math.floor(this.renderWidth * x), Math.floor(this.renderHeight * y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        if (pixel[0] + pixel[1] + pixel[2] > 90) litSamples += 1;
      }
      const error = gl.getError();
      if (error !== gl.NO_ERROR || litSamples < 6) {
        throw new Error(`WebGL bubble background did not paint (${error}, ${litSamples}/8 scene samples).`);
      }
      this.verifiedFirstFrame = true;
    }
    this.frameCount += 1;
    if (this.frameCount % 60 === 0) {
      const error = gl.getError();
      if (error !== gl.NO_ERROR) throw new Error(`WebGL bubble render failed (${error}).`);
    }
  }
  destroy() {
    this.destroyed = true;
    const gl = this.gl;
    if (!gl) return;
    for (const f of this.frames) gl.deleteTexture(f.texture);
    gl.deleteBuffer(this.vbo); gl.deleteVertexArray(this.vao); gl.deleteProgram(this.program);
  }
}
