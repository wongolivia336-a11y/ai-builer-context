import assert from 'node:assert/strict';
import test from 'node:test';
import { SoundOrbitAudioController } from '../src/zine/sound-orbit-audio.js';

class FakeAudioParam {
  value = 1;
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  cancelScheduledValues() {}
  cancelAndHoldAtTime() {}
}

class FakeNode {
  constructor() { this.connections = []; this.disconnected = false; }
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.disconnected = true; }
}

class FakeSource extends FakeNode {
  constructor() {
    super();
    this.playbackRate = new FakeAudioParam();
    this.started = false;
    this.stopped = false;
    this.onended = null;
  }
  start() { this.started = true; }
  stop() { this.stopped = true; }
}

class FakeAudioContext {
  state = 'running';
  currentTime = 4;
  sampleRate = 44100;
  destination = new FakeNode();
  sources = [];
  async decodeAudioData() { return { duration: 30 }; }
  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new FakeNode();
    gain.gain = new FakeAudioParam();
    return gain;
  }
}

function installBrowserMocks(t, fetchImplementation = async () => ({
  ok: true,
  arrayBuffer: async () => new ArrayBuffer(32),
})) {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = { AudioContext: FakeAudioContext, setTimeout, clearTimeout };
  globalThis.fetch = fetchImplementation;
  t.after(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  });
}

const flushMicrotasks = () => new Promise((resolve) => setImmediate(resolve));

test('scene transitions stay on the latest photo and never exceed two voices', async (t) => {
  installBrowserMocks(t);
  const context = new FakeAudioContext();
  const controller = new SoundOrbitAudioController({ current: context });
  controller.enabled = true;

  await controller.preview('canopy-rest');
  await controller.preview('cloud-meadow');
  assert.equal(controller.voices.size, 2, 'the first crossfade may keep two voices');
  await controller.preview('rolling-flowers');
  assert.equal(controller.activeVoice.sceneId, 'rolling-flowers');
  assert.equal(controller.voices.size, 2, 'a rapid next transition releases the prior retiring voice');
  assert.equal(controller.decodedBuffers.size, 2, 'decoded recordings stay inside the two-buffer cache');
  assert.equal(context.sources.filter((source) => source.started).length, 3);

  controller.dispose();
  assert.equal(controller.voices.size, 0);
});

test('a superseded slow scene load cannot replace a newer selection', async (t) => {
  let slowSignal;
  let resolveSlowFetch;
  const slowFetch = new Promise((resolve) => { resolveSlowFetch = resolve; });
  installBrowserMocks(t, (url, { signal }) => {
    if (url.endsWith('shade-birds.mp3')) {
      slowSignal = signal;
      return slowFetch;
    }
    return Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(32) });
  });
  const context = new FakeAudioContext();
  const controller = new SoundOrbitAudioController({ current: context });
  controller.enabled = true;

  const slowRequest = controller.preview('canopy-rest');
  await flushMicrotasks();
  const latestRequest = controller.preview('cloud-meadow');
  await flushMicrotasks();
  assert.equal(slowSignal.aborted, true);

  resolveSlowFetch({ ok: true, arrayBuffer: async () => new ArrayBuffer(32) });
  await Promise.all([slowRequest, latestRequest]);
  assert.equal(controller.activeVoice.sceneId, 'cloud-meadow');
  assert.deepEqual([...controller.pendingLoads.keys()], []);
  controller.dispose();
});

test('muting aborts an in-flight load and does not let it start later', async (t) => {
  let pendingSignal;
  let resolveFetch;
  const pendingFetch = new Promise((resolve) => { resolveFetch = resolve; });
  installBrowserMocks(t, (_url, { signal }) => {
    pendingSignal = signal;
    return pendingFetch;
  });
  const context = new FakeAudioContext();
  const controller = new SoundOrbitAudioController({ current: context });
  controller.enabled = true;

  const request = controller.preview('canopy-rest');
  await flushMicrotasks();
  controller.disable(0);
  assert.equal(pendingSignal.aborted, true);
  resolveFetch({ ok: true, arrayBuffer: async () => new ArrayBuffer(32) });
  await request;
  assert.equal(controller.voices.size, 0);
  assert.equal(context.sources.length, 0);
});

test('mute fades briefly, then stops and disconnects the active source', async (t) => {
  installBrowserMocks(t);
  const context = new FakeAudioContext();
  const controller = new SoundOrbitAudioController({ current: context });
  controller.enabled = true;
  await controller.preview('canopy-rest');

  const source = controller.activeVoice.source;
  const gain = controller.activeVoice.gain;
  controller.disable(40);
  assert.equal(source.stopped, false, 'source remains alive only during the short fade');
  assert.equal(gain.gain.value, 0.0001);
  await new Promise((resolve) => setTimeout(resolve, 90));
  assert.equal(source.stopped, true);
  assert.equal(source.disconnected, true);
  assert.equal(gain.disconnected, true);
  assert.equal(controller.voices.size, 0);
});
