import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * True 3D battle VFX — soft Points + mesh cores/rings in world space.
 *
 * Quality bar (vs raw square points):
 * - Soft radial glow map (additive) — đọc được như hạt lửa/khói
 * - Dual-layer burst (core nóng + tia phụ)
 * - Mesh core bay theo đường (breath / rush)
 * - Shockwave = RingGeometry nở + fade (không chỉ vòng Points)
 *
 * Style: Tam Quốc — ember / hổ phách / thép / băng; tránh neon.
 */

export type Fx3dHandle = { cancel: () => void };

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
  kind: "ring" | "core" | "flash" | "spirit" | "spin";
  born: number;
  lifeMs: number;
  // ring / spin
  maxScale?: number;
  spinSpeed?: number;
  // core / spirit flight
  from?: THREE.Vector3;
  to?: THREE.Vector3;
  arc?: number;
  side?: number;
  // spirit: form rồi bay
  formMs?: number;
  flightDelayMs?: number;
  /** +1 bay về +X (địch→ta), −1 bay về −X (ta→địch) — khóa lúc spawn */
  facing?: number;
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

/** Soft volumetric Hồn packs — gen: `npm run gen:hon-packs` */
export type HonPackId = "hon_rong" | "hon_xa" | "hon_ho" | "hon_soi" | "hon_thuy" | "hon_loi" | "hon_phong";

type HonPackPaths = {
  serpent: string[];
  mist: string[];
  sparkle: string[];
  ring: string[];
  crescent: string[];
  orb: string;
  tint: number;
  flash: string;
  /** GLB hồn bay — bắt buộc 3D CC0, không procedural */
  glb: string;
  /** Emissive nhẹ khi bay (linh khí) */
  emissive: number;
  yawOffset: number;
};

function honPaths(
  id: HonPackId,
  tint: number,
  flash: string,
  glb: string,
  emissive: number,
  yawOffset = 0
): HonPackPaths {
  const pad = (n: number) => String(n).padStart(2, "0");
  const base = `assets/fx/${id}`;
  return {
    serpent: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `${base}/serpent_${pad(i)}.png`),
    mist: [1, 2, 3, 4].map((i) => `${base}/mist_${pad(i)}.png`),
    sparkle: [1, 2, 3, 4].map((i) => `${base}/sparkle_${pad(i)}.png`),
    ring: [1, 2, 3, 4].map((i) => `${base}/ring_${pad(i)}.png`),
    crescent: [1, 2, 3].map((i) => `${base}/crescent_${pad(i)}.png`),
    orb: `${base}/orb.png`,
    tint,
    flash,
    glb,
    emissive,
    yawOffset,
  };
}

/** Charge/hit sheets vẫn dùng sprite CC0; thân hồn bay = GLB trong hon_3d/ */
const HON_PACKS: Record<HonPackId, HonPackPaths> = {
  // dragon = Loong Á Đông (Grab3D CC0); yaw 0 = mũi theo +Z local
  hon_rong: honPaths("hon_rong", 0xff8a3a, "fire", "assets/fx/hon_3d/dragon.glb", 0xff4a12, 0),
  hon_xa: honPaths("hon_xa", 0x6ee7a8, "green_poison", "assets/fx/hon_3d/snake.glb", 0x22c55e, 0),
  hon_ho: honPaths("hon_ho", 0xfbbf24, "tiger", "assets/fx/hon_3d/tiger.glb", 0xf59e0b, 0),
  hon_soi: honPaths("hon_soi", 0xcbd5e1, "wolf", "assets/fx/hon_3d/wolf.glb", 0x94a3b8, 0),
  hon_thuy: honPaths("hon_thuy", 0x38bdf8, "blue_water", "assets/fx/hon_3d/fish.glb", 0x0ea5e9, 0),
  hon_loi: honPaths("hon_loi", 0xfde047, "thunder", "assets/fx/hon_3d/dragon.glb", 0xfacc15, 0),
  hon_phong: honPaths("hon_phong", 0xa5f3fc, "whirlwind", "assets/fx/hon_3d/wind.glb", 0x67e8f9, 0),
};

const _gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

type HonGlbTemplate = {
  root: THREE.Object3D;
  clips: THREE.AnimationClip[];
};

const _honGlbCache = new Map<string, Promise<HonGlbTemplate>>();

function loadHonGlbTemplate(url: string): Promise<HonGlbTemplate> {
  let hit = _honGlbCache.get(url);
  if (hit) return hit;
  hit = _gltfLoader.loadAsync(url).then((gltf) => {
    const root = gltf.scene || gltf.scenes[0];
    root.updateMatrixWorld(true);
    const drop: THREE.Object3D[] = [];
    root.traverse((o) => {
      if ((o as THREE.Light).isLight || (o as THREE.Camera).isCamera) drop.push(o);
    });
    for (const o of drop) o.removeFromParent();
    return { root, clips: gltf.animations?.slice() || [] };
  });
  _honGlbCache.set(url, hit);
  return hit;
}

function makeHonMaterial(src: THREE.Material | null, glow: THREE.Color): THREE.MeshBasicMaterial {
  const std = src as THREE.MeshStandardMaterial | null;
  const hasMap = !!std?.map;
  const col = std?.color ? std.color.clone() : glow.clone();
  // Có texture (Loong…) → giữ màu gốc; không map → pha glow mạnh hơn
  col.lerp(glow, hasMap ? 0.18 : 0.5);
  const basic = new THREE.MeshBasicMaterial({
    color: col,
    map: std?.map || null,
    transparent: true,
    opacity: hasMap ? 1 : 0.94,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    fog: false,
    toneMapped: false,
  });
  if (basic.map) basic.map.colorSpace = THREE.SRGBColorSpace;
  basic.userData.baseOp = hasMap ? 1 : 0.94;
  return basic;
}

function normalizeHonRoot(root: THREE.Object3D, targetSize: number): THREE.Group {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z, 1e-4);
  const inner = new THREE.Group();
  inner.position.set(-center.x, -box.min.y, -center.z);
  inner.add(root);
  const wrap = new THREE.Group();
  wrap.add(inner);
  wrap.scale.setScalar(targetSize / longest);
  const group = new THREE.Group();
  group.name = "fx3d-hon-glb";
  group.renderOrder = 120;
  group.add(wrap);
  return group;
}

/**
 * Static mesh (Loong…): clone + material unlit.
 * Skinned (rồng Tây cũ / xà / sói): flatten bind-pose khỏi hierarchy xương.
 */
function buildHon3dSpirit(
  template: HonGlbTemplate,
  targetSize: number,
  glow: number
): { group: THREE.Group; mixer: THREE.AnimationMixer | null } {
  const clone = cloneSkeleton(template.root);
  clone.updateMatrixWorld(true);
  const glowCol = new THREE.Color(glow);

  let hasSkinned = false;
  clone.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) hasSkinned = true;
  });

  if (!hasSkinned) {
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const srcMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      mesh.material = makeHonMaterial(srcMat, glowCol);
      mesh.frustumCulled = false;
      mesh.renderOrder = 120;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });
    return { group: normalizeHonRoot(clone, targetSize), mixer: null };
  }

  // Skinned → flatten
  const shell = new THREE.Group();
  shell.name = "hon-parts";
  clone.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const src = mesh.geometry;
    if (!src.getAttribute("position")) return;
    const g = src.clone();
    g.deleteAttribute("skinIndex");
    g.deleteAttribute("skinWeight");
    mesh.updateWorldMatrix(true, false);
    g.applyMatrix4(mesh.matrixWorld);
    const srcMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const part = new THREE.Mesh(g, makeHonMaterial(srcMat, glowCol));
    part.name = mesh.name || "hon-part";
    part.frustumCulled = false;
    part.renderOrder = 120;
    shell.add(part);
  });
  return { group: normalizeHonRoot(shell, targetSize), mixer: null };
}


function loadFxTex(url: string): Promise<THREE.Texture> {
  const hit = _texCache.get(url);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    _texLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        tex.premultiplyAlpha = true;
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
  return Promise.all(urls.map((u) => loadFxTex(u)));
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

/** Styles cho rebuild 3D toàn catalog */
export type Fx3dStyle =
  | "slash"
  | "breath"
  | "roar"
  | "rush"
  | "charge"
  | "beam"
  | "nova"
  | "tide"
  | "poison"
  | "whirl"
  | "shadow"
  | "bless"
  | "barrier";

/**
 * Map flash/motif/pattern → style 3D (mọi chiêu đi qua đây).
 */
export function resolveFx3dStyle(opts: {
  flash?: string | null;
  motif?: string | null;
  pattern?: string | null;
  support?: boolean;
  isShield?: boolean;
  isCharge?: boolean;
  isRush?: boolean;
}): Fx3dStyle {
  const flash = String(opts.flash || "").toLowerCase();
  const motif = String(opts.motif || "").toLowerCase();
  const pat = String(opts.pattern || "single").toLowerCase();
  if (opts.isShield || flash === "shield" || motif === "shield") return "barrier";
  if (opts.support || motif === "heal" || motif === "buff" || pat === "ally_all" || pat === "self") {
    if (flash === "shield") return "barrier";
    return "bless";
  }
  if (opts.isCharge || flash === "charge" || flash === "brown" || motif === "charge") return "charge";
  if (opts.isRush || flash === "rush" || motif === "rush") return "rush";
  if (flash === "dragon" || motif === "dragon") return "breath";
  if (flash === "tiger" || motif === "tiger" || flash === "wolf" || motif === "wolf") return "roar";
  if (flash === "whirlwind" || motif === "whirlwind" || flash === "wind") return "whirl";
  if (
    flash === "green_poison" ||
    flash === "poison" ||
    flash === "snake" ||
    flash === "fire_green" ||
    motif === "poison" ||
    motif === "snake"
  )
    return "poison";
  if (flash === "blue_water" || flash === "cyan" || flash === "teal" || flash === "white_blue" || motif === "water")
    return "tide";
  if (flash === "fire_rain" || flash === "fire" || flash === "orange" || flash === "red_fire" || motif === "fire")
    return "nova";
  if (
    flash === "crimson" ||
    flash === "dark_red" ||
    flash === "gold_red" ||
    flash === "red" ||
    motif === "shadow"
  )
    return "shadow";
  if (
    flash === "thunder" ||
    flash === "purple" ||
    flash === "violet" ||
    flash === "bagua" ||
    flash === "blue" ||
    motif === "arcane" ||
    motif === "thunder" ||
    motif === "bagua"
  )
    return "beam";
  if (motif === "pierce" || flash === "gold_pierce") return "rush";
  return "slash";
}

/** Map style 3D → pack hồn (null = không dùng spirit sequence). */
function honPackForStyle(style: Fx3dStyle, flash?: string): HonPackId | null {
  const f = (flash || "").toLowerCase();
  if (style === "breath") return "hon_rong";
  if (style === "poison") return "hon_xa";
  if (style === "tide") return "hon_thuy";
  if (style === "whirl") return "hon_phong";
  if (style === "roar") return f === "wolf" ? "hon_soi" : "hon_ho";
  if (style === "beam" && (f === "thunder" || f === "storm")) return "hon_loi";
  return null;
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
  h: number
): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(w, h, 1);
  spr.renderOrder = 60;
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
 * Flipbook packs cho chiêu KHÔNG phải hồn thú.
 * Ưu tiên Brackeys (itch) đã slice → `assets/fx/itch/brackeys/{id}/`
 * Fallback Pixel Ability FX Forge → `assets/fx/forge/{id}/`
 */
type ForgePackId =
  | "arcane_burst"
  | "radiance_aura"
  | "ward_barrier"
  | "shadow_burst"
  | "ember_burst"
  | "blood_burst"
  | "storm_burst"
  | "earth_burst"
  | "explosion_burst"
  | "hit_burst";

/** Packs đã slice từ Brackeys VFX Bundle (có frame_XX.png). */
const ITCH_BRACKETS: ReadonlySet<ForgePackId> = new Set([
  "arcane_burst",
  "radiance_aura",
  "ward_barrier",
  "shadow_burst",
  "ember_burst",
  "blood_burst",
  "storm_burst",
  "earth_burst",
  "explosion_burst",
  "hit_burst",
]);

function forgeFrameUrls(id: ForgePackId, n = 16): string[] {
  const pad = (i: number) => String(i).padStart(2, "0");
  const base = ITCH_BRACKETS.has(id)
    ? `assets/fx/itch/brackeys/${id}`
    : `assets/fx/forge/${id}`;
  return Array.from({ length: n }, (_, i) => `${base}/frame_${pad(i + 1)}.png`);
}

/** Map style 3D → sheet pack (null = chỉ particle). */
function forgePackForStyle(style: Fx3dStyle, flash?: string): ForgePackId | null {
  const f = (flash || "").toLowerCase();
  if (style === "bless") return "radiance_aura";
  if (style === "barrier") return "ward_barrier";
  if (style === "shadow") return "shadow_burst";
  if (style === "nova") return "explosion_burst";
  if (style === "beam") {
    if (f === "thunder" || f === "storm") return "storm_burst";
    if (f === "bagua" || f === "purple" || f === "violet" || f === "blue") return "arcane_burst";
    return "arcane_burst";
  }
  if (style === "slash") {
    if (f === "crimson" || f === "dark_red" || f === "red" || f === "gold_red") return "blood_burst";
    if (f === "brown" || f === "iron") return "earth_burst";
    return "hit_burst";
  }
  if (style === "rush" || style === "charge") return "earth_burst";
  return null;
}

function emitForgeSheetAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  pack: ForgePackId,
  opts: {
    durationMs?: number;
    w?: number;
    h?: number;
    opacity?: number;
    spin?: boolean;
    y?: number;
    delayMs?: number;
    color?: number;
    scale?: string | null;
  } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];
  const delayMs = opts.delayMs ?? 0;
  const start = () => {
    if (cancelled.v || !scene) return;
    void loadFrameSet(forgeFrameUrls(pack))
      .then((frames) => {
        if (cancelled.v || !scene || !frames.length) return;
        handles.push(
          emitHonSheetAt(scene, at, frames, {
            durationMs: opts.durationMs ?? 520,
            w: (opts.w ?? 2.4) * mul,
            h: (opts.h ?? 2.4) * mul,
            opacity: opts.opacity ?? 0.92,
            spin: opts.spin,
            y: opts.y ?? 0.35,
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

/** Stylized Projectiles (itch) — pack đã curate dưới assets/fx/itch/stylized/ */
function emitItchStylizedAt(
  scene: THREE.Scene,
  at: THREE.Vector3,
  pack: string,
  frameCount: number,
  opts: {
    durationMs?: number;
    w?: number;
    h?: number;
    opacity?: number;
    y?: number;
    delayMs?: number;
    color?: number;
    scale?: string | null;
  } = {}
): Fx3dHandle {
  const pad = (i: number) => String(i).padStart(2, "0");
  const urls = Array.from(
    { length: frameCount },
    (_, i) => `assets/fx/itch/stylized/${pack}/frame_${pad(i + 1)}.png`
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
  if (f === "fire" || f === "fire_rain" || f === "orange")
    return { base: new THREE.Color(0xff7a2e), hot: new THREE.Color(0xffe08a), cool: new THREE.Color(0xb91c1c) };
  if (f === "tiger" || f === "gold" || f === "gold_soft" || f === "yellow")
    return { base: new THREE.Color(0xfbbf24), hot: new THREE.Color(0xfff7ed), cool: new THREE.Color(0xb45309) };
  if (f === "thunder" || f === "storm")
    return { base: new THREE.Color(0x7dd3fc), hot: new THREE.Color(0xf0f9ff), cool: new THREE.Color(0x0369a1) };
  if (f === "blue" || f === "blue_water" || f === "cyan" || f === "frost")
    return { base: new THREE.Color(0x38bdf8), hot: new THREE.Color(0xe0f2fe), cool: new THREE.Color(0x1d4ed8) };
  if (f === "purple" || f === "shadow" || f === "bagua")
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

function pushMesh(scene: THREE.Scene, fx: MeshFx): Fx3dHandle {
  scene.add(fx.obj);
  ACTIVE_MESH.push(fx);
  return {
    cancel() {
      const i = ACTIVE_MESH.indexOf(fx);
      if (i >= 0) ACTIVE_MESH.splice(i, 1);
      fx.obj.parent?.remove(fx.obj);
      disposeFxObject(fx.obj);
    },
  };
}

function scaleMul(scale?: string | null): number {
  if (scale === "L") return 1.35;
  if (scale === "S") return 0.72;
  return 1;
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
  const size = (opts.size ?? 0.28) * mul;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(size, 12, 10),
    new THREE.MeshBasicMaterial({
      color: pal.hot,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.55, 12, 10),
    new THREE.MeshBasicMaterial({
      color: pal.base,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const root = new THREE.Group();
  root.add(shell);
  root.add(core);
  root.position.copy(from);
  root.renderOrder = 55;

  const now = performance.now();
  return pushMesh(scene, {
    id: nextId++,
    obj: root,
    until: now + durationMs + 60,
    kind: "core",
    born: now,
    lifeMs: durationMs,
    from: from.clone(),
    to: to.clone(),
    arc: opts.arc ?? 0.5,
  });
}

/**
 * Hồn spirit bay — GLB CC0 form tại caster rồi lao arc vào địch.
 * Không procedural creature; thiếu GLB thì bỏ (không fallback blob).
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
    pack?: HonPackId;
  } = {}
): Fx3dHandle {
  const pack = HON_PACKS[opts.pack || "hon_rong"];
  const mul = scaleMul(opts.scale);
  const formMs = opts.formMs ?? 0;
  const flightMs = opts.durationMs ?? 980;
  const lifeMs = formMs + flightMs;
  const delayMs = opts.delayMs ?? 0;
  const size = (opts.size ?? 1.55) * mul;
  const opacity = opts.opacity ?? 1;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];

  const start = () => {
    if (cancelled.v || !scene) return;
    void loadHonGlbTemplate(pack.glb)
      .then((tpl) => {
        if (cancelled.v || !scene) return;
        const { group, mixer } = buildHon3dSpirit(tpl, size, pack.emissive);
        group.position.copy(from);
        group.position.y += 0.7;
        group.scale.setScalar(formMs > 0 ? 0.55 : 1);
        const facing = spiritFacing(from, to);
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        group.rotation.y = Math.atan2(dx, dz) + pack.yawOffset;
        const now = performance.now();
        handles.push(
          pushMesh(scene, {
            id: nextId++,
            obj: group,
            until: now + lifeMs + 80,
            kind: "spirit",
            born: now,
            lifeMs,
            from: from.clone(),
            to: to.clone(),
            arc: opts.arc ?? 0.72,
            side: opts.side ?? 0.08,
            formMs,
            flightDelayMs: formMs,
            facing,
            segments: [group],
            segSpacing: 0,
            baseScale: 1,
            baseOpacity: opacity,
            mesh3d: true,
            yawOffset: pack.yawOffset,
            mixer: mixer || undefined,
          })
        );
      })
      .catch((err) => {
        console.warn("[hon-3d] GLB load failed", pack.glb, err);
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
 * Chuỗi Hồn 4 giai đoạn — dùng cho rồng / xà / hổ / sói / thủy / lôi / phong.
 */
export function emitHonSpiritSequence3d(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: { scale?: string | null; pack?: HonPackId } = {}
): Fx3dHandle {
  const packId = opts.pack || "hon_rong";
  const pack = HON_PACKS[packId];
  const tint = pack.tint;
  const tintHot = new THREE.Color(tint).lerp(new THREE.Color(0xfffbeb), 0.45).getHex();
  const tintDeep = new THREE.Color(tint).multiplyScalar(0.7).getHex();
  const mul = scaleMul(opts.scale);
  const CHARGE_MS = 420;
  const FORM_MS = 400;
  const FLIGHT_MS = 1050;
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const cancelled = { v: false };
  const ground = from.clone();
  ground.y = Math.min(from.y, 0.12);

  const start = () => {
    if (cancelled.v || !scene) return;
    void Promise.all([
      loadFrameSet(pack.ring),
      loadFrameSet(pack.crescent),
      loadFrameSet(pack.sparkle),
      loadFxTex(pack.orb),
    ]).then(([rings, crescents, sparkles, orbG]) => {
      if (cancelled.v || !scene) return;

      if (rings.length) {
        handles.push(
          emitHonSheetAt(scene, ground, rings, {
            durationMs: CHARGE_MS + FORM_MS,
            w: 2.8 * mul,
            h: 1.55 * mul,
            opacity: 0.85,
            spin: true,
            spinSpeed: 2.8,
            y: 0.04,
            color: tint,
          })
        );
      }
      if (crescents.length) {
        handles.push(
          emitHonSheetAt(scene, ground, crescents, {
            durationMs: CHARGE_MS + 120,
            w: 2.2 * mul,
            h: 1.2 * mul,
            opacity: 0.7,
            spin: true,
            spinSpeed: -3.4,
            y: 0.08,
            delayMs: 60,
            color: tintDeep,
          })
        );
      }
      if (sparkles.length) {
        handles.push(
          emitHonSheetAt(scene, from, sparkles, {
            durationMs: CHARGE_MS,
            w: 1.6 * mul,
            h: 1.6 * mul,
            opacity: 0.8,
            y: 0.35,
            color: tintHot,
          })
        );
        handles.push(
          emitHonSheetAt(scene, from, sparkles, {
            durationMs: CHARGE_MS - 40,
            w: 1.2 * mul,
            h: 1.2 * mul,
            opacity: 0.55,
            y: 0.55,
            delayMs: 90,
            color: tint,
          })
        );
      }

      timers.push(
        trackTimer(CHARGE_MS * 0.65, () => {
          if (cancelled.v || !scene) return;
          handles.push(
            emitDragonSpirit3d(scene, from, to, {
              durationMs: FLIGHT_MS,
              formMs: FORM_MS,
              scale: opts.scale,
              arc: 0.85,
              side: 0.1,
              size: 4.2,
              pack: packId,
            })
          );
        })
      );

      const hitAt = CHARGE_MS * 0.65 + FORM_MS + FLIGHT_MS - 40;
      timers.push(
        trackTimer(hitAt, () => {
          if (cancelled.v || !scene) return;
          const hit = to.clone();
          hit.y += 0.2;
          const orbSpr = makeFxSprite(orbG, tintHot, 0.95, 0.6 * mul, 0.6 * mul);
          orbSpr.position.copy(hit);
          const now = performance.now();
          handles.push(
            pushMesh(scene, {
              id: nextId++,
              obj: orbSpr,
              until: now + 420,
              kind: "flash",
              born: now,
              lifeMs: 420,
              spriteMat: orbSpr.material as THREE.SpriteMaterial,
              baseOpacity: 0.95,
            })
          );
          const orbOuter = makeFxSprite(orbG, tintDeep, 0.75, 1.0 * mul, 1.0 * mul);
          orbOuter.position.copy(hit);
          handles.push(
            pushMesh(scene, {
              id: nextId++,
              obj: orbOuter,
              until: now + 480,
              kind: "flash",
              born: now,
              lifeMs: 480,
              spriteMat: orbOuter.material as THREE.SpriteMaterial,
              baseOpacity: 0.75,
            })
          );
          if (sparkles.length) {
            handles.push(
              emitHonSheetAt(scene, hit, sparkles.slice(2), {
                durationMs: 400,
                w: 2.4 * mul,
                h: 2.4 * mul,
                opacity: 0.9,
                y: 0.1,
                color: tintHot,
              })
            );
          }
          handles.push(emitBurst3d(scene, to, pack.flash, opts.scale));
          handles.push(
            emitShockwave3d(scene, to, {
              flash: pack.flash,
              scale: opts.scale,
              radius: 2.0,
              durationMs: 560,
            })
          );
          handles.push(emitDust3d(scene, to, opts.scale));
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
  const capacity = Math.min(280, Math.round((durationMs / 14) * density * mul));
  const { points, geom } = makePoints(capacity, true, 0.32 * mul, !!opts.streak);
  const particles = allocParticles(capacity);
  const pal = flashPalette(opts.flash);
  const now = performance.now();

  return pushEmit(scene, {
    id: nextId++,
    particles,
    points,
    geom,
    until: now + durationMs + 420,
    kind: "trail",
    from: from.clone(),
    to: to.clone(),
    born: now,
    durationMs,
    tint: pal.base,
    tintHot: pal.hot,
    mul,
    arc,
    density,
    lastSpawn: -999,
    cursor: 0,
    gravity: 1.2,
    drag: 1.4,
  });
}

/**
 * Full skill cast — 3D look per style (toàn catalog).
 */
export function playSkillFx3d(params: {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash?: string;
  scale?: string | null;
  phase?: "emission" | "impact" | "full";
  style?: Fx3dStyle;
}): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const flash = params.flash || "steel";
  const style = params.style || "slash";
  const phase = params.phase || "full";
  const scale = params.scale;

  const runEmission = () => {
    if (style === "barrier") {
      handles.push(emitShockwave3d(params.scene, params.from, { flash: "shield", scale, radius: 1.6, durationMs: 900 }));
      handles.push(emitFlashDisc3d(params.scene, params.from, "shield", scale));
      handles.push(emitBurst3d(params.scene, params.from, "gold_soft", scale));
      handles.push(
        emitForgeSheetAt(params.scene, params.from, "ward_barrier", {
          durationMs: 720,
          w: 2.8,
          h: 2.8,
          y: 0.5,
          spin: true,
          scale,
          color: 0xdbeafe,
        })
      );
      return;
    }
    if (style === "bless") {
      handles.push(emitShockwave3d(params.scene, params.to, { flash: flash || "gold_soft", scale, radius: 1.2, durationMs: 720 }));
      handles.push(emitFlashDisc3d(params.scene, params.to, flash || "gold_soft", scale));
      handles.push(emitBurst3d(params.scene, params.to, flash || "gold_soft", scale));
      handles.push(
        emitForgeSheetAt(params.scene, params.to, "radiance_aura", {
          durationMs: 680,
          w: 2.6,
          h: 2.6,
          y: 0.45,
          spin: true,
          scale,
          color: 0xfde68a,
        })
      );
      return;
    }
    // Hồn packs (rồng/xà/hổ/sói/thủy/lôi/phong) — 4 pha, tự nổ lúc tới đích
    {
      const hon = honPackForStyle(style, flash);
      if (hon) {
        if (phase === "impact") return;
        handles.push(emitHonSpiritSequence3d(params.scene, params.from, params.to, { scale, pack: hon }));
        return;
      }
    }
    if (style === "roar") {
      handles.push(emitShockwave3d(params.scene, params.from, { flash, scale, radius: 3.0, durationMs: 680 }));
      handles.push(emitBurst3d(params.scene, params.from, flash, scale));
      handles.push(emitDust3d(params.scene, params.from, scale));
      return;
    }
    if (style === "rush" || style === "charge") {
      handles.push(emitDust3d(params.scene, params.from, scale));
      handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
      handles.push(
        emitForgeSheetAt(params.scene, params.from, "earth_burst", {
          durationMs: 360,
          w: 1.8,
          h: 1.8,
          y: 0.25,
          scale,
          color: 0xf5d0a9,
        })
      );
      const dur = style === "charge" ? 360 : 280;
      handles.push(
        emitCoreFlight3d(params.scene, params.from, params.to, {
          flash,
          scale,
          durationMs: dur,
          arc: style === "charge" ? 0.12 : 0.18,
          size: style === "charge" ? 0.22 : 0.18,
        })
      );
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: dur,
          density: style === "charge" ? 12 : 10,
          arc: style === "charge" ? 0.1 : 0.16,
          scale,
          streak: true,
        })
      );
      if (style === "charge") {
        handles.push(emitDust3d(params.scene, params.from.clone().lerp(params.to, 0.45), scale));
      }
      return;
    }
    if (style === "beam" || style === "tide" || style === "poison" || style === "shadow") {
      handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
      const forge = forgePackForStyle(style, flash);
      if (forge) {
        handles.push(
          emitForgeSheetAt(params.scene, params.from, forge, {
            durationMs: 420,
            w: 2.0,
            h: 2.0,
            y: 0.4,
            scale,
            color: 0xffffff,
          })
        );
      }
      const dur = style === "beam" ? 420 : 480;
      handles.push(
        emitCoreFlight3d(params.scene, params.from, params.to, {
          flash,
          scale,
          durationMs: dur,
          arc: style === "tide" ? 0.4 : style === "poison" ? 0.32 : 0.25,
          size: style === "shadow" ? 0.2 : 0.16,
        })
      );
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: dur,
          density: style === "poison" ? 11 : 8,
          arc: style === "tide" ? 0.38 : 0.22,
          scale,
          streak: style === "beam" || style === "shadow",
        })
      );
      return;
    }
    if (style === "nova") {
      handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
      handles.push(
        emitForgeSheetAt(params.scene, params.from, "explosion_burst", {
          durationMs: 560,
          w: 2.8,
          h: 2.8,
          y: 0.4,
          scale,
          color: 0xffedd5,
        })
      );
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: 520,
          density: 8,
          arc: 0.55,
          scale,
        })
      );
      return;
    }
    if (style === "whirl") {
      handles.push(emitShockwave3d(params.scene, params.from, { flash, scale, radius: 2.2, durationMs: 700 }));
      handles.push(emitDust3d(params.scene, params.from, scale));
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: 450,
          density: 9,
          arc: 0.5,
          scale,
        })
      );
      return;
    }

    // slash — wide crescent + forge impact sheet
    handles.push(emitDust3d(params.scene, params.from, scale));
    handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
    {
      const forge = forgePackForStyle("slash", flash);
      if (forge) {
        handles.push(
          emitForgeSheetAt(params.scene, params.from, forge, {
            durationMs: 400,
            w: 2.2,
            h: 2.2,
            y: 0.4,
            scale,
            color: 0xffffff,
          })
        );
      }
      handles.push(
        emitItchStylizedAt(params.scene, params.from, "slash_a", 2, {
          durationMs: 380,
          w: 2.4,
          h: 2.4,
          y: 0.45,
          scale,
          color: 0xffffff,
        })
      );
    }
    handles.push(
      emitTrail3d(params.scene, params.from, params.to, {
        flash,
        durationMs: 400,
        density: 9,
        arc: 0.28,
        scale,
        streak: true,
      })
    );
    _tmp.copy(params.from);
    _tmp2.copy(params.to).sub(params.from);
    const side = new THREE.Vector3(-_tmp2.z, 0, _tmp2.x).normalize().multiplyScalar(0.25);
    handles.push(
      emitTrail3d(params.scene, params.from.clone().add(side), params.to.clone().add(side), {
        flash,
        durationMs: 380,
        density: 5,
        arc: 0.35,
        scale,
      })
    );
  };

  const runImpact = () => {
    // Hồn spirit tự nổ khi tới đích — tránh nổ sớm
    if (honPackForStyle(style, flash)) return;
    handles.push(emitBurst3d(params.scene, params.to, flash, scale));
    handles.push(emitDust3d(params.scene, params.to, scale));
    const forgeHit = forgePackForStyle(style, flash);
    if (forgeHit && style !== "barrier" && style !== "bless") {
      handles.push(
        emitForgeSheetAt(params.scene, params.to, forgeHit, {
          durationMs: 480,
          w: 2.5,
          h: 2.5,
          y: 0.35,
          scale,
          color: 0xffffff,
        })
      );
    }
    const fHit = (flash || "").toLowerCase();
    if (fHit === "thunder" || fHit === "storm") {
      handles.push(
        emitItchStylizedAt(params.scene, params.to, "lightning", 1, {
          durationMs: 420,
          w: 2.6,
          h: 1.4,
          y: 0.55,
          scale,
          color: 0xe9d5ff,
        })
      );
    } else if (style === "beam" || style === "bless") {
      handles.push(
        emitItchStylizedAt(params.scene, params.to, "flash", 3, {
          durationMs: 400,
          w: 2.0,
          h: 2.0,
          y: 0.4,
          scale,
          color: 0xffffff,
        })
      );
    }
    if (style === "roar" || style === "nova" || style === "whirl") {
      handles.push(
        emitShockwave3d(params.scene, params.to, {
          flash,
          scale,
          radius: style === "nova" ? 2.2 : 1.9,
          durationMs: 480,
        })
      );
    } else if (style === "rush" || style === "charge") {
      handles.push(emitFlashDisc3d(params.scene, params.to, flash, scale));
      if (style === "charge") {
        handles.push(emitShockwave3d(params.scene, params.to, { flash, scale, radius: 1.4, durationMs: 400 }));
      }
    } else if (style === "barrier" || style === "bless") {
      handles.push(emitFlashDisc3d(params.scene, params.to, flash || "gold_soft", scale));
    } else if (style === "tide" || style === "poison" || style === "shadow" || style === "beam") {
      handles.push(emitFlashDisc3d(params.scene, params.to, flash, scale));
      if (style === "poison" || style === "shadow") {
        handles.push(emitShockwave3d(params.scene, params.to, { flash, scale, radius: 1.35, durationMs: 420 }));
      }
    }
  };

  if (phase === "emission") runEmission();
  else if (phase === "impact") runImpact();
  else {
    runEmission();
    // Hồn packs đã tự schedule impact trong emission
    if (!honPackForStyle(style, flash)) {
      const delay = style === "rush" || style === "charge" ? 280 : style === "nova" ? 480 : 380;
      timers.push(
        trackTimer(delay, () => {
          if (params.scene) runImpact();
        })
      );
    }
  }

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
}): Fx3dHandle {
  const style = resolveFx3dStyle({
    flash: params.flash,
    motif: params.motif,
    pattern: params.pattern,
    support: params.support,
  });
  const kids: Fx3dHandle[] = [];
  const list = params.targets.length ? params.targets : [params.from];
  const phase = params.phase || "emission";
  list.forEach((to, i) => {
    const delay = i * (style === "nova" || style === "roar" ? 40 : 55);
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
      const pulse = 1 + 0.12 * Math.sin(t * Math.PI * 6);
      fx.obj.scale.setScalar(pulse * (1 - t * 0.12));
      fx.obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshBasicMaterial;
        const base = m === fx.obj.children[1] ? 0.95 : 0.35;
        mat.opacity = t < 0.82 ? base : Math.max(0, base * (1 - (t - 0.82) / 0.18));
      });
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
    } else if (fx.kind === "spirit" && fx.from && fx.to) {
      const formMs = fx.formMs || 0;
      const age = now - fx.born;
      const inForm = formMs > 0 && age < formMs;
      // form: đứng tại caster; bay: u 0→1 trên phần flight còn lại
      const flightAge = Math.max(0, age - (fx.flightDelayMs || formMs));
      const flightLife = Math.max(1, fx.lifeMs - (fx.flightDelayMs || formMs));
      const headU = inForm
        ? 0
        : (() => {
            const u = Math.min(1, flightAge / flightLife);
            return u * u * (3 - 2 * u);
          })();
      const arc = fx.arc || 0.35;
      const side = fx.side || 0;
      const pulse = 1 + 0.035 * Math.sin(t * Math.PI * 3);
      const fade = t > 0.88 ? Math.max(0, 1 - (t - 0.88) / 0.12) : 1;

      if (inForm) {
        _tmp.copy(fx.from);
        _tmp.y += 0.35 + Math.sin((age / formMs) * Math.PI) * 0.18;
      } else {
        sampleSpiritPath(fx.from, fx.to, headU, arc, side, _tmp, 0.04, now * 0.004);
      }
      fx.obj.position.copy(_tmp);

      const face = fx.facing ?? spiritFacing(fx.from, fx.to);
      fx.facing = face;
      const formScale = inForm ? 0.55 + 0.45 * Math.min(1, age / formMs) : 1;
      const s = pulse * (fx.baseScale || 1) * formScale;
      fx.obj.scale.setScalar(s);
      if (fx.mixer) fx.mixer.update(dtSec);
      // Hướng mũi theo vận tốc quỹ đạo (look-ahead)
      const lookU = Math.min(1, headU + 0.04);
      if (inForm) {
        _tmp2.copy(fx.to).sub(fx.from);
      } else {
        sampleSpiritPath(fx.from, fx.to, lookU, arc, side, _tmp2, 0.04, now * 0.004);
        _tmp2.sub(_tmp);
      }
      if (_tmp2.lengthSq() > 1e-8) {
        fx.obj.rotation.y = Math.atan2(_tmp2.x, _tmp2.z) + (fx.yawOffset || 0);
      }
      fx.obj.rotation.z = Math.sin(headU * Math.PI) * 0.12 * face;
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
        }
      });
    } else if (fx.kind === "flash") {
      const s = 0.6 + ease * 1.4;
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
        mat.opacity = Math.max(0, 1 - t);
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
  }
}
