import { create } from 'zustand'
import type { AirDefenseAction, AirDefenseState, ConnectionState } from './types'

interface AirDefenseViewState {
  snapshot: AirDefenseState | null
  connection: ConnectionState
  userId: number | null
  clockSkewMs: number
  lastEventType: string | null
  lastAction: AirDefenseAction | null
  error: string | null
  applySnapshot: (snapshot: AirDefenseState) => void
  setConnection: (connection: ConnectionState) => void
  setUserId: (userId: number) => void
  setEvent: (type: string, action?: AirDefenseAction) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initial = {
  snapshot: null,
  connection: 'connecting' as ConnectionState,
  userId: null,
  clockSkewMs: 0,
  lastEventType: null,
  lastAction: null,
  error: null
}

export const useAirDefenseViewStore = create<AirDefenseViewState>((set, get) => ({
  ...initial,
  applySnapshot: (snapshot) => {
    const current = get().snapshot
    if (current && snapshot.stateVersion < current.stateVersion) return
    set({ snapshot, clockSkewMs: new Date(snapshot.serverTime).getTime() - Date.now() })
  },
  setConnection: (connection) => set({ connection }),
  setUserId: (userId) => set({ userId }),
  setEvent: (lastEventType, lastAction) => set({ lastEventType, lastAction: lastAction ?? null }),
  setError: (error) => set({ error }),
  reset: () => set(initial)
}))

export const serverNow = () => Date.now() + useAirDefenseViewStore.getState().clockSkewMs
