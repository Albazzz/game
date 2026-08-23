import { useEffect, useRef } from 'react'
import { PixiBattlefieldAdapter } from '../pixi/PixiBattlefieldAdapter'
import type { AirDefenseAction, AirDefenseState } from '../types'

export function BattlefieldCanvas({ state, userId, clockSkewMs, eventType, action }: {
  state: AirDefenseState
  userId: number
  clockSkewMs: number
  eventType: string | null
  action: AirDefenseAction | null
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<PixiBattlefieldAdapter | null>(null)
  const latestRef = useRef({ state, userId, clockSkewMs })
  latestRef.current = { state, userId, clockSkewMs }

  useEffect(() => {
    if (!hostRef.current) return
    const adapter = new PixiBattlefieldAdapter(hostRef.current)
    adapterRef.current = adapter
    void adapter.mount().then(() => {
      const latest = latestRef.current
      adapter.sync(latest.state, latest.userId, latest.clockSkewMs)
    })
    return () => { adapter.destroy(); adapterRef.current = null }
  }, [])

  useEffect(() => {
    adapterRef.current?.sync(state, userId, clockSkewMs)
  }, [clockSkewMs, state, userId])

  useEffect(() => {
    adapterRef.current?.playEvent(eventType, action)
  }, [action, eventType, state.stateVersion])

  return <div className="air-canvas" ref={hostRef} aria-label="Chiến trường phòng không" role="img" />
}
