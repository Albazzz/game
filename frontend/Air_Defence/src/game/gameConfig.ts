// ============================================================================
// AIR DEFENCE SCI-FI EDITION 2.0 - MASTER GAME BALANCE & CONFIGURATION
// TẤT CẢ CÁC THAM SỐ CÂN BẰNG ĐỀU ĐƯỢC TẬP TRUNG TẠI ĐÂY ĐỂ DỄ DÀNG TÙY CHỈNH.
// ============================================================================

export interface ShipConfig {
  id: string;
  name: string;
  role: string;
  price: number;
  hp: number;
  speed: number;
  passiveDesc: string;
  colorTheme: "cyan" | "violet" | "amber";
  spritePath: string;
}

export const GAME_CONFIG = {
  // --------------------------------------------------------------------------
  // 1. CÂN BẰNG PHI CÔNG & TÀU CHIẾN (PLAYER BALANCE)
  // --------------------------------------------------------------------------
  PLAYER: {
    baseHp: 100,                     // Máu cơ bản của phi thuyền người chơi (HP)
    baseShield: 0,                   // Giáp bảo vệ khởi đầu (Shield points)
    hyperBeamChargePerHit: 10,       // % Năng lượng Hyper Beam nạp sau mỗi lần gõ đúng 1 từ
    hyperBeamMaxCharge: 100,         // Ngưỡng năng lượng để kích hoạt chiêu cuối Hyper Beam (100%)
    hyperBeamBossDamage: 3,          // Sát thương chiêu cuối Hyper Beam gây ra cho Boss chiến hạm (3 HP)
    hyperBeamDurationMs: 850,        // Thời gian duy trì hoạt cảnh chùm tia Hyper Beam cực đại (ms)
    dangerZoneThreshold: 75,         // Ngưỡng % màn hình quái tiến gần để kích hoạt cảnh báo đỏ
    damagePerEnemyReachBottom: 15,   // Sát thương mất máu khi quái vật chạm đáy phòng tuyến
    initialCredits: 1200             // Số Credits tân thủ khởi tạo khi vào game
  },

  // --------------------------------------------------------------------------
  // 2. CÂN BẰNG QUÁI VẬT & LÀN SÓNG (ENEMY & WAVE BALANCE)
  // --------------------------------------------------------------------------
  ENEMIES: {
    baseEnemyCount: 5,               // Số lượng quái khởi đầu ở Wave 1
    enemiesPerWaveIncrement: 2,      // Số lượng quái tăng thêm sau mỗi Wave (+2 con/wave)
    maxEnemyCount: 16,               // Giới hạn số lượng quái tối đa trên một wave (tránh nghẽn màn hình)
    bossEveryNWaves: 5,              // Chu kỳ xuất hiện Boss (Cứ mỗi 5 wave: Wave 5, 10, 15, 20...)
    bossHp: 5,                       // Máu cơ bản của Boss ở Wave 5 (Cần 5 từ vựng để diệt)
    bossHpIncrementPerCycle: 1,      // Máu Boss tăng thêm sau mỗi chu kỳ 5 wave (+1 HP ở Wave 10, 15, 20...)
    bossMinionReduction: 0.5,        // Giảm 50% số lượng lính ở màn Boss để tập trung vào Boss
    bossScale: 2.6,                  // Kích thước phóng to của Boss khổng lồ (2.6x)
    enemySpawnSpacingY: 12,          // Khoảng cách trục Y giữa các quái khi spawn ngoài màn hình
    baseSpeed: 0.055,                // Tốc độ rơi cơ bản của quái vật (% chiều cao màn hình / frame)
    speedWaveMultiplier: 0.011,      // Hệ số tăng tốc độ rơi của quái theo độ cao của Wave
    fastEnemySpeedMult: 1.45,        // Hệ số tốc độ của Quái Tốc Biến (Monster Fast)
    spaceMineSpeedMult: 0.9,         // Hệ số tốc độ của Thủy Lôi Vũ Trụ (Space Mine)
    bossSpeedMult: 0.52,             // Hệ số tốc độ di chuyển của Boss chiến hạm (chậm rãi, nặng nề)
    augmentDraftInterval: 3,         // Chu kỳ mở màn hình chọn Lõi Augment (sau mỗi 3 Wave hoàn thành)
    defaultRerolls: 3                // Số lượt đổi bài (Reroll) lõi nâng cấp mặc định
  },

  // --------------------------------------------------------------------------
  // 3. CÂN BẰNG RƠI VẬT PHẨM (LOOT DROP & REWARD SYSTEM)
  // --------------------------------------------------------------------------
  LOOT: {
    enabled: true,                   // Bật hệ thống rơi vật phẩm từ quái vật
    creditDropChance: 0.85,          // 85% tỉ lệ rơi Tinh Thể Credits vàng khi quái nổ
    repairDropChance: 0.25,          // 25% tỉ lệ rơi Hộp Nano hồi máu xanh
    hyperOrbDropChance: 0.35,        // 35% tỉ lệ rơi Cầu Năng Lượng Hyper Beam tím
    bossLootMultiplier: 6,           // Số lượng vật phẩm rơi gấp 6 lần khi tiêu diệt Boss
    magnetDistance: 60,              // Khoảng cách % màn hình kích hoạt lực từ trường hút về tàu
    magnetSpeed: 0.35,               // Tốc độ hút cơ bản của từ trường
    magnetMaxSpeed: 3.6,             // Tốc độ gia tốc tối đa khi đá quý lao vào phi thuyền
    creditValueMin: 15,              // Giá trị Credits tối thiểu mỗi viên pha lê
    creditValueMax: 40,              // Giá trị Credits tối đa mỗi viên pha lê
    repairValue: 15,                 // Lượng HP hồi phục khi nhặt Hộp Nano
    hyperOrbCharge: 20               // % Năng lượng Hyper Beam nạp được khi nhặt Cầu Plasma
  },

  // --------------------------------------------------------------------------
  // 4. CÂN BẰNG ĐIỂM SỐ & PHẦN THƯỞNG (SCORING & REWARDS)
  // --------------------------------------------------------------------------
  SCORING: {
    baseScorePerTarget: 150,         // Điểm cơ bản khi bắn nổ 1 quái vật
    bossScoreBonus: 3000,            // Điểm thưởng cực lớn khi bắn hạ Boss
    comboBonusMultiplier: 0.1,       // Thêm +10% điểm cho mỗi nấc Combo liên tục
    baseCreditsPerTarget: 5,         // Credits thưởng cơ bản cho mỗi quái tiêu diệt
    creditsWaveMultiplier: 2,        // Credits thưởng tăng dần theo cấp độ Wave
    bossCreditsBonus: 150,           // Credits thưởng thêm tức thì khi hạ Boss
    dualCannonScoreBonus: 1.5,       // Hệ số nhân điểm khi có Lõi Dual Cannon
    goldMagnetCoinBonus: 1.5         // Hệ số nhân Coin khi có Lõi Gold Magnet
  },

  // --------------------------------------------------------------------------
  // 5. VIỆN NÂNG CẤP VĨNH VIỄN (PERMANENT TALENT UPGRADES)
  // --------------------------------------------------------------------------
  TALENTS: {
    upgradeCostCredits: 480,         // Giá nâng cấp mỗi cấp Talent (Credits)
    hullBonusPerLevel: 15,           // Tăng thêm +15 Max HP vĩnh viễn mỗi cấp Hull
    coinBonusPctPerLevel: 8,         // Tăng thêm +8% Credits thu được mỗi cấp
    extraRerollPerLevel: 1           // Tăng thêm +1 lượt Reroll lõi mỗi cấp
  },

  // --------------------------------------------------------------------------
  // 6. ĐỒ HỌA, INTRO & HIỆU ỨNG CHIÊU CUỐI (VISUALS & ULTI EFFECTS)
  // --------------------------------------------------------------------------
  VISUALS: {
    starfieldCount: 65,              // Số lượng hạt sao nền vũ trụ
    bgScrollSpeed: 0.85,             // Tốc độ cuộn parallax của Background vũ trụ
    exhaustAnimationSpeed: 0.25,     // Tốc độ nhấp nháy ngọn lửa phản lực tàu chiến
    screenShakeDurationFrames: 10,   // Số frame rung chấn màn hình khi trúng đòn/bắn ulti
    laserBeamDurationMs: 160,        // Thời gian tia Laser neon thường hiển thị (ms)
    laserBeamWidth: 4,               // Độ dày tia Laser thường (px)
    laserGlowWidth: 12,              // Độ dày vầng hào quang Laser thường (px)
    introDurationMs: 3800,           // Tổng thời lượng hoạt cảnh Intro khởi động trận đấu (ms)
    
    // Tham số đồ họa chùm tia chiêu cuối Hyper Beam
    hyperBeamAuraWidth: 160,         // Độ rộng vầng hào quang tím khổng lồ của Hyper Beam (px)
    hyperBeamMidWidth: 70,           // Độ rộng chùm plasma xanh cyan điện tích (px)
    hyperBeamCoreWidth: 26,          // Độ rộng lõi năng lượng laser trắng nguyên bản (px)
    hyperBeamRingsCount: 4,          // Số lượng vòng plasma gia tốc nén năng lượng ở nòng pháo
    hyperBeamSparkCount: 20          // Số lượng tia sét điện tích chớp nhoáng xung quanh chùm tia
  },

  // --------------------------------------------------------------------------
  // 7. ÂM THANH & NHẠC NỀN BGM DYNAMIC (AUDIO & ADAPTIVE BGM)
  // --------------------------------------------------------------------------
  AUDIO: {
    enabled: true,                   // Bật/tắt toàn bộ âm thanh
    bgmEnabled: true,                // Bật/tắt nhạc nền tự động
    masterVolume: 0.40,              // Âm lượng tổng thể (0.0 -> 1.0)
    bgmVolume: 0.28,                 // Âm lượng nhạc nền BGM
    laserVolume: 0.5,                // Âm lượng tiếng bắn laser
    explosionVolume: 0.7,            // Âm lượng tiếng quái nổ
    hyperBeamVolume: 0.95,           // Âm lượng chùm tia Hyper Beam cực đại
    comboDingVolume: 0.45,           // Âm lượng chuông combo
    itemCollectVolume: 0.55          // Âm lượng tiếng nhặt vật phẩm
  },

  // --------------------------------------------------------------------------
  // 8. DANH MỤC TÀU CHIẾN & ASSET MAPPING (SPACESHIPS DATABASE)
  // --------------------------------------------------------------------------
  SHIPS: [
    {
      id: "NOVA-01",
      name: "Vanguard Alpha (Nova-01)",
      role: "BALANCED",
      price: 0,
      hp: 100,
      speed: 1.0,
      passiveDesc: "Tàu chiến tân thủ tiêu chuẩn của Liên Đoàn, khả năng cơ động cân bằng và ổn định.",
      colorTheme: "cyan" as const,
      spritePath: "/assets/space/Player/player_b_m.png"
    },
    {
      id: "FROSTBYTE",
      name: "Frostbyte Sentinel",
      role: "CONTROL",
      price: 800,
      hp: 120,
      speed: 0.8,
      passiveDesc: "Mỗi khi gõ đúng 5 từ liên tiếp, tự động đóng băng toàn bộ quái vật không gian trong 2 giây.",
      colorTheme: "cyan" as const,
      spritePath: "/assets/space/Player/player_b_l1.png"
    },
    {
      id: "RAPTOR-7",
      name: "Hyperion Phantom (Raptor-7)",
      role: "VELOCITY",
      price: 1200,
      hp: 80,
      speed: 1.4,
      passiveDesc: "Nhận thêm +100% điểm Combo khi tốc độ gõ trên 1.5 từ/giây. Đạn Plasma nạp nhanh hơn.",
      colorTheme: "violet" as const,
      spritePath: "/assets/space/Player/player_r_m.png"
    },
    {
      id: "AEGIS-01",
      name: "Aegis Defender",
      role: "FORTRESS",
      price: 1500,
      hp: 180,
      speed: 0.7,
      passiveDesc: "Giáp hợp kim Titan siêu dày. Giảm 30% sát thương va chạm khi quái vật tiếp cận phòng tuyến.",
      colorTheme: "amber" as const,
      spritePath: "/assets/space/Player/player_r_r1.png"
    }
  ]
};
