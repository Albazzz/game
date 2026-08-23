// Procedural Sci-Fi Sound Effects Engine using Web Audio API
// Ultra-low latency, zero external asset dependencies, crystal clear arcade audio.

import { GAME_CONFIG } from "./gameConfig";

class SoundManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Augment Card Hover SFX
  playAugmentHover() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Augment Core Installation / Selection Power-up SFX
  playAugmentSelect() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const chord = [440, 554.37, 659.25, 880, 1108.73]; // A major triumphant chord
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx!.currentTime + idx * 0.04 + 0.4);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04);
        gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.35, this.ctx!.currentTime + idx * 0.04 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.04);
        osc.stop(this.ctx!.currentTime + idx * 0.04 + 0.5);
      });
    } catch (e) {}
  }

  // Tactile Sci-Fi Keystroke Typing Click
  playKeyStroke() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 1600 + Math.random() * 400;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.035);

      const vol = GAME_CONFIG.AUDIO.masterVolume * 0.22;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  // Laser pew sound
  playLaser() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.laserVolume;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Explosion boom
  playExplosion() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.explosionVolume;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Wave Clear Victory Fanfare
  playWaveClear() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.6, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  // Warp Drive / Hyperspace Whoosh
  playWarpDrive() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 1.4);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.5, this.ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.4);
    } catch (e) {}
  }

  // Boss Siren Warning
  playBossSiren() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";

        const startTime = this.ctx.currentTime + i * 0.5;
        osc.frequency.setValueAtTime(400, startTime);
        osc.frequency.linearRampToValueAtTime(800, startTime + 0.25);
        osc.frequency.linearRampToValueAtTime(400, startTime + 0.5);

        gain.gain.setValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }
    } catch (e) {}
  }

  // Hyper Beam mega blast
  playHyperBeam() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 1.2);

      const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.hyperBeamVolume;
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch (e) {}
  }

  // Combo Ding / Chime
  playComboDing(combo: number) {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 440 * Math.pow(1.059463, Math.min(24, combo * 2));
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.comboDingVolume;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Damage / Planet hit
  playDamage() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
