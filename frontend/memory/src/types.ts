export type ConnectionState = 'connecting' | 'online' | 'offline'
export type CardState = 'HIDDEN' | 'TEMP_REVEALED' | 'MATCHED'
export type CardFace = 'TERM' | 'READING' | 'MEANING'
export type SessionStatus = 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ABORTED'

export interface MemoryCard {
  cardInstanceId: string
  position: number
  state: CardState
  face?: CardFace
  content?: string
  matchedByUserId?: number
}

export interface MemoryPlayer {
  userId: number
  displayName: string
  avatar?: string
  slot: number
  pairsFound: number
  mistakes: number
  moves: number
  streak: number
  bestStreak: number
  accuracyPercent?: number
  averageDecisionMs?: number
  connected: boolean
  currentTurn: boolean
}

export interface MemoryConfig {
  boardSize: number
  pairCount: number
  objective: 'CLEAR_ALL' | 'TIME_ATTACK' | 'MOVE_LIMIT'
  pairMode: string
  level: string
  turnSeconds: number
  totalSeconds?: number
  moveLimit?: number
  keepTurnOnMatch: boolean
  revealDelayMs: number
}

export interface MemoryTerm {
  term: string
  reading?: string
  meaning: string
  mistakes: number
}

export interface MemoryResult {
  success: boolean
  ranked: boolean
  winnerUserId?: number
  draw: boolean
  durationMs: number
  termsEncountered: MemoryTerm[]
  strugglingTerms: MemoryTerm[]
}

export interface MemoryState {
  sessionId: string
  roomId?: string
  playMode: 'SOLO' | 'MULTIPLAYER'
  status: SessionStatus
  config: MemoryConfig
  cards: MemoryCard[]
  players: MemoryPlayer[]
  stateVersion: number
  currentTurnUserId?: number
  resolving: boolean
  pairsMatched: number
  pairsTotal: number
  movesUsed: number
  movesRemaining?: number
  turnStartedAt?: string
  turnDeadlineAt?: string
  totalDeadlineAt?: string
  elapsedMs: number
  outcome?: 'CLEARED' | 'TIME_UP' | 'MOVES_EXHAUSTED' | 'ABANDONED'
  ranked: boolean
  result?: MemoryResult
  serverTime: string
}

export interface MemoryEnvelope {
  type: string
  payload?: MemoryState | { message?: string }
}

export interface AuthUser {
  userId: number
  email: string
  fullName: string
  avatar?: string
  role: string
}

export interface MemoryStoreLike {
  currentUserId: number | null
  serverNow(): number
  applyState(state: MemoryState): void
  connect(): void
  destroy(): void
  flip(cardInstanceId: string): boolean
  on(type: 'change', handler: (state: MemoryState) => void): () => void
  on(type: 'event', handler: (event: MemoryEnvelope) => void): () => void
  on(type: 'connection', handler: (status: ConnectionState) => void): () => void
}

declare global {
  interface Window {
    MemoryStore: new (sessionId: string) => MemoryStoreLike
    ArenaApi: {
      me(): Promise<AuthUser>
      memoryState(sessionId: string): Promise<MemoryState>
      memoryPause(sessionId: string): Promise<MemoryState>
      memoryResume(sessionId: string): Promise<MemoryState>
      createMemorySolo(settings?: Record<string, unknown>): Promise<MemoryState>
    }
    ArenaToast?: {
      error(message: string): void
      success(message: string): void
      info(message: string): void
    }
  }
}
