import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  useAirDefenseStore,
  SHIPS_CATALOG,
  AUGMENTS_POOL,
  EXTENDED_VOCABULARY,
  BOSS_VOCABULARY,
  generateWave,
  getComboMilestoneData
} from "../useAirDefenseStore";
import { GAME_CONFIG } from "../gameConfig";
import { romajiToHiragana, matchesTargetWord } from "../romajiConverter";
import * as apiClient from "../apiClient";
import { TargetWord, LootItem } from "../types";

// Mock API Client để kiểm tra các lệnh gọi backend mà không cần kết nối mạng
vi.mock("../apiClient", () => ({
  fetchShopDataApi: vi.fn().mockResolvedValue(null),
  buyShipApi: vi.fn().mockResolvedValue({ coinsBalance: 1000 }),
  equipShipApi: vi.fn().mockResolvedValue(true),
  upgradeTalentApi: vi.fn().mockResolvedValue({ coinsBalance: 500 }),
  recordMatchFinishApi: vi.fn().mockResolvedValue({ coinsBalance: 1500 }),
  fetchLeaderboardApi: vi.fn().mockResolvedValue([])
}));

describe("AIR DEFENCE SCI-FI 2.0 - SINGLE PLAYER MASTER TEST SUITE", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Đặt lại state mặc định trước mỗi testcase
    useAirDefenseStore.setState({
      screen: "endless",
      mode: "endless",
      wave: 1,
      hp: 100,
      maxHp: 100,
      shield: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      creditsEarned: 0,
      creditsBalance: 1200,
      hyperBeamCharge: 0,
      freezeTimer: 0,
      remainingRerolls: 3,
      equippedShipId: "NOVA-01",
      ownedShipIds: ["NOVA-01", "FROSTBYTE", "RAPTOR-7", "AEGIS-01"],
      talentLevels: { hull: 0, coin: 0, fastStart: 0, reroll: 0 },
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
      isTransitioning: false,
      waveTransition: { active: false, phase: "none", clearedWave: 0, incomingWave: 1, isBoss: false },
      introState: { active: false, phase: "done" },
      godMode: false,
      autoPilot: false,
      gameTimeScale: 1.0
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // NHÓM 1: TC-INIT - KHỞI TẠO VÁN ĐẤU, TÍNH MÁU, TALENT & RESET CHỈ SỐ
  // ==========================================================================
  describe("NHÓM 1: TC-INIT - Khởi Tạo Ván Đấu & Chỉ Số Ban Đầu", () => {
    it("TC-INIT-01: Khởi tạo ván đấu Endless Mode đặt đúng screen='endless', mode='endless', wave=1", () => {
      useAirDefenseStore.setState({ screen: "deck" });
      const store = useAirDefenseStore.getState();
      store.startMatch("endless");

      const state = useAirDefenseStore.getState();
      expect(state.screen).toBe("endless");
      expect(state.mode).toBe("endless");
      expect(state.wave).toBe(1);
    });

    it("TC-INIT-02: Tính lượng máu cơ bản chính xác theo tàu mặc định Nova-01 (100 HP)", () => {
      useAirDefenseStore.setState({ equippedShipId: "NOVA-01" });
      useAirDefenseStore.getState().startMatch("endless");

      const state = useAirDefenseStore.getState();
      expect(state.maxHp).toBe(100);
      expect(state.hp).toBe(100);
    });

    it("TC-INIT-03: Tính máu tăng cường từ Viện Nâng Cấp Hull (+15 HP mỗi cấp, Level 2 -> 130 HP)", () => {
      useAirDefenseStore.setState({
        equippedShipId: "NOVA-01",
        talentLevels: { hull: 2, coin: 0, fastStart: 0, reroll: 0 }
      });
      useAirDefenseStore.getState().startMatch("endless");

      const state = useAirDefenseStore.getState();
      const expectedHp = 100 + 2 * GAME_CONFIG.TALENTS.hullBonusPerLevel; // 100 + 30 = 130
      expect(state.maxHp).toBe(expectedHp);
      expect(state.hp).toBe(expectedHp);
    });

    it("TC-INIT-04: Tính máu cho tàu phòng thủ Aegis Defender (180 HP) kết hợp Hull Level 3 (180 + 45 = 225 HP)", () => {
      useAirDefenseStore.setState({
        equippedShipId: "AEGIS-01",
        talentLevels: { hull: 3, coin: 0, fastStart: 0, reroll: 0 }
      });
      useAirDefenseStore.getState().startMatch("endless");

      const state = useAirDefenseStore.getState();
      const expectedHp = 180 + 3 * 15; // 225
      expect(state.maxHp).toBe(expectedHp);
      expect(state.hp).toBe(expectedHp);
    });

    it("TC-INIT-05: Reset toàn bộ điểm số, combo, bestCombo, creditsEarned về 0 khi bắt đầu ván mới", () => {
      useAirDefenseStore.setState({
        score: 99999,
        combo: 25,
        bestCombo: 50,
        creditsEarned: 800,
        hyperBeamCharge: 80
      });
      useAirDefenseStore.getState().startMatch("endless");

      const state = useAirDefenseStore.getState();
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.bestCombo).toBe(0);
      expect(state.creditsEarned).toBe(0);
      expect(state.hyperBeamCharge).toBe(0);
    });

    it("TC-INIT-06: Khởi tạo số lượt Reroll theo cấu hình mặc định (3 lượt) cộng thêm talent Reroll", () => {
      useAirDefenseStore.setState({
        talentLevels: { hull: 0, coin: 0, fastStart: 0, reroll: 2 }
      });
      useAirDefenseStore.getState().startMatch("endless");

      const state = useAirDefenseStore.getState();
      const expectedRerolls = GAME_CONFIG.ENEMIES.defaultRerolls + 2 * GAME_CONFIG.TALENTS.extraRerollPerLevel;
      expect(state.remainingRerolls).toBe(expectedRerolls); // 3 + 2 = 5
    });

    it("TC-INIT-07: Khởi động ván đấu kích hoạt introState với phase='boot'", () => {
      useAirDefenseStore.getState().startMatch("endless");
      const state = useAirDefenseStore.getState();
      expect(state.introState.active).toBe(true);
      expect(state.introState.phase).toBe("boot");
    });
  });

  // ==========================================================================
  // NHÓM 2: TC-TYPE - NHẬN DIỆN GÕ ROMAJI, BIẾN THỂ, HIRAGANA & KHÓA LASER
  // ==========================================================================
  describe("NHÓM 2: TC-TYPE - Nhận Diện Gõ Phím, Biến Thể Romaji & Khóa Laser", () => {
    beforeEach(() => {
      // Thiết lập danh sách quái vật mẫu
      const mockTargets: TargetWord[] = [
        {
          id: "target-1",
          word: "学校",
          reading: "がっこう",
          meaning: "trường học",
          posX: 30,
          posY: 40,
          speed: 0.05,
          type: "MONSTER_NORMAL"
        },
        {
          id: "target-2",
          word: "電車",
          reading: "でんしゃ",
          meaning: "tàu điện",
          posX: 70,
          posY: 60,
          speed: 0.05,
          type: "MONSTER_FAST"
        },
        {
          id: "target-3",
          word: "月",
          reading: "つき",
          meaning: "mặt trăng",
          posX: 50,
          posY: 20,
          speed: 0.05,
          type: "MONSTER_NORMAL"
        }
      ];
      useAirDefenseStore.setState({ targets: mockTargets, combo: 0 });
    });

    it("TC-TYPE-01: Gõ đúng Hiragana tiêu diệt quái và tăng combo", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("がっこう");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      expect(state.combo).toBe(1);
      const killed = state.targets.find((t) => t.id === "target-1");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-02: Gõ đúng Romaji chính xác tiêu diệt quái ('gakkou' -> 'がっこう')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("gakkou");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      expect(state.combo).toBe(1);
      const killed = state.targets.find((t) => t.id === "target-1");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-03: Gõ đúng Romaji biến thể Kunrei-shiki vs Hepburn ('densha' vs 'densya')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("densya");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const killed = state.targets.find((t) => t.id === "target-2");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-04: Gõ đúng biến thể phụ âm Romaji ('tsuki' và 'tuki')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("tuki");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const killed = state.targets.find((t) => t.id === "target-3");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-05: Gõ đúng Romaji có dấu trường âm macron (ví dụ 'gakkō' cho 'がっこう')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("gakkō");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const killed = state.targets.find((t) => t.id === "target-1");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-06: Gõ đúng chữ Hán (Kanji) tiêu diệt quái ('学校')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("学校");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const killed = state.targets.find((t) => t.id === "target-1");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-07: Gõ đúng Nghĩa tiếng Việt tiêu diệt quái ('trường học')", () => {
      const ok = useAirDefenseStore.getState().submitAnswer("trường học");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const killed = state.targets.find((t) => t.id === "target-1");
      expect(killed?.isDead).toBe(true);
    });

    it("TC-TYPE-08: Gõ sai từ ngắt chuỗi combo về 0 và trả về false", () => {
      useAirDefenseStore.setState({ combo: 8 });
      const ok = useAirDefenseStore.getState().submitAnswer("sai_hoan_toan_xyz");

      expect(ok).toBe(false);
      expect(useAirDefenseStore.getState().combo).toBe(0);
      expect(useAirDefenseStore.getState().comboBreakActive).toBe(true);
    });

    it("TC-TYPE-08b: Đạt mốc Combo 5 kích hoạt activeComboMilestone và danh hiệu HEATED STREAK", () => {
      useAirDefenseStore.setState({
        combo: 4,
        targets: [
          {
            id: "combo-target",
            word: "星",
            reading: "ほし",
            meaning: "ngôi sao",
            posX: 50,
            posY: 20,
            speed: 0.05,
            type: "MONSTER_NORMAL"
          }
        ]
      });

      const ok = useAirDefenseStore.getState().submitAnswer("hoshi");
      expect(ok).toBe(true);
      expect(useAirDefenseStore.getState().combo).toBe(5);

      const milestone = useAirDefenseStore.getState().activeComboMilestone;
      expect(milestone).not.toBeNull();
      expect(milestone?.milestone).toBe(5);
      expect(milestone?.title).toContain("HEATED STREAK");
    });

    it("TC-TYPE-09: Tự động khóa mục tiêu Laser vào quái gần đáy nhất (highest posY) khi có nhiều quái trùng từ", () => {
      const duplicateTargets: TargetWord[] = [
        {
          id: "star-high",
          word: "星",
          reading: "ほし",
          meaning: "ngôi sao",
          posX: 30,
          posY: 30,
          speed: 0.05,
          type: "MONSTER_NORMAL"
        },
        {
          id: "star-low-danger",
          word: "星",
          reading: "ほし",
          meaning: "ngôi sao",
          posX: 60,
          posY: 75,
          speed: 0.05,
          type: "MONSTER_NORMAL"
        }
      ];

      useAirDefenseStore.setState({ targets: duplicateTargets });
      const ok = useAirDefenseStore.getState().submitAnswer("hoshi");
      expect(ok).toBe(true);

      const state = useAirDefenseStore.getState();
      const lowerMonster = state.targets.find((t) => t.id === "star-low-danger");
      const higherMonster = state.targets.find((t) => t.id === "star-high");

      expect(lowerMonster?.isDead).toBe(true);
      expect(higherMonster?.isDead).toBeUndefined();
      expect(state.lastLaserTarget).toEqual({ x: 60, y: 75 });
    });

    it("TC-TYPE-10: Cập nhật lastLaserTarget với tọa độ của quái bị bắn trúng", () => {
      useAirDefenseStore.getState().submitAnswer("densha");
      const target = useAirDefenseStore.getState().lastLaserTarget;
      expect(target).toEqual({ x: 70, y: 60 });
    });
  });

  // ==========================================================================
  // NHÓM 3: TC-BEAM - NĂNG LƯỢNG HYPER BEAM, KÍCH HOẠT & CHU KỲ BẮN
  // ==========================================================================
  describe("NHÓM 3: TC-BEAM - Hyper Beam Ultimate, Chu Trình Nạp & Bắn", () => {
    it("TC-BEAM-01: Tiêu diệt quái thường nạp +5% năng lượng Hyper Beam", () => {
      const targets: TargetWord[] = [
        { id: "m1", word: "空", reading: "そら", meaning: "bầu trời", posX: 50, posY: 30, speed: 0.05, type: "MONSTER_NORMAL" }
      ];
      useAirDefenseStore.setState({ targets, hyperBeamCharge: 10 });

      useAirDefenseStore.getState().submitAnswer("sora");
      expect(useAirDefenseStore.getState().hyperBeamCharge).toBe(15);
    });

    it("TC-BEAM-02: Tiêu diệt Mini Boss nạp +50% năng lượng Hyper Beam", () => {
      const boss: TargetWord = {
        id: "boss-1",
        word: "破壊神",
        reading: "はかいしん",
        meaning: "thần hủy diệt",
        posX: 50,
        posY: 20,
        speed: 0.02,
        type: "MINI_BOSS",
        maxHp: 1,
        currentHp: 1
      };
      useAirDefenseStore.setState({ targets: [boss], hyperBeamCharge: 20 });

      useAirDefenseStore.getState().submitAnswer("hakaishin");
      expect(useAirDefenseStore.getState().hyperBeamCharge).toBe(70);
    });

    it("TC-BEAM-03: Nhặt Hyper Orb nạp +20% năng lượng và không vượt quá 100%", () => {
      const orb: LootItem = {
        id: "orb-1",
        type: "HYPER_ORB",
        x: 50,
        y: 84,
        vx: 0,
        vy: 0,
        value: 20,
        collected: false,
        spawnTime: Date.now()
      };
      useAirDefenseStore.setState({
        screen: "endless",
        lootItems: [orb],
        hyperBeamCharge: 90,
        hyperBeamPhase: "idle",
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hyperBeamCharge).toBe(100);
    });

    it("TC-BEAM-04: Không thể kích hoạt Hyper Beam khi năng lượng < 100%", () => {
      useAirDefenseStore.setState({ hyperBeamCharge: 95, hyperBeamPhase: "idle" });
      useAirDefenseStore.getState().fireHyperBeam();

      const state = useAirDefenseStore.getState();
      expect(state.hyperBeamPhase).toBe("idle");
      expect(state.hyperBeamActive).toBe(false);
    });

    it("TC-BEAM-05: Kích hoạt Hyper Beam khi đủ 100%: reset charge về 0 và chuyển sang phase 'charge'", () => {
      useAirDefenseStore.setState({ hyperBeamCharge: 100, hyperBeamPhase: "idle" });
      useAirDefenseStore.getState().fireHyperBeam();

      const state = useAirDefenseStore.getState();
      expect(state.hyperBeamCharge).toBe(0);
      expect(state.hyperBeamPhase).toBe("charge");
      expect(state.hyperBeamActive).toBe(false);
    });

    it("TC-BEAM-06: Phase nạp 'charge' kéo dài 900ms trước khi chuyển sang phase 'firing'", () => {
      useAirDefenseStore.setState({ hyperBeamCharge: 100, targets: [] });
      useAirDefenseStore.getState().fireHyperBeam();

      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("charge");

      vi.advanceTimersByTime(890);
      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("charge");

      vi.advanceTimersByTime(20);
      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("firing");
      expect(useAirDefenseStore.getState().hyperBeamActive).toBe(true);
    });

    it("TC-BEAM-07: Phase 'firing' tiêu diệt toàn bộ quái thường trên màn hình", () => {
      const normalTargets: TargetWord[] = [
        { id: "m1", word: "空", reading: "そら", meaning: "bầu trời", posX: 30, posY: 40, speed: 0.05, type: "MONSTER_NORMAL" },
        { id: "m2", word: "海", reading: "うみ", meaning: "biển", posX: 70, posY: 50, speed: 0.05, type: "MONSTER_FAST" }
      ];

      useAirDefenseStore.setState({ hyperBeamCharge: 100, targets: normalTargets });
      useAirDefenseStore.getState().fireHyperBeam();

      vi.advanceTimersByTime(900);

      const state = useAirDefenseStore.getState();
      expect(state.targets.every((t) => t.isDead)).toBe(true);
    });

    it("TC-BEAM-08: Phase 'firing' trừ đúng 3 HP của Mini Boss (Boss 5 HP còn 2 HP và vẫn sống)", () => {
      const boss: TargetWord = {
        id: "boss-beam",
        word: "侵略者",
        reading: "しんりゃくしゃ",
        meaning: "kẻ xâm lăng",
        posX: 50,
        posY: 10,
        speed: 0.02,
        type: "MINI_BOSS",
        maxHp: 5,
        currentHp: 5
      };

      useAirDefenseStore.setState({ hyperBeamCharge: 100, targets: [boss] });
      useAirDefenseStore.getState().fireHyperBeam();

      vi.advanceTimersByTime(900);

      const state = useAirDefenseStore.getState();
      const remainingBoss = state.targets.find((t) => t.id === "boss-beam");
      expect(remainingBoss?.currentHp).toBe(2); // 5 - 3 = 2
      expect(remainingBoss?.isDead).toBe(false);
    });

    it("TC-BEAM-09: Quái vật bị tiêu diệt bởi Hyper Beam không làm rơi Hyper Orb (allowHyperOrb = false)", () => {
      const normalTargets: TargetWord[] = [
        { id: "m1", word: "光", reading: "ひかり", meaning: "ánh sáng", posX: 50, posY: 30, speed: 0.05, type: "MONSTER_NORMAL" }
      ];

      useAirDefenseStore.setState({ hyperBeamCharge: 100, targets: normalTargets, lootItems: [] });
      useAirDefenseStore.getState().fireHyperBeam();

      vi.advanceTimersByTime(900);

      const state = useAirDefenseStore.getState();
      expect(state.lootItems.some((item) => item.type === "HYPER_ORB")).toBe(false);
    });

    it("TC-BEAM-10: Đợi hết animation firing (3.0s) và cooldown (1.0s) mới hoàn tất chu trình chiêu cuối", () => {
      useAirDefenseStore.setState({
        hyperBeamCharge: 100,
        targets: [{ id: "m1", word: "夢", reading: "ゆめ", meaning: "ước mơ", posX: 50, posY: 30, speed: 0.05, type: "MONSTER_NORMAL" }]
      });
      useAirDefenseStore.getState().fireHyperBeam();

      // 0.9s charge
      vi.advanceTimersByTime(900);
      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("firing");

      // 3.0s firing
      vi.advanceTimersByTime(3000);
      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("cooldown");

      // 1.0s cooldown
      vi.advanceTimersByTime(1000);
      expect(useAirDefenseStore.getState().hyperBeamPhase).toBe("idle");
    });
  });

  // ==========================================================================
  // NHÓM 4: TC-WAVE - TIẾN TRÌNH WAVE, ĐỘ KHÓ & MINI BOSS MỖI 5 WAVE
  // ==========================================================================
  describe("NHÓM 4: TC-WAVE - Làn Sóng Quái Vật & Mini Boss Đa HP", () => {
    it("TC-WAVE-01: Tiêu diệt sạch quái trong wave kích hoạt chuyển sang wave kế tiếp", () => {
      const targets: TargetWord[] = [
        { id: "m1", word: "心", reading: "こころ", meaning: "trái tim", posX: 50, posY: 40, speed: 0.05, type: "MONSTER_NORMAL" }
      ];
      useAirDefenseStore.setState({ wave: 1, targets, screen: "endless", score: 0 });

      useAirDefenseStore.getState().submitAnswer("kokoro");
      const state = useAirDefenseStore.getState();
      expect(state.isTransitioning).toBe(true);
      expect(state.waveTransition.active).toBe(true);
      expect(state.waveTransition.phase).toBe("cleared");
    });

    it("TC-WAVE-02: Hoàn thành wave cộng điểm thưởng wave (1000 * wave)", () => {
      useAirDefenseStore.setState({ wave: 2, score: 500, screen: "endless" });
      useAirDefenseStore.getState().advanceToNextWave();

      const state = useAirDefenseStore.getState();
      expect(state.score).toBe(500 + 1000 * 2); // 2500
    });

    it("TC-WAVE-03: Số lượng quái và tốc độ rơi tăng dần theo Wave", () => {
      const wave1 = generateWave(1);
      const wave4 = generateWave(4);

      expect(wave1.length).toBe(GAME_CONFIG.ENEMIES.baseEnemyCount);
      expect(wave4.length).toBe(5 + 3 * 2);

      const avgSpeed1 = wave1.reduce((sum, t) => sum + t.speed, 0) / wave1.length;
      const avgSpeed4 = wave4.reduce((sum, t) => sum + t.speed, 0) / wave4.length;
      expect(avgSpeed4).toBeGreaterThan(avgSpeed1);
    });

    it("TC-WAVE-04: Xuất hiện Mini Boss mỗi 5 Wave (Wave 5, 10, 15...)", () => {
      const wave4 = generateWave(4);
      const wave5 = generateWave(5);
      const wave10 = generateWave(10);

      expect(wave4.some((t) => t.type === "MINI_BOSS")).toBe(false);
      expect(wave5.some((t) => t.type === "MINI_BOSS")).toBe(true);
      expect(wave10.some((t) => t.type === "MINI_BOSS")).toBe(true);
    });

    it("TC-WAVE-05: Mini Boss sở hữu đa thanh máu tăng dần theo chu kỳ wave (Wave 5 = 5 HP, Wave 10 = 6 HP)", () => {
      const wave5 = generateWave(5);
      const boss5 = wave5.find((t) => t.type === "MINI_BOSS");
      expect(boss5?.maxHp).toBe(5);
      expect(boss5?.currentHp).toBe(5);

      const wave10 = generateWave(10);
      const boss10 = wave10.find((t) => t.type === "MINI_BOSS");
      expect(boss10?.maxHp).toBe(6); // 5 + floor((10-1)/5) = 6
    });

    it("TC-WAVE-06: Từ vựng của Mini Boss được chọn từ BOSS_VOCABULARY", () => {
      const wave5 = generateWave(5);
      const boss = wave5.find((t) => t.type === "MINI_BOSS");
      const bossWords = BOSS_VOCABULARY.map((b) => b.word);
      expect(bossWords).toContain(boss?.word);
    });

    it("TC-WAVE-07: Tiêu diệt Mini Boss thưởng lớn +3000 điểm và +150 credits", () => {
      const boss: TargetWord = {
        id: "boss-kill-test",
        word: "超新星",
        reading: "ちょうしんせい",
        meaning: "siêu tân tinh",
        posX: 50,
        posY: 15,
        speed: 0.02,
        type: "MINI_BOSS",
        maxHp: 1,
        currentHp: 1
      };

      useAirDefenseStore.setState({
        wave: 5,
        score: 0,
        creditsEarned: 0,
        targets: [boss]
      });

      useAirDefenseStore.getState().submitAnswer("choushinsei");

      const state = useAirDefenseStore.getState();
      expect(state.score).toBeGreaterThanOrEqual(GAME_CONFIG.SCORING.bossScoreBonus);
      expect(state.creditsEarned).toBeGreaterThanOrEqual(GAME_CONFIG.SCORING.bossCreditsBonus);
    });

    it("TC-WAVE-08: Tiêu diệt Mini Boss rơi số lượng vật phẩm gấp 6 lần (bossLootMultiplier = 6)", () => {
      useAirDefenseStore.setState({ lootItems: [] });
      useAirDefenseStore.getState().spawnLoot(50, 20, true);

      const state = useAirDefenseStore.getState();
      expect(state.lootItems.length).toBe(GAME_CONFIG.LOOT.bossLootMultiplier);
    });
  });

  // ==========================================================================
  // NHÓM 5: TC-AUG - LÕI NÂNG CẤP DẠNG TFT ROGUELIKE & REROLL
  // ==========================================================================
  describe("NHÓM 5: TC-AUG - Lõi Nâng Cấp TFT & Reroll Đổi Bài", () => {
    it("TC-AUG-01: Kích hoạt màn hình chọn Lõi (screen = 'augment') sau mỗi 3 Wave", () => {
      useAirDefenseStore.setState({ wave: 3, score: 0, screen: "endless" });
      useAirDefenseStore.getState().advanceToNextWave();

      vi.advanceTimersByTime(2800);

      const state = useAirDefenseStore.getState();
      expect(state.screen).toBe("augment");
      expect(state.draftAugments.length).toBe(3);
    });

    it("TC-AUG-02: Bộ bài chọn Lõi cung cấp đúng 3 thẻ augment ngẫu nhiên từ AUGMENTS_POOL", () => {
      useAirDefenseStore.setState({ wave: 3, screen: "endless" });
      useAirDefenseStore.getState().advanceToNextWave();
      vi.advanceTimersByTime(2800);

      const draft = useAirDefenseStore.getState().draftAugments;
      expect(draft.length).toBe(3);
      draft.forEach((card) => {
        expect(AUGMENTS_POOL.some((p) => p.id === card.id)).toBe(true);
      });
    });

    it("TC-AUG-03: Chọn Lõi REPAIR_NANO hồi phục ngay 30% Max HP", () => {
      const nanoCard = AUGMENTS_POOL.find((a) => a.id === "REPAIR_NANO")!;
      useAirDefenseStore.setState({
        hp: 40,
        maxHp: 100,
        activeAugments: [],
        screen: "augment"
      });

      useAirDefenseStore.getState().selectAugment(nanoCard);

      const state = useAirDefenseStore.getState();
      expect(state.hp).toBe(70);
      expect(state.activeAugments).toContainEqual(nanoCard);
      expect(state.screen).toBe("endless");
    });

    it("TC-AUG-04: Chọn Lõi SHIELD_BARRIER tạo ngay 3 điểm Giáp bảo vệ", () => {
      const shieldCard = AUGMENTS_POOL.find((a) => a.id === "SHIELD_BARRIER")!;
      useAirDefenseStore.setState({ shield: 0, activeAugments: [], screen: "augment" });

      useAirDefenseStore.getState().selectAugment(shieldCard);

      const state = useAirDefenseStore.getState();
      expect(state.shield).toBe(3);
      expect(state.activeAugments).toContainEqual(shieldCard);
    });

    it("TC-AUG-05: Chọn Lõi DUAL_CANNON tăng +50% điểm số mỗi lần bắn nổ quái", () => {
      const dualCannon = AUGMENTS_POOL.find((a) => a.id === "DUAL_CANNON")!;
      const target: TargetWord = {
        id: "m1",
        word: "太陽",
        reading: "たいよう",
        meaning: "mặt trời",
        posX: 50,
        posY: 30,
        speed: 0.05,
        type: "MONSTER_NORMAL"
      };

      const extraTarget: TargetWord = {
        id: "extra",
        word: "月",
        reading: "つき",
        meaning: "mặt trăng",
        posX: 10,
        posY: 10,
        speed: 0.05,
        type: "MONSTER_NORMAL"
      };

      // TH 1: Không có Lõi Dual Cannon
      useAirDefenseStore.setState({
        wave: 1,
        score: 0,
        combo: 0,
        activeAugments: [],
        targets: [{ ...target }, { ...extraTarget }]
      });
      useAirDefenseStore.getState().submitAnswer("taiyou");
      const baseScoreDelta = useAirDefenseStore.getState().score;

      // TH 2: Có Lõi Dual Cannon (+50% điểm)
      useAirDefenseStore.setState({
        wave: 1,
        score: 0,
        combo: 0,
        isTransitioning: false,
        activeAugments: [dualCannon],
        targets: [{ ...target }, { ...extraTarget }]
      });
      useAirDefenseStore.getState().submitAnswer("taiyou");
      const buffedScoreDelta = useAirDefenseStore.getState().score;

      expect(buffedScoreDelta).toBe(Math.round(baseScoreDelta * 1.5));
    });

    it("TC-AUG-06: Chọn Lõi GOLD_MAGNET tăng +50% Credits thu thập", () => {
      const goldMagnet = AUGMENTS_POOL.find((a) => a.id === "GOLD_MAGNET")!;
      const target: TargetWord = {
        id: "m1",
        word: "星",
        reading: "ほし",
        meaning: "ngôi sao",
        posX: 50,
        posY: 30,
        speed: 0.05,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        wave: 1,
        creditsEarned: 0,
        activeAugments: [goldMagnet],
        targets: [target]
      });
      useAirDefenseStore.getState().submitAnswer("hoshi");

      const expectedCredits = Math.round((GAME_CONFIG.SCORING.baseCreditsPerTarget + 1 * GAME_CONFIG.SCORING.creditsWaveMultiplier) * 1.5);
      expect(useAirDefenseStore.getState().creditsEarned).toBe(expectedCredits);
    });

    it("TC-AUG-07: Đổi bài (Reroll) thành công trừ 1 lượt đổi và thay thế 3 thẻ mới", () => {
      useAirDefenseStore.setState({
        remainingRerolls: 3,
        draftAugments: [AUGMENTS_POOL[0], AUGMENTS_POOL[1], AUGMENTS_POOL[2]]
      });

      useAirDefenseStore.getState().rerollAugments();

      const state = useAirDefenseStore.getState();
      expect(state.remainingRerolls).toBe(2);
      expect(state.draftAugments.length).toBe(3);
    });

    it("TC-AUG-08: Khi hết lượt Reroll (remainingRerolls = 0), không cho phép đổi bài tiếp", () => {
      const currentDraft = [AUGMENTS_POOL[0], AUGMENTS_POOL[1], AUGMENTS_POOL[2]];
      useAirDefenseStore.setState({
        remainingRerolls: 0,
        draftAugments: currentDraft
      });

      useAirDefenseStore.getState().rerollAugments();

      const state = useAirDefenseStore.getState();
      expect(state.remainingRerolls).toBe(0);
      expect(state.draftAugments).toEqual(currentDraft);
    });
  });

  // ==========================================================================
  // NHÓM 6: TC-SHIP - NỘI TẠI 4 DÒNG TÀU CHIẾN KHÔNG GIAN
  // ==========================================================================
  describe("NHÓM 6: TC-SHIP - Nội Tại 4 Dòng Tàu Chiến", () => {
    it("TC-SHIP-01: Tàu NOVA-01 có chỉ số cân bằng chuẩn (100 HP, tốc độ 1.0x)", () => {
      const ship = SHIPS_CATALOG.find((s) => s.id === "NOVA-01");
      expect(ship).toBeDefined();
      expect(ship?.hp).toBe(100);
      expect(ship?.speed).toBe(1.0);
      expect(ship?.role).toBe("BALANCED");
    });

    it("TC-SHIP-02: Tàu FROSTBYTE (120 HP) tự động kích hoạt đóng băng 2s sau mỗi 5 combo", () => {
      useAirDefenseStore.setState({
        equippedShipId: "FROSTBYTE",
        combo: 4,
        freezeTimer: 0,
        targets: [
          { id: "m1", word: "月", reading: "つき", meaning: "mặt trăng", posX: 50, posY: 30, speed: 0.05, type: "MONSTER_NORMAL" }
        ]
      });

      useAirDefenseStore.getState().submitAnswer("tsuki");

      const state = useAirDefenseStore.getState();
      expect(state.combo).toBe(5);
      expect(state.freezeTimer).toBe(2.0);
    });

    it("TC-SHIP-03: Tàu RAPTOR-7 (80 HP) nhận x2 điểm combo (+100% combo bonus)", () => {
      const target: TargetWord = {
        id: "m1",
        word: "平和",
        reading: "へいわ",
        meaning: "hòa bình",
        posX: 50,
        posY: 30,
        speed: 0.05,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        equippedShipId: "NOVA-01",
        combo: 1,
        score: 0,
        wave: 1,
        targets: [{ ...target }]
      });
      useAirDefenseStore.getState().submitAnswer("heiwa");
      const novaScore = useAirDefenseStore.getState().score;

      useAirDefenseStore.setState({
        equippedShipId: "RAPTOR-7",
        combo: 1,
        score: 0,
        wave: 1,
        isTransitioning: false,
        targets: [{ ...target }]
      });
      useAirDefenseStore.getState().submitAnswer("heiwa");
      const raptorScore = useAirDefenseStore.getState().score;

      expect(raptorScore).toBeGreaterThan(novaScore);
    });

    it("TC-SHIP-04: Tàu AEGIS-01 (180 HP) kích hoạt nội tại giảm 30% sát thương va chạm", () => {
      const breachMonster: TargetWord = {
        id: "breach-1",
        word: "星",
        reading: "ほし",
        meaning: "ngôi sao",
        posX: 50,
        posY: 99.9,
        speed: 0.1,
        type: "MONSTER_NORMAL"
      };

      // Tàu Nova-01: mất 15 HP (100 -> 85)
      useAirDefenseStore.setState({
        equippedShipId: "NOVA-01",
        hp: 100,
        maxHp: 100,
        shield: 0,
        targets: [{ ...breachMonster }]
      });
      useAirDefenseStore.getState().tickGameLoop(2);
      expect(useAirDefenseStore.getState().hp).toBe(85);

      // Tàu Aegis: giảm 30% sát thương (15 * 0.7 = 10.5 -> 11 sát thương; 180 - 11 = 169)
      useAirDefenseStore.setState({
        equippedShipId: "AEGIS-01",
        hp: 180,
        maxHp: 180,
        shield: 0,
        isTransitioning: false,
        targets: [{ ...breachMonster }]
      });
      useAirDefenseStore.getState().tickGameLoop(2);
      expect(useAirDefenseStore.getState().hp).toBe(169);
    });

    it("TC-SHIP-05: Chuyển đổi trang bị tàu qua equipShip cập nhật equippedShipId", () => {
      useAirDefenseStore.getState().equipShip("FROSTBYTE");
      expect(useAirDefenseStore.getState().equippedShipId).toBe("FROSTBYTE");
      expect(apiClient.equipShipApi).toHaveBeenCalledWith("FROSTBYTE");
    });
  });

  // ==========================================================================
  // NHÓM 7: TC-LOOT - RƠI VẬT PHẨM, TỪ TRƯỜNG MAGNET & HỒI MÁU/CREDITS
  // ==========================================================================
  describe("NHÓM 7: TC-LOOT - Rơi Vật Phẩm, Từ Trường & Hấp Thụ", () => {
    it("TC-LOOT-01: spawnLoot tạo ra các loại vật phẩm (CREDIT_CRYSTAL, REPAIR_PACK, HYPER_ORB)", () => {
      useAirDefenseStore.setState({ lootItems: [] });
      for (let i = 0; i < 20; i++) {
        useAirDefenseStore.getState().spawnLoot(50, 50, false, true);
      }

      const items = useAirDefenseStore.getState().lootItems;
      expect(items.length).toBeGreaterThan(0);
      const types = new Set(items.map((it) => it.type));
      expect(types.has("CREDIT_CRYSTAL")).toBe(true);
    });

    it("TC-LOOT-02: Lực hút từ trường kéo vật phẩm rơi dần về phía phi thuyền (50, 85)", () => {
      const farItem: LootItem = {
        id: "far-loot",
        type: "CREDIT_CRYSTAL",
        x: 30,
        y: 40,
        vx: 0,
        vy: 0,
        value: 25,
        collected: false,
        spawnTime: Date.now()
      };

      useAirDefenseStore.setState({
        screen: "endless",
        lootItems: [farItem],
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      const movedItem = state.lootItems.find((it) => it.id === "far-loot");
      expect(movedItem?.x).toBeGreaterThan(30);
      expect(movedItem?.y).toBeGreaterThan(40);
    });

    it("TC-LOOT-03: Hấp thụ CREDIT_CRYSTAL cộng số Credits vào creditsEarned", () => {
      const creditItem: LootItem = {
        id: "c-1",
        type: "CREDIT_CRYSTAL",
        x: 50,
        y: 84.5,
        vx: 0,
        vy: 0,
        value: 30,
        collected: false,
        spawnTime: Date.now()
      };

      useAirDefenseStore.setState({
        screen: "endless",
        creditsEarned: 100,
        lootItems: [creditItem],
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.creditsEarned).toBe(130);
    });

    it("TC-LOOT-04: Hấp thụ REPAIR_PACK hồi phục HP nhưng không vượt quá maxHp", () => {
      const repairItem: LootItem = {
        id: "rep-1",
        type: "REPAIR_PACK",
        x: 50,
        y: 84.5,
        vx: 0,
        vy: 0,
        value: 15,
        collected: false,
        spawnTime: Date.now()
      };

      useAirDefenseStore.setState({
        screen: "endless",
        hp: 95,
        maxHp: 100,
        lootItems: [repairItem],
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hp).toBe(100);
    });

    it("TC-LOOT-05: Hấp thụ HYPER_ORB tăng thanh nạp Hyper Beam (tối đa 100%)", () => {
      const orbItem: LootItem = {
        id: "orb-2",
        type: "HYPER_ORB",
        x: 50,
        y: 84.5,
        vx: 0,
        vy: 0,
        value: 20,
        collected: false,
        spawnTime: Date.now()
      };

      useAirDefenseStore.setState({
        screen: "endless",
        hyperBeamCharge: 50,
        hyperBeamPhase: "idle",
        lootItems: [orbItem],
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hyperBeamCharge).toBe(70);
    });

    it("TC-LOOT-06: Dọn dẹp vật phẩm đã thu thập hoặc rơi quá đáy (y >= 105)", () => {
      const expiredItem: LootItem = {
        id: "exp-1",
        type: "CREDIT_CRYSTAL",
        x: 10,
        y: 106,
        vx: 0,
        vy: 1,
        value: 10,
        collected: false,
        spawnTime: Date.now()
      };

      useAirDefenseStore.setState({
        screen: "endless",
        lootItems: [expiredItem],
        introState: { active: false, phase: "done" }
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.lootItems.find((it) => it.id === "exp-1")).toBeUndefined();
    });
  });

  // ==========================================================================
  // NHÓM 8: TC-DMG - SÁT THƯƠNG QUÁI CHẠM ĐÁY, GIÁP, GAME OVER & DEBRIEF
  // ==========================================================================
  describe("NHÓM 8: TC-DMG - Sát Thương Phòng Tuyến, Giáp, Game Over & Debrief", () => {
    it("TC-DMG-01: Quái chạm đáy (posY >= 100) trừ đúng 15 HP (quái thường) và 30 HP (Boss)", () => {
      const normalEnemy: TargetWord = {
        id: "norm-1",
        word: "時間",
        reading: "じかん",
        meaning: "thời gian",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        hp: 100,
        shield: 0,
        targets: [normalEnemy]
      });

      useAirDefenseStore.getState().tickGameLoop(1);
      expect(useAirDefenseStore.getState().hp).toBe(85);
    });

    it("TC-DMG-02: Khi có Giáp (shield > 0), trừ Giáp trước, HP không bị giảm", () => {
      const breachEnemy: TargetWord = {
        id: "b-1",
        word: "勇気",
        reading: "ゆうき",
        meaning: "dũng khí",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        hp: 100,
        shield: 3,
        isTransitioning: false,
        targets: [breachEnemy]
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.shield).toBe(2);
      expect(state.hp).toBe(100);
    });

    it("TC-DMG-03: Khi hết Giáp (shield = 0), quái chạm đáy trừ trực tiếp vào HP", () => {
      const breachEnemy: TargetWord = {
        id: "b-2",
        word: "希望",
        reading: "きぼう",
        meaning: "hy vọng",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        hp: 80,
        shield: 0,
        targets: [breachEnemy]
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hp).toBe(65);
    });

    it("TC-DMG-04: Tàu AEGIS-01 giảm 30% sát thương khi Mini Boss chạm đáy (30 HP -> 21 HP)", () => {
      const bossEnemy: TargetWord = {
        id: "boss-breach",
        word: "終焉",
        reading: "しゅうえん",
        meaning: "kết cục",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MINI_BOSS"
      };

      useAirDefenseStore.setState({
        equippedShipId: "AEGIS-01",
        hp: 180,
        shield: 0,
        targets: [bossEnemy]
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hp).toBe(159);
    });

    it("TC-DMG-05: Quái chạm đáy được thêm vào danh sách từ yếu (weakWords) để người chơi ôn tập", () => {
      const missedEnemy: TargetWord = {
        id: "missed-1",
        word: "病院",
        reading: "びょういん",
        meaning: "bệnh viện",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({ weakWords: [], targets: [missedEnemy] });
      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.weakWords.some((w) => w.word === "病院")).toBe(true);
    });

    it("TC-DMG-06: Khi HP giảm về <= 0, chuyển ngay sang màn hình tổng kết 'debrief' (Game Over)", () => {
      const fatalEnemy: TargetWord = {
        id: "fatal-1",
        word: "宇宙",
        reading: "うちゅう",
        meaning: "vũ trụ",
        posX: 50,
        posY: 99.9,
        speed: 0.2,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        hp: 10,
        shield: 0,
        screen: "endless",
        targets: [fatalEnemy]
      });

      useAirDefenseStore.getState().tickGameLoop(1);

      const state = useAirDefenseStore.getState();
      expect(state.hp).toBeLessThanOrEqual(0);
      expect(state.screen).toBe("debrief");
    });

    it("TC-DMG-07: resetToDeck cộng creditsEarned vào creditsBalance và gửi API recordMatchFinishApi", () => {
      useAirDefenseStore.setState({
        screen: "debrief",
        creditsBalance: 1000,
        creditsEarned: 250,
        score: 15000,
        wave: 7,
        bestCombo: 14
      });

      useAirDefenseStore.getState().resetToDeck();

      const state = useAirDefenseStore.getState();
      expect(state.screen).toBe("deck");
      expect(state.creditsBalance).toBe(1250);
      expect(state.creditsEarned).toBe(0);
      expect(apiClient.recordMatchFinishApi).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 15000,
          wave: 7,
          bestCombo: 14,
          creditsEarned: 250
        })
      );
    });
  });

  // ==========================================================================
  // NHÓM 9: TC-DEV-VFX - KIỂM THỬ COMBO, MILESTONES COORDINATES & DEV VFX ACTIONS
  // ==========================================================================
  describe("NHÓM 9: TC-DEV-VFX - Combo Milestones, Screen Shake & Dev Actions", () => {
    it("TC-DEV-01: submitAnswer gán tọa độ x, y vào milestoneData khi đạt mốc combo", () => {
      useAirDefenseStore.setState({
        combo: 4,
        targets: [
          {
            id: "target-coord",
            word: "星",
            reading: "ほし",
            meaning: "ngôi sao",
            posX: 42,
            posY: 25,
            speed: 0.05,
            type: "MONSTER_NORMAL"
          }
        ]
      });

      useAirDefenseStore.getState().submitAnswer("hoshi");
      const state = useAirDefenseStore.getState();
      expect(state.activeComboMilestone).not.toBeNull();
      expect(state.activeComboMilestone?.x).toBe(42);
      expect(state.activeComboMilestone?.y).toBe(25);
      expect(state.screenShake).toBe(true);
    });

    it("TC-DEV-02: Screen shake tự tắt sau 400ms", () => {
      useAirDefenseStore.setState({
        combo: 4,
        targets: [
          {
            id: "target-shake",
            word: "星",
            reading: "ほし",
            meaning: "ngôi sao",
            posX: 50,
            posY: 20,
            speed: 0.05,
            type: "MONSTER_NORMAL"
          }
        ]
      });

      useAirDefenseStore.getState().submitAnswer("hoshi");
      expect(useAirDefenseStore.getState().screenShake).toBe(true);

      vi.advanceTimersByTime(GAME_CONFIG.VISUALS.laserBeamDurationMs + 10);
      expect(useAirDefenseStore.getState().lastLaserTarget).toBeNull();
      // Screen shake vẫn còn active sau 120ms laser kết thúc
      expect(useAirDefenseStore.getState().screenShake).toBe(true);

      vi.advanceTimersByTime(300);
      // Đã qua 400ms -> screen shake tắt
      expect(useAirDefenseStore.getState().screenShake).toBe(false);
    });

    it("TC-DEV-03: Dev Sandbox action setCombo và incrementCombo hoạt động chính xác", () => {
      useAirDefenseStore.getState().setCombo(12);
      expect(useAirDefenseStore.getState().combo).toBe(12);
      expect(useAirDefenseStore.getState().bestCombo).toBe(12);

      useAirDefenseStore.getState().incrementCombo(5);
      expect(useAirDefenseStore.getState().combo).toBe(17);
      expect(useAirDefenseStore.getState().bestCombo).toBe(17);

      useAirDefenseStore.getState().setCombo(0);
      expect(useAirDefenseStore.getState().combo).toBe(0);
    });

    it("TC-DEV-04: triggerComboMilestoneTest kích hoạt milestone splash, âm thanh và screenShake", () => {
      useAirDefenseStore.getState().triggerComboMilestoneTest(20);
      const state = useAirDefenseStore.getState();
      expect(state.combo).toBe(20);
      expect(state.activeComboMilestone?.milestone).toBe(20);
      expect(state.activeComboMilestone?.tone).toBe("rose");
      expect(state.screenShake).toBe(true);

      vi.advanceTimersByTime(400);
      expect(useAirDefenseStore.getState().screenShake).toBe(false);
    });

    it("TC-DEV-05: triggerScreenShakeTest bật rung màn hình và tự tắt sau 400ms", () => {
      useAirDefenseStore.getState().triggerScreenShakeTest();
      expect(useAirDefenseStore.getState().screenShake).toBe(true);

      vi.advanceTimersByTime(400);
      expect(useAirDefenseStore.getState().screenShake).toBe(false);
    });

    it("TC-DEV-06: triggerComboBreakTest reset combo về 0 và bật comboBreakActive trong 600ms", () => {
      useAirDefenseStore.setState({ combo: 15 });
      useAirDefenseStore.getState().triggerComboBreakTest();

      expect(useAirDefenseStore.getState().combo).toBe(0);
      expect(useAirDefenseStore.getState().comboBreakActive).toBe(true);

      vi.advanceTimersByTime(600);
      expect(useAirDefenseStore.getState().comboBreakActive).toBe(false);
    });

    it("TC-DEV-07: getComboMilestoneData trả về đúng dữ liệu theo các mốc 5, 10, 15, 20, 25, 30, 40 và null khi < 5", () => {
      expect(getComboMilestoneData(0)).toBeNull();
      expect(getComboMilestoneData(4)).toBeNull();
      expect(getComboMilestoneData(7)).toBeNull();

      const m5 = getComboMilestoneData(5, 30, 20);
      expect(m5).not.toBeNull();
      expect(m5?.milestone).toBe(5);
      expect(m5?.tone).toBe("gold");
      expect(m5?.x).toBe(30);
      expect(m5?.y).toBe(20);

      const m10 = getComboMilestoneData(10);
      expect(m10?.milestone).toBe(10);
      expect(m10?.tone).toBe("violet");

      const m15 = getComboMilestoneData(15);
      expect(m15?.milestone).toBe(15);
      expect(m15?.tone).toBe("violet");

      const m20 = getComboMilestoneData(20);
      expect(m20?.milestone).toBe(20);
      expect(m20?.tone).toBe("rose");

      const m25 = getComboMilestoneData(25);
      expect(m25?.milestone).toBe(25);
      expect(m25?.tone).toBe("rose");

      const m30 = getComboMilestoneData(30);
      expect(m30?.milestone).toBe(30);
      expect(m30?.tone).toBe("cyan");

      const m40 = getComboMilestoneData(40);
      expect(m40?.milestone).toBe(40);
      expect(m40?.tone).toBe("cyan");
    });

    it("TC-DEV-08: killTargetById kích hoạt milestone khi đạt mốc combo (vd mốc 5) và tự dọn sau 1500ms", () => {
      const target: TargetWord = {
        id: "kill-milestone-target",
        word: "空",
        reading: "そら",
        meaning: "bầu trời",
        posX: 60,
        posY: 30,
        speed: 0.05,
        type: "MONSTER_NORMAL"
      };

      useAirDefenseStore.setState({
        combo: 4,
        targets: [target]
      });

      useAirDefenseStore.getState().killTargetById("kill-milestone-target");

      const state = useAirDefenseStore.getState();
      expect(state.combo).toBe(5);
      expect(state.activeComboMilestone).not.toBeNull();
      expect(state.activeComboMilestone?.milestone).toBe(5);
      expect(state.activeComboMilestone?.tone).toBe("gold");
      expect(state.activeComboMilestone?.x).toBe(60);
      expect(state.activeComboMilestone?.y).toBe(30);
      expect(state.screenShake).toBe(true);

      vi.advanceTimersByTime(400);
      expect(useAirDefenseStore.getState().screenShake).toBe(false);

      vi.advanceTimersByTime(1100); // 1500ms total
      expect(useAirDefenseStore.getState().activeComboMilestone).toBeNull();
    });

    it("TC-DEV-09: setCombo và incrementCombo kích hoạt milestone splash khi chạm mốc", () => {
      useAirDefenseStore.setState({ combo: 0 });

      useAirDefenseStore.getState().incrementCombo(5);
      expect(useAirDefenseStore.getState().combo).toBe(5);
      expect(useAirDefenseStore.getState().activeComboMilestone?.milestone).toBe(5);
      expect(useAirDefenseStore.getState().screenShake).toBe(true);

      vi.advanceTimersByTime(1500);
      expect(useAirDefenseStore.getState().activeComboMilestone).toBeNull();

      useAirDefenseStore.getState().setCombo(10);
      expect(useAirDefenseStore.getState().combo).toBe(10);
      expect(useAirDefenseStore.getState().activeComboMilestone?.milestone).toBe(10);

      vi.advanceTimersByTime(1500);
      expect(useAirDefenseStore.getState().activeComboMilestone).toBeNull();
    });

    it("TC-DEV-10: submitAnswer dọn sạch activeComboMilestone khi gõ sai từ", () => {
      useAirDefenseStore.setState({
        combo: 5,
        activeComboMilestone: { milestone: 5, title: "TEST", subtitle: "TEST", tone: "gold", id: 123 },
        targets: [
          {
            id: "t1",
            word: "太陽",
            reading: "たいよう",
            meaning: "mặt trời",
            posX: 50,
            posY: 20,
            speed: 0.05,
            type: "MONSTER_NORMAL"
          }
        ]
      });

      useAirDefenseStore.getState().submitAnswer("sai_roi");

      expect(useAirDefenseStore.getState().combo).toBe(0);
      expect(useAirDefenseStore.getState().activeComboMilestone).toBeNull();
    });
  });
});
