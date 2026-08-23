import { Container, Graphics } from 'pixi.js'

export class ProjectileVisual extends Container {
  private readonly bornAt = performance.now()
  private readonly trail = new Graphics()
  readonly durationMs = 280

  constructor(private readonly fromX: number, private readonly fromY: number,
              private readonly toX: number, private readonly toY: number) {
    super()
    this.trail.circle(0, 0, 5).fill({ color: 0xfff4bd })
    this.trail.circle(0, 0, 11).fill({ color: 0xffc860, alpha: .22 })
    this.addChild(this.trail)
  }

  update(): boolean {
    const progress = Math.min(1, (performance.now() - this.bornAt) / this.durationMs)
    const eased = 1 - (1 - progress) ** 3
    this.x = this.fromX + (this.toX - this.fromX) * eased
    this.y = this.fromY + (this.toY - this.fromY) * eased
    this.scale.set(1 + progress * .5)
    return progress >= 1
  }
}
