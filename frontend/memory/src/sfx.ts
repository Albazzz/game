const SOURCES = {
  flip: '/arena/audio/memory/flip.mp3?v=loud1',
  match: '/arena/audio/memory/match.mp3?v=loud1',
  mismatch: '/arena/audio/memory/mismatch.mp3?v=loud1',
  combo: '/arena/audio/memory/combo.mp3?v=loud1',
  complete: '/arena/audio/memory/complete.mp3?v=loud1',
  click: '/arena/audio/memory/click.mp3?v=loud1'
} as const

type MemorySound = keyof typeof SOURCES

const activeAudio = new Set<HTMLAudioElement>()
let preloaded = false
let backgroundAudio: HTMLAudioElement | null = null
let masterVolume = 1
let countdownContext: AudioContext | null = null

const VOLUMES: Record<MemorySound, number> = {
  flip: 1,
  match: .92,
  mismatch: .75,
  combo: .9,
  complete: .9,
  click: .8
}

const BACKGROUND_VOLUME = .38

function play(sound: MemorySound, playbackRate = 1) {
  const audio = new Audio(SOURCES[sound])
  audio.preload = 'auto'
  audio.volume = VOLUMES[sound] * masterVolume
  audio.playbackRate = playbackRate
  activeAudio.add(audio)

  const release = () => activeAudio.delete(audio)
  audio.addEventListener('ended', release, { once: true })
  audio.addEventListener('error', release, { once: true })
  void audio.play().catch(release)
}

export function unlockMemoryAudio() {
  if (preloaded) return
  preloaded = true
  Object.values(SOURCES).forEach((source) => {
    const audio = new Audio(source)
    audio.preload = 'auto'
    audio.load()
  })
}

export function playFlipSfx() {
  play('flip')
}

export function playMismatchSfx() {
  play('mismatch')
}

export function playMatchSfx(combo: number) {
  play(combo >= 2 ? 'combo' : 'match', combo >= 2 ? Math.min(1 + (combo - 2) * .035, 1.16) : 1)
}

export function playCompleteSfx() {
  play('complete')
}

export function playClickSfx() {
  play('click')
}

export function playCountdownSfx(step: number) {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    countdownContext ??= new AudioContextClass()
    void countdownContext.resume()
    const oscillator = countdownContext.createOscillator()
    const gain = countdownContext.createGain()
    oscillator.type = step === 1 ? 'triangle' : 'sine'
    oscillator.frequency.value = step === 1 ? 880 : 520 + step * 70
    gain.gain.setValueAtTime(0.0001, countdownContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.16 * masterVolume), countdownContext.currentTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, countdownContext.currentTime + 0.18)
    oscillator.connect(gain).connect(countdownContext.destination)
    oscillator.start()
    oscillator.stop(countdownContext.currentTime + 0.2)
  } catch {
    // Audio is optional; the countdown remains usable when the browser blocks Web Audio.
  }
}

export function startBackgroundMusic() {
  if (!backgroundAudio) {
    backgroundAudio = new Audio('/arena/audio/memory/background.mp3?v=loud1')
    backgroundAudio.preload = 'auto'
    backgroundAudio.loop = true
    backgroundAudio.volume = BACKGROUND_VOLUME * masterVolume
  }
  void backgroundAudio.play().catch(() => {
    // Trình duyệt sẽ cho phát lại ở tương tác trực tiếp tiếp theo.
  })
}

export function stopBackgroundMusic() {
  if (!backgroundAudio) return
  backgroundAudio.pause()
}

export function setMemoryVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume))
  if (backgroundAudio) backgroundAudio.volume = BACKGROUND_VOLUME * masterVolume
}
