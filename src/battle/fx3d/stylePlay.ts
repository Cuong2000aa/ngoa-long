import type * as THREE from "three";
import type { Fx3dStyle, HonPackId } from "./resolveStyle";
import { honPackForStyle } from "./resolveStyle";

export type Fx3dHandle = { cancel: () => void };

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
    pattern?: string | null
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
};

export type StylePlayParams = {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash: string;
  style: Fx3dStyle;
  scale?: string | null;
  phase: "emission" | "impact" | "full";
  skillId?: string | null;
  pattern?: string | null;
  targets?: THREE.Vector3[];
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
    const fromL = from.clone();
    fromL.x += lat.x;
    fromL.z += lat.z;
    const toL = to.clone();
    toL.x += lat.x;
    toL.z += lat.z;
    const fromR = from.clone();
    fromR.x -= lat.x;
    fromR.z -= lat.z;
    const toR = to.clone();
    toR.x -= lat.x;
    toR.z -= lat.z;
    handles.push(
      api.emitTrail3d(scene, fromL, toL, {
        flash: opts.flash,
        durationMs: opts.durationMs,
        density: Math.round(opts.density * 0.55),
        arc: opts.arc * 0.7,
        scale,
        streak: true,
      })
    );
    handles.push(
      api.emitTrail3d(scene, fromR, toR, {
        flash: opts.flash,
        durationMs: opts.durationMs,
        density: Math.round(opts.density * 0.55),
        arc: opts.arc * 0.7,
        scale,
        streak: true,
      })
    );
  } else if (pv.kind === "aoe") {
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash: opts.flash,
        scale,
        radius: 2.4 * softScale(scale) * pv.shockMul,
        durationMs: 640,
      })
    );
  }
}

/** Emission theo style — barrier / bless / hồn / hostile mặc định. */
export function runStyleEmission(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, from, to, flash, style, scale, phase, skillId, pattern } = params;
  const premium = api.skillPremiumLayers(style, flash);
  const palHex = api.flashPalette(flash).base.getHex();
  const pv = patternVariant(pattern);
  const sm = softScale(scale);

  if (style === "barrier") {
    handles.push(
      api.emitGroundSigil3d(scene, from, { flash: "shield", scale, durationMs: 980, color: 0x93c5fd })
    );
    handles.push(
      api.emitBodyAura3d(scene, from, {
        flash: "shield",
        scale,
        durationMs: 900,
        color: 0xdbeafe,
        pack: "elden_ring",
      })
    );
    handles.push(api.emitShockwave3d(scene, from, { flash: "shield", scale, radius: 2.25, durationMs: 980 }));
    handles.push(api.emitFlashDisc3d(scene, from, "shield", scale));
    handles.push(api.emitBurst3d(scene, from, "gold_soft", scale));
    handles.push(...api.emitPremiumLayersAt(scene, from, premium.cast, { scale, durationMs: 820, color: 0xdbeafe }));
    return;
  }

  if (style === "bless") {
    handles.push(
      api.emitGroundSigil3d(scene, from, {
        flash: flash || "gold_soft",
        scale,
        durationMs: 560,
        color: 0xfde68a,
      })
    );
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash: flash || "gold_soft",
        scale,
        radius: 1.5,
        durationMs: 480,
      })
    );
    handles.push(api.emitFlashDisc3d(scene, from, flash || "gold_soft", scale));
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast.slice(0, 1), {
        scale,
        durationMs: 420,
        color: 0xfef08a,
        y0: 0.06,
      })
    );
    handles.push(...api.emitHostileProjectile3d(scene, from, to, "bless", flash || "gold_soft", scale, pattern));
    return;
  }

  const hon: HonPackId | null = honPackForStyle(style, flash, skillId);
  if (hon) {
    if (phase === "impact") return;
    handles.push(
      api.emitHonSpiritSequence3d(scene, from, to, {
        scale,
        pack: hon,
        skillId,
        pattern,
        targets: params.targets?.length ? params.targets : [to],
      })
    );
    return;
  }

  // —— Tint theo style (beam flash tint; ice/pierce không chung purple) ——
  const castTint =
    style === "beam"
      ? beamFlashTint(flash)
      : style === "ice"
        ? 0xbae6fd
        : style === "pierce"
          ? 0xfde68a
          : style === "shadow"
            ? 0x7c3aed
            : style === "nova"
              ? 0xff7a2e
              : palHex;

  const castDuration =
    (style === "nova" || style === "beam" || style === "bagua" || style === "thunder" || style === "ice"
      ? 620
      : 480) * pv.durationMul;

  handles.push(
    api.emitGroundSigil3d(scene, from, {
      flash,
      scale,
      durationMs: castDuration,
      color: castTint,
    })
  );

  const baseShock =
    style === "nova" ? 1.7 : style === "pierce" ? 1.05 : style === "slash" ? 1.25 : style === "beam" ? 1.35 : 1.4;
  handles.push(
    api.emitShockwave3d(scene, from, {
      flash,
      scale,
      radius: baseShock * sm * pv.shockMul * pv.groundMul,
      durationMs: style === "slash" || style === "pierce" ? 300 : 420,
    })
  );

  if (style !== "pierce") handles.push(api.emitDust3d(scene, from, scale));
  handles.push(api.emitFlashDisc3d(scene, from, flash, scale));

  // Bagua (non-hon fallback): sigil vòng đậm — không blob beam
  if (style === "bagua") {
    handles.push(
      api.emitGroundSigil3d(scene, from, {
        flash: "jade_gold",
        scale,
        durationMs: 780,
        color: 0xfbbf24,
      })
    );
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast, {
        scale,
        durationMs: 520,
        color: 0xfde68a,
        y0: 0.04,
      })
    );
  } else if (style === "ice") {
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast, {
        scale,
        durationMs: 480,
        color: 0xbae6fd,
        y0: 0.06,
      })
    );
    handles.push(api.emitResidual3d(scene, from, { flash: "ice_blue", scale, delayMs: 40, color: 0xe0f2fe }));
  } else if (style === "thunder") {
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast, {
        scale,
        durationMs: 440,
        color: 0xfde047,
        y0: 0.08,
      })
    );
  } else {
    handles.push(
      ...api.emitPremiumLayersAt(scene, from, premium.cast.slice(0, style === "beam" ? 2 : 1), {
        scale,
        durationMs:
          (style === "nova" ? 480 : style === "beam" ? 440 : 360) * pv.durationMul,
        y0: 0.08,
        color: castTint,
      })
    );
  }

  if (style === "roar" || style === "whirl" || style === "nova" || style === "beam" || style === "thunder") {
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash,
        scale,
        radius:
          (style === "nova" ? 2.7 : style === "roar" ? 2.65 : style === "thunder" ? 2.2 : style === "beam" ? 2.1 : 2.25) *
          sm *
          (pv.kind === "aoe" ? 1.2 : 1),
        durationMs: 600,
      })
    );
  }

  // Slash: vệt chém + pattern
  if (style === "slash") {
    const dens = Math.round(22 * pv.densityMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 420 * pv.durationMul,
        density: dens,
        arc: pv.kind === "row" ? 0.18 : pv.kind === "column" ? 0.42 : 0.28,
        scale,
        streak: true,
      })
    );
    emitPatternExtraTrails(api, params, handles, {
      density: dens,
      arc: 0.28,
      durationMs: 400,
      flash,
    });
    handles.push(api.emitSparksBurst3d(scene, from, { flash, scale }));
  }

  // Pierce: đâm thẳng mỏng — không rush
  if (style === "pierce") {
    const dens = Math.round(10 * pv.densityMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 280 * pv.durationMul,
        density: dens,
        arc: pv.kind === "column" ? 0.1 : 0.05,
        scale,
        streak: true,
      })
    );
    emitPatternExtraTrails(api, params, handles, {
      density: dens,
      arc: 0.06,
      durationMs: 280,
      flash,
    });
  }

  // Beam / arcane: path + pattern layers
  if (style === "beam") {
    const dens = Math.round(16 * pv.densityMul * pv.trailMul);
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 480 * pv.durationMul,
        density: dens,
        arc: pv.kind === "row" ? 0.16 : pv.kind === "column" ? 0.4 : pv.kind === "aoe" ? 0.28 : 0.32,
        scale,
        streak: true,
      })
    );
    emitPatternExtraTrails(api, params, handles, {
      density: dens,
      arc: 0.3,
      durationMs: 460,
      flash,
    });
    if (pv.kind === "aoe") {
      handles.push(
        api.emitGroundMark3d(scene, from, {
          flash,
          scale,
          durationMs: 720,
          color: beamFlashTint(flash),
        })
      );
    }
  }

  if (style === "shadow") {
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 460,
        density: 12,
        arc: 0.38,
        scale,
        streak: true,
      })
    );
  }

  if (style === "rush" || style === "charge") {
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: style === "charge" ? 640 : 480,
        density: style === "charge" ? 20 : 18,
        arc: style === "charge" ? 0.22 : 0.35,
        scale,
        streak: true,
      })
    );
  }

  handles.push(...api.emitHostileProjectile3d(scene, from, to, style, flash, scale, pattern));

  if (style === "charge") {
    handles.push(api.emitDust3d(scene, from.clone().lerp(to, 0.45), scale));
    handles.push(api.emitDust3d(scene, from.clone().lerp(to, 0.72), scale));
  }
}

/** Impact theo style — bỏ qua khi đã đi pack hồn. */
export function runStyleImpact(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, to, flash, style, scale, skillId, pattern } = params;
  if (honPackForStyle(style, flash, skillId)) return;
  const premium = api.skillPremiumLayers(style, flash);
  const pv = patternVariant(pattern);
  const sm = softScale(scale);
  const hitTint = style === "beam" ? beamFlashTint(flash) : api.flashPalette(flash).cool.getHex();

  handles.push(api.emitBurst3d(scene, to, flash, scale));
  handles.push(api.emitFlashDisc3d(scene, to, flash, scale));
  handles.push(
    ...api.emitPremiumLayersAt(scene, to, premium.hit, {
      scale,
      durationMs: 580 * pv.durationMul,
      y0: 0.28,
      color: style === "beam" ? hitTint : undefined,
    })
  );
  if (
    style === "slash" ||
    style === "rush" ||
    style === "charge" ||
    style === "beam" ||
    style === "pierce" ||
    style === "thunder"
  ) {
    handles.push(api.emitSparksBurst3d(scene, to, { flash, scale }));
  }
  const fHit = (flash || "").toLowerCase();
  if (style === "thunder" || fHit === "thunder" || fHit === "storm" || fHit === "electric_blue") {
    handles.push(
      api.emitItchFolderPackAt(scene, to, "stylized", "lightning", 1, {
        durationMs: 440,
        w: 3.1,
        h: 1.8,
        y: 0.65,
        delayMs: 30,
        opacity: 0.98,
        scale,
        color: 0xf5f3ff,
      })
    );
  }
  if (style === "ice") {
    handles.push(
      api.emitItchFolderPackAt(scene, to, "brackeys", "water_wave", 1, {
        durationMs: 520,
        w: 3.0 * sm * pv.markMul,
        h: 3.0 * sm * pv.markMul,
        y: 0.4,
        delayMs: 20,
        opacity: 0.92,
        scale,
        color: 0xbae6fd,
      })
    );
  }
  if (style === "bagua") {
    handles.push(
      api.emitGroundSigil3d(scene, to, {
        flash: "jade_gold",
        scale,
        durationMs: 700,
        color: 0xfbbf24,
      })
    );
  }

  handles.push(
    api.emitGroundMark3d(scene, to, {
      flash,
      scale,
      durationMs: (style === "nova" || pv.kind === "aoe" ? 900 : 700) * pv.durationMul,
      color: hitTint,
    })
  );
  // AoE / row: ground mark rộng hơn (layer thứ 2)
  if (pv.kind === "aoe" || (pv.kind === "row" && (style === "beam" || style === "slash"))) {
    handles.push(
      api.emitGroundMark3d(scene, to, {
        flash,
        scale,
        durationMs: 820,
        color: hitTint,
      })
    );
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius: 2.8 * sm * pv.shockMul,
        durationMs: 640,
      })
    );
  }

  handles.push(api.emitDust3d(scene, to, scale));
  handles.push(api.emitResidual3d(scene, to, { flash, scale, delayMs: 90, color: hitTint }));

  if (style === "roar" || style === "nova" || style === "whirl" || style === "slash" || style === "thunder") {
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius:
          (style === "nova" ? 3.15 : style === "slash" ? 2.15 : style === "thunder" ? 2.35 : 2.45) *
          sm *
          pv.shockMul,
        durationMs: 660,
      })
    );
  } else if (style === "rush" || style === "charge") {
    handles.push(api.emitShockwave3d(scene, to, { flash, scale, radius: 2.0 * sm, durationMs: 500 }));
  } else if (style === "pierce") {
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius: (pv.kind === "column" ? 1.15 : 1.35) * sm,
        durationMs: 360,
      })
    );
  } else if (style === "barrier" || style === "bless") {
    handles.push(api.emitFlashDisc3d(scene, to, flash || "gold_soft", scale));
    if (style === "bless") {
      handles.push(
        api.emitResidual3d(scene, to, {
          flash: flash || "gold_soft",
          scale,
          delayMs: 40,
          color: 0xfde68a,
        })
      );
    }
  } else if (
    style === "tide" ||
    style === "ice" ||
    style === "poison" ||
    style === "shadow" ||
    style === "beam" ||
    style === "bagua"
  ) {
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius: (style === "bagua" ? 2.2 : style === "ice" ? 2.0 : style === "beam" ? 1.85 : 1.9) * sm * pv.shockMul,
        durationMs: 520,
      })
    );
  } else {
    handles.push(api.emitShockwave3d(scene, to, { flash, scale, radius: 1.7 * sm, durationMs: 480 }));
  }
}
