import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AirDefenseStompAdapter } from './AirDefenseStompAdapter'
import { serverNow, useAirDefenseViewStore } from './AirDefenseViewStore'
import { SoundManager } from './SoundManager'
import { AnswerInput } from './components/AnswerInput'
import { BattlefieldCanvas } from './components/BattlefieldCanvas'
import { GameHUD } from './components/GameHUD'
import { ResultScreen } from './components/ResultScreen'
import type { AirDefensePlayer } from './types'

function secondsLeft(deadline?: string) {
  return deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - serverNow()) / 1000)) : null
}

function formatClock(seconds: number | null) {
  if (seconds == null) return '∞'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function CatOnBattlefield({ player, side }: { player?: AirDefensePlayer; side: 'left' | 'right' }) {
  if (!player) return null
  return (
    <div className={`air-cat air-cat--${side}`} aria-label={`${player.displayName} trên chiến trường`}>
      <div className="air-cat__shadow" />
      <div className="air-cat__portrait">
        {player.avatar ? <img src={player.avatar} alt="" /> : <span aria-hidden="true">🐱</span>}
      </div>
      <span className="air-cat__name">{player.displayName}</span>
    </div>
  )
}

export default function AirDefenseGame({ sessionId }: { sessionId: string }) {
  const snapshot = useAirDefenseViewStore((state) => state.snapshot)
  const connection = useAirDefenseViewStore((state) => state.connection)
  const userId = useAirDefenseViewStore((state) => state.userId)
  const clockSkewMs = useAirDefenseViewStore((state) => state.clockSkewMs)
  const lastEventType = useAirDefenseViewStore((state) => state.lastEventType)
  const lastAction = useAirDefenseViewStore((state) => state.lastAction)
  const error = useAirDefenseViewStore((state) => state.error)
  const adapterRef = useRef<AirDefenseStompAdapter | null>(null)
  const soundRef = useRef(new SoundManager())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [nowTick, setNowTick] = useState(Date.now())
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [pausePending, setPausePending] = useState(false)
  const [replaying, setReplaying] = useState(false)
  const [angle, setAngle] = useState(45)
  const [power, setPower] = useState(70)
  const [skill, setSkill] = useState<'SPREAD' | 'TRIPLE' | 'PIERCING'>('TRIPLE')

  useEffect(() => {
    const store = useAirDefenseViewStore.getState()
    store.reset()
    const adapter = new AirDefenseStompAdapter(sessionId)
    adapterRef.current = adapter
    Promise.all([window.ArenaApi.me(), window.ArenaApi.airDefenseState(sessionId)])
      .then(([me, state]) => {
        useAirDefenseViewStore.getState().setUserId(me.userId)
        useAirDefenseViewStore.getState().applySnapshot(state)
        adapter.connect()
      })
      .catch((cause: Error) => store.setError(cause.message || 'Không thể tải nhiệm vụ'))
    return () => { adapter.destroy(); adapterRef.current = null }
  }, [sessionId])

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (lastEventType === 'ANSWER_CORRECT') {
      setPending(false); setFeedback('correct'); soundRef.current.play('fire')
    } else if (lastEventType === 'ANSWER_INCORRECT') {
      setPending(false); setFeedback('incorrect'); soundRef.current.play('incorrect')
    } else if (lastEventType === 'AIRCRAFT_IMPACTED') {
      setPending(false); soundRef.current.play('impact')
    } else if (lastEventType === 'AIR_DEFENSE_ERROR') {
      setPending(false)
    } else if (lastEventType === 'AIR_DEFENSE_GAME_OVER') {
      setPending(false)
      soundRef.current.play(snapshot?.result?.success ? 'victory' : 'defeat')
    }
    if (lastEventType === 'ANSWER_CORRECT' || lastEventType === 'ANSWER_INCORRECT') {
      const timer = window.setTimeout(() => setFeedback(null), 650)
      return () => window.clearTimeout(timer)
    }
  }, [lastEventType, snapshot?.stateVersion, snapshot?.result?.success])

  const myAircraft = useMemo(() => snapshot && userId != null
    ? snapshot.aircraft.filter((item) => item.targetUserId === userId
        && (item.state === 'ACTIVE' || item.state === 'SPAWNING'))
      .sort((a, b) => new Date(a.impactAt).getTime() - new Date(b.impactAt).getTime())
    : [], [snapshot, userId])
  const target = myAircraft[0]
  const targetSeconds = secondsLeft(target?.impactAt)
  const totalSeconds = secondsLeft(snapshot?.totalDeadlineAt)
  void nowTick

  const submit = (answer: string) => {
    if (!target || pending) return
    setFeedback(null)
    useAirDefenseViewStore.getState().setError(null)
    const commandId = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    if (adapterRef.current?.answer(target.aircraftId, answer, commandId)) setPending(true)
    else useAirDefenseViewStore.getState().setError('Đang mất kết nối, chưa thể gửi đáp án')
  }

  const togglePause = async () => {
    if (!snapshot || pausePending) return
    setPausePending(true)
    try {
      const next = snapshot.status === 'PAUSED'
        ? await window.ArenaApi.airDefenseResume(sessionId)
        : await window.ArenaApi.airDefensePause(sessionId)
      useAirDefenseViewStore.getState().applySnapshot(next)
    } catch (cause) {
      useAirDefenseViewStore.getState().setError(cause instanceof Error ? cause.message : 'Không thể đổi trạng thái')
    } finally { setPausePending(false) }
  }

  const replay = async () => {
    if (!snapshot || replaying) return
    setReplaying(true)
    try {
      const next = await window.ArenaApi.createAirDefenseSolo({
        questionLevel: snapshot.config.level,
        answerMode: snapshot.config.answerMode,
        questionCount: snapshot.config.questionCount,
        secondsPerQuestion: Math.round(snapshot.config.travelTimeMs / 1000),
        extra: {
          objective: snapshot.config.objective,
          difficulty: snapshot.config.difficulty,
          maxHp: snapshot.config.maxHp,
          targetScore: snapshot.config.targetCorrect,
          durationSeconds: snapshot.config.durationSeconds,
          spawnIntervalMs: snapshot.config.spawnIntervalMs
        }
      })
      window.location.href = `/games/air-defense/${encodeURIComponent(next.sessionId)}`
    } catch (cause) {
      useAirDefenseViewStore.getState().setError(cause instanceof Error ? cause.message : 'Không thể tạo nhiệm vụ')
      setReplaying(false)
    }
  }

  if (!snapshot || userId == null) {
    return <main className="air-loading"><div className="air-radar"><i /></div><h1>Đang kết nối đài chỉ huy…</h1><p>{error || 'Đồng bộ chiến trường và câu hỏi'}</p>{error && <a className="air-btn" href="/games">Về sảnh</a>}</main>
  }
  if (snapshot.status === 'FINISHED' || snapshot.status === 'ABORTED') {
    return <ResultScreen state={snapshot} userId={userId} replaying={replaying} onReplay={replay} />
  }

  const orderedPlayers = snapshot.players.slice().sort((a, b) => a.slot - b.slot)
  const disabled = connection !== 'online' || snapshot.status !== 'RUNNING' || !target
  const eventClass = lastEventType === 'ANSWER_CORRECT' ? 'is-hit' : lastEventType === 'ANSWER_INCORRECT' ? 'is-miss' : ''

  return (
    <main className="air-shell">
      <header className="air-topbar">
        <div className="air-topbar__title"><p className="air-kicker">SNOWBALL CATS · ĐẤU TUYẾT</p><h1>Snowball Duel</h1></div>
        <div className="air-topbar__controls">
          <span className={`air-network is-${connection}`}><i />{connection === 'online' ? 'Trực tuyến' : connection === 'connecting' ? 'Đang kết nối' : 'Đang nối lại'}</span>
          <button className="air-icon-btn" type="button" onClick={() => setSoundEnabled(soundRef.current.toggle())} aria-label="Bật tắt âm thanh">{soundEnabled ? '🔊' : '🔇'}</button>
          {snapshot.playMode === 'SOLO' && <button className="air-icon-btn" onClick={togglePause} disabled={pausePending}>{snapshot.status === 'PAUSED' ? '▶' : 'Ⅱ'}</button>}
          <a className="air-icon-btn" href={snapshot.roomId ? `/games/room/${encodeURIComponent(snapshot.roomId)}` : '/games'} aria-label="Rời trận">↪</a>
        </div>
      </header>

      <div className="air-hud-wrap">
        <GameHUD players={snapshot.players} userId={userId} mode={snapshot.playMode} />
        <div className="air-turn-badge" aria-live="polite"><strong>LƯỢT CỦA BẠN</strong><span>{targetSeconds ?? totalSeconds ?? '—'}</span></div>
      </div>

      <section className={`air-battlefield air-battlefield--snow ${eventClass}`}>
        <BattlefieldCanvas state={snapshot} userId={userId} clockSkewMs={clockSkewMs} eventType={lastEventType} action={lastAction} />
        <div className="air-snow-world" aria-hidden="true">
          <div className="air-mountain air-mountain--back" />
          <div className="air-mountain air-mountain--front" />
          <div className="air-cabin" />
          <div className="air-pines air-pines--left" />
          <div className="air-pines air-pines--right" />
          <CatOnBattlefield player={orderedPlayers[0]} side="left" />
          <CatOnBattlefield player={orderedPlayers[1]} side="right" />
          <div className="air-trajectory"><i /></div>
          <div className="air-snow-particles" />
        </div>

        <AnimatePresence mode="wait">
          {target ? (
            <motion.div key={target.aircraftId} className="air-command-card" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
              <AnswerInput
                disabled={disabled}
                pending={pending}
                feedback={feedback}
                prompt={target.questionText}
                onSubmit={submit}
                onSkip={() => setFeedback(null)}
              />
            </motion.div>
          ) : (
            <motion.div className="air-command-card air-command-card--waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="air-sweep" /><strong>ĐANG QUÉT BẦU TRỜI…</strong><span>Mục tiêu tiếp theo sắp vào tầm ngắm</span></motion.div>
          )}
        </AnimatePresence>

        <section className="air-bottom-controls" aria-label="Điều khiển Snowball Duel">
          <div className="air-aim-panel">
            <div className="air-aim-control"><span>GÓC BẮN</span><div><button type="button" aria-label="Giảm góc bắn" onClick={() => setAngle((value) => Math.max(0, value - 5))}>−</button><strong>{angle}°</strong><button type="button" aria-label="Tăng góc bắn" onClick={() => setAngle((value) => Math.min(90, value + 5))}>+</button></div><input aria-label="Góc bắn" type="range" min="0" max="90" step="5" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></div>
            <div className="air-power-control"><div><span>LỰC BẮN</span><strong>{power}%</strong></div><input aria-label="Lực bắn" type="range" min="10" max="100" step="5" value={power} onChange={(event) => setPower(Number(event.target.value))} /><div className="air-power-meter" style={{ '--power': `${power}%` } as React.CSSProperties}><i /></div><small>MIN <b>MAX</b></small></div>
          </div>
          <div className="air-skills" role="group" aria-label="Kỹ năng snowball">
            {([['SPREAD', 'Spread Shot', '1'], ['TRIPLE', 'Triple Shot', '2'], ['PIERCING', 'Piercing Snowball', 'lock']] as const).map(([value, label, badge]) => (
              <button key={value} type="button" className={`air-skill ${skill === value ? 'is-selected' : ''} ${value === 'PIERCING' ? 'is-locked' : ''}`} onClick={() => value !== 'PIERCING' && setSkill(value)} disabled={value === 'PIERCING'} aria-pressed={skill === value}>
                <span className="air-skill__icon">{value === 'SPREAD' ? '◌' : value === 'TRIPLE' ? '⁙' : 'ϟ'}</span><strong>{label}</strong><small>{badge}</small>
              </button>
            ))}
          </div>
        </section>
      </section>

      {error && <div className="air-error" role="alert"><span>{error}</span><button onClick={() => useAirDefenseViewStore.getState().setError(null)} aria-label="Đóng">×</button></div>}
      {(connection === 'offline' || snapshot.status === 'PAUSED') && <div className="air-overlay"><div><span>{snapshot.status === 'PAUSED' ? 'Ⅱ' : '↻'}</span><h2>{snapshot.status === 'PAUSED' ? 'Trận đấu đang tạm dừng' : 'Đang nối lại chiến trường'}</h2><p>{snapshot.status === 'PAUSED' ? 'Mọi thời gian phía máy chủ đã được đóng băng.' : 'Khai hỏa bị khóa tới khi snapshot được đồng bộ.'}</p>{snapshot.status === 'PAUSED' && <button className="air-btn air-btn--primary" onClick={togglePause}>TIẾP TỤC</button>}</div></div>}

      <footer className="air-footer"><div><strong>❄ J-LAS Snowball Cats Arena</strong><span>Winter Gaming Championship 2024</span></div><nav><a href="#">Chính sách</a><a href="#">Hướng dẫn</a><a href="#">Hỗ trợ</a></nav></footer>
    </main>
  )
}
