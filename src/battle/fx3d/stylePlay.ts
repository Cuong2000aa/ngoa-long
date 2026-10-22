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
    scale?: string | null
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

/** Emission theo style — barrier / bless / hồn / hostile mặc định. */
export function runStyleEmission(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, from, to, flash, style, scale, phase, skillId, pattern } = params;
  const premium = api.skillPremiumLayers(style, flash);
  const palHex = api.flashPalette(flash).base.getHex();

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
    handles.push(...api.emitHostileProjectile3d(scene, from, to, "bless", flash || "gold_soft", scale));
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

  handles.push(
    api.emitGroundSigil3d(scene, from, {
      flash,
      scale,
      durationMs:
        style === "nova" || style === "beam" || style === "bagua" || style === "thunder" || style === "ice"
          ? 620
          : 480,
      color: palHex,
    })
  );
  handles.push(
    api.emitShockwave3d(scene, from, {
      flash,
      scale,
      radius: style === "nova" ? 1.7 : style === "pierce" ? 1.15 : 1.4,
      durationMs: style === "slash" || style === "pierce" ? 320 : 420,
    })
  );
  if (style !== "pierce") handles.push(api.emitDust3d(scene, from, scale));
  handles.push(api.emitFlashDisc3d(scene, from, flash, scale));
  handles.push(
    ...api.emitPremiumLayersAt(scene, from, premium.cast.slice(0, 1), {
      scale,
      durationMs:
        style === "nova" ? 480 : style === "beam" || style === "bagua" || style === "thunder" ? 420 : 360,
      y0: 0.08,
    })
  );
  if (style === "roar" || style === "whirl" || style === "nova" || style === "beam" || style === "thunder") {
    handles.push(
      api.emitShockwave3d(scene, from, {
        flash,
        scale,
        radius:
          style === "nova" ? 2.7 : style === "roar" ? 2.65 : style === "thunder" ? 2.2 : style === "beam" ? 2.1 : 2.25,
        durationMs: 600,
      })
    );
  }
  if (style === "slash") {
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 420,
        density: 22,
        arc: 0.28,
        scale,
        streak: true,
      })
    );
    handles.push(api.emitSparksBurst3d(scene, from, { flash, scale }));
  }
  // Pierce: vệt mỏng thẳng (tiễn/thương) — không trail dày kiểu rush/charge
  if (style === "pierce") {
    handles.push(
      api.emitTrail3d(scene, from, to, {
        flash,
        durationMs: 300,
        density: 10,
        arc: 0.06,
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
  handles.push(...api.emitHostileProjectile3d(scene, from, to, style, flash, scale));
  if (style === "charge") {
    handles.push(api.emitDust3d(scene, from.clone().lerp(to, 0.45), scale));
    handles.push(api.emitDust3d(scene, from.clone().lerp(to, 0.72), scale));
  }
}

/** Impact theo style — bỏ qua khi đã đi pack hồn. */
export function runStyleImpact(api: StylePlayApi, params: StylePlayParams, handles: Fx3dHandle[]): void {
  const { scene, to, flash, style, scale, skillId } = params;
  if (honPackForStyle(style, flash, skillId)) return;
  const premium = api.skillPremiumLayers(style, flash);

  handles.push(api.emitBurst3d(scene, to, flash, scale));
  handles.push(api.emitFlashDisc3d(scene, to, flash, scale));
  handles.push(
    ...api.emitPremiumLayersAt(scene, to, premium.hit, {
      scale,
      durationMs: 580,
      y0: 0.28,
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
  handles.push(
    api.emitGroundMark3d(scene, to, {
      flash,
      scale,
      durationMs: style === "nova" ? 900 : 700,
      color: api.flashPalette(flash).cool.getHex(),
    })
  );
  handles.push(api.emitDust3d(scene, to, scale));
  handles.push(api.emitResidual3d(scene, to, { flash, scale, delayMs: 90 }));

  if (style === "roar" || style === "nova" || style === "whirl" || style === "slash" || style === "thunder") {
    handles.push(
      api.emitShockwave3d(scene, to, {
        flash,
        scale,
        radius: style === "nova" ? 3.15 : style === "slash" ? 2.15 : style === "thunder" ? 2.35 : 2.45,
        durationMs: 660,
      })
    );
  } else if (style === "rush" || style === "charge") {
    handles.push(api.emitShockwave3d(scene, to, { flash, scale, radius: 2.0, durationMs: 500 }));
  } else if (style === "pierce") {
    handles.push(api.emitShockwave3d(scene, to, { flash, scale, radius: 1.35, durationMs: 380 }));
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
        radius: style === "bagua" ? 2.2 : style === "ice" ? 2.0 : 1.9,
        durationMs: 520,
      })
    );
  } else {
    handles.push(api.emitShockwave3d(scene, to, { flash, scale, radius: 1.7, durationMs: 480 }));
  }
}
