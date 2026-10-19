import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { PERSON_SCALE, type Rig, type Role } from "./people";
import { bake, type Baked } from "./raven";

/**
 * Người dựng từ model Tripo tư thế chữ T: tự dò mốc khớp, gắn xương + trọng số,
 * rồi điều khiển bằng cùng bộ animateRig với người khối.
 */
const FILES = {
  soldier: new URL("../../assets/city/people/soldier.glb", import.meta.url).href,
  villager: new URL("../../assets/city/people/villager.glb", import.meta.url).href,
  villager2: new URL("../../assets/city/people/villager2.glb", import.meta.url).href,
  official: new URL("../../assets/city/people/official.glb", import.meta.url).href,
} as const;
export type FolkName = keyof typeof FILES;

interface Style {
  /** Cắt đồ cầm tay thò lên/xuống khỏi bàn tay (cây giáo của dân). */
  trim?: boolean;
  /** Áo bào che chân nên không dò được mũi bàn chân: quay ngược hướng dò được. */
  flip?: boolean;
  /** Ống tay rộng: chắp tay trước bụng thay vì buông (để ống tay vẫn rủ xuống). */
  clasp?: boolean;
}
const STYLE: Record<FolkName, Style> = {
  soldier: {},
  villager: { trim: true },
  villager2: {},
  official: { flip: true, clasp: true },
};
/** Chiều cao người trong world (bằng người khối: 1.9 × PERSON_SCALE). */
const HEIGHT = 1.9 * PERSON_SCALE;
/** Góc hạ tay từ chữ T xuống buông dọc thân (chừa chút cho khỏi xuyên hông). */
const ARM_DROP = Math.PI / 2 - 0.12;
const CLASP_SWING = 1.15;
const CLASP_DROP = 0.55;
const CLASP_BEND = 0.95;

interface Marks {
  robe: boolean;
  crotchY: number;
  hipY: number;
  kneeY: number;
  legX: number;
  shoulderX: number;
  armY: number;
  elbowX: number;
  gripX: number;
  handX: number;
  neckY: number;
}

const enum B {
  Body, Head, ThighL, ShinL, ThighR, ShinR, ShL, DropL, ForeL, ShR, DropR, ForeR,
}

const smooth = (a: number, b: number, x: number) => {
  const k = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

/** Xoay về mặt +z, tay dọc x, chân chạm y=0, cao 1. */
function normalizeBaked(b: Baked, flip: boolean): void {
  const box = new THREE.Box3().setFromArray(b.pos);
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const s = 1 / size.y;
  const armsAlongZ = size.z > size.x;
  // Mũi bàn chân chìa về phía trước so với cổ chân.
  let toe = 0, ankle = 0, nToe = 0, nAnkle = 0;
  const n = b.pos.length / 3;
  for (let i = 0; i < n; i++) {
    const y = (b.pos[i * 3 + 1] - box.min.y) * s;
    const f = armsAlongZ ? b.pos[i * 3] - c.x : b.pos[i * 3 + 2] - c.z;
    if (y < 0.03) { toe += f; nToe++; }
    else if (y > 0.08 && y < 0.16) { ankle += f; nAnkle++; }
  }
  const forward = (Math.sign(toe / Math.max(1, nToe) - ankle / Math.max(1, nAnkle)) || 1) * (flip ? -1 : 1);
  const yaw = armsAlongZ ? (forward > 0 ? -Math.PI / 2 : Math.PI / 2) : forward > 0 ? 0 : Math.PI;
  const m = new THREE.Matrix4()
    .makeRotationY(yaw)
    .multiply(new THREE.Matrix4().makeScale(s, s, s))
    .multiply(new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z));
  const nm = new THREE.Matrix3().getNormalMatrix(m);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromArray(b.pos, i * 3).applyMatrix4(m).toArray(b.pos, i * 3);
    v.fromArray(b.nor, i * 3).applyMatrix3(nm).normalize().toArray(b.nor, i * 3);
  }
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
}

function findMarks(pos: Float32Array): Marks {
  const n = pos.length / 3;
  let handX = 0;
  for (let i = 0; i < n; i++) handX = Math.max(handX, Math.abs(pos[i * 3]));
  const armYs: number[] = [];
  const waist: number[] = [];
  const legs: number[] = [];
  const slices = new Array(80).fill(0);
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1];
    const ax = Math.abs(x);
    if (ax > handX * 0.6) armYs.push(y);
    if (y > 0.44 && y < 0.54) waist.push(ax);
    if (y > 0.15 && y < 0.3 && ax > 0.012) legs.push(ax);
    if (ax < 0.012 && y < 0.8) slices[Math.floor(y * 100)]++;
  }
  const armY = percentile(armYs, 0.5);
  let crotchY = 0.47;
  let robe = false;
  for (let k = 12; k < 62; k++) {
    if (slices[k] >= 2) {
      if (k <= 16) robe = true;
      else crotchY = k / 100;
      break;
    }
  }
  const torsoW = percentile(waist, robe ? 0.75 : 0.95);
  const shoulderX = THREE.MathUtils.clamp(torsoW * 1.05, 0.08, 0.14);
  const legX = robe ? 0.06 : THREE.MathUtils.clamp(percentile(legs, 0.5), 0.04, 0.09);
  return {
    robe,
    crotchY,
    hipY: crotchY + 0.03,
    kneeY: crotchY * 0.55,
    legX,
    shoulderX,
    armY,
    elbowX: shoulderX + (handX - shoulderX) * 0.47,
    gripX: shoulderX + (handX - shoulderX) * 0.9,
    handX,
    neckY: armY + 0.05,
  };
}

/** Cắt đồ cầm tay thò ra khỏi bàn tay theo chiều đứng (giáo, gậy). */
function trimHandProps(b: Baked, mk: Marks): void {
  const keep: number[] = [];
  const reach = mk.shoulderX + (mk.handX - mk.shoulderX) * 0.78;
  for (let t = 0; t < b.index.length; t += 3) {
    let cx = 0, cy = 0;
    for (let k = 0; k < 3; k++) {
      cx += Math.abs(b.pos[b.index[t + k] * 3]);
      cy += b.pos[b.index[t + k] * 3 + 1];
    }
    cx /= 3;
    cy /= 3;
    if (cx > reach && Math.abs(cy - mk.armY) > 0.045) continue;
    keep.push(b.index[t], b.index[t + 1], b.index[t + 2]);
  }
  b.index = Uint32Array.from(keep);
}

function weightsFor(x: number, y: number, mk: Marks): [number, number][] {
  const w = new Map<number, number>();
  const add = (bone: number, v: number) => v > 1e-4 && w.set(bone, (w.get(bone) ?? 0) + v);
  const ax = Math.abs(x);
  const left = x >= 0;
  let rest = 1;

  // Tay: vượt khỏi vai, trong dải cao của tay (gồm cả ống tay áo rủ).
  if (y > mk.armY - (mk.robe ? 0.36 : 0.11) && y < mk.armY + 0.09) {
    const a = smooth(mk.shoulderX - 0.035, mk.shoulderX + 0.03, ax);
    if (a > 0) {
      const e = smooth(mk.elbowX - 0.03, mk.elbowX + 0.03, ax);
      add(left ? B.DropL : B.DropR, a * (1 - e));
      add(left ? B.ForeL : B.ForeR, a * e);
      rest -= a;
    }
  }
  // Đầu.
  if (rest > 0 && y > mk.neckY - 0.03 && ax < mk.shoulderX) {
    const h = smooth(mk.neckY - 0.03, mk.neckY + 0.025, y) * rest;
    add(B.Head, h);
    rest -= h;
  }
  // Chân: cắt dứt hơn với thân để bước chân nhìn rõ (áo bào vẫn chia mềm hai bên).
  if (rest > 0 && y < mk.hipY + 0.08) {
    const l = (1 - smooth(mk.hipY - 0.04, mk.hipY + 0.08, y)) * rest;
    const spread = mk.robe ? mk.legX * 1.15 : 0.008;
    const sl = smooth(-spread, spread, x);
    const k = 1 - smooth(mk.kneeY - 0.04, mk.kneeY + 0.04, y);
    add(B.ThighL, l * sl * (1 - k));
    add(B.ShinL, l * sl * k);
    add(B.ThighR, l * (1 - sl) * (1 - k));
    add(B.ShinR, l * (1 - sl) * k);
    rest -= l;
  }
  add(B.Body, rest);
  const top = [...w.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const sum = top.reduce((s, [, v]) => s + v, 0) || 1;
  return top.map(([bone, v]) => [bone, v / sum]);
}

function buildGeometry(b: Baked, mk: Marks): THREE.BufferGeometry {
  const remap = new Map<number, number>();
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], index: number[] = [];
  const si: number[] = [], sw: number[] = [];
  for (const i of b.index) {
    let j = remap.get(i);
    if (j === undefined) {
      j = remap.size;
      remap.set(i, j);
      const x = b.pos[i * 3], y = b.pos[i * 3 + 1], z = b.pos[i * 3 + 2];
      pos.push(x, y, z);
      nor.push(b.nor[i * 3], b.nor[i * 3 + 1], b.nor[i * 3 + 2]);
      uv.push(b.uv[i * 2], b.uv[i * 2 + 1]);
      const ws = weightsFor(x, y, mk);
      for (let k = 0; k < 4; k++) {
        si.push(ws[k]?.[0] ?? 0);
        sw.push(ws[k]?.[1] ?? 0);
      }
    }
    index.push(j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));
  g.setIndex(index);
  return g;
}

/** Vị trí tuyệt đối từng xương (khung đã chuẩn hoá, tư thế chữ T). */
function jointPositions(mk: Marks): THREE.Vector3[] {
  const v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const p: THREE.Vector3[] = [];
  p[B.Body] = v(0, 0);
  p[B.Head] = v(0, mk.neckY);
  p[B.ThighL] = v(mk.legX, mk.hipY);
  p[B.ShinL] = v(mk.legX, mk.kneeY);
  p[B.ThighR] = v(-mk.legX, mk.hipY);
  p[B.ShinR] = v(-mk.legX, mk.kneeY);
  p[B.ShL] = v(mk.shoulderX, mk.armY);
  p[B.DropL] = v(mk.shoulderX, mk.armY);
  p[B.ForeL] = v(mk.elbowX, mk.armY);
  p[B.ShR] = v(-mk.shoulderX, mk.armY);
  p[B.DropR] = v(-mk.shoulderX, mk.armY);
  p[B.ForeR] = v(-mk.elbowX, mk.armY);
  return p;
}

const PARENT: number[] = [-1, B.Body, B.Body, B.ThighL, B.Body, B.ThighR, B.Body, B.ShL, B.DropL, B.Body, B.ShR, B.DropR];

const propGeo = {
  shaft: new THREE.CylinderGeometry(0.011, 0.011, 1.1, 6).rotateZ(Math.PI / 2),
  tip: new THREE.ConeGeometry(0.026, 0.11, 6).rotateZ(-Math.PI / 2),
  handle: new THREE.CylinderGeometry(0.011, 0.011, 0.53, 6).rotateZ(Math.PI / 2),
  blade: new THREE.BoxGeometry(0.085, 0.02, 0.12),
  crate: new THREE.BoxGeometry(0.17, 0.14, 0.14),
};
const propMat = {
  wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.85 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.35, metalness: 0.75 }),
  crate: new THREE.MeshStandardMaterial({ color: 0x8a6236, roughness: 0.85 }),
};

interface FolkModel {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
  marks: Marks;
  clasp: boolean;
}

function spawnRig(model: FolkModel, role: Role, seed: number): Rig {
  const mk = model.marks;
  const root = new THREE.Group();
  const mesh = new THREE.SkinnedMesh(model.geometry, model.material);
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  root.add(mesh);
  const abs = jointPositions(mk);
  const bones = abs.map(() => new THREE.Bone());
  bones.forEach((bone, i) => {
    const parent = PARENT[i];
    bone.position.copy(abs[i]);
    if (parent >= 0) {
      bone.position.sub(abs[parent]);
      bones[parent].add(bone);
    }
  });
  mesh.add(bones[B.Body]);
  root.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));

  // Đồ cầm ở tay phải (x âm), dọc theo cẳng tay; mũi giáo hướng lên khi tay buông.
  const fore = bones[B.ForeR];
  const grip = -(mk.gripX - mk.elbowX);
  let tool: THREE.Object3D | null = null;
  if (role === "soldier") {
    const spear = new THREE.Group();
    spear.position.set(grip, 0, 0.012);
    const shaft = new THREE.Mesh(propGeo.shaft, propMat.wood);
    shaft.position.x = 0.18;
    const tip = new THREE.Mesh(propGeo.tip, propMat.steel);
    tip.position.x = 0.18 + 0.55 + 0.05;
    spear.add(shaft, tip);
    fore.add(spear);
  } else if (role === "farmer" || role === "miner") {
    tool = new THREE.Group();
    tool.position.set(grip, 0, 0.012);
    const handle = new THREE.Mesh(propGeo.handle, propMat.wood);
    handle.position.x = -0.11;
    const blade = new THREE.Mesh(propGeo.blade, propMat.steel);
    blade.position.set(-0.37, 0, 0.045);
    tool.add(handle, blade);
    fore.add(tool);
  }
  const crate = new THREE.Mesh(propGeo.crate, propMat.crate);
  crate.visible = false;
  bones[B.Body].add(crate);
  // Cùng local X với đồ cầm: tay trái +reach, tay phải −reach (từ khuỷu → lòng bàn tay).
  const reach = mk.gripX - mk.elbowX;
  const _handL = new THREE.Vector3();
  const _handR = new THREE.Vector3();
  const _crateLocal = new THREE.Vector3();

  // animateRig xoay Sh (logic, không skin); post copy sang Drop (có skin) + góc hạ tay chữ T.
  bones[B.DropL].rotation.set(0.2, -0.1, -ARM_DROP);
  bones[B.DropR].rotation.set(0.2, 0.1, ARM_DROP);
  root.scale.setScalar(HEIGHT * (0.96 + ((seed * 37) % 9) * 0.01));

  const rig: Rig = {
    root,
    body: bones[B.Body] as unknown as THREE.Group,
    head: bones[B.Head],
    legL: bones[B.ThighL],
    legR: bones[B.ThighR],
    armL: bones[B.ShL],
    armR: bones[B.ShR],
    crate,
    phase: seed * 1.7,
    walk: 0,
  };
  const stride = mk.robe ? 0.55 : 1;
  let shinL = 0, shinR = 0, foreL = 0, foreR = 0;
  rig.post = () => {
    const w = rig.walk;
    const p = rig.phase;
    if (stride !== 1) {
      rig.legL.rotation.x *= stride;
      rig.legR.rotation.x *= stride;
    }
    const c = Math.cos(p);
    // Gập gối nhẹ hơn khi đi chậm — tránh đá cao.
    const targetL = (0.08 + 0.95 * Math.pow(Math.max(0, c), 1.1)) * w * stride;
    const targetR = (0.08 + 0.95 * Math.pow(Math.max(0, -c), 1.1)) * w * stride;
    shinL += (targetL - shinL) * 0.28;
    shinR += (targetR - shinR) * 0.28;
    bones[B.ShinL].rotation.x = shinL;
    bones[B.ShinR].rotation.x = shinR;

    const axL = bones[B.ShL].rotation.x;
    const axR = bones[B.ShR].rotation.x;
    const azL = bones[B.ShL].rotation.z;
    const azR = bones[B.ShR].rotation.z;
    if (model.clasp) {
      const bob = Math.sin(p * 2) * 0.03 * w;
      bones[B.DropL].rotation.set(axL * 0.4 + bob, -CLASP_SWING + azL, -CLASP_DROP);
      bones[B.DropR].rotation.set(axR * 0.4 + bob, CLASP_SWING + azR, CLASP_DROP);
      bones[B.ForeL].rotation.y = -CLASP_BEND;
      bones[B.ForeR].rotation.y = CLASP_BEND;
      return;
    }
    if (tool) tool.visible = !crate.visible;
    if (crate.visible) {
      // Ôm thùng trước ngực: đưa tay vào trong + gập khuỷu (gần tư thế chắp, nhưng mở bằng bề ngang thùng).
      bones[B.DropL].rotation.set(-0.42, -0.68, -ARM_DROP * 0.84);
      bones[B.DropR].rotation.set(-0.42, 0.68, ARM_DROP * 0.84);
      bones[B.ForeL].rotation.y = -1.08;
      bones[B.ForeR].rotation.y = 1.08;
      root.updateMatrixWorld(true);
      // Gốc Fore = khuỷu. Mesh lòng bàn tay (skin) cao hơn tip xương.
      bones[B.ForeL].localToWorld(_handL.set(reach, 0, 0));
      bones[B.ForeR].localToWorld(_handR.set(-reach, 0, 0));
      _crateLocal.addVectors(_handL, _handR).multiplyScalar(0.5);
      bones[B.Body].worldToLocal(_crateLocal);
      // Skin lòng bàn tay hơi cao hơn tip xương; kéo thùng sát ngực (tránh trôi ra trước).
      _crateLocal.y += 0.07;
      _crateLocal.z = Math.min(_crateLocal.z, 0.22);
      crate.position.copy(_crateLocal);
      return;
    }
    bones[B.DropL].rotation.set(0.22 + axL, -0.12 + azL * 0.4, -ARM_DROP + azL * 0.2);
    bones[B.DropR].rotation.set(0.22 + axR, 0.12 + azR * 0.4, ARM_DROP + azR * 0.2);
    const wantL = 0.35 + Math.max(0, -axL) * 0.8 + Math.max(0, axL) * 0.2;
    const wantR = 0.35 + Math.max(0, -axR) * 0.8 + Math.max(0, axR) * 0.2;
    foreL += (wantL - foreL) * 0.4;
    foreR += (wantR - foreR) * 0.4;
    bones[B.ForeL].rotation.y = -foreL;
    bones[B.ForeR].rotation.y = foreR;
  };
  return rig;
}

async function loadModel(name: FolkName): Promise<FolkModel> {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(FILES[name]);
  const { baked, material } = bake(gltf.scene);
  const style = STYLE[name];
  normalizeBaked(baked, !!style.flip);
  let marks = findMarks(baked.pos);
  if (style.trim) {
    trimHandProps(baked, marks);
    marks = findMarks(baked.pos);
  }
  material.side = THREE.FrontSide;
  return { geometry: buildGeometry(baked, marks), material, marks, clasp: !!style.clasp };
}

export interface FolkKit {
  models: Record<FolkName, FolkModel> | Record<string, unknown>;
  /** Rig cho vai trò trong thành. */
  rig(role: Role, faction: string, seed: number): Rig;
}

const ROLE_MODEL: Record<Role, FolkName[]> = {
  soldier: ["soldier"],
  villager: ["villager", "villager2"],
  farmer: ["villager"],
  miner: ["villager2"],
  scholar: ["official"],
};

let cache: Promise<FolkKit> | null = null;

export function loadFolk(): Promise<FolkKit> {
  cache ??= (async () => {
    const names = Object.keys(FILES) as FolkName[];
    const loaded = await Promise.all(names.map(loadModel));
    const models = Object.fromEntries(names.map((n, i) => [n, loaded[i]])) as Record<FolkName, FolkModel>;
    return {
      models,
      rig(role, _faction, seed) {
        const pool = ROLE_MODEL[role];
        return spawnRig(models[pool[seed % pool.length]], role, seed);
      },
    };
  })();
  return cache;
}

/** Soát: tô màu theo xương trội + chấm khớp, trên tư thế chữ T. */
export async function loadFolkDebug(name: FolkName): Promise<THREE.Object3D> {
  const { geometry, marks } = await loadModel(name);
  const palette = [0xdddddd, 0xffd23f, 0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607, 0x777777, 0x06d6a0, 0x118ab2, 0x777777, 0xef476f, 0xffbe0b];
  const si = geometry.getAttribute("skinIndex");
  const colors = new Float32Array(si.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < si.count; i++) c.setHex(palette[si.getX(i)]).toArray(colors, i * 3);
  const g = geometry.clone();
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const group = new THREE.Group();
  group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 })));
  const dot = new THREE.SphereGeometry(0.012, 8, 6);
  for (const p of jointPositions(marks)) {
    const m = new THREE.Mesh(dot, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    m.position.copy(p).setZ(0.08);
    group.add(m);
  }
  group.scale.setScalar(1.9);
  console.log(name, JSON.stringify(marks));
  return group;
}
