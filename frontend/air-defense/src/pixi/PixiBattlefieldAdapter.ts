import { Application } from 'pixi.js'
import { AirDefenseRenderLoop } from './AirDefenseRenderLoop'
import type { AirDefenseAction, AirDefenseState } from '../types'

export class PixiBattlefieldAdapter {
  private app: Application | null = null
  private loop: AirDefenseRenderLoop | null = null
  private destroyed = false

  constructor(private readonly host: HTMLElement) {}

  async mount() {
    const app = new Application()
    await app.init({
      resizeTo: this.host,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      preference: 'webgl'
    })
    if (this.destroyed) { app.destroy(true); return }
    this.app = app
    app.canvas.setAttribute('aria-hidden', 'true')
    this.host.appendChild(app.canvas)
    this.loop = new AirDefenseRenderLoop(app)
  }

  sync(state: AirDefenseState, userId: number, clockSkewMs: number) {
    this.loop?.sync(state, userId, clockSkewMs)
  }

  playEvent(type: string | null, action: AirDefenseAction | null) {
    this.loop?.playEvent(type, action)
  }

  destroy() {
    this.destroyed = true
    this.loop?.destroy()
    this.loop = null
    this.app?.destroy(true, { children: true })
    this.app = null
    this.host.replaceChildren()
  }
}
