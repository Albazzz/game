import React, { useState, type ReactNode } from "react";
import { useAirDefenseStore, SHIPS_CATALOG } from "./game/useAirDefenseStore";
import { PixiBattleCanvas } from "./game/PixiBattleCanvas";
import { Screen } from "./game/types";
import { GAME_CONFIG } from "./game/gameConfig";
import { soundManager } from "./game/soundEffects";

const nav: { id: Screen; icon: string; label: string }[] = [
  { id: "deck", icon: "◈", label: "Command Deck" },
  { id: "hangar", icon: "△", label: "Hangar" },
  { id: "talent", icon: "✦", label: "Talent Lab" },
  { id: "shop", icon: "◉", label: "Supply Dock" },
  { id: "queue", icon: "⌁", label: "Match Queue" },
  { id: "rank", icon: "▤", label: "Rank Archive" }
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
  const { startMatch, setScreen, creditsBalance, equippedShipId } = useAirDefenseStore();
  const currentShip = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];

  return (
    <div className="h-full flex flex-col justify-between gap-4 overflow-y-auto pr-1">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Panel className="relative overflow-hidden p-5 sm:p-7">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />
          <Pill tone="violet">SECTOR 04 · DEEP SPACE LIVE</Pill>
          <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-none">
            THE VOID REMEMBERS<br />
            <span className="text-cyan">EVERY WORD.</span>
          </h1>
          <p className="mt-3 max-w-md text-xs sm:text-sm leading-5 text-slate-300">
            Tự động khóa mục tiêu Laser. Gõ Romaji / Hiragana tiếng Nhật để bắn nổ quái vật không gian.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Action onClick={() => startMatch("endless")}>BẮT ĐẦU ENDLESS →</Action>
            <Action muted onClick={() => setScreen("queue")}>ĐẤU TRƯỜNG ARENA</Action>
          </div>
          <div className="mt-6 grid max-w-md grid-cols-3 border-t border-white/10 pt-4">
            <Stat label="BEST WAVE" value="18" />
            <Stat label="ACCURACY" value="94.2%" tone="violet" />
            <Stat label="CREDITS" value={`◉ ${creditsBalance}`} tone="amber" />
          </div>
        </Panel>

        <Panel className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] text-slate-400">NHIỆM VỤ HÀNG NGÀY</p>
                <h2 className="font-display text-lg font-bold">N5 // SPACE PATROL</h2>
              </div>
              <Pill>03:24:17</Pill>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { text: "Vượt qua Wave 10", progress: "7 / 10", pct: 70 },
                { text: "Độ chính xác trên 90%", progress: "94 / 90", pct: 100 },
                { text: "Thu thập 80 Credits", progress: "42 / 80", pct: 53 }
              ].map((task) => (
                <div key={task.text}>
                  <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                    <span>{task.text}</span>
                    <span className="font-mono text-[10px]">{task.progress}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${task.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="font-mono text-[9px] text-slate-500">PHẦN THƯỞNG</p>
            <p className="font-display text-base text-[#ffc857]">
              + 120 CREDITS <span className="text-xs text-slate-300">/ AUGMENT CHIP</span>
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Panel className="p-5">
          <p className="font-mono text-[9px] text-slate-400 mb-2">TÀU CHIẾN ĐANG TRANG BỊ</p>
          <ShipImage spritePath={currentShip.spritePath} name={currentShip.name} />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">{currentShip.name}</h3>
              <p className="text-xs text-slate-400">{currentShip.role} · HP {currentShip.hp}</p>
            </div>
            <Action muted onClick={() => setScreen("hangar")}>ĐỔI TÀU</Action>
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
  const { equippedShipId, ownedShipIds, equipShip, setScreen } = useAirDefenseStore();

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <Header eyebrow="NHÀ CHỨA TÀU / HANGAR" title="Bộ Sưu Tập Phi Thuyền" detail="Mỗi tàu chiến mang đến tốc độ rơi đạn, lượng giáp và nội tại đặc trưng." />
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
                    {isEquipped ? "ĐANG TRANG BỊ" : "TRANG BỊ TÀU"}
                  </Action>
                ) : (
                  <Action onClick={() => setScreen("shop")} className="w-full">MỞ KHÓA · {ship.price} ◉</Action>
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

function SupplyDock() {
  const { creditsBalance, ownedShipIds, buyShip } = useAirDefenseStore();
  const unowned = SHIPS_CATALOG.filter((s) => !ownedShipIds.includes(s.id));

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <Header eyebrow={`SỐ DƯ CREDITS: ◉ ${creditsBalance}`} title="Cửa Hàng Vũ Trụ (Supply Dock)" detail="Trang bị các mẫu tàu chiến mới với kỹ năng độc quyền." />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr] flex-1">
        <Panel className="overflow-hidden p-6 flex flex-col justify-between">
          {unowned.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 items-center">
              <ShipImage spritePath={unowned[0].spritePath} name={unowned[0].name} />
              <div>
                <Pill tone={unowned[0].colorTheme}>ADVANCED FRAME</Pill>
                <h2 className="font-display mt-2 text-2xl font-bold">{unowned[0].name}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">{unowned[0].passiveDesc}</p>
                <div className="mt-4 flex gap-6">
                  <Stat label="HULL" value={unowned[0].hp} />
                  <Stat label="SPEED" value={`${unowned[0].speed}×`} tone="violet" />
                </div>
                <div className="mt-5">
                  <Action onClick={() => buyShip(unowned[0].id)} disabled={creditsBalance < unowned[0].price}>
                    MỞ KHÓA · {unowned[0].price} ◉
                  </Action>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center my-auto">
              <p className="font-display text-xl text-cyan">ĐÃ SỞ HỮU TOÀN BỘ TÀU CHIẾN!</p>
            </div>
          )}
        </Panel>

        <Panel className="p-5 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[9px] text-slate-400 mb-3">TRẠNG THÁI HANGAR</p>
            <div className="space-y-2.5">
              {SHIPS_CATALOG.map((s) => (
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5" key={s.id}>
                  <span className="font-display text-sm font-semibold">{s.name}</span>
                  <Pill tone={ownedShipIds.includes(s.id) ? "cyan" : "amber"}>
                    {ownedShipIds.includes(s.id) ? "ĐÃ SỞ HỮU" : `GIÁ ${s.price} ◉`}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
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
    inboundBoss
  } = useAirDefenseStore();

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      if (input.trim()) {
        submitAnswer(input);
        setInput("");
      }
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

          {/* Hyper Beam Button & Gauge */}
          <div className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur px-3 py-1 rounded-lg border border-white/10">
            <div className="w-28 sm:w-36">
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
            >
              ⚡ BẮN BEAM
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

      <div className="shrink-0 flex items-center justify-between text-xs">
        <button onClick={() => setScreen("augment")} className="font-mono text-[10px] text-slate-400 hover:text-cyan">
          [Thử Lõi Augment]
        </button>

        {/* Nút Test Clear Wave Nhanh */}
        <button
          onClick={() => useAirDefenseStore.getState().advanceToNextWave()}
          className="rounded-lg border border-amber-400/60 bg-amber-400/15 px-3 py-1 font-mono text-[10px] font-bold text-[#ffc857] transition hover:bg-amber-400/25 hover:border-amber-300 shadow-[0_0_14px_rgba(255,200,87,0.35)]"
          title="Bỏ qua và chuyển sang Wave tiếp theo ngay lập tức"
        >
          ⚡ CLEAR WAVE (TEST)
        </button>

        <button onClick={() => setScreen("debrief")} className="font-mono text-[10px] text-rose-400 hover:text-rose-300">
          [Kết thúc trận]
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
  const people =
    tab === "endless"
      ? [
          ["1", "MIZUKI", "WAVE 42", "204,890"],
          ["2", "AERIS", "WAVE 38", "182,410"],
          ["3", "REN", "WAVE 35", "164,720"],
          ["14", "YOU", "WAVE 18", "62,440"]
        ]
      : [
          ["1", "KAITO", "ELO 2,240", "CELESTIAL"],
          ["2", "MIZUKI", "ELO 2,116", "CELESTIAL"],
          ["3", "AERIS", "ELO 1,804", "DIAMOND"],
          ["27", "YOU", "ELO 1,284", "GOLD"]
        ];

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pr-1 max-w-4xl mx-auto w-full">
      <Header eyebrow="GLOBAL ARCHIVE / TELEMETRY" title="Bảng Xếp Hạng Phi Công" detail="Vinh danh những phi công phản xạ xuất sắc nhất trên toàn vũ trụ." />
      <div className="mb-3 flex gap-2">
        {(["endless", "ranked"] as const).map((x) => (
          <button
            onClick={() => setTab(x)}
            key={x}
            className={`min-h-10 rounded-xl border px-4 font-display text-xs ${
              tab === x ? "border-cyan-300/60 bg-cyan-300/10 text-cyan" : "border-white/10 text-slate-400"
            }`}
          >
            {x === "endless" ? "ENDLESS TOP SCORE" : "PVP ELO RATING"}
          </button>
        ))}
      </div>
      <Panel className="overflow-hidden flex-1">
        <div className="grid grid-cols-[.3fr_1fr_.8fr_.8fr] border-b border-white/10 px-4 py-2.5 font-mono text-[8px] text-slate-500">
          <span>#</span>
          <span>PHI CÔNG</span>
          <span>{tab === "endless" ? "WAVE ĐẠT" : "ELO"}</span>
          <span className="text-right">{tab === "endless" ? "ĐIỂM / RANK" : "HẠNG"}</span>
        </div>
        <div className="divide-y divide-white/5">
          {people.map(([place, name, stat, value]) => (
            <div key={name} className={`grid grid-cols-[.3fr_1fr_.8fr_.8fr] items-center px-4 py-3.5 ${name === "YOU" ? "bg-cyan-300/10" : ""}`}>
              <span className={`font-display text-lg ${place === "1" ? "text-[#ffc857]" : "text-slate-400"}`}>{place}</span>
              <span className="font-display text-sm font-bold">
                {name}
                {name === "YOU" && (
                  <span className="ml-2">
                    <Pill>BẠN</Pill>
                  </span>
                )}
              </span>
              <span className="font-mono text-[9px] text-slate-400">{stat}</span>
              <span className="text-right font-mono text-xs text-cyan">{value}</span>
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

export default function App() {
  const { screen, setScreen, creditsBalance, bgmEnabled, toggleBgm } = useAirDefenseStore();

  const content: Record<Screen, ReactNode> = {
    deck: <Deck />,
    hangar: <Hangar />,
    talent: <TalentLab />,
    shop: <SupplyDock />,
    queue: <MatchQueue />,
    endless: <Battle />,
    pvp: <Battle isPvP />,
    augment: <AugmentDraft />,
    debrief: <Debrief />,
    rank: <RankArchive />
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
    </div>
  );
}
