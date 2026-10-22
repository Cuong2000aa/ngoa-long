import type { Fx3dStyle } from "./resolveStyle";

/**
 * Timeline cảm giác Ngọa Long — 3 pha tách, không slideshow tại chỗ.
 * Charge 120–200ms → Flight 400–700ms → Impact ngắn.
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
  if (style === "nova" || style === "bagua" || style === "roar") chargeMs = 180 * sm;
  if (style === "pierce" || style === "slash") chargeMs = 130 * sm;
  if (style === "rush" || style === "charge") chargeMs = 140 * sm;
  chargeMs = clamp(chargeMs, 120, 200);

  // Flight: sprite bay path
  let flightMs = 520 * sm + extra;
  if (style === "pierce") flightMs = 440 * sm + extra;
  if (style === "slash") flightMs = 480 * sm + extra;
  if (style === "beam" || style === "shadow") flightMs = 540 * sm + extra;
  if (style === "nova") flightMs = 500 * sm + extra;
  if (style === "rush") flightMs = 420 * sm + extra;
  if (style === "charge") flightMs = 560 * sm + extra;
  if (style === "breath" || style === "tide" || style === "ice") flightMs = 600 * sm + extra;
  if (style === "thunder" || style === "poison" || style === "whirl") flightMs = 560 * sm + extra;
  flightMs = clamp(flightMs, 400, 700);

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

/** Timeline hon qi-stream — cùng biên cảm giác (không charge 380ms đứng hình). */
export function honHostileTimeline(opts: {
  pattern?: string | null;
  scale?: string | null;
  qiStream?: boolean;
}): {
  chargeMs: number;
  formMs: number;
  flightMs: number;
  dissolveMs: number;
  flightBeats: number;
} {
  const base = hostileTimeline({
    style: "breath",
    scale: opts.scale,
    pattern: opts.pattern,
  });
  const chargeMs = clamp(base.chargeMs + (opts.qiStream ? 20 : 0), 120, 200);
  const flightMs = clamp(base.flightMs, 400, 700);
  return {
    chargeMs,
    formMs: opts.qiStream ? 50 : 100,
    flightMs,
    dissolveMs: 240,
    flightBeats: opts.qiStream ? 2 : 1,
  };
}
