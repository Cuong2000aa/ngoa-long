import type { LevelBand } from "../types/legacy";

/** Bản sao levelBands trong data/buildings.json, dùng khi DB chưa sẵn. */
const FALLBACK_BANDS: LevelBand[] = [
  { min: 1, max: 9 },
  { min: 10, max: 19 },
  { min: 20, max: 39 },
  { min: 40, max: 59 },
  { min: 60, max: 99 },
  { min: 100, max: 180 },
];

export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export function tierOf(level: number | undefined): Tier {
  let bands = FALLBACK_BANDS;
  try {
    const raw = window.NLDatabase?.raw?.();
    if (raw?.buildings?.levelBands?.length) bands = raw.buildings.levelBands;
  } catch {
    /* giữ bảng cục bộ */
  }
  const lv = Math.max(1, level || 1);
  for (let i = bands.length - 1; i >= 0; i--) {
    if (lv >= bands[i].min) return Math.min(5, i) as Tier;
  }
  return 0;
}
