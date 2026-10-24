import * as THREE from "three";
import {
  clampHonTargetSize,
  fxSeq,
  HON_PACKS,
  honPackForStyle,
  resolveFx3dStyle,
  resolveThunderStrikeId,
  thunderStrikeFolder,
  thunderStrikeFlash,
  runStyleCharge,
  runStyleFlight,
  runStyleImpact,
  hostileTimeline,
  honHostileTimeline,
  type Fx3dStyle,
  type HonPackId,
  type ThunderStrikeId,
  type StylePlayApi,
} from "./fx3d";

/**
 * True 3D battle VFX — soft Points + mesh cores/rings + hồn qi sheet in world space.
 *
 * Hồn thú = luồng khí silhouette (flipbook CC0), không GLB full-body.
 * Style: Tam Quốc — ember / hổ phách / thép / băng; tránh neon.
 *
 * Resolve style / hon packs / play-by-style: `./fx3d/*`. File này giữ emitter runtime.
 */

export type Fx3dHandle = { cancel: () => void };
export type { Fx3dStyle, HonPackId, ThunderStrikeId };
export {
  resolveFx3dStyle,
  honPackForStyle,
  resolveThunderStrikeId,
  thunderStrikeFolder,
  thunderStrikeFlash,
  clampHonTargetSize,
  hostileTimeline,
};

type Particle = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
  alive: boolean;
};

type Emitter = {
  id: number;
  particles: Particle[];
  points: THREE.Points;
  geom: THREE.BufferGeometry;
  until: number;
  kind: "burst" | "trail" | "dust";
  // trail meta
  from?: THREE.Vector3;
  to?: THREE.Vector3;
  born?: number;
  durationMs?: number;
  tint?: THREE.Color;
  tintHot?: THREE.Color;
  mul?: number;
  arc?: number;
  density?: number;
  lastSpawn?: number;
  cursor?: number;
  drag?: number;
  gravity?: number;
};

type MeshFx = {
  id: number;
  obj: THREE.Object3D;
  until: number;
  kind: "ring" | "core" | "flash" | "spirit" | "spin" | "bolt" | "decal";
  born: number;
  lifeMs: number;
  // ring / spin / decal
  maxScale?: number;
  spinSpeed?: number;
  /** MeshBasicMaterial của decal mặt đất */
  meshMat?: THREE.MeshBasicMaterial;
  // core / spirit flight
  from?: THREE.Vector3;
  to?: THREE.Vector3;
  arc?: number;
  side?: number;
  // spirit: form rồi bay
  formMs?: number;
  flightDelayMs?: number;
  /** Thời gian bay caster→target (trước dissolve) */
  flightMs?: number;
  /** Tan tại impact — opacity→0 rồi remove */
  dissolveMs?: number;
  /** +1 bay về +X (địch→ta), −1 bay về −X (ta→địch) — khóa lúc spawn */
  facing?: number;
  /** Bolt theo dõi đầu — fade sớm lúc chạm đích */
  headLed?: boolean;
  /** Flipbook 1→N đúng 1 lần theo tiến độ bay (không loop, không chồng) */
  sequenceOnce?: boolean;
  noPitch?: boolean;
  noPulse?: boolean;
  /**
   * Tiến độ path caster→đích:
   * - out (mặc định): nhanh đầu, chậm cuối
   * - in: chậm đầu → nhanh dần (hồn thú / chiêu lao)
   * - inout: smoothstep
   */
  pathEase?: "in" | "out" | "inout";
  // volumetric dragon spirit
  segments?: THREE.Object3D[];
  segSpacing?: number;
  baseScale?: number;
  baseOpacity?: number;
  // soft sheet animation (hon_rong pack)
  frames?: THREE.Texture[];
  /** UV-lật ngang — Sprite shader bỏ qua scale.x âm (dùng length()) */
  framesFlip?: THREE.Texture[];
  frameI?: number;
  nextFrame?: number;
  frameMs?: number;
  spriteMat?: THREE.SpriteMaterial;
  altMats?: THREE.SpriteMaterial[];
  altFrames?: THREE.Texture[][];
  altFramesFlip?: THREE.Texture[][];
  /** True = bay GLB mesh (không flipbook sprite) */
  mesh3d?: boolean;
  shadowObj?: THREE.Mesh;
  shadowMat?: THREE.MeshBasicMaterial;
  shadowBaseW?: number;
  shadowBaseH?: number;
  /** Cộng thêm vào yaw khi mặt mũi model không khớp +Z */
  yawOffset?: number;
  /** SkinnedMesh — cập nhật mỗi khung */
  mixer?: THREE.AnimationMixer;
};

const ACTIVE_EMIT: Emitter[] = [];
const ACTIVE_MESH: MeshFx[] = [];
const ACTIVE_HANDLES: Fx3dHandle[] = [];
const PENDING_TIMERS: number[] = [];
let nextId = 1;

const _texLoader = new THREE.TextureLoader();
const _texCache = new Map<string, THREE.Texture>();

function loadFxTex(url: string): Promise<THREE.Texture> {
  if (!url) return Promise.reject(new Error("empty fx url"));
  const hit = _texCache.get(url);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    _texLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        // Pixel FX: không mipmap — mipmap + Additive làm mỏng thành sọc / smear
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.premultiplyAlpha = false;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        _texCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

async function loadFrameSet(urls: string[]): Promise<THREE.Texture[]> {
  const list = (urls || []).filter(Boolean);
  if (!list.length) return [];
  return Promise.all(list.map((u) => loadFxTex(u)));
}

function trackTimer(ms: number, fn: () => void): number {
  const tid = window.setTimeout(() => {
    const i = PENDING_TIMERS.indexOf(tid);
    if (i >= 0) PENDING_TIMERS.splice(i, 1);
    fn();
  }, ms);
  PENDING_TIMERS.push(tid);
  return tid;
}

const _tmp = new THREE.Vector3();
const _tmp2 = new THREE.Vector3();
const _col = new THREE.Color();
let softMap: THREE.Texture | null = null;
let streakMap: THREE.Texture | null = null;

function getSoftMap(): THREE.Texture {
  if (softMap) return softMap;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.85)");
  g.addColorStop(0.55, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  softMap = new THREE.CanvasTexture(canvas);
  softMap.magFilter = THREE.LinearFilter;
  softMap.minFilter = THREE.LinearMipmapLinearFilter;
  softMap.needsUpdate = true;
  return softMap;
}

function getStreakMap(): THREE.Texture {
  if (streakMap) return streakMap;
  const w = 64;
  const h = 16;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(0.7, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const vg = ctx.createRadialGradient(w * 0.7, h / 2, 0, w * 0.7, h / 2, h);
  vg.addColorStop(0, "rgba(255,255,255,0.9)");
  vg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
  streakMap = new THREE.CanvasTexture(canvas);
  streakMap.needsUpdate = true;
  return streakMap;
}

/**
 * Quỹ đạo hồn long — arc + uốn + xoắn linh khí (concept Hồn Long Ngâm).
 * spiral: bán kính helix quanh đường bay.
 */
function sampleSpiritPath(
  from: THREE.Vector3,
  to: THREE.Vector3,
  u: number,
  arc: number,
  side: number,
  out: THREE.Vector3,
  spiral = 0,
  spiralPhase = 0
): void {
  const e = Math.max(0, Math.min(1, u));
  out.copy(from).lerp(to, e);
  out.y += Math.sin(e * Math.PI) * arc;
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  const nx = -dz / len;
  const nz = dx / len;
  if (side) {
    out.x += nx * Math.sin(e * Math.PI * 2.15) * side;
    out.z += nz * Math.sin(e * Math.PI * 2.15) * side;
  }
  if (spiral > 0.001) {
    const ang = e * Math.PI * 5.5 + spiralPhase;
    out.x += nx * Math.cos(ang) * spiral;
    out.y += Math.sin(ang) * spiral * 0.55;
    out.z += nz * Math.cos(ang) * spiral;
  }
}

function makeFxSprite(
  map: THREE.Texture,
  color: number,
  opacity: number,
  w: number,
  h: number,
  opts?: { depthTest?: boolean; blending?: THREE.Blending }
): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: opts?.depthTest ?? false,
    blending: opts?.blending ?? THREE.AdditiveBlending,
    fog: false,
    toneMapped: false,
  });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(w, h, 1);
  spr.renderOrder = 80;
  spr.frustumCulled = false;
  return spr;
}

/** +1 = bay về +X (địch→ta), −1 = bay về −X (ta→địch). */
function spiritFacing(from: THREE.Vector3, to: THREE.Vector3): number {
  const dx = to.x - from.x;
  if (Math.abs(dx) > 1e-4) return dx < 0 ? -1 : 1;
  // Hiếm: cùng X — lấy theo Z, mặc định +X
  const dz = to.z - from.z;
  if (Math.abs(dz) > 1e-4) return dz < 0 ? -1 : 1;
  return 1;
}

/**
 * Flipbook packs — CodeManu underlay + Brackeys / Superpowers / SpritePilot.
 * Map theo style: `skillPremiumLayers` / `honElementLayers`.
 */
type ItchSheetOpts = {
  durationMs?: number;
  w?: number;
  h?: number;
  opacity?: number;
  y?: number;
  delayMs?: number;
  color?: number;
  scale?: string | null;
  spin?: boolean;
};

type ItchFxFolder = "stylized" | "brackeys" | "superpowers" | "codemanu" | "spritepilot";

/** Sheet pack dưới assets/fx/itch/{folder}/{pack}/frame_XX.png */
function emitItchFolderPackAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  folder: ItchFxFolder,
  pack: string,
  frameCount: number,
  opts: ItchSheetOpts = {}
): Fx3dHandle {
  const pad = (i: number) => String(i).padStart(2, "0");
  const urls = Array.from(
    { length: frameCount },
    (_, i) => `assets/fx/itch/${folder}/${pack}/frame_${pad(i + 1)}.png`
  );
  const mul = scaleMul(opts.scale);
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];
  const delayMs = opts.delayMs ?? 0;
  const start = () => {
    if (cancelled.v || !scene) return;
    void loadFrameSet(urls)
      .then((frames) => {
        if (cancelled.v || !scene || !frames.length) return;
        handles.push(
          emitHonSheetAt(scene, at, frames, {
            durationMs: opts.durationMs ?? 480,
            w: (opts.w ?? 2.2) * mul,
            h: (opts.h ?? 2.2) * mul,
            opacity: opts.opacity ?? 0.95,
            spin: opts.spin,
            y: opts.y ?? 0.4,
            color: opts.color ?? 0xffffff,
          })
        );
      })
      .catch(() => {});
  };
  if (delayMs > 0) {
    const tid = trackTimer(delayMs, start);
    return {
      cancel() {
        cancelled.v = true;
        clearTimeout(tid);
        handles.forEach((h) => h.cancel());
      },
    };
  }
  start();
  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

/** SpritePilot CC0 strips (đã slice) */
function emitSpritepilotAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  pack: string,
  frameCount: number,
  opts: ItchSheetOpts = {}
): Fx3dHandle {
  return emitItchFolderPackAt(scene, at, "spritepilot", pack, frameCount, opts);
}

type HonLayerRef = { folder: ItchFxFolder; pack: string; n: number; w?: number; h?: number; opacity?: number };

/**
 * Lớp element dày cho hồn — CodeManu + Brackeys + SpritePilot / Superpowers.
 * Không săn pack “spirit thú”; tint theo pack.tint ở runtime.
 */
function honElementLayers(packId: HonPackId): {
  charge: HonLayerRef[];
  form: HonLayerRef[];
  flight: { urls: string[]; w: number; h: number };
  hit: HonLayerRef[];
} {
  const pad = (i: number) => String(i).padStart(2, "0");
  const br = (pack: string, n: number) =>
    Array.from({ length: n }, (_, i) => `assets/fx/itch/brackeys/${pack}/frame_${pad(i + 1)}.png`);
  const cm = (pack: string, n: number) =>
    Array.from({ length: n }, (_, i) => `assets/fx/itch/codemanu/${pack}/frame_${pad(i + 1)}.png`);
  const sp = (pack: string, n: number) =>
    Array.from({ length: n }, (_, i) => `assets/fx/itch/superpowers/${pack}/frame_${pad(i + 1)}.png`);

  switch (packId) {
    case "hon_rong":
      return {
        charge: [
          { folder: "codemanu", pack: "charged", n: 24, w: 3.2, h: 3.2, opacity: 0.88 },
          { folder: "brackeys", pack: "ember_burst", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "codemanu", pack: "elden_ring", n: 24, w: 2.6, h: 2.6, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 3.0, h: 3.0, opacity: 0.75 },
          { folder: "codemanu", pack: "dithered_fire", n: 24, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
        flight: { urls: br("fire_point", 24), w: 2.0, h: 2.0 },
        hit: [
          { folder: "codemanu", pack: "explosion", n: 24, w: 3.4, h: 3.4, opacity: 0.95 },
          { folder: "codemanu", pack: "kabooms", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "brackeys", pack: "explosion_burst", n: 24, w: 2.6, h: 2.6, opacity: 0.7 },
          { folder: "spritepilot", pack: "explosion", n: 24, w: 2.2, h: 2.2, opacity: 0.9 },
        ],
      };
    case "hon_loi":
      return {
        charge: [
          { folder: "codemanu", pack: "electric_shield", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "charged", n: 24, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "brackeys", pack: "storm_burst", n: 24, w: 2.6, h: 2.6, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "codemanu", pack: "electric_shield", n: 24, w: 2.4, h: 2.4, opacity: 0.75 },
        ],
        flight: { urls: br("storm_burst", 24), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 24, w: 3.2, h: 3.2, opacity: 0.95 },
          { folder: "brackeys", pack: "storm_burst", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.4, h: 2.4, opacity: 0.95 },
        ],
      };
    case "hon_xa":
      return {
        charge: [
          { folder: "codemanu", pack: "tentacles", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "codemanu", pack: "worm", n: 24, w: 2.6, h: 2.6, opacity: 0.7 },
          { folder: "superpowers", pack: "sp_smoke", n: 24, w: 2.4, h: 2.4, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "smoke_puff", n: 24, w: 2.2, h: 2.2, opacity: 0.75 },
        ],
        flight: { urls: sp("sp_smoke", 24), w: 1.8, h: 1.8 },
        hit: [
          { folder: "codemanu", pack: "impact", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "puff_stars", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "spritepilot", pack: "smoke_puff", n: 24, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
      };
    case "hon_thuy":
      return {
        charge: [
          { folder: "codemanu", pack: "anima", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "brackeys", pack: "water_wave", n: 24, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "codemanu", pack: "elden_ring", n: 24, w: 2.5, h: 2.5, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "water_splash", n: 24, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
        flight: { urls: br("water_wave", 24), w: 1.9, h: 1.9 },
        hit: [
          { folder: "spritepilot", pack: "water_splash", n: 24, w: 3.0, h: 3.0, opacity: 0.95 },
          { folder: "brackeys", pack: "water_wave", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "codemanu", pack: "impact", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
        ],
      };
    case "hon_phong":
      return {
        charge: [
          { folder: "codemanu", pack: "wheel", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "codemanu", pack: "anima", n: 24, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "codemanu", pack: "constellation", n: 24, w: 2.4, h: 2.4, opacity: 0.7 },
        ],
        flight: { urls: cm("vortex", 24), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "wheel", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "spritepilot", pack: "landing_dust", n: 24, w: 2.4, h: 2.4, opacity: 0.85 },
        ],
      };
    case "hon_ho":
      return {
        charge: [
          { folder: "codemanu", pack: "charged", n: 24, w: 2.2, h: 2.2, opacity: 0.65 },
        ],
        form: [],
        flight: { urls: [], w: 0, h: 0 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 24, w: 3.2, h: 3.2, opacity: 0.95 },
          { folder: "brackeys", pack: "hit_burst", n: 24, w: 2.8, h: 2.8, opacity: 0.85 },
          { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.4, h: 2.4, opacity: 0.95 },
        ],
      };
    case "hon_soi":
      return {
        charge: [
          { folder: "codemanu", pack: "constellation", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "codemanu", pack: "charged", n: 24, w: 2.7, h: 2.7, opacity: 0.75 },
          { folder: "brackeys", pack: "shadow_burst", n: 24, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "smoke_puff", n: 24, w: 2.3, h: 2.3, opacity: 0.75 },
        ],
        flight: { urls: sp("sp_ember_trail", 24), w: 1.8, h: 1.8 },
        hit: [
          { folder: "codemanu", pack: "impact", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "brackeys", pack: "shadow_burst", n: 24, w: 2.6, h: 2.6, opacity: 0.8 },
          { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.3, h: 2.3, opacity: 0.9 },
        ],
      };
    case "hon_bagua":
      return {
        charge: [
          { folder: "codemanu", pack: "elden_ring", n: 24, w: 3.4, h: 3.4, opacity: 0.9 },
          { folder: "codemanu", pack: "constellation", n: 24, w: 3.0, h: 3.0, opacity: 0.8 },
          { folder: "codemanu", pack: "anima", n: 24, w: 2.6, h: 2.6, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "codemanu", pack: "wheel", n: 24, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        flight: { urls: cm("constellation", 24), w: 2.0, h: 2.0 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 24, w: 3.4, h: 3.4, opacity: 0.95 },
          { folder: "codemanu", pack: "elden_ring", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "codemanu", pack: "puff_stars", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
        ],
      };
    case "hon_hon":
      return {
        charge: [
          { folder: "codemanu", pack: "anima", n: 24, w: 3.2, h: 3.2, opacity: 0.9 },
          { folder: "codemanu", pack: "constellation", n: 24, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "brackeys", pack: "shadow_burst", n: 24, w: 2.5, h: 2.5, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "codemanu", pack: "anima", n: 24, w: 2.4, h: 2.4, opacity: 0.75 },
        ],
        flight: { urls: cm("anima", 24), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "impact", n: 24, w: 3.2, h: 3.2, opacity: 0.92 },
          { folder: "codemanu", pack: "anima", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.3, h: 2.3, opacity: 0.9 },
        ],
      };
  }
}

/** Sheet ground / spark — spin hoặc flash. */
function emitHonSheetAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  frames: THREE.Texture[],
  opts: {
    durationMs?: number;
    w?: number;
    h?: number;
    opacity?: number;
    spin?: boolean;
    spinSpeed?: number;
    y?: number;
    delayMs?: number;
    color?: number;
  } = {}
): Fx3dHandle {
  if (!frames.length) return { cancel() {} };
  const durationMs = opts.durationMs ?? 500;
  const delayMs = opts.delayMs ?? 0;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];

  const start = () => {
    if (cancelled.v || !scene) return;
    const spr = makeFxSprite(
      frames[0],
      opts.color ?? 0xff8a2a,
      opts.opacity ?? 0.9,
      opts.w ?? 2.2,
      opts.h ?? 1.4
    );
    spr.position.copy(at);
    spr.position.y += opts.y ?? 0.05;
    const now = performance.now();
    handles.push(
      pushMesh(scene, {
        id: nextId++,
        obj: spr,
        until: now + durationMs + 40,
        kind: opts.spin ? "spin" : "flash",
        born: now,
        lifeMs: durationMs,
        maxScale: 1.35,
        spinSpeed: opts.spinSpeed ?? 2.2,
        frames,
        frameI: 0,
        nextFrame: now + 70,
        frameMs: 70,
        spriteMat: spr.material as THREE.SpriteMaterial,
        baseScale: 1,
        baseOpacity: opts.opacity ?? 0.9,
      })
    );
  };

  if (delayMs > 0) {
    const tid = trackTimer(delayMs, start);
    return {
      cancel() {
        cancelled.v = true;
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
        handles.forEach((h) => h.cancel());
      },
    };
  }
  start();
  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

function disposeFxObject(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const spr = o as THREE.Sprite;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    } else if (spr.isSprite) {
      const mat = spr.material as THREE.SpriteMaterial;
      // shared soft/head maps — chỉ dispose material, không dispose map chung
      mat?.dispose();
    }
  });
}

function flashPalette(flash?: string): { base: THREE.Color; hot: THREE.Color; cool: THREE.Color } {
  const f = (flash || "steel").toLowerCase();
  // Hỏa Long — cam lửa (không trắng / không lam linh)
  if (f === "dragon")
    return { base: new THREE.Color(0xff7a2e), hot: new THREE.Color(0xffe08a), cool: new THREE.Color(0xdc2626) };
  if (f === "fire" || f === "fire_rain" || f === "orange" || f === "ember_orange" || f === "crimson_flame")
    return { base: new THREE.Color(0xff7a2e), hot: new THREE.Color(0xffe08a), cool: new THREE.Color(0xb91c1c) };
  if (f === "tiger" || f === "gold" || f === "gold_soft" || f === "yellow")
    return { base: new THREE.Color(0xfbbf24), hot: new THREE.Color(0xfff7ed), cool: new THREE.Color(0xb45309) };
  if (f === "thunder" || f === "storm" || f === "electric_blue")
    return { base: new THREE.Color(0xfde047), hot: new THREE.Color(0xfffbeb), cool: new THREE.Color(0x0369a1) };
  if (f === "ice_blue" || f === "ice" || f === "frost")
    return { base: new THREE.Color(0xbae6fd), hot: new THREE.Color(0xf0f9ff), cool: new THREE.Color(0x0284c7) };
  if (f === "blue" || f === "blue_water" || f === "cyan")
    return { base: new THREE.Color(0x38bdf8), hot: new THREE.Color(0xe0f2fe), cool: new THREE.Color(0x1d4ed8) };
  if (f === "violet_spirit")
    return { base: new THREE.Color(0xc4b5fd), hot: new THREE.Color(0xf5f3ff), cool: new THREE.Color(0x6d28d9) };
  // Beam tint: violet ≠ purple (cùng style beam, khác overlay)
  if (f === "violet")
    return { base: new THREE.Color(0xc4b5fd), hot: new THREE.Color(0xf5f3ff), cool: new THREE.Color(0x7c3aed) };
  if (f === "purple" || f === "shadow" || f === "bagua" || f === "jade_gold")
    return { base: new THREE.Color(0xa78bfa), hot: new THREE.Color(0xe9d5ff), cool: new THREE.Color(0x5b21b6) };
  if (f === "crimson" || f === "blood" || f === "gold_red")
    return { base: new THREE.Color(0xf87171), hot: new THREE.Color(0xfecaca), cool: new THREE.Color(0x991b1b) };
  if (f === "green_poison" || f === "poison" || f === "nature" || f === "snake" || f === "fire_green")
    return { base: new THREE.Color(0x4ade80), hot: new THREE.Color(0xdcfce7), cool: new THREE.Color(0x166534) };
  if (f === "whirlwind" || f === "wind")
    return { base: new THREE.Color(0xa7f3d0), hot: new THREE.Color(0xecfdf5), cool: new THREE.Color(0x0f766e) };
  if (f === "wolf")
    return { base: new THREE.Color(0xfca5a5), hot: new THREE.Color(0xffe4e6), cool: new THREE.Color(0x7f1d1d) };
  if (f === "rush" || f === "steel" || f === "iron" || f === "white" || f === "silver" || f === "chain")
    return { base: new THREE.Color(0xe2e8f0), hot: new THREE.Color(0xffffff), cool: new THREE.Color(0x64748b) };
  if (f === "brown" || f === "charge" || f === "earth")
    return { base: new THREE.Color(0xd2b48c), hot: new THREE.Color(0xf5e6c8), cool: new THREE.Color(0x785a3a) };
  if (f === "shield" || f === "pure" || f === "gold" || f === "gold_soft" || f === "gold_pierce" || f === "yellow" || f === "yellow_cult")
    return { base: new THREE.Color(0xfde68a), hot: new THREE.Color(0xfffbeb), cool: new THREE.Color(0xb45309) };
  return { base: new THREE.Color(0xf8fafc), hot: new THREE.Color(0xffffff), cool: new THREE.Color(0x94a3b8) };
}

function makePoints(
  capacity: number,
  additive = true,
  pointSize = 0.35,
  streak = false
): { points: THREE.Points; geom: THREE.BufferGeometry } {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(capacity * 3), 3));
  geom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(capacity * 3), 3));
  geom.setDrawRange(0, 0);

  const mat = new THREE.PointsMaterial({
    size: pointSize,
    map: streak ? getStreakMap() : getSoftMap(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    sizeAttenuation: true,
    opacity: 1,
    alphaTest: 0.01,
  });
  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  points.renderOrder = 52;
  points.name = "fx3d-points";
  return { points, geom };
}

function allocParticles(n: number): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < n; i++) {
    list.push({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
      size: 0.2,
      color: new THREE.Color(1, 1, 1),
      alive: false,
    });
  }
  return list;
}

function pushEmit(scene: THREE.Scene, em: Emitter): Fx3dHandle {
  scene.add(em.points);
  ACTIVE_EMIT.push(em);
  return {
    cancel() {
      const i = ACTIVE_EMIT.indexOf(em);
      if (i >= 0) ACTIVE_EMIT.splice(i, 1);
      em.points.parent?.remove(em.points);
      em.geom.dispose();
      (em.points.material as THREE.Material).dispose();
    },
  };
}

let cachedShadowTex: THREE.CanvasTexture | null = null;
function getSoftShadowTexture(): THREE.CanvasTexture {
  if (cachedShadowTex) return cachedShadowTex;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.28)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  cachedShadowTex = new THREE.CanvasTexture(canvas);
  return cachedShadowTex;
}

function pushMesh(scene: THREE.Scene, fx: MeshFx): Fx3dHandle {
  scene.add(fx.obj);
  if (fx.shadowObj) scene.add(fx.shadowObj);
  ACTIVE_MESH.push(fx);
  return {
    cancel() {
      const i = ACTIVE_MESH.indexOf(fx);
      if (i >= 0) ACTIVE_MESH.splice(i, 1);
      fx.obj.parent?.remove(fx.obj);
      disposeFxObject(fx.obj);
      if (fx.shadowObj) {
        fx.shadowObj.parent?.remove(fx.shadowObj);
        disposeFxObject(fx.shadowObj);
      }
    },
  };
}

function scaleMul(scale?: string | null): number {
  if (scale === "L") return 1.35;
  if (scale === "S") return 0.72;
  return 1;
}

type HonCombatVariant = {
  tint: number;
  emissive: number;
  /** World-unit longest axis — sẽ clampHonTargetSize */
  size: number;
  arcMul: number;
  hot: boolean;
  /** Pha màu lên texture GLB (Lôi/Thanh cần mạnh hơn) */
  tintStrength: number;
};

/** Size mặc định theo pack — projectile combat, không boss. */
const HON_PACK_BASE_SIZE: Record<HonPackId, number> = {
  hon_rong: 1.5,
  hon_xa: 1.35,
  hon_ho: 1.4,
  hon_soi: 1.25,
  hon_thuy: 1.35,
  hon_loi: 1.4,
  hon_phong: 1.35,
  hon_bagua: 1.55,
  hon_hon: 1.4,
};

/** Palette + size theo pack (+ skillId override cho biến thể rồng). */
function resolveHonCombatVariant(packId: HonPackId, skillId?: string | null): HonCombatVariant {
  const pack = HON_PACKS[packId];
  const id = String(skillId || "").toLowerCase();
  const base: HonCombatVariant = {
    tint: pack.tint,
    emissive: pack.emissive,
    size: HON_PACK_BASE_SIZE[packId],
    arcMul: 1,
    hot: packId === "hon_rong" || packId === "hon_ho",
    tintStrength: packId === "hon_loi" ? 0.62 : packId === "hon_rong" ? 0.5 : 0.45,
  };

  if (packId === "hon_rong") {
    if (/bach_long|ngan_long/.test(id))
      return { tint: 0xe8eef7, emissive: 0xf8fafc, size: 2.55, arcMul: 1.02, hot: false, tintStrength: 0.68 };
    if (/thanh_long|thuong_long/.test(id))
      return { tint: 0x2dd4bf, emissive: 0x14b8a6, size: 2.65, arcMul: 1.05, hot: false, tintStrength: 0.65 };
    if (/viem_long|xich_long|hoa_long/.test(id))
      return { tint: 0xff8a3a, emissive: 0xff4a12, size: 2.75, arcMul: 0.95, hot: true, tintStrength: 0.55 };
    if (/thien_long|ba_vuong|phi_long|troi_long/.test(id))
      return { tint: 0xff8a3a, emissive: 0xff4a12, size: 2.95, arcMul: 1.06, hot: true, tintStrength: 0.52 };
    return { ...base, tint: 0xff8a3a, emissive: 0xff4a12, size: 2.7, hot: true };
  }
  if (packId === "hon_xa") {
    return { tint: 0x6ee7a8, emissive: 0x22c55e, size: 1.48, arcMul: 0.92, hot: false, tintStrength: 0.5 };
  }
  if (packId === "hon_ho") {
    return { tint: 0xfbbf24, emissive: 0xf59e0b, size: 1.55, arcMul: 0.88, hot: true, tintStrength: 0.48 };
  }
  if (packId === "hon_soi") {
    return { tint: 0xcbd5e1, emissive: 0x94a3b8, size: 1.32, arcMul: 0.9, hot: false, tintStrength: 0.5 };
  }
  if (packId === "hon_thuy") {
    return { tint: 0x38bdf8, emissive: 0x0ea5e9, size: 1.42, arcMul: 1.0, hot: false, tintStrength: 0.52 };
  }
  if (packId === "hon_loi") {
    // Cùng GLB rồng — vàng sét + nhỏ hơn breath lửa
    return { tint: 0xfde047, emissive: 0xfacc15, size: 1.5, arcMul: 0.85, hot: true, tintStrength: 0.7 };
  }
  if (packId === "hon_phong") {
    return { tint: 0xa5f3fc, emissive: 0x67e8f9, size: 1.45, arcMul: 1.08, hot: false, tintStrength: 0.48 };
  }
  if (packId === "hon_bagua") {
    // Tint nhẹ — sheet đã đa màu (jade/gold/cyan/violet)
    return { tint: 0xf5e6c8, emissive: 0xc4b5fd, size: 1.65, arcMul: 0.72, hot: false, tintStrength: 0.22 };
  }
  if (packId === "hon_hon") {
    return { tint: 0xe0e7ff, emissive: 0xa78bfa, size: 1.5, arcMul: 0.95, hot: false, tintStrength: 0.28 };
  }
  return base;
}

/** Pattern → arc/side/flightMs — path đọc caster→target, không orbit. */
function patternFlightTune(pattern?: string | null): {
  arcMul: number;
  side: number;
  densityMul: number;
  flightExtraMs: number;
} {
  const p = String(pattern || "single").toLowerCase();
  if (p === "all" || p === "ally_all") return { arcMul: 0.9, side: 0.1, densityMul: 1.15, flightExtraMs: 120 };
  if (p === "column") return { arcMul: 1.12, side: 0.04, densityMul: 1.05, flightExtraMs: 100 };
  if (p === "row" || p === "front_row") return { arcMul: 0.78, side: 0.08, densityMul: 1.05, flightExtraMs: 80 };
  return { arcMul: 1, side: 0.05, densityMul: 1, flightExtraMs: 0 };
}

/** Map pack hồn → style timeline (rồng = flight dài). */
function styleForHonPack(packId: HonPackId): Fx3dStyle {
  if (packId === "hon_rong") return "breath";
  if (packId === "hon_thuy") return "tide";
  if (packId === "hon_loi") return "thunder";
  if (packId === "hon_xa") return "poison";
  if (packId === "hon_phong") return "whirl";
  if (packId === "hon_bagua") return "bagua";
  if (packId === "hon_hon") return "shadow";
  if (packId === "hon_ho" || packId === "hon_soi") return "roar";
  return "breath";
}

/** Timeline combat hồn — breath/rồng flight ~1.1s+ để thấy lưỡn. */
function honCombatTimeline(
  pattern?: string | null,
  opts?: { qiStream?: boolean; scale?: string | null; pack?: HonPackId }
): {
  chargeMs: number;
  formMs: number;
  flightMs: number;
  dissolveMs: number;
  flightBeats: number;
} {
  return honHostileTimeline({
    pattern,
    scale: opts?.scale,
    qiStream: opts?.qiStream,
    style: styleForHonPack(opts?.pack || "hon_rong"),
  });
}

/** Qi spirit folders — style Hỏa Long (charge / flight đầu-phải / impact). */
function qiSeq(folder: string, stem: string, n: number): string[] {
  return fxSeq(folder, stem, n);
}

const QI_PACK_FOLDERS: Record<HonPackId, string> = {
  hon_rong: "skill/rong/qi_fire",
  hon_xa: "skill/xa/qi_poison",
  hon_ho: "skill/ho/qi_tiger",
  hon_soi: "skill/soi/qi_wolf",
  hon_thuy: "skill/thuy/qi_water",
  hon_loi: "skill/loi/qi_thunder",
  hon_phong: "skill/phong/qi_wind",
  hon_bagua: "skill/bagua/qi_bagua",
  hon_hon: "skill/hon/qi_soul",
};

/**
 * Sheet qi-stream. Mọi pack hồn: charge → flight (đầu dẫn) → impact.
 * thanh/bạch long → qi_azure / qi_ivory. bagua thêm strike (sét xuống).
 */
function resolveHonStreamSheets(
  packId: HonPackId,
  skillId?: string | null
): {
  head: string[];
  body: string[];
  outline: string[];
  mist: string[];
  charge: string[];
  impact: string[];
  strike: string[];
} {
  const pack = HON_PACKS[packId];
  const id = String(skillId || "").toLowerCase();
  let folder = QI_PACK_FOLDERS[packId];
  if (packId === "hon_rong") {
    if (/thanh_long|thuong_long/.test(id)) folder = "skill/rong/qi_azure";
    else if (/bach_long|ngan_long/.test(id)) folder = "skill/rong/qi_ivory";
    else folder = "skill/rong/qi_fire";
  }
  /** Flipbook ≥24 frame / stem (expand-qi-flipbook.py) */
  const flight = qiSeq(folder, "flight", 24);
  const charge = qiSeq(folder, "charge", 24);
  const impact = qiSeq(folder, "impact", 24);
  const strike = packId === "hon_bagua" ? qiSeq(folder, "strike", 24) : [];
  return {
    head: flight.slice(),
    body: flight.slice(),
    outline: [],
    mist: pack.mist.slice(),
    charge,
    impact,
    strike,
  };
}

function formationCentroid(points: THREE.Vector3[]): { center: THREE.Vector3; radius: number } {
  const center = new THREE.Vector3();
  const list = points.length ? points : [new THREE.Vector3()];
  list.forEach((p) => center.add(p));
  center.multiplyScalar(1 / list.length);
  let radius = 1.35;
  list.forEach((p) => {
    radius = Math.max(radius, Math.hypot(p.x - center.x, p.z - center.z) + 1.05);
  });
  return { center, radius };
}

/**
 * Decal qi nằm phẳng trên đất — Group xoay Y + plane con rot.x=-π/2.
 * (Xoay mesh.rotation.y sau khi đã rot.x sẽ bị “gãy” Euler.)
 */
function emitGroundQiDecal3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  frameUrls: string[],
  opts: {
    durationMs?: number;
    diameter?: number;
    opacity?: number;
    spinSpeed?: number;
    y?: number;
    delayMs?: number;
    color?: number;
    /** false = chỉ xoay texture cố định (vòng bát quái mượt) */
    animateFrames?: boolean;
  } = {}
): Fx3dHandle {
  const durationMs = opts.durationMs ?? 520;
  const delayMs = opts.delayMs ?? 0;
  const diameter = opts.diameter ?? 3.2;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];

  const start = () => {
    if (cancelled.v || !scene) return;
    void loadFrameSet(frameUrls).then((frames) => {
      if (cancelled.v || !scene || !frames.length) return;
      const mat = new THREE.MeshBasicMaterial({
        map: frames[0],
        color: opts.color ?? 0xffffff,
        transparent: true,
        opacity: opts.opacity ?? 0.92,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      });
      const root = new THREE.Group();
      root.position.set(at.x, opts.y ?? 0.05, at.z);
      root.renderOrder = 46;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(diameter, diameter, 1);
      mesh.frustumCulled = false;
      root.add(mesh);
      const now = performance.now();
      const animate = opts.animateFrames !== false && frames.length > 1;
      const useFrames = animate ? frames : [frames[0]];
      const frameMs = animate ? Math.max(40, Math.floor(durationMs / Math.max(1, useFrames.length))) : 99999;
      handles.push(
        pushMesh(scene, {
          id: nextId++,
          obj: root,
          until: now + durationMs + 40,
          kind: "decal",
          born: now,
          lifeMs: durationMs,
          spinSpeed: opts.spinSpeed ?? 2.4,
          frames: useFrames,
          frameI: 0,
          nextFrame: now + frameMs,
          frameMs,
          meshMat: mat,
          baseOpacity: opts.opacity ?? 0.92,
          maxScale: 1,
        })
      );
    });
  };

  if (delayMs > 0) {
    const tid = trackTimer(delayMs, start);
    return {
      cancel() {
        cancelled.v = true;
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
        handles.forEach((h) => h.cancel());
      },
    };
  }
  start();
  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

/**
 * Pháp trận Bát Quái — KHÔNG ném ấn / không billboard đứng.
 * Tụ lực → vòng nằm DƯỚI CHÂN đội hình địch (xoay) → sét đánh xuống.
 */
function emitBaguaFormationSequence3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: {
    scale?: string | null;
    skillId?: string | null;
    pattern?: string | null;
    targets?: THREE.Vector3[];
  } = {}
): Fx3dHandle {
  const sheets = resolveHonStreamSheets("hon_bagua", opts.skillId);
  const targets = (opts.targets && opts.targets.length ? opts.targets : [to]).map((p) => p.clone());
  const { center, radius } = formationCentroid(targets);
  const mul = scaleMul(opts.scale);
  const tlBagua = honHostileTimeline({
    pattern: opts.pattern,
    scale: opts.scale,
    qiStream: true,
    style: "bagua",
  });
  const CHARGE_MS = tlBagua.chargeMs;
  const RING_MS = tlBagua.flightMs;
  const STRIKE_STAGGER = 55;
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const cancelled = { v: false };
  // Phủ đội hình nhưng không nuốt cả sân — cân với tướng ~1.28 cao
  const ringDiam = Math.min(6.8, Math.max(2.8, radius * 2.15)) * mul;
  const ringUrls = sheets.head.length ? sheets.head : sheets.charge;

  const start = () => {
    if (cancelled.v || !scene) return;
    const casterGround = from.clone();
    casterGround.y = 0.05;
    // 1) Tụ lực nhỏ dưới chân caster — sigil bát quái tròn mượt
    handles.push(
      emitGroundSigil3d(scene, casterGround, {
        flash: "bagua",
        scale: opts.scale,
        durationMs: CHARGE_MS + 60,
        color: 0xe8dcc8,
      })
    );
    handles.push(
      emitGroundQiDecal3d(scene, from, ringUrls, {
        durationMs: CHARGE_MS,
        diameter: 1.9 * mul,
        opacity: 0.88,
        spinSpeed: 2.2,
        y: 0.04,
        animateFrames: false,
      })
    );

    // 2) Vòng Bát Quái nằm phẳng dưới chân địch — xoay mượt (1 texture)
    timers.push(
      trackTimer(CHARGE_MS, () => {
        if (cancelled.v || !scene) return;
        handles.push(
          emitGroundQiDecal3d(scene, center, ringUrls, {
            durationMs: RING_MS + 120,
            diameter: ringDiam,
            opacity: 0.96,
            spinSpeed: 2.8,
            y: 0.05,
            animateFrames: false,
          })
        );
        handles.push(
          emitGroundQiDecal3d(scene, center, ringUrls, {
            durationMs: RING_MS + 80,
            diameter: ringDiam * 1.06,
            opacity: 0.4,
            spinSpeed: -1.6,
            y: 0.035,
            delayMs: 20,
            animateFrames: false,
          })
        );
      })
    );

    // 3) Sét đánh xuống từng mục tiêu
    const strikeAt = CHARGE_MS + Math.round(RING_MS * 0.5);
    const strikeUrls = sheets.strike.length ? sheets.strike : sheets.impact;
    targets.forEach((tgt, i) => {
      timers.push(
        trackTimer(strikeAt + i * STRIKE_STAGGER, () => {
          if (cancelled.v || !scene) return;
          void loadFrameSet(strikeUrls).then((frames) => {
            if (cancelled.v || !scene || !frames.length) return;
            handles.push(
              emitHonSheetAt(scene, tgt, frames, {
                durationMs: 360,
                w: 0.85 * mul,
                h: 2.8 * mul,
                opacity: 0.98,
                y: 1.15,
                color: 0xffffff,
              })
            );
          });
          handles.push(emitBurst3d(scene, tgt, "thunder", opts.scale));
          handles.push(emitSparksBurst3d(scene, tgt, { flash: "thunder", scale: opts.scale }));
          handles.push(
            emitGroundMark3d(scene, tgt, {
              flash: "bagua",
              scale: opts.scale,
              durationMs: 480,
              color: 0xc4b5fd,
            })
          );
        })
      );
    });
  };

  start();
  return {
    cancel() {
      cancelled.v = true;
      timers.forEach((tid) => {
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      });
      handles.forEach((h) => h.cancel());
    },
  };
}

/**
 * Sét dọc khí thế — màu theo skill (qi_crimson / violet / azure / gold / venom / gale).
 * Dùng cho hồn đánh địch + chiêu lôi impact.
 */
function emitColoredThunderStrike3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: {
    skillId?: string | null;
    scale?: string | null;
    strikeId?: ThunderStrikeId;
    delayMs?: number;
  } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const strikeId = opts.strikeId || resolveThunderStrikeId(opts.skillId);
  const folder = thunderStrikeFolder(strikeId);
  const flash = thunderStrikeFlash(strikeId);
  const strikeUrls = qiSeq(folder, "strike", 24);
  const impactUrls = qiSeq(folder, "impact", 24);
  const handles: Fx3dHandle[] = [];
  const cancelled = { v: false };
  const delayMs = opts.delayMs ?? 0;

  const start = () => {
    if (cancelled.v || !scene) return;
    if (strikeUrls.length) {
      void loadFrameSet(strikeUrls).then((frames) => {
        if (cancelled.v || !scene || !frames.length) return;
        handles.push(
          emitHonSheetAt(scene, at, frames, {
            durationMs: 420,
            w: 1.55 * mul,
            h: 4.4 * mul,
            opacity: 1,
            y: 1.55,
            color: 0xffffff,
          })
        );
      });
    }
    if (impactUrls.length) {
      void loadFrameSet(impactUrls).then((frames) => {
        if (cancelled.v || !scene || !frames.length) return;
        handles.push(
          emitHonSheetAt(scene, at, frames, {
            durationMs: 380,
            w: 2.8 * mul,
            h: 2.8 * mul,
            opacity: 0.95,
            y: 0.35,
            color: 0xffffff,
            delayMs: 40,
          })
        );
      });
    }
    handles.push(emitBurst3d(scene, at, flash, opts.scale));
    handles.push(emitSparksBurst3d(scene, at, { flash, scale: opts.scale }));
    handles.push(
      emitShockwave3d(scene, at, {
        flash,
        scale: opts.scale,
        radius: 2.4 * mul,
        durationMs: 420,
      })
    );
    const markColor =
      strikeId === "qi_crimson"
        ? 0xff4a12
        : strikeId === "qi_violet"
          ? 0xa78bfa
          : strikeId === "qi_azure"
            ? 0x38bdf8
            : strikeId === "qi_venom"
              ? 0x4ade80
              : strikeId === "qi_gale"
                ? 0x67e8f9
                : 0xfde047;
    handles.push(
      emitGroundMark3d(scene, at, {
        flash,
        scale: opts.scale,
        durationMs: 560,
        color: markColor,
      })
    );
  };

  if (delayMs > 0) {
    const tid = trackTimer(delayMs, start);
    return {
      cancel() {
        cancelled.v = true;
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
        handles.forEach((h) => h.cancel());
      },
    };
  }
  start();
  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

/**
 * Linh hồn người — KHÔNG bay đạn hồn.
 * 1) Người xuất chiêu: hồn (vung tay) hiện tại CASTER
 * 2) Đồng minh được buff: hồn hiện trên ally (cùng art)
 * 3) Kẻ địch bị đánh bởi hồn: sét đánh xuống
 */
function emitSoulMageSequence3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: {
    scale?: string | null;
    skillId?: string | null;
    pattern?: string | null;
    targets?: THREE.Vector3[];
    support?: boolean;
  } = {}
): Fx3dHandle {
  const sheets = resolveHonStreamSheets("hon_hon", opts.skillId);
  const mul = scaleMul(opts.scale);
  const pat = String(opts.pattern || "single").toLowerCase();
  const isBuff = opts.support === true || pat === "ally_all" || pat === "self";
  const tlSoul = honHostileTimeline({
    pattern: opts.pattern,
    scale: opts.scale,
    qiStream: true,
    style: "shadow",
  });
  const CHARGE_MS = Math.min(380, tlSoul.chargeMs);
  const CAST_MS = Math.max(520, Math.min(720, Math.round(tlSoul.flightMs * 0.55)));
  const TARGET_AT = CHARGE_MS + Math.round(CAST_MS * 0.55);
  const STAGGER = isBuff ? 48 : 55;
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const cancelled = { v: false };
  const hitTargets = (opts.targets && opts.targets.length ? opts.targets : [to]).map((p) => p.clone());
  const castUrls = sheets.head.length ? sheets.head : sheets.charge;

  const start = () => {
    if (cancelled.v || !scene) return;
    // 1) Tụ lực dưới chân caster — sigil trận pháp + body aura (không quay hình người trên sàn)
    handles.push(
      emitGroundSigil3d(scene, from, {
        flash: "violet_spirit",
        scale: opts.scale,
        durationMs: CHARGE_MS + 40,
        color: 0x9333ea,
      })
    );
    handles.push(
      emitBodyAura3d(scene, from, {
        flash: "violet_spirit",
        scale: opts.scale,
        durationMs: CHARGE_MS + 60,
        color: 0xc084fc,
        pack: "vortex",
      })
    );
    handles.push(
      emitShockwave3d(scene, from, {
        flash: "violet_spirit",
        scale: opts.scale,
        radius: 1.35 * mul,
        durationMs: CHARGE_MS,
      })
    );

    // 2) Hồn hiện tại CASTER — sheet vung tay (không bay path)
    timers.push(
      trackTimer(CHARGE_MS, () => {
        if (cancelled.v || !scene) return;
        void loadFrameSet(castUrls).then((frames) => {
          if (cancelled.v || !scene || !frames.length) return;
          handles.push(
            emitHonSheetAt(scene, from, frames, {
              durationMs: CAST_MS,
              w: 2.05 * mul,
              h: 2.55 * mul,
              opacity: 0.98,
              y: 0.95,
              color: 0xffffff,
            })
          );
        });
      })
    );

    // 3) Mục tiêu: buff = hồn trên ally; đánh = sét xuống địch
    hitTargets.forEach((tgt, i) => {
      timers.push(
        trackTimer(TARGET_AT + i * STAGGER, () => {
          if (cancelled.v || !scene) return;
          if (isBuff) {
            void loadFrameSet(castUrls).then((frames) => {
              if (cancelled.v || !scene || !frames.length) return;
              handles.push(
                emitHonSheetAt(scene, tgt, frames, {
                  durationMs: Math.min(560, CAST_MS),
                  w: 1.65 * mul,
                  h: 2.05 * mul,
                  opacity: 0.92,
                  y: 0.85,
                  color: 0xffffff,
                })
              );
            });
            if (sheets.impact.length) {
              void loadFrameSet(sheets.impact).then((frames) => {
                if (cancelled.v || !scene || !frames.length) return;
                handles.push(
                  emitHonSheetAt(scene, tgt, frames, {
                    durationMs: 360,
                    w: 2.1 * mul,
                    h: 2.1 * mul,
                    opacity: 0.78,
                    y: 0.55,
                    color: 0xffffff,
                    delayMs: 80,
                  })
                );
              });
            }
            handles.push(
              emitBodyAura3d(scene, tgt, {
                flash: "violet_spirit",
                scale: opts.scale,
                durationMs: 520,
                color: 0xc4b5fd,
              })
            );
            handles.push(
              emitGroundMark3d(scene, tgt, {
                flash: "violet_spirit",
                scale: opts.scale,
                durationMs: 420,
                color: 0xa78bfa,
              })
            );
            return;
          }

          // Địch — sét dọc màu đúng skill (khí thế)
          handles.push(
            emitColoredThunderStrike3d(scene, tgt, {
              skillId: opts.skillId,
              scale: opts.scale,
            })
          );
        })
      );
    });
  };

  start();
  return {
    cancel() {
      cancelled.v = true;
      timers.forEach((tid) => {
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      });
      handles.forEach((h) => h.cancel());
    },
  };
}

/** Lớp 1 — ground sigil / charge dưới chân caster. */
export function emitGroundSigil3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; scale?: string | null; durationMs?: number; color?: number } = {}
): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const mul = scaleMul(opts.scale);
  const dur = opts.durationMs ?? 640;
  const flash = opts.flash || "steel";
  const color = opts.color ?? flashPalette(flash).base.getHex();
  handles.push(
    emitShockwave3d(scene, at, { flash, scale: opts.scale, radius: 1.55, durationMs: dur })
  );
  handles.push(
    emitItchFolderPackAt(scene, at, "codemanu", "elden_ring", 16, {
      durationMs: dur,
      w: 2.6 * mul,
      h: 2.6 * mul,
      opacity: 0.72,
      y: 0.04,
      spin: true,
      color,
      scale: opts.scale,
    })
  );
  return {
    cancel() {
      handles.forEach((h) => h.cancel());
    },
  };
}

/** Lớp 2 — aura quanh thân caster. */
export function emitBodyAura3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; scale?: string | null; durationMs?: number; color?: number; pack?: string } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const dur = opts.durationMs ?? 520;
  const color = opts.color ?? flashPalette(opts.flash).hot.getHex();
  const pack = opts.pack || "charged";
  return emitItchFolderPackAt(scene, at, "codemanu", pack, 16, {
    durationMs: dur,
    w: 2.4 * mul,
    h: 2.8 * mul,
    opacity: 0.82,
    y: 0.55,
    color,
    scale: opts.scale,
    spin: true,
  });
}

/** Lớp 6 — ground mark tại đích (vết cháy / bụi / vòng). */
export function emitGroundMark3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; scale?: string | null; durationMs?: number; color?: number } = {}
): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const mul = scaleMul(opts.scale);
  const dur = opts.durationMs ?? 720;
  const flash = opts.flash || "steel";
  const color = opts.color ?? flashPalette(flash).cool.getHex();
  handles.push(
    emitShockwave3d(scene, at, { flash, scale: opts.scale, radius: 2.1, durationMs: dur * 0.85 })
  );
  handles.push(
    emitSpritepilotAt(scene, at, "landing_dust", 7, {
      durationMs: dur,
      w: 2.6 * mul,
      h: 1.45 * mul,
      opacity: 0.9,
      y: 0.04,
      color,
      scale: opts.scale,
    })
  );
  handles.push(
    emitItchFolderPackAt(scene, at, "brackeys", "earth_burst", 16, {
      durationMs: dur * 0.7,
      w: 2.2 * mul,
      h: 1.6 * mul,
      opacity: 0.65,
      y: 0.06,
      delayMs: 40,
      color,
      scale: opts.scale,
    })
  );
  return {
    cancel() {
      handles.forEach((h) => h.cancel());
    },
  };
}

/** Lớp 4/7 — tia kim loại / spark phụ. */
export function emitSparksBurst3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; scale?: string | null } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const pal = flashPalette(opts.flash);
  const count = Math.round(42 * mul);
  const { points, geom } = makePoints(count, true, 0.28 * mul, true);
  const particles = allocParticles(count);
  const now = performance.now();
  for (let i = 0; i < count; i++) {
    const p = particles[i];
    p.alive = true;
    p.pos.copy(at);
    p.pos.y += 0.35;
    const a = Math.random() * Math.PI * 2;
    const elev = 0.2 + Math.random() * 0.7;
    const sp = (2.2 + Math.random() * 3.2) * mul;
    p.vel.set(Math.cos(a) * Math.cos(elev) * sp, Math.sin(elev) * sp * 0.85, Math.sin(a) * Math.cos(elev) * sp);
    p.life = 0;
    p.maxLife = 0.28 + Math.random() * 0.32;
    p.size = 0.14 * mul * (0.6 + Math.random());
    p.color.copy(i % 2 === 0 ? pal.hot : pal.base);
  }
  return pushEmit(scene, {
    id: nextId++,
    particles,
    points,
    geom,
    until: now + 620,
    kind: "burst",
    gravity: 6.5,
    drag: 1.8,
  });
}

/** Lớp 7 — residual khói / tro linger sau impact. */
export function emitResidual3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; scale?: string | null; delayMs?: number; color?: number } = {}
): Fx3dHandle {
  const delayMs = opts.delayMs ?? 80;
  const cancelled = { v: false };
  let child: Fx3dHandle | null = null;
  const tid = trackTimer(delayMs, () => {
    if (cancelled.v || !scene) return;
    const mul = scaleMul(opts.scale);
    const color = opts.color ?? flashPalette(opts.flash).cool.getHex();
    child = emitSpritepilotAt(scene, at, "smoke_puff", 8, {
      durationMs: 680,
      w: 2.4 * mul,
      h: 2.0 * mul,
      opacity: 0.72,
      y: 0.28,
      color,
      scale: opts.scale,
    });
  });
  return {
    cancel() {
      cancelled.v = true;
      clearTimeout(tid);
      const ti = PENDING_TIMERS.indexOf(tid);
      if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      child?.cancel();
    },
  };
}

/** Expanding mesh ring on ground — roar / nova readable. */
export function emitShockwave3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  opts: { flash?: string; durationMs?: number; radius?: number; scale?: string | null } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const durationMs = opts.durationMs ?? 620;
  const maxR = (opts.radius ?? 2.6) * mul;
  const pal = flashPalette(opts.flash);
  const geo = new THREE.RingGeometry(0.35, 0.55, 48);
  const mat = new THREE.MeshBasicMaterial({
    color: pal.base,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(at.x, 0.06, at.z);
  mesh.scale.setScalar(0.2);
  mesh.renderOrder = 48;

  // inner flash disc
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    new THREE.MeshBasicMaterial({
      color: pal.hot,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.02;
  mesh.add(disc);

  const now = performance.now();
  return pushMesh(scene, {
    id: nextId++,
    obj: mesh,
    until: now + durationMs + 40,
    kind: "ring",
    born: now,
    lifeMs: durationMs,
    maxScale: maxR,
  });
}

/** Flying core (rush tip) — small glow sphere. Không dùng cho Hỏa Long. */
export function emitCoreFlight3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: { flash?: string; durationMs?: number; scale?: string | null; arc?: number; size?: number } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const durationMs = opts.durationMs ?? 520;
  const pal = flashPalette(opts.flash);
  const size = (opts.size ?? 0.38) * mul;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(size, 14, 12),
    new THREE.MeshBasicMaterial({
      color: pal.hot,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.7, 14, 12),
    new THREE.MeshBasicMaterial({
      color: pal.base,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(size * 2.4, 12, 10),
    new THREE.MeshBasicMaterial({
      color: pal.cool,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const root = new THREE.Group();
  root.add(halo);
  root.add(shell);
  root.add(core);
  // Bay ngang ngực thủ lĩnh, không sát đất
  const start = from.clone();
  start.y = Math.max(from.y, 0.85);
  const end = to.clone();
  end.y = Math.max(to.y, 0.85);
  root.position.copy(start);
  root.renderOrder = 58;

  const now = performance.now();
  return pushMesh(scene, {
    id: nextId++,
    obj: root,
    until: now + durationMs + 80,
    kind: "core",
    born: now,
    lifeMs: durationMs,
    from: start,
    to: end,
    arc: opts.arc ?? 0.55,
  });
}

/**
 * Flipbook bay theo cung caster → địch.
 * sequenceOnce: frame 1 lúc xuất chiêu → frame N lúc trúng đích (1 sprite, không loop/chồng).
 */
export function emitFlyingSheet3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  frameUrls: string[],
  opts: {
    durationMs?: number;
    w?: number;
    h?: number;
    arc?: number;
    color?: number;
    opacity?: number;
    scale?: string | null;
    frameMs?: number;
    yLift?: number;
    /** true = texture có đầu bên phải; tự lật UV khi bay về −X (ta→địch) */
    headOnRight?: boolean;
    /**
     * Path theo dõi MŨI/HÀM (không phải tâm sprite).
     * 0.34 ≈ hàm mở ~mép leading; tăng nếu vẫn thấy thân đâm trước.
     */
    headLeadFrac?: number;
    /** Frame 1→N đúng 1 lần theo tiến độ bay */
    sequenceOnce?: boolean;
    /** in = bay nhanh dần (chậm xuất → lao mạnh) */
    pathEase?: "in" | "out" | "inout";
    noPitch?: boolean;
    noPulse?: boolean;
    /** Frames đã được lật ngang sẵn từ source (không cần UV hack) */
    preFlipped?: boolean;
  } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const durationMs = opts.durationMs ?? 480;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];
  const face = spiritFacing(from, to);
  // Sân: ta +X / địch −X. Art đầu bên phải → bay −X (ta→địch) phải lật UV (nếu chưa preFlipped).
  const flip = !opts.preFlipped && !!opts.headOnRight && face < 0;
  const sprW = (opts.w ?? 1.4) * mul;
  const sprH = (opts.h ?? 1.4) * mul;
  const start = from.clone();
  start.y = Math.max(from.y, opts.yLift ?? 0.9);
  const end = to.clone();
  end.y = Math.max(to.y, opts.yLift ?? 0.9);
  // Tâm sprite lùi về phía caster → đầu (leading) chạy đúng from→to, đâm vào đích rồi mới bùm
  if (opts.headOnRight || opts.preFlipped || opts.headLeadFrac != null) {
    const lead = sprW * (opts.headLeadFrac ?? 0.36);
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const len = Math.hypot(dx, dz) || 1;
    const ux = dx / len;
    const uz = dz / len;
    start.x -= ux * lead;
    start.z -= uz * lead;
    end.x -= ux * lead;
    end.z -= uz * lead;
  }

  void loadFrameSet(frameUrls)
    .then((frames) => {
      if (cancelled.v || !scene || !frames.length) return;
      // Clone + flip UV — Sprite không nhận scale.x âm; không mutate cache frame
      const useFrames = flip
        ? frames.map((f) => {
            const c = f.clone();
            c.wrapS = THREE.RepeatWrapping;
            c.wrapT = THREE.ClampToEdgeWrapping;
            c.repeat.x = -1;
            c.offset.x = 1;
            c.needsUpdate = true;
            return c;
          })
        : frames;
      const mat = new THREE.SpriteMaterial({
        map: useFrames[0],
        color: opts.color ?? 0xffffff,
        transparent: true,
        opacity: opts.opacity ?? 0.98,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      });
      const spr = new THREE.Sprite(mat);
      spr.scale.set(sprW, sprH, 1);
      spr.position.copy(start);
      spr.renderOrder = 85;
      spr.frustumCulled = false;

      // Bóng đổ 3D mặt đất đồng hành cùng đạn bay
      const shadowMat = new THREE.MeshBasicMaterial({
        map: getSoftShadowTexture(),
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        depthTest: true,
      });
      const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      const shadowBaseW = Math.max(1.1, sprW * 0.72);
      const shadowBaseH = Math.max(0.55, sprH * 0.42);
      shadowMesh.scale.set(shadowBaseW, shadowBaseH, 1);
      shadowMesh.position.set(start.x, 0.035, start.z);
      shadowMesh.renderOrder = 42;
      shadowMesh.frustumCulled = false;

      const now = performance.now();
      handles.push(
        pushMesh(scene, {
          id: nextId++,
          obj: spr,
          shadowObj: shadowMesh,
          shadowMat,
          shadowBaseW,
          shadowBaseH,
          until: now + durationMs + 80,
          kind: "bolt",
          born: now,
          lifeMs: durationMs,
          from: start,
          to: end,
          arc: opts.arc ?? 0.5,
          frames: useFrames,
          frameI: 0,
          nextFrame: now + (opts.frameMs ?? 55),
          frameMs: opts.frameMs ?? 55,
          spriteMat: mat,
          baseOpacity: opts.opacity ?? 0.98,
          baseScale: 1,
          facing: face,
          headLed: !!opts.headOnRight,
          noPitch: !!opts.noPitch,
          noPulse: !!opts.noPulse,
          // sequenceOnce: caller bật tường minh; mặc định bật khi head-led qi-stream
          sequenceOnce:
            opts.sequenceOnce != null
              ? !!opts.sequenceOnce
              : !!opts.headOnRight,
          pathEase: opts.pathEase ?? (opts.headOnRight || opts.sequenceOnce ? "in" : "out"),
        })
      );
    })
    .catch(() => {});

  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

/** Map thời gian tuyến tính → tiến độ path (0..1). */
function pathProgress(t: number, ease: MeshFx["pathEase"] = "out"): number {
  const u = Math.max(0, Math.min(1, t));
  if (ease === "in") {
    // chậm lúc xuất → tăng tốc về đích
    return Math.pow(u, 2.25);
  }
  if (ease === "inout") {
    return u * u * (3 - 2 * u);
  }
  // out: nhanh đầu, chậm cuối (đạn cũ)
  return 1 - Math.pow(1 - u, 3);
}

function itchFrameUrls(folder: ItchFxFolder, pack: string, n: number): string[] {
  const pad = (i: number) => String(i).padStart(2, "0");
  return Array.from(
    { length: n },
    (_, i) => `assets/fx/itch/${folder}/${pack}/frame_${pad(i + 1)}.png`
  );
}

function boltUrlsForStyle(style: Fx3dStyle, flash?: string): { urls: string[]; w: number; h: number } {
  const f = (flash || "").toLowerCase();
  const br = (pack: string, n: number) => itchFrameUrls("brackeys", pack, n);
  const st = (pack: string, n: number) => itchFrameUrls("stylized", pack, n);
  const sp = (pack: string, n: number) => itchFrameUrls("superpowers", pack, n);
  const cm = (pack: string, n: number) => itchFrameUrls("codemanu", pack, n);

  // Không dùng hyperspeed / lightstreaks làm billboard — đúng là sọc ngang.
  // Kiếm / chém — slash classic ≥24
  if (style === "slash" || f === "white" || f === "steel" || f === "iron") {
    const stem =
      f === "crimson" || f === "red" || f === "gold_red"
        ? "fire_alternative_3_1_alternative_3"
        : f === "blue" || f === "cyan"
          ? "blue_alternative_2_1_alternative_2"
          : f === "purple" || f === "violet"
            ? "purple_alternative_1_1_alternative_1"
            : "classic_classic_1_classic";
    const slashUrls = Array.from(
      { length: 24 },
      (_, i) => `assets/fx/slash/${stem}_${String(i + 1).padStart(2, "0")}.png`
    );
    return { urls: slashUrls, w: 2.35, h: 2.35 };
  }
  // Cung / tiễn / xuyên — mũi tên stylized ≥24 (style pierce ≠ rush)
  if (style === "pierce" || f === "gold_pierce" || f.includes("pierce")) {
    return { urls: st("arrow", 24), w: 2.15, h: 1.6 };
  }
  if (style === "nova" || f === "fire" || f === "fire_rain" || f === "orange" || f === "red_fire")
    return { urls: cm("pixel_fire", 24), w: 2.2, h: 2.2 };
  if (style === "thunder" || f === "thunder" || f === "storm" || f === "electric_blue")
    return { urls: br("storm_burst", 24), w: 2.2, h: 2.2 };
  if (style === "ice" || f === "ice_blue" || f === "ice" || f === "frost")
    return { urls: br("water_wave", 24), w: 2.15, h: 2.15 };
  if (style === "tide" || f === "blue_water" || f === "cyan" || f === "teal" || f === "white_blue")
    return { urls: br("water_wave", 24), w: 2.15, h: 2.15 };
  if (style === "bagua") return { urls: cm("elden_ring", 24), w: 2.3, h: 2.3 };
  // Beam / arcane — sheet theo flash (blue ≠ purple ≠ violet), không chung shadow
  if (style === "beam") {
    if (f === "blue" || f === "cyan" || f === "teal") return { urls: cm("anima", 24), w: 2.15, h: 2.15 };
    if (f === "violet") return { urls: cm("constellation", 24), w: 2.2, h: 2.2 };
    return { urls: sp("sp_magic", 24), w: 2.1, h: 2.1 }; // purple / default
  }
  if (style === "shadow" || f === "purple" || f === "violet")
    return { urls: sp("sp_magic", 24), w: 2.1, h: 2.1 };
  if (style === "poison") return { urls: cm("worm", 24), w: 2.0, h: 2.0 };
  if (style === "rush" || style === "charge") {
    // Đột kích / kỵ xung — muzzle dày (không dùng cho pierce tiễn)
    return { urls: br("muzzle_seq", 24), w: 2.0, h: 2.0 };
  }
  if (style === "roar") return { urls: sp("sp_shock", 24), w: 2.2, h: 2.2 };
  if (style === "whirl") return { urls: cm("vortex", 24), w: 2.15, h: 2.15 };
  if (style === "bless") return { urls: cm("anima", 24), w: 2.0, h: 2.0 };
  // breath: lửa chỉ underlay — silhouette rồng = serpent trong emitDragonSpirit3d
  if (style === "breath") return { urls: cm("dithered_fire", 24), w: 1.4, h: 1.4 };
  // fallback cung/tiễn
  return { urls: st("arrow", 24), w: 2.0, h: 1.55 };
}

/** Profile bay caster → mục tiêu — size/sheet lớn hơn (core game không phèn). */
function flightProfile(style: Fx3dStyle, _flash?: string): {
  durationMs: number;
  arc: number;
  size: number;
  density: number;
  sheetMul: number;
} {
  if (style === "charge") return { durationMs: 420, arc: 0.14, size: 0.48, density: 18, sheetMul: 1.35 };
  if (style === "rush") return { durationMs: 360, arc: 0.22, size: 0.44, density: 17, sheetMul: 1.4 };
  // Tiễn / đâm — thẳng, nhanh, ít cong (khác rush)
  if (style === "pierce") return { durationMs: 380, arc: 0.08, size: 0.4, density: 14, sheetMul: 1.35 };
  if (style === "thunder") return { durationMs: 500, arc: 0.22, size: 0.52, density: 18, sheetMul: 1.4 };
  if (style === "bagua") return { durationMs: 540, arc: 0.18, size: 0.5, density: 12, sheetMul: 1.35 };
  if (style === "ice") return { durationMs: 520, arc: 0.28, size: 0.5, density: 16, sheetMul: 1.4 };
  if (style === "nova") return { durationMs: 560, arc: 0.55, size: 0.58, density: 18, sheetMul: 1.45 };
  if (style === "tide") return { durationMs: 560, arc: 0.5, size: 0.52, density: 17, sheetMul: 1.4 };
  if (style === "poison") return { durationMs: 540, arc: 0.38, size: 0.48, density: 18, sheetMul: 1.35 };
  if (style === "shadow") return { durationMs: 520, arc: 0.34, size: 0.46, density: 16, sheetMul: 1.35 };
  if (style === "beam") return { durationMs: 520, arc: 0.32, size: 0.5, density: 16, sheetMul: 1.4 };
  if (style === "slash") return { durationMs: 440, arc: 0.35, size: 0.48, density: 17, sheetMul: 1.45 };
  if (style === "roar") return { durationMs: 480, arc: 0.3, size: 0.54, density: 16, sheetMul: 1.4 };
  if (style === "whirl") return { durationMs: 500, arc: 0.45, size: 0.5, density: 16, sheetMul: 1.35 };
  if (style === "bless") return { durationMs: 480, arc: 0.4, size: 0.44, density: 14, sheetMul: 1.35 };
  if (style === "breath") return { durationMs: 620, arc: 0.6, size: 0.58, density: 18, sheetMul: 1.5 };
  return { durationMs: 460, arc: 0.35, size: 0.48, density: 16, sheetMul: 1.35 };
}

/**
 * Lớp premium toàn chiêu (non-spirit): CodeManu underlay + Brackeys/Superpowers/SpritePilot.
 * Tối đa ~3 sheet/pha — lớn, đậm, không hộp đen.
 */
function skillPremiumLayers(
  style: Fx3dStyle,
  flash?: string
): { cast: HonLayerRef[]; hit: HonLayerRef[]; flightUnder: string[] } {
  const f = (flash || "").toLowerCase();
  // Soft blob underlay — KHÔNG hyperspeed (sọc ngang cố định)
  const under = itchFrameUrls("codemanu", "impact", 24);
  const fire =
    style === "nova" || f === "fire" || f === "fire_rain" || f === "orange" || f === "red_fire";
  const thunder = f === "thunder" || f === "storm";

  if (style === "barrier") {
    return {
      cast: [
        { folder: "codemanu", pack: "elden_ring", n: 24, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "brackeys", pack: "ward_barrier", n: 24, w: 2.9, h: 2.9, opacity: 0.85 },
      ],
      hit: [],
      flightUnder: under,
    };
  }
  if (style === "bless") {
    return {
      cast: [
        { folder: "codemanu", pack: "elden_ring", n: 24, w: 2.4, h: 2.4, opacity: 0.75 },
      ],
      hit: [
        { folder: "codemanu", pack: "puff_stars", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "superpowers", pack: "sp_heal", n: 24, w: 2.4, h: 2.4, opacity: 0.95 },
      ],
      flightUnder: itchFrameUrls("codemanu", "elden_ring", 24),
    };
  }
  if (style === "slash") {
    return {
      cast: [
        { folder: "brackeys", pack: "hit_burst", n: 24, w: 2.2, h: 2.2, opacity: 0.72 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.0, h: 2.0, opacity: 0.85 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 24, w: 3.5, h: 3.5, opacity: 0.96 },
        { folder: "codemanu", pack: "impact", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
        { folder: "superpowers", pack: "sp_hit", n: 24, w: 2.7, h: 2.7, opacity: 0.98 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.5, h: 2.5, opacity: 0.95 },
      ],
      flightUnder: under,
    };
  }
  if (fire) {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "dithered_fire", n: 24, w: 2.7, h: 2.7, opacity: 0.8 },
        { folder: "brackeys", pack: "ember_burst", n: 24, w: 2.5, h: 2.5, opacity: 0.72 },
      ],
      hit: [
        { folder: "codemanu", pack: "explosion", n: 24, w: 3.6, h: 3.6, opacity: 0.95 },
        { folder: "codemanu", pack: "kabooms", n: 24, w: 3.0, h: 3.0, opacity: 0.85 },
        { folder: "brackeys", pack: "explosion_burst", n: 24, w: 2.8, h: 2.8, opacity: 0.78 },
      ],
      flightUnder: itchFrameUrls("codemanu", "pixel_fire", 24),
    };
  }
  if (style === "thunder" || thunder) {
    return {
      cast: [
        { folder: "codemanu", pack: "electric_shield", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "brackeys", pack: "storm_burst", n: 24, w: 2.7, h: 2.7, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 24, w: 3.4, h: 3.4, opacity: 0.95 },
        { folder: "brackeys", pack: "storm_burst", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.6, h: 2.6, opacity: 0.98 },
      ],
      flightUnder: under,
    };
  }
  if (style === "bagua") {
    return {
      cast: [
        { folder: "codemanu", pack: "elden_ring", n: 24, w: 3.2, h: 3.2, opacity: 0.92 },
        { folder: "codemanu", pack: "constellation", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "elden_ring", n: 24, w: 3.4, h: 3.4, opacity: 0.9 },
        { folder: "brackeys", pack: "arcane_burst", n: 24, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.4, h: 2.4, opacity: 0.9 },
      ],
      flightUnder: itchFrameUrls("codemanu", "elden_ring", 24),
    };
  }
  if (style === "pierce") {
    return {
      cast: [
        { folder: "brackeys", pack: "hit_burst", n: 24, w: 2.0, h: 2.0, opacity: 0.7 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 1.8, h: 1.8, opacity: 0.85 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 24, w: 2.8, h: 2.8, opacity: 0.9 },
        { folder: "stylized", pack: "arrow", n: 24, w: 2.2, h: 1.5, opacity: 0.88 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.3, h: 2.3, opacity: 0.95 },
      ],
      flightUnder: under,
    };
  }
  if (style === "ice") {
    return {
      cast: [
        { folder: "codemanu", pack: "anima", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "brackeys", pack: "water_wave", n: 24, w: 2.8, h: 2.8, opacity: 0.85 },
      ],
      hit: [
        { folder: "spritepilot", pack: "water_splash", n: 24, w: 3.2, h: 3.2, opacity: 0.95 },
        { folder: "brackeys", pack: "water_wave", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "codemanu", pack: "impact", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
      ],
      flightUnder: itchFrameUrls("brackeys", "water_wave", 24),
    };
  }
  if (style === "tide") {
    return {
      cast: [
        { folder: "codemanu", pack: "anima", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "brackeys", pack: "water_wave", n: 24, w: 2.7, h: 2.7, opacity: 0.82 },
      ],
      hit: [
        { folder: "spritepilot", pack: "water_splash", n: 24, w: 3.2, h: 3.2, opacity: 0.95 },
        { folder: "brackeys", pack: "water_wave", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "impact", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
      ],
      flightUnder: itchFrameUrls("brackeys", "water_wave", 24),
    };
  }
  if (style === "poison") {
    return {
      cast: [
        { folder: "codemanu", pack: "tentacles", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "worm", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 24, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "codemanu", pack: "puff_stars", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
        { folder: "spritepilot", pack: "smoke_puff", n: 24, w: 2.5, h: 2.5, opacity: 0.85 },
      ],
      flightUnder: itchFrameUrls("codemanu", "worm", 24),
    };
  }
  if (style === "shadow") {
    return {
      cast: [
        { folder: "codemanu", pack: "vortex", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "brackeys", pack: "shadow_burst", n: 24, w: 2.7, h: 2.7, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 24, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "brackeys", pack: "shadow_burst", n: 24, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "codemanu", pack: "vortex", n: 24, w: 2.5, h: 2.5, opacity: 0.7 },
      ],
      flightUnder: under,
    };
  }
  if (style === "beam") {
    // Arcane — flash blue dùng anima; purple/violet dùng constellation + magic
    const blue = f === "blue" || f === "cyan" || f === "teal";
    const violet = f === "violet";
    return {
      cast: blue
        ? [
            { folder: "codemanu", pack: "anima", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
            { folder: "codemanu", pack: "charged", n: 24, w: 2.6, h: 2.6, opacity: 0.75 },
          ]
        : violet
          ? [
              { folder: "codemanu", pack: "constellation", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
              { folder: "codemanu", pack: "anima", n: 24, w: 2.5, h: 2.5, opacity: 0.72 },
            ]
          : [
              { folder: "codemanu", pack: "charged", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
              { folder: "codemanu", pack: "constellation", n: 24, w: 2.8, h: 2.8, opacity: 0.82 },
              { folder: "codemanu", pack: "anima", n: 24, w: 2.5, h: 2.5, opacity: 0.72 },
            ],
      hit: [
        { folder: "codemanu", pack: "anima", n: 24, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "brackeys", pack: "arcane_burst", n: 24, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "superpowers", pack: "sp_magic", n: 24, w: 2.6, h: 2.6, opacity: 0.96 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.4, h: 2.4, opacity: 0.9 },
      ],
      flightUnder: blue ? itchFrameUrls("codemanu", "anima", 24) : under,
    };
  }
  if (style === "roar") {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 24, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "superpowers", pack: "sp_shock", n: 24, w: 2.7, h: 2.7, opacity: 0.78 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 24, w: 3.5, h: 3.5, opacity: 0.95 },
        { folder: "superpowers", pack: "sp_shock", n: 24, w: 2.9, h: 2.9, opacity: 0.9 },
        { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.5, h: 2.5, opacity: 0.95 },
      ],
      flightUnder: under,
    };
  }
  if (style === "whirl") {
    return {
      cast: [
        { folder: "codemanu", pack: "wheel", n: 24, w: 3.1, h: 3.1, opacity: 0.9 },
        { folder: "codemanu", pack: "vortex", n: 24, w: 2.8, h: 2.8, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "wheel", n: 24, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "codemanu", pack: "big_hit", n: 24, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "spritepilot", pack: "landing_dust", n: 24, w: 2.6, h: 1.5, opacity: 0.88 },
      ],
      flightUnder: itchFrameUrls("codemanu", "vortex", 24),
    };
  }
  if (style === "rush" || style === "charge") {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 24, w: 2.9, h: 2.9, opacity: 0.88 },
        { folder: "brackeys", pack: "earth_burst", n: 24, w: 2.6, h: 2.6, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 24, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "brackeys", pack: "earth_burst", n: 24, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "spritepilot", pack: "landing_dust", n: 24, w: 2.8, h: 1.6, opacity: 0.9 },
      ],
      flightUnder: under,
    };
  }
  // fallback generic combat
  return {
    cast: [
      { folder: "codemanu", pack: "charged", n: 24, w: 2.8, h: 2.8, opacity: 0.88 },
      { folder: "brackeys", pack: "hit_burst", n: 24, w: 2.5, h: 2.5, opacity: 0.78 },
    ],
    hit: [
      { folder: "codemanu", pack: "explosion2", n: 24, w: 3.3, h: 3.3, opacity: 0.92 },
      { folder: "codemanu", pack: "impact", n: 24, w: 2.9, h: 2.9, opacity: 0.82 },
      { folder: "spritepilot", pack: "hit_spark", n: 24, w: 2.5, h: 2.5, opacity: 0.95 },
    ],
    flightUnder: under,
  };
}

function emitPremiumLayersAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  layers: HonLayerRef[],
  opts: { scale?: string | null; durationMs?: number; color?: number; y0?: number } = {}
): Fx3dHandle[] {
  const out: Fx3dHandle[] = [];
  const mul = scaleMul(opts.scale);
  layers.forEach((ref, i) => {
    out.push(
      emitItchFolderPackAt(scene, at, ref.folder, ref.pack, ref.n, {
        durationMs: (opts.durationMs ?? 520) + i * 40,
        w: (ref.w ?? 2.8) * mul,
        h: (ref.h ?? 2.8) * mul,
        opacity: ref.opacity ?? 0.88,
        y: (opts.y0 ?? 0.32) + i * 0.1,
        delayMs: i * 30,
        color: opts.color ?? 0xffffff,
        scale: opts.scale,
        spin: i === 0,
      })
    );
  });
  return out;
}

/**
 * Đầu đạn đầy đủ: core + sheet element + underlay CodeManu + trail dày.
 * Gọi cho mọi chiêu có đích (địch / đồng minh), trừ barrier / hồn GLB.
 */
function emitHostileProjectile3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  style: Fx3dStyle,
  flash: string,
  scale?: string | null,
  pattern?: string | null,
  durationOverrideMs?: number
): Fx3dHandle[] {
  const handles: Fx3dHandle[] = [];
  const prof = flightProfile(style, flash);
  const tune = patternFlightTune(pattern);
  const durationMs = durationOverrideMs ?? prof.durationMs + tune.flightExtraMs;
  const arc = prof.arc * tune.arcMul;
  const bolt = boltUrlsForStyle(style, flash);
  const premium = skillPremiumLayers(style, flash);
  // Beam: tint sheet theo flash; pierce/slash giữ trắng
  const sheetTint =
    style === "beam" ? flashPalette(flash).base.getHex() : style === "ice" ? 0xbae6fd : 0xffffff;
  const sizeMul =
    String(pattern || "").toLowerCase() === "all" || String(pattern || "").toLowerCase() === "ally_all"
      ? 1.18
      : String(pattern || "").toLowerCase() === "row" || String(pattern || "").toLowerCase() === "front_row"
        ? 1.08
        : 1;
  // Flight = underlay + main bay path (≤2). Trail do stylePlay. Không core đứng hình.
  handles.push(
    emitFlyingSheet3d(scene, from, to, premium.flightUnder, {
      durationMs,
      w: bolt.w * prof.sheetMul * 1.12 * sizeMul,
      h: bolt.h * prof.sheetMul * 1.12 * sizeMul,
      arc,
      scale,
      color: sheetTint,
      frameMs: Math.max(28, Math.floor(durationMs / 24)),
      yLift: 0.95,
    })
  );
  handles.push(
    emitFlyingSheet3d(scene, from, to, bolt.urls, {
      durationMs,
      w: bolt.w * prof.sheetMul * sizeMul,
      h: bolt.h * prof.sheetMul * sizeMul,
      arc: arc * 1.02,
      scale,
      color: sheetTint,
      frameMs: Math.max(24, Math.floor(durationMs / 26)),
      yLift: 1.08,
    })
  );
  return handles;
}

/**
 * Hồn = đầu + thân silhouette bay path (sheet CC0) → dissolve tại hit.
 * hon_rong/hoa_long: serpent đặc = hình rồng; dragon_* chỉ outline phụ.
 */
export function emitDragonSpirit3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: {
    durationMs?: number;
    scale?: string | null;
    arc?: number;
    side?: number;
    size?: number;
    delayMs?: number;
    headOnly?: boolean;
    opacity?: number;
    formMs?: number;
    dissolveMs?: number;
    pack?: HonPackId;
    skillId?: string | null;
    emissive?: number;
    tintStrength?: number;
    /** in = bay nhanh dần (mặc định hồn) */
    pathEase?: "in" | "out" | "inout";
  } = {}
): Fx3dHandle {
  const packId = opts.pack || "hon_rong";
  const pack = HON_PACKS[packId];
  const softMul = opts.scale === "L" ? 1.15 : opts.scale === "S" ? 0.9 : 1;
  const formMs = opts.formMs ?? 0;
  const flightMs = opts.durationMs ?? 520;
  const pathEase = opts.pathEase ?? "in";
  const dissolveMs = opts.dissolveMs ?? 280;
  const lifeMs = formMs + flightMs + dissolveMs;
  const delayMs = opts.delayMs ?? 0;
  const isDragon = packId === "hon_rong";
  // Rồng phải ĐỌC ĐƯỢC — size lớn hơn pack khác (skillFxLibrary dùng ~2.85)
  const size = isDragon
    ? Math.min(3.1, Math.max(2.4, (opts.size ?? 2.7) * softMul))
    : Math.min(1.85, Math.max(1.15, (opts.size ?? 1.45) * softMul));
  const opacity = opts.opacity ?? 1;
  const tint = opts.emissive ?? pack.tint;
  const sheets = resolveHonStreamSheets(packId, opts.skillId);
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];
  const bodyCount = opts.headOnly ? 0 : isDragon ? 5 : (packId === "hon_soi" || packId === "hon_ho") ? 0 : 4;

  const start = () => {
    if (cancelled.v || !scene) return;
    void Promise.all([
      loadFrameSet(sheets.head),
      loadFrameSet(sheets.body),
      loadFrameSet(sheets.outline),
      loadFrameSet(sheets.mist),
    ])
      .then(([headFrames, bodyFrames, outlineFrames, mistFrames]) => {
        if (cancelled.v || !scene) return;
        if (!headFrames.length && !bodyFrames.length) {
          console.warn("[hon-qi] thiếu sheet silhouette", packId, sheets.head[0]);
          return;
        }
        const group = new THREE.Group();
        group.name = "fx3d-hon-qi";
        group.renderOrder = 90;
        const segments: THREE.Object3D[] = [];

        // ĐẦU — qi_fire / qi_tiger flight = wide; serpent = vuông
        const headMap = headFrames[0] || bodyFrames[0];
        const isTiger = packId === "hon_ho" || packId === "hon_soi";
        const wideFlight = (isDragon || isTiger) && sheets.charge.length > 0;
        const headW = isTiger ? size * 2.0 : wideFlight ? size * 1.55 : size;
        const headH = isTiger ? size * 1.0 : wideFlight ? size * 0.78 : size * 0.95;
        const headSpr = makeFxSprite(
          headMap,
          wideFlight ? 0xffffff : tint,
          Math.min(1, opacity * 1.05),
          headW,
          headH
        );
        headSpr.userData.role = "head";
        headSpr.userData.segIndex = 0;
        headSpr.userData.baseW = headW;
        headSpr.userData.baseH = headH;
        headSpr.renderOrder = 95;
        group.add(headSpr);
        segments.push(headSpr);

        // Outline Nineball (mỏng) — scale lớn hơn đầu, chỉ phụ
        if (outlineFrames.length) {
          const ow = size * 1.25;
          const outline = makeFxSprite(outlineFrames[0], 0xffe8a0, 0.95, ow, ow, {
            blending: THREE.AdditiveBlending,
          });
          outline.userData.role = "outline";
          outline.userData.segIndex = 0;
          outline.userData.baseW = ow;
          outline.userData.baseH = ow;
          outline.userData.outlineFrames = outlineFrames;
          outline.renderOrder = 96;
          group.add(outline);
          segments.push(outline);
        }

        // THÂN — chuỗi serpent lệch pha trên path
        for (let i = 0; i < bodyCount; i++) {
          const frames = bodyFrames.length ? bodyFrames : headFrames;
          if (!frames.length) break;
          const fi = (i + 1) % frames.length;
          const fall = 1 - i / Math.max(1, bodyCount);
          const bodyTint = new THREE.Color(tint).lerp(new THREE.Color(0xfff0c8), 0.15 * (1 - fall)).getHex();
          const bw = size * (0.88 - i * 0.1);
          const spr = makeFxSprite(frames[fi], bodyTint, opacity * (0.95 - i * 0.08), bw, bw * 0.88);
          spr.userData.role = "body";
          spr.userData.segIndex = i + 1;
          spr.userData.baseW = bw;
          spr.userData.baseH = bw * 0.88;
          spr.renderOrder = 94 - i;
          group.add(spr);
          segments.push(spr);
        }

        // Mist phụ mỏng — không thay silhouette
        for (let i = 0; i < Math.min(1, mistFrames.length); i++) {
          const mw = size * 0.7;
          const mist = makeFxSprite(mistFrames[i], tint, 0.35, mw * 1.1, mw * 0.65);
          mist.userData.role = "mist";
          mist.userData.segIndex = bodyCount + 2;
          mist.userData.baseW = mw * 1.1;
          mist.userData.baseH = mw * 0.65;
          mist.renderOrder = 88;
          group.add(mist);
          segments.push(mist);
        }

        group.position.copy(from);
        group.position.y += 0.55;
        const facing = spiritFacing(from, to);
        const now = performance.now();
        handles.push(
          pushMesh(scene, {
            id: nextId++,
            obj: group,
            until: now + lifeMs + 40,
            kind: "spirit",
            born: now,
            lifeMs,
            from: from.clone(),
            to: to.clone(),
            arc: opts.arc ?? (isDragon ? 0.55 : 0.42),
            side: opts.side ?? 0.06,
            formMs,
            flightDelayMs: formMs,
            flightMs,
            dissolveMs,
            facing,
            pathEase,
            segments,
            segSpacing: isDragon ? 0.09 : 0.07,
            baseScale: 1,
            baseOpacity: opacity,
            mesh3d: false,
            yawOffset: pack.yawOffset,
            frames: headFrames.length ? headFrames : bodyFrames,
            frameI: 0,
            nextFrame: now + 55,
            frameMs: 55,
            spriteMat: headSpr.material as THREE.SpriteMaterial,
            altMats: outlineFrames.length
              ? [((segments.find((s) => (s as THREE.Sprite).userData?.role === "outline") as THREE.Sprite)
                  ?.material as THREE.SpriteMaterial)]
              : undefined,
            altFrames: outlineFrames.length ? [outlineFrames] : undefined,
          })
        );
      })
      .catch((err) => {
        console.warn("[hon-qi] sheet load failed", packId, sheets.head[0], err);
      });
  };

  if (delayMs > 0) {
    const tid = trackTimer(delayMs, start);
    return {
      cancel() {
        cancelled.v = true;
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
        handles.forEach((h) => h.cancel());
      },
    };
  }
  start();
  return {
    cancel() {
      cancelled.v = true;
      handles.forEach((h) => h.cancel());
    },
  };
}

/**
 * Chuỗi Hồn combat — charge → flight (đầu dẫn) → impact bùm.
 * bagua / linh hồn người: pipeline riêng (không ném bolt).
 */
export function emitHonSpiritSequence3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: {
    scale?: string | null;
    pack?: HonPackId;
    skillId?: string | null;
    pattern?: string | null;
    /** Mục tiêu đội hình — bagua phủ hết */
    targets?: THREE.Vector3[];
    /** Hồn hỗ trợ — ally hiện hồn; không thì địch bị sét */
    support?: boolean;
  } = {}
): Fx3dHandle {
  const packId = opts.pack || "hon_rong";
  if (packId === "hon_bagua") {
    return emitBaguaFormationSequence3d(scene, from, to, {
      scale: opts.scale,
      skillId: opts.skillId,
      pattern: opts.pattern,
      targets: opts.targets,
    });
  }
  if (packId === "hon_hon") {
    return emitSoulMageSequence3d(scene, from, to, {
      scale: opts.scale,
      skillId: opts.skillId,
      pattern: opts.pattern,
      targets: opts.targets,
      support: opts.support,
    });
  }
  const pack = HON_PACKS[packId];
  const layers = honElementLayers(packId);
  const variant = resolveHonCombatVariant(packId, opts.skillId);
  const streamSheets = resolveHonStreamSheets(packId, opts.skillId);
  const qiStream = streamSheets.charge.length > 0 && streamSheets.head.length > 0;
  const tune = patternFlightTune(opts.pattern);
  const tl = honCombatTimeline(opts.pattern, { qiStream, scale: opts.scale, pack: packId });
  const tint = variant.tint;
  const tintHot = new THREE.Color(tint).lerp(new THREE.Color(0xfffbeb), variant.hot ? 0.32 : 0.42).getHex();
  const tintDeep = new THREE.Color(tint).multiplyScalar(0.65).getHex();
  const sheetMul = (opts.scale === "L" ? 1.08 : opts.scale === "S" ? 0.85 : 1) * (qiStream ? 1 : 0.78);
  const CHARGE_MS = tl.chargeMs;
  const FORM_MS = tl.formMs;
  const FLIGHT_MS = tl.flightMs;
  const DISSOLVE_MS = tl.dissolveMs;
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const cancelled = { v: false };
  const ground = from.clone();
  ground.y = Math.min(from.y, 0.12);
  const isTiger = packId === "hon_ho" || packId === "hon_soi";
  const flightArc = isTiger ? 0.22 : (qiStream ? 0.55 : 0.42) * variant.arcMul * tune.arcMul;
  const flightSide = isTiger ? 0.02 : tune.side;
  // Tỷ lệ chuẩn 2:1 cho hổ/sói (384x192), cao 1.3 cân đối với tướng ~1.28
  const flightW = packId === "hon_rong" ? 3.6 : isTiger ? 2.6 : 3.4;
  const flightH = packId === "hon_rong" ? 1.85 : isTiger ? 1.3 : 1.7;
  const headLead = isTiger ? 0.28 : 0.38;

  const pushLayer = (at: THREE.Vector3, ref: HonLayerRef, extra: ItchSheetOpts = {}) => {
    handles.push(
      emitItchFolderPackAt(scene, at, ref.folder, ref.pack, ref.n, {
        durationMs: extra.durationMs ?? CHARGE_MS,
        w: (ref.w ?? 2.2) * sheetMul,
        h: (ref.h ?? 2.2) * sheetMul,
        opacity: ref.opacity ?? 0.8,
        y: extra.y ?? 0.32,
        delayMs: extra.delayMs,
        color: extra.color ?? tint,
        scale: opts.scale,
        spin: extra.spin,
      })
    );
  };

  const start = () => {
    if (cancelled.v || !scene) return;
    void Promise.all([
      loadFrameSet(pack.ring),
      loadFrameSet(pack.crescent),
      loadFrameSet(pack.sparkle),
      pack.orb ? loadFxTex(pack.orb).catch(() => null) : Promise.resolve(null),
      streamSheets.charge.length ? loadFrameSet(streamSheets.charge) : Promise.resolve([]),
    ]).then(([rings, crescents, sparkles, orbG, chargeFrames]) => {
      if (cancelled.v || !scene) return;

      // 1) TỤ LỰ — Trận pháp sigil dưới chân + aura quanh thân + linh hồn ngưng tụ (không xoay hình thú bẹp trên sàn)
      if (qiStream) {
        handles.push(
          emitGroundSigil3d(scene, ground, {
            flash: pack.flash,
            scale: opts.scale,
            durationMs: CHARGE_MS + 40,
            color: tint,
          })
        );
        handles.push(
          emitShockwave3d(scene, ground, {
            flash: pack.flash,
            scale: opts.scale,
            radius: 1.65 * sheetMul,
            durationMs: CHARGE_MS,
          })
        );
        handles.push(
          emitBodyAura3d(scene, from, {
            flash: pack.flash,
            scale: opts.scale,
            durationMs: CHARGE_MS + 60,
            color: tintHot,
            pack: packId === "hon_loi" ? "electric_shield" : packId === "hon_phong" ? "vortex" : "charged",
          })
        );
        // Không spawn hình con hổ tĩnh tại caster để tránh bị chồng 2 con hổ
        if (chargeFrames.length && !isTiger) {
          handles.push(
            emitHonSheetAt(scene, from, chargeFrames, {
              durationMs: CHARGE_MS + 40,
              w: 2.3 * sheetMul,
              h: 1.5 * sheetMul,
              opacity: 0.88,
              y: 0.72,
              color: tintHot,
            })
          );
        }
      } else {
        handles.push(
          emitGroundSigil3d(scene, ground, {
            flash: pack.flash,
            scale: opts.scale,
            durationMs: CHARGE_MS + FORM_MS,
            color: tint,
          })
        );
        layers.charge.slice(0, 2).forEach((ref, i) => {
          pushLayer(i === 0 ? ground : from, ref, {
            durationMs: CHARGE_MS + FORM_MS * 0.6,
            y: i === 0 ? 0.04 : 0.35 + i * 0.1,
            delayMs: i * 28,
            color: i === 0 ? tint : tintHot,
            spin: i === 0,
          });
        });
        if (rings.length) {
          handles.push(
            emitHonSheetAt(scene, ground, rings, {
              durationMs: CHARGE_MS + FORM_MS,
              w: 2.2 * sheetMul,
              h: 1.2 * sheetMul,
              opacity: 0.75,
              spin: true,
              spinSpeed: 3.2,
              y: 0.03,
              color: tint,
            })
          );
        }
        if (crescents.length) {
          handles.push(
            emitHonSheetAt(scene, ground, crescents, {
              durationMs: CHARGE_MS + 60,
              w: 1.8 * sheetMul,
              h: 1.0 * sheetMul,
              opacity: 0.65,
              spin: true,
              spinSpeed: -3.4,
              y: 0.06,
              delayMs: 30,
              color: tintDeep,
            })
          );
        }
        handles.push(
          emitBodyAura3d(scene, from, {
            flash: pack.flash,
            scale: opts.scale,
            durationMs: CHARGE_MS + FORM_MS,
            color: tintHot,
            pack: packId === "hon_loi" ? "electric_shield" : packId === "hon_phong" ? "vortex" : "charged",
          })
        );
      }
      if (sparkles.length && !qiStream) {
        handles.push(
          emitHonSheetAt(scene, from, sparkles, {
            durationMs: CHARGE_MS + 40,
            w: 1.5 * sheetMul,
            h: 1.5 * sheetMul,
            opacity: 0.85,
            y: 0.42,
            color: tintHot,
          })
        );
      }

      // 2–3) BAY — qiStream: 1 silhouette đầu dẫn; fallback spirit cũ
      const formAt = qiStream ? CHARGE_MS : Math.round(CHARGE_MS * 0.45);
      timers.push(
        trackTimer(formAt, () => {
          if (cancelled.v || !scene) return;
          if (!qiStream) {
            layers.form.slice(0, 2).forEach((ref, i) => {
              pushLayer(from, ref, {
                durationMs: FORM_MS + 80,
                y: 0.4 + i * 0.1,
                delayMs: i * 30,
                color: tintHot,
                spin: true,
              });
            });
          }
          if (qiStream) {
            const face = spiritFacing(from, to);
            // Sân: ta +X (phải) / địch −X (trái).
            // Bộ frame flight_*.png đầu quay sang PHẢI (địch đánh ta, bay về +X).
            // Bộ frame flight_left_*.png đầu quay sang TRÁI (ta đánh địch, bay về −X).
            const isFlippedHead = face < 0;
            let beastFolder = QI_PACK_FOLDERS[packId];
            if (packId === "hon_rong") {
              const sid = opts.skillId || "";
              if (/thanh_long|thuong_long/.test(sid)) beastFolder = "skill/rong/qi_azure";
              else if (/bach_long|ngan_long/.test(sid)) beastFolder = "skill/rong/qi_ivory";
              else beastFolder = "skill/rong/qi_fire";
            }
            const headFrames = isFlippedHead
              ? qiSeq(beastFolder, "flight_left", 24)
              : (packId === "hon_rong" ? qiSeq(beastFolder, "flight", 24) : streamSheets.head);

            // Linh thú bay theo đường đạn 3D (sprite bay in-place + Three.js tịnh tiến mượt)
            handles.push(
              emitFlyingSheet3d(scene, from, to, headFrames, {
                durationMs: FLIGHT_MS,
                w: flightW,
                h: flightH,
                arc: flightArc,
                scale: opts.scale,
                color: 0xffffff,
                yLift: isTiger ? 0.68 : 0.95,
                opacity: 1,
                headOnRight: !isFlippedHead,
                preFlipped: isFlippedHead,
                headLeadFrac: headLead,
                sequenceOnce: true,
                pathEase: isTiger ? "inout" : "in", // hổ: phi nước đại đều mượt thấy rõ bước chân, không vọt 300ms cuối
                noPitch: isTiger, // hổ 4 chân luôn hướng đất vững chãi, không bị cắm đầu 45 độ
                noPulse: isTiger, // không bị rung phập phồng co bóp
              })
            );
            // Dải hạt khí thế đuôi linh thú — hổ giảm mật độ để không che khuất móng vuốt và thân
            handles.push(
              emitTrail3d(scene, from, to, {
                flash: pack.flash,
                durationMs: FLIGHT_MS,
                density: isTiger ? 4 : Math.round(18 * tune.densityMul),
                arc: flightArc * 0.95,
                scale: opts.scale,
                streak: !isTiger,
              })
            );
          } else {
            handles.push(
              emitDragonSpirit3d(scene, from, to, {
                durationMs: FLIGHT_MS,
                formMs: FORM_MS,
                dissolveMs: DISSOLVE_MS,
                scale: opts.scale,
                arc: flightArc,
                side: flightSide,
                size: packId === "hon_rong" ? 2.75 : variant.size,
                pack: packId,
                skillId: opts.skillId,
                emissive: variant.tint,
                tintStrength: variant.tintStrength,
                pathEase: "in",
              })
            );
            handles.push(
              emitFlyingSheet3d(scene, from, to, layers.flight.urls, {
                durationMs: FORM_MS + FLIGHT_MS,
                w: layers.flight.w * 0.85,
                h: layers.flight.h * 0.85,
                arc: flightArc * 0.95,
                scale: opts.scale,
                color: tintHot,
                frameMs: 42,
                yLift: 0.75,
                pathEase: "in",
              })
            );
            handles.push(
              emitTrail3d(scene, from, to, {
                flash: pack.flash,
                durationMs: FORM_MS + FLIGHT_MS,
                density: Math.round(14 * tune.densityMul),
                arc: flightArc * 0.92,
                scale: opts.scale,
                streak: true,
              })
            );
          }
        })
      );

      // 5–7) Impact — qiStream: bùm đúng lúc đầu chạm
      const hitAt = qiStream
        ? formAt + FLIGHT_MS - 35
        : formAt + FORM_MS + FLIGHT_MS - 30;
      timers.push(
        trackTimer(hitAt, () => {
          if (cancelled.v || !scene) return;
          const hit = to.clone();
          hit.y += 0.18;
          // Flash đĩa chớp sáng cực đại tại đích
          handles.push(emitFlashDisc3d(scene, hit, pack.flash, opts.scale));
          // Vòng shockwave nổ lan tỏa trên mặt đất
          handles.push(
            emitShockwave3d(scene, hit, {
              flash: pack.flash,
              scale: opts.scale,
              radius: 2.8 * sheetMul,
              durationMs: 400,
            })
          );
          // Chiêu lôi — thêm sét dọc màu đúng skill (khí thế)
          if (packId === "hon_loi") {
            handles.push(
              emitColoredThunderStrike3d(scene, to, {
                skillId: opts.skillId,
                scale: opts.scale,
              })
            );
          }
          if (qiStream && streamSheets.impact.length) {
            void loadFrameSet(streamSheets.impact).then((frames) => {
              if (cancelled.v || !scene || !frames.length) return;
              handles.push(
                emitHonSheetAt(scene, hit, frames, {
                  durationMs: 420,
                  w: 3.6,
                  h: 3.6,
                  opacity: 0.98,
                  y: 0.2,
                  color: 0xffffff,
                })
              );
            });
          }
          layers.hit.slice(0, 3).forEach((ref, i) => {
            pushLayer(hit, ref, {
              durationMs: 320 + i * 30,
              y: 0.18 + i * 0.07,
              delayMs: i * 24,
              color: i === 0 ? 0xffffff : tintHot,
            });
          });
          if (orbG) {
            const orbSpr = makeFxSprite(orbG, tintHot, 0.95, 0.55 * sheetMul, 0.55 * sheetMul);
            orbSpr.position.copy(hit);
            const now = performance.now();
            handles.push(
              pushMesh(scene, {
                id: nextId++,
                obj: orbSpr,
                until: now + 280,
                kind: "flash",
                born: now,
                lifeMs: 280,
                spriteMat: orbSpr.material as THREE.SpriteMaterial,
                baseOpacity: 0.95,
              })
            );
          }
          if (sparkles.length) {
            handles.push(
              emitHonSheetAt(scene, hit, sparkles.slice(2), {
                durationMs: 280,
                w: 2.0 * sheetMul,
                h: 2.0 * sheetMul,
                opacity: 0.88,
                y: 0.08,
                color: tintHot,
              })
            );
          }
          handles.push(emitBurst3d(scene, to, pack.flash, opts.scale));
          handles.push(emitSparksBurst3d(scene, to, { flash: pack.flash, scale: opts.scale }));
          handles.push(
            emitGroundMark3d(scene, to, {
              flash: pack.flash,
              scale: opts.scale,
              durationMs: 520,
              color: tintDeep,
            })
          );
          handles.push(emitDust3d(scene, to, opts.scale));
          // Poison / phong: mist residual rõ hơn
          handles.push(
            emitResidual3d(scene, to, {
              flash: pack.flash,
              scale: opts.scale,
              delayMs: packId === "hon_xa" ? 40 : 80,
              color: tintDeep,
            })
          );
        })
      );
    });
  };

  start();
  return {
    cancel() {
      cancelled.v = true;
      timers.forEach((tid) => {
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      });
      handles.forEach((h) => h.cancel());
    },
  };
}

/** @deprecated dùng emitHonSpiritSequence3d({ pack: 'hon_rong' }) */
export function emitHonRongSequence3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: { scale?: string | null } = {}
): Fx3dHandle {
  return emitHonSpiritSequence3d(scene, from, to, { ...opts, pack: "hon_rong" });
}

/** Impact / muzzle flash — brief bright disc + points. */
function emitFlashDisc3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash?: string,
  scale?: string | null
): Fx3dHandle {
  const mul = scaleMul(scale);
  const pal = flashPalette(flash);
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.35 * mul, 24),
    new THREE.MeshBasicMaterial({
      color: pal.hot,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  mesh.position.copy(at);
  mesh.lookAt(at.x, at.y + 1, at.z);
  mesh.renderOrder = 56;
  const now = performance.now();
  return pushMesh(scene, {
    id: nextId++,
    obj: mesh,
    until: now + 220,
    kind: "flash",
    born: now,
    lifeMs: 220,
  });
}

export function emitBurst3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash?: string,
  scale: "S" | "M" | "L" | string | null = "M"
): Fx3dHandle {
  const mul = scaleMul(scale);
  const pal = flashPalette(flash);
  const count = Math.round(64 * mul);
  const { points, geom } = makePoints(count, true, 0.42 * mul);
  const particles = allocParticles(count);
  const now = performance.now();

  for (let i = 0; i < count; i++) {
    const p = particles[i];
    p.alive = true;
    p.pos.copy(at);
    p.pos.y += 0.2;
    const theta = Math.random() * Math.PI * 2;
    const elev = Math.random() * Math.PI * 0.55;
    const sp = (1.6 + Math.random() * 2.4) * mul;
    p.vel.set(Math.cos(theta) * Math.sin(elev) * sp, Math.cos(elev) * sp * 0.95 + 0.3, Math.sin(theta) * Math.sin(elev) * sp);
    p.life = 0;
    p.maxLife = 0.35 + Math.random() * 0.4;
    p.size = 0.22 * mul * (0.7 + Math.random());
    // core vs spark color
    p.color.copy(i % 3 === 0 ? pal.hot : i % 3 === 1 ? pal.base : pal.cool);
  }

  const handles = [
    pushEmit(scene, {
      id: nextId++,
      particles,
      points,
      geom,
      until: now + 700,
      kind: "burst",
      gravity: 4.5,
      drag: 2.2,
    }),
    emitFlashDisc3d(scene, at, flash, scale),
  ];
  return {
    cancel() {
      handles.forEach((h) => h.cancel());
    },
  };
}

export function emitDust3d(
  scene: THREE.Scene,
  at: THREE.Vector3,
  scale: "S" | "M" | "L" | string | null = "M"
): Fx3dHandle {
  const mul = scaleMul(scale);
  const count = Math.round(36 * mul);
  const { points, geom } = makePoints(count, false, 0.38 * mul);
  const particles = allocParticles(count);
  const tint = new THREE.Color(0xc4a882);
  const cool = new THREE.Color(0x8b7355);
  const foot = at.clone();
  foot.y = 0.1;
  const now = performance.now();
  for (let i = 0; i < count; i++) {
    const p = particles[i];
    p.alive = true;
    p.pos.copy(foot);
    const a = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 1.1;
    p.vel.set(Math.cos(a) * r, 0.55 + Math.random() * 1.3, Math.sin(a) * r);
    p.life = 0;
    p.maxLife = 0.5 + Math.random() * 0.4;
    p.size = 0.28 * mul * (0.8 + Math.random());
    p.color.copy(Math.random() > 0.4 ? tint : cool);
  }
  return pushEmit(scene, {
    id: nextId++,
    particles,
    points,
    geom,
    until: now + 800,
    kind: "dust",
    gravity: 5.5,
    drag: 1.6,
  });
}

export function emitTrail3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: {
    flash?: string;
    durationMs?: number;
    density?: number;
    arc?: number;
    scale?: string | null;
    streak?: boolean;
  } = {}
): Fx3dHandle {
  const durationMs = opts.durationMs ?? 520;
  const density = opts.density ?? 8;
  const arc = opts.arc ?? 0.45;
  const mul = scaleMul(opts.scale);
  const capacity = Math.min(320, Math.round((durationMs / 12) * density * mul));
  const { points, geom } = makePoints(capacity, true, 0.38 * mul, !!opts.streak);
  const particles = allocParticles(capacity);
  const pal = flashPalette(opts.flash);
  const now = performance.now();
  // Trail ngang ngực — khớp đầu đạn bay
  const a = from.clone();
  a.y = Math.max(from.y, 0.85);
  const b = to.clone();
  b.y = Math.max(to.y, 0.85);

  return pushEmit(scene, {
    id: nextId++,
    particles,
    points,
    geom,
    until: now + durationMs + 420,
    kind: "trail",
    from: a,
    to: b,
    born: now,
    durationMs,
    tint: pal.base,
    tintHot: pal.hot,
    mul,
    arc,
    density,
    lastSpawn: -999,
    cursor: 0,
    gravity: 0.9,
    drag: 1.2,
  });
}

/**
 * Full skill cast — charge → flight (sprite bay) → impact.
 * Không slideshow tại chỗ: pha tách theo hostileTimeline.
 */
export function playSkillFx3d(params: {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash?: string;
  scale?: string | null;
  phase?: "emission" | "impact" | "full" | "charge" | "flight";
  style?: Fx3dStyle;
  skillId?: string | null;
  pattern?: string | null;
  /** Đội hình mục tiêu — pháp trận phủ hết */
  targets?: THREE.Vector3[];
  /** Hồn / hỗ trợ — đồng minh buff */
  support?: boolean;
  /** Optional juice (cam punch / hitstop) — BattleRenderer gắn */
  onImpactJuice?: (style: Fx3dStyle, scale?: string | null) => void;
}): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const flash = params.flash || "steel";
  const style = params.style || "slash";
  const phase = params.phase || "full";
  const scale = params.scale;
  const skillId = params.skillId;
  const pattern = params.pattern;
  const tl = hostileTimeline({ style, scale, pattern });

  const api = {
    emitGroundSigil3d,
    emitBodyAura3d,
    emitShockwave3d,
    emitBurst3d,
    emitDust3d,
    emitFlashDisc3d,
    emitSparksBurst3d,
    emitResidual3d,
    emitGroundMark3d,
    emitTrail3d,
    emitPremiumLayersAt,
    emitHostileProjectile3d,
    emitHonSpiritSequence3d,
    emitItchFolderPackAt,
    skillPremiumLayers,
    flashPalette,
    onImpactJuice: params.onImpactJuice,
  } as unknown as StylePlayApi;

  const playParams = {
    scene: params.scene,
    from: params.from,
    to: params.to,
    flash,
    style,
    scale,
    phase,
    skillId,
    pattern,
    targets: params.targets,
    flightMs: tl.flightMs,
  };

  const hon = honPackForStyle(style, flash, skillId);

  const handle: Fx3dHandle = {
    cancel() {
      timers.forEach((tid) => {
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      });
      handles.forEach((h) => h.cancel());
      const hi = ACTIVE_HANDLES.indexOf(handle);
      if (hi >= 0) ACTIVE_HANDLES.splice(hi, 1);
    },
  };
  ACTIVE_HANDLES.push(handle);

  // Hon pack tự chạy charge→flight→impact bên trong
  if (hon && phase !== "impact") {
    if (phase === "charge" || phase === "flight") {
      /* preview partial — vẫn full sequence */
    }
    handles.push(
      emitHonSpiritSequence3d(params.scene, params.from, params.to, {
        scale,
        pack: hon,
        skillId,
        pattern,
        targets: params.targets?.length ? params.targets : [params.to],
        support: params.support,
      })
    );
    return handle;
  }

  if (phase === "charge") {
    runStyleCharge(api, playParams, handles);
    return handle;
  }
  if (phase === "flight") {
    runStyleFlight(api, playParams, handles);
    return handle;
  }
  if (phase === "impact") {
    runStyleImpact(api, playParams, handles);
    return handle;
  }
  if (phase === "emission") {
    // Tương thích cũ: charge rồi flight ngay (không đợi) — tránh nếu caller dùng full
    runStyleCharge(api, playParams, handles);
    timers.push(
      trackTimer(tl.chargeMs, () => {
        if (!params.scene) return;
        runStyleFlight(api, playParams, handles);
      })
    );
    return handle;
  }

  // full: charge → (delay) flight → (delay) impact
  runStyleCharge(api, playParams, handles);
  if (tl.needsFlight) {
    timers.push(
      trackTimer(tl.chargeMs, () => {
        if (!params.scene) return;
        runStyleFlight(api, playParams, handles);
      })
    );
  }
  timers.push(
    trackTimer(tl.impactAtMs, () => {
      if (!params.scene) return;
      runStyleImpact(api, playParams, handles);
    })
  );

  return handle;
}

/** Pattern AoE / hàng — mỗi mục tiêu một playSkillFx3d staggered. */
export function playPatternFx3d(params: {
  scene: THREE.Scene;
  from: THREE.Vector3;
  targets: THREE.Vector3[];
  flash?: string;
  motif?: string | null;
  pattern?: string | null;
  scale?: string | null;
  phase?: "emission" | "impact" | "full";
  support?: boolean;
  skillId?: string | null;
}): Fx3dHandle {
  const style = resolveFx3dStyle({
    flash: params.flash,
    motif: params.motif,
    pattern: params.pattern,
    support: params.support,
    skillId: params.skillId,
  });
  const kids: Fx3dHandle[] = [];
  const list = params.targets.length ? params.targets : [params.from];
  const phase = params.phase || "emission";
  const hon = honPackForStyle(style, params.flash, params.skillId);

  // Pháp trận / linh hồn: MỘT sequence (không spawn N aura cũ chồng)
  if ((hon === "hon_bagua" || hon === "hon_hon") && phase !== "impact") {
    const focus = list[Math.floor((list.length - 1) / 2)] || list[0] || params.from;
    kids.push(
      emitHonSpiritSequence3d(params.scene, params.from, focus, {
        scale: params.scale,
        pack: hon,
        skillId: params.skillId,
        pattern: params.pattern,
        targets: list,
        support: params.support,
      })
    );
    const handle: Fx3dHandle = {
      cancel() {
        kids.forEach((h) => h.cancel());
        const hi = ACTIVE_HANDLES.indexOf(handle);
        if (hi >= 0) ACTIVE_HANDLES.splice(hi, 1);
      },
    };
    ACTIVE_HANDLES.push(handle);
    return handle;
  }

  const stagger =
    style === "nova" || style === "roar"
      ? 38
      : params.pattern === "all"
        ? 48
        : params.pattern === "column"
          ? 62
          : 55;
  list.forEach((to, i) => {
    const delay = i * stagger;
    const tid = trackTimer(delay, () => {
      kids.push(
        playSkillFx3d({
          scene: params.scene,
          from: style === "bless" || style === "barrier" ? to : params.from,
          to,
          flash: params.flash,
          scale: params.scale,
          style,
          phase,
          skillId: params.skillId,
          pattern: params.pattern,
          targets: list,
        })
      );
    });
    kids.push({
      cancel() {
        clearTimeout(tid);
        const ti = PENDING_TIMERS.indexOf(tid);
        if (ti >= 0) PENDING_TIMERS.splice(ti, 1);
      },
    });
  });
  const handle: Fx3dHandle = {
    cancel() {
      kids.forEach((h) => h.cancel());
      const hi = ACTIVE_HANDLES.indexOf(handle);
      if (hi >= 0) ACTIVE_HANDLES.splice(hi, 1);
    },
  };
  ACTIVE_HANDLES.push(handle);
  return handle;
}

export function tickBattleVfx3d(_scene: THREE.Scene, now: number, dt: number): void {
  const dtSec = Math.min(0.05, dt > 2 ? dt / 1000 : dt);

  // —— mesh fx ——
  for (let i = ACTIVE_MESH.length - 1; i >= 0; i--) {
    const fx = ACTIVE_MESH[i];
    const t = Math.min(1, (now - fx.born) / fx.lifeMs);
    const ease = 1 - Math.pow(1 - t, 3);

    if (fx.kind === "ring") {
      const s = 0.15 + (fx.maxScale || 2.5) * ease;
      fx.obj.scale.setScalar(s);
      fx.obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - t) * (m === fx.obj ? 0.75 : 0.5));
      });
    } else if (fx.kind === "core" && fx.from && fx.to) {
      const e = ease;
      _tmp.copy(fx.from).lerp(fx.to, e);
      _tmp.y += Math.sin(e * Math.PI) * (fx.arc || 0.45);
      fx.obj.position.copy(_tmp);
      _tmp2.copy(fx.to).sub(fx.from);
      if (_tmp2.lengthSq() > 0.001) {
        fx.obj.lookAt(fx.obj.position.clone().add(_tmp2));
      }
      const pulse = 1 + 0.14 * Math.sin(t * Math.PI * 7);
      fx.obj.scale.setScalar(pulse * (1 - t * 0.08));
      fx.obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshBasicMaterial;
        const idx = fx.obj.children.indexOf(m);
        const base = idx === 2 ? 1 : idx === 1 ? 0.45 : 0.18;
        mat.opacity = t < 0.85 ? base : Math.max(0, base * (1 - (t - 0.85) / 0.15));
      });
    } else if (fx.kind === "bolt" && fx.from && fx.to) {
      const e = pathProgress(t, fx.pathEase);
      _tmp.copy(fx.from).lerp(fx.to, e);
      _tmp.y += Math.sin(e * Math.PI) * (fx.arc || 0.5);
      fx.obj.position.copy(_tmp);
      if (fx.shadowObj) {
        fx.shadowObj.position.set(_tmp.x, 0.035, _tmp.z);
        const alt = Math.max(0, _tmp.y - 0.5);
        const s = Math.max(0.45, 1 - alt * 0.25);
        if (fx.shadowBaseW && fx.shadowBaseH) {
          fx.shadowObj.scale.set(fx.shadowBaseW * s, fx.shadowBaseH * s, 1);
        }
        if (fx.shadowMat) {
          fx.shadowMat.opacity = Math.max(0, 0.42 * (t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12));
        }
      }
      const spr = fx.obj as THREE.Sprite;
      const mat = fx.spriteMat || (spr.material as THREE.SpriteMaterial);
      // Frame 1 → N đúng 1 lần theo tiến độ bay (không loop, 1 sprite)
      if (mat && fx.frames && fx.frames.length > 1) {
        if (fx.sequenceOnce) {
          const last = fx.frames.length - 1;
          const fi = Math.min(last, Math.floor(t * fx.frames.length));
          if (fi !== fx.frameI) {
            fx.frameI = fi;
            mat.map = fx.frames[fi];
            mat.needsUpdate = true;
          }
        } else if (now >= (fx.nextFrame || 0)) {
          fx.frameI = ((fx.frameI || 0) + 1) % fx.frames.length;
          mat.map = fx.frames[fx.frameI];
          mat.needsUpdate = true;
          fx.nextFrame = now + (fx.frameMs || 55);
        }
      }
      // Độ nghiêng chúi bổ nhào theo tiếp tuyến quỹ đạo parabol 3D (Tangent Pitch Tilt)
      if (mat && fx.headLed && fx.from && fx.to && !fx.noPitch) {
        const dx = fx.to.x - fx.from.x;
        const dz = fx.to.z - fx.from.z;
        const distXZ = Math.max(1.6, Math.hypot(dx, dz));
        const arc = fx.arc || 0.5;
        const slopeY = Math.cos(e * Math.PI) * Math.PI * arc;
        const pitch = Math.atan2(slopeY, distXZ);
        const sign = (fx.facing ?? 1) >= 0 ? 1 : -1;
        mat.rotation = pitch * sign;
      } else if (mat && fx.noPitch) {
        mat.rotation = 0;
      }
      const pulse = fx.noPulse ? 1 : 1 + 0.1 * Math.sin(t * Math.PI * 5);
      const grow = e < 0.15 ? 0.55 + (e / 0.15) * 0.45 : 1;
      if (!spr.userData.baseW) {
        spr.userData.baseW = spr.scale.x;
        spr.userData.baseH = spr.scale.y;
      }
      spr.scale.set(spr.userData.baseW * grow * pulse, spr.userData.baseH * grow * pulse, 1);
      const baseOp = fx.baseOpacity ?? 0.98;
      const fadeStart = fx.headLed ? 0.78 : 0.88;
      mat.opacity = Math.max(0, baseOp * (t < fadeStart ? 1 : 1 - (t - fadeStart) / Math.max(0.04, 1 - fadeStart)));
    } else if (fx.kind === "spin") {
      const spr = fx.obj as THREE.Sprite;
      const mat = spr.isSprite ? (spr.material as THREE.SpriteMaterial) : null;
      if (mat && fx.frames && fx.frames.length > 1 && now >= (fx.nextFrame || 0)) {
        fx.frameI = ((fx.frameI || 0) + 1) % fx.frames.length;
        mat.map = fx.frames[fx.frameI];
        mat.needsUpdate = true;
        fx.nextFrame = now + (fx.frameMs || 70);
      }
      if (mat) {
        mat.rotation += (fx.spinSpeed || 2.2) * dtSec;
        const pulse = 0.85 + 0.2 * Math.sin(t * Math.PI * 4);
        const grow = 0.7 + ease * ((fx.maxScale || 1.35) - 0.7);
        if (!spr.userData.baseW) {
          spr.userData.baseW = spr.scale.x;
          spr.userData.baseH = spr.scale.y;
        }
        spr.scale.set(spr.userData.baseW * grow * pulse, spr.userData.baseH * grow * pulse, 1);
        const baseOp = fx.baseOpacity ?? 0.9;
        mat.opacity = Math.max(0, baseOp * (t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25));
      }
    } else if (fx.kind === "decal") {
      // Group root xoay Y — plane con đã nằm đất (không gãy Euler)
      fx.obj.rotation.y += (fx.spinSpeed || 2.4) * dtSec;
      const mat = fx.meshMat;
      if (mat && fx.frames && fx.frames.length > 1 && now >= (fx.nextFrame || 0)) {
        fx.frameI = ((fx.frameI || 0) + 1) % fx.frames.length;
        mat.map = fx.frames[fx.frameI];
        mat.needsUpdate = true;
        fx.nextFrame = now + (fx.frameMs || 70);
      }
      if (mat) {
        const baseOp = fx.baseOpacity ?? 0.92;
        const appear = t < 0.1 ? t / 0.1 : 1;
        mat.opacity = Math.max(0, baseOp * appear * (t < 0.82 ? 1 : 1 - (t - 0.82) / 0.18));
      }
    } else if (fx.kind === "spirit" && fx.from && fx.to) {
      const formMs = fx.formMs || 0;
      const flightMs = fx.flightMs ?? Math.max(1, fx.lifeMs - formMs - (fx.dissolveMs || 0));
      const dissolveMs = fx.dissolveMs ?? 280;
      const age = now - fx.born;
      const inForm = formMs > 0 && age < formMs;
      const flightAge = Math.max(0, age - (fx.flightDelayMs || formMs));
      const arrived = !inForm && flightAge >= flightMs;
      const headU = inForm
        ? 0
        : arrived
          ? 1
          : pathProgress(Math.min(1, flightAge / Math.max(1, flightMs)), fx.pathEase ?? "in");
      const dissolveAge = arrived ? flightAge - flightMs : 0;
      const dissolveT = arrived ? Math.min(1, dissolveAge / Math.max(1, dissolveMs)) : 0;
      const fade = 1 - dissolveT;
      const arc = fx.arc || 0.35;
      const side = fx.side || 0;
      const pulse = 1 + 0.03 * Math.sin(t * Math.PI * 3);
      const formScale = inForm ? 0.35 + 0.65 * Math.min(1, age / Math.max(1, formMs)) : 1;
      const dissolveScale = 1 - dissolveT * 0.7;
      const s = pulse * (fx.baseScale || 1) * formScale * dissolveScale;

      // Head path
      if (inForm) {
        _tmp.copy(fx.from);
        _tmp.y += 0.28 + Math.sin((age / Math.max(1, formMs)) * Math.PI) * 0.08;
      } else {
        sampleSpiritPath(fx.from, fx.to, headU, arc, side, _tmp, 0.015, now * 0.002);
      }

      if (fx.mesh3d) {
        // Legacy GLB path (không dùng làm emission chính)
        fx.obj.position.copy(_tmp);
        fx.obj.scale.setScalar(Math.max(0.05, s));
        if (fx.mixer) fx.mixer.update(dtSec);
        const lookU = Math.min(1, headU + 0.05);
        if (inForm || arrived) _tmp2.copy(fx.to).sub(fx.from);
        else {
          sampleSpiritPath(fx.from, fx.to, lookU, arc, side, _tmp2, 0.015, now * 0.002);
          _tmp2.sub(_tmp);
        }
        if (_tmp2.lengthSq() > 1e-8) {
          fx.obj.rotation.y = Math.atan2(_tmp2.x, _tmp2.z) + (fx.yawOffset || 0);
        }
        fx.obj.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            if (!m || !("opacity" in m)) continue;
            const mat = m as THREE.MeshBasicMaterial;
            if (mat.userData.baseOp == null) mat.userData.baseOp = mat.opacity;
            mat.transparent = true;
            mat.opacity = (mat.userData.baseOp as number) * fade * (fx.baseOpacity ?? 1);
            mat.visible = fade > 0.02;
          }
        });
      } else {
        // Luồng khí sheet: group gốc tại head; body/mist lệch u lùi
        fx.obj.position.set(0, 0, 0);
        fx.obj.scale.setScalar(1);
        const spacing = fx.segSpacing ?? 0.07;
        const segs = fx.segments || [];
        for (let si = 0; si < segs.length; si++) {
          const seg = segs[si] as THREE.Sprite;
          const lag = (seg.userData.segIndex as number) || si;
          const uSeg = Math.max(0, headU - lag * spacing);
          if (inForm && lag > 0) {
            sampleSpiritPath(fx.from, fx.to, 0, arc, side, _tmp2, 0, 0);
            _tmp2.y += 0.12 * lag;
          } else if (inForm) {
            _tmp2.copy(_tmp);
          } else {
            sampleSpiritPath(fx.from, fx.to, uSeg, arc, side, _tmp2, 0.01, now * 0.002 + lag);
          }
          seg.position.copy(_tmp2);
          const bw = (seg.userData.baseW as number) || 1.2;
          const bh = (seg.userData.baseH as number) || 1.2;
          const segFade = fade * (1 - Math.min(0.35, lag * 0.06));
          seg.scale.set(bw * s, bh * s, 1);
          const mat = seg.material as THREE.SpriteMaterial;
          if (mat) {
            if (mat.userData.baseOp == null) mat.userData.baseOp = mat.opacity;
            mat.opacity = (mat.userData.baseOp as number) * segFade * (fx.baseOpacity ?? 1);
            mat.visible = segFade > 0.02;
          }
        }
        // Flipbook đầu (serpent) + outline Nineball nếu có
        if (fx.frames && fx.frames.length > 1 && fx.spriteMat && now >= (fx.nextFrame || 0)) {
          fx.frameI = ((fx.frameI || 0) + 1) % fx.frames.length;
          fx.spriteMat.map = fx.frames[fx.frameI];
          fx.spriteMat.needsUpdate = true;
          fx.nextFrame = now + (fx.frameMs || 55);
          if (fx.altMats?.[0] && fx.altFrames?.[0]?.length) {
            const oi = fx.frameI % fx.altFrames[0].length;
            fx.altMats[0].map = fx.altFrames[0][oi];
            fx.altMats[0].needsUpdate = true;
          }
        }
      }
      if (dissolveT >= 1) {
        fx.until = now - 1;
      }
    } else if (fx.kind === "flash") {
      // maxScale ≤ 1.15 = billboard “giữ hình” (pháp sư); còn lại = flash nổ phóng to
      const hold = (fx.maxScale ?? 2) <= 1.15;
      const s = hold ? 0.94 + 0.08 * Math.sin(t * Math.PI * 2) : 0.6 + ease * 1.4;
      const spr = fx.obj as THREE.Sprite;
      if (spr.isSprite) {
        if (!spr.userData.baseW) {
          spr.userData.baseW = spr.scale.x;
          spr.userData.baseH = spr.scale.y;
        }
        spr.scale.set(spr.userData.baseW * s, spr.userData.baseH * s, 1);
        const mat = spr.material as THREE.SpriteMaterial;
        if (fx.frames && fx.frames.length > 1 && mat && now >= (fx.nextFrame || 0)) {
          fx.frameI = Math.min((fx.frameI || 0) + 1, fx.frames.length - 1);
          mat.map = fx.frames[fx.frameI];
          mat.needsUpdate = true;
          fx.nextFrame = now + (fx.frameMs || 70);
        }
        const baseOp = fx.baseOpacity ?? 1;
        mat.opacity = hold
          ? Math.max(0, baseOp * (t < 0.78 ? 1 : 1 - (t - 0.78) / 0.22))
          : Math.max(0, 1 - t);
      } else {
        fx.obj.scale.setScalar(s);
        const mat = (fx.obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - t);
      }
    }

    if (now > fx.until || t >= 1) {
      ACTIVE_MESH.splice(i, 1);
      fx.obj.parent?.remove(fx.obj);
      disposeFxObject(fx.obj);
      if (fx.shadowObj) {
        fx.shadowObj.parent?.remove(fx.shadowObj);
        disposeFxObject(fx.shadowObj);
      }
    }
  }

  // —— particle emitters ——
  for (let ei = ACTIVE_EMIT.length - 1; ei >= 0; ei--) {
    const em = ACTIVE_EMIT[ei];

    if (em.kind === "trail" && em.from && em.to && em.born != null && em.durationMs) {
      const age = now - em.born;
      const u = Math.min(1, age / em.durationMs);
      const spawnEvery = 14 / Math.max(4, em.density || 8);
      if (age - (em.lastSpawn || 0) > spawnEvery) {
        em.lastSpawn = age;
        const e = u * u * (3 - 2 * u);
        _tmp.copy(em.from).lerp(em.to, e);
        _tmp.y += Math.sin(e * Math.PI) * (em.arc || 0.4);
        const n = Math.max(3, Math.round((em.density || 8) * 0.55));
        _tmp2.copy(em.to).sub(em.from).normalize();
        for (let k = 0; k < n; k++) {
          const idx = (em.cursor || 0) % em.particles.length;
          em.cursor = idx + 1;
          const p = em.particles[idx];
          p.alive = true;
          p.pos.copy(_tmp);
          p.pos.x += (Math.random() - 0.5) * 0.18;
          p.pos.y += (Math.random() - 0.5) * 0.1;
          p.pos.z += (Math.random() - 0.5) * 0.18;
          p.vel.copy(_tmp2).multiplyScalar(0.5 + Math.random() * 1.1);
          p.vel.y += (Math.random() - 0.25) * 0.7;
          p.life = 0;
          p.maxLife = 0.22 + Math.random() * 0.28;
          p.size = 0.16 * (em.mul || 1) * (0.75 + Math.random());
          p.color.copy(k % 2 === 0 && em.tintHot ? em.tintHot : em.tint || _col.setHex(0xffffff));
        }
      }
    }

    const g = em.gravity ?? 3.2;
    const drag = em.drag ?? 1.8;
    for (const p of em.particles) {
      if (!p.alive) continue;
      p.life += dtSec;
      if (p.life >= p.maxLife) {
        p.alive = false;
        continue;
      }
      p.vel.y -= g * dtSec;
      p.vel.multiplyScalar(1 - drag * dtSec);
      p.pos.addScaledVector(p.vel, dtSec);
    }

    const pos = em.geom.getAttribute("position") as THREE.BufferAttribute;
    const col = em.geom.getAttribute("color") as THREE.BufferAttribute;
    let w = 0;
    let sizeSum = 0;
    for (const p of em.particles) {
      if (!p.alive) continue;
      const fade = Math.max(0, 1 - p.life / p.maxLife);
      // soft in / out
      const envelope = fade < 0.15 ? fade / 0.15 : fade > 0.55 ? (1 - fade) / 0.45 : 1;
      const a = Math.max(0, envelope);
      pos.setXYZ(w, p.pos.x, p.pos.y, p.pos.z);
      col.setXYZ(w, p.color.r * a, p.color.g * a, p.color.b * a);
      sizeSum += p.size;
      w++;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    em.geom.setDrawRange(0, w);
    const mat = em.points.material as THREE.PointsMaterial;
    if (w > 0) mat.size = Math.min(0.55, Math.max(0.16, (sizeSum / w) * 1.35));

    if (now > em.until) {
      ACTIVE_EMIT.splice(ei, 1);
      em.points.parent?.remove(em.points);
      em.geom.dispose();
      mat.dispose();
    }
  }
}

export function clearBattleVfx3d(scene?: THREE.Scene | null): void {
  for (const tid of PENDING_TIMERS.splice(0, PENDING_TIMERS.length)) clearTimeout(tid);
  for (const h of ACTIVE_HANDLES.splice(0, ACTIVE_HANDLES.length)) {
    try {
      h.cancel();
    } catch {
      /* ignore */
    }
  }
  for (const em of ACTIVE_EMIT.splice(0, ACTIVE_EMIT.length)) {
    scene?.remove(em.points);
    em.points.parent?.remove(em.points);
    em.geom.dispose();
    (em.points.material as THREE.Material).dispose();
  }
  for (const fx of ACTIVE_MESH.splice(0, ACTIVE_MESH.length)) {
    scene?.remove(fx.obj);
    fx.obj.parent?.remove(fx.obj);
    disposeFxObject(fx.obj);
    if (fx.shadowObj) {
      scene?.remove(fx.shadowObj);
      fx.shadowObj.parent?.remove(fx.shadowObj);
      disposeFxObject(fx.shadowObj);
    }
  }
}
