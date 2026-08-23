import { Container, Graphics } from 'pixi.js'

interface Particle { node: Graphics; angle: number; speed: number; }

export class ExplosionEffect extends Container {
  private readonly bornAt = performance.now()
  private readonly particles: Particle[] = []
  readonly durationMs = 620

  constructor(x: number, y: number, color = 0xffc860) {
    super()
    this.x = x
    this.y = y
    for (let index = 0; index < 18; index++) {
      const node = new Graphics().circle(0, 0, 2 + Math.random() * 4)
        .fill({ color: index % 3 === 0 ? 0xff5d9e : color, alpha: .95 })
      const angle = (Math.PI * 2 * index) / 18 + Math.random() * .18
      this.particles.push({ node, angle, speed: 38 + Math.random() * 85 })
      this.addChild(node)
    }
    const ring = new Graphics().circle(0, 0, 10).stroke({ color: 0xffffff, width: 4, alpha: .85 })
    ring.name = 'ring'
    this.addChild(ring)
  }

  update(): boolean {
    const progress = Math.min(1, (performance.now() - this.bornAt) / this.durationMs)
    for (const particle of this.particles) {
      const distance = particle.speed * progress
      particle.node.x = Math.cos(particle.angle) * distance
      particle.node.y = Math.sin(particle.angle) * distance
      particle.node.alpha = 1 - progress
      particle.node.scale.set(1 - progress * .45)
    }
    const ring = this.getChildByName('ring')
    if (ring) { ring.scale.set(1 + progress * 5); ring.alpha = 1 - progress }
    return progress >= 1
  }
}
