import * as THREE from "three";

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
  kind: "ring" | "core" | "flash" | "spirit";
  born: number;
  lifeMs: number;
  // ring
  maxScale?: number;
  // core / spirit flight
  from?: THREE.Vector3;
  to?: THREE.Vector3;
  arc?: number;
  side?: number;
  // volumetric dragon spirit (ribbon along flight path)
  segments?: THREE.Object3D[];
  segSpacing?: number;
  baseScale?: number;
  baseOpacity?: number;
};

const ACTIVE_EMIT: Emitter[] = [];
const ACTIVE_MESH: MeshFx[] = [];
let nextId = 1;
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

function glowSphereMat(color: number, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
}

function softSprite(color: number, opacity: number, scale: number): THREE.Sprite {
  const spr = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getSoftMap(),
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  spr.scale.setScalar(scale);
  spr.renderOrder = 58;
  return spr;
}

/** Sample quỹ đạo hồn long (arc + uốn ngang). */
function sampleSpiritPath(
  from: THREE.Vector3,
  to: THREE.Vector3,
  u: number,
  arc: number,
  side: number,
  out: THREE.Vector3
): void {
  const e = Math.max(0, Math.min(1, u));
  out.copy(from).lerp(to, e);
  out.y += Math.sin(e * Math.PI) * arc;
  if (side) {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const len = Math.hypot(dx, dz) || 1;
    out.x += (-dz / len) * Math.sin(e * Math.PI * 2.15) * side;
    out.z += (dx / len) * Math.sin(e * Math.PI * 2.15) * side;
  }
}

/**
 * Hồn rồng ethereal — chỉ soft glow (không silhouette vẽ tay).
 * segments[0]=đầu, [1..]=thân kéo dài theo path (tick đặt world pos).
 */
function buildDragonSpiritGroup(
  size: number,
  opacity: number,
  headOnly: boolean
): { group: THREE.Group; segments: THREE.Object3D[]; segSpacing: number } {
  const group = new THREE.Group();
  group.name = "fx3d-dragon-spirit";
  const segments: THREE.Object3D[] = [];

  // —— Đầu: lõi sáng + halo + sừng soft (ellipse glow, không nét vẽ) ——
  const head = new THREE.Group();
  head.userData.segI = 0;
  head.userData.role = "head";

  const headHalo = softSprite(0xffe08a, opacity * 0.7, size * 1.55);
  head.add(headHalo);
  const headMid = softSprite(0xfff6d0, opacity * 0.85, size * 0.95);
  head.add(headMid);
  const headCore = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.14, 16, 12),
    glowSphereMat(0xfffaf0, opacity * 0.9)
  );
  head.add(headCore);

  // Sừng = glow mềm kéo dài (không outline)
  for (const ox of [-0.22, 0.22]) {
    const horn = softSprite(0xffe8a8, opacity * 0.55, size * 0.42);
    horn.scale.set(size * 0.22, size * 0.55, 1);
    horn.position.set(ox * size, size * 0.38, 0);
    head.add(horn);
  }
  // Râu / mane wisps
  for (const [ox, oy] of [
    [-0.35, -0.05],
    [0.35, -0.05],
    [0, 0.35],
  ] as const) {
    const wisp = softSprite(0xff9a3a, opacity * 0.35, size * 0.5);
    wisp.position.set(ox * size, oy * size, -size * 0.05);
    head.add(wisp);
  }
  group.add(head);
  segments.push(head);

  // —— Thân: chuỗi orb mềm thon dần (đọc dáng rắn bay) ——
  const bodyN = headOnly ? 3 : 16;
  for (let i = 1; i <= bodyN; i++) {
    const t = i / bodyN;
    const seg = new THREE.Group();
    seg.userData.segI = i;
    seg.userData.role = "body";
    const rad = size * (1.05 - t * 0.72);
    const col = t < 0.25 ? 0xffd078 : t < 0.6 ? 0xff9a3a : 0xff6a20;
    const halo = softSprite(col, opacity * (0.62 - t * 0.38), rad);
    seg.add(halo);
    if (t < 0.7) {
      const core = softSprite(0xfff1c1, opacity * (0.4 - t * 0.25), rad * 0.45);
      seg.add(core);
    }
    group.add(seg);
    segments.push(seg);
  }

  return { group, segments, segSpacing: headOnly ? 0.03 : 0.038 };
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
  if (f === "dragon" || f === "fire" || f === "fire_rain" || f === "orange")
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
  if (f === "green_poison" || f === "poison" || f === "nature")
    return { base: new THREE.Color(0x4ade80), hot: new THREE.Color(0xdcfce7), cool: new THREE.Color(0x166534) };
  if (f === "rush" || f === "steel" || f === "iron" || f === "white")
    return { base: new THREE.Color(0xe2e8f0), hot: new THREE.Color(0xffffff), cool: new THREE.Color(0x64748b) };
  if (f === "brown" || f === "charge" || f === "earth")
    return { base: new THREE.Color(0xd2b48c), hot: new THREE.Color(0xf5e6c8), cool: new THREE.Color(0x785a3a) };
  if (f === "shield" || f === "pure")
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
 * Hồn rồng vàng ethereal — đầu dẫn + thân soft kéo dài theo quỹ đạo caster→địch.
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
  } = {}
): Fx3dHandle {
  const mul = scaleMul(opts.scale);
  const durationMs = opts.durationMs ?? 980;
  const delayMs = opts.delayMs ?? 0;
  const size = (opts.size ?? 1.35) * mul;
  const opacity = opts.opacity ?? 1;
  const cancelled = { v: false };
  const handles: Fx3dHandle[] = [];

  const start = () => {
    if (cancelled.v || !scene) return;
    const { group, segments, segSpacing } = buildDragonSpiritGroup(
      size,
      opacity,
      !!opts.headOnly
    );
    // Group chỉ là container — từng đốt đặt world pos trong tick
    group.position.set(0, 0, 0);

    const now = performance.now();
    handles.push(
      pushMesh(scene, {
        id: nextId++,
        obj: group,
        until: now + durationMs + 80,
        kind: "spirit",
        born: now,
        lifeMs: durationMs,
        from: from.clone(),
        to: to.clone(),
        arc: opts.arc ?? 0.65,
        side: opts.side ?? 0.22,
        segments,
        segSpacing,
        baseScale: 1,
        baseOpacity: opacity,
      })
    );
  };

  if (delayMs > 0) {
    const tid = window.setTimeout(start, delayMs);
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
 * Full skill cast — polished 3D look per style.
 */
export function playSkillFx3d(params: {
  scene: THREE.Scene;
  from: THREE.Vector3;
  to: THREE.Vector3;
  flash?: string;
  scale?: string | null;
  phase?: "emission" | "impact" | "full";
  style?: "slash" | "breath" | "roar" | "rush";
}): Fx3dHandle {
  const handles: Fx3dHandle[] = [];
  const flash = params.flash || "steel";
  const style = params.style || "slash";
  const phase = params.phase || "full";
  const scale = params.scale;

  const runEmission = () => {
    if (style === "roar") {
      handles.push(emitShockwave3d(params.scene, params.from, { flash, scale, radius: 3.0, durationMs: 680 }));
      handles.push(emitBurst3d(params.scene, params.from, flash, scale));
      handles.push(emitDust3d(params.scene, params.from, scale));
    }

    if (style === "rush" || style === "slash") {
      handles.push(emitDust3d(params.scene, params.from, scale));
      handles.push(emitFlashDisc3d(params.scene, params.from, flash, scale));
    }

    if (style === "breath") {
      // Hỏa Long — hồn long ethereal bay vào địch (không tem vẽ, không flash trắng)
      const flightMs = 1050;
      handles.push(
        emitDragonSpirit3d(params.scene, params.from, params.to, {
          durationMs: flightMs,
          scale,
          arc: 0.75,
          side: 0.32,
          size: 1.45,
        })
      );
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash: "dragon",
          durationMs: flightMs,
          density: 7,
          arc: 0.6,
          scale,
        })
      );
      return;
    }

    if (style === "rush") {
      handles.push(
        emitCoreFlight3d(params.scene, params.from, params.to, {
          flash,
          scale,
          durationMs: 280,
          arc: 0.18,
          size: 0.18,
        })
      );
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: 280,
          density: 10,
          arc: 0.16,
          scale,
          streak: true,
        })
      );
      return;
    }

    if (style === "roar") {
      handles.push(
        emitTrail3d(params.scene, params.from, params.to, {
          flash,
          durationMs: 400,
          density: 7,
          arc: 0.22,
          scale,
        })
      );
      return;
    }

    // slash — wide crescent feel via dense trail + side offset trail
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
    handles.push(emitBurst3d(params.scene, params.to, flash, scale));
    handles.push(emitDust3d(params.scene, params.to, scale));
    if (style === "breath") {
      handles.push(
        emitDragonSpirit3d(params.scene, params.to, params.to, {
          durationMs: 320,
          scale,
          arc: 0,
          side: 0,
          size: 1.6,
          headOnly: true,
          opacity: 0.95,
        })
      );
      handles.push(
        emitShockwave3d(params.scene, params.to, {
          flash: "dragon",
          scale,
          radius: 1.7,
          durationMs: 480,
        })
      );
    } else if (style === "roar") {
      handles.push(
        emitShockwave3d(params.scene, params.to, {
          flash,
          scale,
          radius: 1.9,
          durationMs: 480,
        })
      );
    }
    if (style === "rush") {
      handles.push(emitFlashDisc3d(params.scene, params.to, flash, scale));
    }
  };

  const timers: number[] = [];
  if (phase === "emission") runEmission();
  else if (phase === "impact") runImpact();
  else {
    runEmission();
    const delay = style === "breath" ? 980 : style === "rush" ? 250 : 380;
    timers.push(
      window.setTimeout(() => {
        if (params.scene) runImpact();
      }, delay)
    );
  }

  return {
    cancel() {
      timers.forEach(clearTimeout);
      handles.forEach((h) => h.cancel());
    },
  };
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
    } else if (fx.kind === "spirit" && fx.from && fx.to) {
      const headU = ease;
      const spacing = fx.segSpacing ?? 0.04;
      const arc = fx.arc || 0.55;
      const side = fx.side || 0;
      const pulse = 1 + 0.05 * Math.sin(t * Math.PI * 4);
      const fade = t > 0.88 ? Math.max(0, 1 - (t - 0.88) / 0.12) : 1;

      if (fx.segments) {
        for (const seg of fx.segments) {
          const i = (seg.userData.segI as number) || 0;
          const u = Math.max(0, headU - i * spacing);
          sampleSpiritPath(fx.from, fx.to, u, arc, side, _tmp);
          // sóng thân nhẹ theo thời gian
          _tmp.y += Math.sin(now * 0.009 + i * 0.55) * 0.06;
          seg.position.copy(_tmp);
          seg.visible = u > 0.001 || i === 0;
          const roleScale = seg.userData.role === "head" ? 1.05 * pulse : 1;
          seg.scale.setScalar(roleScale * (fx.baseScale || 1));
        }
      }

      fx.obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const spr = o as THREE.Sprite;
        if (mesh.isMesh) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          if (mat && mat.userData.baseOp == null) mat.userData.baseOp = mat.opacity;
          if (mat?.userData.baseOp != null) mat.opacity = mat.userData.baseOp * fade;
        } else if (spr.isSprite) {
          const mat = spr.material as THREE.SpriteMaterial;
          if (mat && mat.userData.baseOp == null) mat.userData.baseOp = mat.opacity;
          if (mat?.userData.baseOp != null) mat.opacity = mat.userData.baseOp * fade;
        }
      });
    } else if (fx.kind === "flash") {
      const s = 0.6 + ease * 1.4;
      fx.obj.scale.setScalar(s);
      const mat = (fx.obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - t);
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
