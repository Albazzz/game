import { create } from "zustand";
import { AugmentCard, GameMode, Screen, TargetWord, WeakWord } from "./types";
import { GAME_CONFIG } from "./gameConfig";
import { soundManager } from "./soundEffects";

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

const EXTENDED_VOCABULARY = [
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

const BOSS_VOCABULARY = [
  { word: "侵略者", reading: "しんりゃくしゃ", meaning: "kẻ xâm lăng" },
  { word: "破壊神", reading: "はかいしん", meaning: "thần hủy diệt" },
  { word: "超新星", reading: "ちょうしんせい", meaning: "siêu tân tinh" },
  { word: "終焉", reading: "しゅうえん", meaning: "kết cục" },
  { word: "絶対零度", reading: "ぜったいれいど", meaning: "độ không tuyệt đối" }
];

function generateWave(wave: number): TargetWord[] {
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
    const bossVocab = BOSS_VOCABULARY[(wave / 5 - 1) % BOSS_VOCABULARY.length] || BOSS_VOCABULARY[0];
    waveTargets.unshift({
      id: `boss-w${wave}-${Date.now()}`,
      word: bossVocab.word,
      reading: bossVocab.reading,
      meaning: bossVocab.meaning,
      posX: 50,
      posY: -22,
      speed: (GAME_CONFIG.ENEMIES.baseSpeed + wave * GAME_CONFIG.ENEMIES.speedWaveMultiplier) * GAME_CONFIG.ENEMIES.bossSpeedMult,
      type: "MINI_BOSS",
      maxHp: GAME_CONFIG.ENEMIES.bossHp,
      currentHp: GAME_CONFIG.ENEMIES.bossHp
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
  activeAugments: AugmentCard[];
  draftAugments: AugmentCard[];
  weakWords: WeakWord[];

  dangerZoneActive: boolean;
  screenShake: boolean;
  inboundBoss: boolean;
  lastLaserTarget: { x: number; y: number } | null;
  waveTransition: WaveTransitionInfo;
  isTransitioning: boolean;

  setScreen: (screen: Screen) => void;
  startMatch: (mode: GameMode) => void;
  submitAnswer: (input: string) => boolean;
  fireHyperBeam: () => void;
  selectAugment: (augment: AugmentCard) => void;
  rerollAugments: () => void;
  equipShip: (shipId: string) => void;
  buyShip: (shipId: string) => void;
  upgradeTalent: (talentType: "hull" | "coin" | "fastStart" | "reroll") => void;
  resetToDeck: () => void;
  tickGameLoop: (delta: number) => void;
  advanceToNextWave: () => void;
}

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

  targets: [],
  activeAugments: [],
  draftAugments: [],
  weakWords: [],

  dangerZoneActive: false,
  screenShake: false,
  inboundBoss: false,
  lastLaserTarget: null,
  waveTransition: {
    active: false,
    phase: "none",
    clearedWave: 0,
    incomingWave: 1,
    isBoss: false
  },
  isTransitioning: false,

  setScreen: (screen) => set({ screen }),

  startMatch: (mode) => {
    const { talentLevels, equippedShipId } = get();
    const ship = SHIPS_CATALOG.find((s) => s.id === equippedShipId) || SHIPS_CATALOG[0];
    const initialHp = ship.hp + talentLevels.hull * GAME_CONFIG.TALENTS.hullBonusPerLevel;
    const initialTargets = generateWave(1);

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
      remainingRerolls: GAME_CONFIG.ENEMIES.defaultRerolls + talentLevels.reroll * GAME_CONFIG.TALENTS.extraRerollPerLevel,
      targets: initialTargets,
      activeAugments: [],
      weakWords: [],
      dangerZoneActive: false,
      screenShake: false,
      inboundBoss: false,
      lastLaserTarget: null,
      isTransitioning: false,
      waveTransition: {
        active: false,
        phase: "none",
        clearedWave: 0,
        incomingWave: 1,
        isBoss: false
      }
    });
  },

  advanceToNextWave: () => {
    const { wave, score, isTransitioning, screen } = get();
    if (isTransitioning || (screen !== "endless" && screen !== "pvp")) return;

    const nextWave = wave + 1;
    const isBossNext = nextWave % GAME_CONFIG.ENEMIES.bossEveryNWaves === 0;

    // 1. Trigger Wave Clear Phase
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

    // 2. Warp Speed Phase
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

    // 3. Incoming Wave / Boss Warning Phase
    setTimeout(() => {
      if (isBossNext) {
        soundManager.playBossSiren();
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

    // 4. Finalize Transition & Check Augment Draft Condition (Sau khi hoàn thành đủ 3 wave)
    setTimeout(() => {
      if (wave % GAME_CONFIG.ENEMIES.augmentDraftInterval === 0) {
        const draft = [...AUGMENTS_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
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

    const { targets, score, combo, bestCombo, creditsEarned, wave, hyperBeamCharge, activeAugments, isTransitioning, advanceToNextWave } = get();
    if (isTransitioning) return false;

    const targetIdx = targets.findIndex(
      (t) =>
        !t.isDead &&
        (t.reading.toLowerCase() === normalized ||
          t.meaning.toLowerCase() === normalized ||
          t.word.toLowerCase() === normalized)
    );

    if (targetIdx >= 0) {
      const hit = targets[targetIdx];
      const updatedTargets = [...targets];
      let isKilled = true;

      // Check if Boss has multiple HP
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

      // Audio SFX trigger
      soundManager.playLaser();
      if (isKilled) {
        setTimeout(() => soundManager.playExplosion(), 80);
      }
      soundManager.playComboDing(newCombo);

      set({
        targets: updatedTargets,
        score: Math.round(score + scoreDelta),
        combo: newCombo,
        bestCombo: newBest,
        creditsEarned: creditsEarned + creditDelta,
        hyperBeamCharge: Math.min(GAME_CONFIG.PLAYER.hyperBeamMaxCharge, hyperBeamCharge + GAME_CONFIG.PLAYER.hyperBeamChargePerHit),
        lastLaserTarget: { x: hit.posX, y: Math.max(5, hit.posY) },
        screenShake: hit.type === "MINI_BOSS"
      });

      setTimeout(() => {
        set({ lastLaserTarget: null, screenShake: false });
      }, GAME_CONFIG.VISUALS.laserBeamDurationMs);

      // Check if all targets are destroyed
      const aliveLeft = updatedTargets.filter((t) => !t.isDead).length;
      if (aliveLeft === 0) {
        advanceToNextWave();
      }

      return true;
    } else {
      // Miss / Incorrect
      set({ combo: 0 });
      return false;
    }
  },

  fireHyperBeam: () => {
    const { hyperBeamCharge, targets, wave, score, advanceToNextWave } = get();
    if (hyperBeamCharge < GAME_CONFIG.PLAYER.hyperBeamMaxCharge) return;

    soundManager.playHyperBeam();

    const wipedTargets = targets.map((t) => ({ ...t, isDead: true }));

    set({
      hyperBeamCharge: 0,
      targets: wipedTargets,
      score: score + 500 * wave,
      screenShake: true
    });

    setTimeout(() => {
      set({ screenShake: false });
      advanceToNextWave();
    }, 450);
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

  equipShip: (shipId) => set({ equippedShipId: shipId }),

  buyShip: (shipId) => {
    const { creditsBalance, ownedShipIds } = get();
    const ship = SHIPS_CATALOG.find((s) => s.id === shipId);
    if (!ship || ownedShipIds.includes(shipId) || creditsBalance < ship.price) return;
    set({
      creditsBalance: creditsBalance - ship.price,
      ownedShipIds: [...ownedShipIds, shipId],
      equippedShipId: shipId
    });
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
  },

  resetToDeck: () => {
    const { creditsBalance, creditsEarned } = get();
    set({
      screen: "deck",
      creditsBalance: creditsBalance + creditsEarned,
      creditsEarned: 0,
      combo: 0,
      isTransitioning: false,
      waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: 1, isBoss: false }
    });
  },

  tickGameLoop: (delta) => {
    const { targets, hp, shield, screen, weakWords, isTransitioning, advanceToNextWave } = get();
    if (screen !== "endless" && screen !== "pvp") return;
    if (isTransitioning) return;

    let hasDanger = false;
    let damageTaken = 0;
    const remainingTargets: TargetWord[] = [];
    const missedList: WeakWord[] = [...weakWords];

    targets.forEach((t) => {
      if (t.isDead) return;

      const newY = t.posY + t.speed * delta;
      if (newY >= GAME_CONFIG.PLAYER.dangerZoneThreshold) {
        hasDanger = true;
      }

      if (newY >= 100) {
        damageTaken += t.type === "MINI_BOSS" ? GAME_CONFIG.PLAYER.damagePerEnemyReachBottom * 2 : GAME_CONFIG.PLAYER.damagePerEnemyReachBottom;
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

    if (damageTaken > 0) {
      soundManager.playDamage();
      let nextShield = shield;
      let nextHp = hp;

      if (nextShield > 0) {
        nextShield = Math.max(0, nextShield - 1);
      } else {
        nextHp = Math.max(0, nextHp - damageTaken);
      }

      set({
        hp: nextHp,
        shield: nextShield,
        targets: remainingTargets,
        weakWords: missedList,
        dangerZoneActive: hasDanger,
        screenShake: true
      });

      setTimeout(() => {
        set({ screenShake: false });
      }, 300);

      if (nextHp <= 0) {
        set({ screen: "debrief" });
        return;
      }
    } else {
      set({
        targets: remainingTargets,
        dangerZoneActive: hasDanger
      });
    }

    if (remainingTargets.length === 0 && !isTransitioning) {
      advanceToNextWave();
    }
  }
}));
