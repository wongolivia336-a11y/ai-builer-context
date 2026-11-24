import { SOUND_ORBIT_TRACKS } from './sound-orbit-tracks.js';

const CROSSFADE_MS = 800;
const MUTE_FADE_MS = 220;
const CACHE_LIMIT = 2;
const MIN_GAIN = 0.0001;
const PLAYBACK_GAIN = 0.24;

function holdGainAtNow(gain, now) {
  if (typeof gain.cancelAndHoldAtTime === 'function') {
    gain.cancelAndHoldAtTime(now);
    return;
  }
  const value = Math.max(MIN_GAIN, gain.value);
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(value, now);
}

export class SoundOrbitAudioController {
  constructor(audioContextRef) {
    this.audioContextRef = audioContextRef;
    this.enabled = false;
    this.activeVoice = null;
    this.retiringVoice = null;
    this.voices = new Set();
    this.voiceTimers = new Map();
    this.decodedBuffers = new Map();
    this.pendingLoads = new Map();
    this.transitionToken = 0;
  }

  getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio is unavailable in this browser.');

    let context = this.audioContextRef.current;
    if (!context || context.state === 'closed') {
      context = new AudioContextClass();
      this.audioContextRef.current = context;
    }
    return context;
  }

  async unlockFromGesture() {
    const context = this.getContext();
    if (context.state !== 'running') {
      // Safari on iOS can keep an existing context suspended or interrupted.
      // Start a silent buffer in the same user gesture as resume() so Web Audio
      // is unlocked before the recording finishes loading.
      const resumePromise = context.resume();
      try {
        if (context.createBuffer && context.createBufferSource) {
          const source = context.createBufferSource();
          source.buffer = context.createBuffer(1, 1, context.sampleRate);
          source.connect(context.destination);
          source.start(0);
          source.stop(context.currentTime + 0.02);
        }
      } catch {
        // The browser can still unlock the context through resume().
      }
      await resumePromise;
    }
    if (context.state !== 'running') throw new Error('The browser did not allow audio playback.');

    this.stopAllVoices();
    this.invalidatePendingLoads();
    this.enabled = true;
  }

  preview(sceneId) {
    return this.transition(sceneId, CROSSFADE_MS);
  }

  commit(sceneId) {
    return this.transition(sceneId, CROSSFADE_MS);
  }

  restoreCommitted(sceneId) {
    if (!sceneId) return Promise.resolve(false);
    return this.transition(sceneId, CROSSFADE_MS);
  }

  async transition(sceneId, fadeMs) {
    if (!this.enabled) return false;
    const track = SOUND_ORBIT_TRACKS[sceneId];
    const context = this.audioContextRef.current;
    if (!track || !context || context.state !== 'running') return false;

    const token = ++this.transitionToken;
    if (this.activeVoice?.sceneId === sceneId) return true;
    this.cancelPendingLoadsExcept(track.trackId);

    let buffer;
    try {
      buffer = await this.loadBuffer(track, context);
    } catch (error) {
      if (token !== this.transitionToken || !this.enabled) return false;
      this.fadeActiveOnError(MUTE_FADE_MS);
      throw new Error(`Unable to load the ${track.label} recording.`, { cause: error });
    }

    if (token !== this.transitionToken || !this.enabled || context.state !== 'running') return false;
    return this.startTransition(sceneId, track, buffer, fadeMs, context);
  }

  loadBuffer(track, context) {
    if (this.decodedBuffers.has(track.trackId)) {
      const cached = this.decodedBuffers.get(track.trackId);
      this.decodedBuffers.delete(track.trackId);
      this.decodedBuffers.set(track.trackId, cached);
      return Promise.resolve(cached);
    }

    const pending = this.pendingLoads.get(track.trackId);
    if (pending) return pending.promise;

    const abortController = new AbortController();
    const request = { abortController, promise: null };
    request.promise = (async () => {
      const response = await fetch(track.src, { signal: abortController.signal, cache: 'force-cache' });
      if (!response.ok) throw new Error(`Audio request failed (${response.status}).`);
      const encodedAudio = await response.arrayBuffer();
      const decoded = await context.decodeAudioData(encodedAudio.slice(0));
      if (!abortController.signal.aborted && this.enabled) this.cacheBuffer(track.trackId, decoded);
      return decoded;
    })().finally(() => {
      if (this.pendingLoads.get(track.trackId) === request) this.pendingLoads.delete(track.trackId);
    });

    this.pendingLoads.set(track.trackId, request);
    return request.promise;
  }

  cacheBuffer(trackId, buffer) {
    this.decodedBuffers.delete(trackId);
    this.decodedBuffers.set(trackId, buffer);
    while (this.decodedBuffers.size > CACHE_LIMIT) {
      const oldestTrackId = this.decodedBuffers.keys().next().value;
      this.decodedBuffers.delete(oldestTrackId);
    }
  }

  cancelPendingLoadsExcept(trackId) {
    for (const [pendingTrackId, pending] of this.pendingLoads) {
      if (pendingTrackId === trackId) continue;
      pending.abortController.abort();
      this.pendingLoads.delete(pendingTrackId);
    }
  }

  invalidatePendingLoads() {
    for (const pending of this.pendingLoads.values()) pending.abortController.abort();
    this.pendingLoads.clear();
    this.decodedBuffers.clear();
  }

  startTransition(sceneId, track, buffer, fadeMs, context) {
    if (this.activeVoice?.sceneId === sceneId) return true;
    this.releaseRetiringVoice();
    for (const voice of this.voices) {
      if (voice !== this.activeVoice) this.releaseVoice(voice);
    }

    const now = context.currentTime;
    const duration = Math.max(0.12, fadeMs / 1000);
    const previous = this.activeVoice;
    const next = this.createVoice(context, sceneId, track, buffer);
    this.activeVoice = next;
    next.gain.gain.setValueAtTime(MIN_GAIN, now);
    next.gain.gain.linearRampToValueAtTime(PLAYBACK_GAIN, now + duration);
    next.source.start(now + 0.015);

    if (previous) {
      holdGainAtNow(previous.gain.gain, now);
      previous.gain.gain.linearRampToValueAtTime(MIN_GAIN, now + duration);
      this.retiringVoice = previous;
      this.scheduleRelease(previous, fadeMs + 45, () => {
        if (this.retiringVoice === previous) this.retiringVoice = null;
      });
    }
    return true;
  }

  createVoice(context, sceneId, track, buffer) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(MIN_GAIN, context.currentTime);
    source.connect(gain).connect(context.destination);

    const voice = { sceneId, trackId: track.trackId, source, gain };
    this.voices.add(voice);
    source.onended = () => this.releaseVoice(voice);
    return voice;
  }

  disable(fadeMs = MUTE_FADE_MS) {
    this.enabled = false;
    this.transitionToken += 1;
    this.invalidatePendingLoads();

    const current = [...this.voices];
    this.activeVoice = null;
    this.retiringVoice = null;
    current.forEach((voice) => this.fadeAndRelease(voice, fadeMs));
  }

  fadeActiveOnError(fadeMs) {
    const current = [...this.voices];
    this.activeVoice = null;
    this.retiringVoice = null;
    current.forEach((voice) => this.fadeAndRelease(voice, fadeMs));
  }

  fadeAndRelease(voice, fadeMs) {
    const context = this.audioContextRef.current;
    if (!context || context.state === 'closed' || !this.voices.has(voice) || fadeMs <= 0) {
      this.releaseVoice(voice);
      return;
    }

    const now = context.currentTime;
    const duration = Math.max(0.04, fadeMs / 1000);
    holdGainAtNow(voice.gain.gain, now);
    voice.gain.gain.linearRampToValueAtTime(MIN_GAIN, now + duration);
    this.scheduleRelease(voice, fadeMs + 35);
  }

  scheduleRelease(voice, delay, afterRelease) {
    this.clearVoiceTimer(voice);
    const timer = window.setTimeout(() => {
      this.voiceTimers.delete(voice);
      this.releaseVoice(voice);
      afterRelease?.();
    }, delay);
    this.voiceTimers.set(voice, timer);
  }

  clearVoiceTimer(voice) {
    const timer = this.voiceTimers.get(voice);
    if (timer !== undefined) window.clearTimeout(timer);
    this.voiceTimers.delete(voice);
  }

  releaseVoice(voice) {
    if (!voice || !this.voices.has(voice)) return;
    this.clearVoiceTimer(voice);
    voice.source.onended = null;
    try { voice.source.stop(); } catch { /* The source may have stopped already. */ }
    [voice.source, voice.gain].forEach((node) => {
      try { node.disconnect(); } catch { /* The node may already be disconnected. */ }
    });
    this.voices.delete(voice);
    if (this.activeVoice === voice) this.activeVoice = null;
    if (this.retiringVoice === voice) this.retiringVoice = null;
  }

  releaseRetiringVoice() {
    if (this.retiringVoice) this.releaseVoice(this.retiringVoice);
  }

  stopAllVoices() {
    this.transitionToken += 1;
    [...this.voices].forEach((voice) => this.releaseVoice(voice));
    this.activeVoice = null;
    this.retiringVoice = null;
  }

  dispose() {
    this.disable(0);
  }
}
