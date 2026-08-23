import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  ConnectionState,
  MemoryCard,
  MemoryEnvelope,
  MemoryPlayer,
  MemoryState,
  MemoryStoreLike
} from './types'
import { useMemoryUiStore } from './session-store'
import { playClickSfx, playCompleteSfx, playCountdownSfx, playFlipSfx, playMatchSfx, playMismatchSfx, setMemoryVolume, startBackgroundMusic, stopBackgroundMusic, unlockMemoryAudio } from './sfx'

const EVENT_LABELS: Record<string, string> = {
  MEMORY_PAIR_MATCHED: 'Ghép đúng! Tiếp tục phát huy nhé.',
  MEMORY_PAIR_MISMATCH: 'Chưa đúng — ghi nhớ vị trí rồi thử lại.',
  MEMORY_TURN_TIMEOUT: 'Hết thời gian của lượt này.',
  MEMORY_GAME_OVER: 'Ván chơi đã kết thúc.'
}

function secondsLeft(deadline: string | undefined, serverNow: number): number | null {
  if (!deadline) return null
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - serverNow) / 1000))
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase()
}

function PlayerChip({ player, isMe }: { player: MemoryPlayer; isMe: boolean }) {
  return (
    <article className={`memory-player ${player.currentTurn ? 'is-current' : ''}`}>
      <div className="memory-player__avatar" aria-hidden="true">
        {player.avatar ? <img src={player.avatar} alt="" /> : initials(player.displayName)}
      </div>
      <div className="memory-player__main">
        <div className="memory-player__name">
          <strong className="truncate">{player.displayName}</strong>
          {isMe && <span className="memory-mini-tag">Bạn</span>}
        </div>
        <span>{player.currentTurn ? 'Đang tới lượt' : `${player.pairsFound} cặp · chuỗi ${player.streak}`}</span>
      </div>
      <strong className="memory-player__score">{player.pairsFound * 100}</strong>
    </article>
  )
}

function PlayerPanel({ player, isMe, side, active }: {
  player?: MemoryPlayer
  isMe?: boolean
  side: 'sakura' | 'kaito'
  active: boolean
}) {
  const name = player?.displayName ?? (side === 'sakura' ? 'Sakura Demo' : 'Kaito Demo')
  const score = player ? player.pairsFound * 100 : 0
  return (
    <aside className={`memory-player-panel memory-player-panel--${side} ${active ? 'is-active' : ''} ${player ? '' : 'is-empty'}`}>
      <div className="memory-player-panel__turn">{active ? (isMe ? 'LƯỢT CỦA BẠN' : 'ĐANG TỚI LƯỢT') : 'ĐANG CHỜ LƯỢT'}</div>
      <div className="memory-player-panel__avatar">
        {player?.avatar ? <img src={player.avatar} alt="" /> : <span>{player ? initials(name) : '?'}</span>}
      </div>
      <h2>{name}</h2>
      <p className="memory-player-panel__status"><i />{active ? 'Đang tới lượt' : 'Đang chờ lượt'}</p>
      <div className="memory-player-panel__score"><small>ĐIỂM</small><strong>{score}</strong></div>
      {player && <div className="memory-player-panel__pairs">Cặp đã tìm <strong>{player.pairsFound}</strong></div>}
    </aside>
  )
}

function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <motion.div
      className={`memory-dice-face ${rolling ? 'is-rolling' : ''}`}
      animate={rolling ? { rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
      transition={rolling ? { duration: 0.55, repeat: Infinity } : { duration: 0.22 }}
      aria-label={`Xúc xắc ${value}`}
    >
      {Array.from({ length: value }, (_, index) => <i key={index} />)}
    </motion.div>
  )
}

function DiceRollOverlay({
  players,
  starterIndex,
  onStart
}: {
  players: MemoryPlayer[]
  starterIndex: number
  onStart: () => void
}) {
  const [rolling, setRolling] = useState(true)
  const [countdown, setCountdown] = useState(3)
  const [values, setValues] = useState<[number, number]>([4, 2])
  const starter = players[starterIndex]

  useEffect(() => {
    let step = 3
    playCountdownSfx(step)
    const timer = window.setInterval(() => {
      step -= 1
      if (step > 0) {
        setCountdown(step)
        playCountdownSfx(step)
        return
      }
      window.clearInterval(timer)
      setCountdown(0)
      setValues(starterIndex === 0 ? [4, 2] : [2, 4])
      setRolling(false)
      playCountdownSfx(1)
    }, 700)
    return () => window.clearInterval(timer)
  }, [starterIndex])

  useEffect(() => {
    const timer = window.setTimeout(onStart, 5200)
    return () => window.clearTimeout(timer)
  }, [onStart])

  return (
    <motion.div className="memory-dice-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-labelledby="memory-dice-title">
      <motion.section className="memory-dice-dialog" initial={{ y: 22, scale: .96 }} animate={{ y: 0, scale: 1 }}>
        <p className="memory-dice-kicker">VÒNG ĐẤU BẮT ĐẦU</p>
        <h2 id="memory-dice-title">Ai đi trước?</h2>
        <p className="memory-dice-subtitle">Tung xúc xắc để quyết định lượt đầu tiên</p>
        <div className="memory-dice-countdown" aria-live="assertive">{countdown || 'GO!'}</div>
        <div className="memory-dice-players">
          {players.slice(0, 2).map((player, index) => (
            <div className={`memory-dice-player ${index === starterIndex && !rolling ? 'is-winner' : ''}`} key={player.userId}>
              <div className="memory-dice-avatar">{player.avatar ? <img src={player.avatar} alt="" /> : initials(player.displayName)}</div>
              <strong>{player.displayName}</strong>
              <DiceFace value={values[index]} rolling={rolling} />
              <small>{rolling ? 'Đang tung…' : `+${values[index]} điểm`}</small>
            </div>
          ))}
        </div>
        <motion.p className="memory-dice-result" animate={{ opacity: rolling ? 0 : 1, y: rolling ? 5 : 0 }}>
          {starter?.displayName} đi trước!
        </motion.p>
        <button className="memory-btn memory-btn--primary memory-dice-start" type="button" onClick={onStart} disabled={rolling}>
          {rolling ? 'ĐANG TUNG XÚC XẮC…' : 'BẮT ĐẦU'}
        </button>
      </motion.section>
    </motion.div>
  )
}

function MemoryCardButton({
  card,
  disabled,
  onFlip,
  reduceMotion,
  feedback
}: {
  card: MemoryCard
  disabled: boolean
  onFlip: (id: string) => void
  reduceMotion: boolean | null
  feedback: 'match' | 'mismatch' | null
}) {
  const revealed = card.state !== 'HIDDEN'
  const matched = card.state === 'MATCHED'
  const faceLabel = card.face === 'MEANING' ? 'Nghĩa' : card.face === 'READING' ? 'Cách đọc' : 'Từ Nhật'

  return (
    <motion.button
      type="button"
      className={`memory-card ${revealed ? 'is-revealed' : ''} ${matched ? 'is-matched' : ''} ${feedback ? `has-${feedback}-feedback` : ''}`}
      disabled={disabled || revealed}
      onClick={() => onFlip(card.cardInstanceId)}
      aria-label={revealed ? `${faceLabel}: ${card.content ?? ''}` : `Thẻ úp số ${card.position + 1}`}
      animate={{ rotateY: revealed ? 180 : 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : {
        rotateY: { duration: 3, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.36, ease: [0.22, 1, 0.36, 1] }
      }}
      whileHover={!disabled && !revealed && !reduceMotion ? { y: -5, scale: 1.025 } : undefined}
      whileTap={!disabled && !revealed && !reduceMotion ? { scale: 0.96 } : undefined}
    >
      <span className="memory-card__back" aria-hidden={revealed}>
        <span className="memory-card__crest">❄</span>
        <span className="memory-card__index">{String(card.position + 1).padStart(2, '0')}</span>
      </span>
      <span className="memory-card__front" aria-hidden={!revealed}>
        <span className="memory-card__face">{faceLabel}</span>
        <span className={`memory-card__content ${card.face === 'MEANING' ? '' : 'jp'}`}>
          {card.content ?? '—'}
        </span>
        {matched && <span className="memory-card__matched">✓ Đã ghép</span>}
      </span>
    </motion.button>
  )
}

function ResultPanel({ state, onReplay, replaying }: {
  state: MemoryState
  onReplay: () => void
  replaying: boolean
}) {
  const result = state.result
  const title = result?.success ? 'Hoàn thành!' : 'Ván chơi kết thúc'
  const subtitle = state.outcome === 'TIME_UP'
    ? 'Hết thời gian, nhưng những cặp đã nhớ vẫn được ghi nhận.'
    : state.outcome === 'MOVES_EXHAUSTED'
      ? 'Đã dùng hết số lượt. Hãy thử lại để phá kỷ lục.'
      : 'Bạn đã mở khóa toàn bộ cặp từ vựng.'

  return (
    <motion.section
      className="memory-result"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      role="dialog"
      aria-labelledby="memory-result-title"
    >
      <div className="memory-result__seal" aria-hidden="true">勝</div>
      <p className="memory-kicker">Kết quả Memory Match</p>
      <h2 id="memory-result-title">{title}</h2>
      <p>{subtitle}</p>
      <div className="memory-result__stats">
        <span><strong>{state.pairsMatched}/{state.pairsTotal}</strong>Cặp đúng</span>
        <span><strong>{state.movesUsed}</strong>Lượt lật</span>
        <span><strong>{formatDuration(result?.durationMs ?? state.elapsedMs)}</strong>Thời gian</span>
      </div>
      {!!result?.strugglingTerms?.length && (
        <div className="memory-review">
          <h3>Từ nên ôn lại</h3>
          <div className="memory-review__list">
            {result.strugglingTerms.map((term) => (
              <div key={`${term.term}-${term.meaning}`}>
                <strong className="jp">{term.term}</strong>
                <span>{term.reading || '—'} · {term.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="memory-result__actions">
        {state.playMode === 'SOLO' && (
          <button className="memory-btn memory-btn--primary" onClick={onReplay} disabled={replaying}>
            {replaying ? 'Đang tạo ván…' : 'Chơi lại'}
          </button>
        )}
        <a className="memory-btn" href={state.roomId ? `/games/room/${encodeURIComponent(state.roomId)}` : '/games'}>
          {state.roomId ? 'Về phòng' : 'Về sảnh game'}
        </a>
      </div>
    </motion.section>
  )
}

export default function App({ sessionId }: { sessionId: string }) {
  const reduceMotion = useReducedMotion()
  const storeRef = useRef<MemoryStoreLike | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)
  const streakRef = useRef(0)
  const previousStatusRef = useRef<string | null>(null)
  const state = useMemoryUiStore((ui) => ui.snapshot)
  const connection = useMemoryUiStore((ui) => ui.connection)
  const error = useMemoryUiStore((ui) => ui.error)
  const notice = useMemoryUiStore((ui) => ui.notice)
  const setState = useMemoryUiStore((ui) => ui.setSnapshot)
  const setConnection = useMemoryUiStore((ui) => ui.setConnection)
  const setError = useMemoryUiStore((ui) => ui.setError)
  const setNotice = useMemoryUiStore((ui) => ui.setNotice)
  const resetUi = useMemoryUiStore((ui) => ui.reset)
  const [userId, setUserId] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [pendingPause, setPendingPause] = useState(false)
  const [replaying, setReplaying] = useState(false)
  const [roundFeedback, setRoundFeedback] = useState<'match' | 'mismatch' | null>(null)
  const [feedbackCardIds, setFeedbackCardIds] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(() => window.localStorage.getItem('memory-sfx') !== 'off')
  const [volume, setVolume] = useState(() => {
    const saved = Number(window.localStorage.getItem('memory-volume'))
    return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 1
  })
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [showDiceRoll, setShowDiceRoll] = useState(false)
  const diceSessionRef = useRef<string | null>(null)
  const soundEnabledRef = useRef(soundEnabled)

  useEffect(() => {
    resetUi()
    const store = new window.MemoryStore(sessionId)
    storeRef.current = store
    const offChange = store.on('change', setState)
    const offConnection = store.on('connection', setConnection)
    const offEvent = store.on('event', (event: MemoryEnvelope) => {
      if (event.type === 'MEMORY_ERROR') {
        const message = event.payload && 'message' in event.payload
          && typeof event.payload.message === 'string' ? event.payload.message : undefined
        setError(message || 'Không thể thực hiện nước đi này')
        return
      }
      const message = EVENT_LABELS[event.type]
      if (event.type === 'MEMORY_PAIR_MATCHED' || event.type === 'MEMORY_PAIR_MISMATCH') {
        if (soundEnabledRef.current) {
          if (event.type === 'MEMORY_PAIR_MATCHED') playMatchSfx(Math.max(1, streakRef.current + 1))
          else playMismatchSfx()
        }
        setRoundFeedback(event.type === 'MEMORY_PAIR_MATCHED' ? 'match' : 'mismatch')
        if (feedbackTimerRef.current != null) window.clearTimeout(feedbackTimerRef.current)
        feedbackTimerRef.current = window.setTimeout(() => {
          setRoundFeedback(null)
          setFeedbackCardIds([])
          feedbackTimerRef.current = null
        }, event.type === 'MEMORY_PAIR_MATCHED' ? 900 : 720)
      }
      if (message) {
        setNotice(message)
        window.setTimeout(() => {
          if (useMemoryUiStore.getState().notice === message) setNotice(null)
        }, 1800)
      }
    })

    Promise.all([window.ArenaApi.me(), window.ArenaApi.memoryState(sessionId)])
      .then(([me, initialState]) => {
        store.currentUserId = me.userId
        setUserId(me.userId)
        store.applyState(initialState)
        store.connect()
      })
      .catch((cause: Error) => setError(cause.message || 'Không thể tải ván chơi'))

    return () => {
      offChange()
      offConnection()
      offEvent()
      if (feedbackTimerRef.current != null) window.clearTimeout(feedbackTimerRef.current)
      store.destroy()
      storeRef.current = null
    }
  }, [resetUi, sessionId, setConnection, setError, setNotice, setState])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
    window.localStorage.setItem('memory-sfx', soundEnabled ? 'on' : 'off')
    if (!soundEnabled) stopBackgroundMusic()
  }, [soundEnabled])

  useEffect(() => {
    setMemoryVolume(volume)
    window.localStorage.setItem('memory-volume', String(volume))
  }, [volume])

  useEffect(() => {
    if (!soundEnabled) return
    const startMusic = () => startBackgroundMusic()
    window.addEventListener('pointerdown', startMusic, { once: true })
    window.addEventListener('keydown', startMusic, { once: true })
    return () => {
      window.removeEventListener('pointerdown', startMusic)
      window.removeEventListener('keydown', startMusic)
      stopBackgroundMusic()
    }
  }, [soundEnabled])

  useEffect(() => {
    const currentPlayer = state?.players.find((player) => player.userId === userId)
    streakRef.current = currentPlayer?.streak ?? 0
  }, [state?.players, userId])

  useEffect(() => {
    if (!state || state.playMode !== 'MULTIPLAYER' || state.status !== 'RUNNING' || state.players.length < 2) return
    if (diceSessionRef.current === state.sessionId) return
    diceSessionRef.current = state.sessionId
    setShowDiceRoll(true)
  }, [state?.sessionId, state?.playMode, state?.status, state?.players.length])

  useEffect(() => {
    const previous = previousStatusRef.current
    if (soundEnabled && previous === 'RUNNING' && state?.status === 'FINISHED') playCompleteSfx()
    previousStatusRef.current = state?.status ?? null
  }, [soundEnabled, state?.status])

  const serverNow = storeRef.current?.serverNow() ?? now
  const turnLeft = secondsLeft(state?.turnDeadlineAt, serverNow)
  const totalLeft = secondsLeft(state?.totalDeadlineAt, serverNow)
  const me = state?.players.find((player) => player.userId === userId)
  const myTurn = state?.playMode === 'SOLO' || state?.currentTurnUserId === userId
  const boardColumns = useMemo(() => {
    const count = state?.cards.length ?? 20
    if (count <= 12) return 4
    if (count <= 20) return 5
    return 6
  }, [state?.cards.length])
  const canFlip = Boolean(state && !showDiceRoll && state.status === 'RUNNING' && !state.resolving && myTurn && connection === 'online')

  const flip = (cardId: string) => {
    setError(null)
    if (storeRef.current?.flip(cardId)) {
      if (soundEnabled) playFlipSfx()
      setFeedbackCardIds((current) => current.includes(cardId) ? current : [...current, cardId].slice(-2))
    } else {
      setError('Đang mất kết nối, chưa thể lật thẻ')
    }
  }

  const togglePause = async () => {
    if (!state || state.playMode !== 'SOLO' || pendingPause) return
    setPendingPause(true)
    setError(null)
    try {
      const next = state.status === 'PAUSED'
        ? await window.ArenaApi.memoryResume(sessionId)
        : await window.ArenaApi.memoryPause(sessionId)
      storeRef.current?.applyState(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đổi trạng thái ván')
    } finally {
      setPendingPause(false)
    }
  }

  const replay = async () => {
    if (!state || replaying) return
    setReplaying(true)
    setError(null)
    try {
      const next = await window.ArenaApi.createMemorySolo({
        questionLevel: state.config.level,
        answerMode: state.config.pairMode,
        extra: {
          boardSize: state.config.boardSize,
          objective: state.config.objective,
          turnSeconds: state.config.turnSeconds,
          totalSeconds: state.config.totalSeconds,
          moveLimit: state.config.moveLimit,
          keepTurnOnMatch: state.config.keepTurnOnMatch
        }
      })
      window.location.href = `/games/memory/${encodeURIComponent(next.sessionId)}`
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo ván mới')
      setReplaying(false)
    }
  }

  if (!state) {
    return (
      <main className="memory-loading" aria-live="polite">
        <div className="memory-loader" aria-hidden="true"><span>記</span></div>
        <h1>Đang xếp thẻ…</h1>
        <p>{error || 'Chuẩn bị bàn Memory Match của bạn'}</p>
        {error && <a className="memory-btn" href="/games">Về sảnh game</a>}
      </main>
    )
  }

  if (state.status === 'FINISHED' || state.status === 'ABORTED') {
    return <main className="memory-shell memory-shell--result"><ResultPanel state={state} onReplay={replay} replaying={replaying} /></main>
  }

  return (
    <main className={`memory-shell ${roundFeedback ? `is-${roundFeedback}` : ''}`}>
      <div className={`memory-layout ${state.playMode === 'SOLO' ? 'is-solo' : ''}`}>
        <PlayerPanel player={state.players[0]} isMe={state.players[0]?.userId === userId} side="sakura" active={Boolean(state.players[0]?.currentTurn)} />
        <section className="memory-play-area">
          <div className="memory-board-wrap">
            <AnimatePresence>
              {roundFeedback && (
                <motion.div
                  className={`memory-round-feedback is-${roundFeedback}`}
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.18 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  aria-hidden="true"
                >
                  <span>{roundFeedback === 'match' ? '✓' : '×'}</span>
                  <span className="memory-round-feedback__copy">
                    <strong>{roundFeedback === 'match' ? ((me?.streak ?? 0) >= 2 ? `COMBO X${me?.streak}` : 'MATCH!') : 'CHƯA ĐÚNG'}</strong>
                    {roundFeedback === 'match' && (me?.streak ?? 0) >= 2 && <em>GREAT!</em>}
                  </span>
                  {roundFeedback === 'match' && <><i /><i /><i /><i /><i /><i /></>}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="memory-turn memory-turn--sample" aria-live="polite">
              <span className={myTurn ? 'is-mine' : ''}>{state.status === 'PAUSED' ? 'VÁN ĐANG TẠM DỪNG' : myTurn ? 'CHỌN HAI THẺ' : 'ĐỐI THỦ ĐANG CHỌN THẺ…'}</span>
              <small>{state.config.level}</small>
            </div>
            <div className="memory-board" style={{ '--board-cols': boardColumns } as React.CSSProperties}>
              {state.cards.slice().sort((a, b) => a.position - b.position).map((card) => (
                <MemoryCardButton
                  key={card.cardInstanceId}
                  card={card}
                  disabled={!canFlip}
                  onFlip={flip}
                  reduceMotion={reduceMotion}
                  feedback={roundFeedback && feedbackCardIds.includes(card.cardInstanceId) ? roundFeedback : null}
                />
              ))}
            </div>
          </div>
        </section>

        {state.playMode === 'MULTIPLAYER' && (
          <PlayerPanel player={state.players[1]} isMe={state.players[1]?.userId === userId} side="kaito" active={Boolean(state.players[1]?.currentTurn)} />
        )}
        <div className="memory-play-toolbar">
          <div className="memory-head-metrics memory-head-metrics--sidebar" aria-label="Thông số ván chơi">
            <span><small>Lượt</small><strong>{state.movesUsed}</strong></span>
            <i />
            <span><small>Thời gian</small><strong className={turnLeft != null && turnLeft <= 5 ? 'is-urgent' : ''}>{totalLeft != null ? formatDuration(totalLeft * 1000) : formatDuration((turnLeft ?? 0) * 1000)}</strong></span>
            <i />
            <span><small>Combo</small><strong className={(me?.streak ?? 0) >= 2 ? 'is-combo' : ''}>x{me?.streak ?? 0}</strong></span>
          </div>
          <div className="memory-sidebar-controls">
            <span className={`memory-connection is-${connection}`}><i />{connection === 'online' ? 'Đã kết nối' : connection === 'connecting' ? 'Đang nối' : 'Mất kết nối'}</span>
            <div className="memory-sidebar-controls__buttons">
          <div className="memory-volume-control">
            <button
              type="button"
              className="memory-icon-btn memory-icon-btn--sound"
              onClick={() => {
                unlockMemoryAudio()
                playClickSfx()
                if (soundEnabled) stopBackgroundMusic()
                else startBackgroundMusic()
                setSoundEnabled((enabled) => !enabled)
              }}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              className="memory-volume-control__toggle"
              onClick={() => { if (soundEnabled) playClickSfx(); setVolumeOpen((open) => !open) }}
              aria-label="Tùy chỉnh âm lượng"
              aria-expanded={volumeOpen}
              title="Tùy chỉnh âm lượng"
            >
              ⚙
            </button>
            <AnimatePresence>
              {volumeOpen && (
                <motion.div
                  className="memory-volume-popover"
                  initial={{ opacity: 0, y: -6, scale: .96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: .96 }}
                  transition={{ duration: reduceMotion ? 0 : .16 }}
                >
                  <div><strong>Âm lượng</strong><output>{Math.round(volume * 100)}%</output></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(volume * 100)}
                    onChange={(event) => setVolume(Number(event.target.value) / 100)}
                    aria-label="Âm lượng trò chơi"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {state.playMode === 'SOLO' && (
            <button type="button" className="memory-icon-btn" onClick={() => { if (soundEnabled) playClickSfx(); void togglePause() }} disabled={pendingPause} aria-label={state.status === 'PAUSED' ? 'Tiếp tục' : 'Tạm dừng'}>
              {state.status === 'PAUSED' ? '▶' : 'Ⅱ'}
            </button>
          )}
          <a className="memory-icon-btn memory-icon-btn--exit" href={state.roomId ? `/games/room/${encodeURIComponent(state.roomId)}` : '/games'} aria-label="Rời bàn">↪</a>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notice && <motion.div className="memory-notice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>{notice}</motion.div>}
      </AnimatePresence>
      {error && <div className="memory-error" role="alert"><span>{error}</span><button onClick={() => setError(null)} aria-label="Đóng">×</button></div>}
      {(connection === 'offline' || state.status === 'PAUSED') && (
        <div className="memory-overlay" role="status">
          <div><span className="memory-overlay__glyph">{state.status === 'PAUSED' ? '休' : '結'}</span><h2>{state.status === 'PAUSED' ? 'Đã tạm dừng' : 'Đang kết nối lại'}</h2><p>{state.status === 'PAUSED' ? 'Đồng hồ đã dừng. Tiếp tục khi bạn sẵn sàng.' : 'Nước đi bị khóa để giữ bàn chơi đồng bộ.'}</p>{state.status === 'PAUSED' && <button className="memory-btn memory-btn--primary" onClick={togglePause}>Tiếp tục</button>}</div>
        </div>
      )}
      <AnimatePresence>
        {showDiceRoll && state.playMode === 'MULTIPLAYER' && state.players.length >= 2 && (
          <DiceRollOverlay
            players={state.players}
            starterIndex={state.players.findIndex((player) => player.userId === state.currentTurnUserId) === 1 ? 1 : 0}
            onStart={() => setShowDiceRoll(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
