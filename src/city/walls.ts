import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Materials } from "./materials";
import { normalize as normalizeAny, type Footprint } from "./modelUtils";
import type { Tier } from "./tiers";

const normalize = (obj: THREE.Object3D) => normalizeAny(obj, true);

const WALL_URLS = {
  gate: new URL("../../assets/city/walls/gate-south.fbx", import.meta.url).href,
  long: new URL("../../assets/city/walls/wall-long.glb", import.meta.url).href,
};

/**
 * wall-long.glb là một mesh: thân tường cao 0.5 tổng chiều cao, tháp đỏ nằm ở
 * khoảng 0.525–0.70 chiều dài (đo bằng scripts/measure-walls.mjs).
 */
const LONG_PLAIN: [number, number] = [0, 0.5];
const LONG_TOWER: [number, number] = [0.5, 0.72];

/** Kích thước thành (đơn vị world). Cạnh đo theo tâm tường. */
export const FORT = {
  side: 50,
  wallHeight: 3.6,
  thickScale: 0.6,
};

export interface WallTemplates {
  gate: THREE.Group;
  plain: THREE.Group;
  tower: THREE.Group;
}

const TIER_SCALE: Record<Tier, number> = { 0: 0.92, 1: 0.96, 2: 1, 3: 1.04, 4: 1.08, 5: 1.12 };

export function wallScaleFor(tier: Tier): number {
  return TIER_SCALE[tier];
}

/** Cắt một đoạn [from, to] theo trục dài (Z) thành mesh mới, bỏ tam giác nằm vắt qua mép. */
function sliceAlong(template: THREE.Group, from: number, to: number): THREE.Group {
  const fp = template.userData.fp as Footprint;
  template.updateMatrixWorld(true);
  const out = new THREE.Group();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  template.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    const pos = geo.getAttribute("position");
    const nor = geo.getAttribute("normal");
    const uv = geo.getAttribute("uv");
    const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const P: number[] = [];
    const N: number[] = [];
    const U: number[] = [];
    const tri = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    for (let i = 0; i + 2 < pos.count; i += 3) {
      let keep = true;
      for (let k = 0; k < 3; k++) {
        tri[k].fromBufferAttribute(pos, i + k).applyMatrix4(mesh.matrixWorld);
        const f = (tri[k].z + fp.z / 2) / fp.z;
        if (f < from || f > to) keep = false;
      }
      if (!keep) continue;
      for (let k = 0; k < 3; k++) {
        v.copy(tri[k]);
        P.push(v.x, v.y, v.z);
        if (nor) {
          n.fromBufferAttribute(nor, i + k).applyMatrix3(normalMat).normalize();
          N.push(n.x, n.y, n.z);
        }
        if (uv) U.push(uv.getX(i + k), uv.getY(i + k));
      }
    }
    if (!P.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    if (N.length) g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    else g.computeVertexNormals();
    if (U.length) g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    out.add(new THREE.Mesh(g, mesh.material));
  });
  return normalize(out);
}

let templatesPromise: Promise<WallTemplates> | null = null;

export function loadWallTemplates(): Promise<WallTemplates> {
  templatesPromise ??= (async () => {
    await MeshoptDecoder.ready;
    const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [gate, long] = await Promise.all([
      new FBXLoader().loadAsync(WALL_URLS.gate),
      gltf.loadAsync(WALL_URLS.long),
    ]);
    const longT = normalize(long.scene);
    return {
      gate: normalize(gate),
      plain: sliceAlong(longT, ...LONG_PLAIN),
      tower: sliceAlong(longT, ...LONG_TOWER),
    };
  })();
  return templatesPromise;
}

type Side = "north" | "south" | "east" | "west";

/** Hướng quay theo mặt, giữ như bố cục cũ để mặt trang trí quay ra ngoài. */
const SIDE_YAW: Record<Side, number> = {
  north: Math.PI / 2,
  east: Math.PI,
  west: 0,
  south: -Math.PI / 2,
};

function sidePoint(side: Side, t: number, half: number): [number, number] {
  switch (side) {
    case "north": return [t, -half];
    case "south": return [t, half];
    case "east": return [half, t];
    case "west": return [-half, t];
  }
}

/** Sân trong thành, nằm trong group tường để lớn theo tier cùng tường. */
function addCourt(g: THREE.Group, M: Materials, inner: number) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(inner * 2 + 0.6, inner * 2 + 0.6), M.court);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  mesh.receiveShadow = true;
  g.add(mesh);
}

function addMoat(g: THREE.Group, M: Materials, outer: number) {
  const w = 3;
  const reach = outer + 2.2 + w / 2;
  const span = reach * 2 + w;
  const strips: [number, number, number, number][] = [
    [span, w, 0, reach],
    [span, w, 0, -reach],
    [w, span, reach, 0],
    [w, span, -reach, 0],
  ];
  for (const [sx, sz, x, z] of strips) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), M.water);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.015, z);
    mesh.receiveShadow = true;
    g.add(mesh);
  }
}

/** Bốn mặt tường lát từ đoạn trơn, tháp giữa ba mặt, cổng giữa mặt nam, hào bao quanh. */
export function composeFort(t: WallTemplates, M: Materials): THREE.Group {
  const g = new THREE.Group();
  const half = FORT.side / 2;
  const plainFp = t.plain.userData.fp as Footprint;
  const s = FORT.wallHeight / plainFp.y;
  const segLen = plainFp.z * s;
  const thick = plainFp.x * s * FORT.thickScale;

  const place = (tpl: THREE.Group, side: Side, along: number, scale: number, stretch = 1, thickMul = FORT.thickScale) => {
    const piece = tpl.clone(true);
    piece.scale.set(scale * thickMul, scale, scale * stretch);
    piece.rotation.y = SIDE_YAW[side];
    const [x, z] = sidePoint(side, along, half);
    piece.position.set(x, 0, z);
    g.add(piece);
    return piece;
  };

  const fill = (side: Side, a: number, b: number) => {
    const span = b - a;
    if (span <= 0.5) return;
    const count = Math.max(1, Math.round(span / segLen));
    const step = span / count;
    for (let i = 0; i < count; i++) {
      place(t.plain, side, a + (i + 0.5) * step, s, (step / segLen) * 1.03);
    }
  };

  const towerFp = t.tower.userData.fp as Footprint;
  const towerLen = towerFp.z * s;
  const end = half + thick / 2;
  for (const side of ["north", "east", "west"] as Side[]) {
    place(t.tower, side, 0, s);
    fill(side, -end, -towerLen / 2);
    fill(side, towerLen / 2, end);
  }

  const gateFp = t.gate.userData.fp as Footprint;
  const gateScale = (FORT.wallHeight * 2.2) / gateFp.y;
  const gateLen = gateFp.z * gateScale;
  place(t.gate, "south", 0, gateScale, 1, 1);
  fill("south", -end, -gateLen * 0.47);
  fill("south", gateLen * 0.47, end);

  addMoat(g, M, end + Math.max(0, gateFp.x * gateScale - thick) / 2);
  addCourt(g, M, half - thick / 2);
  g.userData.side = FORT.side;
  g.userData.inner = half - thick / 2;
  return g;
}

/** Tường dựng bằng khối, dùng khi model không tải được. */
export function fallbackFort(M: Materials): THREE.Group {
  const g = new THREE.Group();
  const half = FORT.side / 2;
  const h = FORT.wallHeight * 1.2;
  const thick = 3.2;
  const box = (w: number, hh: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  };
  const gap = 8;
  const seg = (FORT.side + thick - gap) / 2;
  box(FORT.side + thick, h, thick, M.stone, 0, h / 2, -half);
  box(thick, h, FORT.side + thick, M.stone, half, h / 2, 0);
  box(thick, h, FORT.side + thick, M.stone, -half, h / 2, 0);
  box(seg, h, thick, M.stone, -(gap / 2 + seg / 2), h / 2, half);
  box(seg, h, thick, M.stone, gap / 2 + seg / 2, h / 2, half);
  box(gap + 2.4, 1.6, thick + 0.6, M.wood, 0, h + 0.8, half);
  box(gap + 3.6, 0.6, thick + 1.8, M.roof[4], 0, h + 1.9, half);
  for (let i = -half; i <= half; i += 2.5) {
    box(1, 0.7, thick, M.stone, i, h + 0.35, -half);
    box(thick, 0.7, 1, M.stone, half, h + 0.35, i);
    box(thick, 0.7, 1, M.stone, -half, h + 0.35, i);
  }
  addMoat(g, M, half + thick / 2);
  addCourt(g, M, half - thick / 2);
  g.userData.side = FORT.side;
  g.userData.inner = half - thick / 2;
  return g;
}
