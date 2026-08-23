import { Container, Graphics } from 'pixi.js'

export class CannonVisual extends Container {
  private readonly barrel = new Graphics()
  private readonly base = new Graphics()
  private recoilStartedAt = 0

  constructor() {
    super()
    this.base.roundRect(-42, -17, 84, 34, 9).fill({ color: 0x202b4a }).stroke({ color: 0x4fd1ff, width: 2 })
    this.base.circle(0, -16, 17).fill({ color: 0x141c34 }).stroke({ color: 0xff5d9e, width: 2 })
    this.barrel.roundRect(-7, -64, 14, 56, 5).fill({ color: 0xd7e8f5 }).stroke({ color: 0x4fd1ff, width: 2 })
    this.addChild(this.base, this.barrel)
  }

  aimAt(targetX: number, targetY: number) {
    const angle = Math.atan2(targetY - this.y, targetX - this.x) + Math.PI / 2
    this.barrel.rotation = Math.max(-1.05, Math.min(1.05, angle))
  }

  recoil(now: number) { this.recoilStartedAt = now }

  update(now: number) {
    const age = now - this.recoilStartedAt
    this.barrel.y = age >= 0 && age < 150 ? Math.sin((age / 150) * Math.PI) * 12 : 0
  }
}
