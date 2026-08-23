export type ConnectionState = 'connecting' | 'online' | 'offline'
export type SessionStatus = 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ABORTED'
export type AircraftState = 'SPAWNING' | 'ACTIVE' | 'HIT' | 'DESTROYED' | 'IMPACTED'

export interface AirDefenseConfig {
  objective: 'PRACTICE' | 'SURVIVAL' | 'SCORE_CHALLENGE' | 'SCORE_RACE'
  difficulty: 'EASY' | 'NORMAL' | 'HARD'
  answerMode: 'KANJI_TO_HIRAGANA' | 'KANJI_TO_MEANING'
  level: string
  maxHp: number
  targetCorrect: number
  questionCount: number
  durationSeconds: number
  travelTimeMs: number
  spawnIntervalMs: number
}

export interface AirDefensePlayer {
  userId: number
  displayName: string
  avatar?: string
  slot: number
  hp: number
  maxHp: number
  score: number
  combo: number
  bestCombo: number
  correctAnswers: number
  incorrectAnswers: number
  accuracyPercent: number
  averageResponseMs?: number
  connected: boolean
}

export interface AirDefenseAircraft {
  aircraftId: string
  questionId?: number
  questionText?: string
  questionType?: 'KANJI_TO_HIRAGANA' | 'KANJI_TO_MEANING'
  spawnAt: string
  impactAt: string
  difficulty: string
  aircraftType: 'NORMAL'
  targetUserId: number
  routeIndex: number
  state: AircraftState
  resolvedAt?: string
  resolvedByUserId?: number
}

export interface AirDefenseReviewItem {
  questionText: string
  expectedAnswer: string
  submittedAnswer?: string
  correct: boolean
  responseMs: number
}

export interface AirDefenseResult {
  success: boolean
  ranked: boolean
  winnerUserId?: number
  draw: boolean
  viewerOutcome: string
  durationMs: number
  personalBest: boolean
  review: AirDefenseReviewItem[]
}

export interface AirDefenseState {
  sessionId: string
  roomId?: string
  playMode: 'SOLO' | 'MULTIPLAYER'
  status: SessionStatus
  config: AirDefenseConfig
  players: AirDefensePlayer[]
  aircraft: AirDefenseAircraft[]
  stateVersion: number
  startedAt: string
  totalDeadlineAt?: string
  elapsedMs: number
  ranked: boolean
  result?: AirDefenseResult
  serverTime: string
}

export interface AirDefenseAction {
  aircraftId?: string
  actorUserId?: number
  correct?: boolean
  matchKind?: string
}

export interface AirDefenseEventPayload {
  state: AirDefenseState
  action?: AirDefenseAction
}

export interface AirDefenseEnvelope {
  type: string
  stateVersion?: number
  timestamp: string
  payload?: AirDefenseEventPayload | { message?: string }
}

export interface AuthUser { userId: number; fullName: string; avatar?: string }

declare global {
  interface Window {
    SockJS: new (url: string) => unknown
    Stomp: { over(socket: unknown): StompClient }
    ArenaApi: {
      me(): Promise<AuthUser>
      airDefenseState(sessionId: string): Promise<AirDefenseState>
      airDefensePause(sessionId: string): Promise<AirDefenseState>
      airDefenseResume(sessionId: string): Promise<AirDefenseState>
      createAirDefenseSolo(settings?: Record<string, unknown>): Promise<AirDefenseState>
    }
  }
}

export interface StompSubscription { unsubscribe(): void }
export interface StompFrame { body: string }
export interface StompClient {
  debug: ((message: string) => void) | null
  heartbeat: { outgoing: number; incoming: number }
  connect(headers: Record<string, string>, connected: () => void, error: () => void): void
  subscribe(destination: string, callback: (frame: StompFrame) => void): StompSubscription
  send(destination: string, headers: Record<string, string>, body: string): void
  disconnect(callback?: () => void): void
}
