import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const RAVEN_URL = new URL("../../assets/city/birds/raven.glb", import.meta.url).href;

/**
 * Tượng quạ đứng (đầu +z, đuôi -z, thân chúi ~40°, cánh khép hai bên hông).
 * Để bay: xoay thân nằm ngang, bỏ chân, lấy mảng lông cánh khép ở hông làm cánh xòe,
 * gắn xương vai/khuỷu/cổ tay để vỗ.
 */
const RAW = {
  midX: 0.005,
  center: new THREE.Vector3(0.005, 0.0, -0.25),
  pitch: 0.62,
  shoulder: new THREE.Vector3(0.08, 0.09, -0.18),
  tip: new THREE.Vector3(0.08, -0.1, -0.47),
};
const SPAN_STRETCH = 1.75;
const CHORD_STRETCH = 1.35;
const FLATTEN = 0.16;
/** Mốc xương dọc sải cánh (tỉ lệ 0..1). */
const ELBOW = 0.32;
const WRIST = 0.66;

type Tri = [number, number, number];

function isLeg(c: THREE.Vector3): boolean {
  return c.y < -0.115 && c.z > -0.37;
}

function isWing(c: THREE.Vector3, n: THREE.Vector3): boolean {
  return n.x > 0.45 && c.x - RAW.midX > 0.035 && c.z > -0.47 && c.z < -0.17 && c.y > -0.15 && c.y < 0.13;
}

export interface Baked {
  pos: Float32Array;
  nor: Float32Array;
  uv: Float32Array;
  index: Uint32Array;
}

/** Lấy mesh đầu tiên, nướng ma trận world vào đỉnh (Float32, bỏ lượng tử hoá/skin). */
export function bake(root: THREE.Object3D): { baked: Baked; material: THREE.MeshStandardMaterial } {
  root.updateMatrixWorld(true);
  let mesh: THREE.Mesh | undefined;
  root.traverse((o) => {
    if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
  });
  if (!mesh) throw new Error("raven.glb không có mesh");
  const g = mesh.geometry;
  const P = g.getAttribute("position");
  const N = g.getAttribute("normal");
  const U = g.getAttribute("uv");
  const count = P.count;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(P, i).applyMatrix4(mesh.matrixWorld);
    pos.set([v.x, v.y, v.z], i * 3);
    v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
    nor.set([v.x, v.y, v.z], i * 3);
    uv[i * 2] = U.getX(i);
    uv[i * 2 + 1] = U.getY(i);
  }
  const index = g.index ? Uint32Array.from(g.index.array as ArrayLike<number>) : Uint32Array.from({ length: count }, (_, i) => i);
  const material = (mesh.material as THREE.MeshStandardMaterial).clone();
  return { baked: { pos, nor, uv, index }, material };
}

/** Phân loại tam giác: thân (bỏ chân) và cánh (mặt hông +x). */
function classify(b: Baked): { body: Tri[]; wing: Tri[]; leg: Tri[] } {
  const body: Tri[] = [];
  const wing: Tri[] = [];
  const leg: Tri[] = [];
  const a = new THREE.Vector3(), bb = new THREE.Vector3(), c = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3(), cen = new THREE.Vector3();
  for (let t = 0; t < b.index.length; t += 3) {
    const tri: Tri = [b.index[t], b.index[t + 1], b.index[t + 2]];
    a.fromArray(b.pos, tri[0] * 3);
    bb.fromArray(b.pos, tri[1] * 3);
    c.fromArray(b.pos, tri[2] * 3);
    cen.copy(a).add(bb).add(c).multiplyScalar(1 / 3);
    n.crossVectors(e1.subVectors(bb, a), e2.subVectors(c, a)).normalize();
    if (isLeg(cen)) {
      leg.push(tri);
      continue;
    }
    body.push(tri);
    if (isWing(cen, n)) wing.push(tri);
  }
  return { body, wing, leg };
}

/** Gom tam giác thành geometry riêng, đi qua hàm biến đổi đỉnh. */
function buildGeometry(b: Baked, tris: Tri[], map: (p: THREE.Vector3, n: THREE.Vector3) => void, flip = false): THREE.BufferGeometry {
  const remap = new Map<number, number>();
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (const tri of tris) {
    const order = flip ? [tri[0], tri[2], tri[1]] : tri;
    for (const i of order) {
      let j = remap.get(i);
      if (j === undefined) {
        j = remap.size;
        remap.set(i, j);
        p.fromArray(b.pos, i * 3);
        n.fromArray(b.nor, i * 3);
        map(p, n);
        pos.push(p.x, p.y, p.z);
        nor.push(n.x, n.y, n.z);
        uv.push(b.uv[i * 2], b.uv[i * 2 + 1]);
      }
      index.push(j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
}

export interface RavenTemplate {
  /** Một con quạ bay; gọi `userData.flap(dt, effort)` mỗi khung (effort 0 = lượn, 1 = vỗ mạnh). */
  spawn(): THREE.Group;
}

let cache: Promise<RavenTemplate> | null = null;

export function loadRaven(): Promise<RavenTemplate> {
  cache ??= (async () => {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(RAVEN_URL);
    return createTemplate(gltf.scene);
  })();
  return cache;
}

function createTemplate(scene: THREE.Object3D): RavenTemplate {
  const { baked, material } = bake(scene);
  material.color.setScalar(0.72);
  material.roughness = 0.62;
  material.metalness = 0.05;
  material.side = THREE.DoubleSide;
  const { body, wing } = classify(baked);

  const toBird = new THREE.Matrix4()
    .makeRotationX(RAW.pitch)
    .multiply(new THREE.Matrix4().makeTranslation(-RAW.center.x, -RAW.center.y, -RAW.center.z));
  const toBirdN = new THREE.Matrix3().getNormalMatrix(toBird);
  const bodyGeo = buildGeometry(baked, body, (p, n) => {
    p.applyMatrix4(toBird);
    n.applyMatrix3(toBirdN).normalize();
  });

  // Hệ trục cánh khép: d = vai -> chóp, n = pháp tuyến hông; đem về (d, n, d×n) -> (+x, -y, -z).
  const S = RAW.shoulder.clone().applyMatrix4(toBird);
  const d = RAW.tip.clone().applyMatrix4(toBird).sub(S).normalize();
  const nAxis = new THREE.Vector3(1, 0, 0).applyMatrix3(toBirdN);
  nAxis.addScaledVector(d, -nAxis.dot(d)).normalize();
  const third = new THREE.Vector3().crossVectors(d, nAxis);
  const R = new THREE.Matrix4().makeBasis(d, nAxis, third).transpose();
  const flipYZ = new THREE.Matrix4().makeScale(SPAN_STRETCH, -FLATTEN, -CHORD_STRETCH);
  const attach = new THREE.Vector3(0.035, S.y + 0.015, S.z + 0.02);
  const wingM = new THREE.Matrix4()
    .makeTranslation(attach.x, attach.y, attach.z)
    .multiply(flipYZ)
    .multiply(R)
    .multiply(new THREE.Matrix4().makeTranslation(-S.x, -S.y, -S.z))
    .multiply(toBird);
  const wingN = new THREE.Matrix3().getNormalMatrix(wingM);
  const flipNeeded = wingM.determinant() < 0;
  const wingR = buildGeometry(baked, wing, (p, n) => {
    p.applyMatrix4(wingM);
    n.applyMatrix3(wingN).normalize();
  }, flipNeeded);
  wingR.computeBoundingBox();
  const span = Math.max(0.05, wingR.boundingBox!.max.x - attach.x);
  addSkin(wingR, attach.x, span);
  const wingL = wingR.clone();
  wingL.scale(-1, 1, 1);
  wingL.setIndex(Array.from(wingR.index!.array).map((_, i, arr) => arr[i - (i % 3) + [0, 2, 1][i % 3]]));

  return {
    spawn() {
      const root = new THREE.Group();
      const pivot = new THREE.Group();
      root.add(pivot);
      const bodyMesh = new THREE.Mesh(bodyGeo, material);
      bodyMesh.castShadow = true;
      pivot.add(bodyMesh);
      const right = skinnedWing(wingR, material, attach, span, 1);
      const left = skinnedWing(wingL, material, attach, span, -1);
      pivot.add(right.mesh, left.mesh);

      let phase = Math.random() * Math.PI * 2;
      let effort = 1;
      root.userData.flap = (dt: number, target: number) => {
        effort += (target - effort) * Math.min(1, dt * 2.2);
        const hz = 1.6 + 1.1 * effort;
        phase += dt * hz * Math.PI * 2;
        // Đập xuống nhanh hơn nâng lên.
        const w = phase + 0.32 * Math.sin(phase);
        const s0 = Math.sin(w);
        const amp = effort;
        const glide = 1 - effort;
        const shoulder = amp * (0.12 + 0.62 * s0) + glide * (0.13 + 0.03 * Math.sin(phase * 0.21));
        const elbow = amp * 0.32 * Math.sin(w - 0.7) + glide * -0.04;
        const wrist = amp * 0.45 * Math.sin(w - 1.3) + glide * 0.09;
        right.pose(shoulder, elbow, wrist);
        left.pose(shoulder, elbow, wrist);
        pivot.position.y = -0.035 * s0 * amp;
        pivot.rotation.x = -0.05 * s0 * amp;
      };
      root.userData.flap(0, 1);
      return root;
    },
  };
}

function addSkin(g: THREE.BufferGeometry, rootX: number, span: number): void {
  const P = g.getAttribute("position");
  const idx = new Uint16Array(P.count * 4);
  const wt = new Float32Array(P.count * 4);
  for (let i = 0; i < P.count; i++) {
    const s = THREE.MathUtils.clamp((P.getX(i) - rootX) / span, 0, 1);
    let a = 0, b = 1, k = 0;
    if (s < ELBOW) k = s / ELBOW;
    else if (s < WRIST) { a = 1; b = 2; k = (s - ELBOW) / (WRIST - ELBOW); }
    else { a = 2; b = 2; k = 0; }
    k = k * k * (3 - 2 * k);
    idx[i * 4] = a;
    idx[i * 4 + 1] = b;
    wt[i * 4] = 1 - k;
    wt[i * 4 + 1] = k;
  }
  g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(idx, 4));
  g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(wt, 4));
}

function skinnedWing(geo: THREE.BufferGeometry, material: THREE.Material, attach: THREE.Vector3, span: number, side: 1 | -1) {
  const mesh = new THREE.SkinnedMesh(geo, material);
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  const b0 = new THREE.Bone();
  const b1 = new THREE.Bone();
  const b2 = new THREE.Bone();
  b0.position.set(attach.x * side, attach.y, attach.z);
  b1.position.set(span * ELBOW * side, 0, 0);
  b2.position.set(span * (WRIST - ELBOW) * side, 0, 0);
  b0.add(b1);
  b1.add(b2);
  mesh.add(b0);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton([b0, b1, b2]));
  return {
    mesh,
    pose(shoulder: number, elbow: number, wrist: number) {
      b0.rotation.z = shoulder * side;
      b1.rotation.z = elbow * side;
      b2.rotation.z = wrist * side;
    },
  };
}

/** Tô màu vùng cắt trên tượng gốc để soát (đỏ = cánh, xanh = chân). */
export async function loadRavenDebug(): Promise<THREE.Mesh> {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(RAVEN_URL);
  const { baked, material } = bake(gltf.scene);
  const { body, wing, leg } = classify(baked);
  const wingSet = new Set(wing);
  const all = [...body, ...leg];
  const pos: number[] = [];
  const col: number[] = [];
  for (const tri of all) {
    const color = wingSet.has(tri) ? [1, 0.15, 0.1] : leg.includes(tri) ? [0.2, 0.4, 1] : [0.8, 0.8, 0.8];
    for (const i of tri) {
      pos.push(baked.pos[i * 3], baked.pos[i * 3 + 1], baked.pos[i * 3 + 2]);
      col.push(...color);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  material.dispose();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
}
