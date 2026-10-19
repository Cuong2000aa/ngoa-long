import * as THREE from "three";
import type { BuildingKind } from "./buildings";
import type { Materials } from "./materials";
import type { ModelKit, ModelName } from "./modelKit";
import type { Tier } from "./tiers";

/** Ba giai đoạn hình dáng theo tier (levelBands): 0–1, 2–3, 4–5. */
const stage = (tier: Tier) => (tier <= 1 ? 0 : tier <= 3 ? 1 : 2);
/** Lớn dần trong cùng một giai đoạn. */
const grow = (tier: Tier) => 1 + (tier % 2) * 0.08;

const HALL: [ModelName, number][] = [["hall-a", 12], ["hall-b", 14], ["hall-c", 18]];
const GRANARY: [ModelName, number][] = [["granary-a", 8], ["granary-b", 9.5], ["granary-c", 11]];
const FIELD_SLOTS: [number, number][] = [[-3.3, 2.6], [3.3, 2.6], [-3.3, 9], [3.3, 9]];
const FIELD_COUNT = [1, 1, 2, 3, 4, 4];
const RACK_SLOTS: [number, number][] = [[-4.2, 5.4], [-1.4, 5.4], [1.4, 5.4], [4.2, 5.4]];

function top(g: THREE.Object3D): number {
  g.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(g).max.y;
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
      // Chìm nền đá sáng của model xuống sân cát.
      hall.position.y -= 0.28;
      break;
    }
    case "granary": {
      const [name, size] = GRANARY[s];
      kit.place(g, name, size * k);
      break;
    }
    case "farm": {
      kit.place(g, "farm-house", 8 * k, 0, -4.2);
      for (let i = 0; i < FIELD_COUNT[tier]; i++) {
        const [x, z] = FIELD_SLOTS[i];
        kit.place(g, "farm-field", 6.2, x, z);
      }
      break;
    }
    case "barracks": {
      kit.place(g, "barracks", (10 + s * 1.5) * k, 0, -0.6);
      for (let i = 0; i < Math.min(RACK_SLOTS.length, tier); i++) {
        const [x, z] = RACK_SLOTS[i];
        kit.place(g, "weapon-rack", 2.6, x, z);
      }
      break;
    }
    case "mine": {
      kit.place(g, s === 0 ? "mine-a" : "mine-b", (7.5 + s * 1.5) * k);
      break;
    }
    case "yard": {
      const w = 10 + tier * 0.4;
      const d = 7.5 + tier * 0.2;
      // Nền cùng tone sân thành, mỏng sát đất — không còn tấm trắng nổi.
      const ground = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), M.court.clone());
      ground.position.set(0, 0.02, 0.6);
      ground.receiveShadow = true;
      g.add(ground);
      const racks = 1 + Math.floor(tier / 2);
      for (let i = 0; i < racks; i++) {
        kit.place(g, "weapon-rack", 2.6, -w / 2 + 1.6 + i * 2.7, d / 2 - 0.4);
      }
      if (tier >= 2) kit.place(g, "pavilion", 5 + (tier - 2) * 0.3, w / 2 - 2.6, -d / 2 + 2.8);
      break;
    }
  }
  g.userData.anchorY = top(g) + 0.8;
  return g;
}
