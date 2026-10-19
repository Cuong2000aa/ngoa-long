import * as THREE from "three";
import type { Materials } from "./materials";
import { FORT } from "./walls";
import { loadScapeKit, type ScapeKit } from "./scapeKit";

/**
 * Vị trí theo ảnh đánh số (camera SE mặc định):
 * ① Đường: từ cổng nam kéo ra dưới-trái màn hình (tây-nam).
 * ② Khu săn: sát BÊN TRÁI thành (tây).
 * ③ Núi: phía TRÊN / TRÊN-PHẢI (bắc–đông-bắc), suối đổ vào hào xanh.
 */
const MOAT = FORT.side / 2 + 6.5;

interface AnimPart {
  kind: "bob" | "sway" | "fall";
  obj: THREE.Object3D;
  mats?: THREE.MeshStandardMaterial[];
  phase: number;
  amp: number;
  baseY?: number;
}

export class Scape {
  readonly group = new THREE.Group();
  private parts: AnimPart[] = [];
  private ready = false;

  async install(M: Materials): Promise<void> {
    if (this.ready) return;
    this.ready = true;
    try {
      const kit = await loadScapeKit();
      this.buildRoad(M);
      this.buildHunt(kit, M);
      this.buildMountain(kit, M);
    } catch (err) {
      console.error("[NLCity] cảnh ngoài fallback", err);
      this.buildRoadFallback(M);
      this.buildHuntFallback(M);
      this.buildMountainFallback(M);
    }
  }

  update(dt: number, t: number): void {
    for (const p of this.parts) {
      if (p.kind === "bob") {
        p.obj.position.y = (p.baseY ?? 0) + Math.sin(t * 1.5 + p.phase) * p.amp;
        p.obj.rotation.y += Math.sin(t * 0.35 + p.phase) * 0.12 * dt;
      } else if (p.kind === "sway") {
        p.obj.rotation.z = Math.sin(t * 0.85 + p.phase) * p.amp;
      } else if (p.kind === "fall" && p.mats) {
        for (const m of p.mats) {
          m.opacity = 0.55 + 0.25 * Math.sin(t * 3.5 + p.phase);
          if (m.map) {
            m.map.offset.y = (t * 0.9) % 1;
            m.map.needsUpdate = true;
          }
        }
      }
    }
  }

  /** ① Đường từ cổng nam ra dưới-trái (tây-nam). */
  private buildRoad(M: Materials): void {
    const roadMat = M.path.clone();
    roadMat.color.setHex(0xb09068);
    const stone = M.stone.clone();
    stone.color.setHex(0x9a958c);

    // Cổng Tripo tâm x=0, mặt trước ~z=26.7 — cầu nối sát lỗ cổng.
    const bridgeZ = 30.2;
    const deckW = 5.2;
    const deckLen = 8.0;
    for (const z of [bridgeZ - deckLen * 0.44, bridgeZ + deckLen * 0.44]) {
      const abut = new THREE.Mesh(new THREE.BoxGeometry(deckW + 0.6, 0.5, 1.2), stone);
      abut.position.set(0, 0.1, z);
      abut.castShadow = true;
      abut.receiveShadow = true;
      this.group.add(abut);
    }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(deckW, 0.2, deckLen), M.wood);
    deck.position.set(0, 0.36, bridgeZ);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.group.add(deck);
    for (const x of [-deckW * 0.46, deckW * 0.46]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, deckLen * 0.9), M.woodDark);
      rail.position.set(x, 0.68, bridgeZ);
      rail.castShadow = true;
      this.group.add(rail);
    }
    // Bậc sát mặt trước cổng.
    const stepIn = new THREE.Mesh(new THREE.BoxGeometry(deckW * 0.85, 0.16, 2.0), stone);
    stepIn.position.set(0, 0.18, 26.9);
    stepIn.receiveShadow = true;
    this.group.add(stepIn);

    // Đường cùng bề rộng cầu, thẳng rồi mới cong.
    const outZ = bridgeZ + deckLen * 0.5 + 0.4;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06, outZ),
      new THREE.Vector3(0, 0.06, outZ + 8),
      new THREE.Vector3(-4, 0.06, outZ + 20),
      new THREE.Vector3(-12, 0.06, outZ + 36),
      new THREE.Vector3(-22, 0.06, outZ + 52),
      new THREE.Vector3(-34, 0.06, outZ + 68),
    ]);
    this.addTube(curve, deckW, 64, roadMat);
    const track = roadMat.clone();
    track.color.setHex(0x8f7350);
    const sidePts = curve.getSpacedPoints(28);
    for (const sign of [-1, 1] as const) {
      const side = sidePts.map((p, i) => {
        const t = i / (sidePts.length - 1);
        const tan = curve.getTangent(t).normalize();
        const sideDir = new THREE.Vector3(-tan.z, 0, tan.x).multiplyScalar(sign * 1.15);
        return p.clone().add(sideDir).setY(0.07);
      });
      this.addRibbon(side, 0.4, track, 0.07);
    }
  }

  private buildRoadFallback(M: Materials): void {
    const mat = M.path.clone();
    mat.color.setHex(0xb09068);
    this.addRibbon(
      [new THREE.Vector3(0, 0.05, MOAT), new THREE.Vector3(-28, 0.05, MOAT + 60)],
      5,
      mat,
      0.05,
    );
  }

  /** ② Khu săn — sát bên trái thành (ô đỏ số 2). */
  private buildHunt(kit: ScapeKit, M: Materials): void {
    // Tây sát thành — ô đỏ số 2 bên trái (isometric = giữa-trái màn hình).
    const cx = -48;
    const cz = 2;
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    this.group.add(g);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 28), M.sand.clone());
    (ground.material as THREE.MeshStandardMaterial).color.setHex(0x5a6a3a);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.025;
    ground.receiveShadow = true;
    g.add(ground);

    const R = 14;
    for (let i = 0; i < 12; i++) {
      // Mở cổng phía đông (hướng về thành).
      if (i === 0 || i === 11) continue;
      const a0 = (i / 12) * Math.PI * 2;
      const a1 = ((i + 1) / 12) * Math.PI * 2;
      const x = Math.cos(a0) * R;
      const z = Math.sin(a0) * R;
      const yaw = Math.atan2(Math.sin(a1) - Math.sin(a0), Math.cos(a1) - Math.cos(a0));
      kit.place(g, "fence", 5.2, x * 0.92, z * 0.92, -yaw);
    }
    for (const z of [-2.4, 2.4]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 0.4), M.woodDark);
      post.position.set(R - 0.6, 1.25, z);
      post.castShadow = true;
      g.add(post);
    }
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.3, 0.14), M.wood);
    board.position.set(R + 0.3, 1.8, 0);
    board.rotation.y = -Math.PI / 2;
    board.castShadow = true;
    g.add(board);

    // Tre Tripo texture bị đen — dùng cụm cây Tripo thay.
    for (const [x, z, s] of [
      [-7, -6, 5.4],
      [5, -8, 5.0],
      [-4, 8, 5.6],
      [8, 5, 4.8],
      [-9, 2, 5.2],
      [2, 0, 4.6],
      [-3, -9, 4.8],
      [9, -3, 5.2],
      [-8, 7, 4.4],
      [6, 8, 4.6],
    ] as const) {
      const t = kit.place(g, "tree", s, x, z, Math.random() * Math.PI * 2);
      this.parts.push({ kind: "sway", obj: t, phase: Math.random() * 5, amp: 0.012 });
    }

    const animals = [
      kit.place(g, "deer", 3.4, -4, -2, 0.9),
      kit.place(g, "deer", 3.0, 5, 4, -1.4),
      kit.place(g, "boar", 2.6, 2, -6, 2.0),
      kit.place(g, "boar", 2.3, -7, 4, -0.5),
    ];
    for (const a of animals) {
      this.ground(a, 0);
      this.parts.push({ kind: "bob", obj: a, phase: Math.random() * 6, amp: 0.04, baseY: a.position.y });
    }
    const target = kit.place(g, "target", 2.6, 10, 0, -Math.PI / 2);
    this.ground(target, 0);

    for (let i = 0; i < 10; i++) {
      const bush = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 5), M.cropDark);
      bush.position.set((Math.random() - 0.5) * 22, 0.35, (Math.random() - 0.5) * 22);
      bush.scale.setScalar(0.7 + Math.random() * 0.5);
      g.add(bush);
    }
  }

  private buildHuntFallback(M: Materials): void {
    const g = new THREE.Group();
    g.position.set(-48, 0, 2);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(12, 20), M.sand);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.03;
    g.add(ground);
    this.group.add(g);
  }

  /** ③ Núi đá góc trên-phải + thác + suối đổ vào hào. */
  private buildMountain(kit: ScapeKit, M: Materials): void {
    // Núi phía bắc-đông; suối đổ đúng mép hào bắc (không đâm vào tường).
    const mx = 30;
    const mz = -72;
    const footX = 24;
    const footZ = mz + 16; // chân sườn nam
    const joinX = 14;
    // Hào bắc thật tại z≈-30.1 (đo từ walls) — suối phải đè lên dải đó.
    const moatZ = -30.1;
    // Cùng material hào — không clone đổi màu / texture riêng.
    const water = M.water;

    const main = kit.place(this.group, "peak", 30, mx, mz, 0.15, { height: 18 });
    this.ground(main, -0.5);
    const side = kit.place(this.group, "peak", 18, mx + 14, mz - 8, -0.5, { height: 11 });
    this.ground(side, -0.35);

    // Chân thác = đầu suối (cùng XY) — thác rộng hơn, cùng tone hào.
    const fallFoot = new THREE.Vector3(footX - 1, 0.04, footZ + 6.5);
    const fallPts = [
      new THREE.Vector3(fallFoot.x + 0.15, 6.2, footZ - 2.5),
      new THREE.Vector3(fallFoot.x + 0.05, 3.8, footZ - 0.4),
      new THREE.Vector3(fallFoot.x, 1.9, footZ + 2.2),
      new THREE.Vector3(fallFoot.x, 0.5, footZ + 4.6),
      fallFoot.clone().setY(0.12),
    ];
    this.addFallSheets(fallPts, water);

    // Ao nhỏ chân thác (chữ nhật, cùng M.water) nối thác → suối.
    const footPool = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), water);
    footPool.rotation.x = -Math.PI / 2;
    footPool.position.set(fallFoot.x, 0.024, fallFoot.z + 0.5);
    footPool.receiveShadow = true;
    this.group.add(footPool);

    // Một dải phẳng mượt: z tăng dần chân núi → hào (không gập ngược / ống).
    const groundCurve = new THREE.CatmullRomCurve3(
      [
        fallFoot.clone().setY(0.025),
        new THREE.Vector3(fallFoot.x - 2.5, 0.025, -45),
        new THREE.Vector3(joinX + 2.5, 0.025, -39),
        new THREE.Vector3(joinX + 0.8, 0.025, -34),
        new THREE.Vector3(joinX, 0.025, moatZ),
        new THREE.Vector3(joinX, 0.022, moatZ + 1.5),
      ],
      false,
      "catmullrom",
      0.35,
    );
    this.addFlatStream(groundCurve, 3.2, water, 80);
    // Dải chữ nhật hẹp đè mép hào — nối T, không đĩa tròn.
    const joinPad = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), water);
    joinPad.rotation.x = -Math.PI / 2;
    joinPad.position.set(joinX, 0.022, moatZ + 0.2);
    joinPad.receiveShadow = true;
    this.group.add(joinPad);

    const streamPts = groundCurve.getSpacedPoints(6);
    for (let i = 1; i < streamPts.length - 1; i++) {
      const p = streamPts[i];
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + (i % 3) * 0.15, 0), M.rock);
      rock.position.set(p.x + ((i % 2) * 2 - 1) * 1.5, 0.16, p.z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.group.add(rock);
    }
    for (const [x, z, s] of [
      [footX - 4, footZ + 3, 4.2],
      [mx + 8, mz + 10, 4.0],
      [joinX + 4, -48, 3.8],
    ] as const) {
      kit.place(this.group, "tree", s, x, z, Math.random());
    }
  }

  private buildMountainFallback(M: Materials): void {
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(14, 18, 7), M.hill);
    mountain.position.set(30, 6, -72);
    this.group.add(mountain);
    this.addFlatStream(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(24, 0.02, -56),
        new THREE.Vector3(12, 0.02, -MOAT),
      ]),
      3.2,
      M.water,
      32,
    );
  }

  private ground(obj: THREE.Object3D, pad = 0): void {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    obj.position.y += pad - box.min.y;
  }

  private addRibbon(pts: THREE.Vector3[], width: number, mat: THREE.Material, y: number): void {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = a.distanceTo(b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, len + 1.2), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(mid.x, Math.max(a.y, b.y, y), mid.z);
      mesh.rotation.z = -Math.atan2(b.x - a.x, b.z - a.z);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  /** Thác: dải mỏng cùng màu hào (không pulse opacity → không sáng lệch). */
  private addFallSheets(pts: THREE.Vector3[], baseMat: THREE.MeshStandardMaterial): void {
    const root = new THREE.Group();
    this.group.add(root);
    for (let layer = 0; layer < 2; layer++) {
      const m = baseMat.clone();
      m.side = THREE.DoubleSide;
      m.depthWrite = true;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b) + 0.35;
        const w = 2.8 - layer * 0.4 - i * 0.04;
        const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, len), m);
        sheet.position.copy(mid);
        sheet.position.x += (layer - 0.5) * 0.1;
        const dir = b.clone().sub(a).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        sheet.quaternion.copy(quat);
        sheet.rotateY(Math.PI / 2);
        root.add(sheet);
      }
    }
  }

  /** Suối mặt đất: dải triangle liền theo curve (không ống / không khúc plane rời). */
  private addFlatStream(
    curve: THREE.CatmullRomCurve3,
    width: number,
    mat: THREE.Material,
    segs: number,
  ): void {
    const half = width * 0.5;
    const positions: number[] = [];
    const indices: number[] = [];
    const y = 0.025;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
      if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
      else side.normalize();
      positions.push(p.x + side.x * half, y, p.z + side.z * half);
      positions.push(p.x - side.x * half, y, p.z - side.z * half);
    }
    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      // Winding quay +Y để nhìn từ trên thấy mặt trước.
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  /** Ống theo curve; cascade=false → ép sát mặt đất (đường). */
  private addTube(
    curve: THREE.CatmullRomCurve3,
    width: number,
    segs: number,
    mat: THREE.Material,
    cascade = false,
  ): void {
    const geo = new THREE.TubeGeometry(curve, segs, width * 0.5, 6, false);
    const pos = geo.attributes.position;
    if (!cascade) {
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, 0.055 + Math.abs(pos.getY(i)) * 0.02);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }
}
