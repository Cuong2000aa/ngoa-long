import * as THREE from "three";
import type { BuildingKind } from "./buildings";
import type { Materials } from "./materials";
import type { ModelKit, ModelName } from "./modelKit";
import type { Tier } from "./tiers";

/** Ba giai đoạn hình dáng theo tier (levelBands): 0–1, 2–3, 4–5. */
const stage = (tier: Tier) => (tier <= 1 ? 0 : tier <= 3 ? 1 : 2);
/** Lớn dần nhẹ trong cùng giai đoạn — tránh đè nhau ở tier max. */
const grow = (tier: Tier) => 1 + (tier % 2) * 0.04;

/** size = cạnh ngang world — cap để vừa sân (±18 site spacing). */
const HALL: [ModelName, number][] = [["hall-a", 10], ["hall-b", 12], ["hall-c", 14]];
const GRANARY: [ModelName, number][] = [["granary-a", 7], ["granary-b", 8], ["granary-c", 9]];
/** Ruộng gọn quanh nhà — không kéo dài tới z+9 (tránh đè mỏ / doanh). */
const FIELD_SLOTS: [number, number][] = [[-2.6, 1.6], [2.6, 1.6], [-2.6, 5.2], [2.6, 5.2]];
const FIELD_COUNT = [1, 1, 2, 3, 4, 4];
const RACK_SLOTS: [number, number][] = [[-3.0, 3.8], [-1.0, 3.8], [1.0, 3.8], [3.0, 3.8]];

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
      kit.place(g, "farm-house", 7 * k, 0, -3.2);
      for (let i = 0; i < FIELD_COUNT[tier]; i++) {
        const [x, z] = FIELD_SLOTS[i];
        kit.place(g, "farm-field", 5.0, x, z);
      }
      break;
    }
    case "barracks": {
      kit.place(g, "barracks", (8.5 + s * 1.1) * k, 0, -0.4);
      for (let i = 0; i < Math.min(RACK_SLOTS.length, tier); i++) {
        const [x, z] = RACK_SLOTS[i];
        kit.place(g, "weapon-rack", 2.2, x, z);
      }
      break;
    }
    case "mine": {
      kit.place(g, s === 0 ? "mine-a" : "mine-b", (6.5 + s * 1.1) * k);
      break;
    }
    case "yard": {
      const w = 8.5 + tier * 0.25;
      const d = 6.5 + tier * 0.15;
      // Nền cùng tone sân thành, mỏng sát đất — không còn tấm trắng nổi.
      const ground = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), M.court.clone());
      ground.position.set(0, 0.02, 0.4);
      ground.receiveShadow = true;
      g.add(ground);
      const racks = 1 + Math.floor(tier / 2);
      for (let i = 0; i < racks; i++) {
        kit.place(g, "weapon-rack", 2.2, -w / 2 + 1.4 + i * 2.2, d / 2 - 0.35);
      }
      if (tier >= 2) kit.place(g, "pavilion", 4.2 + (tier - 2) * 0.2, w / 2 - 2.2, -d / 2 + 2.2);
      break;
    }
  }
  g.userData.anchorY = top(g) + 0.8;
  return g;
}
