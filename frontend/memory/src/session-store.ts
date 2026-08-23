import { create } from 'zustand'
import type { ConnectionState, MemoryState } from './types'

interface MemoryUiState {
  snapshot: MemoryState | null
  connection: ConnectionState
  error: string | null
  notice: string | null
  setSnapshot: (snapshot: MemoryState) => void
  setConnection: (connection: ConnectionState) => void
  setError: (error: string | null) => void
  setNotice: (notice: string | null) => void
  reset: () => void
}

const initialState = {
  snapshot: null,
  connection: 'connecting' as ConnectionState,
  error: null,
  notice: null
}

/**
 * Store chỉ giữ projection UI của đúng một board page. Luật chơi vẫn hoàn toàn
 * nằm ở Spring engine; STOMP transport đẩy snapshot server vào đây.
 */
export const useMemoryUiStore = create<MemoryUiState>((set) => ({
  ...initialState,
  setSnapshot: (snapshot) => set({ snapshot }),
  setConnection: (connection) => set({ connection }),
  setError: (error) => set({ error }),
  setNotice: (notice) => set({ notice }),
  reset: () => set(initialState)
}))
