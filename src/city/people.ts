import * as THREE from "three";

/** Nhân vật dựng bằng khối + khung xương thủ công. Hướng mặt +Z, cao ~1.9 đơn vị. */

export type Role = "villager" | "farmer" | "soldier" | "miner" | "scholar";
export type Pose = "idle" | "guard" | "hoe" | "thrust" | "dig";

const FACTION_COLOR: Record<string, number> = { wei: 0x2f4f8f, shu: 0x3b7a3c, wu: 0xa3332a };
const SKIN = 0xe0b48c;
/** Tỉ lệ người so với khung dựng (cao ~1.9). Nhỏ để hợp tỉ lệ thành. */
export const PERSON_SCALE = 0.58;
/** Bước chân (đơn vị world/chu kỳ) — hơi dài để nhịp chậm, không trượt. */
const STRIDE = 0.95 * PERSON_SCALE;

const geo = {
  leg: new THREE.CylinderGeometry(0.075, 0.06, 0.62, 7).translate(0, -0.31, 0),
  foot: new THREE.BoxGeometry(0.13, 0.07, 0.24),
  robe: new THREE.CylinderGeometry(0.2, 0.31, 0.8, 10),
  tunic: new THREE.CylinderGeometry(0.21, 0.26, 0.58, 10),
  belt: new THREE.CylinderGeometry(0.215, 0.215, 0.07, 10),
  arm: new THREE.CylinderGeometry(0.058, 0.05, 0.55, 7).translate(0, -0.275, 0),
  hand: new THREE.SphereGeometry(0.06, 8, 6),
  head: new THREE.SphereGeometry(0.155, 12, 10),
  strawHat: new THREE.ConeGeometry(0.36, 0.2, 16),
  helmet: new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  plume: new THREE.ConeGeometry(0.04, 0.16, 6),
  pad: new THREE.BoxGeometry(0.14, 0.08, 0.2),
  officialHat: new THREE.BoxGeometry(0.2, 0.2, 0.22),
  headband: new THREE.TorusGeometry(0.15, 0.025, 6, 14),
  shaft: new THREE.CylinderGeometry(0.022, 0.022, 2.1, 6),
  tip: new THREE.ConeGeometry(0.05, 0.22, 6),
  handle: new THREE.CylinderGeometry(0.022, 0.022, 1.0, 6),
  blade: new THREE.BoxGeometry(0.22, 0.04, 0.16),
  crate: new THREE.BoxGeometry(0.4, 0.3, 0.3),
};

const matCache = new Map<number, THREE.MeshStandardMaterial>();
function mat(color: number, rough = 0.85, metal = 0): THREE.MeshStandardMaterial {
  const key = color * 10 + Math.round(metal * 9);
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    matCache.set(key, m);
  }
  return m;
}

function mesh(g: THREE.BufferGeometry, m: THREE.Material, shadow = false): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.castShadow = shadow;
  return o;
}

const VILLAGER_ROBES = [0x8a6a4a, 0x5d6f7d, 0xa58a62, 0x6e5848, 0x7d8a6a, 0x9a7a5a];

export interface Rig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  crate: THREE.Object3D;
  phase: number;
  walk: number;
  /** Chạy sau animateRig (gập gối/khuỷu cho rig có khớp phụ). */
  post?: () => void;
}

export function createRig(role: Role, faction: string, seed: number): Rig {
  const root = new THREE.Group();
  root.scale.setScalar(PERSON_SCALE);
  const body = new THREE.Group();
  root.add(body);
  const team = FACTION_COLOR[faction] ?? FACTION_COLOR.shu;
  const skin = mat(SKIN, 0.7);
  const dark = mat(0x2a2018);
  const cloth =
    role === "soldier" ? mat(team, 0.6, 0.15)
    : role === "scholar" ? mat(0x2c3e6b, 0.7)
    : role === "miner" ? mat(0x5a4a3c)
    : role === "farmer" ? mat(0x7a6a48)
    : mat(VILLAGER_ROBES[seed % VILLAGER_ROBES.length]);

  const hip = (x: number) => {
    const p = new THREE.Group();
    p.position.set(x, 0.68, 0);
    p.add(mesh(geo.leg, role === "soldier" ? mat(0x3a3028) : dark));
    const foot = mesh(geo.foot, dark);
    foot.position.set(0, -0.63, 0.05);
    p.add(foot);
    body.add(p);
    return p;
  };
  const legL = hip(0.1);
  const legR = hip(-0.1);

  if (role === "soldier" || role === "miner") {
    const t = mesh(geo.tunic, cloth, true);
    t.position.y = 1.0;
    body.add(t);
  } else {
    const r = mesh(geo.robe, cloth, true);
    r.position.y = 0.93;
    body.add(r);
  }
  const belt = mesh(geo.belt, role === "soldier" ? mat(0x6b4a22, 0.5, 0.3) : dark);
  belt.position.y = 1.02;
  body.add(belt);

  const shoulder = (x: number) => {
    const p = new THREE.Group();
    p.position.set(x, 1.27, 0);
    p.add(mesh(geo.arm, cloth));
    const hand = mesh(geo.hand, skin);
    hand.position.y = -0.57;
    p.add(hand);
    body.add(p);
    return p;
  };
  const armL = shoulder(0.27);
  const armR = shoulder(-0.27);

  const head = new THREE.Group();
  head.position.y = 1.47;
  head.add(mesh(geo.head, skin, true));
  body.add(head);

  if (role === "soldier") {
    const helm = mesh(geo.helmet, mat(0x8a8f96, 0.4, 0.6), true);
    helm.position.y = 0.02;
    head.add(helm);
    const plume = mesh(geo.plume, mat(0xb02a22));
    plume.position.y = 0.24;
    head.add(plume);
    for (const x of [0.27, -0.27]) {
      const pad = mesh(geo.pad, mat(0x8a8f96, 0.4, 0.6));
      pad.position.set(x, 1.3, 0);
      body.add(pad);
    }
    // cầm ở tay (y -0.57), chân thương chạm đất khi tay buông
    const spear = new THREE.Group();
    spear.position.y = -0.22;
    spear.add(mesh(geo.shaft, mat(0x6b4a2a)));
    const tip = mesh(geo.tip, mat(0xc8ccd2, 0.3, 0.8));
    tip.position.y = 1.1;
    spear.add(tip);
    armR.add(spear);
  } else if (role === "scholar") {
    const hat = mesh(geo.officialHat, dark);
    hat.position.y = 0.16;
    head.add(hat);
  } else if (role === "miner") {
    const band = mesh(geo.headband, mat(0x9c2b24));
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.05;
    head.add(band);
  } else {
    const hat = mesh(geo.strawHat, mat(0xcfae6a, 0.9), true);
    hat.position.y = 0.17;
    head.add(hat);
  }

  if (role === "farmer" || role === "miner") {
    const tool = new THREE.Group();
    tool.position.y = -0.57;
    const handle = mesh(geo.handle, mat(0x6b4a2a));
    handle.position.y = -0.2;
    tool.add(handle);
    const blade = mesh(geo.blade, mat(0x8a8f96, 0.4, 0.6));
    blade.position.set(0, -0.7, 0.08);
    tool.add(blade);
    armR.add(tool);
  }

  const crate = mesh(geo.crate, mat(0x8a6236));
  crate.position.set(0, 1.12, 0.32);
  crate.visible = false;
  body.add(crate);

  return { root, body, head, legL, legR, armL, armR, crate, phase: seed * 1.7, walk: 0 };
}

/** Một khung hình: moved = quãng đường vừa đi, speed01 = tốc độ chuẩn hoá. */
export function animateRig(rig: Rig, pose: Pose, moved: number, speed01: number, dt: number, t: number, carry: boolean, seed: number) {
  // Blend mềm khi tăng/giảm tốc → bước không “bật”.
  rig.walk += (speed01 - rig.walk) * Math.min(1, dt * 2.8);
  const w = rig.walk;
  const still = 1 - w;
  // Nhịp bước theo quãng đường; đứng yên thì đừng đạp chân giả.
  if (moved > 0) rig.phase += (moved / STRIDE) * Math.PI * 2;
  else if (w > 0.04) rig.phase += w * dt * 1.35;
  const p = rig.phase;
  // Sóng hơi méo (ease) → chân không quạt đều như máy.
  const s = Math.sin(p);
  const sSoft = Math.sign(s) * Math.pow(Math.abs(s), 0.85);
  // Đùi: biên độ vừa phải cho đi chậm; đạp nhẹ lúc chân trước.
  const hip = 0.58;
  const legL = (sSoft * hip + Math.max(0, s) * 0.08) * w;
  const legR = (-sSoft * hip + Math.max(0, -s) * 0.08) * w;
  // Nhún nhẹ đôi nhịp + nghiêng hông dịu.
  const bob = (0.5 - 0.5 * Math.cos(p * 2)) * 0.032 * w;
  const softLeg = Math.min(1, dt * 10);
  rig.legL.rotation.x += (legL - rig.legL.rotation.x) * softLeg;
  rig.legR.rotation.x += (legR - rig.legR.rotation.x) * softLeg;
  rig.body.position.y += (bob - rig.body.position.y) * softLeg;
  rig.body.rotation.z += (sSoft * 0.05 * w - rig.body.rotation.z) * softLeg;
  rig.body.rotation.y += (-sSoft * 0.08 * w - rig.body.rotation.y) * softLeg;

  // Tay: trễ ~50°, biên độ nhỏ hơn chân (đi thong thả).
  const as = Math.sin(p - 0.85);
  let armL = -as * 0.48 * w;
  let armR = as * 0.48 * w;
  let lean = 0.04 * w + Math.abs(s) * 0.018 * w;
  let headYaw = -sSoft * 0.07 * w;
  let headPitch = bob * 2.2;
  const breathe = Math.sin(t * 1.15 + seed) * 0.012;
  // Dồn trọng tâm khi đứng: nhịp chậm, lệch nhẹ hai bên.
  const shift = Math.sin(t * 0.45 + seed * 1.7) * 0.02 * still;

  if (carry) {
    // Folk tự đặt tay trong post; khối thì ôm trước ngực.
    armL = armR = rig.post ? 0 : -0.72;
    rig.crate.visible = true;
    if (!rig.post) rig.crate.position.set(0, 0.95, 0.4);
  } else {
    rig.crate.visible = false;
  }

  if (still > 0.01 && !carry) {
    switch (pose) {
      case "idle": {
        headYaw += Math.sin(t * 0.28 + seed * 2.1) * 0.45;
        headPitch += Math.sin(t * 0.9 + seed) * 0.04;
        lean += Math.sin(t * 0.4 + seed) * 0.03;
        armL += Math.sin(t * 0.7 + seed) * 0.04 * still;
        armR += Math.sin(t * 0.7 + seed + 1.2) * 0.04 * still;
        break;
      }
      case "guard": {
        // Đứng canh: nhịp thở, dồn chân, liếc nhẹ — không đứng chết
        const sway = Math.sin(t * 0.55 + seed) * 0.035;
        const glance = Math.sin(t * 0.18 + seed * 1.3);
        armR = armR * w + (-0.42 + Math.sin(t * 0.85 + seed) * 0.06 + sway) * still;
        armL = armL * w + (-0.18 + Math.sin(t * 0.65 + seed + 1.1) * 0.05 - sway * 0.5) * still;
        headYaw += glance * 0.38;
        headPitch += Math.sin(t * 1.05 + seed) * 0.03;
        lean += (0.06 + Math.sin(t * 0.5 + seed) * 0.025) * still;
        rig.legL.rotation.x += (-0.04 + Math.sin(t * 0.4 + seed) * 0.03) * still;
        rig.legR.rotation.x += (0.06 + Math.sin(t * 0.4 + seed + 1) * 0.02) * still;
        break;
      }
      case "hoe":
      case "dig": {
        // Ease-in/out: đập nhanh, nâng chậm.
        const rate = pose === "hoe" ? 2.1 : 2.6;
        const raw = Math.sin(t * rate + seed);
        const cyc = 0.5 + 0.5 * Math.sign(raw) * Math.pow(Math.abs(raw), 0.65);
        const swing = -0.35 - 1.45 * cyc;
        armL = armL * w + (swing + 0.12) * still;
        armR = armR * w + swing * still;
        lean = lean * w + (0.28 - 0.2 * cyc) * still;
        headPitch += (0.15 - 0.12 * cyc) * still;
        rig.legL.rotation.x += -0.12 * still;
        rig.legR.rotation.x += 0.18 * still;
        break;
      }
      case "thrust": {
        // Windup → strike → recover (không sin đều như robot)
        const cycle = ((t * 2.2 + seed * 0.15) % (Math.PI * 2)) / (Math.PI * 2);
        let wind = 0;
        let hit = 0;
        let recover = 0;
        if (cycle < 0.28) wind = cycle / 0.28;
        else if (cycle < 0.48) hit = (cycle - 0.28) / 0.2;
        else recover = Math.min(1, (cycle - 0.48) / 0.52);
        const easeHit = hit * hit * (3 - 2 * hit);
        const easeWind = wind * wind;
        armR = armR * w + (-0.55 - 0.7 * easeWind - 0.85 * easeHit + 0.35 * recover) * still;
        armL = armL * w + (-0.35 - 0.25 * easeWind + 0.2 * easeHit) * still;
        lean = lean * w + (-0.08 * easeWind + 0.32 * easeHit - 0.1 * recover) * still;
        rig.body.position.z = (-0.06 * easeWind + 0.22 * easeHit - 0.05 * recover) * still;
        rig.legL.rotation.x += (-0.18 * easeWind - 0.35 * easeHit + 0.12 * recover) * still;
        rig.legR.rotation.x += (0.22 * easeWind + 0.28 * easeHit) * still;
        headPitch += (0.08 * easeWind - 0.12 * easeHit) * still;
        break;
      }
    }
  }
  if (pose !== "thrust") rig.body.position.z = 0;
  // Nội suy khớp tay/thân mềm hơn khi đi chậm.
  const soft = Math.min(1, dt * 9);
  rig.armL.rotation.x += (armL - rig.armL.rotation.x) * soft;
  rig.armR.rotation.x += (armR - rig.armR.rotation.x) * soft;
  const azL = carry ? -0.22 : 0.04 + shift;
  const azR = carry ? 0.22 : -0.04 - shift;
  rig.armL.rotation.z += (azL - (rig.armL.rotation.z || 0)) * soft;
  rig.armR.rotation.z += (azR - (rig.armR.rotation.z || 0)) * soft;
  rig.body.rotation.x += (lean - rig.body.rotation.x) * soft;
  rig.body.position.x = shift * 0.6;
  rig.body.scale.y = 1 + breathe * (0.55 + 0.45 * still);
  const hy = headYaw;
  const hp = headPitch;
  rig.head.rotation.y += (hy - rig.head.rotation.y) * Math.min(1, dt * 3.5);
  rig.head.rotation.x += (hp - (rig.head.rotation.x || 0)) * Math.min(1, dt * 4);
  rig.post?.();
}

/** Chim bay vòng trên thành. */
export function createBird(): THREE.Group {
  const g = new THREE.Group();
  const m = mat(0x3a3530, 0.9);
  const bodyMesh = mesh(new THREE.ConeGeometry(0.12, 0.6, 6).rotateX(Math.PI / 2), m);
  g.add(bodyMesh);
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.15, 0.9, 0, -0.05, 0, 0, -0.2], 3));
  wingGeo.computeVertexNormals();
  const wm = new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.9, side: THREE.DoubleSide });
  const wl = new THREE.Mesh(wingGeo, wm);
  const wr = new THREE.Mesh(wingGeo, wm);
  wr.scale.x = -1;
  g.add(wl, wr);
  let phase = Math.random() * Math.PI * 2;
  g.userData.flap = (dt: number, effort: number) => {
    phase += dt * (5 + 4 * effort);
    const a = 0.12 + Math.sin(phase) * 0.7 * effort;
    wl.rotation.z = a;
    wr.rotation.z = -a;
  };
  return g;
}
