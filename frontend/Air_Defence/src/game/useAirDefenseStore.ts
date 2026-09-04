import { create } from "zustand";
import { AugmentCard, AudioSettings, FloatingText, GameMode, LootItem, LootItemType, Screen, TargetWord, WeakWord } from "./types";
import { GAME_CONFIG } from "./gameConfig";
import { soundManager } from "./soundEffects";
import { fetchShopDataApi, buyShipApi, equipShipApi, upgradeTalentApi, recordMatchFinishApi, fetchLeaderboardApi, LeaderboardItem } from "./apiClient";
import { matchesTargetWord, romajiToHiragana } from "./romajiConverter";
import { ComboMilestoneData } from "./ComboSplashOverlay";

export const SHIPS_CATALOG = GAME_CONFIG.SHIPS;

export const AUGMENTS_POOL: AugmentCard[] = [
  {
    id: "DUAL_CANNON",
    title: "PHÁO ĐÔI PLASMA",
    category: "OFFENSE",
    description: "Tăng +50% điểm số nhận được mỗi khi bắn nổ quái vật.",
    icon: "⇶",
    tone: "cyan"
  },
  {
    id: "CRYO_PAYLOAD",
    title: "ĐẠN ĐÓNG BĂNG",
    category: "CONTROL",
    description: "Giảm 35% tốc độ rơi của toàn bộ quái vật không gian.",
    icon: "❄",
    tone: "violet"
  },
  {
    id: "GOLD_MAGNET",
    title: "NAM CHÂM CREDITS",
    category: "UTILITY",
    description: "Tăng +50% số Credits thu thập được sau mỗi lượt gõ.",
    icon: "◉",
    tone: "amber"
  },
  {
    id: "SHIELD_BARRIER",
    title: "LÁ CHẮN LƯỢNG TỬ",
    category: "DEFENSE",
    description: "Tạo ngay 3 điểm giáp chặn sát thương khi quái tiếp cận.",
    icon: "⛨",
    tone: "cyan"
  },
  {
    id: "REPAIR_NANO",
    title: "NANO HỒI PHỤC",
    category: "SURVIVAL",
    description: "Hồi ngay lập tức 30% lượng HP tối đa của phi thuyền.",
    icon: "✚",
    tone: "amber"
  },
  {
    id: "CHRONO_FREEZE",
    title: "NGƯNG ĐỌNG THỜI GIAN",
    category: "TACTICAL",
    description: "Tạm dừng sự di chuyển của quái vật trong 4 giây sau mỗi 5 Combo.",
    icon: "⏱",
    tone: "violet"
  }
];

export const EXTENDED_VOCABULARY = [
  { word: "学校", reading: "がっこう", meaning: "trường học" },
  { word: "先生", reading: "せんせい", meaning: "giáo viên" },
  { word: "学生", reading: "がくせい", meaning: "học sinh" },
  { word: "電車", reading: "でんしゃ", meaning: "tàu điện" },
  { word: "約束", reading: "やくそく", meaning: "lời hứa" },
  { word: "病院", reading: "びょういん", meaning: "bệnh viện" },
  { word: "準備", reading: "じゅんび", meaning: "chuẩn bị" },
  { word: "友達", reading: "ともだち", meaning: "bạn bè" },
  { word: "勉強", reading: "べんきょう", meaning: "học tập" },
  { word: "日本語", reading: "にほんご", meaning: "tiếng Nhật" },
  { word: "時間", reading: "じかん", meaning: "thời gian" },
  { word: "飛行機", reading: "ひこうき", meaning: "máy bay" },
  { word: "宇宙", reading: "うちゅう", meaning: "vũ trụ" },
  { word: "星", reading: "ほし", meaning: "ngôi sao" },
  { word: "未来", reading: "みらい", meaning: "tương lai" },
  { word: "希望", reading: "きぼう", meaning: "hy vọng" },
  { word: "勇気", reading: "ゆうき", meaning: "dũng khí" },
  { word: "世界", reading: "せかい", meaning: "thế giới" },
  { word: "平和", reading: "へいわ", meaning: "hòa bình" },
  { word: "勝利", reading: "しょうり", meaning: "chiến thắng" },
  { word: "挑戦", reading: "ちょうせん", meaning: "thử thách" },
  { word: "仲間", reading: "なかま", meaning: "đồng đội" },
  { word: "力", reading: "ちから", meaning: "sức mạnh" },
  { word: "光", reading: "ひかり", meaning: "ánh sáng" },
  { word: "空", reading: "そら", meaning: "bầu trời" },
  { word: "海", reading: "うみ", meaning: "biển cả" },
  { word: "太陽", reading: "たいよう", meaning: "mặt trời" },
  { word: "月", reading: "つき", meaning: "mặt trăng" },
  { word: "心", reading: "こころ", meaning: "trái tim" },
  { word: "夢", reading: "ゆめ", meaning: "ước mơ" }
];

export const BOSS_VOCABULARY = [
  { word: "侵略者", reading: "しんりゃくしゃ", meaning: "kẻ xâm lăng" },
  { word: "破壊神", reading: "はかいしん", meaning: "thần hủy diệt" },
  { word: "超新星", reading: "ちょうしんせい", meaning: "siêu tân tinh" },
  { word: "終焉", reading: "しゅうえん", meaning: "kết cục" },
  { word: "絶対零度", reading: "ぜったいれいど", meaning: "độ không tuyệt đối" }
];

export function generateWave(wave: number): TargetWord[] {
  const isBossWave = wave % GAME_CONFIG.ENEMIES.bossEveryNWaves === 0;
  const rawCount = Math.min(
    GAME_CONFIG.ENEMIES.maxEnemyCount,
    GAME_CONFIG.ENEMIES.baseEnemyCount + (wave - 1) * GAME_CONFIG.ENEMIES.enemiesPerWaveIncrement
  );

  const count = isBossWave ? Math.max(3, Math.round(rawCount * GAME_CONFIG.ENEMIES.bossMinionReduction)) : rawCount;

  const shuffledVocab = [...EXTENDED_VOCABULARY].sort(() => 0.5 - Math.random());
  const waveTargets: TargetWord[] = [];

  const laneCount = Math.max(6, Math.min(10, count + 2));
  const laneIndices: number[] = [];
  for (let l = 0; l < laneCount; l++) {
    laneIndices.push(l);
  }
  for (let k = laneIndices.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [laneIndices[k], laneIndices[j]] = [laneIndices[j], laneIndices[k]];
  }

  const laneWidth = 74 / laneCount;

  for (let i = 0; i < count; i++) {
    const v = shuffledVocab[i % shuffledVocab.length];
    const lane = laneIndices[i % laneCount];

    const randomJitterX = (Math.random() - 0.5) * (laneWidth * 0.8);
    const posX = 13 + lane * laneWidth + randomJitterX;

    const randomJitterY = Math.random() * 6;
    const posY = -8 - i * GAME_CONFIG.ENEMIES.enemySpawnSpacingY - randomJitterY;
    const speed = GAME_CONFIG.ENEMIES.baseSpeed + wave * GAME_CONFIG.ENEMIES.speedWaveMultiplier;

    waveTargets.push({
      id: `target-w${wave}-${Date.now()}-${i}`,
      word: v.word,
      reading: v.reading,
      meaning: v.meaning,
      posX: Math.max(12, Math.min(88, posX)),
      posY: posY,
      speed: speed,
      type: i % 4 === 0 ? "MONSTER_FAST" : i % 3 === 0 ? "SPACE_MINE" : "MONSTER_NORMAL"
    });
  }

  if (isBossWave) {
    const bossVocab = BOSS_VOCABULARY[Math.floor(wave / 5 - 1) % BOSS_VOCABULARY.length] || BOSS_VOCABULARY[0];
    const scaledBossHp = GAME_CONFIG.ENEMIES.bossHp + Math.max(0, Math.floor((wave - 1) / 5));
    waveTargets.unshift({
      id: `boss-w${wave}-${Date.now()}`,
      word: bossVocab.word,
      reading: bossVocab.reading,
      meaning: bossVocab.meaning,
      posX: 50,
      posY: -22,
      speed: (GAME_CONFIG.ENEMIES.baseSpeed + wave * GAME_CONFIG.ENEMIES.speedWaveMultiplier) * GAME_CONFIG.ENEMIES.bossSpeedMult,
      type: "MINI_BOSS",
      maxHp: scaledBossHp,
      currentHp: scaledBossHp
    });
  }

  return waveTargets;
}

export interface WaveTransitionInfo {
  active: boolean;
  phase: "cleared" | "warp" | "incoming" | "none";
  clearedWave: number;
  incomingWave: number;
  isBoss: boolean;
}

export interface MatchIntroState {
  active: boolean;
  phase: "boot" | "warpin" | "ready" | "done";
}

interface AirDefenseState {
  screen: Screen;
  mode: GameMode;
  wave: number;
  hp: number;
  maxHp: number;
  shield: number;
  score: number;
  combo: number;
  bestCombo: number;
  creditsEarned: number;
  creditsBalance: number;
  hyperBeamCharge: number;
  remainingRerolls: number;

  equippedShipId: string;
  ownedShipIds: string[];
  talentLevels: {
    hull: number;
    coin: number;
    fastStart: number;
    reroll: number;
  };

  targets: TargetWord[];
  lootItems: LootItem[];
  floatingTexts: FloatingText[];
  activeAugments: AugmentCard[];
  draftAugments: AugmentCard[];
  weakWords: WeakWord[];

  dangerZoneActive: boolean;
  screenShake: boolean;
  inboundBoss: boolean;
  lastLaserTarget: { x: number; y: number } | null;
  activeComboMilestone: ComboMilestoneData | null;
  comboBreakActive: boolean;
  hyperBeamActive: boolean;
  hyperBeamPhase: "idle" | "charge" | "firing" | "cooldown";
  waveTransition: WaveTransitionInfo;
  isTransitioning: boolean;
  introState: MatchIntroState;
  bgmEnabled: boolean;
  isSettingsOpen: boolean;
  audioSettings: AudioSettings;
  freezeTimer: number;

  // 🛠 DEV SANDBOX & TOOLSUITE STATE
  godMode: boolean;
  autoPilot: boolean;
  gameTimeScale: number;

  setScreen: (screen: Screen) => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  startMatch: (mode: GameMode) => void;
  skipIntro: () => void;
  toggleBgm: () => void;
  submitAnswer: (input: string) => boolean;
  fireHyperBeam: () => void;
  selectAugment: (augment: AugmentCard) => void;
  rerollAugments: () => void;
  syncWithBackend: () => Promise<void>;
  fetchLeaderboards: () => Promise<void>;
  endlessLeaderboard: LeaderboardItem[];
  rankedLeaderboard: LeaderboardItem[];
  equipShip: (shipId: string) => void;
  buyShip: (shipId: string) => void;
  upgradeTalent: (talentType: "hull" | "coin" | "fastStart" | "reroll") => void;
  resetToDeck: () => void;
  tickGameLoop: (delta: number) => void;
  advanceToNextWave: () => void;
  spawnLoot: (x: number, y: number, isBoss?: boolean, allowHyperOrb?: boolean) => void;

  // 🛠 DEV SANDBOX ACTIONS
  toggleGodMode: () => void;
  toggleAutoPilot: () => void;
  setGameTimeScale: (scale: number) => void;
  killTargetById: (id: string) => void;
  jumpToWave: (targetWave: number) => void;
  spawnBossInstantly: () => void;
  forceAugmentDraft: () => void;
  triggerLootBurst: (count?: number) => void;
  addCredits: (amount: number) => void;
  maxHyperBeam: () => void;
  healPlayer: (amount?: number) => void;
  damagePlayer: (amount?: number) => void;
  triggerWaveClear: () => void;
  resetSandbox: () => void;
  playIntroSequence: (targetScreen?: Screen) => void;
  setCombo: (val: number) => void;
  incrementCombo: (amt: number) => void;
  triggerComboMilestoneTest: (milestone: number) => void;
  triggerScreenShakeTest: () => void;
  triggerComboBreakTest: () => void;
}

const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wo: "を", n: "ん", nn: "ん",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ", sya: "しゃ", syu: "しゅ", syo: "しょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ", cya: "ちゃ", cyu: "ちゅ", cyo: "ちょ", tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  ja: "じゃ", ju: "じゅ", jo: "じょ", jya: "じゃ", jyu: "じゅ", jyo: "じょ", zya: "じゃ", zyu: "じゅ", zyo: "じょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ"
};

export function convertRomajiToHiragana(text: string): string {
  let str = text.toLowerCase().trim();
  str = str.replace(/ō/g, "ou").replace(/ū/g, "uu").replace(/ē/g, "ei").replace(/ā/g, "aa");
  str = str.replace(/([kstpnbmgzrydh])\1/g, "っ$1");

  const keys = Object.keys(ROMAJI_TO_HIRAGANA).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    str = str.replaceAll(k, ROMAJI_TO_HIRAGANA[k]);
  }
  return str;
}

export function isAnswerMatch(input: string, target: TargetWord): boolean {
  const norm = input.trim().toLowerCase();
  if (!norm) return false;
  if (target.word.toLowerCase() === norm) return true;
  if (target.meaning.toLowerCase() === norm) return true;
  if (target.reading.toLowerCase() === norm) return true;

  const hira = convertRomajiToHiragana(norm);
  if (target.reading.toLowerCase() === hira) return true;

  // Xử lý các biến thể phát âm phổ biến: gakko vs がっこう
  if (target.reading.toLowerCase().startsWith(hira) && target.reading.endsWith("う") && (norm.endsWith("o") || norm.endsWith("ou"))) {
    return true;
  }
  if (target.reading.toLowerCase().startsWith(hira) && target.reading.endsWith("い") && (norm.endsWith("e") || norm.endsWith("ei"))) {
    return true;
  }

  return false;
}

export function getComboMilestoneData(combo: number, posX?: number, posY?: number): ComboMilestoneData | null {
  if (combo < 5) return null;
  const id = Date.now() + Math.random();
  if (combo === 5) {
    return { milestone: 5, title: "⚡ HEATED STREAK ×5", subtitle: "GIA TỐC HỎA LỰC // +15% ĐIỂM SỐ", tone: "gold", id, x: posX, y: posY };
  }
  if (combo === 10) {
    return { milestone: 10, title: "🔥 HYPER VELOCITY ×10", subtitle: "TỐC ĐỘ PHẢN XẠ CỰC ĐẠI // +30% ĐIỂM SỐ", tone: "violet", id, x: posX, y: posY };
  }
  if (combo === 15) {
    return { milestone: 15, title: "🚀 APEX STRIKER ×15", subtitle: "PHẢN XẠ TUYỆT ĐỐI // +45% ĐIỂM SỐ", tone: "violet", id, x: posX, y: posY };
  }
  if (combo === 20) {
    return { milestone: 20, title: "⚡ GODLIKE TYPIST ×20", subtitle: "BẬC THẦY GÕ PHÍM // +60% ĐIỂM SỐ", tone: "rose", id, x: posX, y: posY };
  }
  if (combo === 25) {
    return { milestone: 25, title: "💥 UNSTOPPABLE FORCE ×25", subtitle: "CHIẾN HẠM BẤT KHẢ CHIẾN BẠI // +75% ĐIỂM SỐ", tone: "rose", id, x: posX, y: posY };
  }
  if (combo >= 30 && (combo === 30 || combo % 10 === 0 || combo % 5 === 0)) {
    return { milestone: combo, title: `🌟 SUPERNOVA OVERLOAD ×${combo}`, subtitle: "CỰC QUANG VŨ TRỤ // TỐI ĐA HỆ SỐ ĐIỂM", tone: "cyan", id, x: posX, y: posY };
  }
  return null;
}

let autoPilotCounter = 0;

export const useAirDefenseStore = create<AirDefenseState>((set, get) => ({
  screen: "deck",
  mode: "endless",
  wave: 1,
  hp: GAME_CONFIG.PLAYER.baseHp,
  maxHp: GAME_CONFIG.PLAYER.baseHp,
  shield: GAME_CONFIG.PLAYER.baseShield,
  score: 0,
  combo: 0,
  bestCombo: 0,
  creditsEarned: 0,
  creditsBalance: GAME_CONFIG.PLAYER.initialCredits,
  hyperBeamCharge: 0,
  remainingRerolls: GAME_CONFIG.ENEMIES.defaultRerolls,

  equippedShipId: "NOVA-01",
  ownedShipIds: ["NOVA-01"],
  talentLevels: {
    hull: 0,
    coin: 0,
    fastStart: 0,
    reroll: 0
  },
  endlessLeaderboard: [],
  rankedLeaderboard: [],

  targets: [],
  lootItems: [],
  floatingTexts: [],
  activeAugments: [],
  draftAugments: [],
  weakWords: [],

  dangerZoneActive: false,
  screenShake: false,
  inboundBoss: false,
  lastLaserTarget: null,
  hyperBeamActive: false,
  hyperBeamPhase: "idle",
  waveTransition: {
    active: false,
    phase: "none",
    clearedWave: 0,
    incomingWave: 1,
    isBoss: false
  },
  isTransitioning: false,
  introState: {
    active: false,
    phase: "done"
  },
  bgmEnabled: soundManager.getSettings().bgmEnabled && soundManager.getSettings().masterEnabled,
  isSettingsOpen: false,
  audioSettings: soundManager.getSettings(),
  freezeTimer: 0,

  // DEV DEFAULTS
  godMode: false,
  autoPilot: false,
  gameTimeScale: 1.0,

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  updateAudioSettings: (newSettings) => {
    soundManager.updateSettings(newSettings);
    const updated = soundManager.getSettings();
    set({
      audioSettings: updated,
      bgmEnabled: updated.bgmEnabled && updated.masterEnabled
    });
  },

  setScreen: (screen) => {
    if (screen === "sandbox") {
      const { talentLevels, equippedShipId } = get();
      const ship = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];
      const initialHp = ship.hp + talentLevels.hull * GAME_CONFIG.TALENTS.hullBonusPerLevel;
      const initialTargets = generateWave(1);
      soundManager.switchBgm("battle");
      set({
        screen: "sandbox",
        wave: 1,
        hp: initialHp,
        maxHp: initialHp,
        shield: 0,
        score: 0,
        combo: 0,
        creditsEarned: 0,
        hyperBeamCharge: 0,
        targets: initialTargets,
        lootItems: [],
        floatingTexts: [],
        activeAugments: [],
        weakWords: [],
        dangerZoneActive: false,
        screenShake: false,
        inboundBoss: false,
        activeComboMilestone: null,
        isTransitioning: false,
        introState: { active: false, phase: "done" },
        waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: 1, isBoss: false }
      });
      return;
    }

    set({ screen });
    // Contextual BGM Switching
    if (["deck", "hangar", "talent", "shop", "queue", "rank", "debrief", "settings"].includes(screen)) {
      soundManager.switchBgm("lobby");
    } else if (screen === "endless" || screen === "pvp") {
      const isBoss = get().inboundBoss;
      soundManager.switchBgm(isBoss ? "boss" : "battle");
    } else if (screen === "augment") {
      soundManager.switchBgm("lobby");
    }
  },

  toggleBgm: () => {
    const curr = get().audioSettings;
    const nextBgm = !curr.bgmEnabled;
    get().updateAudioSettings({ bgmEnabled: nextBgm });
  },

  startMatch: (mode) => {
    const { talentLevels, equippedShipId } = get();
    const ship = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];
    const initialHp = ship.hp + talentLevels.hull * GAME_CONFIG.TALENTS.hullBonusPerLevel;
    const initialTargets = generateWave(1);

    soundManager.playIntroLaunch();
    soundManager.switchBgm("battle");

    set({
      mode,
      screen: mode === "endless" ? "endless" : "pvp",
      wave: 1,
      hp: initialHp,
      maxHp: initialHp,
      shield: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      creditsEarned: 0,
      hyperBeamCharge: 0,
      freezeTimer: 0,
      remainingRerolls: GAME_CONFIG.ENEMIES.defaultRerolls + talentLevels.reroll * GAME_CONFIG.TALENTS.extraRerollPerLevel,
      targets: initialTargets,
      lootItems: [],
      floatingTexts: [],
      activeAugments: [],
      weakWords: [],
      dangerZoneActive: false,
      screenShake: false,
      inboundBoss: false,
      lastLaserTarget: null,
      activeComboMilestone: null,
      comboBreakActive: false,
      isTransitioning: false,
      waveTransition: {
        active: false,
        phase: "none",
        clearedWave: 0,
        incomingWave: 1,
        isBoss: false
      },
      introState: {
        active: true,
        phase: "boot"
      }
    });

    // 3-Stage Cinematic Match Intro (Chậm rãi, rõ nét và kịch tính)
    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: true, phase: "warpin" } });
      }
    }, 1300);

    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: true, phase: "ready" } });
      }
    }, 2600);

    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: false, phase: "done" } });
      }
    }, 3800);
  },

  skipIntro: () => {
    set({ introState: { active: false, phase: "done" } });
  },

  playIntroSequence: (targetScreen) => {
    const destScreen = targetScreen || get().screen;
    soundManager.playIntroLaunch();
    set({
      screen: destScreen,
      introState: {
        active: true,
        phase: "boot"
      }
    });

    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: true, phase: "warpin" } });
      }
    }, 1300);

    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: true, phase: "ready" } });
      }
    }, 2600);

    setTimeout(() => {
      if (get().introState.active) {
        set({ introState: { active: false, phase: "done" } });
      }
    }, 3800);
  },

  spawnLoot: (x: number, y: number, isBoss = false, allowHyperOrb = true) => {
    const { lootItems } = get();
    const newItems: LootItem[] = [];
    const count = isBoss ? GAME_CONFIG.LOOT.bossLootMultiplier : 1 + (Math.random() < 0.4 ? 1 : 0);

    for (let i = 0; i < count; i++) {
      let type: LootItemType = "CREDIT_CRYSTAL";
      const roll = Math.random();
      if (roll < GAME_CONFIG.LOOT.repairDropChance) {
        type = "REPAIR_PACK";
      } else if (allowHyperOrb && roll < GAME_CONFIG.LOOT.repairDropChance + GAME_CONFIG.LOOT.hyperOrbDropChance) {
        type = "HYPER_ORB";
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.8;
      const val =
        type === "CREDIT_CRYSTAL"
          ? Math.floor(Math.random() * (GAME_CONFIG.LOOT.creditValueMax - GAME_CONFIG.LOOT.creditValueMin)) + GAME_CONFIG.LOOT.creditValueMin
          : type === "REPAIR_PACK"
          ? GAME_CONFIG.LOOT.repairValue
          : GAME_CONFIG.LOOT.hyperOrbCharge;

      newItems.push({
        id: `loot-${Date.now()}-${Math.random()}`,
        type,
        x: Math.max(10, Math.min(90, x + (Math.random() * 8 - 4))),
        y: Math.max(5, Math.min(90, y + (Math.random() * 6 - 3))),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 + 0.3,
        value: val,
        collected: false,
        spawnTime: Date.now()
      });
    }

    set({ lootItems: [...lootItems, ...newItems] });
  },

  advanceToNextWave: () => {
    const { wave, score, isTransitioning, screen } = get();
    if (isTransitioning || (screen !== "endless" && screen !== "pvp" && screen !== "sandbox")) return;

    const nextWave = wave + 1;
    const isBossNext = nextWave % GAME_CONFIG.ENEMIES.bossEveryNWaves === 0;

    soundManager.playWaveClear();
    set({
      isTransitioning: true,
      score: score + 1000 * wave,
      waveTransition: {
        active: true,
        phase: "cleared",
        clearedWave: wave,
        incomingWave: nextWave,
        isBoss: isBossNext
      }
    });

    setTimeout(() => {
      soundManager.playWarpDrive();
      set({
        waveTransition: {
          active: true,
          phase: "warp",
          clearedWave: wave,
          incomingWave: nextWave,
          isBoss: isBossNext
        }
      });
    }, 900);

    setTimeout(() => {
      if (isBossNext) {
        soundManager.playBossSiren();
        soundManager.switchBgm("boss");
      } else {
        soundManager.switchBgm("battle");
      }
      set({
        waveTransition: {
          active: true,
          phase: "incoming",
          clearedWave: wave,
          incomingWave: nextWave,
          isBoss: isBossNext
        }
      });
    }, 1800);

    setTimeout(() => {
      if (wave % GAME_CONFIG.ENEMIES.augmentDraftInterval === 0 && screen !== "sandbox") {
        const draft = [...AUGMENTS_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
        soundManager.switchBgm("lobby");
        set({
          screen: "augment",
          draftAugments: draft,
          wave: nextWave,
          inboundBoss: isBossNext,
          isTransitioning: false,
          waveTransition: { active: false, phase: "none", clearedWave: wave, incomingWave: nextWave, isBoss: false }
        });
      } else {
        const nextTargets = generateWave(nextWave);
        set({
          wave: nextWave,
          targets: nextTargets,
          inboundBoss: isBossNext,
          isTransitioning: false,
          waveTransition: { active: false, phase: "none", clearedWave: wave, incomingWave: nextWave, isBoss: false }
        });
      }
    }, 2800);
  },

  submitAnswer: (input) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return false;

    const { targets, score, combo, bestCombo, creditsEarned, wave, hyperBeamCharge, activeAugments, isTransitioning, advanceToNextWave, spawnLoot, equippedShipId } = get();
    if (isTransitioning) return false;

    // 1. Tìm tất cả quái vật khớp với từ gõ (Hiragana, Kanji, Nghĩa, Romaji & các biến thể)
    const matchingIndices: number[] = [];
    targets.forEach((t, idx) => {
      if (!t.isDead && isAnswerMatch(normalized, t)) {
        matchingIndices.push(idx);
      }
    });

    if (matchingIndices.length > 0) {
      // 2. Tự động khóa mục tiêu Laser vào quái gần đáy nhất (highest posY)
      matchingIndices.sort((a, b) => targets[b].posY - targets[a].posY);
      const targetIdx = matchingIndices[0];
      const hit = targets[targetIdx];
      const updatedTargets = [...targets];
      let isKilled = true;

      if (hit.type === "MINI_BOSS" && (hit.currentHp || 1) > 1) {
        const remainingHp = (hit.currentHp || 1) - 1;
        updatedTargets[targetIdx] = { ...hit, currentHp: remainingHp };
        isKilled = false;
      } else {
        updatedTargets[targetIdx] = { ...hit, isDead: true };
      }

      const newCombo = combo + 1;
      const newBest = Math.max(bestCombo, newCombo);

      // 3. Tính điểm số kèm combo và nội tại tàu Raptor-7 (+100% combo bonus)
      let comboBonusMult = GAME_CONFIG.SCORING.comboBonusMultiplier;
      if (equippedShipId === "RAPTOR-7") {
        comboBonusMult *= 2; // +100% điểm combo
      }

      let scoreDelta = (GAME_CONFIG.SCORING.baseScorePerTarget + newCombo * (GAME_CONFIG.SCORING.baseScorePerTarget * comboBonusMult)) * wave;
      if (hit.type === "MINI_BOSS" && isKilled) {
        scoreDelta += GAME_CONFIG.SCORING.bossScoreBonus;
      }
      if (activeAugments.some((a) => a.id === "DUAL_CANNON")) {
        scoreDelta = Math.round(scoreDelta * GAME_CONFIG.SCORING.dualCannonScoreBonus);
      }

      let creditDelta = GAME_CONFIG.SCORING.baseCreditsPerTarget + wave * GAME_CONFIG.SCORING.creditsWaveMultiplier;
      if (hit.type === "MINI_BOSS" && isKilled) {
        creditDelta += GAME_CONFIG.SCORING.bossCreditsBonus;
      }
      if (activeAugments.some((a) => a.id === "GOLD_MAGNET")) {
        creditDelta = Math.round(creditDelta * GAME_CONFIG.SCORING.goldMagnetCoinBonus);
      }

      soundManager.playLaser();
      if (isKilled) {
        setTimeout(() => soundManager.playExplosion(), 80);
        spawnLoot(hit.posX, Math.max(10, hit.posY), hit.type === "MINI_BOSS");
      }
      soundManager.playComboDing(newCombo);

      let chargeDelta = GAME_CONFIG.PLAYER.hyperBeamChargePerHit;
      if (isKilled) {
        chargeDelta = hit.type === "MINI_BOSS" ? GAME_CONFIG.PLAYER.hyperBeamChargePerBossKill : GAME_CONFIG.PLAYER.hyperBeamChargePerKill;
      }

      // 4. Nội tại tàu Frostbyte (đóng băng 2s sau 5 combo) hoặc Lõi CHRONO_FREEZE (4s)
      let newFreeze = get().freezeTimer;
      let extraFloating = get().floatingTexts;
      if (newCombo > 0 && newCombo % 5 === 0) {
        if (equippedShipId === "FROSTBYTE") {
          newFreeze = Math.max(newFreeze, 2.0);
          extraFloating = [
            ...extraFloating,
            {
              id: `ft-${Date.now()}`,
              text: "❄ FROSTBYTE FREEZE!",
              color: "#55f4ff",
              x: 50,
              y: 50,
              opacity: 1,
              life: 2
            }
          ];
        }
        if (activeAugments.some((a) => a.id === "CHRONO_FREEZE")) {
          newFreeze = Math.max(newFreeze, 4.0);
        }
      }

      // 5. Floating Combat Number (+Điểm kèm Combo Multiplier)
      const hitColor = newCombo >= 20 ? "#ff4d6d" : newCombo >= 10 ? "#c3a6ff" : newCombo >= 5 ? "#ffc857" : "#55f4ff";
      extraFloating = [
        ...extraFloating,
        {
          id: `hit-${Date.now()}-${Math.random()}`,
          text: `+${scoreDelta.toLocaleString()} [×${newCombo}]`,
          color: hitColor,
          x: hit.posX,
          y: Math.max(8, hit.posY - 4),
          opacity: 1,
          life: 1.2
        }
      ];

      // 6. Combo Milestones Feedback (5, 10, 15, 20, 25, 30+)
      const milestoneData = getComboMilestoneData(newCombo, hit.posX, Math.max(8, hit.posY));

      if (milestoneData) {
        soundManager.playComboMilestone(milestoneData.milestone);
      }

      const shouldShake = hit.type === "MINI_BOSS" || !!milestoneData || (newCombo >= 5 && newCombo % 5 === 0);

      set({
        targets: updatedTargets,
        score: Math.round(score + scoreDelta),
        combo: newCombo,
        bestCombo: newBest,
        creditsEarned: creditsEarned + creditDelta,
        hyperBeamCharge: Math.min(GAME_CONFIG.PLAYER.hyperBeamMaxCharge, hyperBeamCharge + chargeDelta),
        lastLaserTarget: { x: hit.posX, y: Math.max(5, hit.posY) },
        activeComboMilestone: milestoneData ? milestoneData : get().activeComboMilestone,
        screenShake: shouldShake ? true : get().screenShake,
        freezeTimer: newFreeze,
        floatingTexts: extraFloating
      });

      setTimeout(() => {
        set({ lastLaserTarget: null });
      }, GAME_CONFIG.VISUALS.laserBeamDurationMs);

      if (shouldShake) {
        setTimeout(() => {
          set({ screenShake: false });
        }, 400);
      }

      if (milestoneData) {
        setTimeout(() => {
          set({ activeComboMilestone: null });
        }, 1500);
      }

      const aliveLeft = updatedTargets.filter((t) => !t.isDead).length;
      if (aliveLeft === 0) {
        advanceToNextWave();
      }

      return true;
    } else {
      const activeTargets = targets.filter((t) => !t.isDead);
      const missed = activeTargets.sort((a, b) => b.posY - a.posY)[0];
      const newWeakWords = missed
        ? [...get().weakWords, { word: missed.word, reading: missed.reading, meaning: missed.meaning, note: "Gõ sai" }]
        : get().weakWords;

      const prevCombo = get().combo;
      if (prevCombo >= 5) {
        soundManager.playComboBreak();
        set({ combo: 0, weakWords: newWeakWords, comboBreakActive: true, activeComboMilestone: null });
        setTimeout(() => set({ comboBreakActive: false }), 600);
      } else {
        set({ combo: 0, weakWords: newWeakWords, activeComboMilestone: null });
      }

      return false;
    }
  },

  fireHyperBeam: () => {
    const { hyperBeamCharge, targets, wave, score, advanceToNextWave, spawnLoot } = get();
    if (hyperBeamCharge < GAME_CONFIG.PLAYER.hyperBeamMaxCharge) return;

    // Giai đoạn 1: Khoảng nghỉ nạp tụ năng lượng cực đại (900ms)
    soundManager.playHyperBeamCharge();
    set({
      hyperBeamCharge: 0,
      hyperBeamPhase: "charge",
      hyperBeamActive: false,
      screenShake: false
    });

    // Giai đoạn 2: Khai hỏa chùm siêu Laser cực đại (Duy trì 3.0 giây)
    setTimeout(() => {
      soundManager.playHyperBeam();

      const updatedTargets: TargetWord[] = [];

      targets.forEach((t) => {
        if (t.isDead) return;

        if (t.type === "MINI_BOSS") {
          const currentHp = t.currentHp || 1;
          const damage = GAME_CONFIG.PLAYER.hyperBeamBossDamage; // 3 HP sát thương từ config
          if (currentHp <= damage) {
            // Boss bị tiêu diệt
            updatedTargets.push({ ...t, currentHp: 0, isDead: true });
            spawnLoot(t.posX, Math.max(10, t.posY), true, false);
          } else {
            // Boss còn sống sau khi trừ 3 HP
            const remainingHp = currentHp - damage;
            updatedTargets.push({ ...t, currentHp: remainingHp, isDead: false });
            // Rơi một lượng đá quý thưởng khi bắn trúng Boss (không nạp Hyper Beam)
            spawnLoot(t.posX, Math.max(10, t.posY), false, false);
          }
        } else {
          // Quái vật thường bị hủy diệt tức thì
          updatedTargets.push({ ...t, isDead: true });
          spawnLoot(t.posX, Math.max(10, t.posY), false, false);
        }
      });

      set({
        targets: updatedTargets,
        score: score + 500 * wave,
        screenShake: true,
        hyperBeamPhase: "firing",
        hyperBeamActive: true
      });

      // Giai đoạn 3: Kết thúc chùm tia & Khoảng chờ hồi phục (1.0 giây)
      setTimeout(() => {
        set({
          hyperBeamPhase: "cooldown",
          hyperBeamActive: false,
          screenShake: false
        });

        // Giai đoạn 4: Hoàn tất sau 1.0s cooldown -> Chuyển wave nếu sạch quái
        setTimeout(() => {
          set({ hyperBeamPhase: "idle" });
          const aliveLeft = updatedTargets.filter((t) => !t.isDead).length;
          if (aliveLeft === 0) {
            advanceToNextWave();
          }
        }, GAME_CONFIG.PLAYER.hyperBeamCooldownMs);

      }, GAME_CONFIG.PLAYER.hyperBeamDurationMs);

    }, GAME_CONFIG.PLAYER.hyperBeamChargeTimeMs);
  },

  selectAugment: (augment) => {
    const { activeAugments, wave, hp, maxHp, shield } = get();
    const updatedAugments = [...activeAugments, augment];

    let newHp = hp;
    let newShield = shield;
    if (augment.id === "REPAIR_NANO") {
      newHp = Math.min(maxHp, Math.round(hp + maxHp * 0.3));
    } else if (augment.id === "SHIELD_BARRIER") {
      newShield += 3;
    }

    const nextTargets = generateWave(wave);
    const isBoss = wave % GAME_CONFIG.ENEMIES.bossEveryNWaves === 0;

    soundManager.switchBgm(isBoss ? "boss" : "battle");

    set({
      screen: "endless",
      activeAugments: updatedAugments,
      hp: newHp,
      shield: newShield,
      targets: nextTargets,
      inboundBoss: isBoss,
      isTransitioning: false
    });
  },

  rerollAugments: () => {
    const { remainingRerolls } = get();
    if (remainingRerolls <= 0) return;
    const draft = [...AUGMENTS_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    set({
      remainingRerolls: remainingRerolls - 1,
      draftAugments: draft
    });
  },

  fetchLeaderboards: async () => {
    try {
      const [endless, ranked] = await Promise.all([
        fetchLeaderboardApi("endless"),
        fetchLeaderboardApi("ranked")
      ]);
      set({
        endlessLeaderboard: endless,
        rankedLeaderboard: ranked
      });
    } catch (err) {
      console.warn("fetchLeaderboards error:", err);
    }
  },

  syncWithBackend: async () => {
    try {
      const [data, endless, ranked] = await Promise.all([
        fetchShopDataApi(),
        fetchLeaderboardApi("endless"),
        fetchLeaderboardApi("ranked")
      ]);
      if (data) {
        const owned = data.ships.filter((s) => s.owned).map((s) => s.shipId);
        set({
          creditsBalance: data.coinsBalance,
          equippedShipId: data.equippedShipId || "NOVA-01",
          ownedShipIds: owned.length > 0 ? owned : ["NOVA-01"],
          talentLevels: {
            hull: data.extraBaseHpLevel || 0,
            coin: data.coinBonusLevel || 0,
            fastStart: data.fastStartLevel || 0,
            reroll: data.rerollCountLevel || 0
          },
          endlessLeaderboard: endless,
          rankedLeaderboard: ranked
        });
      } else {
        set({
          endlessLeaderboard: endless,
          rankedLeaderboard: ranked
        });
      }
    } catch (err) {
      console.warn("syncWithBackend error:", err);
    }
  },

  equipShip: (shipId) => {
    set({ equippedShipId: shipId });
    equipShipApi(shipId).catch(console.warn);
  },

  buyShip: (shipId) => {
    const { creditsBalance, ownedShipIds } = get();
    const ship = SHIPS_CATALOG.find((s) => s.id === shipId);
    if (!ship || ownedShipIds.includes(shipId) || creditsBalance < ship.price) return;

    set({
      creditsBalance: creditsBalance - ship.price,
      ownedShipIds: [...ownedShipIds, shipId],
      equippedShipId: shipId
    });

    buyShipApi(shipId).then((res) => {
      if (res) {
        set({ creditsBalance: res.coinsBalance });
      }
    }).catch(console.warn);
  },

  upgradeTalent: (talentType) => {
    const { creditsBalance, talentLevels, maxHp } = get();
    const cost = GAME_CONFIG.TALENTS.upgradeCostCredits;
    if (creditsBalance < cost) return;

    const updatedTalents = {
      ...talentLevels,
      [talentType]: talentLevels[talentType] + 1
    };

    set({
      creditsBalance: creditsBalance - cost,
      talentLevels: updatedTalents,
      maxHp: talentType === "hull" ? maxHp + GAME_CONFIG.TALENTS.hullBonusPerLevel : maxHp
    });

    const backendType = talentType === "hull" ? "HULL" : talentType === "coin" ? "COIN" : talentType === "fastStart" ? "FAST_START" : "REROLL";
    upgradeTalentApi(backendType).then((res) => {
      if (res) {
        set({ creditsBalance: res.coinsBalance });
      }
    }).catch(console.warn);
  },

  resetToDeck: () => {
    const { creditsBalance, creditsEarned, score, wave, bestCombo } = get();
    soundManager.switchBgm("lobby");
    const newBalance = creditsBalance + creditsEarned;
    const earned = creditsEarned;
    const finalScore = score;
    const finalWave = wave;
    const finalCombo = bestCombo;

    set({
      screen: "deck",
      creditsBalance: newBalance,
      creditsEarned: 0,
      combo: 0,
      activeComboMilestone: null,
      isTransitioning: false,
      waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: 1, isBoss: false }
    });

    if (earned > 0 || finalScore > 0) {
      recordMatchFinishApi({
        score: finalScore,
        wave: finalWave,
        bestCombo: finalCombo,
        creditsEarned: earned,
        durationMs: 30000,
        questionsAnswered: 10,
        correctAnswers: 10,
        incorrectAnswers: 0,
        accuracyPercent: 100,
        playMode: "SOLO",
        difficulty: "N5"
      }).then((res) => {
        if (res) {
          set({ creditsBalance: res.coinsBalance });
        }
      }).catch(console.warn);
    }
  },

  // ==========================================================================
  // 🛠 DEV SANDBOX & QUICK-TEST ACTION METHODS
  // ==========================================================================
  toggleGodMode: () => set((s) => ({ godMode: !s.godMode })),
  toggleAutoPilot: () => set((s) => ({ autoPilot: !s.autoPilot })),
  setGameTimeScale: (scale) => set({ gameTimeScale: scale }),

  killTargetById: (id: string) => {
    const { targets, score, combo, bestCombo, creditsEarned, wave, hyperBeamCharge, activeAugments, isTransitioning, advanceToNextWave, spawnLoot } = get();
    if (isTransitioning) return;
    const targetIdx = targets.findIndex((t) => t.id === id && !t.isDead);
    if (targetIdx < 0) return;

    const hit = targets[targetIdx];
    const updatedTargets = [...targets];
    let isKilled = true;

    if (hit.type === "MINI_BOSS" && (hit.currentHp || 1) > 1) {
      const remainingHp = (hit.currentHp || 1) - 1;
      updatedTargets[targetIdx] = { ...hit, currentHp: remainingHp };
      isKilled = false;
    } else {
      updatedTargets[targetIdx] = { ...hit, isDead: true };
    }

    const newCombo = combo + 1;
    const newBest = Math.max(bestCombo, newCombo);

    let scoreDelta = (GAME_CONFIG.SCORING.baseScorePerTarget + newCombo * (GAME_CONFIG.SCORING.baseScorePerTarget * GAME_CONFIG.SCORING.comboBonusMultiplier)) * wave;
    if (hit.type === "MINI_BOSS" && isKilled) {
      scoreDelta += GAME_CONFIG.SCORING.bossScoreBonus;
    }
    if (activeAugments.some((a) => a.id === "DUAL_CANNON")) {
      scoreDelta = Math.round(scoreDelta * GAME_CONFIG.SCORING.dualCannonScoreBonus);
    }

    let creditDelta = GAME_CONFIG.SCORING.baseCreditsPerTarget + wave * GAME_CONFIG.SCORING.creditsWaveMultiplier;
    if (hit.type === "MINI_BOSS" && isKilled) {
      creditDelta += GAME_CONFIG.SCORING.bossCreditsBonus;
    }
    if (activeAugments.some((a) => a.id === "GOLD_MAGNET")) {
      creditDelta = Math.round(creditDelta * GAME_CONFIG.SCORING.goldMagnetCoinBonus);
    }

    soundManager.playLaser();
    if (isKilled) {
      setTimeout(() => soundManager.playExplosion(), 80);
      spawnLoot(hit.posX, Math.max(10, hit.posY), hit.type === "MINI_BOSS");
    }
    soundManager.playComboDing(newCombo);

    let chargeDelta = GAME_CONFIG.PLAYER.hyperBeamChargePerHit;
    if (isKilled) {
      chargeDelta = hit.type === "MINI_BOSS" ? GAME_CONFIG.PLAYER.hyperBeamChargePerBossKill : GAME_CONFIG.PLAYER.hyperBeamChargePerKill;
    }

    const milestoneData = getComboMilestoneData(newCombo, hit.posX, Math.max(8, hit.posY));
    if (milestoneData) {
      soundManager.playComboMilestone(milestoneData.milestone);
    }
    const shouldShake = hit.type === "MINI_BOSS" || !!milestoneData;

    set({
      targets: updatedTargets,
      score: Math.round(score + scoreDelta),
      combo: newCombo,
      bestCombo: newBest,
      creditsEarned: creditsEarned + creditDelta,
      hyperBeamCharge: Math.min(GAME_CONFIG.PLAYER.hyperBeamMaxCharge, hyperBeamCharge + chargeDelta),
      lastLaserTarget: { x: hit.posX, y: Math.max(5, hit.posY) },
      activeComboMilestone: milestoneData ? milestoneData : get().activeComboMilestone,
      screenShake: shouldShake ? true : get().screenShake
    });

    setTimeout(() => {
      set({ lastLaserTarget: null });
    }, GAME_CONFIG.VISUALS.laserBeamDurationMs);

    if (shouldShake) {
      setTimeout(() => {
        set({ screenShake: false });
      }, 400);
    }

    if (milestoneData) {
      setTimeout(() => {
        set({ activeComboMilestone: null });
      }, 1500);
    }

    const aliveLeft = updatedTargets.filter((t) => !t.isDead).length;
    if (aliveLeft === 0) {
      advanceToNextWave();
    }
  },

  jumpToWave: (targetWave) => {
    const nextTargets = generateWave(targetWave);
    const isBoss = targetWave % GAME_CONFIG.ENEMIES.bossEveryNWaves === 0;
    soundManager.switchBgm(isBoss ? "boss" : "battle");
    set({
      wave: targetWave,
      targets: nextTargets,
      inboundBoss: isBoss,
      isTransitioning: false,
      waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: targetWave, isBoss }
    });
  },

  spawnBossInstantly: () => {
    const { targets, wave } = get();
    const bossVocab = BOSS_VOCABULARY[0];
    const scaledBossHp = GAME_CONFIG.ENEMIES.bossHp + Math.max(0, Math.floor((wave - 1) / 5));
    const bossTarget: TargetWord = {
      id: `boss-dev-${Date.now()}`,
      word: bossVocab.word,
      reading: bossVocab.reading,
      meaning: bossVocab.meaning,
      posX: 50,
      posY: 5,
      speed: (GAME_CONFIG.ENEMIES.baseSpeed + wave * GAME_CONFIG.ENEMIES.speedWaveMultiplier) * GAME_CONFIG.ENEMIES.bossSpeedMult,
      type: "MINI_BOSS",
      maxHp: scaledBossHp,
      currentHp: scaledBossHp
    };
    soundManager.playBossSiren();
    soundManager.switchBgm("boss");
    set({
      targets: [bossTarget, ...targets],
      inboundBoss: true
    });
  },

  forceAugmentDraft: () => {
    const draft = [...AUGMENTS_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    soundManager.switchBgm("lobby");
    set({
      screen: "augment",
      draftAugments: draft
    });
  },

  triggerLootBurst: (count = 8) => {
    for (let i = 0; i < count; i++) {
      get().spawnLoot(50 + (Math.random() * 40 - 20), 30 + Math.random() * 20);
    }
  },

  addCredits: (amt) => set((s) => ({ creditsEarned: s.creditsEarned + amt, creditsBalance: s.creditsBalance + amt })),
  maxHyperBeam: () => set({ hyperBeamCharge: 100 }),
  healPlayer: (amt = 50) => set((s) => ({ hp: Math.min(s.maxHp, s.hp + amt) })),
  damagePlayer: (amt = 25) => {
    const { hp, shield, godMode, screen, score, wave, bestCombo, creditsEarned, maxHp } = get();
    if (godMode) return;

    let nextShield = shield;
    let nextHp = hp;
    if (nextShield > 0) {
      if (nextShield >= amt) {
        nextShield -= amt;
      } else {
        const overflow = amt - nextShield;
        nextShield = 0;
        nextHp = Math.max(0, nextHp - overflow);
      }
    } else {
      nextHp = Math.max(0, nextHp - amt);
    }

    if (nextHp <= 0) {
      if (screen === "sandbox") {
        set({ hp: maxHp, dangerZoneActive: false, combo: 0, activeComboMilestone: null });
        return;
      }
      soundManager.switchBgm("lobby");
      set({ hp: 0, shield: nextShield, screen: "debrief", dangerZoneActive: false, combo: 0, activeComboMilestone: null });

      recordMatchFinishApi({
        score,
        wave,
        bestCombo,
        creditsEarned,
        durationMs: 30000,
        questionsAnswered: 10,
        correctAnswers: 10,
        incorrectAnswers: 0,
        accuracyPercent: 100,
        playMode: "SOLO",
        difficulty: "N5"
      }).catch(console.warn);
      return;
    }

    set({ hp: nextHp, shield: nextShield, dangerZoneActive: true });
  },
  triggerWaveClear: () => get().advanceToNextWave(),

  resetSandbox: () => {
    const { talentLevels, equippedShipId } = get();
    const ship = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];
    const initialHp = ship.hp + talentLevels.hull * GAME_CONFIG.TALENTS.hullBonusPerLevel;
    const initialTargets = generateWave(1);
    soundManager.switchBgm("battle");
    set({
      wave: 1,
      hp: initialHp,
      maxHp: initialHp,
      shield: 0,
      score: 0,
      combo: 0,
      creditsEarned: 0,
      hyperBeamCharge: 0,
      targets: initialTargets,
      lootItems: [],
      floatingTexts: [],
      activeAugments: [],
      weakWords: [],
      dangerZoneActive: false,
      screenShake: false,
      inboundBoss: false,
      activeComboMilestone: null,
      isTransitioning: false,
      waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: 1, isBoss: false }
    });
  },

  setCombo: (val: number) => {
    const nextVal = Math.max(0, val);
    const milestoneData = getComboMilestoneData(nextVal, 50, 35);
    if (milestoneData) {
      soundManager.playComboMilestone(milestoneData.milestone);
    }
    set((s) => ({
      combo: nextVal,
      bestCombo: Math.max(s.bestCombo, nextVal),
      activeComboMilestone: milestoneData ? milestoneData : (nextVal === 0 ? null : s.activeComboMilestone),
      screenShake: milestoneData ? true : s.screenShake
    }));
    if (milestoneData) {
      setTimeout(() => {
        set({ screenShake: false });
      }, 400);
      setTimeout(() => {
        set({ activeComboMilestone: null });
      }, 1500);
    }
  },

  incrementCombo: (amt: number) => {
    const nextVal = Math.max(0, get().combo + amt);
    const milestoneData = getComboMilestoneData(nextVal, 50, 35);
    if (milestoneData) {
      soundManager.playComboMilestone(milestoneData.milestone);
    }
    set((s) => ({
      combo: nextVal,
      bestCombo: Math.max(s.bestCombo, nextVal),
      activeComboMilestone: milestoneData ? milestoneData : (nextVal === 0 ? null : s.activeComboMilestone),
      screenShake: milestoneData ? true : s.screenShake
    }));
    if (milestoneData) {
      setTimeout(() => {
        set({ screenShake: false });
      }, 400);
      setTimeout(() => {
        set({ activeComboMilestone: null });
      }, 1500);
    }
  },

  triggerComboMilestoneTest: (milestone: number) => {
    const milestoneData = getComboMilestoneData(milestone, 50, 35) || {
      milestone,
      title: `🌟 SUPERNOVA OVERLOAD ×${milestone}`,
      subtitle: "CỰC QUANG VŨ TRỤ // TỐI ĐA HỆ SỐ ĐIỂM",
      tone: "cyan",
      id: Date.now() + Math.random(),
      x: 50,
      y: 35
    };

    soundManager.playComboMilestone(milestone);
    set({
      combo: milestone,
      bestCombo: Math.max(get().bestCombo, milestone),
      activeComboMilestone: milestoneData,
      screenShake: true
    });

    setTimeout(() => {
      set({ screenShake: false });
    }, 400);
    setTimeout(() => {
      set({ activeComboMilestone: null });
    }, 1500);
  },

  triggerScreenShakeTest: () => {
    set({ screenShake: true });
    setTimeout(() => {
      set({ screenShake: false });
    }, 400);
  },

  triggerComboBreakTest: () => {
    soundManager.playComboBreak();
    set({ combo: 0, comboBreakActive: true });
    setTimeout(() => {
      set({ comboBreakActive: false });
    }, 600);
  },

  tickGameLoop: (delta) => {
    const { targets, lootItems, floatingTexts, hp, maxHp, shield, creditsEarned, hyperBeamCharge, hyperBeamPhase, screen, weakWords, isTransitioning, advanceToNextWave, introState, godMode, autoPilot, gameTimeScale, killTargetById, equippedShipId, activeAugments } = get();
    if (screen !== "endless" && screen !== "pvp" && screen !== "sandbox") return;
    if (introState.active) return;

    const effectiveDelta = delta * gameTimeScale;

    // Auto-Pilot Bot (Plays on behalf of developer)
    if (autoPilot && !isTransitioning) {
      autoPilotCounter += effectiveDelta;
      if (autoPilotCounter > 45) { // every ~0.75s
        autoPilotCounter = 0;
        const lowestTarget = [...targets]
          .filter((t) => !t.isDead && t.posY >= 0)
          .sort((a, b) => b.posY - a.posY)[0];
        if (lowestTarget) {
          killTargetById(lowestTarget.id);
        }
      }
    }

    // Phase Hyper Beam Firing: Quét sạch quái thường và trừ 3 HP Boss
    if (hyperBeamPhase === "firing") {
      const updatedTargets = targets.map((t) => {
        if (t.isDead) return t;
        if (t.type === "MINI_BOSS") {
          const bossHp = Math.max(0, (t.currentHp || 1) - GAME_CONFIG.PLAYER.hyperBeamBossDamage);
          return { ...t, currentHp: bossHp, isDead: bossHp === 0 };
        }
        return { ...t, isDead: true };
      });
      set({ targets: updatedTargets });
    }

    // Kiểm tra trạng thái đóng băng (Frostbyte / Chrono Freeze)
    const currentFreeze = get().freezeTimer;
    const isFrozen = currentFreeze > 0;
    if (isFrozen) {
      const nextFreeze = Math.max(0, currentFreeze - effectiveDelta / 60);
      set({ freezeTimer: nextFreeze });
    }

    // 1. Tick Enemy Movement & Collisions
    if (!isTransitioning && gameTimeScale > 0) {
      let hasDanger = false;
      let damageTaken = 0;
      const remainingTargets: TargetWord[] = [];
      const missedList: WeakWord[] = [...weakWords];
      const hasCryo = activeAugments.some((a) => a.id === "CRYO_PAYLOAD");
      const speedMult = (isFrozen ? 0 : 1) * (hasCryo ? 0.65 : 1.0);

      targets.forEach((t) => {
        if (t.isDead) return;

        const newY = t.posY + t.speed * effectiveDelta * speedMult;
        if (newY >= GAME_CONFIG.PLAYER.dangerZoneThreshold) {
          hasDanger = true;
        }

        if (newY >= 100) {
          if (!godMode) {
            let baseDmg = t.type === "MINI_BOSS" ? GAME_CONFIG.PLAYER.damagePerEnemyReachBottom * 2 : GAME_CONFIG.PLAYER.damagePerEnemyReachBottom;
            if (equippedShipId === "AEGIS-01") {
              baseDmg = Math.round(baseDmg * 0.7); // Aegis: giảm 30% sát thương va chạm
            }
            damageTaken += baseDmg;
          }
          missedList.push({
            word: t.word,
            reading: t.reading,
            meaning: t.meaning,
            note: t.type === "MINI_BOSS" ? "Boss xâm nhập" : "Chạm phòng tuyến"
          });
        } else {
          remainingTargets.push({ ...t, posY: newY });
        }
      });

      if (damageTaken > 0 && !godMode) {
        soundManager.playDamage();
        let nextShield = shield;
        let nextHp = hp;

        if (nextShield > 0) {
          nextShield = Math.max(0, nextShield - 1);
        } else {
          nextHp = Math.max(0, nextHp - damageTaken);
        }

        const prevCombo = get().combo;
        let shouldBreak = false;
        if (prevCombo >= 5) {
          shouldBreak = true;
          soundManager.playComboBreak();
          setTimeout(() => set({ comboBreakActive: false }), 600);
        }

        set({
          hp: nextHp,
          shield: nextShield,
          combo: 0,
          activeComboMilestone: null,
          comboBreakActive: shouldBreak,
          targets: remainingTargets,
          weakWords: missedList,
          dangerZoneActive: hasDanger,
          screenShake: true
        });

        setTimeout(() => {
          set({ screenShake: false });
        }, 300);

        if (nextHp <= 0) {
          if (screen === "sandbox") {
            // In Sandbox mode: auto-revive to maxHp and stay in Sandbox!
            set({ hp: maxHp, dangerZoneActive: false });
            return;
          }
          soundManager.switchBgm("lobby");
          set({ screen: "debrief" });
          return;
        }
      } else {
        set({
          targets: remainingTargets,
          dangerZoneActive: hasDanger
        });
      }

      if (remainingTargets.length === 0 && !isTransitioning && hyperBeamPhase === "idle") {
        advanceToNextWave();
      }
    }

    // 2. Tick Loot Items Movement & Magnetic Absorption
    if (lootItems.length > 0 && gameTimeScale > 0) {
      const playerX = 50;
      const playerY = 85;
      const nextLoot: LootItem[] = [];
      const nextFloating: FloatingText[] = [...floatingTexts];
      let creditAdd = 0;
      let hpAdd = 0;
      let beamAdd = 0;

      lootItems.forEach((item) => {
        if (item.collected) return;

        // Current item physics update
        let vx = (item.vx || 0) * 0.92;
        let vy = (item.vy || 0.4) * 0.92;

        let nx = item.x + vx * effectiveDelta;
        let ny = item.y + vy * effectiveDelta;

        const dx = playerX - nx;
        const dy = playerY - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Continuous accelerating magnetic attraction toward player ship
        if (dist > 0.001) {
          const magnetSpeed = Math.min(3.6, 0.5 + (1 - Math.min(1, dist / 80)) * 3.1) * effectiveDelta;
          nx += (dx / dist) * magnetSpeed;
          ny += (dy / dist) * magnetSpeed;
        }

        // Absorption when reaching player radius
        if (dist < 6 || ny >= 85) {
          soundManager.playItemCollect(item.type);

          if (item.type === "CREDIT_CRYSTAL") {
            creditAdd += item.value;
            nextFloating.push({
              id: `ft-${Date.now()}-${Math.random()}`,
              text: `+${item.value} CREDITS`,
              color: "#ffc857",
              x: playerX,
              y: playerY - 4,
              opacity: 1,
              life: 1
            });
          } else if (item.type === "REPAIR_PACK") {
            hpAdd += item.value;
            nextFloating.push({
              id: `ft-${Date.now()}-${Math.random()}`,
              text: `+${item.value} HP`,
              color: "#55f4ff",
              x: playerX,
              y: playerY - 4,
              opacity: 1,
              life: 1
            });
          } else {
            beamAdd += item.value;
            nextFloating.push({
              id: `ft-${Date.now()}-${Math.random()}`,
              text: `+${item.value}% HYPER BEAM`,
              color: "#c3a6ff",
              x: playerX,
              y: playerY - 4,
              opacity: 1,
              life: 1
            });
          }
        } else if (ny < 105) {
          nextLoot.push({ ...item, x: nx, y: ny, vx, vy });
        }
      });

      // ALWAYS update lootItems so rendering position smoothly animates in Pixi!
      set({
        lootItems: nextLoot,
        floatingTexts: nextFloating,
        creditsEarned: creditsEarned + creditAdd,
        hp: Math.min(maxHp, hp + hpAdd),
        hyperBeamCharge: hyperBeamPhase === "idle" ? Math.min(100, hyperBeamCharge + beamAdd) : 0
      });
    }

    // 3. Tick Floating Texts
    if (floatingTexts.length > 0) {
      const updatedFloating: FloatingText[] = [];
      floatingTexts.forEach((ft) => {
        const nextLife = ft.life - 0.025 * delta;
        if (nextLife > 0) {
          updatedFloating.push({
            ...ft,
            y: ft.y - 0.25 * delta,
            opacity: nextLife,
            life: nextLife
          });
        }
      });
      set({ floatingTexts: updatedFloating });
    }
  }
}));
