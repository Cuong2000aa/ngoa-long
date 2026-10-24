import type * as THREE from "three";
import type { Fx3dStyle, HonPackId } from "./resolveStyle";
import { honPackForStyle } from "./resolveStyle";
import { hostileTimeline } from "./hostileTimeline";

export type Fx3dHandle = { cancel: () => void };
export { hostileTimeline, honHostileTimeline } from "./hostileTimeline";
export type { HostileTimeline } from "./hostileTimeline";

/** API emitter — inject từ battleVfx3d để tránh circular import. */
export type StylePlayApi = {
  emitGroundSigil3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitBodyAura3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitShockwave3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitBurst3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    flash: string,
    scale?: string | null
  ) => Fx3dHandle;
  emitDust3d: (scene: THREE.Scene, at: THREE.Vector3, scale?: string | null) => Fx3dHandle;
  emitFlashDisc3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    flash: string,
    scale?: string | null
  ) => Fx3dHandle;
  emitSparksBurst3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitResidual3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitGroundMark3d: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitTrail3d: (
    scene: THREE.Scene,
    from: THREE.Vector3,
    to: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitPremiumLayersAt: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    layers: unknown[],
    opts: Record<string, unknown>
  ) => Fx3dHandle[];
  emitHostileProjectile3d: (
    scene: THREE.Scene,
    from: THREE.Vector3,
    to: THREE.Vector3,
    style: Fx3dStyle,
    flash: string,
    scale?: string | null,
    pattern?: string | null,
    durationMs?: number
  ) => Fx3dHandle[];
  emitHonSpiritSequence3d: (
    scene: THREE.Scene,
    from: THREE.Vector3,
    to: THREE.Vector3,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  emitItchFolderPackAt: (
    scene: THREE.Scene,
    at: THREE.Vector3,
    pack: string,
    name: string,
    n: number,
    opts: Record<string, unknown>
  ) => Fx3dHandle;
  skillPremiumLayers: (style: Fx3dStyle, flash: string) => { cast: unknown[]; hit: unknown[] };
  flashPalette: (flash?: string) => { base: THREE.Color; hot: THREE.Color; cool: THREE.Color };
  /** Impact juice — cam punch / hitstop nếu BattleRenderer gắn */
  onImpactJuice?: (style: Fx3dStyle, scale?: string | null) => void;
};

export type StylePlayParams = {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash: string;
  style: Fx3dStyle;
  scale?: string | null;
  phase: "emission" | "impact" | "full" | "charge" | "flight";
  skillId?: string | null;
  pattern?: string | null;
  targets?: THREE.Vector3[];
  /** Override flight duration từ hostileTimeline */
  flightMs?: number;
};

/** Pattern → scale path / ground / layer (không clone motif). */
export function patternVariant(pattern?: string | null): {
  groundMul: number;
  shockMul: number;
  trailMul: number;
  densityMul: number;
  markMul: number;
  durationMul: number;
  kind: "point" | "column" | "row" | "aoe";
} {
  const p = String(pattern || "single").toLowerCase();
  if (p === "all" || p === "ally_all")
    return {
      groundMul: 1.5,
      shockMul: 1.55,
      trailMul: 1.15,
      densityMul: 1.3,
      markMul: 1.55,
      durationMul: 1.12,
      kind: "aoe",
    };
  if (p === "column")
    return {
      groundMul: 1.1,
      shockMul: 1.08,
      trailMul: 1.4,
      densityMul: 1.12,
      markMul: 1.08,
      durationMul: 1.08,
      kind: "column",
    };
  if (p === "row" || p === "front_row")
    return {
      groundMul: 1.25,
      shockMul: 1.2,
      trailMul: 1.35,
      densityMul: 1.1,
      markMul: 1.2,
      durationMul: 1.05,
      kind: "row",
    };
  return {
    groundMul: 1,
    shockMul: 1,
    trailMul: 1,
    densityMul: 1,
    markMul: 1,
    durationMul: 1,
    kind: "point",
  };
}

function softScale(scale?: string | null): number {
  const s = String(scale || "M").toUpperCase();
  if (s === "L") return 1.22;
  if (s === "S") return 0.82;
  return 1;
}

/** Tint beam theo flash — cùng style, khác overlay. */
export function beamFlashTint(flash?: string | null): number {
  const f = String(flash || "").toLowerCase();
  if (f === "blue" || f === "cyan" || f === "teal") return 0x38bdf8;
  if (f === "violet") return 0xc4b5fd;
  if (f === "purple") return 0xa78bfa;
  return 0x818cf8;
}

function castTintFor(style: Fx3dStyle, flash: string, palHex: number): number {
  if (style === "beam") return beamFlashTint(flash);
  if (style === "ice") return 0xbae6fd;
  if (style === "pierce") return 0xfde68a;
  if (style === "shadow") return 0x7c3aed;
  if (style === "nova") return 0xff7a2e;
  return palHex;
}

function lateralOffset(from: THREE.Vector3, to: THREE.Vector3, dist: number): { x: number; z: number } {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: (-dz / len) * dist, z: (dx / len) * dist };
}

function emitPatternExtraTrails(
  api: StylePlayApi,
  params: StylePlayParams,
  handles: Fx3dHandle[],
  opts: { density: number; arc: number; durationMs: number; flash: string }
): void {
  const { scene, from, to, scale, pattern } = params;
  const pv = patternVariant(pattern);
  if (pv.kind === "column") {
    const fromHi = from.clone();
    fromHi.y += 0.55;
    const toHi = to.clone();
    toHi.y += 0.32;
    handles.push(
      api.emitTrail3d(scene, fromHi, toHi, {
        flash: opts.flash,
        durationMs: opts.durationMs,
        density: Math.round(opts.density * 0.75),
        arc: opts.arc * 1.15,
        scale,
        streak: true,
      })
    );
  } else if (pv.kind === "row") {
    const lat = lateralOffset(from, to, 0.62);
    for (const sign of [1, -1] as const) {
      const fromS = from.clone();
      fromS.x += lat.x * sign;
      fromS.z += lat.z * sign;
      const toS = to.clone();
      toS.x += lat.x * sign;
      toS.z += lat.z * sign;
      handles.push(
        api.emitTrail3d(scene, fromS, toS, {
          flash: opts.flash,
          durationMs: opts.durationMs,
          density: Math.round(opts.density * 0.55),
          arc: opts.arc * 0.7,
          scale,
          streak: true,
        })
      );
    }
  }
}

/**
 * PHA 1 — Charge tại caster (≤3 layer). Không đạn bay.
 * bless/barrier: cast + pulse rõ.
 */
export function runStyleCharge(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, from, flash, style, scale, pattern } = params;
  const premium = api.skillPremiumLayers(style, flash);
  const palHex = api.flashPalette(flash).base.getHex();
  const tint = castTintFor(style, flash, palHex);
  const tl = hostileTimeline({ style, scale, pattern });
  const chargeMs = tl.chargeMs;
  const sm = softScale(scale);
  const pv = patternVariant(pattern);

  if (style === "barrier") {
    handles.push(
      api.emitGroundSigil3d(scene, from, { flash: "shield", scale, durationMs: chargeMs + 40, color: 0x93c5fd })
    );
    handles.push(
      api.emitBodyAura3d(scene, from, {
        flash: "shield",
        scale,
        durationMs: chargeMs + 80,
        color: 0xdbeafe,
        pack: "elden_ring",
      })
    );
    handles.push(
      api.emitShockwave3d(scene, from, { flash: "shield", scale, radius: 2.1 * sm, durationMs: chargeMs + 60 })
    );
    return;
  }

  if (style === "bless") {
    handles.push(
      api.emitGroundSigil3d(scene, from, {
        flash: flash || "gold_soft",
        scale,
        durationMs: chargeMs + 40,
        color: 0xfde68a,
      })
    );
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash: flash || "gold_soft",
        scale,
        radius: 1.45 * sm,
        durationMs: chargeMs,
      })
    );
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast.slice(0, 1), {
        scale,
        durationMs: chargeMs,
        color: 0xfef08a,
        y0: 0.06,
      })
    );
    return;
  }

  // Hostile charge — tối đa 3: sigil + cast sheet + flash/shock
  handles.push(
    api.emitGroundSigil3d(scene, from, {
      flash,
      scale,
      durationMs: chargeMs + 30,
      color: tint,
    })
  );
  handles.push(
    ...api.emitPremiumLayersAt(scene, from, premium.cast.slice(0, 1), {
      scale,
      durationMs: chargeMs,
      y0: 0.08,
      color: tint,
    })
  );
  if (style === "nova" || style === "roar" || pv.kind === "aoe") {
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash,
        scale,
        radius: 1.6 * sm * pv.shockMul,
        durationMs: chargeMs,
      })
    );
  } else {
    handles.push(api.emitFlashDisc3d(scene, from, flash, scale));
  }
}

/**
 * PHA 2 — Flight: main sprite BAY from→to (flipbook dọc đường).
 * ≤3 layer: underlay+main trong projectile + 1 trail.
 */
export function runStyleFlight(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, from, to, flash, style, scale, pattern, flightMs } = params;
  const pv = patternVariant(pattern);
  const tl = hostileTimeline({ style, scale, pattern });
  const dur = flightMs ?? tl.flightMs;

  if (style === "barrier") return;
  if (!tl.needsFlight && style !== "bless") return;

  // Slash / pierce / beam / shadow / rush: trail quét + projectile bay
  if (style === "slash") {
    const dens = Math.round(20 * pv.densityMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: dur,
        density: dens,
        arc: pv.kind === "row" ? 0.16 : pv.kind === "column" ? 0.4 : 0.3,
        scale,
        streak: true,
      })
    );
    emitPatternExtraTrails(api, params, handles, { density: dens, arc: 0.28, durationMs: dur, flash });
  } else if (style === "pierce") {
    const dens = Math.round(10 * pv.densityMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: dur,
        density: dens,
        arc: pv.kind === "column" ? 0.1 : 0.05,
        scale,
        streak: true,
      })
    );
  } else if (style === "beam" || style === "shadow") {
    const dens = Math.round(14 * pv.densityMul * pv.trailMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: dur,
        density: dens,
        arc: pv.kind === "row" ? 0.14 : pv.kind === "column" ? 0.38 : 0.3,
        scale,
        streak: true,
      })
    );
    if (pv.kind === "column" || pv.kind === "row") {
      emitPatternExtraTrails(api, params, handles, { density: dens, arc: 0.28, durationMs: dur, flash });
    }
  } else if (style === "rush" || style === "charge") {
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: dur,
        density: style === "charge" ? 18 : 16,
        arc: style === "charge" ? 0.2 : 0.32,
        scale,
        streak: true,
      })
    );
    if (style === "charge") {
      handles.push(api.emitDust3d(scene, from.clone().lerp(to, 0.4), scale));
    }
  } else if (style === "nova" && pv.kind === "aoe") {
    // Nova AoE: pulse giữa path + đạn
    handles.push(
      api.emitShockwave3d(scene, from.clone().lerp(to, 0.35), {
        flash,
        scale,
        radius: 2.2 * softScale(scale),
        durationMs: Math.min(dur, 420),
      })
    );
  }

  // Main bay — bắt buộc cho hostile (bless cũng soft path)
  handles.push(...api.emitHostileProjectile3d(scene, from, to, style, flash, scale, pattern, dur));
}

/**
 * PHA 3 — Impact ngắn + residual (≤3 layer). Không overlap charge.
 */
export function runStyleImpact(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, to, flash, style, scale, skillId, pattern } = params;
  if (honPackForStyle(style, flash, skillId)) return;

  const premium = api.skillPremiumLayers(style, flash);
  const pv = patternVariant(pattern);
  const sm = softScale(scale);
  const hitTint = style === "beam" ? beamFlashTint(flash) : api.flashPalette(flash).cool.getHex();
  const tl = hostileTimeline({ style, scale, pattern });

  if (style === "barrier") {
    handles.push(api.emitFlashDisc3d(scene, to, "shield", scale));
    handles.push(
      api.emitShockwave3d(scene, to, { flash: "shield", scale, radius: 2.0 * sm, durationMs: tl.impactMs })
    );
    api.onImpactJuice?.(style, scale);
    return;
  }

  if (style === "bless") {
    handles.push(api.emitFlashDisc3d(scene, to, flash || "gold_soft", scale));
    handles.push(
      ...api.emitPremiumLayersAt(scene, to, premium.hit.slice(0, 1), {
        scale,
        durationMs: tl.impactMs,
        y0: 0.2,
        color: 0xfde68a,
      })
    );
    handles.push(
      api.emitResidual3d(scene, to, {
        flash: flash || "gold_soft",
        scale,
        delayMs: 40,
        color: 0xfde68a,
      })
    );
    api.onImpactJuice?.(style, scale);
    return;
  }

  // Impact: Flash disc tức thì + burst + 2 lớp hit sheet đa tầng
  handles.push(api.emitFlashDisc3d(scene, to, flash, scale));
  handles.push(api.emitBurst3d(scene, to, flash, scale));
  handles.push(
    ...api.emitPremiumLayersAt(scene, to, premium.hit.slice(0, 2), {
      scale,
      durationMs: tl.impactMs,
      y0: 0.28,
      color: style === "beam" ? hitTint : undefined,
    })
  );

  if (style === "slash" || style === "pierce" || style === "beam" || style === "rush" || style === "charge") {
    // sparks thay ground nếu đã đủ 3 — dùng residual thay sparks khi nova/aoe
    if (pv.kind !== "aoe") {
      handles.push(api.emitSparksBurst3d(scene, to, { flash, scale }));
    } else {
      handles.push(
        api.emitShockwave3d(scene, to, {
          flash,
          scale,
          radius: 2.6 * sm * pv.shockMul,
          durationMs: tl.impactMs,
        })
      );
    }
  } else if (style === "nova" || style === "roar" || style === "whirl") {
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius: (style === "nova" ? 3.0 : 2.4) * sm * pv.shockMul,
        durationMs: tl.impactMs,
      })
    );
  } else {
    handles.push(
      api.emitResidual3d(scene, to, { flash, scale, delayMs: 50, color: hitTint })
    );
  }

  // Ground mark nhẹ (không thêm layer nếu đã 3 sparks) — luôn residual mờ ngắn
  if (style === "nova" || pv.kind === "aoe" || style === "bagua") {
    handles.push(
      api.emitGroundMark3d(scene, to, {
        flash,
        scale,
        durationMs: Math.min(720, tl.impactMs + 280),
        color: hitTint,
      })
    );
  }

  api.onImpactJuice?.(style, scale);
}

/**
 * @deprecated Dùng charge→flight→impact qua playSkillFx3d.
 * Giữ tương thích phase=emission (gọi cả charge+flight liền — tránh nếu có thể).
 */
export function runStyleEmission(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const hon: HonPackId | null = honPackForStyle(params.style, params.flash, params.skillId);
  if (hon) {
    if (params.phase === "impact") return;
    handles.push(
      api.emitHonSpiritSequence3d(params.scene, params.from, params.to, {
        scale: params.scale,
        pack: hon,
        skillId: params.skillId,
        pattern: params.pattern,
        targets: params.targets?.length ? params.targets : [params.to],
      })
    );
    return;
  }
  runStyleCharge(api, params, handles);
  runStyleFlight(api, { ...params, flightMs: params.flightMs }, handles);
}
