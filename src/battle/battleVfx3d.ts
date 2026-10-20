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
  kind: "ring" | "core" | "flash" | "spirit" | "spin" | "bolt";
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
          { folder: "codemanu", pack: "charged", n: 16, w: 3.2, h: 3.2, opacity: 0.88 },
          { folder: "brackeys", pack: "ember_burst", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "codemanu", pack: "elden_ring", n: 16, w: 2.6, h: 2.6, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 3.0, h: 3.0, opacity: 0.75 },
          { folder: "codemanu", pack: "dithered_fire", n: 16, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
        flight: { urls: br("fire_point", 12), w: 2.0, h: 2.0 },
        hit: [
          { folder: "codemanu", pack: "explosion", n: 16, w: 3.4, h: 3.4, opacity: 0.95 },
          { folder: "codemanu", pack: "kabooms", n: 16, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "brackeys", pack: "explosion_burst", n: 16, w: 2.6, h: 2.6, opacity: 0.7 },
          { folder: "spritepilot", pack: "explosion", n: 10, w: 2.2, h: 2.2, opacity: 0.9 },
        ],
      };
    case "hon_loi":
      return {
        charge: [
          { folder: "codemanu", pack: "electric_shield", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "charged", n: 16, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "brackeys", pack: "storm_burst", n: 16, w: 2.6, h: 2.6, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "codemanu", pack: "electric_shield", n: 16, w: 2.4, h: 2.4, opacity: 0.75 },
        ],
        flight: { urls: br("storm_burst", 12), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 16, w: 3.2, h: 3.2, opacity: 0.95 },
          { folder: "brackeys", pack: "storm_burst", n: 16, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.4, h: 2.4, opacity: 0.95 },
        ],
      };
    case "hon_xa":
      return {
        charge: [
          { folder: "codemanu", pack: "tentacles", n: 16, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "codemanu", pack: "worm", n: 16, w: 2.6, h: 2.6, opacity: 0.7 },
          { folder: "superpowers", pack: "sp_smoke", n: 6, w: 2.4, h: 2.4, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "smoke_puff", n: 8, w: 2.2, h: 2.2, opacity: 0.75 },
        ],
        flight: { urls: sp("sp_smoke", 6), w: 1.8, h: 1.8 },
        hit: [
          { folder: "codemanu", pack: "impact", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "puff_stars", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "spritepilot", pack: "smoke_puff", n: 8, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
      };
    case "hon_thuy":
      return {
        charge: [
          { folder: "codemanu", pack: "anima", n: 16, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "brackeys", pack: "water_wave", n: 12, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "codemanu", pack: "elden_ring", n: 16, w: 2.5, h: 2.5, opacity: 0.65 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "water_splash", n: 9, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
        flight: { urls: br("water_wave", 12), w: 1.9, h: 1.9 },
        hit: [
          { folder: "spritepilot", pack: "water_splash", n: 9, w: 3.0, h: 3.0, opacity: 0.95 },
          { folder: "brackeys", pack: "water_wave", n: 12, w: 2.8, h: 2.8, opacity: 0.8 },
          { folder: "codemanu", pack: "impact", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
        ],
      };
    case "hon_phong":
      return {
        charge: [
          { folder: "codemanu", pack: "wheel", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "codemanu", pack: "anima", n: 16, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "codemanu", pack: "constellation", n: 16, w: 2.4, h: 2.4, opacity: 0.7 },
        ],
        flight: { urls: cm("vortex", 16), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "codemanu", pack: "wheel", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
          { folder: "spritepilot", pack: "landing_dust", n: 7, w: 2.4, h: 2.4, opacity: 0.85 },
        ],
      };
    case "hon_ho":
      return {
        charge: [
          { folder: "codemanu", pack: "charged", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
          { folder: "codemanu", pack: "charged", n: 16, w: 2.8, h: 2.8, opacity: 0.75 },
          { folder: "brackeys", pack: "hit_burst", n: 11, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "superpowers", pack: "sp_shock", n: 7, w: 2.4, h: 2.4, opacity: 0.8 },
        ],
        flight: { urls: sp("sp_shock", 7), w: 1.9, h: 1.9 },
        hit: [
          { folder: "codemanu", pack: "big_hit", n: 16, w: 3.2, h: 3.2, opacity: 0.95 },
          { folder: "brackeys", pack: "hit_burst", n: 11, w: 2.8, h: 2.8, opacity: 0.85 },
          { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.4, h: 2.4, opacity: 0.95 },
        ],
      };
    case "hon_soi":
      return {
        charge: [
          { folder: "codemanu", pack: "constellation", n: 16, w: 3.0, h: 3.0, opacity: 0.85 },
          { folder: "codemanu", pack: "charged", n: 16, w: 2.7, h: 2.7, opacity: 0.75 },
          { folder: "brackeys", pack: "shadow_burst", n: 16, w: 2.5, h: 2.5, opacity: 0.7 },
        ],
        form: [
          { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.7 },
          { folder: "spritepilot", pack: "smoke_puff", n: 8, w: 2.3, h: 2.3, opacity: 0.75 },
        ],
        flight: { urls: sp("sp_ember_trail", 12), w: 1.8, h: 1.8 },
        hit: [
          { folder: "codemanu", pack: "impact", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
          { folder: "brackeys", pack: "shadow_burst", n: 16, w: 2.6, h: 2.6, opacity: 0.8 },
          { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.3, h: 2.3, opacity: 0.9 },
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

/** Palette / size rồng theo skillId — giữ identity motif (Hỏa ≠ Thanh ≠ Bạch). */
function dragonVariantFromSkillId(skillId?: string | null): {
  tint: number | null;
  emissive: number | null;
  sizeMul: number;
  arcMul: number;
  hot: boolean;
} {
  const id = String(skillId || "").toLowerCase();
  if (!id) return { tint: null, emissive: null, sizeMul: 1, arcMul: 1, hot: false };
  if (/bach_long|ngan_long/.test(id))
    return { tint: 0xe8eef7, emissive: 0xf8fafc, sizeMul: 1.08, arcMul: 1.05, hot: false };
  if (/thanh_long|thuong_long/.test(id))
    return { tint: 0x38bdf8, emissive: 0x0ea5e9, sizeMul: 1.1, arcMul: 1.08, hot: false };
  if (/viem_long|xich_long|hoa_long/.test(id))
    return { tint: 0xff6a1a, emissive: 0xff3b00, sizeMul: 1.14, arcMul: 0.95, hot: true };
  if (/thien_long|ba_vuong|phi_long|troi_long/.test(id))
    return { tint: 0xffa04a, emissive: 0xff5a10, sizeMul: 1.22, arcMul: 1.12, hot: true };
  return { tint: null, emissive: null, sizeMul: 1, arcMul: 1, hot: false };
}

/** Pattern → arc/side/stagger cho emission đọc được khác nhau. */
function patternFlightTune(pattern?: string | null): { arcMul: number; side: number; densityMul: number } {
  const p = String(pattern || "single").toLowerCase();
  if (p === "all" || p === "ally_all") return { arcMul: 0.88, side: 0.22, densityMul: 1.25 };
  if (p === "column") return { arcMul: 1.18, side: 0.06, densityMul: 1.1 };
  if (p === "row" || p === "front_row") return { arcMul: 0.72, side: 0.16, densityMul: 1.05 };
  return { arcMul: 1, side: 0.1, densityMul: 1 };
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
 * Flipbook bay theo cung caster → địch (đầu đạn nhìn rõ).
 * Sheet mỏng thì chồng với emitCoreFlight3d.
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
  } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const durationMs = opts.durationMs ?? 480;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];
  const start = from.clone();
  start.y = Math.max(from.y, opts.yLift ?? 0.9);
  const end = to.clone();
  end.y = Math.max(to.y, opts.yLift ?? 0.9);

  void loadFrameSet(frameUrls)
    .then((frames) => {
      if (cancelled.v || !scene || !frames.length) return;
      const mat = new THREE.SpriteMaterial({
        map: frames[0],
        color: opts.color ?? 0xffffff,
        transparent: true,
        opacity: opts.opacity ?? 0.98,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const spr = new THREE.Sprite(mat);
      spr.scale.set((opts.w ?? 1.4) * mul, (opts.h ?? 1.4) * mul, 1);
      spr.position.copy(start);
      spr.renderOrder = 60;
      const now = performance.now();
      handles.push(
        pushMesh(scene, {
          id: nextId++,
          obj: spr,
          until: now + durationMs + 80,
          kind: "bolt",
          born: now,
          lifeMs: durationMs,
          from: start,
          to: end,
          arc: opts.arc ?? 0.5,
          frames,
          frameI: 0,
          nextFrame: now + (opts.frameMs ?? 55),
          frameMs: opts.frameMs ?? 55,
          spriteMat: mat,
          baseOpacity: opts.opacity ?? 0.98,
          baseScale: 1,
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
  if (style === "slash") return { urls: sp("sp_slash", 8), w: 2.15, h: 2.15 };
  if (style === "nova" || f === "fire" || f === "fire_rain" || f === "orange" || f === "red_fire")
    return { urls: cm("pixel_fire", 16), w: 2.2, h: 2.2 };
  if (f === "thunder" || f === "storm") return { urls: br("storm_burst", 12), w: 2.2, h: 2.2 };
  if (style === "tide" || f === "blue_water" || f === "cyan" || f === "teal" || f === "white_blue")
    return { urls: br("water_wave", 12), w: 2.15, h: 2.15 };
  if (style === "beam" || style === "shadow" || f === "bagua" || f === "purple" || f === "violet")
    return { urls: sp("sp_magic", 6), w: 2.1, h: 2.1 };
  if (style === "poison") return { urls: cm("worm", 16), w: 2.0, h: 2.0 };
  if (style === "rush" || style === "charge") return { urls: br("muzzle_seq", 5), w: 1.9, h: 1.9 };
  if (style === "roar") return { urls: sp("sp_shock", 7), w: 2.2, h: 2.2 };
  if (style === "whirl") return { urls: cm("vortex", 16), w: 2.15, h: 2.15 };
  if (style === "bless") return { urls: cm("anima", 16), w: 2.0, h: 2.0 };
  if (style === "breath") return { urls: cm("dithered_fire", 16), w: 2.25, h: 2.25 };
  return { urls: st("arrow", 2), w: 2.0, h: 1.55 };
}

/** Profile bay caster → mục tiêu — size/sheet lớn hơn (core game không phèn). */
function flightProfile(style: Fx3dStyle, flash?: string): {
  durationMs: number;
  arc: number;
  size: number;
  density: number;
  sheetMul: number;
} {
  const f = (flash || "").toLowerCase();
  if (style === "charge") return { durationMs: 420, arc: 0.14, size: 0.48, density: 18, sheetMul: 1.35 };
  if (style === "rush") return { durationMs: 360, arc: 0.22, size: 0.44, density: 17, sheetMul: 1.4 };
  if (style === "nova") return { durationMs: 560, arc: 0.55, size: 0.58, density: 18, sheetMul: 1.45 };
  if (style === "tide") return { durationMs: 560, arc: 0.5, size: 0.52, density: 17, sheetMul: 1.4 };
  if (style === "poison") return { durationMs: 540, arc: 0.38, size: 0.48, density: 18, sheetMul: 1.35 };
  if (style === "shadow") return { durationMs: 520, arc: 0.34, size: 0.46, density: 16, sheetMul: 1.35 };
  if (style === "beam") {
    if (f === "thunder" || f === "storm") return { durationMs: 500, arc: 0.28, size: 0.52, density: 18, sheetMul: 1.4 };
    return { durationMs: 520, arc: 0.32, size: 0.5, density: 16, sheetMul: 1.4 };
  }
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
  const under = itchFrameUrls("codemanu", "impact", 16);
  const fire =
    style === "nova" || f === "fire" || f === "fire_rain" || f === "orange" || f === "red_fire";
  const thunder = f === "thunder" || f === "storm";

  if (style === "barrier") {
    return {
      cast: [
        { folder: "codemanu", pack: "elden_ring", n: 16, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "brackeys", pack: "ward_barrier", n: 16, w: 2.9, h: 2.9, opacity: 0.85 },
      ],
      hit: [],
      flightUnder: under,
    };
  }
  if (style === "bless") {
    return {
      cast: [
        { folder: "codemanu", pack: "anima", n: 16, w: 2.9, h: 2.9, opacity: 0.88 },
        { folder: "brackeys", pack: "radiance_aura", n: 16, w: 2.6, h: 2.6, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "puff_stars", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "brackeys", pack: "radiance_aura", n: 16, w: 2.7, h: 2.7, opacity: 0.85 },
        { folder: "superpowers", pack: "sp_heal", n: 6, w: 2.4, h: 2.4, opacity: 0.95 },
      ],
      flightUnder: itchFrameUrls("codemanu", "anima", 16),
    };
  }
  if (style === "slash") {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 16, w: 2.9, h: 2.9, opacity: 0.88 },
        { folder: "brackeys", pack: "hit_burst", n: 11, w: 2.5, h: 2.5, opacity: 0.8 },
        { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.0, h: 2.0, opacity: 0.85 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 16, w: 3.5, h: 3.5, opacity: 0.96 },
        { folder: "codemanu", pack: "impact", n: 16, w: 3.0, h: 3.0, opacity: 0.85 },
        { folder: "superpowers", pack: "sp_hit", n: 11, w: 2.7, h: 2.7, opacity: 0.98 },
        { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.5, h: 2.5, opacity: 0.95 },
      ],
      flightUnder: under,
    };
  }
  if (fire) {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "dithered_fire", n: 16, w: 2.7, h: 2.7, opacity: 0.8 },
        { folder: "brackeys", pack: "ember_burst", n: 16, w: 2.5, h: 2.5, opacity: 0.72 },
      ],
      hit: [
        { folder: "codemanu", pack: "explosion", n: 16, w: 3.6, h: 3.6, opacity: 0.95 },
        { folder: "codemanu", pack: "kabooms", n: 16, w: 3.0, h: 3.0, opacity: 0.85 },
        { folder: "brackeys", pack: "explosion_burst", n: 16, w: 2.8, h: 2.8, opacity: 0.78 },
      ],
      flightUnder: itchFrameUrls("codemanu", "pixel_fire", 16),
    };
  }
  if (thunder) {
    return {
      cast: [
        { folder: "codemanu", pack: "electric_shield", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "brackeys", pack: "storm_burst", n: 16, w: 2.7, h: 2.7, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 16, w: 3.4, h: 3.4, opacity: 0.95 },
        { folder: "brackeys", pack: "storm_burst", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.6, h: 2.6, opacity: 0.98 },
      ],
      flightUnder: under,
    };
  }
  if (style === "tide") {
    return {
      cast: [
        { folder: "codemanu", pack: "anima", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "brackeys", pack: "water_wave", n: 12, w: 2.7, h: 2.7, opacity: 0.82 },
      ],
      hit: [
        { folder: "spritepilot", pack: "water_splash", n: 9, w: 3.2, h: 3.2, opacity: 0.95 },
        { folder: "brackeys", pack: "water_wave", n: 12, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "impact", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
      ],
      flightUnder: itchFrameUrls("brackeys", "water_wave", 12),
    };
  }
  if (style === "poison") {
    return {
      cast: [
        { folder: "codemanu", pack: "tentacles", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "codemanu", pack: "worm", n: 16, w: 2.6, h: 2.6, opacity: 0.75 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 16, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "codemanu", pack: "puff_stars", n: 16, w: 2.8, h: 2.8, opacity: 0.8 },
        { folder: "spritepilot", pack: "smoke_puff", n: 8, w: 2.5, h: 2.5, opacity: 0.85 },
      ],
      flightUnder: itchFrameUrls("codemanu", "worm", 16),
    };
  }
  if (style === "shadow") {
    return {
      cast: [
        { folder: "codemanu", pack: "vortex", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "brackeys", pack: "shadow_burst", n: 16, w: 2.7, h: 2.7, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 16, w: 3.2, h: 3.2, opacity: 0.9 },
        { folder: "brackeys", pack: "shadow_burst", n: 16, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "codemanu", pack: "vortex", n: 16, w: 2.5, h: 2.5, opacity: 0.7 },
      ],
      flightUnder: under,
    };
  }
  if (style === "beam") {
    const bagua = f === "bagua" || f === "blue" || f === "purple" || f === "violet";
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "codemanu", pack: "constellation", n: 16, w: 2.8, h: 2.8, opacity: 0.82 },
        {
          folder: "codemanu",
          pack: bagua ? "elden_ring" : "anima",
          n: 16,
          w: 2.5,
          h: 2.5,
          opacity: 0.72,
        },
      ],
      hit: [
        { folder: "codemanu", pack: "anima", n: 16, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "brackeys", pack: "arcane_burst", n: 16, w: 3.0, h: 3.0, opacity: 0.88 },
        { folder: "superpowers", pack: "sp_magic", n: 6, w: 2.6, h: 2.6, opacity: 0.96 },
        { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.4, h: 2.4, opacity: 0.9 },
      ],
      flightUnder: under,
    };
  }
  if (style === "roar") {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 16, w: 3.0, h: 3.0, opacity: 0.9 },
        { folder: "superpowers", pack: "sp_shock", n: 7, w: 2.7, h: 2.7, opacity: 0.78 },
      ],
      hit: [
        { folder: "codemanu", pack: "big_hit", n: 16, w: 3.5, h: 3.5, opacity: 0.95 },
        { folder: "superpowers", pack: "sp_shock", n: 7, w: 2.9, h: 2.9, opacity: 0.9 },
        { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.5, h: 2.5, opacity: 0.95 },
      ],
      flightUnder: under,
    };
  }
  if (style === "whirl") {
    return {
      cast: [
        { folder: "codemanu", pack: "wheel", n: 16, w: 3.1, h: 3.1, opacity: 0.9 },
        { folder: "codemanu", pack: "vortex", n: 16, w: 2.8, h: 2.8, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "wheel", n: 16, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "codemanu", pack: "big_hit", n: 16, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "spritepilot", pack: "landing_dust", n: 7, w: 2.6, h: 1.5, opacity: 0.88 },
      ],
      flightUnder: itchFrameUrls("codemanu", "vortex", 16),
    };
  }
  if (style === "rush" || style === "charge") {
    return {
      cast: [
        { folder: "codemanu", pack: "charged", n: 16, w: 2.9, h: 2.9, opacity: 0.88 },
        { folder: "brackeys", pack: "earth_burst", n: 16, w: 2.6, h: 2.6, opacity: 0.8 },
      ],
      hit: [
        { folder: "codemanu", pack: "impact", n: 16, w: 3.3, h: 3.3, opacity: 0.92 },
        { folder: "brackeys", pack: "earth_burst", n: 16, w: 2.9, h: 2.9, opacity: 0.85 },
        { folder: "spritepilot", pack: "landing_dust", n: 7, w: 2.8, h: 1.6, opacity: 0.9 },
      ],
      flightUnder: under,
    };
  }
  // fallback generic combat
  return {
    cast: [
      { folder: "codemanu", pack: "charged", n: 16, w: 2.8, h: 2.8, opacity: 0.88 },
      { folder: "brackeys", pack: "hit_burst", n: 11, w: 2.5, h: 2.5, opacity: 0.78 },
    ],
    hit: [
      { folder: "codemanu", pack: "explosion2", n: 16, w: 3.3, h: 3.3, opacity: 0.92 },
      { folder: "codemanu", pack: "impact", n: 16, w: 2.9, h: 2.9, opacity: 0.82 },
      { folder: "spritepilot", pack: "hit_spark", n: 6, w: 2.5, h: 2.5, opacity: 0.95 },
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
  scale?: string | null
): Fx3dHandle[] {
  const handles: Fx3dHandle[] = [];
  const prof = flightProfile(style, flash);
  const bolt = boltUrlsForStyle(style, flash);
  const premium = skillPremiumLayers(style, flash);
  handles.push(
    emitCoreFlight3d(scene, from, to, {
      flash,
      scale,
      durationMs: prof.durationMs,
      arc: prof.arc,
      size: prof.size,
    })
  );
  // Underlay CodeManu (đậm) rồi overlay element
  handles.push(
    emitFlyingSheet3d(scene, from, to, premium.flightUnder, {
      durationMs: prof.durationMs,
      w: bolt.w * prof.sheetMul * 1.15,
      h: bolt.h * prof.sheetMul * 1.15,
      arc: prof.arc,
      scale,
      color: 0xffffff,
      frameMs: 52,
      yLift: 0.95,
    })
  );
  handles.push(
    emitFlyingSheet3d(scene, from, to, bolt.urls, {
      durationMs: prof.durationMs,
      w: bolt.w * prof.sheetMul,
      h: bolt.h * prof.sheetMul,
      arc: prof.arc * 1.02,
      scale,
      color: 0xffffff,
      frameMs: 44,
      yLift: 1.05,
    })
  );
  handles.push(
    emitTrail3d(scene, from, to, {
      flash,
      durationMs: prof.durationMs,
      density: prof.density,
      arc: prof.arc * 0.92,
      scale,
      streak: true,
    })
  );
  return handles;
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
    /** Override glow (Thanh Long lam / Bạch Long bạc…) */
    emissive?: number;
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
  const glow = opts.emissive ?? pack.emissive;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];

  const start = () => {
    if (cancelled.v || !scene) return;
    void loadHonGlbTemplate(pack.glb)
      .then((tpl) => {
        if (cancelled.v || !scene) return;
        const { group, mixer } = buildHon3dSpirit(tpl, size, glow);
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
 * Chuỗi Hồn 8 lớp — GLB + CodeManu/Brackeys/SpritePilot (chuẩn breath / poison / roar…).
 * 1 sigil · 2 aura · 3 GLB · 4 trail · 5 impact · 6 ground mark · 7 residual · 8 cam ở BattleRenderer
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
  } = {}
): Fx3dHandle {
  const packId = opts.pack || "hon_rong";
  const pack = HON_PACKS[packId];
  const layers = honElementLayers(packId);
  const variant = packId === "hon_rong" ? dragonVariantFromSkillId(opts.skillId) : {
    tint: null as number | null,
    emissive: null as number | null,
    sizeMul: 1,
    arcMul: 1,
    hot: false,
  };
  const tune = patternFlightTune(opts.pattern);
  const tint = variant.tint ?? pack.tint;
  const tintHot = new THREE.Color(tint).lerp(new THREE.Color(0xfffbeb), variant.hot ? 0.35 : 0.45).getHex();
  const tintDeep = new THREE.Color(tint).multiplyScalar(0.68).getHex();
  const mul = scaleMul(opts.scale) * (variant.sizeMul > 1 ? 1 + (variant.sizeMul - 1) * 0.35 : 1);
  const CHARGE_MS = 580;
  const FORM_MS = 460;
  const FLIGHT_MS = 1180;
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const cancelled = { v: false };
  const ground = from.clone();
  ground.y = Math.min(from.y, 0.12);
  const flightArc = 0.85 * variant.arcMul * tune.arcMul;
  const flightSide = tune.side;

  const pushLayer = (at: THREE.Vector3, ref: HonLayerRef, extra: ItchSheetOpts = {}) => {
    handles.push(
      emitItchFolderPackAt(scene, at, ref.folder, ref.pack, ref.n, {
        durationMs: extra.durationMs ?? CHARGE_MS,
        w: (ref.w ?? 2.6) * mul,
        h: (ref.h ?? 2.6) * mul,
        opacity: ref.opacity ?? 0.85,
        y: extra.y ?? 0.35,
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
      loadFxTex(pack.orb),
    ]).then(([rings, crescents, sparkles, orbG]) => {
      if (cancelled.v || !scene) return;

      // 1) Ground sigil
      handles.push(
        emitGroundSigil3d(scene, ground, {
          flash: pack.flash,
          scale: opts.scale,
          durationMs: CHARGE_MS + FORM_MS,
          color: tint,
        })
      );
      layers.charge.forEach((ref, i) => {
        pushLayer(i === 0 ? ground : from, ref, {
          durationMs: CHARGE_MS + FORM_MS * 0.55,
          y: i === 0 ? 0.05 : 0.38 + i * 0.12,
          delayMs: i * 36,
          color: i === 0 ? tint : tintHot,
          spin: i === 0,
        });
      });
      if (rings.length) {
        handles.push(
          emitHonSheetAt(scene, ground, rings, {
            durationMs: CHARGE_MS + FORM_MS,
            w: 3.1 * mul,
            h: 1.7 * mul,
            opacity: 0.82,
            spin: true,
            spinSpeed: 3.1,
            y: 0.03,
            color: tint,
          })
        );
      }
      if (crescents.length) {
        handles.push(
          emitHonSheetAt(scene, ground, crescents, {
            durationMs: CHARGE_MS + 140,
            w: 2.45 * mul,
            h: 1.3 * mul,
            opacity: 0.7,
            spin: true,
            spinSpeed: -3.6,
            y: 0.07,
            delayMs: 50,
            color: tintDeep,
          })
        );
      }

      // 2) Body aura
      handles.push(
        emitBodyAura3d(scene, from, {
          flash: pack.flash,
          scale: opts.scale,
          durationMs: CHARGE_MS + FORM_MS * 0.4,
          color: tintHot,
          pack: packId === "hon_loi" ? "electric_shield" : "charged",
        })
      );
      if (sparkles.length) {
        handles.push(
          emitHonSheetAt(scene, from, sparkles, {
            durationMs: CHARGE_MS,
            w: 2.0 * mul,
            h: 2.0 * mul,
            opacity: 0.9,
            y: 0.48,
            color: tintHot,
          })
        );
      }

      // 3–4) Form GLB + secondary trail/particles
      timers.push(
        trackTimer(CHARGE_MS * 0.52, () => {
          if (cancelled.v || !scene) return;
          layers.form.forEach((ref, i) => {
            pushLayer(from, ref, {
              durationMs: FORM_MS + 200,
              y: 0.48 + i * 0.14,
              delayMs: i * 45,
              color: tintHot,
              spin: true,
            });
          });
          handles.push(
            emitDragonSpirit3d(scene, from, to, {
              durationMs: FLIGHT_MS,
              formMs: FORM_MS,
              scale: opts.scale,
              arc: flightArc,
              side: flightSide,
              size: 4.35 * variant.sizeMul,
              pack: packId,
              emissive: variant.emissive ?? undefined,
            })
          );
          handles.push(
            emitFlyingSheet3d(scene, from, to, layers.flight.urls, {
              durationMs: FORM_MS + FLIGHT_MS,
              w: layers.flight.w * 1.22,
              h: layers.flight.h * 1.22,
              arc: flightArc * 0.96,
              scale: opts.scale,
              color: tintHot,
              frameMs: 48,
              yLift: 1.08,
            })
          );
          handles.push(
            emitTrail3d(scene, from, to, {
              flash: pack.flash,
              durationMs: FORM_MS + FLIGHT_MS,
              density: Math.round(18 * tune.densityMul),
              arc: flightArc * 0.9,
              scale: opts.scale,
              streak: true,
            })
          );
          // Secondary particle ribbon
          handles.push(
            emitTrail3d(scene, from, to, {
              flash: pack.flash,
              durationMs: FORM_MS + FLIGHT_MS,
              density: Math.round(10 * tune.densityMul),
              arc: flightArc * 1.05,
              scale: opts.scale,
              streak: false,
            })
          );
        })
      );

      // 5–7) Impact core + ground mark + residual
      const hitAt = CHARGE_MS * 0.52 + FORM_MS + FLIGHT_MS - 40;
      timers.push(
        trackTimer(hitAt, () => {
          if (cancelled.v || !scene) return;
          const hit = to.clone();
          hit.y += 0.22;
          layers.hit.forEach((ref, i) => {
            pushLayer(hit, ref, {
              durationMs: 560 + i * 40,
              y: 0.22 + i * 0.09,
              delayMs: i * 32,
              color: i === 0 ? 0xffffff : tintHot,
            });
          });
          const orbSpr = makeFxSprite(orbG, tintHot, 0.98, 0.85 * mul, 0.85 * mul);
          orbSpr.position.copy(hit);
          const now = performance.now();
          handles.push(
            pushMesh(scene, {
              id: nextId++,
              obj: orbSpr,
              until: now + 520,
              kind: "flash",
              born: now,
              lifeMs: 520,
              spriteMat: orbSpr.material as THREE.SpriteMaterial,
              baseOpacity: 0.98,
            })
          );
          const orbOuter = makeFxSprite(orbG, tintDeep, 0.82, 1.4 * mul, 1.4 * mul);
          orbOuter.position.copy(hit);
          handles.push(
            pushMesh(scene, {
              id: nextId++,
              obj: orbOuter,
              until: now + 600,
              kind: "flash",
              born: now,
              lifeMs: 600,
              spriteMat: orbOuter.material as THREE.SpriteMaterial,
              baseOpacity: 0.82,
            })
          );
          if (sparkles.length) {
            handles.push(
              emitHonSheetAt(scene, hit, sparkles.slice(2), {
                durationMs: 480,
                w: 3.0 * mul,
                h: 3.0 * mul,
                opacity: 0.92,
                y: 0.1,
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
              durationMs: 780,
              color: tintDeep,
            })
          );
          handles.push(emitDust3d(scene, to, opts.scale));
          handles.push(
            emitResidual3d(scene, to, {
              flash: pack.flash,
              scale: opts.scale,
              delayMs: 120,
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
 * Full skill cast — 3D look per style (toàn catalog, 8 lớp khi hợp lý).
 */
export function playSkillFx3d(params: {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash?: string;
  scale?: string | null;
  phase?: "emission" | "impact" | "full";
  style?: Fx3dStyle;
  skillId?: string | null;
  pattern?: string | null;
}): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const timers: number[] = [];
  const flash = params.flash || "steel";
  const style = params.style || "slash";
  const phase = params.phase || "full";
  const scale = params.scale;
  const skillId = params.skillId;
  const pattern = params.pattern;
  const palHex = flashPalette(flash).base.getHex();
  const palHot = flashPalette(flash).hot.getHex();

  const runEmission = () => {
    const premium = skillPremiumLayers(style, flash);
    if (style === "barrier") {
      // 1–2–5 barrier: sigil + aura + ward (không projectile)
      handles.push(
        emitGroundSigil3d(params.scene, params.from, {
          flash: "shield",
          scale,
          durationMs: 980,
          color: 0x93c5fd,
        })
      );
      handles.push(
        emitBodyAura3d(params.scene, params.from, {
          flash: "shield",
          scale,
          durationMs: 900,
          color: 0xdbeafe,
          pack: "elden_ring",
        })
      );
      handles.push(emitShockwave3d(params.scene, params.from, { flash: "shield", scale, radius: 2.25, durationMs: 980 }));
      handles.push(emitFlashDisc3d(params.scene, params.from, "shield", scale));
      handles.push(emitBurst3d(params.scene, params.from, "gold_soft", scale));
      handles.push(...emitPremiumLayersAt(params.scene, params.from, premium.cast, { scale, durationMs: 820, color: 0xdbeafe }));
      return;
    }
    if (style === "bless") {
      handles.push(
        emitGroundSigil3d(params.scene, params.from, {
          flash: flash || "gold_soft",
          scale,
          durationMs: 560,
          color: 0xfde68a,
        })
      );
      handles.push(
        emitBodyAura3d(params.scene, params.from, {
          flash: flash || "gold_soft",
          scale,
          durationMs: 480,
          color: 0xfef08a,
          pack: "anima",
        })
      );
      handles.push(emitFlashDisc3d(params.scene, params.from, flash || "gold_soft", scale));
      handles.push(...emitPremiumLayersAt(params.scene, params.from, premium.cast, { scale, durationMs: 460, color: 0xfef08a }));
      handles.push(...emitHostileProjectile3d(params.scene, params.from, params.to, "bless", flash || "gold_soft", scale));
      return;
    }
    // Hồn packs — GLB + 8 lớp
    {
      const hon = honPackForStyle(style, flash);
      if (hon) {
        if (phase === "impact") return;
        handles.push(
          emitHonSpiritSequence3d(params.scene, params.from, params.to, {
            scale,
            pack: hon,
            skillId,
            pattern,
          })
        );
        return;
      }
    }

    // —— Core combat 8 lớp: sigil + aura + cast + projectile + (impact sau) ——
    handles.push(
      emitGroundSigil3d(params.scene, params.from, {
        flash,
        scale,
        durationMs: style === "nova" || style === "beam" ? 620 : 480,
        color: palHex,
      })
    );
    handles.push(
      emitBodyAura3d(params.scene, params.from, {
        flash,
        scale,
        durationMs: style === "slash" ? 380 : 460,
        color: palHot,
        pack: style === "beam" ? "constellation" : style === "shadow" ? "vortex" : "charged",
      })
    );
    handles.push(emitDust3d(params.scene, params.from, scale));
    handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
    handles.push(
      ...emitPremiumLayersAt(params.scene, params.from, premium.cast, {
        scale,
        durationMs: style === "nova" ? 520 : style === "beam" ? 480 : 420,
        y0: 0.28,
      })
    );
    if (style === "roar" || style === "whirl" || style === "nova" || style === "beam") {
      handles.push(
        emitShockwave3d(params.scene, params.from, {
          flash,
          scale,
          radius: style === "nova" ? 2.7 : style === "roar" ? 2.65 : style === "beam" ? 2.1 : 2.25,
          durationMs: 600,
        })
      );
    }
    // Slash: trail dày + sparks sớm (đọc lưỡi thép)
    if (style === "slash") {
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: 420,
          density: 22,
          arc: 0.28,
          scale,
          streak: true,
        })
      );
      handles.push(emitSparksBurst3d(params.scene, params.from, { flash, scale }));
    }
    if (style === "rush" || style === "charge") {
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: style === "charge" ? 640 : 480,
          density: style === "charge" ? 20 : 18,
          arc: style === "charge" ? 0.22 : 0.35,
          scale,
          streak: true,
        })
      );
    }
    handles.push(...emitHostileProjectile3d(params.scene, params.from, params.to, style, flash, scale));
    if (style === "charge") {
      handles.push(emitDust3d(params.scene, params.from.clone().lerp(params.to, 0.45), scale));
      handles.push(emitDust3d(params.scene, params.from.clone().lerp(params.to, 0.72), scale));
    }
  };

  const runImpact = () => {
    if (honPackForStyle(style, flash)) return;
    const premium = skillPremiumLayers(style, flash);
    // 5) Impact core + flash
    handles.push(emitBurst3d(params.scene, params.to, flash, scale));
    handles.push(emitFlashDisc3d(params.scene, params.to, flash, scale));
    handles.push(
      ...emitPremiumLayersAt(params.scene, params.to, premium.hit, {
        scale,
        durationMs: 580,
        y0: 0.28,
      })
    );
    // Slash / rush: sparks đọc được
    if (style === "slash" || style === "rush" || style === "charge" || style === "beam") {
      handles.push(emitSparksBurst3d(params.scene, params.to, { flash, scale }));
    }
    const fHit = (flash || "").toLowerCase();
    if (fHit === "thunder" || fHit === "storm" || (style === "beam" && fHit === "bagua")) {
      handles.push(
        emitItchFolderPackAt(params.scene, params.to, "stylized", "lightning", 1, {
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
    // 6) Ground mark đích
    handles.push(
      emitGroundMark3d(params.scene, params.to, {
        flash,
        scale,
        durationMs: style === "nova" ? 900 : 700,
        color: flashPalette(flash).cool.getHex(),
      })
    );
    // 7) Debris / residual
    handles.push(emitDust3d(params.scene, params.to, scale));
    handles.push(emitResidual3d(params.scene, params.to, { flash, scale, delayMs: 90 }));

    if (style === "roar" || style === "nova" || style === "whirl" || style === "slash") {
      handles.push(
        emitShockwave3d(params.scene, params.to, {
          flash,
          scale,
          radius: style === "nova" ? 3.15 : style === "slash" ? 2.15 : 2.45,
          durationMs: 660,
        })
      );
    } else if (style === "rush" || style === "charge") {
      handles.push(emitShockwave3d(params.scene, params.to, { flash, scale, radius: 2.0, durationMs: 500 }));
    } else if (style === "barrier" || style === "bless") {
      handles.push(emitFlashDisc3d(params.scene, params.to, flash || "gold_soft", scale));
      if (style === "bless") {
        handles.push(
          emitResidual3d(params.scene, params.to, {
            flash: flash || "gold_soft",
            scale,
            delayMs: 40,
            color: 0xfde68a,
          })
        );
      }
    } else if (style === "tide" || style === "poison" || style === "shadow" || style === "beam") {
      handles.push(emitShockwave3d(params.scene, params.to, { flash, scale, radius: 1.9, durationMs: 520 }));
    } else {
      handles.push(emitShockwave3d(params.scene, params.to, { flash, scale, radius: 1.7, durationMs: 480 }));
    }
  };

  if (phase === "emission") runEmission();
  else if (phase === "impact") runImpact();
  else {
    runEmission();
    if (!honPackForStyle(style, flash) && style !== "barrier") {
      const delay = flightProfile(style, flash).durationMs;
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
  skillId?: string | null;
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
      const e = ease;
      _tmp.copy(fx.from).lerp(fx.to, e);
      _tmp.y += Math.sin(e * Math.PI) * (fx.arc || 0.5);
      fx.obj.position.copy(_tmp);
      const spr = fx.obj as THREE.Sprite;
      const mat = fx.spriteMat || (spr.material as THREE.SpriteMaterial);
      if (mat && fx.frames && fx.frames.length > 1 && now >= (fx.nextFrame || 0)) {
        fx.frameI = ((fx.frameI || 0) + 1) % fx.frames.length;
        mat.map = fx.frames[fx.frameI];
        mat.needsUpdate = true;
        fx.nextFrame = now + (fx.frameMs || 55);
      }
      const pulse = 1 + 0.1 * Math.sin(t * Math.PI * 5);
      const grow = e < 0.15 ? 0.55 + (e / 0.15) * 0.45 : 1;
      if (!spr.userData.baseW) {
        spr.userData.baseW = spr.scale.x;
        spr.userData.baseH = spr.scale.y;
      }
      spr.scale.set(spr.userData.baseW * grow * pulse, spr.userData.baseH * grow * pulse, 1);
      const baseOp = fx.baseOpacity ?? 0.98;
      mat.opacity = Math.max(0, baseOp * (t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12));
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
