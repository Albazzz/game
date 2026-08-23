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
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <strong className="truncate">{player.displayName}</strong>
          {isMe && <span className="memory-mini-tag">Bạn</span>}
        </div>
        <span className="text-sm text-[var(--text-mid)]">
          {player.pairsFound} cặp · chuỗi {player.streak}
        </span>
      </div>
      <strong className="memory-player__score">{player.pairsFound * 100}</strong>
    </article>
  )
}

function MemoryCardButton({
  card,
  disabled,
  onFlip,
  reduceMotion
}: {
  card: MemoryCard
  disabled: boolean
  onFlip: (id: string) => void
  reduceMotion: boolean | null
}) {
  const revealed = card.state !== 'HIDDEN'
  const matched = card.state === 'MATCHED'
  const faceLabel = card.face === 'MEANING' ? 'Nghĩa' : card.face === 'READING' ? 'Cách đọc' : 'Từ Nhật'

  return (
    <motion.button
      type="button"
      className={`memory-card ${revealed ? 'is-revealed' : ''} ${matched ? 'is-matched' : ''}`}
      disabled={disabled || revealed}
      onClick={() => onFlip(card.cardInstanceId)}
      aria-label={revealed ? `${faceLabel}: ${card.content ?? ''}` : `Thẻ úp số ${card.position + 1}`}
      animate={{ rotateY: revealed ? 180 : 0, scale: matched ? 0.96 : 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!disabled && !revealed && !reduceMotion ? { y: -5, scale: 1.025 } : undefined}
      whileTap={!disabled && !revealed && !reduceMotion ? { scale: 0.96 } : undefined}
    >
      <span className="memory-card__back" aria-hidden={revealed}>
        <span className="memory-card__crest">記</span>
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
      store.destroy()
      storeRef.current = null
    }
  }, [resetUi, sessionId, setConnection, setError, setNotice, setState])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

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
  const canFlip = Boolean(state && state.status === 'RUNNING' && !state.resolving && myTurn && connection === 'online')

  const flip = (cardId: string) => {
    setError(null)
    if (!storeRef.current?.flip(cardId)) setError('Đang mất kết nối, chưa thể lật thẻ')
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
    <main className="memory-shell">
      <header className="memory-header">
        <div>
          <p className="memory-kicker">記憶合わせ · {state.playMode === 'SOLO' ? 'Solo practice' : 'Multiplayer'}</p>
          <h1>Memory Match</h1>
        </div>
        <div className="memory-header__actions">
          <span className={`memory-connection is-${connection}`}><i />{connection === 'online' ? 'Trực tuyến' : connection === 'connecting' ? 'Đang nối' : 'Mất kết nối'}</span>
          {state.playMode === 'SOLO' && (
            <button type="button" className="memory-btn" onClick={togglePause} disabled={pendingPause}>
              {state.status === 'PAUSED' ? '▶ Tiếp tục' : 'Ⅱ Tạm dừng'}
            </button>
          )}
          <a className="memory-btn memory-btn--quiet" href={state.roomId ? `/games/room/${encodeURIComponent(state.roomId)}` : '/games'}>Rời bàn</a>
        </div>
      </header>

      <section className="memory-hud" aria-label="Tiến độ ván chơi">
        <div className="memory-progress">
          <div className="memory-progress__copy">
            <span>Tiến độ</span>
            <strong>{state.pairsMatched} / {state.pairsTotal} cặp</strong>
          </div>
          <div className="memory-progress__track"><motion.i animate={{ width: `${(state.pairsMatched / state.pairsTotal) * 100}%` }} /></div>
        </div>
        <div className="memory-metric"><span>Lượt đã dùng</span><strong>{state.movesUsed}</strong></div>
        {state.movesRemaining != null && <div className="memory-metric"><span>Lượt còn lại</span><strong>{state.movesRemaining}</strong></div>}
        <div className={`memory-metric memory-metric--timer ${turnLeft != null && turnLeft <= 5 ? 'is-urgent' : ''}`}>
          <span>{totalLeft != null ? 'Tổng thời gian' : 'Thời gian lượt'}</span>
          <strong>{totalLeft != null ? formatDuration(totalLeft * 1000) : turnLeft ?? '—'}</strong>
        </div>
      </section>

      <div className="memory-layout">
        <section className="memory-board-wrap">
          <div className="memory-turn" aria-live="polite">
            <span className={myTurn ? 'is-mine' : ''}>{state.status === 'PAUSED' ? 'Ván đang tạm dừng' : myTurn ? 'Lượt của bạn — chọn một thẻ' : `Đang chờ ${state.players.find((p) => p.currentTurn)?.displayName ?? 'đối thủ'}`}</span>
            <small>{state.config.level} · {state.config.pairMode.replaceAll('_', ' ').toLowerCase()}</small>
          </div>
          <div className="memory-board" style={{ '--board-cols': boardColumns } as React.CSSProperties}>
            {state.cards.slice().sort((a, b) => a.position - b.position).map((card) => (
              <MemoryCardButton key={card.cardInstanceId} card={card} disabled={!canFlip} onFlip={flip} reduceMotion={reduceMotion} />
            ))}
          </div>
        </section>

        <aside className="memory-sidebar">
          <div className="memory-panel">
            <div className="memory-panel__head"><h2>{state.playMode === 'SOLO' ? 'Thành tích' : 'Bảng điểm'}</h2><span>{state.players.length} người</span></div>
            <div className="space-y-3">
              {state.players.slice().sort((a, b) => b.pairsFound - a.pairsFound).map((player) => <PlayerChip key={player.userId} player={player} isMe={player.userId === userId} />)}
            </div>
          </div>
          <div className="memory-panel memory-panel--tip">
            <span aria-hidden="true">灯</span>
            <div><h2>Mẹo ghi nhớ</h2><p>Đọc thành tiếng mỗi thẻ vừa lật. Âm thanh và vị trí sẽ tạo hai dấu mốc để nhớ lâu hơn.</p></div>
          </div>
          {me && <div className="memory-self-stats"><span>Chính xác <strong>{me.accuracyPercent ?? 100}%</strong></span><span>Chuỗi tốt nhất <strong>{me.bestStreak}</strong></span></div>}
        </aside>
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
    </main>
  )
}
