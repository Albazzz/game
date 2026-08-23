import { Container, Graphics, Text, type Application } from 'pixi.js'
import { AircraftVisual } from './Aircraft'
import { CannonVisual } from './Cannon'
import { ProjectileVisual } from './Projectile'
import { ExplosionEffect } from './ExplosionEffect'
import type { AirDefenseAction, AirDefenseState } from '../types'

export class AirDefenseRenderLoop {
  private readonly world = new Container()
  private readonly backdrop = new Container()
  private readonly objectLayer = new Container()
  private readonly effectLayer = new Container()
  private readonly cannon = new CannonVisual()
  private readonly aircraft = new Map<string, AircraftVisual>()
  private readonly projectiles: ProjectileVisual[] = []
  private readonly explosions: ExplosionEffect[] = []
  private state: AirDefenseState | null = null
  private userId = 0
  private clockSkewMs = 0
  private lastWidth = 0
  private lastHeight = 0
  private shakeUntil = 0

  constructor(private readonly app: Application) {
    this.world.addChild(this.backdrop, this.objectLayer, this.effectLayer)
    this.objectLayer.addChild(this.cannon)
    app.stage.addChild(this.world)
    app.ticker.add(this.tick)
  }

  sync(state: AirDefenseState, userId: number, clockSkewMs: number) {
    this.state = state
    this.userId = userId
    this.clockSkewMs = clockSkewMs
    for (const model of state.aircraft) {
      if (!this.aircraft.has(model.aircraftId) && (model.state === 'ACTIVE' || model.state === 'SPAWNING')) {
        const visual = new AircraftVisual(model, model.targetUserId === userId)
        this.aircraft.set(model.aircraftId, visual)
        this.objectLayer.addChild(visual)
      }
    }
  }

  playEvent(type: string | null, action: AirDefenseAction | null) {
    if (!type || !action?.aircraftId) return
    const target = this.aircraft.get(action.aircraftId)
    if (type === 'ANSWER_CORRECT' || (type === 'AIR_DEFENSE_GAME_OVER' && action.correct)) {
      if (target) {
        const projectile = new ProjectileVisual(this.cannon.x, this.cannon.y - 55, target.x, target.y)
        this.effectLayer.addChild(projectile)
        this.projectiles.push(projectile)
        this.cannon.aimAt(target.x, target.y)
        this.cannon.recoil(performance.now())
        window.setTimeout(() => this.explodeAt(target.x, target.y), projectile.durationMs - 30)
      }
    } else if (type === 'AIRCRAFT_IMPACTED'
        || (type === 'AIR_DEFENSE_GAME_OVER' && action.correct !== true)) {
      this.explodeAt(target?.x ?? this.app.screen.width / 2, this.app.screen.height - 75, 0xf87171)
      this.shakeUntil = performance.now() + 380
    }
  }

  destroy() {
    this.app.ticker.remove(this.tick)
    this.aircraft.clear()
    this.world.destroy({ children: true })
  }

  private readonly tick = () => {
    const width = this.app.screen.width
    const height = this.app.screen.height
    if (width !== this.lastWidth || height !== this.lastHeight) this.drawBackdrop(width, height)
    const now = Date.now() + this.clockSkewMs
    this.cannon.x = width / 2
    this.cannon.y = height - 29
    this.cannon.update(performance.now())

    if (this.state) {
      const models = new Map(this.state.aircraft.map((item) => [item.aircraftId, item]))
      for (const [id, visual] of this.aircraft) {
        const model = models.get(id)
        if (!model) continue
        visual.update(model, now, width, height)
        if ((model.state === 'DESTROYED' || model.state === 'IMPACTED')
            && model.resolvedAt && now - new Date(model.resolvedAt).getTime() > 850) {
          visual.destroy({ children: true })
          this.aircraft.delete(id)
        }
      }
    }
    for (let index = this.projectiles.length - 1; index >= 0; index--) {
      if (this.projectiles[index].update()) {
        this.projectiles[index].destroy({ children: true })
        this.projectiles.splice(index, 1)
      }
    }
    for (let index = this.explosions.length - 1; index >= 0; index--) {
      if (this.explosions[index].update()) {
        this.explosions[index].destroy({ children: true })
        this.explosions.splice(index, 1)
      }
    }
    const shaking = performance.now() < this.shakeUntil
    this.world.x = shaking ? (Math.random() - .5) * 10 : 0
    this.world.y = shaking ? (Math.random() - .5) * 7 : 0
  }

  private explodeAt(x: number, y: number, color?: number) {
    const explosion = new ExplosionEffect(x, y, color)
    this.effectLayer.addChild(explosion)
    this.explosions.push(explosion)
  }

  private drawBackdrop(width: number, height: number) {
    this.lastWidth = width
    this.lastHeight = height
    this.backdrop.removeChildren().forEach((child) => child.destroy())
    const sky = new Graphics().rect(0, 0, width, height).fill({ color: 0x071126 })
    sky.rect(0, height * .57, width, height * .43).fill({ color: 0x101a32, alpha: .58 })
    const moon = new Graphics().circle(width * .84, height * .18, Math.min(width, height) * .065)
      .fill({ color: 0xeaf8ff, alpha: .88 })
    moon.circle(width * .82, height * .16, Math.min(width, height) * .066).fill({ color: 0x071126, alpha: .72 })
    const stars = new Graphics()
    for (let index = 0; index < 55; index++) {
      const x = (index * 83.7) % width
      const y = (index * 37.3) % (height * .68)
      stars.circle(x, y, index % 7 === 0 ? 1.6 : .8).fill({ color: index % 5 === 0 ? 0xffa8cd : 0xbdefff, alpha: .58 })
    }
    const skyline = new Graphics()
    for (let x = 0, index = 0; x < width; index++) {
      const buildingWidth = 34 + (index * 17) % 58
      const buildingHeight = 28 + (index * 29) % 76
      skyline.rect(x, height - 42 - buildingHeight, buildingWidth, buildingHeight)
        .fill({ color: index % 2 ? 0x11182c : 0x161f38 })
      x += buildingWidth + 4
    }
    const line = new Graphics().rect(0, height - 76, width, 2).fill({ color: 0xff5d9e, alpha: .75 })
    const label = new Text({ text: '防衛ライン  ·  DEFENSE LINE', style: { fill: 0xffa8cd, fontSize: 10, letterSpacing: 2 } })
    label.x = 14
    label.y = height - 71
    this.backdrop.addChild(sky, stars, moon, skyline, line, label)
  }
}
