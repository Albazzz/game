// ============================================================================
// AIR DEFENCE - PROCEDURAL SCI-FI AUDIO & CONTEXTUAL ADAPTIVE BGM SYNTHESIZER
// Zero external asset dependencies, crystal clear, ultra-low latency audio.
// ============================================================================

import { GAME_CONFIG } from "./gameConfig";
import { AudioSettings, LootItemType } from "./types";

export type BgmTrack = "lobby" | "battle" | "boss" | "off";

const STORAGE_KEY = "AIR_DEFENSE_AUDIO_SETTINGS_V1";

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterEnabled: true,
  masterVolume: 80,
  bgmEnabled: true,
  bgmVolume: 70,
  sfxEnabled: true,
  sfxVolume: 85,
  keystrokeEnabled: true
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private currentBgmTrack: BgmTrack = "off";
  private bgmIntervalId: number | null = null;
  private isBgmPlaying = false;

  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {}

    // Update active BGM gain
    if (this.bgmGain && this.ctx) {
      const targetGain = this.getCalculatedBgmVolume();
      this.bgmGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    // Toggle BGM if changed
    if (!this.settings.masterEnabled || !this.settings.bgmEnabled) {
      this.stopBgm();
    } else if (!this.isBgmPlaying && this.currentBgmTrack !== "off") {
      this.switchBgm(this.currentBgmTrack);
    }
  }

  private getCalculatedBgmVolume(): number {
    if (!this.settings.masterEnabled || !this.settings.bgmEnabled) return 0;
    return (this.settings.masterVolume / 100) * (this.settings.bgmVolume / 100) * GAME_CONFIG.AUDIO.bgmVolume;
  }

  private getCalculatedSfxVolume(customFactor = 1.0): number {
    if (!this.settings.masterEnabled || !this.settings.sfxEnabled) return 0;
    return (this.settings.masterVolume / 100) * (this.settings.sfxVolume / 100) * GAME_CONFIG.AUDIO.masterVolume * customFactor;
  }

  private initContext() {
    if (typeof window === "undefined" && typeof AudioContext === "undefined") return;
    if (!this.ctx) {
      try {
        const AudioCtx =
          (typeof window !== "undefined" &&
            (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) ||
          (typeof AudioContext !== "undefined" ? AudioContext : null);
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.bgmGain = this.ctx.createGain();
          this.bgmGain.gain.setValueAtTime(this.getCalculatedBgmVolume(), this.ctx.currentTime);
          this.bgmGain.connect(this.ctx.destination);
        }
      } catch (e) {}
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // ==========================================================================
  // 1. DYNAMIC CONTEXTUAL BGM SYNTHESIZER (LOBBY / BATTLE / BOSS)
  // ==========================================================================
  switchBgm(track: BgmTrack) {
    if (!this.settings.masterEnabled || !this.settings.bgmEnabled) {
      this.stopBgm();
      this.currentBgmTrack = track;
      return;
    }
    if (this.currentBgmTrack === track && this.isBgmPlaying) return;

    this.initContext();
    this.stopBgm();

    if (track === "off") {
      this.currentBgmTrack = "off";
      return;
    }

    this.currentBgmTrack = track;
    this.isBgmPlaying = true;

    if (track === "lobby") {
      this.startLobbyBgmLoop();
    } else if (track === "battle") {
      this.startBattleBgmLoop();
    } else if (track === "boss") {
      this.startBossBgmLoop();
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // --- LOBBY BGM: Chill Cyberpunk Space Ambience ---
  private startLobbyBgmLoop() {
    const chords = [
      [220.00, 277.18, 329.63, 440.00],
      [174.61, 220.00, 261.63, 349.23],
      [261.63, 329.63, 392.00, 523.25],
      [196.00, 246.94, 293.66, 392.00]
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isBgmPlaying || this.currentBgmTrack !== "lobby" || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450 + Math.sin(now) * 150, now);
        filter.frequency.linearRampToValueAtTime(750, now + 1.8);
        filter.frequency.linearRampToValueAtTime(450, now + 3.8);

        const vol = (this.getCalculatedBgmVolume() * 0.45) / chord.length;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.8);
        gain.gain.linearRampToValueAtTime(vol * 0.7, now + 2.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChord();
    this.bgmIntervalId = setInterval(playChord, 3800) as unknown as number;
  }

  // --- BATTLE BGM: Fast 128 BPM Arcade Driving Synthwave ---
  private startBattleBgmLoop() {
    const bassNotes = [110, 110, 130.81, 110, 98, 98, 123.47, 98];
    const leadNotes = [440, 523.25, 659.25, 587.33, 523.25, 493.88, 440, 659.25];
    let step = 0;

    const playBeat = () => {
      if (!this.isBgmPlaying || this.currentBgmTrack !== "battle" || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const bassFreq = bassNotes[step % bassNotes.length];
      const leadFreq = leadNotes[step % leadNotes.length];

      // Bass synth
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(this.getCalculatedBgmVolume() * 0.55, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.23);

      // Lead melody pulse every 2 steps
      if (step % 2 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = "sine";
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(this.getCalculatedBgmVolume() * 0.35, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.19);
      }

      // Cyber Hi-hat tick
      const noise = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();
      noise.type = "sawtooth";
      noise.frequency.setValueAtTime(step % 4 === 0 ? 8000 : 12000, now);
      noiseGain.gain.setValueAtTime(this.getCalculatedBgmVolume() * 0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.bgmGain);
      noise.start(now);
      noise.stop(now + 0.04);

      step++;
    };

    playBeat();
    this.bgmIntervalId = setInterval(playBeat, 230) as unknown as number;
  }

  // --- BOSS BGM: Intense Dark Synth Boss Battle (Heavy, Fast, Aggressive) ---
  private startBossBgmLoop() {
    const bossNotes = [65.41, 73.42, 65.41, 82.41, 61.74, 65.41, 92.50, 87.31];
    let step = 0;

    const playBossBeat = () => {
      if (!this.isBgmPlaying || this.currentBgmTrack !== "boss" || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const note = bossNotes[step % bossNotes.length];

      const stabOsc1 = this.ctx.createOscillator();
      const stabOsc2 = this.ctx.createOscillator();
      const stabGain = this.ctx.createGain();
      const stabFilter = this.ctx.createBiquadFilter();

      stabOsc1.type = "sawtooth";
      stabOsc2.type = "sawtooth";
      stabOsc1.frequency.setValueAtTime(note, now);
      stabOsc2.frequency.setValueAtTime(note * 1.01, now);

      stabFilter.type = "lowpass";
      stabFilter.frequency.setValueAtTime(1400, now);
      stabFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

      stabGain.gain.setValueAtTime(this.getCalculatedBgmVolume() * 0.75, now);
      stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      stabOsc1.connect(stabFilter);
      stabOsc2.connect(stabFilter);
      stabFilter.connect(stabGain);
      stabGain.connect(this.bgmGain);

      stabOsc1.start(now);
      stabOsc2.start(now);
      stabOsc1.stop(now + 0.21);
      stabOsc2.stop(now + 0.21);

      if (step % 4 === 0) {
        const siren = this.ctx.createOscillator();
        const sirenGain = this.ctx.createGain();
        siren.type = "sine";
        siren.frequency.setValueAtTime(980, now);
        siren.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        sirenGain.gain.setValueAtTime(this.getCalculatedBgmVolume() * 0.35, now);
        sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        siren.connect(sirenGain);
        sirenGain.connect(this.bgmGain);
        siren.start(now);
        siren.stop(now + 0.15);
      }

      step++;
    };

    playBossBeat();
    this.bgmIntervalId = setInterval(playBossBeat, 195) as unknown as number;
  }

  // ==========================================================================
  // 2. LOOT DROP & ITEM COLLECTION SFX
  // ==========================================================================
  playItemCollect(type: LootItemType) {
    const vol = this.getCalculatedSfxVolume(GAME_CONFIG.AUDIO.itemCollectVolume);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === "CREDIT_CRYSTAL") {
        const notes = [1318.51, 1567.98, 2093.0];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);

          gain.gain.setValueAtTime(0.001, now + idx * 0.035);
          gain.gain.linearRampToValueAtTime(vol * 0.4, now + idx * 0.035 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.15);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.15);
        });
      } else if (type === "REPAIR_PACK") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);

        gain.gain.setValueAtTime(vol * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.16);

        gain.gain.setValueAtTime(vol * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 3. INTRO / MISSION LAUNCH AUDIO
  // ==========================================================================
  playIntroLaunch() {
    const vol = this.getCalculatedSfxVolume(1.0);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = [330, 440, 660, 880];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(vol * 0.45, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  // ==========================================================================
  // 4. ACTION & COMBAT SFX
  // ==========================================================================
  playAugmentHover() {
    const vol = this.getCalculatedSfxVolume(0.5);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(vol * 0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playAugmentSelect() {
    const vol = this.getCalculatedSfxVolume(1.0);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const chord = [440, 554.37, 659.25, 880, 1108.73];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx!.currentTime + idx * 0.04 + 0.4);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04);
        gain.gain.linearRampToValueAtTime(vol * 0.4, this.ctx!.currentTime + idx * 0.04 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.04);
        osc.stop(this.ctx!.currentTime + idx * 0.04 + 0.5);
      });
    } catch (e) {}
  }

  playKeyStroke() {
    if (!this.settings.keystrokeEnabled) return;
    const vol = this.getCalculatedSfxVolume(0.45);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 1600 + Math.random() * 400;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(vol * 0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  playLaser() {
    const vol = this.getCalculatedSfxVolume(GAME_CONFIG.AUDIO.laserVolume);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playExplosion() {
    const vol = this.getCalculatedSfxVolume(GAME_CONFIG.AUDIO.explosionVolume);
    if (vol <= 0) return;
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
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playWaveClear() {
    const vol = this.getCalculatedSfxVolume(1.0);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(vol * 0.6, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  playWarpDrive() {
    const vol = this.getCalculatedSfxVolume(0.8);
    if (vol <= 0) return;
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
      gain.gain.linearRampToValueAtTime(vol * 0.5, this.ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.4);
    } catch (e) {}
  }

  playBossSiren() {
    const vol = this.getCalculatedSfxVolume(1.0);
    if (vol <= 0) return;
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

        gain.gain.setValueAtTime(vol * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }
    } catch (e) {}
  }

  playHyperBeamCharge() {
    const vol = this.getCalculatedSfxVolume(0.9);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.85);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {}
  }

  playHyperBeam() {
    const vol = this.getCalculatedSfxVolume(GAME_CONFIG.AUDIO.hyperBeamVolume);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 3.0;

      // 1. Heavy Plasma Roar (Noise)
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.8, now);
      noiseGain.gain.setValueAtTime(vol * 0.75, now + duration - 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);

      // 2. Sub-bass & Sawtooth Blast
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);
      osc.frequency.setValueAtTime(65, now + 1.0);

      gain.gain.setValueAtTime(vol * 0.9, now);
      gain.gain.setValueAtTime(vol * 0.8, now + duration - 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playComboDing(combo: number) {
    const vol = this.getCalculatedSfxVolume(GAME_CONFIG.AUDIO.comboDingVolume);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Pentatonic scale frequencies (C5 -> A6) for musical harmony on continuous typing
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      const baseFreq = pentatonic[(combo - 1) % pentatonic.length];
      const octaveShift = Math.floor((combo - 1) / pentatonic.length);
      const freq = Math.min(2800, baseFreq * Math.pow(1.15, octaveShift));

      const now = this.ctx.currentTime;

      // Fundamental tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = combo >= 10 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Shimmering overtone for higher combos
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (combo >= 20 ? 0.22 : 0.16));

      overGain.gain.setValueAtTime(vol * (combo >= 10 ? 0.35 : 0.15), now);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      overtone.connect(overGain);
      overGain.connect(this.ctx.destination);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.25);
      overtone.stop(now + 0.15);
    } catch (e) {}
  }

  playComboMilestone(milestone: number) {
    const vol = this.getCalculatedSfxVolume(1.0);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // 3-Stage Rising Cyber Chime Arpeggio
      const chords =
        milestone >= 30
          ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // Supernova Pentatonic chord
          : milestone >= 20
          ? [440.0, 554.37, 659.25, 880.0] // Godlike Major chord
          : milestone >= 10
          ? [349.23, 440.0, 523.25, 698.46] // Hyper chord
          : [261.63, 329.63, 392.0, 523.25]; // Streak chord

      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now + idx * 0.05);
        filter.frequency.linearRampToValueAtTime(2400, now + idx * 0.05 + 0.25);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(vol * 0.45, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.5);
      });
    } catch (e) {}
  }

  playComboBreak() {
    const vol = this.getCalculatedSfxVolume(0.65);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playDamage() {
    const vol = this.getCalculatedSfxVolume(0.8);
    if (vol <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(vol * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
