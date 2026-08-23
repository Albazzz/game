import { motion } from 'framer-motion'
import type { AirDefenseState } from '../types'

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function ResultScreen({ state, userId, replaying, onReplay }: {
  state: AirDefenseState
  userId: number
  replaying: boolean
  onReplay: () => void
}) {
  const me = state.players.find((player) => player.userId === userId)
  const result = state.result
  const won = result?.success
  const title = state.playMode === 'SOLO'
    ? won ? 'Phòng tuyến vững vàng!' : 'Kết thúc nhiệm vụ'
    : result?.draw ? 'Bất phân thắng bại' : won ? 'Chiến thắng!' : 'Thất bại'
  return (
    <motion.main className="air-result-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="air-result" initial={{ y: 28, scale: .97 }} animate={{ y: 0, scale: 1 }}>
        <div className={`air-result__emblem ${won ? 'is-win' : ''}`} aria-hidden="true">{won ? '勝' : '戦'}</div>
        <p className="air-kicker">MISSION REPORT · {result?.ranked ? 'RANKED 1V1' : 'UNRANKED SOLO'}</p>
        <h1>{title}</h1>
        <p>{state.config.objective.replaceAll('_', ' ')} · {state.config.difficulty}</p>
        {result?.personalBest && <div className="air-result__personal-best">★ KỶ LỤC CÁ NHÂN MỚI</div>}
        <div className="air-result__stats">
          <span><strong>{me?.score.toLocaleString('vi-VN') ?? 0}</strong>Điểm</span>
          <span><strong>{me?.correctAnswers ?? 0}</strong>Câu đúng</span>
          <span><strong>{me?.incorrectAnswers ?? 0}</strong>Câu sai</span>
          <span><strong>{me?.accuracyPercent ?? 0}%</strong>Chính xác</span>
          <span><strong>×{me?.bestCombo ?? 0}</strong>Combo tốt nhất</span>
          <span><strong>{me?.averageResponseMs == null ? '—' : `${(me.averageResponseMs / 1000).toFixed(1)}s`}</strong>Phản hồi TB</span>
          <span><strong>{formatDuration(result?.durationMs ?? state.elapsedMs)}</strong>Thời gian</span>
          {result?.ranked && <span><strong>—</strong>Rating (Phase 4)</span>}
        </div>
        {!!result?.review.length && (
          <div className="air-review">
            <h2>Mục tiêu cần ôn lại</h2>
            {result.review.map((item, index) => (
              <div key={`${item.questionText}-${index}`}>
                <strong className="jp">{item.questionText}</strong>
                <span>Đáp án: <b>{item.expectedAnswer}</b>{item.submittedAnswer ? ` · Bạn nhập: ${item.submittedAnswer}` : ' · Đã bỏ lỡ'}</span>
              </div>
            ))}
          </div>
        )}
        <div className="air-result__actions">
          {state.playMode === 'SOLO' && <button className="air-btn air-btn--primary" onClick={onReplay} disabled={replaying}>{replaying ? 'ĐANG CHUẨN BỊ…' : 'CHƠI LẠI'}</button>}
          <a className="air-btn" href={state.roomId ? `/games/room/${encodeURIComponent(state.roomId)}` : '/games'}>{state.roomId ? 'TÁI ĐẤU TRONG PHÒNG' : 'VỀ SẢNH'}</a>
        </div>
      </motion.section>
    </motion.main>
  )
}
