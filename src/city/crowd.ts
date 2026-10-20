import * as THREE from "three";
import { animateRig, createBird, createRig, type Pose, type Rig, type Role } from "./people";
import type { FolkKit } from "./folk";
import type { RavenTemplate } from "./raven";
import type { Tier } from "./tiers";

/**
 * Đồ thị đường đi — khớp SITES (hall 0,-10 · farm -13,4 · barracks 13,3 · mine 13,14).
 * Cạnh tránh thân công trình.
 */
const NODES: Record<string, [number, number]> = {
  gate: [0, 19.5],
  road1: [0, 11],
  road2: [0, 3],
  cross: [0, -4],
  hall: [0, -7],
  westX: [-7, -4],
  eastX: [7, -4],
  kho: [-14, -12],
  yard: [14, -12],
  farm: [-11, 5],
  plazaW: [-5, 13],
  plazaE: [5, 13],
  barracks: [11, 4],
  mine: [11, 13],
};
const EDGES: [string, string][] = [
  ["gate", "road1"], ["road1", "road2"], ["road2", "cross"], ["cross", "hall"],
  ["cross", "westX"], ["cross", "eastX"], ["westX", "kho"], ["eastX", "yard"],
  ["road2", "farm"], ["road1", "plazaW"], ["plazaW", "farm"], ["road1", "plazaE"],
  ["plazaE", "mine"], ["plazaE", "barracks"], ["mine", "barracks"], ["road2", "barracks"],
  ["gate", "plazaW"], ["gate", "plazaE"], ["farm", "kho"],
];
const WANDER_STOPS = ["gate", "hall", "kho", "yard", "farm", "plazaW", "plazaE", "barracks", "mine", "road1"];

const ADJ = new Map<string, string[]>();
for (const [a, b] of EDGES) {
  ADJ.set(a, [...(ADJ.get(a) ?? []), b]);
  ADJ.set(b, [...(ADJ.get(b) ?? []), a]);
}

function route(from: string, to: string): string[] {
  const prev = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const n of ADJ.get(cur) ?? []) {
      if (!prev.has(n)) {
        prev.set(n, cur);
        queue.push(n);
      }
    }
  }
  const path: string[] = [];
  for (let c: string | null | undefined = to; c; c = prev.get(c)) path.unshift(c);
  return path[0] === from ? path : [from, to];
}

type WorkSite = "hall" | "farm" | "barracks" | "mine" | "academy";

export interface CrowdLayout {
  tiers: Record<WorkSite, Tier>;
  /** Công trình Lv.0 (chưa xây) thì không có người làm việc. */
  built: Record<WorkSite, boolean>;
  /** Đoạn tuần tra trên mặt tường (đã tính độ cao). */
  patrols: [THREE.Vector3, THREE.Vector3][];
  faction: string;
}

interface Agent {
  rig: Rig;
  role: Role;
  seed: number;
  pose: Pose;
  speed: number;
  cur: number;
  path: THREE.Vector3[];
  wait: number;
  carry: boolean;
  /** Đi tiếp đâu khi hết đường; null = đứng yên làm việc. */
  next: ((a: Agent) => THREE.Vector3[]) | null;
  waitRange: [number, number];
  faceYaw: number | null;
}

interface Flyer {
  obj: THREE.Object3D;
  phase: number;
  radius: number;
  height: number;
  /** rad/giây; âm = bay ngược chiều. */
  speed: number;
  cx: number;
  cz: number;
  ready: boolean;
}

const BIRD_COUNT = 5;
/** Hard cap — máy yếu không spawn hàng trăm. */
const MAX_AGENTS = 40;
/** Quạ model dài ~0.62, sải ~1.4 đơn vị gốc. */
const RAVEN_SCALE = 0.65;
const _p = new THREE.Vector3();
const _v = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export class Crowd {
  readonly group = new THREE.Group();
  private agents: Agent[] = [];
  private flyers: Flyer[] = [];
  private signature = "";
  private seq = 0;
  private folk: FolkKit | null = null;
  private layout: CrowdLayout | null = null;

  constructor() {
    for (let i = 0; i < BIRD_COUNT; i++) {
      const obj = createBird();
      this.group.add(obj);
      this.flyers.push({
        obj,
        phase: (i / BIRD_COUNT) * Math.PI * 2 + rand(-0.3, 0.3),
        radius: rand(24, 40),
        height: rand(28, 38),
        speed: rand(0.08, 0.12) * (i % 3 === 2 ? -1 : 1),
        cx: rand(-6, 6),
        cz: rand(-6, 6),
        ready: false,
      });
    }
  }

  /** Thay người khối bằng người model khi tải xong (dựng lại đám đông). */
  useFolk(kit: FolkKit): void {
    this.folk = kit;
    if (this.layout) this.sync(this.layout);
  }

  /** Thay chim khối bằng quạ model khi tải xong. */
  useRaven(tpl: RavenTemplate): void {
    for (const f of this.flyers) {
      const raven = tpl.spawn();
      raven.scale.setScalar(RAVEN_SCALE);
      raven.position.copy(f.obj.position);
      raven.quaternion.copy(f.obj.quaternion);
      this.group.remove(f.obj);
      this.group.add(raven);
      f.obj = raven;
    }
  }

  sync(layout: CrowdLayout): void {
    const { tiers, built } = layout;
    this.layout = layout;
    const sig = JSON.stringify([tiers, built, layout.patrols.length, layout.faction, !!this.folk]);
    if (sig === this.signature) return;
    this.signature = sig;

    for (const a of this.agents) this.group.remove(a.rig.root);
    this.agents = [];
    this.seq = 0;
    const f = layout.faction;

    const room = () => this.agents.length < MAX_AGENTS;

    // —— Dân đường: tăng theo hall + farm ——
    const wanderers = Math.min(12, 4 + tiers.hall + (built.farm ? Math.floor(tiers.farm / 2) : 0));
    for (let i = 0; i < wanderers && room(); i++) {
      this.addWanderer(i % 5 === 4 ? "scholar" : "villager", f);
    }

    // —— Hall: NPC quanh chính điện ——
    if (built.hall && room()) {
      const hallN = [1, 2, 3, 4, 5, 6][tiers.hall];
      for (let i = 0; i < hallN && room(); i++) {
        const ang = (i / hallN) * Math.PI * 2 + 0.4;
        const r = 5.2 + (i % 2) * 0.8;
        const role: Role = i % 3 === 0 ? "scholar" : "villager";
        this.addGuardNear(role, f, Math.cos(ang) * r, -11 + Math.sin(ang) * r * 0.35, ang + Math.PI);
      }
      // Lính cửa chính điện
      if (room()) this.addGuard(f, -3.2, -6.5, 0);
      if (room()) this.addGuard(f, 3.2, -6.5, 0);
    }

    // Gác cổng
    if (room()) this.addGuard(f, -2.6, 18.6, 0);
    if (room()) this.addGuard(f, 2.6, 18.6, 0);

    // —— Farm: nông dân + gánh ——
    if (built.farm) {
      const fields: [number, number][] = [
        [-19.2, 4.2], [-14.8, 4.2], [-19.2, 7.0], [-14.8, 7.0], [-18.0, 1.2], [-16.0, 1.2],
      ];
      const farmers = [1, 2, 3, 4, 5, 6][tiers.farm];
      for (let i = 0; i < farmers && room(); i++) {
        const [fx, fz] = fields[i % fields.length];
        this.addWorker("farmer", f, "hoe", [
          v3(fx - 0.9, 0, fz),
          v3(fx + 0.9, 0, fz + 0.6),
          v3(fx, 0, fz - 0.8),
        ]);
      }
      // Gánh nông → kho (tier≥2)
      const carriers = Math.min(2, Math.floor(tiers.farm / 2));
      for (let i = 0; i < carriers && room(); i++) this.addFarmCarrier(f);
    }

    // —— Barracks: tập luyện + gác + tuần ——
    if (built.barracks) {
      if (room()) this.addGuard(f, 14.5, 6.5, -Math.PI / 5);
      if (tiers.barracks >= 2 && room()) this.addGuard(f, 15.5, 0.5, Math.PI / 2);
      const rows = 1 + Math.floor(tiers.barracks / 2);
      const cols = tiers.barracks >= 3 ? 3 : 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols && room(); c++) {
          this.addDrill(f, 14.5 + c * 1.35, -1.2 - r * 1.35);
        }
      }
    }

    // —— Mine ——
    if (built.mine) {
      const miners = 1 + Math.floor(tiers.mine / 2);
      for (let i = 0; i < miners && room(); i++) {
        this.addWorker("miner", f, "dig", [
          v3(15.5 + i * 0.7, 0, 16.2),
          v3(16.2, 0, 15.4 + i * 0.5),
        ]);
      }
      if (room()) this.addCarrier(f);
      if (tiers.mine >= 3 && room()) this.addCarrier(f);
    }

    // —— Academy drills ——
    if (built.academy) {
      const rows = 1 + Math.floor(tiers.academy / 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < 3 && room(); c++) this.addDrill(f, 15.2 + c * 1.4, -13.5 - r * 1.35);
      }
    }

    // —— Patrol trên tường: barracks↑ + hall↑ ——
    if (layout.patrols.length) {
      const base = built.barracks ? 2 + tiers.barracks : 1;
      const bonus = tiers.hall >= 3 ? 2 : tiers.hall >= 1 ? 1 : 0;
      const patrolCount = Math.min(layout.patrols.length, base + bonus, 8);
      for (let i = 0; i < patrolCount && room(); i++) {
        this.addPatrol(f, layout.patrols[(i * 3) % layout.patrols.length]);
      }
    }
  }

  private spawn(role: Role, faction: string, pos: THREE.Vector3, partial: Partial<Agent>): Agent {
    const seed = this.seq++;
    const rig = this.folk ? this.folk.rig(role, faction, seed) : createRig(role, faction, seed);
    rig.root.position.copy(pos);
    rig.root.rotation.y = rand(-Math.PI, Math.PI);
    this.group.add(rig.root);
    const a: Agent = {
      rig, role, seed, pose: "idle", speed: 0.78, cur: 0, path: [], wait: rand(0, 3), carry: false,
      next: null, waitRange: [2, 6], faceYaw: null, ...partial,
    };
    this.agents.push(a);
    return a;
  }

  private nodeVec(id: string, jitter: number): THREE.Vector3 {
    const [x, z] = NODES[id];
    return v3(x + rand(-jitter, jitter), 0, z + rand(-jitter, jitter));
  }

  private addWanderer(role: Role, faction: string): void {
    let at = WANDER_STOPS[Math.floor(Math.random() * WANDER_STOPS.length)];
    const next = (): THREE.Vector3[] => {
      let to = at;
      while (to === at) to = WANDER_STOPS[Math.floor(Math.random() * WANDER_STOPS.length)];
      const ids = route(at, to).slice(1);
      at = to;
      return ids.map((id, i) => this.nodeVec(id, i === ids.length - 1 ? 1.4 : 0.7));
    };
    this.spawn(role, faction, this.nodeVec(at, 1.5), {
      next, speed: role === "scholar" ? 0.48 : rand(0.52, 0.7), waitRange: [2.5, 9],
    });
  }

  private addGuard(faction: string, x: number, z: number, yaw: number): void {
    const a = this.spawn("soldier", faction, v3(x, 0, z), { pose: "guard", faceYaw: yaw });
    a.rig.root.rotation.y = yaw;
  }

  private addGuardNear(role: Role, faction: string, x: number, z: number, yaw: number): void {
    const a = this.spawn(role, faction, v3(x, 0, z), {
      pose: role === "scholar" ? "idle" : "idle",
      faceYaw: yaw,
      waitRange: [4, 12],
      next: () => {
        const jx = x + rand(-1.2, 1.2);
        const jz = z + rand(-0.8, 0.8);
        return [v3(jx, 0, jz)];
      },
      speed: 0.35,
    });
    a.rig.root.rotation.y = yaw;
  }

  private addWorker(role: Role, faction: string, pose: Pose, spots: THREE.Vector3[]): void {
    let i = 0;
    this.spawn(role, faction, spots[0].clone(), {
      pose, speed: 0.45, waitRange: [7, 16],
      next: () => [spots[(i = (i + 1) % spots.length)].clone()],
    });
  }

  private addCarrier(faction: string): void {
    let toKho = true;
    const next = (a: Agent): THREE.Vector3[] => {
      const ids = toKho ? route("mine", "kho") : route("kho", "mine");
      a.carry = toKho;
      toKho = !toKho;
      return ids.slice(1).map((id) => this.nodeVec(id, 0.5));
    };
    this.spawn("miner", faction, this.nodeVec("mine", 0.5), { next, speed: 0.55, waitRange: [2.5, 5] });
  }

  private addFarmCarrier(faction: string): void {
    let toKho = true;
    const next = (a: Agent): THREE.Vector3[] => {
      const ids = toKho ? route("farm", "kho") : route("kho", "farm");
      a.carry = toKho;
      toKho = !toKho;
      return ids.slice(1).map((id) => this.nodeVec(id, 0.5));
    };
    this.spawn("farmer", faction, this.nodeVec("farm", 0.6), { next, speed: 0.5, waitRange: [2, 4.5] });
  }

  private addDrill(faction: string, x: number, z: number): void {
    const a = this.spawn("soldier", faction, v3(x, 0, z), { pose: "thrust", faceYaw: Math.PI / 2 });
    a.rig.root.rotation.y = Math.PI / 2;
    a.seed = 0;
  }

  private addPatrol(faction: string, seg: [THREE.Vector3, THREE.Vector3]): void {
    let forward = true;
    const [a0, b0] = seg;
    const start = a0.clone().lerp(b0, Math.random());
    this.spawn("soldier", faction, start, {
      pose: "guard", speed: 0.62, waitRange: [2.5, 5.5],
      next: () => {
        forward = !forward;
        return [(forward ? a0 : b0).clone()];
      },
    });
  }

  /**
   * @param motionScale 0 = đứng yên (reducedMotion / pause ambient), 1 = đầy đủ
   */
  update(dt: number, t: number, motionScale = 1): void {
    dt = Math.min(dt, 0.1) * motionScale;
    if (motionScale <= 0.001) {
      // vẫn animate idle nhẹ rất chậm
      for (const a of this.agents) {
        animateRig(a.rig, a.pose, 0, 0, 0.016, t, false, a.seed);
      }
      return;
    }
    for (const a of this.agents) this.step(a, dt, t);
    for (const f of this.flyers) this.fly(f, dt, t);
  }

  private fly(f: Flyer, dt: number, t: number): void {
    const o = f.obj;
    const a = f.phase + t * f.speed;
    const r = f.radius + Math.sin(t * 0.07 + f.phase * 2) * 4;
    const y = f.height + Math.sin(t * 0.21 + f.phase * 3) * 2.4;
    _p.set(f.cx + Math.cos(a) * r, y, f.cz + Math.sin(a) * r);
    if (!f.ready || dt <= 0) {
      o.position.copy(_p);
      f.ready = true;
      return;
    }
    _v.subVectors(_p, o.position).divideScalar(dt);
    o.position.copy(_p);
    if (_v.lengthSq() < 1e-6) return;
    _fwd.copy(_v).normalize();
    _up.set(f.cx - _p.x, 0, f.cz - _p.z).normalize().multiplyScalar(0.42);
    _up.y = 1;
    _x.crossVectors(_up, _fwd).normalize();
    _y.crossVectors(_fwd, _x);
    _m.makeBasis(_x, _y, _fwd);
    _q.setFromRotationMatrix(_m);
    o.quaternion.slerp(_q, Math.min(1, dt * 3));
    const burst = Math.sin(t * 0.37 + f.phase * 5) > 0.15 ? 1 : 0.1;
    const effort = _v.y > 0.25 ? 1 : _v.y < -0.3 ? 0 : burst;
    (o.userData.flap as ((dt: number, effort: number) => void) | undefined)?.(dt, effort);
  }

  private step(a: Agent, dt: number, t: number): void {
    const root = a.rig.root;
    let moved = 0;
    let speed01 = 0;
    if (a.cur < a.path.length) {
      const target = a.path[a.cur];
      const dx = target.x - root.position.x;
      const dz = target.z - root.position.z;
      const dist = Math.hypot(dx, dz);
      let remain = dist;
      for (let i = a.cur + 1; i < a.path.length; i++) remain += a.path[i].distanceTo(a.path[i - 1]);
      const ease = Math.min(1, remain / 1.35, (a.rig.walk + 0.12) * 1.35);
      const stepLen = a.speed * Math.max(0.08, ease) * dt;
      if (dist <= stepLen) {
        root.position.x = target.x;
        root.position.z = target.z;
        moved = dist;
        a.cur++;
        if (a.cur >= a.path.length) a.wait = rand(...a.waitRange);
      } else {
        root.position.x += (dx / dist) * stepLen;
        root.position.z += (dz / dist) * stepLen;
        moved = stepLen;
      }
      root.position.y += (target.y - root.position.y) * Math.min(1, dt * 6);
      if (dist > 0.01) turnTo(root, Math.atan2(dx, dz), dt * 3.2);
      speed01 = Math.min(1, ease);
    } else {
      if (a.faceYaw !== null) turnTo(root, a.faceYaw, dt * 2.2);
      if (a.next) {
        a.wait -= dt;
        if (a.wait <= 0) {
          a.path = a.next(a);
          a.cur = 0;
        }
      }
      if (a.role === "miner" && a.carry && a.cur >= a.path.length) a.carry = false;
      if (a.role === "farmer" && a.carry && a.cur >= a.path.length) a.carry = false;
    }
    const pose = a.cur < a.path.length ? "idle" : a.pose;
    animateRig(a.rig, pose, moved, speed01, dt, t, a.carry && a.cur < a.path.length, a.seed);
  }
}

function turnTo(obj: THREE.Object3D, yaw: number, k: number): void {
  let d = yaw - obj.rotation.y;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  obj.rotation.y += d * Math.min(1, k);
}
