// ============================================================================
// AIR DEFENCE - PROCEDURAL SCI-FI AUDIO & CONTEXTUAL ADAPTIVE BGM SYNTHESIZER
// Zero external asset dependencies, crystal clear, ultra-low latency audio.
// ============================================================================

import { GAME_CONFIG } from "./gameConfig";
import { LootItemType } from "./types";

export type BgmTrack = "lobby" | "battle" | "boss" | "off";

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private currentBgmTrack: BgmTrack = "off";
  private bgmIntervalId: number | null = null;
  private isBgmPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // ==========================================================================
  // 1. DYNAMIC CONTEXTUAL BGM SYNTHESIZER (LOBBY / BATTLE / BOSS)
  // ==========================================================================
  switchBgm(track: BgmTrack) {
    if (!GAME_CONFIG.AUDIO.enabled || !GAME_CONFIG.AUDIO.bgmEnabled) {
      this.stopBgm();
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
      window.clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // --- LOBBY BGM: Chill Cyberpunk Space Ambience ---
  private startLobbyBgmLoop() {
    const chords = [
      [220.00, 277.18, 329.63, 440.00], // A minor 7
      [174.61, 220.00, 261.63, 349.23], // F major 7
      [261.63, 329.63, 392.00, 523.25], // C major
      [196.00, 246.94, 293.66, 392.00]  // G major
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

        const vol = (GAME_CONFIG.AUDIO.bgmVolume * 0.12) / chord.length;
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
    this.bgmIntervalId = window.setInterval(playChord, 3800);
  }

  // --- BATTLE BGM: Fast 128 BPM Arcade Driving Synthwave ---
  private startBattleBgmLoop() {
    const bassNotes = [110, 110, 130.81, 110, 98, 98, 123.47, 98]; // A2, C3, G2, B2
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

      bassGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume * 0.15, now);
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

        leadGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume * 0.09, now);
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
      noiseGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume * 0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.bgmGain);
      noise.start(now);
      noise.stop(now + 0.04);

      step++;
    };

    playBeat();
    this.bgmIntervalId = window.setInterval(playBeat, 230); // ~130 BPM 8th notes
  }

  // --- BOSS BGM: Intense Dark Synth Boss Battle (Heavy, Fast, Aggressive) ---
  private startBossBgmLoop() {
    const bossNotes = [65.41, 73.42, 65.41, 82.41, 61.74, 65.41, 92.50, 87.31]; // C2, D2, E2, B1, F#2
    let step = 0;

    const playBossBeat = () => {
      if (!this.isBgmPlaying || this.currentBgmTrack !== "boss" || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const note = bossNotes[step % bossNotes.length];

      // Heavy Sawtooth Brass Stab
      const stabOsc1 = this.ctx.createOscillator();
      const stabOsc2 = this.ctx.createOscillator();
      const stabGain = this.ctx.createGain();
      const stabFilter = this.ctx.createBiquadFilter();

      stabOsc1.type = "sawtooth";
      stabOsc2.type = "sawtooth";
      stabOsc1.frequency.setValueAtTime(note, now);
      stabOsc2.frequency.setValueAtTime(note * 1.01, now); // Detuned for thickness

      stabFilter.type = "lowpass";
      stabFilter.frequency.setValueAtTime(1400, now);
      stabFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

      stabGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume * 0.22, now);
      stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      stabOsc1.connect(stabFilter);
      stabOsc2.connect(stabFilter);
      stabFilter.connect(stabGain);
      stabGain.connect(this.bgmGain);

      stabOsc1.start(now);
      stabOsc2.start(now);
      stabOsc1.stop(now + 0.21);
      stabOsc2.stop(now + 0.21);

      // Warning alarm tick
      if (step % 4 === 0) {
        const siren = this.ctx.createOscillator();
        const sirenGain = this.ctx.createGain();
        siren.type = "sine";
        siren.frequency.setValueAtTime(980, now);
        siren.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        sirenGain.gain.setValueAtTime(GAME_CONFIG.AUDIO.bgmVolume * 0.1, now);
        sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        siren.connect(sirenGain);
        sirenGain.connect(this.bgmGain);
        siren.start(now);
        siren.stop(now + 0.15);
      }

      step++;
    };

    playBossBeat();
    this.bgmIntervalId = window.setInterval(playBossBeat, 195); // ~150 BPM urgency
  }

  // ==========================================================================
  // 2. LOOT DROP & ITEM COLLECTION SFX
  // ==========================================================================
  playItemCollect(type: LootItemType) {
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === "CREDIT_CRYSTAL") {
        // High sparkle crystal chime (Gold pickup)
        const notes = [1318.51, 1567.98, 2093.0]; // E6, G6, C7
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);

          const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.itemCollectVolume * 0.4;
          gain.gain.setValueAtTime(0.001, now + idx * 0.035);
          gain.gain.linearRampToValueAtTime(vol, now + idx * 0.035 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.15);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.15);
        });
      } else if (type === "REPAIR_PACK") {
        // Healing warm wave chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);

        const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.itemCollectVolume * 0.55;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        // Hyper Beam Plasma orb energize
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.16);

        const vol = GAME_CONFIG.AUDIO.masterVolume * GAME_CONFIG.AUDIO.itemCollectVolume * 0.45;
        gain.gain.setValueAtTime(vol, now);
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
    if (!GAME_CONFIG.AUDIO.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Countdown chime -> Engine thruster burst
      const chord = [330, 440, 660, 880];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.45, now + idx * 0.08 + 0.03);
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

  playAugmentSelect() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
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
        gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.35, this.ctx!.currentTime + idx * 0.04 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.04);
        osc.stop(this.ctx!.currentTime + idx * 0.04 + 0.5);
      });
    } catch (e) {}
  }

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

  playWaveClear() {
    if (!GAME_CONFIG.AUDIO.enabled) return;
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
        gain.gain.linearRampToValueAtTime(GAME_CONFIG.AUDIO.masterVolume * 0.6, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }

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
