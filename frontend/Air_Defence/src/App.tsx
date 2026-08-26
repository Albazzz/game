import React, { useState, useEffect, type ReactNode } from "react";
import { useAirDefenseStore, SHIPS_CATALOG } from "./game/useAirDefenseStore";
import { PixiBattleCanvas } from "./game/PixiBattleCanvas";
import { Screen } from "./game/types";
import { GAME_CONFIG } from "./game/gameConfig";
import { soundManager } from "./game/soundEffects";

const nav: { id: Screen; icon: string; label: string }[] = [
  { id: "deck", icon: "◈", label: "Command Deck" },
  { id: "guide", icon: "📖", label: "Hướng Dẫn" },
  { id: "hangar", icon: "△", label: "Hangar & Tàu" },
  { id: "talent", icon: "✦", label: "Talent Lab" },
  { id: "queue", icon: "⌁", label: "Match Queue" },
  { id: "rank", icon: "▤", label: "Rank Archive" },
  { id: "settings", icon: "⚙", label: "Audio & System" },
  { id: "sandbox", icon: "🛠", label: "Dev Sandbox" }
];

function Stat({ label, value, tone = "cyan" }: { label: string; value: string | number; tone?: "cyan" | "amber" | "violet" | "rose" }) {
  const colors = { cyan: "text-cyan", amber: "text-[#ffc857]", violet: "text-[#b990ff]", rose: "text-[#ff6d86]" };
  return (
    <div className="min-w-0">
      <p className="font-mono text-[9px] tracking-[.16em] text-slate-400 uppercase">{label}</p>
      <p className={`font-display text-base sm:text-lg font-semibold ${colors[tone]}`}>{value}</p>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel rounded-2xl ${className}`}>{children}</section>;
}

function Pill({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "amber" | "violet" | "rose" }) {
  const colors = {
    cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan",
    amber: "border-amber-300/30 bg-amber-300/10 text-[#ffc857]",
    violet: "border-violet-300/30 bg-violet-300/10 text-[#c3a6ff]",
    rose: "border-rose-300/30 bg-rose-300/10 text-[#ff8ba0]"
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9px] tracking-wider ${colors[tone]}`}>{children}</span>;
}

function Action({ children, onClick, muted = false, disabled = false, className = "" }: { children: ReactNode; onClick?: () => void; muted?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-10 rounded-xl border px-4 font-display text-xs sm:text-sm font-bold tracking-wide transition flex items-center justify-center ${
        disabled
          ? "opacity-40 cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
          : muted
          ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:-translate-y-0.5"
          : "border-cyan-200/60 bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(85,244,255,.24)] hover:bg-cyan-100 hover:-translate-y-0.5"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ShipImage({ spritePath, name }: { spritePath: string; name: string }) {
  return (
    <div className="relative flex h-28 sm:h-32 items-center justify-center overflow-hidden rounded-xl bg-[#080f21] border border-cyan-300/20">
      <img src={spritePath} alt={name} className="h-16 sm:h-20 object-contain drop-shadow-[0_0_12px_rgba(85,244,255,0.4)]" />
      <span className="absolute bottom-1.5 right-2 font-mono text-[8px] text-slate-500 uppercase">{name}</span>
    </div>
  );
}

function Deck() {
  const { startMatch, setScreen, equippedShipId, endlessLeaderboard } = useAirDefenseStore();
  const currentShip = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];

  const topRankings =
    endlessLeaderboard.length > 0
      ? endlessLeaderboard.slice(0, 4).map((item) => ({
          rank: String(item.rank),
          name: item.displayName,
          score: item.score.toLocaleString(),
          isUser: item.isCurrentUser
        }))
      : [
          { rank: "1", name: "MIZUKI", score: "204,890", isUser: false },
          { rank: "2", name: "AERIS", score: "182,410", isUser: false },
          { rank: "3", name: "REN", score: "164,720", isUser: false },
          { rank: "14", name: "YOU", score: "62,440", isUser: true }
        ];

  return (
    <div className="h-full flex flex-col justify-between gap-4 overflow-y-auto pr-1">
      {/* Top 2-Column Grid: Hero Action on Left, Compact Ranking on Right */}
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />
          <div>
            <Pill tone="violet">SECTOR 04 · DEEP SPACE LIVE</Pill>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-none">
              THE VOID REMEMBERS<br />
              <span className="text-cyan">EVERY WORD.</span>
            </h1>
            <p className="mt-3 max-w-md text-xs sm:text-sm leading-5 text-slate-300">
              Tự động khóa mục tiêu Laser. Gõ Romaji / Hiragana tiếng Nhật để bắn nổ quái vật không gian và tích lũy Credits vĩnh viễn.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Action onClick={() => startMatch("endless")}>BẮT ĐẦU ENDLESS →</Action>
            <Action muted onClick={() => setScreen("queue")}>ĐẤU TRƯỜNG ARENA</Action>
            <Action muted onClick={() => setScreen("guide")} className="border-cyan-300/40 text-cyan bg-cyan-300/10 hover:bg-cyan-300/20">
              📖 HƯỚNG DẪN TÂN BINH
            </Action>
          </div>
        </Panel>

        {/* Compact Ranking Board (Thế chỗ nhiệm vụ hàng ngày) */}
        <Panel className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div>
                <p className="font-mono text-[9px] text-slate-400 tracking-wider">LEADERBOARD TELEMETRY</p>
                <h2 className="font-display text-base font-bold text-white">🏆 BẢNG XẾP HẠNG</h2>
              </div>
              <Pill tone="amber">TOP PILOTS</Pill>
            </div>

            <div className="space-y-2">
              {topRankings.map((r) => (
                <div
                  key={r.name}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 border transition ${
                    r.isUser
                      ? "border-cyan-300/50 bg-cyan-300/15 shadow-[0_0_12px_rgba(85,244,255,0.2)]"
                      : "border-white/5 bg-black/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`font-display text-xs font-extrabold w-5 text-center ${r.rank === "1" ? "text-[#ffc857]" : "text-slate-400"}`}>
                      #{r.rank}
                    </span>
                    <span className="font-display text-xs font-bold truncate">
                      {r.name} {r.isUser && <span className="text-[9px] text-cyan font-normal">(BẠN)</span>}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan">{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setScreen("rank")}
            className="mt-3 text-left font-mono text-xs text-cyan hover:underline decoration-cyan-300/40 underline-offset-4"
          >
            XEM CHI TIẾT RANKING →
          </button>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Panel className="p-5 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[9px] text-slate-400 mb-2">TÀU CHIẾN ĐANG TRANG BỊ</p>
            <ShipImage spritePath={currentShip.spritePath} name={currentShip.name} />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold">{currentShip.name}</h3>
                <p className="text-xs text-slate-400">{currentShip.role} · HP {currentShip.hp} · {currentShip.speed}× SPEED</p>
              </div>
              <Action muted onClick={() => setScreen("hangar")}>ĐỔI TÀU</Action>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] text-slate-400">ARCHIVE REVIEW</p>
                <h2 className="font-display text-lg font-bold">Từ vựng cần ôn tập phản xạ</h2>
              </div>
              <Pill tone="rose">4 TỪ</Pill>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { word: "電車", reading: "でんしゃ" },
                { word: "約束", reading: "やくそく" },
                { word: "病院", reading: "びょういん" },
                { word: "準備", reading: "じゅんび" }
              ].map((w) => (
                <div key={w.word} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                  <p className="font-display text-lg text-cyan">{w.word}</p>
                  <p className="font-mono text-[9px] text-slate-400">{w.reading}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setScreen("debrief")} className="mt-3 text-left font-mono text-xs text-cyan underline decoration-cyan-300/40 underline-offset-4">
            XEM CHI TIẾT TỔNG KẾT →
          </button>
        </Panel>
      </div>
    </div>
  );
}

function Hangar() {
  const { equippedShipId, ownedShipIds, equipShip, buyShip, creditsBalance } = useAirDefenseStore();

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <Header
        eyebrow={`SỐ DƯ CREDITS: ◉ ${creditsBalance}`}
        title="Nhà Chứa Tàu (Hangar)"
        detail="Tự do mua và trang bị bất kỳ phi thuyền nào mà không cần theo thứ tự."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-1">
        {SHIPS_CATALOG.map((ship) => {
          const owned = ownedShipIds.includes(ship.id);
          const isEquipped = equippedShipId === ship.id;
          return (
            <Panel key={ship.id} className="overflow-hidden p-4 flex flex-col justify-between">
              <div>
                <ShipImage spritePath={ship.spritePath} name={ship.name} />
                <div className="mt-3 flex justify-between items-center">
                  <Pill tone={ship.colorTheme}>{ship.role}</Pill>
                  <span className="font-mono text-xs text-slate-400">HP {ship.hp}</span>
                </div>
                <h2 className="font-display mt-2 text-base font-bold">{ship.name}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">{ship.passiveDesc}</p>
              </div>
              <div className="mt-4">
                {owned ? (
                  <Action onClick={() => equipShip(ship.id)} muted={isEquipped} className="w-full">
                    {isEquipped ? "✓ ĐANG TRANG BỊ" : "TRANG BỊ TÀU"}
                  </Action>
                ) : (
                  <Action
                    onClick={() => buyShip(ship.id)}
                    disabled={creditsBalance < ship.price}
                    className="w-full"
                  >
                    MUA TÀU · {ship.price} ◉
                  </Action>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function TalentLab() {
  const { talentLevels, upgradeTalent, creditsBalance } = useAirDefenseStore();
  const nodes = [
    { type: "hull" as const, title: `+${GAME_CONFIG.TALENTS.hullBonusPerLevel} HULL`, sub: "Tăng HP cơ bản", level: talentLevels.hull },
    { type: "coin" as const, title: "COIN VECTOR", sub: `+${GAME_CONFIG.TALENTS.coinBonusPctPerLevel}% Credits`, level: talentLevels.coin },
    { type: "fastStart" as const, title: "FAST START", sub: "Bắt đầu với 1 Lõi", level: talentLevels.fastStart },
    { type: "reroll" as const, title: "EXTRA REROLL", sub: `+${GAME_CONFIG.TALENTS.extraRerollPerLevel} Lượt Reroll`, level: talentLevels.reroll }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <Header eyebrow={`SỐ DƯ: ◉ ${creditsBalance} CREDITS`} title="Viện Nâng Cấp Vĩnh Viễn" detail="Các nâng cấp Talent Tree tồn tại vĩnh viễn qua mọi trận đấu." />
      <Panel className="p-6 flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl grid gap-4 md:grid-cols-4">
          {nodes.map((node) => {
            const active = node.level > 0;
            return (
              <div key={node.title} className={`rounded-xl border p-4 flex flex-col justify-between ${active ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/15 bg-black/25"}`}>
                <div>
                  <Pill tone={active ? "cyan" : "violet"}>LV {node.level}</Pill>
                  <h2 className="font-display mt-3 text-base font-bold">{node.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{node.sub}</p>
                </div>
                <button
                  onClick={() => upgradeTalent(node.type)}
                  disabled={creditsBalance < GAME_CONFIG.TALENTS.upgradeCostCredits}
                  className={`mt-4 min-h-10 w-full rounded-lg border font-mono text-xs font-bold transition ${
                    active ? "border-cyan-300/40 text-cyan hover:bg-cyan-300/10" : "border-white/15 text-slate-300 hover:border-violet-300/50"
                  }`}
                >
                  NÂNG CẤP · {GAME_CONFIG.TALENTS.upgradeCostCredits} ◉
                </button>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}


function MatchQueue() {
  const [selectedMode, setSelectedMode] = useState<"endless" | "pvp">("endless");
  const startMatch = useAirDefenseStore((s) => s.startMatch);

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full">
      <Header eyebrow="ĐẤU TRƯỜNG / MATCH CONTROL" title="Chọn Chế Độ Chiến Đấu" detail="Chơi đơn vô tận hoặc đấu phản xạ 1v1 thời gian thực với đối thủ." />
      <div className="grid gap-4 md:grid-cols-2 flex-1 items-center">
        {[
          { id: "endless" as const, title: "ENDLESS ROGUELIKE", desc: "Sinh tồn qua từng làn sóng quái vật. Chọn Lõi nâng cấp sau mỗi 3 Wave.", icon: "∞" },
          { id: "pvp" as const, title: "1V1 ARENA SURVIVAL", desc: "Đấu phản xạ song song. Gõ chuỗi Combo gửi Mini-Boss sang đối thủ.", icon: "⇄" }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className={`panel h-52 rounded-2xl p-5 text-left transition flex flex-col justify-between ${
              selectedMode === m.id ? "border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_32px_rgba(85,244,255,.12)]" : "hover:border-white/40"
            }`}
          >
            <div>
              <div className="font-display text-4xl text-cyan">{m.icon}</div>
              <h2 className="font-display mt-3 text-xl font-bold">{m.title}</h2>
              <p className="mt-1.5 text-xs text-slate-400">{m.desc}</p>
            </div>
            <p className="font-mono text-[9px] text-cyan">{selectedMode === m.id ? "ĐÃ CHỌN // SẴN SÀNG" : "CHỌN CHẾ ĐỘ"}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3.5">
        <div>
          <p className="font-mono text-[9px] text-slate-400">CƠ CHẾ NHẬP LIỆU</p>
          <p className="text-xs">Tự động bắt mục tiêu · Chấp nhận Romaji, Hiragana, Nghĩa</p>
        </div>
        <Action onClick={() => startMatch(selectedMode)}>KHỞI ĐỘNG CHIẾN TRƯỜNG →</Action>
      </div>
    </div>
  );
}

function Battle({ isPvP = false }: { isPvP?: boolean }) {
  const [input, setInput] = useState("");
  const {
    wave,
    hp,
    maxHp,
    shield,
    score,
    combo,
    creditsEarned,
    hyperBeamCharge,
    submitAnswer,
    fireHyperBeam,
    setScreen,
    inboundBoss,
    openSettings
  } = useAirDefenseStore();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") && hyperBeamCharge >= GAME_CONFIG.PLAYER.hyperBeamMaxCharge) {
        e.preventDefault();
        fireHyperBeam();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [hyperBeamCharge, fireHyperBeam]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      if (input.trim()) {
        submitAnswer(input);
        setInput("");
      }
    } else if ((e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") && hyperBeamCharge >= GAME_CONFIG.PLAYER.hyperBeamMaxCharge) {
      e.preventDefault();
      fireHyperBeam();
    }
  };

  const handleFire = () => {
    if (input.trim()) {
      submitAnswer(input);
      setInput("");
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2.5">
      {/* Top Compact HUD */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-3">
          <Pill tone={isPvP ? "violet" : "cyan"}>{isPvP ? "1V1 ARENA // DUEL" : `ENDLESS // WAVE ${wave.toString().padStart(2, "0")}`}</Pill>
          <h1 className="font-display text-lg sm:text-xl font-bold">{isPvP ? "SECTOR ALPHA // VERSUS KAITO" : "SECTOR 04 — ECHO NEBULA"}</h1>
        </div>
        <div className="flex items-center gap-5">
          <Stat label="SCORE" value={score} />
          <Stat label="COMBO" value={`×${combo}`} tone="violet" />
          <Stat label="CREDITS" value={`+${creditsEarned}`} tone="amber" />
        </div>
      </div>

      {/* PvP Opponent Status Bar */}
      {isPvP && (
        <Panel className="shrink-0 flex items-center justify-between border-violet-300/30 px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-violet-400/20 font-display text-xs text-violet-200">K</span>
            <div>
              <p className="font-display text-xs font-bold">KAITO / OPPONENT</p>
              <p className="font-mono text-[8px] text-slate-400">COMBO ×12 · WAVE {wave}</p>
            </div>
          </div>
          {inboundBoss && <Pill tone="rose">⚠ CẢNH BÁO MINI-BOSS ĐANG RƠI</Pill>}
        </Panel>
      )}

      {/* Main PixiJS Canvas (Fills remaining height smoothly) */}
      <div className="flex-1 min-h-0 w-full relative">
        <PixiBattleCanvas isPvP={isPvP} />

        {/* HUD Overlay inside canvas */}
        <div className="pointer-events-none absolute top-3 left-4 right-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur px-3 py-1 rounded-lg border border-white/10">
            <span className="font-mono text-[10px] text-cyan font-bold">HULL: {hp}/{maxHp}</span>
            {shield > 0 && <span className="font-mono text-[10px] text-[#ffc857] font-bold">SHIELD: {shield}</span>}
          </div>

          {/* Action & Settings Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Hyper Beam Button & Gauge */}
            <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur px-3 py-1 rounded-lg border border-white/10">
              <div className="w-24 sm:w-32">
                <div className="flex justify-between font-mono text-[8px] text-slate-300 mb-0.5">
                  <span>HYPER BEAM</span>
                  <span>{hyperBeamCharge}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full bg-violet-400 transition-all duration-200" style={{ width: `${hyperBeamCharge}%` }} />
                </div>
              </div>
              <button
                onClick={fireHyperBeam}
                disabled={hyperBeamCharge < GAME_CONFIG.PLAYER.hyperBeamMaxCharge}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition ${
                  hyperBeamCharge >= GAME_CONFIG.PLAYER.hyperBeamMaxCharge
                    ? "border-violet-400 bg-violet-500 text-white animate-pulse shadow-[0_0_16px_rgba(169,121,255,.6)]"
                    : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
                title="Bấm phím [SHIFT] để kích hoạt Siêu Pháo Laser"
              >
                ⚡ [SHIFT] BẮN BEAM
              </button>
            </div>

            {/* Quick Settings Button */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1.5 rounded-lg border border-cyan-300/30 text-cyan hover:bg-cyan-300/15 transition font-mono text-[10px] font-bold"
              title="Cài Đặt Âm Thanh"
            >
              <span>⚙</span>
              <span className="hidden sm:inline">CÀI ĐẶT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Compact Typing Input Dock */}
      <Panel className="shrink-0 p-2.5 border-cyan-300/30">
        <div className="mx-auto flex max-w-2xl gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-cyan-300/40 bg-black/40 px-3">
            <span className="mr-2.5 font-mono text-xs text-cyan">›</span>
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                soundManager.playKeyStroke();
              }}
              onKeyDown={onKey}
              placeholder="Gõ cách đọc Romaji / Hiragana của quái vật…"
              autoFocus
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 font-medium"
            />
          </div>
          <Action onClick={handleFire} className="shrink-0">KHÓA BẮN ↵</Action>
        </div>
      </Panel>

      <div className="shrink-0 flex items-center justify-between text-xs px-1">
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">
          AIR DEFENCE TACTICAL SYSTEM // ARENA ENGAGED
        </span>

        <button
          onClick={() => setScreen("debrief")}
          className="font-mono text-[10px] text-rose-400/80 hover:text-rose-300 transition"
        >
          [Rút lui / Kết thúc trận]
        </button>
      </div>
    </div>
  );
}

function AugmentDraft() {
  const { draftAugments, remainingRerolls, selectAugment, rerollAugments } = useAirDefenseStore();
  const [selectedCard, setSelectedCard] = useState<AugmentCard | null>(null);

  const handleSelect = (card: AugmentCard) => {
    if (selectedCard) return;
    setSelectedCard(card);
    soundManager.playAugmentSelect();

    setTimeout(() => {
      selectAugment(card);
      setSelectedCard(null);
    }, 700);
  };

  return (
    <div className="relative h-full flex flex-col justify-center items-center overflow-y-auto pr-1 px-4">
      {/* Selection Flash Burst Overlay */}
      {selectedCard && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/40 backdrop-blur-md animate-pulse">
          <div className="text-center animate-bounce">
            <p className="font-mono text-xs text-cyan tracking-[.35em] uppercase font-bold">SYSTEM UPGRADE COMPLETE</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_0_35px_rgba(85,244,255,0.9)]">
              ✦ ĐÃ KÍCH HOẠT: {selectedCard.title} ✦
            </h2>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <Pill tone="violet">ROGUELIKE TACTICAL AUGMENT</Pill>
          <h1 className="font-display mt-2 text-3xl sm:text-4xl font-bold tracking-wide">
            Chọn <span className="text-[#c3a6ff]">Lõi Nâng Cấp Không Gian</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">Hoàn thành đợt tác chiến 3 Wave · Chọn 1 module lõi để cường hóa phi thuyền.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {draftAugments.map((card) => {
            const isChosen = selectedCard?.id === card.id;
            const isOther = selectedCard && !isChosen;

            const glowBorder =
              card.tone === "cyan"
                ? "hover:border-cyan-400/90 hover:shadow-[0_0_35px_rgba(85,244,255,0.4)]"
                : card.tone === "amber"
                ? "hover:border-amber-400/90 hover:shadow-[0_0_35px_rgba(255,200,87,0.4)]"
                : "hover:border-violet-400/90 hover:shadow-[0_0_35px_rgba(169,121,255,0.4)]";

            const chosenGlow =
              card.tone === "cyan"
                ? "scale-[1.06] border-cyan-300 ring-4 ring-cyan-400/80 shadow-[0_0_50px_rgba(85,244,255,0.8)] bg-cyan-950/60"
                : card.tone === "amber"
                ? "scale-[1.06] border-amber-300 ring-4 ring-amber-400/80 shadow-[0_0_50px_rgba(255,200,87,0.8)] bg-amber-950/60"
                : "scale-[1.06] border-violet-300 ring-4 ring-violet-400/80 shadow-[0_0_50px_rgba(169,121,255,0.8)] bg-violet-950/60";

            return (
              <button
                key={card.id}
                onMouseEnter={() => soundManager.playAugmentHover()}
                onClick={() => handleSelect(card)}
                disabled={Boolean(selectedCard)}
                className={`panel group relative h-72 rounded-2xl p-6 text-left transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isChosen
                    ? chosenGlow
                    : isOther
                    ? "opacity-20 scale-95 pointer-events-none"
                    : `hover:-translate-y-2 hover:scale-[1.02] bg-white/[0.03] border-white/15 ${glowBorder}`
                }`}
              >
                {/* Laser scan line on hover */}
                <div className="absolute inset-0 -translate-y-full group-hover:translate-y-full bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent transition-transform duration-700 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between">
                    <Pill tone={card.tone}>{card.category}</Pill>
                    <span className="font-mono text-[9px] text-slate-500 tracking-wider">TIER 1</span>
                  </div>
                  <div className="font-display mt-4 text-4xl text-[#c3a6ff] transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_16px_rgba(195,166,255,0.8)]">
                    {card.icon}
                  </div>
                  <h2 className="font-display mt-4 text-lg font-bold tracking-wide text-white group-hover:text-cyan transition-colors">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-300 font-normal">{card.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-mono text-[10px] text-cyan font-bold tracking-widest uppercase group-hover:underline">
                    {isChosen ? "ĐANG TÍCH HỢP..." : "CHỌN MODULE →"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">SYS_0{card.id.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Action muted onClick={rerollAugments} disabled={remainingRerolls <= 0 || Boolean(selectedCard)}>
            ↻ ĐỔI LÕI (REROLL) · CÒN {remainingRerolls} LẦN
          </Action>
        </div>
      </div>
    </div>
  );
}

function Debrief() {
  const { score, bestCombo, creditsEarned, wave, weakWords, resetToDeck } = useAirDefenseStore();

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full">
      <div className="text-center">
        <Pill tone="cyan">FLIGHT DEBRIEF / TỔNG KẾT</Pill>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl font-bold text-cyan">HOÀN THÀNH TRẬN ĐẤU</h1>
        <p className="mt-1 text-xs text-slate-400">Đạt tới Wave {wave} · Dữ liệu phản xạ từ vựng đã được lưu trữ.</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[.8fr_1.2fr] flex-1 items-center">
        <Panel className="p-5">
          <p className="font-mono text-[9px] text-slate-400">THỐNG KÊ CHIẾN TRƯỜNG</p>
          <div className="mt-4 grid grid-cols-2 gap-y-4">
            <Stat label="TỔNG ĐIỂM" value={score} />
            <Stat label="COMBO CAO NHẤT" value={`×${bestCombo}`} tone="violet" />
            <Stat label="WAVE ĐẠT ĐƯỢC" value={wave} />
            <Stat label="CREDITS NHẬN ĐƯỢC" value={`+${creditsEarned} ◉`} tone="amber" />
          </div>
          <div className="mt-6">
            <Action onClick={resetToDeck} className="w-full">QUAY VỀ COMMAND DECK</Action>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display text-lg font-bold">Từ vựng cần ôn luyện</h2>
            <Pill tone="rose">{weakWords.length} TỪ</Pill>
          </div>
          <div className="divide-y divide-white/10 max-h-56 overflow-y-auto pr-1">
            {weakWords.length > 0 ? (
              weakWords.map((w, i) => (
                <div className="flex items-center justify-between py-2.5" key={i}>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-base text-cyan">{w.word}</span>
                    <span className="font-mono text-[9px] text-slate-400">{w.reading} ({w.meaning})</span>
                  </div>
                  <span className="font-mono text-[8px] text-rose-300">{w.note}</span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">Tuyệt vời! Không có từ vựng nào bị lỡ phản xạ.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RankArchive() {
  const [tab, setTab] = useState<"endless" | "ranked">("endless");
  const { endlessLeaderboard, rankedLeaderboard, fetchLeaderboards, equippedShipId } = useAirDefenseStore();
  const playerShipName = SHIPS_CATALOG.find((s) => s.id === equippedShipId)?.name || "Vanguard Alpha";

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  const rawList = tab === "endless" ? endlessLeaderboard : rankedLeaderboard;

  const people =
    rawList.length > 0
      ? rawList.map((item) => ({
          rank: String(item.rank),
          name: item.displayName,
          ship: item.shipName || "NOVA-01 KITE",
          shipTone: item.shipTone || ("cyan" as const),
          stat: tab === "endless" ? `WAVE ${item.waveReached || 1}` : `ELO ${item.score}`,
          value: tab === "endless" ? item.score.toLocaleString() : item.rankTier || "GOLD",
          isUser: item.isCurrentUser
        }))
      : tab === "endless"
      ? [
          { rank: "1", name: "MIZUKI", ship: "RAPTOR-7 HYPERION", shipTone: "violet" as const, stat: "WAVE 42", value: "204,890", isUser: false },
          { rank: "2", name: "AERIS", ship: "FROSTBYTE SENTINEL", shipTone: "cyan" as const, stat: "WAVE 38", value: "182,410", isUser: false },
          { rank: "3", name: "REN", ship: "AEGIS DEFENDER", shipTone: "amber" as const, stat: "WAVE 35", value: "164,720", isUser: false },
          { rank: "14", name: "YOU", ship: playerShipName, shipTone: "cyan" as const, stat: "WAVE 18", value: "62,440", isUser: true }
        ]
      : [
          { rank: "1", name: "KAITO", ship: "RAPTOR-7 HYPERION", shipTone: "violet" as const, stat: "ELO 2,240", value: "CELESTIAL", isUser: false },
          { rank: "2", name: "MIZUKI", ship: "FROSTBYTE SENTINEL", shipTone: "cyan" as const, stat: "ELO 2,116", value: "CELESTIAL", isUser: false },
          { rank: "3", name: "AERIS", ship: "AEGIS DEFENDER", shipTone: "amber" as const, stat: "ELO 1,804", value: "DIAMOND", isUser: false },
          { rank: "27", name: "YOU", ship: playerShipName, shipTone: "cyan" as const, stat: "ELO 1,284", value: "GOLD", isUser: true }
        ];

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full">
      <Header
        eyebrow="GLOBAL ARCHIVE / TELEMETRY"
        title="Bảng Xếp Hạng Phi Công"
        detail="Vinh danh những phi công phản xạ xuất sắc nhất trên toàn vũ trụ cùng mẫu tàu chiến trang bị từ Database."
      />
      <div className="mb-3 flex gap-2">
        {(["endless", "ranked"] as const).map((x) => (
          <button
            onClick={() => setTab(x)}
            key={x}
            className={`min-h-10 rounded-xl border px-4 font-display text-xs transition ${
              tab === x ? "border-cyan-300/60 bg-cyan-300/10 text-cyan font-bold" : "border-white/10 text-slate-400 hover:bg-white/5"
            }`}
          >
            {x === "endless" ? "ENDLESS TOP SCORE" : "PVP ELO RATING"}
          </button>
        ))}
      </div>
      <Panel className="overflow-hidden flex-1">
        <div className="grid grid-cols-[.3fr_1fr_1.1fr_.8fr_.8fr] border-b border-white/10 px-4 py-2.5 font-mono text-[8px] text-slate-500 uppercase tracking-wider">
          <span>#</span>
          <span>PHI CÔNG</span>
          <span>TÀU CHIẾN TRANG BỊ</span>
          <span>{tab === "endless" ? "WAVE ĐẠT" : "ELO"}</span>
          <span className="text-right">{tab === "endless" ? "ĐIỂM SỐ" : "HẠNG"}</span>
        </div>
        <div className="divide-y divide-white/5">
          {people.map((p) => (
            <div key={p.name} className={`grid grid-cols-[.3fr_1fr_1.1fr_.8fr_.8fr] items-center px-4 py-3.5 ${p.isUser ? "bg-cyan-300/10 border-l-2 border-cyan-300" : ""}`}>
              <span className={`font-display text-lg ${p.rank === "1" ? "text-[#ffc857] font-bold" : "text-slate-400"}`}>
                {p.rank}
              </span>
              <span className="font-display text-sm font-bold">
                {p.name}
                {p.isUser && (
                  <span className="ml-2">
                    <Pill>BẠN</Pill>
                  </span>
                )}
              </span>
              <div>
                <Pill tone={p.shipTone}>🛸 {p.ship}</Pill>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{p.stat}</span>
              <span className="text-right font-mono text-xs text-cyan font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Header({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <header className="mb-4 shrink-0">
      <p className="font-mono text-[9px] tracking-[.16em] text-cyan uppercase">{eyebrow}</p>
      <h1 className="font-display mt-1 text-2xl sm:text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </header>
  );
}

function GuideManualView() {
  const { setScreen, startMatch } = useAirDefenseStore();
  const [activeTab, setActiveTab] = useState<"combat" | "beam" | "ships" | "upgrades" | "tips">("combat");

  const tabs: { id: "combat" | "beam" | "ships" | "upgrades" | "tips"; label: string; icon: string }[] = [
    { id: "combat", label: "Cơ Chế Chiến Đấu", icon: "🎯" },
    { id: "beam", label: "Hyper Beam (Shift)", icon: "⚡" },
    { id: "ships", label: "Hangar & Tàu Chiến", icon: "🛸" },
    { id: "upgrades", label: "Nâng Cấp & Augment", icon: "🧬" },
    { id: "tips", label: "Vật Phẩm & Mẹo Cao Thủ", icon: "💡" }
  ];

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full space-y-4">
      <Header
        eyebrow="TACTICAL FLIGHT MANUAL // SYSTEM TUTORIAL"
        title="Cẩm Nang Tác Chiến Tân Binh"
        detail="Toàn bộ quy trình điều khiển hỏa lực, kích hoạt Hyper Beam, mua sắm tàu chiến và bí kíp phản xạ từ vựng đỉnh cao."
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`min-h-10 rounded-xl border px-3.5 sm:px-4 font-display text-xs transition flex items-center gap-2 ${
              activeTab === t.id
                ? "border-cyan-300/60 bg-cyan-300/15 text-cyan font-bold shadow-[0_0_15px_rgba(85,244,255,0.25)]"
                : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <Panel className="p-5 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto">
        {activeTab === "combat" && (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Pill tone="cyan">BƯỚC 1: KHÓA MỤC TIÊU & BẮN NỔ</Pill>
              <h2 className="font-display text-xl font-bold mt-2 text-white">Quy Trình Tác Chiến Cơ Bản</h2>
              <p className="text-xs text-slate-300 mt-1">
                Tàu chiến của bạn được trang bị hệ thống Radar tối tân, tự động khóa tia Laser màu xanh vào quái vật nguy hiểm nhất gần phòng tuyến.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-cyan-300/20 text-cyan text-xs font-bold">1</span>
                  <h3 className="font-display text-sm font-bold">Tự Động Khóa Tia Laser</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tia Laser hướng thẳng vào quái vật đang tiến gần nhất. Bạn không cần rê chuột hay nhấp click diệt quái.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-cyan-300/20 text-cyan text-xs font-bold">2</span>
                  <h3 className="font-display text-sm font-bold">Gõ Romaji / Hiragana</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đọc chữ Hán (Kanji) hoặc chữ Hiragana trên thân quái vật và gõ trực tiếp phiên âm qua bàn phím máy tính.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-[#ffc857]/20 text-[#ffc857] text-xs font-bold">3</span>
                  <h3 className="font-display text-sm font-bold">Chuỗi Combo Liên Hoàn</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mỗi từ gõ đúng tăng chuỗi Combo và nhân hệ số điểm thưởng (+10%, +20%...). Gõ sai sẽ làm đứt chuỗi Combo!
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-[#ff8ba0]/20 text-[#ff8ba0] text-xs font-bold">4</span>
                  <h3 className="font-display text-sm font-bold">Bảo Vệ Phòng Tuyến (HP)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đừng để quái vật bay chạm vào vạch phòng tuyến bên dưới. Mỗi va chạm sẽ trừ máu tàu chiến. Khi HP về 0, trận đấu kết thúc!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "beam" && (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Pill tone="amber">VŨ KHÍ TỐI THƯỢNG // HYPER BEAM</Pill>
              <h2 className="font-display text-xl font-bold mt-2 text-white">Chùm Hỏa Lực Plasma Quét Sạch Màn Hình</h2>
              <p className="text-xs text-slate-300 mt-1">
                Kỹ năng Ulti mạnh nhất của tàu chiến, giải nguy tức thì khi quái vật tràn ngập không gian.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <p className="font-mono text-[9px] text-[#ffc857]">CÁCH NẠP NĂNG LƯỢNG</p>
                <p className="text-xs text-slate-300">
                  • Diệt 1 quái thường: <span className="text-cyan font-bold">+5%</span><br />
                  • Diệt Mini Boss: <span className="text-[#ffc857] font-bold">+50%</span><br />
                  • Nhặt viên Hyper Orb: <span className="text-[#c3a6ff] font-bold">+25%</span>
                </p>
              </div>

              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-3.5 space-y-2">
                <p className="font-mono text-[9px] text-cyan">PHÍM KÍCH HOẠT</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-black/40 border border-cyan-300 font-mono text-sm font-bold text-cyan">SHIFT</span>
                  <span className="text-xs text-slate-300">hoặc nút bấm ⚡ BEAM</span>
                </div>
                <p className="text-[11px] text-slate-300">Nhấn khi thanh năng lượng đạt đủ 100%.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <p className="font-mono text-[9px] text-[#ff8ba0]">HIỆU LỰC HỦY DIỆT</p>
                <p className="text-xs text-slate-300">
                  • Nén đạn 0.9s $\rightarrow$ Bắn duy trì 3s.<br />
                  • Bắn nổ toàn bộ quái thường.<br />
                  • Trừ trực tiếp <span className="text-[#ff8ba0] font-bold">3 Sát Thương</span> vào Boss.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 flex items-start gap-2.5 text-xs text-amber-200">
              <span>⚠️</span>
              <p>Lưu ý: Trong 3 giây đang bắn Hyper Beam, quái vật bị quét nổ sẽ không rơi ra Hyper Orb để tránh lạm dụng kích hoạt liên tục vô hạn.</p>
            </div>
          </div>
        )}

        {activeTab === "ships" && (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Pill tone="violet">HANGAR CHIẾN HẠM</Pill>
              <h2 className="font-display text-xl font-bold mt-2 text-white">4 Dòng Tàu Chiến Độc Quyền</h2>
              <p className="text-xs text-slate-300 mt-1">
                Bạn có thể mở khóa và tự do chuyển đổi giữa các phi thuyền trong tab Hangar mà không cần phải mua theo thứ tự.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan-300/20 bg-[#081226] p-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-display text-sm font-bold text-cyan">🛸 NOVA-01 KITE</h3>
                  <Pill tone="cyan">MIỄN PHÍ</Pill>
                </div>
                <p className="font-mono text-[9px] text-slate-400">HP: 100 · TỐC ĐỘ: 1.0x · CÂN BẰNG</p>
                <p className="text-xs text-slate-300 mt-2">Dòng tàu chiến tiêu chuẩn dành cho tân thủ, phản hồi ổn định và dễ làm quen.</p>
              </div>

              <div className="rounded-xl border border-cyan-300/20 bg-[#081226] p-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-display text-sm font-bold text-[#55f4ff]">❄️ FROSTBYTE SENTINEL</h3>
                  <Pill tone="cyan">800 CREDITS</Pill>
                </div>
                <p className="font-mono text-[9px] text-slate-400">HP: 120 · TỐC ĐỘ: 0.8x · KHỐNG CHẾ</p>
                <p className="text-xs text-slate-300 mt-2">Nội tại: Mỗi khi gõ đúng 5 từ liên tiếp, tự động <span className="text-cyan font-bold">đóng băng toàn bộ quái vật</span> trong 2 giây.</p>
              </div>

              <div className="rounded-xl border border-violet-300/20 bg-[#120a26] p-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-display text-sm font-bold text-[#c3a6ff]">⚡ RAPTOR-7 HYPERION</h3>
                  <Pill tone="violet">1200 CREDITS</Pill>
                </div>
                <p className="font-mono text-[9px] text-slate-400">HP: 80 · TỐC ĐỘ: 1.4x · TỐC ĐỘ CAO</p>
                <p className="text-xs text-slate-300 mt-2">Nội tại: Nhận thêm <span className="text-[#c3a6ff] font-bold">+100% điểm Combo</span> mỗi khi tốc độ gõ đạt trên 1.5 từ/giây.</p>
              </div>

              <div className="rounded-xl border border-amber-300/20 bg-[#261a08] p-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-display text-sm font-bold text-[#ffc857]">🛡️ AEGIS DEFENDER</h3>
                  <Pill tone="amber">1500 CREDITS</Pill>
                </div>
                <p className="font-mono text-[9px] text-slate-400">HP: 180 · TỐC ĐỘ: 0.7x · PHÒNG THỦ</p>
                <p className="text-xs text-slate-300 mt-2">Nội tại: Giảm <span className="text-[#ffc857] font-bold">30% sát thương va chạm</span> khi quái vật tiếp cận phá vỡ phòng tuyến.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upgrades" && (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Pill tone="rose">TIẾN TRÌNH & NÂNG CẤP</Pill>
              <h2 className="font-display text-xl font-bold mt-2 text-white">Augment Chips & Viện Nâng Cấp (Talent Lab)</h2>
              <p className="text-xs text-slate-300 mt-1">
                Tăng cường sức mạnh liên tục trong ván đấu và tích lũy nâng cấp vĩnh viễn vào Database.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <h3 className="font-display text-sm font-bold text-cyan">🎲 Augment Draft (Trong Ván)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sau khi vượt qua mỗi Wave, màn hình chọn 1 trong 3 chip bổ trợ sẽ xuất hiện:
                </p>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li><span className="text-cyan font-semibold">Pháo Đôi Plasma:</span> +50% điểm số hạ gục.</li>
                  <li><span className="text-cyan font-semibold">Tia Phản Xạ:</span> Đạn bắn lan sang mục tiêu lân cận.</li>
                  <li><span className="text-cyan font-semibold">Lưới Hút Ngọc:</span> Hút ngọc rơi từ khoảng cách xa hơn.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-2">
                <h3 className="font-display text-sm font-bold text-[#ffc857]">🏛️ Viện Nâng Cấp (Lưu Database Vĩnh Viễn)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dùng Credits tích lũy sau các ván đấu để nâng cấp các chỉ số gốc:
                </p>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li><span className="text-[#ffc857] font-semibold">Gia Cố Thân Tàu:</span> +25 HP vĩnh viễn mỗi cấp.</li>
                  <li><span className="text-[#ffc857] font-semibold">Khai Thác Khoáng Sản:</span> +15% Credits nhặt được.</li>
                  <li><span className="text-[#ffc857] font-semibold">Khởi Động Nhanh:</span> Bắt đầu ván đấu với điểm số thưởng.</li>
                  <li><span className="text-[#ffc857] font-semibold">Bộ Điều Hướng:</span> Thêm lượt Đổi bài (Reroll) Augment.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tips" && (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Pill tone="cyan">BÍ KÍP PHẢN XẠ & CHIẾN LƯỢC</Pill>
              <h2 className="font-display text-xl font-bold mt-2 text-white">Vật Phẩm Rơi & Mẹo Đạt Top 1 Bảng Xếp Hạng</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-display text-xs font-bold text-cyan">
                  <span>💎</span> Credit Crystals
                </div>
                <p className="text-xs text-slate-300">Rơi ra khi diệt quái, tự động bay hút vào tàu chiến để cộng tiền số dư.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#ff8ba0]">
                  <span>❤️</span> Repair Pack
                </div>
                <p className="text-xs text-slate-300">Hộp cứu thương khẩn cấp, nhặt để hồi phục ngay lập tức +30 HP tàu chiến.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#c3a6ff]">
                  <span>🔮</span> Hyper Orb
                </div>
                <p className="text-xs text-slate-300">Khối cầu năng lượng tím, nhặt để nạp tức thì +25% thanh Hyper Beam.</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
              <h3 className="font-display text-sm font-bold text-[#ffc857]">🌟 3 Lời Khuyên Từ Các Phi Công Kỷ Lục</h3>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li><strong className="text-white">Ưu tiên quái vật ở tầm thấp:</strong> Quái vật bay sát phòng tuyến nguy hiểm nhất, hãy nhìn tia Laser xanh để biết quái nào đang được nhắm trước.</li>
                <li><strong className="text-white">Dành Hyper Beam cho Boss:</strong> Khi Mini Boss xuất hiện với nhiều thanh máu, hãy bắn ngay Hyper Beam để trừ sạch 3 HP và quét sạch bầy quái đệ.</li>
                <li><strong className="text-white">Giữ nhịp gõ chính xác:</strong> Điểm số tăng theo cấp số nhân với chuỗi Combo, gõ bình tĩnh và chuẩn xác quan trọng hơn gõ ẩu bị đứt nhịp.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 shrink-0">
          <div className="flex flex-wrap gap-2">
            <Action onClick={() => startMatch("endless")}>BẮT ĐẦU ENDLESS NGAY →</Action>
            <Action muted onClick={() => setScreen("sandbox")}>VÀO PHÒNG TẬP BẮN SANDBOX</Action>
          </div>
          <Action muted onClick={() => setScreen("deck")}>QUAY VỀ SẢNH CHÍNH</Action>
        </div>
      </Panel>
    </div>
  );
}

function AudioSettingsView({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const { audioSettings, updateAudioSettings } = useAirDefenseStore();

  return (
    <div className={`h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full ${isModal ? "p-4" : ""}`}>
      <div className="flex items-center justify-between">
        <Header
          eyebrow="SYSTEM CALIBRATION // AUDIO & ACOUSTICS"
          title="Cài Đặt Âm Thanh & BGM"
          detail="Tùy chỉnh chi tiết âm lượng nhạc nền động, hiệu ứng tác chiến và âm gõ phím cơ."
        />
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="size-9 rounded-xl border border-white/20 bg-white/5 font-display text-base text-slate-300 hover:bg-white/15 hover:text-white transition flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 flex-1 my-2">
        {/* 1. Master Audio */}
        <Panel className="p-4 sm:p-5 border-cyan-300/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Pill tone="cyan">MASTER AUDIO</Pill>
                <h3 className="font-display text-base font-bold mt-1 text-white">Âm Lượng Tổng</h3>
              </div>
              <button
                onClick={() => updateAudioSettings({ masterEnabled: !audioSettings.masterEnabled })}
                className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold border transition ${
                  audioSettings.masterEnabled
                    ? "border-cyan-300 bg-cyan-300/20 text-cyan shadow-[0_0_12px_rgba(85,244,255,0.4)]"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {audioSettings.masterEnabled ? "BẬT [ON]" : "TẮT [OFF]"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Điều khiển công tắc nguồn và mức âm lượng của toàn bộ trò chơi.</p>
          </div>

          <div>
            <div className="flex justify-between font-mono text-xs text-slate-300 mb-1.5">
              <span>MỨC ÂM LƯỢNG CHÍNH</span>
              <span className="text-cyan font-bold">{audioSettings.masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={audioSettings.masterVolume}
              onChange={(e) => updateAudioSettings({ masterVolume: Number(e.target.value) })}
              className="w-full accent-cyan bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </Panel>

        {/* 2. Background Music (BGM) */}
        <Panel className="p-4 sm:p-5 border-violet-300/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Pill tone="violet">ADAPTIVE BGM</Pill>
                <h3 className="font-display text-base font-bold mt-1 text-white">Nhạc Nền Động</h3>
              </div>
              <button
                onClick={() => updateAudioSettings({ bgmEnabled: !audioSettings.bgmEnabled })}
                className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold border transition ${
                  audioSettings.bgmEnabled
                    ? "border-violet-400 bg-violet-400/20 text-violet-300 shadow-[0_0_12px_rgba(169,121,255,0.4)]"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {audioSettings.bgmEnabled ? "BẬT [ON]" : "TẮT [OFF]"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Tự động thích ứng giai điệu: Sảnh Chỉ Huy, Trận Đấu và Đại Chiến Boss.</p>
          </div>

          <div>
            <div className="flex justify-between font-mono text-xs text-slate-300 mb-1.5">
              <span>ÂM LƯỢNG NHẠC NỀN</span>
              <span className="text-[#c3a6ff] font-bold">{audioSettings.bgmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={audioSettings.bgmVolume}
              onChange={(e) => updateAudioSettings({ bgmVolume: Number(e.target.value) })}
              className="w-full accent-violet-400 bg-slate-800 rounded-lg h-2 cursor-pointer mb-3"
            />

            {/* Test BGM Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
              <span className="font-mono text-[9px] text-slate-500 self-center mr-1">THỬ BGM:</span>
              <button
                onClick={() => soundManager.switchBgm("lobby")}
                className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 font-mono text-[9px] text-slate-300 transition"
              >
                🎧 Sảnh
              </button>
              <button
                onClick={() => soundManager.switchBgm("battle")}
                className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 font-mono text-[9px] text-slate-300 transition"
              >
                ⚡ Battle
              </button>
              <button
                onClick={() => soundManager.switchBgm("boss")}
                className="px-2 py-1 rounded-lg border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 font-mono text-[9px] text-rose-300 transition"
              >
                💀 Boss
              </button>
            </div>
          </div>
        </Panel>

        {/* 3. Sound Effects (SFX) */}
        <Panel className="p-4 sm:p-5 border-amber-300/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Pill tone="amber">COMBAT SFX</Pill>
                <h3 className="font-display text-base font-bold mt-1 text-white">Hiệu Ứng Chiến Đấu</h3>
              </div>
              <button
                onClick={() => updateAudioSettings({ sfxEnabled: !audioSettings.sfxEnabled })}
                className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold border transition ${
                  audioSettings.sfxEnabled
                    ? "border-amber-400 bg-amber-400/20 text-[#ffc857] shadow-[0_0_12px_rgba(255,200,87,0.4)]"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {audioSettings.sfxEnabled ? "BẬT [ON]" : "TẮT [OFF]"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Âm thanh bắn Laser, quái nổ, nhặt tinh thể pha lê và năng lượng beam.</p>
          </div>

          <div>
            <div className="flex justify-between font-mono text-xs text-slate-300 mb-1.5">
              <span>ÂM LƯỢNG HIỆU ỨNG</span>
              <span className="text-[#ffc857] font-bold">{audioSettings.sfxVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={audioSettings.sfxVolume}
              onChange={(e) => updateAudioSettings({ sfxVolume: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg h-2 cursor-pointer mb-3"
            />

            {/* Test SFX Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
              <span className="font-mono text-[9px] text-slate-500 self-center mr-1">THỬ SFX:</span>
              <button
                onClick={() => soundManager.playLaser()}
                className="px-2 py-1 rounded-lg border border-cyan-300/30 bg-cyan-300/10 hover:bg-cyan-300/20 font-mono text-[9px] text-cyan transition"
              >
                ⚡ Laser
              </button>
              <button
                onClick={() => soundManager.playExplosion()}
                className="px-2 py-1 rounded-lg border border-amber-300/30 bg-amber-300/10 hover:bg-amber-300/20 font-mono text-[9px] text-[#ffc857] transition"
              >
                💥 Nổ Quái
              </button>
              <button
                onClick={() => soundManager.playItemCollect("CREDIT_CRYSTAL")}
                className="px-2 py-1 rounded-lg border border-amber-300/30 bg-amber-300/10 hover:bg-amber-300/20 font-mono text-[9px] text-[#ffc857] transition"
              >
                💎 Nhặt Đá
              </button>
              <button
                onClick={() => soundManager.playWaveClear()}
                className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 font-mono text-[9px] text-slate-300 transition"
              >
                🏆 Thắng Wave
              </button>
            </div>
          </div>
        </Panel>

        {/* 4. Keystroke Typing Audio */}
        <Panel className="p-4 sm:p-5 border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Pill tone="cyan">KEYSTROKE SFX</Pill>
                <h3 className="font-display text-base font-bold mt-1 text-white">Âm Gõ Phím Cơ Sci-Fi</h3>
              </div>
              <button
                onClick={() => updateAudioSettings({ keystrokeEnabled: !audioSettings.keystrokeEnabled })}
                className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold border transition ${
                  audioSettings.keystrokeEnabled
                    ? "border-cyan-300 bg-cyan-300/20 text-cyan shadow-[0_0_12px_rgba(85,244,255,0.4)]"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {audioSettings.keystrokeEnabled ? "BẬT [ON]" : "TẮT [OFF]"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Tạo tiếng clicky nhịp nhàng mỗi khi gõ phím vào ô nhập từ vựng tiếng Nhật.</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              onClick={() => soundManager.playKeyStroke()}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 font-mono text-xs text-slate-200 transition"
            >
              ⌨ Thử Gõ Phím
            </button>
            <button
              onClick={() =>
                updateAudioSettings({
                  masterEnabled: true,
                  masterVolume: 80,
                  bgmEnabled: true,
                  bgmVolume: 70,
                  sfxEnabled: true,
                  sfxVolume: 85,
                  keystrokeEnabled: true
                })
              }
              className="px-3 py-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 font-mono text-[10px] font-bold text-rose-300 transition"
            >
              ↺ KHÔI PHỤC MẶC ĐỊNH
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DevSandboxView() {
  const {
    wave,
    hp,
    maxHp,
    score,
    combo,
    creditsEarned,
    hyperBeamCharge,
    targets,
    godMode,
    autoPilot,
    gameTimeScale,
    toggleGodMode,
    toggleAutoPilot,
    setGameTimeScale,
    jumpToWave,
    spawnBossInstantly,
    forceAugmentDraft,
    triggerLootBurst,
    addCredits,
    maxHyperBeam,
    healPlayer,
    damagePlayer,
    triggerWaveClear,
    killTargetById,
    startMatch,
    openSettings,
    resetSandbox,
    playIntroSequence,
    fireHyperBeam,
    equippedShipId,
    equipShip
  } = useAirDefenseStore();

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-3">
      {/* Top Sandbox Header & Telemetry */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-3">
          <Pill tone="amber">🛠 DEVELOPER SANDBOX // NO-JAPANESE MODE</Pill>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white">
            Phòng Thí Nghiệm & Bảng Điều Khiển Dev
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Reset Sandbox Button */}
          <button
            onClick={resetSandbox}
            className="px-2.5 py-1 rounded-lg border border-rose-400/40 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-mono text-[10px] font-bold transition flex items-center gap-1.5"
            title="Khởi tạo lại trạng thái Sandbox về Wave 1"
          >
            <span>↺</span>
            <span>RESET SANDBOX</span>
          </button>

          {/* God Mode Toggle */}
          <button
            onClick={toggleGodMode}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition flex items-center gap-1.5 ${
              godMode
                ? "border-amber-400 bg-amber-400/20 text-[#ffc857] shadow-[0_0_15px_rgba(255,200,87,0.5)]"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            <span>🛡</span>
            <span>GOD MODE: {godMode ? "ON" : "OFF"}</span>
          </button>

          {/* Auto-Pilot Bot Toggle */}
          <button
            onClick={toggleAutoPilot}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition flex items-center gap-1.5 ${
              autoPilot
                ? "border-cyan-300 bg-cyan-300/20 text-cyan shadow-[0_0_15px_rgba(85,244,255,0.5)] animate-pulse"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            <span>🤖</span>
            <span>AUTO-PILOT: {autoPilot ? "RUNNING" : "OFF"}</span>
          </button>

          {/* Quick Settings */}
          <button
            onClick={openSettings}
            className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 font-mono text-[10px]"
          >
            ⚙ Âm Thanh
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Pixi Battle Viewport, Right is Dev Control Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3">
        {/* Left: Canvas & Click-to-Kill HUD */}
        <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-cyan-300/30 bg-[#070a12]">
          <div className="absolute top-2 left-3 z-20 pointer-events-none flex gap-2">
            <span className="font-mono text-[9px] text-cyan bg-black/60 px-2 py-0.5 rounded border border-cyan-300/30">
              CLICK VÀO QUÁI ĐỂ BẮN HẠ (CLICK-TO-KILL)
            </span>
            <span className="font-mono text-[9px] text-[#ffc857] bg-black/60 px-2 py-0.5 rounded border border-amber-300/30">
              WAVE {wave} · MÁU: {hp}/{maxHp}
            </span>
          </div>

          <PixiBattleCanvas />
        </div>

        {/* Right: Master Dev Control Deck */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {/* 1. Wave & Boss Testing Deck */}
          <Panel className="p-3 border-cyan-300/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-cyan font-bold tracking-widest uppercase">1. QUẢN LÝ LÀN SÓNG & BOSS</span>
              <span className="font-mono text-[9px] text-slate-400">WAVE {wave}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <button
                onClick={triggerWaveClear}
                className="px-2 py-1.5 rounded-lg border border-cyan-300/50 bg-cyan-300/15 hover:bg-cyan-300/25 font-mono text-[10px] font-bold text-cyan transition text-left"
              >
                ⚡ Clear Wave Ngay
              </button>
              <button
                onClick={spawnBossInstantly}
                className="px-2 py-1.5 rounded-lg border border-rose-400/50 bg-rose-500/15 hover:bg-rose-500/25 font-mono text-[10px] font-bold text-rose-300 transition text-left"
              >
                👾 Spawn Boss (Wave {wave})
              </button>
            </div>

            <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
              <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">Nhảy Wave:</span>
              {[1, 3, 5, 10, 15, 20].map((w) => (
                <button
                  key={w}
                  onClick={() => jumpToWave(w)}
                  className={`px-2 py-1 rounded font-mono text-[9px] border transition ${
                    wave === w
                      ? "border-cyan-300 bg-cyan-300 text-black font-bold"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/15"
                  }`}
                >
                  W{w}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 mt-2">
              <button
                onClick={forceAugmentDraft}
                className="flex-1 px-2 py-1 rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 font-mono text-[9px] text-[#c3a6ff]"
              >
                ✨ Mở Chọn Lõi (Augment)
              </button>
              <button
                onClick={() => playIntroSequence("sandbox")}
                className="px-2 py-1 rounded border border-cyan-300/40 bg-cyan-300/10 hover:bg-cyan-300/20 font-mono text-[9px] text-cyan"
              >
                🚀 Chạy Intro Sandbox
              </button>
            </div>
          </Panel>

          {/* 2. Loot & Drop Mechanics */}
          <Panel className="p-3 border-amber-300/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-[#ffc857] font-bold tracking-widest uppercase">2. TEST RƠI VẬT PHẨM & CREDITS</span>
              <span className="font-mono text-[9px] text-[#ffc857]">◉ {creditsEarned}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerLootBurst(10)}
                className="px-2 py-1.5 rounded-lg border border-amber-300/40 bg-amber-300/10 hover:bg-amber-300/20 font-mono text-[9px] font-bold text-[#ffc857] text-left"
              >
                💎 Rơi 10x Credits Gems
              </button>
              <button
                onClick={() => {
                  useAirDefenseStore.getState().spawnLoot(50, 40, true);
                }}
                className="px-2 py-1.5 rounded-lg border border-amber-300/40 bg-amber-300/10 hover:bg-amber-300/20 font-mono text-[9px] font-bold text-[#ffc857] text-left"
              >
                ⭐ Bung Nổ Kho Báu Boss
              </button>
              <button
                onClick={() => addCredits(5000)}
                className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 font-mono text-[9px] text-slate-300 text-left"
              >
                💰 +5,000 Credits
              </button>
              <button
                onClick={maxHyperBeam}
                className="px-2 py-1.5 rounded-lg border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 font-mono text-[9px] font-bold text-[#c3a6ff] text-left"
              >
                ⚡ Nạp 100% Hyper Beam
              </button>
              <button
                onClick={fireHyperBeam}
                disabled={hyperBeamCharge < 100}
                className={`col-span-2 px-2 py-1.5 rounded-lg border font-mono text-[9px] font-bold text-center transition ${
                  hyperBeamCharge >= 100
                    ? "border-violet-400 bg-violet-500 text-white animate-pulse shadow-[0_0_15px_rgba(169,121,255,0.6)]"
                    : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
              >
                ⚡ BẮN HYPER BEAM ({hyperBeamCharge}% CHARGE)
              </button>
            </div>
          </Panel>

          {/* 3. Player Health & Simulation Speed */}
          <Panel className="p-3 border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-slate-300 font-bold tracking-widest uppercase">3. MÁU & TỐC ĐỘ SIMULATION</span>
              <span className="font-mono text-[9px] text-cyan">{gameTimeScale}x TỐC ĐỘ</span>
            </div>

            <div className="flex gap-1.5 mb-2">
              {[0, 0.5, 1.0, 2.0, 4.0].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setGameTimeScale(scale)}
                  className={`flex-1 py-1 rounded font-mono text-[9px] border transition ${
                    gameTimeScale === scale
                      ? "border-cyan-300 bg-cyan-300/20 text-cyan font-bold"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {scale === 0 ? "⏸ Freeze" : `${scale}x`}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => healPlayer(50)}
                className="flex-1 px-2 py-1 rounded border border-cyan-300/30 bg-cyan-300/10 hover:bg-cyan-300/20 font-mono text-[9px] text-cyan"
              >
                ✚ Hồi +50 HP
              </button>
              <button
                onClick={() => damagePlayer(25)}
                className="flex-1 px-2 py-1 rounded border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 font-mono text-[9px] text-rose-300"
              >
                💔 Trừ -25 HP
              </button>
            </div>
          </Panel>

          {/* 4. Active Targets List with 1-Click Kill (No Japanese needed) */}
          <Panel className="p-3 border-white/10 flex-1 flex flex-col min-h-48">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-slate-300 font-bold tracking-widest uppercase">4. DANH SÁCH QUÁI ĐANG BAY ({targets.filter((t) => !t.isDead).length})</span>
              <span className="font-mono text-[8px] text-slate-500">BẤM NÚT ĐỂ DIỆT</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1 max-h-52">
              {targets.filter((t) => !t.isDead).length === 0 ? (
                <p className="font-mono text-[10px] text-slate-500 text-center py-4">Không có quái vật nào trên màn hình</p>
              ) : (
                targets
                  .filter((t) => !t.isDead)
                  .map((t, idx) => (
                    <div key={t.id} className="flex items-center justify-between py-1.5 gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-bold text-cyan">{t.word}</span>
                          <span className="font-mono text-[9px] text-slate-300">({t.reading})</span>
                          {t.type === "MINI_BOSS" && <Pill tone="rose">BOSS HP: {t.currentHp}</Pill>}
                        </div>
                        <p className="font-mono text-[8px] text-slate-400 truncate">Nghĩa: {t.meaning} · Y: {Math.round(t.posY)}%</p>
                      </div>

                      <button
                        onClick={() => killTargetById(t.id)}
                        className="shrink-0 px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/40 font-mono text-[9px] font-bold text-rose-300 transition"
                      >
                        ⚡ Diệt ({idx + 1})
                      </button>
                    </div>
                  ))
              )}
            </div>
          </Panel>

          {/* 5. Ship Selector & Instant Switcher */}
          <Panel className="p-3 border-cyan-300/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-cyan font-bold tracking-widest uppercase">
                5. CHỌN TÀU CHIẾN (INSTANT SWITCH)
              </span>
              <span className="font-mono text-[9px] text-[#55f4ff] font-bold">
                {SHIPS_CATALOG.find((s) => s.id === equippedShipId)?.name || equippedShipId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SHIPS_CATALOG.map((s) => {
                const isEquipped = equippedShipId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => equipShip(s.id)}
                    className={`px-2 py-1.5 rounded-lg border font-mono text-[9px] text-left transition flex flex-col justify-between ${
                      isEquipped
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan font-bold shadow-[0_0_12px_rgba(85,244,255,0.4)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="truncate font-bold">{s.name}</span>
                      {isEquipped && <span className="text-[8px] text-cyan font-extrabold">✓ CHỌN</span>}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5">HP {s.hp} · {s.role}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {
    screen,
    setScreen,
    creditsBalance,
    bgmEnabled,
    toggleBgm,
    isSettingsOpen,
    closeSettings,
    openSettings,
    syncWithBackend
  } = useAirDefenseStore();

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const content: Record<Screen, ReactNode> = {
    deck: <Deck />,
    guide: <GuideManualView />,
    hangar: <Hangar />,
    talent: <TalentLab />,
    shop: <Hangar />,
    queue: <MatchQueue />,
    endless: <Battle />,
    pvp: <Battle isPvP />,
    augment: <AugmentDraft />,
    debrief: <Debrief />,
    rank: <RankArchive />,
    settings: <AudioSettingsView />,
    sandbox: <DevSandboxView />
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070a12] text-slate-100 flex">
      {/* Compact Sidebar Navigation */}
      <aside className="z-20 flex w-16 sm:w-20 lg:w-56 flex-col border-r border-white/10 bg-[#070b16]/90 px-2 py-4 backdrop-blur-xl shrink-0">
        <button onClick={() => setScreen("deck")} className="mb-5 flex items-center gap-2.5 px-1.5 text-left">
          <span className="grid size-8 place-items-center border border-cyan-300/70 bg-cyan-300/10 font-display text-lg text-cyan">A</span>
          <span className="hidden font-display text-base font-bold leading-tight lg:block">
            AIR<br />
            <span className="text-cyan">DEFENCE</span>
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setScreen(n.id)}
              className={`flex min-h-10 shrink-0 items-center gap-2.5 rounded-xl px-2.5 text-left transition ${
                screen === n.id ? "bg-cyan-300/15 text-cyan border border-cyan-300/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="font-display text-lg">{n.icon}</span>
              <span className="hidden font-display text-xs font-semibold lg:block">{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Audio / BGM Toggle */}
        <div className="mt-2 border-t border-white/10 pt-2">
          <button
            onClick={toggleBgm}
            className={`w-full flex min-h-8 items-center gap-2 rounded-xl px-2.5 text-left transition font-mono text-[10px] ${
              bgmEnabled
                ? "text-cyan bg-cyan-300/10 border border-cyan-300/30"
                : "text-slate-500 bg-white/5 border border-white/10"
            }`}
            title="Bật/Tắt Nhạc Nền Tự Động"
          >
            <span>{bgmEnabled ? "♫" : "🔇"}</span>
            <span className="hidden lg:block">{bgmEnabled ? "BGM: ON" : "BGM: OFF"}</span>
          </button>
        </div>

        {/* Return to Arena Hub Button */}
        <div className="mt-2 border-t border-white/10 pt-2">
          <a
            href="/games"
            className="flex min-h-10 items-center gap-2.5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-2.5 text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-400"
            title="Thoát về Arena Hub"
          >
            <span className="font-display text-base">←</span>
            <span className="hidden font-display text-[11px] font-bold tracking-wider lg:block uppercase">VỀ ARENA</span>
          </a>
        </div>

        {/* Pilot Telemetry */}
        <div className="mt-auto hidden rounded-xl border border-white/10 bg-white/5 p-2.5 lg:block">
          <p className="font-mono text-[8px] text-slate-500">PILOT TELEMETRY</p>
          <p className="font-display mt-0.5 text-xs font-bold">PILOT_01</p>
          <p className="font-mono text-[9px] text-[#ffc857]">◉ {creditsBalance} CREDITS</p>
        </div>
      </aside>

      {/* Main Full-Viewport Content Area */}
      <main className="flex-1 h-screen overflow-hidden p-4 sm:p-5 lg:p-6 min-w-0">
        {content[screen]}
      </main>

      {/* Quick Audio Settings Modal Overlay (Accessible during Battle) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-300/40 bg-[#070d1a] shadow-[0_0_50px_rgba(85,244,255,0.25)] p-5">
            <AudioSettingsView isModal onClose={closeSettings} />
          </div>
        </div>
      )}
    </div>
  );
}
