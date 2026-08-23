import { useAirDefenseViewStore } from './AirDefenseViewStore'
import type { AirDefenseEnvelope, AirDefenseEventPayload, StompClient, StompSubscription } from './types'

export class AirDefenseStompAdapter {
  private client: StompClient | null = null
  private subscription: StompSubscription | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempt = 0
  private destroyed = false

  constructor(private readonly sessionId: string) {}

  connect() {
    if (this.client || this.destroyed) return
    useAirDefenseViewStore.getState().setConnection('connecting')
    const client = window.Stomp.over(new window.SockJS('/ws-arena'))
    client.debug = null
    client.heartbeat.outgoing = 10_000
    client.heartbeat.incoming = 10_000
    this.client = client
    client.connect({}, () => {
      this.reconnectAttempt = 0
      useAirDefenseViewStore.getState().setConnection('online')
      this.subscription = client.subscribe('/user/queue/air-defense', (frame) => this.handleFrame(frame.body))
      this.send('/state', {})
    }, () => {
      this.client = null
      this.subscription = null
      if (this.destroyed) return
      useAirDefenseViewStore.getState().setConnection('offline')
      this.scheduleReconnect()
    })
  }

  answer(aircraftId: string, answer: string, commandId: string): boolean {
    return this.send('/answer', { aircraftId, answer, commandId })
  }

  destroy() {
    this.destroyed = true
    if (this.reconnectTimer != null) window.clearTimeout(this.reconnectTimer)
    this.subscription?.unsubscribe()
    this.subscription = null
    try { this.client?.disconnect() } catch { /* socket already closed */ }
    this.client = null
  }

  private send(suffix: string, payload: object): boolean {
    if (!this.client || useAirDefenseViewStore.getState().connection !== 'online') return false
    try {
      this.client.send(`/app/air-defense/${this.sessionId}${suffix}`, {}, JSON.stringify(payload))
      return true
    } catch {
      return false
    }
  }

  private handleFrame(body: string) {
    let envelope: AirDefenseEnvelope
    try { envelope = JSON.parse(body) as AirDefenseEnvelope } catch { return }
    const store = useAirDefenseViewStore.getState()
    if (envelope.type === 'AIR_DEFENSE_ERROR') {
      const payload = envelope.payload
      const message = payload && 'message' in payload && typeof payload.message === 'string'
        ? payload.message : 'Không thể thực hiện hành động'
      store.setError(message)
      store.setEvent(envelope.type)
      return
    }
    const payload = envelope.payload as AirDefenseEventPayload | undefined
    if (payload?.state) {
      const currentVersion = store.snapshot?.stateVersion
      store.applySnapshot(payload.state)
      if (currentVersion != null && payload.state.stateVersion > currentVersion + 1) {
        this.send('/state', {})
      }
    }
    store.setEvent(envelope.type, payload?.action)
  }

  private scheduleReconnect() {
    if (this.reconnectTimer != null || this.destroyed) return
    const delay = Math.min(8_000, 1_000 * 2 ** this.reconnectAttempt++)
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}
