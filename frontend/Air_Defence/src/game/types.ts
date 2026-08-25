export type Screen = "deck" | "hangar" | "talent" | "shop" | "queue" | "endless" | "pvp" | "augment" | "debrief" | "rank";

export type GameMode = "endless" | "pvp";

export type AugmentCategory = "OFFENSE" | "DEFENSE" | "CONTROL" | "UTILITY" | "SURVIVAL" | "TACTICAL";

export interface AugmentCard {
  id: string;
  title: string;
  description: string;
  category: AugmentCategory;
  icon: string;
  tone: "cyan" | "rose" | "violet" | "amber";
}

export interface TargetWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  posX: number;
  posY: number;
  speed: number;
  type: "MONSTER_NORMAL" | "MONSTER_FAST" | "SPACE_MINE" | "MINI_BOSS";
  maxHp?: number;
  currentHp?: number;
  isDead?: boolean;
}

export type LootItemType = "CREDIT_CRYSTAL" | "REPAIR_PACK" | "HYPER_ORB";

export interface LootItem {
  id: string;
  type: LootItemType;
  x: number;      // % of canvas width
  y: number;      // % of canvas height
  vx: number;     // horizontal velocity
  vy: number;     // vertical velocity
  value: number;  // amount of credit / hp / charge
  collected: boolean;
  spawnTime: number;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  opacity: number;
  life: number;
}

export interface WeakWord {
  word: string;
  reading: string;
  meaning: string;
  note: string;
}

export interface ShipDef {
  id: string;
  name: string;
  role: string;
  hp: number;
  speed: number;
  price: number;
  colorTheme: "cyan" | "violet" | "amber";
  spritePath: string;
  passiveDesc: string;
}
