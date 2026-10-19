/** Global do các script cũ (js/*.js) gắn lên window. Chỉ khai báo phần FE dùng tới. */

export interface BuildingInfo {
  id: string;
  building_id?: string;
  level: number;
  upgrading?: boolean;
  countdown?: string | null;
}

export interface GameState {
  faction?: string;
  buildings?: Record<string, number>;
  [key: string]: unknown;
}

export interface LevelBand {
  min: number;
  max: number;
}

declare global {
  interface Window {
    NLGame?: {
      getBuildingList?: (state: GameState) => BuildingInfo[];
    };
    NLDatabase?: {
      raw?: () => { buildings?: { levelBands?: LevelBand[] } } | null;
    };
    NLCity?: unknown;
    NLBoot?: {
      setProgress: (p: number, label?: string) => void;
      hold: (id: string, label?: string) => void;
      release: (id: string) => void;
      soft: (promise: Promise<unknown>, ms?: number) => Promise<void>;
      beginCity: (label?: string) => void;
      endCity: () => void;
    };
  }
}
