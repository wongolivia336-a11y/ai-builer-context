import { clamp, presets } from './physics.js';

export class ImpactAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  async unlock() {
    if (!this.enabled) return;
    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) return;
      this.ctx ||= new AudioContextConstructor();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch {
      // Audio is an enhancement; a rejected context must not block navigation.
    }
  }

  play(speed, pan, material) {
    const audioContext = this.ctx;
    if (!this.enabled || !audioContext || audioContext.state !== 'running') return;

    const preset = presets[material] || presets.soft;
    const strength = clamp(speed / 650);
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    let output = audioContext.destination;

    if (audioContext.createStereoPanner) {
      const stereoPanner = audioContext.createStereoPanner();
      stereoPanner.pan.value = clamp(pan, -0.8, 0.8);
      stereoPanner.connect(output);
      output = stereoPanner;
      gain.onended = () => stereoPanner.disconnect();
    }

    gain.connect(output);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, strength * 0.19), now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.decay);

    preset.modes.forEach(([frequency, amplitude], index) => {
      const oscillator = audioContext.createOscillator();
      const toneGain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency * (0.94 + strength * 0.14), now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.9, now + preset.decay);
      toneGain.gain.value = amplitude;
      oscillator.connect(toneGain);
      toneGain.connect(gain);
      oscillator.onended = () => {
        oscillator.disconnect();
        toneGain.disconnect();
        if (index === preset.modes.length - 1) {
          gain.disconnect();
          if (output !== audioContext.destination) output.disconnect();
        }
      };
      oscillator.start(now);
      oscillator.stop(now + preset.decay + 0.015);
    });
  }

  dispose() {
    const audioContext = this.ctx;
    this.ctx = null;
    if (!audioContext || audioContext.state === 'closed') return;
    try {
      void audioContext.close().catch(() => {});
    } catch {
      // Some browsers can throw synchronously while closing an interrupted context.
    }
  }
}
