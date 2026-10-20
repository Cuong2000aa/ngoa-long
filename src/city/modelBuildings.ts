import * as THREE from "three";
import type { BuildingKind } from "./buildings";
import type { Materials } from "./materials";
import type { ModelKit, ModelName } from "./modelKit";
import type { Tier } from "./tiers";

/** Ba giai đoạn hình dáng theo tier (levelBands): 0–1, 2–3, 4–5. */
const stage = (tier: Tier) => (tier <= 1 ? 0 : tier <= 3 ? 1 : 2);
/** Lớn dần nhẹ trong cùng giai đoạn — tránh đè nhau ở tier max. */
const grow = (tier: Tier) => 1 + (tier % 2) * 0.04;

/**
 * size = cạnh ngang world — cap để vừa sân (site ~±13, tường ±25).
 * hall-b/c thay hall-a.fbx (mesh cụt); mine-b thay mine-a.fbx (đống đá).
 */
const HALL: [ModelName, number][] = [
  ["hall-b", 9.2],
  ["hall-b", 11],
  ["hall-c", 12.5],
];
const GRANARY: [ModelName, number][] = [
  ["granary-a", 6.5],
  ["granary-b", 7.5],
  ["granary-c", 8.5],
];
/** Ruộng thủ công (không dùng farm-field.glb — thảm xanh đồ chơi). */
const FIELD_SLOTS: [number, number][] = [
  [-1.9, 1.1],
  [1.9, 1.1],
  [-1.9, 3.2],
  [1.9, 3.2],
];
const FIELD_COUNT = [1, 1, 2, 3, 4, 4];
const RACK_SLOTS: [number, number][] = [
  [-2.6, 3.2],
  [-0.9, 3.2],
  [0.9, 3.2],
  [2.6, 3.2],
];

function top(g: THREE.Object3D): number {
  g.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(g).max.y;
}

function addCropPlot(g: THREE.Group, M: Materials, x: number, z: number, i: number) {
  const mat = i % 2 ? M.cropDark : M.crop;
  const plot = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.0), mat);
  plot.position.set(x, 0.05, z);
  plot.receiveShadow = true;
  plot.castShadow = false;
  g.add(plot);
  // Rãnh nông — đọc là ruộng, không tấm xanh phẳng
  for (let f = 0; f < 3; f++) {
    const furrow = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.04, 0.12), M.cropDark);
    furrow.position.set(x, 0.1, z - 0.55 + f * 0.55);
    furrow.receiveShadow = true;
    g.add(furrow);
  }
}

/**
 * Dựng công trình từ model thật. Đơn vị world, gốc tại tâm site.
 * Trả về null nếu loại chưa có model (dùng bản khối).
 */
export function buildFromKit(kit: ModelKit, M: Materials, kind: BuildingKind, tier: Tier): THREE.Group | null {
  const g = new THREE.Group();
  const s = stage(tier);
  const k = grow(tier);
  switch (kind) {
    case "hall": {
      const [name, size] = HALL[s];
      const hall = kit.place(g, name, size * k);
      // Chìm nền đá sáng của model xuống sân cát; quay mặt về cổng nam (+Z).
      hall.position.y -= 0.22;
      hall.rotation.y = Math.PI;
      break;
    }
    case "granary": {
      const [name, size] = GRANARY[s];
      kit.place(g, name, size * k);
      break;
    }
    case "farm": {
      // Nhà kit + ruộng procedural (bỏ farm-field.glb)
      kit.place(g, "farm-house", 5.8 * k, 0, -2.2);
      for (let i = 0; i < FIELD_COUNT[tier]; i++) {
        const [x, z] = FIELD_SLOTS[i];
        addCropPlot(g, M, x, z, i);
      }
      break;
    }
    case "barracks": {
      // Thu nhỏ + yaw mặt về đường giữa (−X) — tránh đâm tường đông
      kit.place(g, "barracks", (6.8 + s * 0.75) * k, 0, 0, -Math.PI / 2);
      for (let i = 0; i < Math.min(RACK_SLOTS.length, tier); i++) {
        const [x, z] = RACK_SLOTS[i];
        kit.place(g, "weapon-rack", 1.9, x, z);
      }
      break;
    }
    case "mine": {
      // mine-b.glb (không mine-a.fbx); mặt vào sân (−Z / về plaza)
      kit.place(g, "mine-b", (5.6 + s * 0.85) * k, 0, 0, Math.PI);
      break;
    }
    case "yard": {
      const w = 7.8 + tier * 0.22;
      const d = 6.0 + tier * 0.12;
      const ground = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), M.court.clone());
      ground.position.set(0, 0.02, 0.35);
      ground.receiveShadow = true;
      g.add(ground);
      const racks = 1 + Math.floor(tier / 2);
      for (let i = 0; i < racks; i++) {
        kit.place(g, "weapon-rack", 2.0, -w / 2 + 1.3 + i * 2.0, d / 2 - 0.3);
      }
      if (tier >= 2) kit.place(g, "pavilion", 3.8 + (tier - 2) * 0.15, w / 2 - 2.0, -d / 2 + 2.0);
      break;
    }
  }
  g.userData.anchorY = top(g) + 0.8;
  return g;
}
