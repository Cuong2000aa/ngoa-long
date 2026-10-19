import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PERSON_SCALE, type Rig, type Role } from "./people";
import type { FolkKit, FolkName } from "./folk";

/**
 * Người từ GLB đã auto-rig bằng instance-rig (BodyPix → skeleton + skin).
 * Điều khiển bằng cùng animateRig (map xương hip/shoulder/knee…).
 */
const FILES: Record<FolkName, string> = {
  soldier: new URL("../../assets/city/people/rigged/soldier.glb", import.meta.url).href,
  villager: new URL("../../assets/city/people/rigged/villager.glb", import.meta.url).href,
  villager2: new URL("../../assets/city/people/rigged/villager2.glb", import.meta.url).href,
  official: new URL("../../assets/city/people/rigged/official.glb", import.meta.url).href,
};

const HEIGHT = 1.9 * PERSON_SCALE;
/** Hạ tay từ chữ T xuống cạnh thân (trục xương instance-rig). */
const ARM_DROP = Math.PI / 2 - 0.18;

const ROLE_MODEL: Record<Role, FolkName[]> = {
  soldier: ["soldier"],
  villager: ["villager", "villager2"],
  farmer: ["villager"],
  miner: ["villager2"],
  scholar: ["official"],
};

const propGeo = {
  shaft: new THREE.CylinderGeometry(0.011, 0.011, 1.1, 6).rotateZ(Math.PI / 2),
  tip: new THREE.ConeGeometry(0.026, 0.11, 6).rotateZ(-Math.PI / 2),
  handle: new THREE.CylinderGeometry(0.011, 0.011, 0.53, 6).rotateZ(Math.PI / 2),
  blade: new THREE.BoxGeometry(0.085, 0.02, 0.12),
  crate: new THREE.BoxGeometry(0.21, 0.16, 0.16),
};
const propMat = {
  wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.85 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.35, metalness: 0.75 }),
  crate: new THREE.MeshStandardMaterial({ color: 0x8a6236, roughness: 0.85 }),
};

function findBone(root: THREE.Object3D, name: string): THREE.Bone {
  let found: THREE.Bone | null = null;
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone && o.name === name) found = o as THREE.Bone;
  });
  if (!found) throw new Error(`[folkInstance] thiếu xương ${name}`);
  return found;
}

/** Chuẩn hoá: cao 1, chân chạm y=0, tâm XZ = 0. */
function normalizeTemplate(scene: THREE.Object3D): THREE.Group {
  const wrap = new THREE.Group();
  wrap.add(scene);
  wrap.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wrap);
  const size = box.getSize(new THREE.Vector3());
  wrap.scale.setScalar(1 / Math.max(size.y, 0.001));
  wrap.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(wrap);
  const c = box2.getCenter(new THREE.Vector3());
  wrap.position.set(-c.x, -box2.min.y, -c.z);
  return wrap;
}

function spawn(tpl: THREE.Object3D, role: Role, seed: number, clasp: boolean): Rig {
  const root = new THREE.Group();
  const clone = cloneSkeleton(tpl);
  root.add(clone);
  root.scale.setScalar(HEIGHT * (0.96 + ((seed * 37) % 9) * 0.01));

  clone.traverse((o: THREE.Object3D) => {
    const mesh = o as THREE.SkinnedMesh;
    if (mesh.isSkinnedMesh) {
      mesh.castShadow = true;
      mesh.frustumCulled = false;
    }
  });

  const hip = findBone(clone, "hip");
  const head = findBone(clone, "head");
  const leftHip = findBone(clone, "leftHip");
  const rightHip = findBone(clone, "rightHip");
  const leftKnee = findBone(clone, "leftKnee");
  const rightKnee = findBone(clone, "rightKnee");
  const leftShoulder = findBone(clone, "leftShoulder");
  const rightShoulder = findBone(clone, "rightShoulder");
  const leftElbow = findBone(clone, "leftElbow");
  const rightElbow = findBone(clone, "rightElbow");
  const rightWrist = findBone(clone, "rightWrist");

  // Hạ tay chữ T về tư thế nghỉ (instance-rig xuất T-pose).
  leftShoulder.rotation.z = -ARM_DROP;
  rightShoulder.rotation.z = ARM_DROP;

  const crate = new THREE.Mesh(propGeo.crate, propMat.crate);
  // Trước ngực (hip local) — khớp tay bê, không để thùng ở hông.
  crate.position.set(0, 0.42, 0.28);
  crate.visible = false;
  hip.add(crate);

  let tool: THREE.Object3D | null = null;
  if (role === "soldier") {
    const spear = new THREE.Group();
    const shaft = new THREE.Mesh(propGeo.shaft, propMat.wood);
    shaft.position.x = 0.18;
    const tip = new THREE.Mesh(propGeo.tip, propMat.steel);
    tip.position.x = 0.78;
    spear.add(shaft, tip);
    rightWrist.add(spear);
  } else if (role === "farmer" || role === "miner") {
    tool = new THREE.Group();
    const handle = new THREE.Mesh(propGeo.handle, propMat.wood);
    handle.position.x = -0.11;
    const blade = new THREE.Mesh(propGeo.blade, propMat.steel);
    blade.position.set(-0.37, 0, 0.045);
    tool.add(handle, blade);
    rightWrist.add(tool);
  }

  let shinL = 0;
  let shinR = 0;
  let restZL = leftShoulder.rotation.z;
  let restZR = rightShoulder.rotation.z;

  const rig: Rig = {
    root,
    body: hip as unknown as THREE.Group,
    head,
    legL: leftHip,
    legR: rightHip,
    armL: leftShoulder,
    armR: rightShoulder,
    crate,
    phase: seed * 1.7,
    walk: 0,
  };

  rig.post = () => {
    const w = rig.walk;
    const p = rig.phase;
    const c = Math.cos(p);
    const targetL = (0.08 + 0.9 * Math.pow(Math.max(0, c), 1.1)) * w;
    const targetR = (0.08 + 0.9 * Math.pow(Math.max(0, -c), 1.1)) * w;
    shinL += (targetL - shinL) * 0.28;
    shinR += (targetR - shinR) * 0.28;
    leftKnee.rotation.x = shinL;
    rightKnee.rotation.x = shinR;

    // animateRig xoay arm.rotation.x (swing trước-sau); giữ z = hạ tay.
    if (clasp) {
      leftShoulder.rotation.z = restZL * 0.35;
      rightShoulder.rotation.z = restZR * 0.35;
      leftElbow.rotation.y = -0.9;
      rightElbow.rotation.y = 0.9;
    } else {
      leftShoulder.rotation.z = restZL;
      rightShoulder.rotation.z = restZR;
      const axL = leftShoulder.rotation.x;
      const axR = rightShoulder.rotation.x;
      leftElbow.rotation.x = 0.25 + Math.max(0, -axL) * 0.55;
      rightElbow.rotation.x = 0.25 + Math.max(0, -axR) * 0.55;
    }
    if (tool) tool.visible = !crate.visible;
  };

  return rig;
}

let cache: Promise<FolkKit> | null = null;

export function loadFolkInstance(): Promise<FolkKit> {
  cache ??= (async () => {
    await MeshoptDecoder.ready;
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const names = Object.keys(FILES) as FolkName[];
    const templates: Partial<Record<FolkName, THREE.Object3D>> = {};
    await Promise.all(
      names.map(async (name) => {
        const gltf = await loader.loadAsync(FILES[name]);
        templates[name] = normalizeTemplate(gltf.scene);
      }),
    );
    return {
      models: {} as FolkKit["models"],
      rig(role, _faction, seed) {
        const pool = ROLE_MODEL[role];
        const name = pool[seed % pool.length];
        return spawn(templates[name]!, role, seed, name === "official");
      },
    };
  })();
  return cache;
}
