import type { Fx3dStyle } from "./resolveStyle";

/**
 * Timeline cảm giác Ngọa Long — 3 pha tách, không slideshow tại chỗ.
 * Charge 120–220ms → Flight (đủ nhìn path) → Impact ngắn.
 * Mọi hồn qi-stream (rồng/lôi/thủy/độc/hổ…): flight ~1.1–1.2s như Hỏa Long.
 */
export type HostileTimeline = {
  chargeMs: number;
  flightMs: number;
  impactMs: number;
  /** bless/barrier: không bắt buộc đạn bay */
  needsFlight: boolean;
  /** Tổng đến lúc impact bắt đầu */
  impactAtMs: number;
};

function softScaleMul(scale?: string | null): number {
  const s = String(scale || "M").toUpperCase();
  if (s === "L") return 1.12;
  if (s === "S") return 0.9;
  return 1;
}

function patternFlightExtra(pattern?: string | null): number {
  const p = String(pattern || "single").toLowerCase();
  if (p === "all" || p === "ally_all") return 80;
  if (p === "column") return 60;
  if (p === "row" || p === "front_row") return 40;
  return 0;
}

/** Clamp ms vào [lo, hi]. */
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Timeline thống nhất mọi style hostile.
 * Hon pack dùng cùng biên charge/flight (sequence tự chạy bên trong).
 */
export function hostileTimeline(opts: {
  style: Fx3dStyle;
  scale?: string | null;
  pattern?: string | null;
}): HostileTimeline {
  const style = opts.style;
  const sm = softScaleMul(opts.scale);
  const extra = patternFlightExtra(opts.pattern);

  if (style === "barrier") {
    const chargeMs = clamp(160 * sm, 120, 200);
    return { chargeMs, flightMs: 0, impactMs: 280, needsFlight: false, impactAtMs: chargeMs };
  }
  if (style === "bless") {
    const chargeMs = clamp(150 * sm, 120, 200);
    // Soft path đồng minh — ngắn, không “đạn địch”
    const flightMs = clamp(320 * sm, 280, 420);
    return {
      chargeMs,
      flightMs,
      impactMs: 320,
      needsFlight: true,
      impactAtMs: chargeMs + flightMs,
    };
  }

  // Charge: tụ lực tại caster
  let chargeMs = 160 * sm;
  if (style === "nova" || style === "roar") chargeMs = 180 * sm;
  if (style === "bagua") chargeMs = 180 * sm;
  if (style === "breath") chargeMs = 200 * sm;
  if (style === "pierce" || style === "slash") chargeMs = 130 * sm;
  if (style === "rush" || style === "charge") chargeMs = 140 * sm;
  chargeMs = clamp(chargeMs, 120, 220);

  // Flight — hồn thú / long / pháp: cùng tốc độ Hỏa Long (~1.1s)
  const spiritLike =
    style === "breath" ||
    style === "tide" ||
    style === "ice" ||
    style === "thunder" ||
    style === "poison" ||
    style === "whirl" ||
    style === "roar" ||
    style === "bagua" ||
    style === "shadow";

  let flightMs = 560 * sm + extra;
  let flightLo = 420;
  let flightHi = 850;
  if (style === "pierce") flightMs = 480 * sm + extra;
  if (style === "slash") flightMs = 520 * sm + extra;
  if (style === "beam") {
    flightMs = 600 * sm + extra;
    flightHi = 900;
  }
  if (style === "nova") flightMs = 560 * sm + extra;
  if (style === "rush") flightMs = 460 * sm + extra;
  if (style === "charge") flightMs = 600 * sm + extra;
  if (spiritLike) {
    flightMs = 1100 * sm + extra;
    flightLo = 950;
    flightHi = 1300;
    chargeMs = clamp(Math.max(chargeMs, 200 * sm), 120, 240);
  }
  flightMs = clamp(flightMs, flightLo, flightHi);

  const impactMs =
    style === "nova" || style === "roar" ? 380 : style === "pierce" || style === "slash" ? 280 : 320;

  return {
    chargeMs,
    flightMs,
    impactMs,
    needsFlight: true,
    impactAtMs: chargeMs + flightMs,
  };
}

/** Timeline hon qi-stream — flight đủ dài để flipbook lưỡn đọc được. */
export function honHostileTimeline(opts: {
  pattern?: string | null;
  scale?: string | null;
  qiStream?: boolean;
  /** Pack rồng / thủy… — mặc định breath timing */
  style?: Fx3dStyle;
}): {
  chargeMs: number;
  formMs: number;
  flightMs: number;
  dissolveMs: number;
  flightBeats: number;
} {
  const style = opts.style || "breath";
  const base = hostileTimeline({
    style,
    scale: opts.scale,
    pattern: opts.pattern,
  });
  const chargeMs = clamp(base.chargeMs + (opts.qiStream ? 24 : 0), 160, 240);
  const flightMs = base.flightMs; // spiritLike → ~1.1s
  return {
    chargeMs,
    formMs: opts.qiStream ? 60 : 100,
    flightMs,
    dissolveMs: 280,
    flightBeats: opts.qiStream ? 3 : 1,
  };
}
