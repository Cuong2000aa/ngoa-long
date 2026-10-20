import * as THREE from "three";
import type { Materials } from "./materials";
import type { Tier } from "./tiers";

export type BuildingKind = "hall" | "granary" | "farm" | "barracks" | "mine" | "yard";

export interface Site {
  id: string;
  building_id: string;
  name: string;
  x: number;
  z: number;
  kind: BuildingKind;
}

/**
 * Vị trí trong thành (đơn vị world, tường trong ở khoảng ±25). id/building_id khớp NLGame.getBuildingList.
 * Trục x = 0 để trống làm đường từ cổng nam vào Ty Vũ.
 * Khoảng cách đủ cho footprint tier max (hall-c ~14, farm fields gọn).
 */
export const SITES: Site[] = [
  { id: "hall", building_id: "ty_vu", name: "Ty Vũ", x: 0, z: -11, kind: "hall" },
  { id: "wall", building_id: "kho", name: "Kho", x: -18, z: -15, kind: "granary" },
  { id: "academy", building_id: "san_tap", name: "Sân Tập", x: 18, z: -15, kind: "yard" },
  { id: "farm", building_id: "nong_trai", name: "Nông Trại", x: -17, z: 3, kind: "farm" },
  { id: "barracks", building_id: "doanh_trai", name: "Doanh Trại", x: 17, z: 2, kind: "barracks" },
  { id: "mine", building_id: "mo_bac", name: "Mỏ Bạc", x: 17, z: 17, kind: "mine" },
];

/** Hệ số phóng công trình so với khung dựng gốc. */
export const SITE_SCALE = 1.6;

const ROOF_LAYERS = [1, 1, 2, 2, 3, 3];

export class BuildingFactory {
  constructor(private readonly M: Materials) {}

  private box(g: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }

  private roof(g: THREE.Object3D, w: number, d: number, baseY: number, tier: Tier): number {
    const rise = 0.42 + tier * 0.05;
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(1, rise, 4), this.M.roof[tier]);
    mesh.rotation.y = Math.PI / 4;
    const overhang = 1.08;
    mesh.scale.set((w * overhang) / Math.SQRT2, 1, (d * overhang) / Math.SQRT2);
    mesh.position.set(0, baseY + rise * 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    this.box(g, Math.max(0.28, w * 0.12), 0.14, 0.16, this.M.gold, 0, baseY + rise * 0.92, 0);
    return baseY + rise;
  }

  private roofs(g: THREE.Object3D, w: number, d: number, y: number, tier: Tier): number {
    const layers = ROOF_LAYERS[tier];
    let yy = y;
    let ww = w;
    let dd = d;
    for (let i = 0; i < layers; i++) {
      yy = this.roof(g, ww, dd, yy, tier);
      if (i < layers - 1) {
        const nh = 0.62 + tier * 0.04;
        this.box(g, ww * 0.58, nh, dd * 0.58, this.M.plaster, 0, yy + nh * 0.35, 0);
        yy += nh * 0.7;
        ww *= 0.7;
        dd *= 0.7;
      }
    }
    return yy;
  }

  private house(parent: THREE.Object3D, x: number, z: number, w: number, d: number, h: number, tier: Tier, body: THREE.Material) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    this.box(g, w, h, d, body, 0, h / 2, 0);
    this.box(g, Math.max(0.35, w * 0.18), h * 0.48, 0.08, this.M.door, 0, h * 0.28, d / 2 + 0.01);
    const top = this.roofs(g, w, d, h, tier);
    parent.add(g);
    return top;
  }

  private flag(g: THREE.Object3D, x: number, z: number) {
    this.box(g, 0.08, 2.4, 0.08, this.M.woodDark, x, 1.2, z);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.48), this.M.banner);
    flag.position.set(x + 0.5, 2.15, z);
    flag.userData.isFlag = true;
    flag.castShadow = true;
    g.add(flag);
  }

  build(kind: BuildingKind, tier: Tier): THREE.Group {
    const g = new THREE.Group();
    const top = this[kind](g, tier);
    g.userData.anchorY = top + 0.35;
    return g;
  }

  private hall(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    const w = 4.6 + tier * 0.75;
    const d = 3.3 + tier * 0.4;
    const podium = 0.42 + tier * 0.07;
    const h = 1.75 + tier * 0.2;
    this.box(g, w + 1.8, podium, d + 2.0, M.stone, 0, podium / 2, 0);
    const steps = 4 + Math.floor(tier / 2);
    const sh = podium / steps;
    for (let s = 0; s < steps; s++) {
      this.box(g, 1.8, sh, 0.4, M.stone, 0, sh * (steps - s) - sh / 2, d / 2 + 0.45 + s * 0.4);
    }
    this.box(g, w, h, d, tier === 0 ? M.wood : M.plaster, 0, podium + h / 2, 0);
    this.box(g, 0.85, h * 0.55, 0.1, M.door, 0, podium + h * 0.32, d / 2 + 0.02);
    if (tier >= 1) {
      const cols = Math.min(6, 3 + tier);
      for (let i = 0; i < cols; i++) {
        const px = -w / 2 + 0.35 + i * ((w - 0.7) / (cols - 1));
        this.box(g, 0.2, h, 0.2, M.pillar, px, podium + h / 2, d / 2 + 0.16);
      }
    }
    const top = this.roofs(g, w * 1.02, d * 1.02, podium + h, tier);
    if (tier >= 4) {
      const wing = new THREE.Group();
      this.box(wing, w * 0.5, h * 0.72, d * 0.62, M.plaster, 0, podium + h * 0.36, 0);
      this.roofs(wing, w * 0.55, d * 0.68, podium + h * 0.72, Math.max(1, tier - 2) as Tier);
      wing.position.set(-w * 0.92, 0, 0.2);
      g.add(wing);
      const wing2 = wing.clone();
      wing2.position.x = w * 0.92;
      g.add(wing2);
    }
    this.flag(g, w * 0.55, -d * 0.2);
    return top;
  }

  private granary(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    const gw = 2.5 + tier * 0.45;
    const gd = 1.9 + tier * 0.2;
    const stilt = tier >= 2 ? 0.7 : 0.28;
    for (const [px, pz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      this.box(g, 0.16, stilt, 0.16, M.woodDark, px * gw * 0.32, stilt / 2, pz * gd * 0.32);
    }
    const bh = 1.25 + tier * 0.12;
    this.box(g, gw, bh, gd, tier < 2 ? M.wood : M.plaster, 0, stilt + bh / 2, 0);
    let top = this.roofs(g, gw, gd, stilt + bh, tier);
    if (tier >= 3) {
      top = Math.max(top, this.house(g, gw + 1.3, 0.3, gw * 0.75, gd * 0.8, 1.15, (tier - 2) as Tier, M.wood));
    }
    return top;
  }

  private farm(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    const plots = 3 + tier;
    for (let p = 0; p < plots; p++) {
      this.box(g, 2.15, 0.14, 1.45, p % 2 ? M.crop : M.cropDark, (p % 3) * 2.35 - 2.2, 0.07, Math.floor(p / 3) * 1.7 + 0.2);
    }
    const top = this.house(
      g, 0.2, -2.5, 2.3 + tier * 0.28, 1.7, 1.25 + tier * 0.1,
      Math.max(0, tier - 1) as Tier, tier < 2 ? M.wood : M.plaster,
    );
    if (tier >= 3) this.box(g, 0.7, 0.4, 0.7, M.stone, 2.4, 0.22, -1.1);
    if (tier >= 5) this.house(g, -2.6, -2.4, 1.8, 1.4, 1.2, 2, M.plaster);
    return top;
  }

  private barracks(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    const len = 3.4 + tier * 0.65;
    let top = this.house(g, 0, -0.5, len, 1.9, 1.35 + tier * 0.1, tier, tier < 2 ? M.wood : M.plaster);
    if (tier >= 2) {
      top = Math.max(top, this.house(g, 0.2, 2.0, len * 0.72, 1.5, 1.15, (tier - 2) as Tier, M.wood));
    }
    const posts = 2 + Math.floor(tier / 2);
    for (let n = 0; n < posts; n++) this.box(g, 0.12, 1.35, 0.12, M.woodDark, -1.1 + n * 0.75, 0.68, 3.3);
    this.flag(g, len * 0.45, -0.2);
    if (tier >= 4) this.flag(g, -len * 0.45, 1.6);
    return top;
  }

  private mine(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    const rocks = 4 + tier;
    for (let r = 0; r < rocks; r++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62 + (r % 3) * 0.32, 0), M.rock);
      rock.position.set((r % 4) * 0.85 - 1.2, 0.45 + (r % 2) * 0.35, (r % 3) * 0.45 - 0.6);
      rock.scale.y = 0.75 + tier * 0.06;
      rock.castShadow = true;
      rock.receiveShadow = true;
      g.add(rock);
    }
    this.box(g, 1.15, 0.95, 0.45, M.woodDark, 0.15, 0.48, 1.35);
    this.box(g, 0.72, 0.62, 0.12, M.cave, 0.15, 0.42, 1.6);
    let top = 2;
    if (tier >= 2) top = this.house(g, -2.3, 0.6, 1.8, 1.45, 1.15, (tier - 2) as Tier, M.wood);
    if (tier >= 4) {
      const ore = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.silver);
      ore.position.set(0.15, 0.5, 1.7);
      g.add(ore);
    }
    return Math.max(top, 2.2 + tier * 0.35);
  }

  private yard(g: THREE.Group, tier: Tier): number {
    const M = this.M;
    this.box(g, 4.2 + tier * 0.45, 0.08, 3.2 + tier * 0.25, M.sand, 0, 0.04, 0.4);
    const dummies = 2 + Math.floor(tier / 2);
    for (let i = 0; i < dummies; i++) {
      this.box(g, 0.26, 1.05, 0.26, M.straw, -1.3 + i * 0.85, 0.58, 0.5);
      this.box(g, 0.48, 0.32, 0.18, M.straw, -1.3 + i * 0.85, 1.2, 0.5);
    }
    let top = 2;
    if (tier >= 1) {
      top = this.house(g, 0, -2.15, 2.5 + tier * 0.25, 1.55, 1.3, (tier - 1) as Tier, tier < 3 ? M.wood : M.plaster);
    }
    if (tier >= 4) this.flag(g, 2.3, 0.2);
    return top;
  }
}
