import type { AirDefensePlayer } from '../types'

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase()
}

function PlayerHUD({ player, isMe, side }: {
  player: AirDefensePlayer
  isMe: boolean
  side: 'left' | 'right'
}) {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / Math.max(1, player.maxHp)) * 100))

  return (
    <article className={`air-player-hud air-player-hud--${side} ${isMe ? 'is-me' : ''}`}>
      <div className="air-player-hud__avatar">
        {player.avatar ? <img src={player.avatar} alt="" /> : <span>{initials(player.displayName)}</span>}
      </div>
      <div className="air-player-hud__main">
        <div><strong>{player.displayName}</strong>{isMe && <span>BẠN</span>}</div>
        <div className="air-hearts" aria-label={`${player.hp} trên ${player.maxHp} HP`}>
          <i className="air-hp-track"><b style={{ width: `${hpPercent}%` }} /></i>
        </div>
      </div>
      <div className="air-player-hud__stats">
        <span><small>ĐIỂM</small><strong>{player.score.toLocaleString('vi-VN')}</strong></span>
        <span><small>COMBO</small><strong>×{player.combo}</strong></span>
      </div>
    </article>
  )
}

export function GameHUD({ players, userId, mode }: {
  players: AirDefensePlayer[]
  userId: number
  mode: 'SOLO' | 'MULTIPLAYER'
}) {
  const ordered = players.slice().sort((a, b) => a.slot - b.slot)

  return (
    <section className={`air-hud ${mode === 'SOLO' ? 'is-solo' : ''}`} aria-label="Chỉ số người chơi">
      {ordered.map((player, index) => (
        <PlayerHUD
          key={player.userId}
          player={player}
          side={index === 0 ? 'left' : 'right'}
          isMe={player.userId === userId}
        />
      ))}
    </section>
  )
}
