import { Container, Graphics, Text } from 'pixi.js'
import type { AirDefenseAircraft } from '../types'

/** Original procedural aircraft; no external/copyrighted sprite assets. */
export class AircraftVisual extends Container {
  private readonly hull = new Graphics()
  private readonly warning = new Graphics()
  private readonly tag: Text
  private targetState: AirDefenseAircraft['state']

  constructor(public readonly model: AirDefenseAircraft, private readonly ownTarget: boolean) {
    super()
    this.targetState = model.state
    this.hull
      .moveTo(-30, -7).lineTo(-8, -11).lineTo(5, -25).lineTo(13, -25)
      .lineTo(10, -10).lineTo(31, -3).lineTo(31, 4).lineTo(10, 10)
      .lineTo(13, 24).lineTo(5, 24).lineTo(-8, 11).lineTo(-30, 7)
      .lineTo(-22, 0).closePath()
      .fill({ color: ownTarget ? 0xe9f7ff : 0x73809d })
      .stroke({ color: ownTarget ? 0x4fd1ff : 0x9aa4ba, width: 2 })
    this.hull.circle(4, 0, 5).fill({ color: ownTarget ? 0xff5d9e : 0x46516b })
    this.warning.circle(0, 0, 39).stroke({ color: ownTarget ? 0xffc860 : 0x77829b, width: 2, alpha: .75 })
    this.warning.circle(0, 0, 33).stroke({ color: ownTarget ? 0xff5d9e : 0x77829b, width: 1, alpha: .4 })
    this.tag = new Text({
      text: ownTarget ? 'TARGET' : 'RIVAL',
      style: { fill: ownTarget ? 0xffc860 : 0x9aa4ba, fontSize: 9, fontWeight: '700', letterSpacing: 2 }
    })
    this.tag.anchor.set(.5)
    this.tag.y = -48
    this.addChild(this.warning, this.hull, this.tag)
    if (!ownTarget) this.alpha = .48
  }

  update(model: AirDefenseAircraft, now: number, viewportWidth: number, viewportHeight: number) {
    const start = new Date(model.spawnAt).getTime()
    const end = new Date(model.impactAt).getTime()
    const progress = Math.max(0, Math.min(1, (now - start) / Math.max(1, end - start)))
    const lanes = [.23, .5, .77]
    const lane = lanes[model.routeIndex % lanes.length]
    this.x = viewportWidth * lane + Math.sin(progress * Math.PI * 2 + model.routeIndex) * viewportWidth * .045
    this.y = 55 + progress * Math.max(80, viewportHeight - 145)
    this.rotation = Math.sin(progress * Math.PI * 2) * .08
    const urgency = progress > .72
    this.warning.alpha = urgency ? .55 + Math.sin(now / 90) * .35 : .45
    this.scale.set(this.ownTarget ? 1 : .72)
    if (this.targetState !== model.state) {
      this.targetState = model.state
      if (model.state === 'DESTROYED') this.hull.tint = 0xffc860
      if (model.state === 'IMPACTED') this.hull.tint = 0xf87171
    }
  }
}
