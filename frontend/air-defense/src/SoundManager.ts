export class SoundManager {
  private context: AudioContext | null = null
  private enabled = false
  private volume = 0.22

  toggle(): boolean {
    this.enabled = !this.enabled
    if (this.enabled && !this.context) this.context = new AudioContext()
    return this.enabled
  }

  isEnabled() { return this.enabled }
  setVolume(volume: number) { this.volume = Math.max(0, Math.min(1, volume)) }

  play(event: 'fire' | 'correct' | 'incorrect' | 'impact' | 'victory' | 'defeat') {
    if (!this.enabled || !this.context) return
    const frequencies = { fire: 110, correct: 660, incorrect: 170, impact: 70, victory: 880, defeat: 95 }
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = event === 'impact' || event === 'defeat' ? 'sawtooth' : 'sine'
    oscillator.frequency.setValueAtTime(frequencies[event], this.context.currentTime)
    gain.gain.setValueAtTime(this.volume, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.18)
    oscillator.connect(gain).connect(this.context.destination)
    oscillator.start()
    oscillator.stop(this.context.currentTime + 0.2)
  }
}
