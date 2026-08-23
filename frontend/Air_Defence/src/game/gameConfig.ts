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
    baseHp: 100,                     // Máu cơ bản của người chơi
    baseShield: 0,                   // Giáp khởi đầu
    hyperBeamChargePerHit: 10,       // % Năng lượng Hyper Beam nạp sau mỗi lần gõ đúng
    hyperBeamMaxCharge: 100,         // Ngưỡng năng lượng để kích hoạt Hyper Beam (100%)
    dangerZoneThreshold: 75,         // Ngưỡng % màn hình quái tiến gần để cảnh báo đỏ
    damagePerEnemyReachBottom: 15,   // Sát thương khi quái vật chạm đáy phòng tuyến
    initialCredits: 1200             // Số Credits tân thủ khởi tạo
  },

  // --------------------------------------------------------------------------
  // 2. CÂN BẰNG QUÁI VẬT & LÀN SÓNG (ENEMY & WAVE BALANCE)
  // --------------------------------------------------------------------------
  ENEMIES: {
    baseEnemyCount: 5,               // Số lượng quái Wave 1 (Khởi đầu 5 con)
    enemiesPerWaveIncrement: 2,      // Tăng số lượng vừa phải (+2 con mỗi Wave)
    maxEnemyCount: 16,               // Giới hạn số quái tối đa để không gây nghẽn màn hình
    bossEveryNWaves: 5,              // Cứ sau 5 wave thì xuất hiện Boss (Wave 5, 10, 15...)
    bossHp: 5,                       // Máu của Boss (cần gõ 5 từ vựng để tiêu diệt)
    bossMinionReduction: 0.5,        // Giảm 50% số lượng lính ở màn Boss để tập trung vào Boss
    bossScale: 2.6,                  // Kích thước Boss khổng lồ áp đảo (2.6x)
    enemySpawnSpacingY: 12,          // Khoảng cách posY giữa các quái khi spawn ngoài màn hình
    baseSpeed: 0.055,                // Tốc độ rơi cơ bản của quái vật (% chiều cao/frame)
    speedWaveMultiplier: 0.011,      // Tăng tốc độ rơi rõ rệt sau mỗi Wave (thách thức phản xạ)
    fastEnemySpeedMult: 1.45,        // Hệ số tốc độ của Quái Tốc Biến (Monster Fast)
    spaceMineSpeedMult: 0.9,         // Hệ số tốc độ của Thủy Lôi Vũ Trụ (Space Mine)
    bossSpeedMult: 0.52,             // Hệ số tốc độ của Boss chiến hạm khổng lồ
    augmentDraftInterval: 3,         // Cứ sau mỗi 3 Wave thì mở màn hình chọn Lõi (Augment)
    defaultRerolls: 3                // Số lượt Reroll lõi mặc định
  },

  // --------------------------------------------------------------------------
  // 3. CÂN BẰNG ĐIỂM SỐ & PHẦN THƯỞNG (SCORING & REWARDS)
  // --------------------------------------------------------------------------
  SCORING: {
    baseScorePerTarget: 150,         // Điểm cơ bản khi bắn nổ 1 quái
    bossScoreBonus: 3000,            // Điểm thưởng cực lớn khi hạ Boss
    comboBonusMultiplier: 0.1,       // Thêm +10% điểm cho mỗi nấc Combo
    baseCreditsPerTarget: 5,         // Credits thưởng cho mỗi quái
    creditsWaveMultiplier: 2,        // Credits thưởng tăng theo Wave
    bossCreditsBonus: 150,           // Credits thưởng thêm khi hạ Boss
    dualCannonScoreBonus: 1.5,       // Hệ số điểm khi có Lõi Dual Cannon
    goldMagnetCoinBonus: 1.5         // Hệ số Coin khi có Lõi Gold Magnet
  },

  // --------------------------------------------------------------------------
  // 4. VIỆN NÂNG CẤP VĨNH VIỄN (PERMANENT TALENT UPGRADES)
  // --------------------------------------------------------------------------
  TALENTS: {
    upgradeCostCredits: 480,         // Giá nâng cấp mỗi cấp Talent
    hullBonusPerLevel: 15,           // Thêm +15 Max HP mỗi cấp
    coinBonusPctPerLevel: 8,         // Thêm +8% Credits mỗi cấp
    extraRerollPerLevel: 1           // Thêm +1 lượt Reroll mỗi cấp
  },

  // --------------------------------------------------------------------------
  // 5. ĐỒ HỌA, SPRITES VÀ HIỆU ỨNG (VISUALS & SPRITE ASSETS)
  // --------------------------------------------------------------------------
  VISUALS: {
    starfieldCount: 65,              // Số lượng hạt sao nền không gian
    bgScrollSpeed: 0.85,             // Tốc độ cuộn parallax của Background vũ trụ
    exhaustAnimationSpeed: 0.25,     // Tốc độ nhấp nháy ngọn lửa phản lực tàu chiến
    screenShakeDurationFrames: 8,    // Số frame rung màn hình khi bị đánh trúng
    laserBeamDurationMs: 160,        // Thời gian tia Laser neon hiển thị (ms)
    laserBeamWidth: 4,               // Độ dày tia Laser
    laserGlowWidth: 12               // Độ dày ánh sáng vầng hào quang Laser
  },

  // --------------------------------------------------------------------------
  // 6. ÂM THANH & HIỆU ỨNG ÂM THANH (AUDIO & SFX SYNTHESIZER)
  // --------------------------------------------------------------------------
  AUDIO: {
    enabled: true,                   // Bật/tắt âm thanh
    masterVolume: 0.35,              // Âm lượng tổng thể (0.0 -> 1.0)
    laserVolume: 0.5,                // Âm lượng tiếng bắn laser
    explosionVolume: 0.7,            // Âm lượng tiếng quái nổ
    hyperBeamVolume: 0.9,            // Âm lượng chùm tia Hyper Beam
    comboDingVolume: 0.45            // Âm lượng chuông combo
  },

  // --------------------------------------------------------------------------
  // 7. DANH MỤC TÀU CHIẾN & ASSET MAPPING (SPACESHIPS DATABASE)
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
