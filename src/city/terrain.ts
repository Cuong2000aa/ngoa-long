import * as THREE from "three";
import type { Materials } from "./materials";

/** Cây ngoài hào (hào cách tâm khoảng 31). */
const TREE_SPOTS: [number, number][] = [
  [-40, 12], [-38, -18], [-44, -2], [40, 10], [36, 30], [46, -16],
  [-30, 40], [-12, 44], [14, 42], [-46, 30], [44, -36], [-6, -44], [20, -46], [-30, -42],
];

export function buildTerrain(M: Materials): THREE.Group {
  const g = new THREE.Group();
  const plane = (w: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    g.add(mesh);
  };
  plane(320, 320, M.grass, 0, 0, 0);
  plane(3.4, 27, M.path, 0, 0.045, 7.5);
  plane(16, 5, M.path, 0, 0.045, -4.5);

  // Đồi nền phía tây/xa; phía đông-bắc để trống cho núi + suối (scape).
  for (let i = 0; i < 4; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(14 + (i % 3) * 5, 14, 9), M.hill);
    hill.scale.y = 0.34;
    hill.position.set(-120 + i * 28, -1.5, -82 - (i % 2) * 14);
    hill.receiveShadow = true;
    g.add(hill);
  }

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.28, 1.4, 6);
  const crownGeo = new THREE.ConeGeometry(1.2, 2.8, 7);
  TREE_SPOTS.forEach(([x, z], i) => {
    const k = 0.85 + (i % 4) * 0.12;
    const trunk = new THREE.Mesh(trunkGeo, M.woodDark);
    trunk.position.set(x, 0.7 * k, z);
    trunk.scale.setScalar(k);
    trunk.castShadow = true;
    g.add(trunk);
    const crown = new THREE.Mesh(crownGeo, M.cropDark);
    crown.position.set(x, 2.6 * k, z);
    crown.scale.setScalar(k);
    crown.castShadow = true;
    g.add(crown);
  });
  return g;
}
