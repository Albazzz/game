export type Screen = "deck" | "hangar" | "talent" | "shop" | "queue" | "endless" | "pvp" | "augment" | "debrief" | "rank";

export type AugmentCategory = "OFFENSIVE" | "DEFENSIVE" | "CONTROL" | "UTILITY";

export interface AugmentCard {
  id: string;
  title: string;
  description: string;
  category: AugmentCategory;
  icon: string;
  tone: "cyan" | "rose" | "violet" | "amber";
}

export interface EnemyTarget {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  type: "MONSTER_NORMAL" | "MONSTER_FAST" | "SPACE_MINE" | "MINI_BOSS";
  posX: number; // 10..90 %
  posY: number; // 0..100 %
  speed: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  spawnTime: number;
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
  role: "BALANCED" | "CONTROL" | "VELOCITY" | "FORTRESS";
  hp: number;
  speed: number;
  price: number;
  colorTheme: "cyan" | "violet" | "amber";
  spriteKey: string;
  passiveDesc: string;
}
