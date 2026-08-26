/**
 * Air Defense Backend API Client
 * Tương tác và đồng bộ vĩnh viễn dữ liệu người chơi với Cơ sở dữ liệu PostgreSQL qua Spring Boot REST API.
 */

export interface BackendShopView {
  coinsBalance: number;
  equippedShipId: string;
  extraBaseHpLevel: number;
  coinBonusLevel: number;
  rerollCountLevel: number;
  fastStartLevel: number;
  ships: {
    shipId: string;
    name: string;
    role: string;
    description: string;
    priceCoins: number;
    baseHp: number;
    speedMult: number;
    passiveSkillCode: string;
    colorTheme: string;
    owned: boolean;
    equipped: boolean;
  }[];
}

export interface MatchFinishPayload {
  score: number;
  wave: number;
  bestCombo: number;
  creditsEarned: number;
  durationMs: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercent: number;
  playMode?: string;
  difficulty?: string;
}

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jlas_token") ||
    "";

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchShopDataApi(): Promise<BackendShopView | null> {
  try {
    const res = await fetch("/api/air-defense/shop/ships", {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Lỗi fetch shop data từ database:", err);
    return null;
  }
}

export async function buyShipApi(shipId: string): Promise<BackendShopView | null> {
  try {
    const res = await fetch(`/api/air-defense/shop/buy-ship/${shipId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Lỗi gọi API mua tàu:", err);
    return null;
  }
}

export async function equipShipApi(shipId: string): Promise<BackendShopView | null> {
  try {
    const res = await fetch(`/api/air-defense/shop/equip-ship/${shipId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Lỗi gọi API trang bị tàu:", err);
    return null;
  }
}

export async function upgradeTalentApi(talentType: string): Promise<BackendShopView | null> {
  try {
    const res = await fetch("/api/air-defense/shop/upgrade-talent", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ talentType })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Lỗi gọi API nâng cấp talent:", err);
    return null;
  }
}

export async function recordMatchFinishApi(payload: MatchFinishPayload): Promise<BackendShopView | null> {
  try {
    const res = await fetch("/api/air-defense/match/finish", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Lỗi lưu kết quả trận đấu vào database:", err);
    return null;
  }
}

export interface LeaderboardItem {
  rank: number;
  userId: number;
  displayName: string;
  shipId: string;
  shipName: string;
  shipTone: "cyan" | "amber" | "violet" | "rose" | "emerald";
  score: number;
  waveReached: number;
  bestCombo: number;
  accuracyPercent: number;
  rankTier: string;
  isCurrentUser: boolean;
}

export async function fetchLeaderboardApi(mode: "endless" | "ranked" = "endless"): Promise<LeaderboardItem[]> {
  try {
    const res = await fetch(`/api/air-defense/leaderboard/${mode}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn(`Lỗi tải bảng xếp hạng ${mode} từ database:`, err);
    return [];
  }
}
