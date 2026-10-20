import * as THREE from "three";
import {
  fxScaleMul,
  spawnFlyingFx,
  spawnFxSheet,
  spawnPremiumImpact,
} from "./battleVfx";

/**
 * Reusable combat FX primitives — Ngọa Long style (sprite CC0 only).
 *
 * Techniques adapted from reference sandboxes (NOT imported wholesale):
 * - threejs-vfx / LinearAbilityCasting: phased windup→emit→impact; denser trail
 *   near caster opening toward target; ground mark under impact.
 * - NewKrok projectile demo: init / along-path / destroy stages (rate-over-distance trail).
 * - Pixel Ability FX Forge: Impact family = silhouette + impact light + debris; easeOut timing.
 *
 * All sheets live under assets/fx/ (Kenney Transparent, Cethiel slash/earth, …).
 */

export type SkillFxTiming = {
  windupMs?: number;
  attackMs?: number;
  impactMs?: number;
  recoveryMs?: number;
};

export type SkillFxParams = {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  /** Flash key — tint / sheet pick */
  flash?: string;
  scale?: string | null;
  /** 0.6…1.4 — density / size */
  intensity?: number;
  color?: number;
  /** Attach trail to caster root (moves with lunge) */
  parent?: THREE.Object3D;
  now?: number;
  timing?: SkillFxTiming;
  /** Mục tiêu đầu AoE — spawn gầm tại caster một lần */
  aoePrimary?: boolean;
};

export type SkillFxHandle = {
  cancel: () => void;
};

const SLASH_CLASSIC = [
  "assets/fx/slash/classic_classic_1_classic_01.png",
  "assets/fx/slash/classic_classic_1_classic_02.png",
  "assets/fx/slash/classic_classic_1_classic_03.png",
  "assets/fx/slash/classic_classic_1_classic_04.png",
  "assets/fx/slash/classic_classic_1_classic_05.png",
  "assets/fx/slash/classic_classic_1_classic_06.png",
];

const SLASH_KENNEY = [
  "assets/fx/particles/slash_01.png",
  "assets/fx/particles/slash_02.png",
  "assets/fx/particles/slash_03.png",
  "assets/fx/particles/slash_04.png",
];

const HIT = [
  "assets/fx/particles/flare_01.png",
  "assets/fx/particles/star_01.png",
  "assets/fx/particles/spark_02.png",
];

const MUZZLE = [
  "assets/fx/particles/muzzle_01.png",
  "assets/fx/particles/muzzle_03.png",
  "assets/fx/particles/muzzle_05.png",
];

const DIRT = [
  "assets/fx/particles/dirt_01.png",
  "assets/fx/particles/dirt_02.png",
  "assets/fx/particles/dirt_03.png",
];

const EARTH = [
  "assets/fx/itch/brackeys/earth_burst/frame_01.png",
  "assets/fx/itch/brackeys/earth_burst/frame_04.png",
  "assets/fx/itch/brackeys/earth_burst/frame_08.png",
  "assets/fx/itch/brackeys/earth_burst/frame_12.png",
  "assets/fx/itch/brackeys/earth_burst/frame_16.png",
];

const CIRCLE = [
  "assets/fx/particles/circle_01.png",
  "assets/fx/particles/circle_02.png",
  "assets/fx/particles/circle_03.png",
  "assets/fx/particles/circle_04.png",
];

const LIGHT = [
  "assets/fx/particles/light_01.png",
  "assets/fx/particles/light_02.png",
  "assets/fx/particles/light_03.png",
];

/** Nineball Fire Dragon Roller — CC0 — đủ 11 frame để đọc hình đầu long */
const DRAGON = [
  "assets/fx/slash/fire_alternative_3_1_alternative_3_01.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_02.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_03.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_04.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_05.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_06.png",
];

/** Frames giữa chu kỳ — đầu long rõ nhất */
const DRAGON_HEAD = [
  "assets/fx/slash/fire_alternative_3_1_alternative_3_02.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_03.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_04.png",
];

const FLAME = [
  "assets/fx/particles/flame_01.png",
  "assets/fx/particles/flame_03.png",
  "assets/fx/particles/flame_05.png",
  "assets/fx/particles/fire_01.png",
];

const FIRE_WRATH = [
  "assets/fx/itch/brackeys/ember_burst/frame_01.png",
  "assets/fx/itch/brackeys/ember_burst/frame_05.png",
  "assets/fx/itch/brackeys/ember_burst/frame_09.png",
  "assets/fx/itch/brackeys/ember_burst/frame_13.png",
];

const SMOKE = [
  "assets/fx/particles/smoke_02.png",
  "assets/fx/particles/smoke_04.png",
  "assets/fx/particles/smoke_06.png",
];

function easeOutCubic(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - u, 3);
}

function steelTint(flash?: string, override?: number): number {
  if (override != null) return override;
  const f = (flash || "steel").toLowerCase();
  if (f === "crimson" || f === "red" || f === "gold_red") return 0xfca5a5;
  if (f === "blue" || f === "cyan") return 0x7dd3fc;
  if (f === "gold" || f === "gold_soft" || f === "yellow") return 0xfde68a;
  // Thép / son nhạt — Tam Quốc, không neon
  return 0xe8eef5;
}

function trackTimers(): { ids: number[]; add: (id: number) => void; cancel: () => void } {
  const ids: number[] = [];
  return {
    ids,
    add(id: number) {
      ids.push(id);
    },
    cancel() {
      ids.forEach((id) => clearTimeout(id));
      ids.length = 0;
    },
  };
}

/**
 * Weapon trail — staggered slash sprites along caster→target arc
 * (ribbon / rate-over-distance idea without GLSL ribbons).
 */
export function spawnWeaponTrail(params: SkillFxParams): SkillFxHandle {
  const { scene, from, to } = params;
  const mul = fxScaleMul(params.scale) * (params.intensity ?? 1);
  const tint = steelTint(params.flash, params.color);
  const steps = Math.max(3, Math.min(6, Math.round(4 * (params.intensity ?? 1))));
  const timers = trackTimers();
  const parent = params.parent;

  for (let i = 0; i < steps; i++) {
    const u = (i + 0.15) / steps;
    const e = easeOutCubic(u);
    const p = from.clone().lerp(to, e);
    // Mild vertical arc — readable slash, not floor scrape
    p.y = Math.max(from.y, to.y) * (1 - e) + Math.max(to.y, 0.55) * e + Math.sin(e * Math.PI) * 0.22;
    const delay = Math.round(i * 26);
    const size = (0.95 + e * 0.55 - i * 0.04) * mul;
    const sheet = i % 2 === 0 ? SLASH_CLASSIC : SLASH_KENNEY;
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        void spawnFxSheet(scene, p, sheet, {
          size: Math.min(1.75, size),
          life: 300 + i * 18,
          y: 0,
          yMode: "abs",
          color: i === steps - 1 ? 0xfff7ed : tint,
          parent: i < 2 ? parent : undefined,
        });
      }, delay)
    );
  }

  return { cancel: () => timers.cancel() };
}

/** Sparks along the strike line (projectile “movement” stage). */
export function spawnPathSparks(params: SkillFxParams): SkillFxHandle {
  const { scene, from, to } = params;
  const mul = fxScaleMul(params.scale) * (params.intensity ?? 1);
  const tint = steelTint(params.flash, params.color);
  const timers = trackTimers();
  const n = Math.max(2, Math.min(4, Math.round(3 * (params.intensity ?? 1))));

  for (let i = 0; i < n; i++) {
    const t = (i + 0.4) / (n + 0.5);
    const p = from.clone().lerp(to, t);
    p.y = 0.7 + Math.sin(t * Math.PI) * 0.15;
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        void spawnFxSheet(scene, p, i % 2 ? MUZZLE : HIT, {
          size: (0.45 + t * 0.25) * mul,
          life: 220,
          y: 0,
          yMode: "abs",
          color: tint,
        });
      }, Math.round(i * 32 + 20))
    );
  }

  return { cancel: () => timers.cancel() };
}

/** Ground sigil / readable AoE mark — expanding circle at feet (far-cast circle idea). */
export function spawnGroundSigil(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { scale?: string | null; intensity?: number; color?: number; life?: number } = {}
): SkillFxHandle {
  const mul = fxScaleMul(opts.scale) * (opts.intensity ?? 1);
  const tint = opts.color ?? 0xc4d0dc;
  const life = opts.life ?? 520;
  const foot = at.clone();
  foot.y = 0.08;
  void spawnFxSheet(scene, foot, CIRCLE, {
    size: 1.15 * mul,
    life,
    y: 0,
    yMode: "abs",
    color: tint,
  });
  const timers = trackTimers();
  timers.add(
    window.setTimeout(() => {
      if (!scene) return;
      void spawnFxSheet(scene, foot, CIRCLE, {
        size: 1.55 * mul,
        life: Math.round(life * 0.75),
        y: 0,
        yMode: "abs",
        color: 0xe2e8f0,
      });
    }, 70)
  );
  return { cancel: () => timers.cancel() };
}

/** Hit flash + spark debris (Impact family secondary debris). */
export function spawnSparkDebris(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { scale?: string | null; intensity?: number; color?: number } = {}
): void {
  const mul = fxScaleMul(opts.scale) * (opts.intensity ?? 1);
  const tint = opts.color ?? 0xffe8c8;
  void spawnFxSheet(scene, at, HIT, {
    size: 1.05 * mul,
    life: 340,
    y: 0.05,
    yMode: "abs",
    color: tint,
  });
  void spawnFxSheet(scene, at, MUZZLE, {
    size: 0.85 * mul,
    life: 280,
    y: 0.12,
    yMode: "abs",
    color: 0xfffbeb,
  });
  void spawnFxSheet(scene, at, LIGHT, {
    size: 0.7 * mul,
    life: 240,
    y: 0.08,
    yMode: "abs",
    color: tint,
  });
}

/** Dust / earth kick at feet. */
export function spawnDustKick(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { scale?: string | null; intensity?: number } = {}
): void {
  const mul = fxScaleMul(opts.scale) * (opts.intensity ?? 1);
  const foot = at.clone();
  foot.y = 0.1;
  void spawnFxSheet(scene, foot, DIRT, {
    size: 0.95 * mul,
    life: 400,
    y: 0,
    yMode: "abs",
    color: 0xc4a882,
  });
  void spawnFxSheet(scene, foot, EARTH, {
    size: 1.15 * mul,
    life: 420,
    y: 0.05,
    yMode: "abs",
    color: 0xb8956a,
  });
}

/**
 * Polished steel slash skill — used by basic_strike (Mãnh Kích).
 * Phases: attack trail → path sparks → impact (premium + sigil + debris).
 * Distinct from AA (single white slash, no trail/sigil/windup).
 */
export function playSteelSlashSkill(params: SkillFxParams & { phase?: "emission" | "impact" | "full" }): SkillFxHandle {
  const phase = params.phase || "full";
  const timers = trackTimers();
  const children: SkillFxHandle[] = [];
  const intensity = params.intensity ?? 1.05;
  const flash = params.flash || "steel";
  const tint = steelTint(flash, params.color);

  const runEmission = () => {
    children.push(
      spawnWeaponTrail({ ...params, intensity, flash, color: tint }),
      spawnPathSparks({ ...params, intensity: intensity * 0.9, flash, color: tint })
    );
    // Caster foot dust at commit
    spawnDustKick(params.scene, params.from, { scale: params.scale, intensity: 0.75 });
  };

  const runImpact = () => {
    spawnPremiumImpact(params.scene, params.to, flash, params.scale);
    spawnSparkDebris(params.scene, params.to, {
      scale: params.scale,
      intensity,
      color: tint,
    });
    children.push(
      spawnGroundSigil(params.scene, params.to, {
        scale: params.scale,
        intensity: intensity * 0.9,
        color: 0xb8c4d0,
        life: 560,
      })
    );
    spawnDustKick(params.scene, params.to, { scale: params.scale, intensity });
  };

  if (phase === "emission") {
    runEmission();
  } else if (phase === "impact") {
    runImpact();
  } else {
    runEmission();
    const impactDelay = params.timing?.impactMs ?? 130;
    timers.add(
      window.setTimeout(() => {
        if (!params.scene) return;
        runImpact();
      }, impactDelay)
    );
  }

  return {
    cancel() {
      timers.cancel();
      children.forEach((h) => h.cancel());
    },
  };
}

/**
 * Skills that use the polished steel-slash library.
 * Include quality-ladder ids (basic_strike_chien…); pattern variants still
 * take spawnPatternEmission first in BattleRenderer when pattern ≠ single.
 */
export const POLISHED_STEEL_SLASH_SKILLS = new Set([
  "basic_strike",
  "basic_strike_chien",
  "basic_strike_than",
  "basic_strike_legend",
  "basic_strike_king",
]);

export function usesPolishedSteelSlash(skillId?: string | null, motif?: string | null, flash?: string | null): boolean {
  if (skillId && POLISHED_STEEL_SLASH_SKILLS.has(skillId)) return true;
  // Gallery / QA without skillId: require skillId — do not auto-polish all slash skills.
  void motif;
  void flash;
  return false;
}

function dragonTint(flash?: string, override?: number): number {
  if (override != null) return override;
  const f = (flash || "dragon").toLowerCase();
  if (f === "crimson" || f === "gold_red") return 0xf87171;
  if (f === "blue" || f === "cyan") return 0x7dd3fc;
  // Hỏa long — cam vàng cổ, không neon hồng
  return 0xffb347;
}

/**
 * Hỏa Long — một đầu rồng BAY (animate 11 frame) + thân lửa nối đuôi.
 * Trước: spawn nhiều blob đứng yên → chỉ thấy chấm lửa, không đọc được hình rồng.
 */
export function playDragonBreathSkill(
  params: SkillFxParams & { phase?: "emission" | "impact" | "full" }
): SkillFxHandle {
  const phase = params.phase || "full";
  const timers = trackTimers();
  const children: SkillFxHandle[] = [];
  const intensity = params.intensity ?? 1.15;
  const flash = params.flash || "dragon";
  const tint = dragonTint(flash, params.color);
  const mul = fxScaleMul(params.scale) * intensity;
  const { scene, from, to } = params;
  const flightMs = params.timing?.attackMs ?? 560;

  const runEmission = () => {
    const now = params.now ?? performance.now();

    // Muzzle lửa miệng long tại caster
    void spawnFxSheet(scene, from, FLAME, {
      size: 1.15 * mul,
      life: 340,
      y: 0,
      yMode: "abs",
      color: tint,
      parent: params.parent,
    });
    void spawnFxSheet(scene, from, FIRE_WRATH, {
      size: 0.95 * mul,
      life: 300,
      y: 0.05,
      yMode: "abs",
      color: 0xff8844,
      parent: params.parent,
    });

    // ĐẦU RỒNG — một sprite bay + animate đủ frame (đọc được shape)
    spawnFlyingFx(scene, from, to, DRAGON, {
      size: 2.85 * mul,
      life: flightMs,
      color: tint,
      arc: 0.62,
      side: 0.22,
      frameMs: 45,
      now,
    });

    // THÂN — các khúc lửa/khói bay cùng đường, lệch pha → chuỗi rắn
    const bodyCount = 4;
    for (let i = 0; i < bodyCount; i++) {
      const delay = 55 + i * 70;
      const bodySize = (1.55 - i * 0.18) * mul;
      const side = (i % 2 === 0 ? 1 : -1) * (0.28 + i * 0.06);
      timers.add(
        window.setTimeout(() => {
          if (!scene) return;
          const tnow = performance.now();
          spawnFlyingFx(scene, from, to, i === 0 ? DRAGON_HEAD : i % 2 ? FLAME : FIRE_WRATH, {
            size: Math.max(0.85, bodySize),
            life: flightMs - delay * 0.35,
            color: i === 0 ? tint : 0xff8844,
            arc: 0.48 - i * 0.04,
            side,
            frameMs: i === 0 ? 50 : 60,
            now: tnow,
          });
          // Khói đuôi
          if (i >= 1) {
            spawnFlyingFx(scene, from, to, SMOKE, {
              size: (0.9 - i * 0.08) * mul,
              life: flightMs - delay * 0.2,
              color: 0x94a3b8,
              arc: 0.35,
              side: -side * 0.6,
              frameMs: 80,
              now: tnow,
            });
          }
        }, delay)
      );
    }
  };

  const runImpact = () => {
    spawnPremiumImpact(scene, to, flash, params.scale);
    // Đầu long cắn đích — frame đầu rõ + lửa lớn
    void spawnFxSheet(scene, to, DRAGON_HEAD, {
      size: 2.6 * mul,
      life: 580,
      y: 0.12,
      yMode: "abs",
      color: tint,
    });
    void spawnFxSheet(scene, to, FIRE_WRATH, {
      size: 2.1 * mul,
      life: 520,
      y: 0.06,
      yMode: "abs",
      color: 0xff8844,
    });
    void spawnFxSheet(scene, to, FLAME, {
      size: 1.7 * mul,
      life: 440,
      y: 0.15,
      yMode: "abs",
      color: 0xffe0a0,
    });
    spawnSparkDebris(scene, to, {
      scale: params.scale,
      intensity: intensity * 1.15,
      color: tint,
    });
    children.push(
      spawnGroundSigil(scene, to, {
        scale: params.scale,
        intensity: intensity * 1.05,
        color: 0xea580c,
        life: 700,
      })
    );
    spawnDustKick(scene, to, { scale: params.scale, intensity: intensity * 1.1 });
  };

  if (phase === "emission") {
    runEmission();
  } else if (phase === "impact") {
    runImpact();
  } else {
    runEmission();
    const impactDelay = params.timing?.impactMs ?? flightMs - 40;
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        runImpact();
      }, impactDelay)
    );
  }

  return {
    cancel() {
      timers.cancel();
      children.forEach((h) => h.cancel());
    },
  };
}

/** Polished dragon family — start with Hỏa Long (single); expand carefully. */
export const POLISHED_DRAGON_SKILLS = new Set(["hoa_long"]);

export function usesPolishedDragon(skillId?: string | null, motif?: string | null, flash?: string | null): boolean {
  if (skillId && POLISHED_DRAGON_SKILLS.has(skillId)) return true;
  void motif;
  void flash;
  return false;
}

const TIGER_ROAR = [
  "assets/fx/slash/fire_alternative_3_1_alternative_3_01.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_03.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_05.png",
];

const TIGER_CLAW = [
  "assets/fx/slash/fire_alternative_3_1_alternative_3_02.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_04.png",
  "assets/fx/slash/fire_alternative_3_1_alternative_3_06.png",
];

const TIGER_SLAM = [
  "assets/fx/itch/brackeys/earth_burst/frame_01.png",
  "assets/fx/itch/brackeys/earth_burst/frame_08.png",
  "assets/fx/itch/brackeys/earth_burst/frame_16.png",
];

function tigerTint(flash?: string, override?: number): number {
  if (override != null) return override;
  const f = (flash || "tiger").toLowerCase();
  if (f === "crimson" || f === "gold_red") return 0xf87171;
  // Hổ — hổ phách / nâu vàng, không neon xanh sprite gốc
  return 0xfbbf24;
}

/**
 * Hổ Khiếu — gầm shockwave tại caster + sóng gầm/cào lan từng địch.
 * Roar sheet (SpritePilot) + claw + slam đất.
 */
export function playTigerRoarSkill(
  params: SkillFxParams & { phase?: "emission" | "impact" | "full" }
): SkillFxHandle {
  const phase = params.phase || "full";
  const timers = trackTimers();
  const children: SkillFxHandle[] = [];
  const intensity = params.intensity ?? 1.15;
  const flash = params.flash || "tiger";
  const tint = tigerTint(flash, params.color);
  const mul = fxScaleMul(params.scale) * intensity;
  const { scene, from, to } = params;
  const waveMs = params.timing?.attackMs ?? 420;

  const runEmission = () => {
    const now = params.now ?? performance.now();

    // Gầm tại caster — chỉ mục tiêu đầu (tránh N lần chồng AoE)
    if (params.aoePrimary) {
      void spawnFxSheet(scene, from, TIGER_ROAR, {
        size: 3.1 * mul,
        life: 620,
        y: 0.15,
        yMode: "abs",
        color: tint,
        parent: params.parent,
      });
      // Vòng đất nổ dưới chân
      void spawnFxSheet(scene, from, TIGER_SLAM, {
        size: 2.2 * mul,
        life: 520,
        y: -0.35,
        yMode: "abs",
        color: 0xd97706,
      });
      children.push(
        spawnGroundSigil(scene, from, {
          scale: params.scale,
          intensity: intensity * 1.1,
          color: 0xf59e0b,
          life: 700,
        })
      );
      spawnDustKick(scene, from, { scale: params.scale, intensity: intensity * 1.15 });
      // Vòng lan thứ 2
      timers.add(
        window.setTimeout(() => {
          if (!scene) return;
          void spawnFxSheet(scene, from, TIGER_ROAR, {
            size: 3.6 * mul,
            life: 480,
            y: 0.2,
            yMode: "abs",
            color: 0xfde68a,
          });
        }, 90)
      );
    }

    // Sóng gầm bay tới địch + vệt cào
    spawnFlyingFx(scene, from, to, TIGER_ROAR, {
      size: 1.85 * mul,
      life: waveMs,
      color: tint,
      arc: 0.28,
      side: 0.12,
      frameMs: 48,
      now,
    });
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        spawnFlyingFx(scene, from, to, TIGER_CLAW, {
          size: 1.45 * mul,
          life: waveMs - 40,
          color: 0xfef3c7,
          arc: 0.2,
          side: -0.18,
          frameMs: 42,
          now: performance.now(),
        });
      }, 70)
    );
  };

  const runImpact = () => {
    spawnPremiumImpact(scene, to, flash, params.scale);
    void spawnFxSheet(scene, to, TIGER_CLAW, {
      size: 2.15 * mul,
      life: 480,
      y: 0.1,
      yMode: "abs",
      color: 0xfef3c7,
    });
    void spawnFxSheet(scene, to, TIGER_ROAR, {
      size: 1.75 * mul,
      life: 420,
      y: 0.08,
      yMode: "abs",
      color: tint,
    });
    void spawnFxSheet(scene, to, TIGER_SLAM, {
      size: 1.65 * mul,
      life: 460,
      y: -0.25,
      yMode: "abs",
      color: 0xd97706,
    });
    spawnSparkDebris(scene, to, {
      scale: params.scale,
      intensity,
      color: tint,
    });
    children.push(
      spawnGroundSigil(scene, to, {
        scale: params.scale,
        intensity: 0.95,
        color: 0xf59e0b,
        life: 560,
      })
    );
    spawnDustKick(scene, to, { scale: params.scale, intensity });
  };

  if (phase === "emission") {
    runEmission();
  } else if (phase === "impact") {
    runImpact();
  } else {
    runEmission();
    const impactDelay = params.timing?.impactMs ?? waveMs - 30;
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        runImpact();
      }, impactDelay)
    );
  }

  return {
    cancel() {
      timers.cancel();
      children.forEach((h) => h.cancel());
    },
  };
}

/** Hổ Khiếu (AoE gầm) — mở rộng family cẩn thận */
export const POLISHED_TIGER_SKILLS = new Set(["ho_khieu"]);

export function usesPolishedTiger(skillId?: string | null, motif?: string | null, flash?: string | null): boolean {
  if (skillId && POLISHED_TIGER_SKILLS.has(skillId)) return true;
  void motif;
  void flash;
  return false;
}

function rushTint(flash?: string, override?: number): number {
  if (override != null) return override;
  const f = (flash || "rush").toLowerCase();
  if (f === "crimson" || f === "gold_red") return 0xfca5a5;
  // Đột kích — bạc trắng / thép nóng, không neon
  return 0xe8eef5;
}

/**
 * Đột Kích — xông đâm: bụi chân → vệt chém bay → đâm trúng + đất.
 * Khác AA (1 slash trắng) và khác kỵ charge (vó ngựa).
 */
export function playRushAssaultSkill(
  params: SkillFxParams & { phase?: "emission" | "impact" | "full" }
): SkillFxHandle {
  const phase = params.phase || "full";
  const timers = trackTimers();
  const children: SkillFxHandle[] = [];
  const intensity = params.intensity ?? 1.12;
  const flash = params.flash || "rush";
  const tint = rushTint(flash, params.color);
  const mul = fxScaleMul(params.scale) * intensity;
  const { scene, from, to } = params;
  const dashMs = params.timing?.attackMs ?? 280;

  const runEmission = () => {
    const now = params.now ?? performance.now();
    // Bụi / giậm chân trước khi xông
    spawnDustKick(scene, from, { scale: params.scale, intensity: intensity * 0.9 });
    void spawnFxSheet(scene, from, MUZZLE, {
      size: 0.85 * mul,
      life: 240,
      y: 0.05,
      yMode: "abs",
      color: 0xffe8c8,
      parent: params.parent,
    });

    // Vệt đâm bay theo đường xông (slash classic animate)
    spawnFlyingFx(scene, from, to, SLASH_CLASSIC, {
      size: 2.15 * mul,
      life: dashMs,
      color: tint,
      arc: 0.18,
      side: 0.08,
      frameMs: 38,
      now,
    });
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        spawnFlyingFx(scene, from, to, SLASH_KENNEY, {
          size: 1.55 * mul,
          life: dashMs - 30,
          color: 0xfff7ed,
          arc: 0.12,
          side: -0.14,
          frameMs: 40,
          now: performance.now(),
        });
      }, 45)
    );
    // Tia sáng / muzzle dọc đường
    children.push(
      spawnPathSparks({
        ...params,
        intensity: intensity * 0.95,
        flash,
        color: tint,
      })
    );
    children.push(
      spawnWeaponTrail({
        ...params,
        intensity: intensity * 0.85,
        flash,
        color: tint,
      })
    );
  };

  const runImpact = () => {
    spawnPremiumImpact(scene, to, flash === "rush" ? "steel" : flash, params.scale);
    void spawnFxSheet(scene, to, SLASH_CLASSIC, {
      size: 2.0 * mul,
      life: 400,
      y: 0.08,
      yMode: "abs",
      color: tint,
    });
    void spawnFxSheet(scene, to, MUZZLE, {
      size: 1.35 * mul,
      life: 340,
      y: 0.1,
      yMode: "abs",
      color: 0xffe8c8,
    });
    void spawnFxSheet(scene, to, EARTH, {
      size: 1.55 * mul,
      life: 440,
      y: -0.2,
      yMode: "abs",
      color: 0xc9a070,
    });
    spawnSparkDebris(scene, to, {
      scale: params.scale,
      intensity,
      color: tint,
    });
    children.push(
      spawnGroundSigil(scene, to, {
        scale: params.scale,
        intensity: 0.9,
        color: 0xcbd5e1,
        life: 520,
      })
    );
    spawnDustKick(scene, to, { scale: params.scale, intensity });
  };

  if (phase === "emission") {
    runEmission();
  } else if (phase === "impact") {
    runImpact();
  } else {
    runEmission();
    const impactDelay = params.timing?.impactMs ?? dashMs - 20;
    timers.add(
      window.setTimeout(() => {
        if (!scene) return;
        runImpact();
      }, impactDelay)
    );
  }

  return {
    cancel() {
      timers.cancel();
      children.forEach((h) => h.cancel());
    },
  };
}

/** Đột Kích — polished rush (bộ/thương xông, không kỵ) */
export const POLISHED_RUSH_SKILLS = new Set(["dot_kich"]);

export function usesPolishedRush(skillId?: string | null, motif?: string | null, flash?: string | null): boolean {
  if (skillId && POLISHED_RUSH_SKILLS.has(skillId)) return true;
  void motif;
  void flash;
  return false;
}
