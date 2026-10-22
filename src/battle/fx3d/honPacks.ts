import type { HonPackId } from "./resolveStyle";

export type HonPackPaths = {
  serpent: string[];
  mist: string[];
  sparkle: string[];
  ring: string[];
  crescent: string[];
  orb: string;
  tint: number;
  flash: string;
  head: string[];
  body: string[];
  emissive: number;
  yawOffset: number;
};

const _pad2 = (n: number) => String(n).padStart(2, "0");
/** `assets/fx/{folder}/{prefix}_01.png` … */
export const fxSeq = (folder: string, prefix: string, n: number, start = 1) =>
  Array.from({ length: n }, (_, i) => `assets/fx/${folder}/${prefix}_${_pad2(start + i)}.png`);
const _fxSeq = fxSeq;

function honPaths(
  tint: number,
  flash: string,
  emissive: number,
  qiFolder: string,
  yawOffset = 0
): HonPackPaths {
  const flight = _fxSeq(qiFolder, "flight", 24);
  const charge = _fxSeq(qiFolder, "charge", 24);
  return {
    serpent: flight,
    mist: charge,
    sparkle: [],
    ring: charge,
    crescent: [],
    orb: "",
    tint,
    flash,
    head: flight,
    body: flight,
    emissive,
    yawOffset,
  };
}

/**
 * Hồn = qi-stream trong assets/fx/skill/* (charge → flight → impact).
 * Id code giữ hon_* ; folder runtime = skill/{short}/qi_*.
 */
export const HON_PACKS: Record<HonPackId, HonPackPaths> = {
  hon_rong: honPaths(0xff8a3a, "fire", 0xff4a12, "skill/rong/qi_fire"),
  hon_xa: honPaths(0x6ee7a8, "green_poison", 0x22c55e, "skill/xa/qi_poison"),
  hon_ho: honPaths(0xfbbf24, "tiger", 0xf59e0b, "skill/ho/qi_tiger"),
  hon_soi: honPaths(0xcbd5e1, "wolf", 0x94a3b8, "skill/soi/qi_wolf"),
  hon_thuy: honPaths(0x38bdf8, "blue_water", 0x0ea5e9, "skill/thuy/qi_water"),
  hon_loi: honPaths(0xfde047, "thunder", 0xfacc15, "skill/loi/qi_thunder"),
  hon_phong: honPaths(0xa5f3fc, "whirlwind", 0x67e8f9, "skill/phong/qi_wind"),
  hon_bagua: honPaths(0xf5e6c8, "bagua", 0xc4b5fd, "skill/bagua/qi_bagua"),
  hon_hon: honPaths(0xe0e7ff, "violet_spirit", 0xa78bfa, "skill/hon/qi_soul"),
};

const HON_SIZE_MIN = 1.05;
const HON_SIZE_MAX = 1.85;
const HON_SIZE_DEFAULT = 1.45;

export function clampHonTargetSize(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return HON_SIZE_DEFAULT;
  return Math.min(HON_SIZE_MAX, Math.max(HON_SIZE_MIN, raw));
}
