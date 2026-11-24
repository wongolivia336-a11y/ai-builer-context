const PRESETS = Object.freeze({
  'canopy-rest': { highpass: 95, lowpass: 620, level: 0.105, rate: 0.88 },
  'cloud-meadow': { highpass: 120, lowpass: 920, level: 0.095, rate: 1.08 },
  'rolling-flowers': { highpass: 110, lowpass: 760, level: 0.1, rate: 0.94 },
  'wildflower-hill': { highpass: 130, lowpass: 1040, level: 0.09, rate: 1.14 },
  'lambs-in-the-field': { highpass: 100, lowpass: 720, level: 0.095, rate: 0.83 },
  'clover-light': { highpass: 150, lowpass: 860, level: 0.085, rate: 1.2 },
  'star-tree': { highpass: 80, lowpass: 430, level: 0.11, rate: 0.76 },
  'misty-forest': { highpass: 85, lowpass: 500, level: 0.105, rate: 0.91 },
  'flower-pond': { highpass: 70, lowpass: 1180, level: 0.095, rate: 1.16 },
  'apple-tree': { highpass: 100, lowpass: 680, level: 0.1, rate: 1.03 },
});

const FADE_IN_MS = 800;
const MUTE_FADE_MS = 220;
const MIN_GAIN = 0.0001;

function makeSoftNoise(context) {
  const seconds = 8;
  const frameCount = Math.ceil(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 0x4d454d4f;
  let lowFrequency = 0;
  const edgeFrames = Math.ceil(context.sampleRate * 0.12);

  for (let index = 0; index < frameCount; index += 1) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const white = ((seed >>> 0) / 4294967295) * 2 - 1;
    lowFrequency += (white - lowFrequency) * 0.085;
    const edge = Math.min(1, index / edgeFrames, (frameCount - 1 - index) / edgeFrames);
    samples[index] = Math.max(-1, Math.min(1, lowFrequency * 5.5)) * Math.max(0, edge);
  }

  return buffer;
}

function holdGainAtNow(gain, now) {
  gain.cancelScheduledValues(now);
  if (typeof gain.cancelAndHoldAtTime === 'function') gain.cancelAndHoldAtTime(now);
  else gain.setValueAtTime(Math.max(MIN_GAIN, gain.value), now);
}

/**
 * Local interaction-only sound generator. It deliberately does not load the
 * unreviewed Freesound shortlist; its output is labelled as synthetic demo audio.
 */
export class SoundOrbitAudioController {
  constructor(audioContextRef) {
    this.audioContextRef = audioContextRef;
    this.enabled = false;
    this.noiseBuffer = null;
    this.activeVoice = null;
    this.retiringVoice = null;
    this.voices = new Set();
    this.voiceTimers = new Map();
    this.pendingTransitionTimer = null;
    this.transitionToken = 0;
  }

  getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio is not available in this browser.');

    let context = this.audioContextRef.current;
    if (!context || context.state === 'closed') {
      context = new AudioContextClass();
      this.audioContextRef.current = context;
    }
    return context;
  }

  async unlockFromGesture() {
    const context = this.getContext();
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running') throw new Error('The browser did not allow audio playback.');
    this.noiseBuffer = this.noiseBuffer || makeSoftNoise(context);
    this.stopAllVoices();
    this.enabled = true;
  }

  preview(sceneId) {
    if (!this.enabled) return false;
    return this.transition(sceneId, FADE_IN_MS);
  }

  commit(sceneId) {
    if (!this.enabled) return false;
    return this.transition(sceneId, FADE_IN_MS);
  }

  restoreCommitted(sceneId) {
    if (!this.enabled || !sceneId) return false;
    return this.transition(sceneId, FADE_IN_MS);
  }

  transition(sceneId, fadeMs) {
    const preset = PRESETS[sceneId];
    const context = this.audioContextRef.current;
    if (!preset || !context || context.state !== 'running' || !this.noiseBuffer) return false;

    const token = ++this.transitionToken;
    if (this.pendingTransitionTimer !== null) {
      window.clearTimeout(this.pendingTransitionTimer);
      this.pendingTransitionTimer = null;
    }
    if (this.activeVoice?.sceneId === sceneId) return true;

    if (this.retiringVoice) {
      const retiringPreset = PRESETS[this.activeVoice?.sceneId];
      const now = context.currentTime;
      if (retiringPreset && this.activeVoice) {
        holdGainAtNow(this.activeVoice.gain.gain, now);
        this.activeVoice.gain.gain.linearRampToValueAtTime(retiringPreset.level, now + 0.1);
      }
      this.fadeAndRelease(this.retiringVoice, 90);
      this.pendingTransitionTimer = window.setTimeout(() => {
        this.pendingTransitionTimer = null;
        if (token !== this.transitionToken || !this.enabled) return;
        this.startTransition(sceneId, fadeMs);
      }, 140);
      return true;
    }

    this.startTransition(sceneId, fadeMs);
    return true;
  }

  startTransition(sceneId, fadeMs) {
    const preset = PRESETS[sceneId];
    const context = this.audioContextRef.current;
    if (!preset || !context || context.state !== 'running' || !this.noiseBuffer) return false;
    this.releaseRetiringVoice();
    const now = context.currentTime;
    const duration = Math.max(0.12, fadeMs / 1000);
    const previous = this.activeVoice;
    const next = this.createVoice(context, sceneId, preset);
    this.activeVoice = next;

    next.gain.gain.setValueAtTime(MIN_GAIN, now);
    next.gain.gain.linearRampToValueAtTime(preset.level, now + duration);
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

  createVoice(context, sceneId, preset) {
    const source = context.createBufferSource();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.noiseBuffer;
    source.loop = true;
    source.playbackRate.setValueAtTime(preset.rate, context.currentTime);
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(preset.highpass, context.currentTime);
    highpass.Q.setValueAtTime(0.32, context.currentTime);
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(preset.lowpass, context.currentTime);
    lowpass.Q.setValueAtTime(0.24, context.currentTime);
    gain.gain.setValueAtTime(MIN_GAIN, context.currentTime);
    source.connect(highpass).connect(lowpass).connect(gain).connect(context.destination);

    const voice = { sceneId, source, highpass, lowpass, gain };
    this.voices.add(voice);
    return voice;
  }

  disable(fadeMs = MUTE_FADE_MS) {
    this.enabled = false;
    this.transitionToken += 1;
    if (this.pendingTransitionTimer !== null) {
      window.clearTimeout(this.pendingTransitionTimer);
      this.pendingTransitionTimer = null;
    }
    const current = [this.activeVoice, this.retiringVoice].filter(Boolean);
    this.activeVoice = null;
    this.retiringVoice = null;
    current.forEach((voice) => this.fadeAndRelease(voice, fadeMs));
  }

  fadeAndRelease(voice, fadeMs) {
    const context = this.audioContextRef.current;
    if (!context || context.state === 'closed' || !this.voices.has(voice)) {
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
    try { voice.source.stop(); } catch { /* The source may have stopped already. */ }
    [voice.source, voice.highpass, voice.lowpass, voice.gain].forEach((node) => {
      try { node.disconnect(); } catch { /* A disconnected node is already released. */ }
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
    if (this.pendingTransitionTimer !== null) {
      window.clearTimeout(this.pendingTransitionTimer);
      this.pendingTransitionTimer = null;
    }
    [...this.voices].forEach((voice) => this.releaseVoice(voice));
    this.activeVoice = null;
    this.retiringVoice = null;
  }

  dispose() {
    this.enabled = false;
    this.stopAllVoices();
  }
}
