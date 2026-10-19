import * as THREE from "three";
import {
  createBattleActor,
  playActor,
  prefetchBattleActors,
  troopArtUrl,
  type BattleActor,
} from "./battleActors";
import {
  prefetchBattleVfx,
  spawnHitBurst,
  spawnSkillAura,
  spawnSkillBeam,
  spawnSlashArc,
  spawnStatusOrb,
  tickBattleVfx,
} from "./battleVfx";

export type BattleUnitSpec = {
  uid: string;
  name: string;
  slot: number;
  side: "ally" | "enemy";
  troop?: string;
  troopTier?: number;
  level?: number;
  faction?: string;
  horseId?: string | null;
  hp?: number;
  maxHp?: number;
};

export type BattleMountOpts = {
  /** Preview bày trận — camera nhìn đội ta, không cần nửa sân địch */
  preview?: boolean;
};

type Lunge = {
  from: THREE.Vector3;
  peak: THREE.Vector3;
  t0: number;
  durOut: number;
  durBack: number;
};

type StatusChip = { id: string; label: string; kind: "buff" | "debuff" | "control" };

type Fighter = {
  uid: string;
  side: "ally" | "enemy";
  slot: number;
  name: string;
  troop: string;
  actor: BattleActor;
  seed: number;
  dead: boolean;
  home: THREE.Vector3;
  hp: number;
  maxHp: number;
  morale: number;
  maxMorale: number;
  hitFlashUntil: number;
  rimHex: number;
  hud: HTMLElement | null;
  lunge: Lunge | null;
  statuses: StatusChip[];
};

/**
 * Đội hình 3+2 kiểu Ngọa Long H5 (wiki “Xem kỹ năng”):
 * - Phe ta TRÁI / địch PHẢI — đối mặt qua giữa sân
 * - Hàng trước gần giữa; hàng sau lùi cánh — giãn Z rõ
 * - Mỗi ô = cụm lính (battleActors)
 */
const FRONT_Z = [-2.2, 0, 2.2];
const BACK_Z = [-1.15, 1.15];
const FRONT_X = 2.95;
const BACK_X = 4.75;

function slotXZ(slot: number, enemy: boolean): { x: number; z: number } {
  const s = Math.max(0, Math.min(4, slot | 0));
  const front = s <= 2;
  const z = front ? FRONT_Z[s] : BACK_Z[s - 3];
  const ax = front ? FRONT_X : BACK_X;
  return { x: enemy ? ax : -ax, z };
}

function clampSlot(s: number | null | undefined): number {
  const n = s == null ? 0 : s;
  return Math.max(0, Math.min(4, n));
}

/**
 * Chiến trường SRPG — token wiki binh chủng + VFX Kenney/Cethiel.
 * Pattern: Ngọa Long (đối diện / skill) + FE / Triangle Strategy (3+2, lunge, HUD).
 */
export class BattleRenderer {
  private host: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private fighters = new Map<string, Fighter>();
  private hudLayer: HTMLElement | null = null;
  private running = false;
  private raf = 0;
  private t0 = 0;
  private last = 0;
  private preview = false;
  private readonly tmp = new THREE.Vector3();
  private onResizeBound = () => this.resize();

  async mount(host: HTMLElement, opts?: BattleMountOpts): Promise<void> {
    this.dispose();
    this.host = host;
    this.preview = !!(opts && opts.preview);
    host.classList.add("has-battle-gl");
    let mount = host.querySelector<HTMLElement>(".battle-gl-host");
    if (!mount) {
      mount = document.createElement("div");
      mount.className = "battle-gl-host";
      host.insertBefore(mount, host.firstChild);
    }
    mount.innerHTML = "";

    let hud = host.querySelector<HTMLElement>(".battle-hud-layer");
    if (!hud) {
      hud = document.createElement("div");
      hud.className = "battle-hud-layer";
      host.appendChild(hud);
    }
    hud.innerHTML = "";
    this.hudLayer = hud;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.className = "battle-gl";
    mount.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    // Alpha: CSS battle-courtyard làm backdrop; fog ấm hòa sàn đá
    scene.background = null;
    scene.fog = this.preview
      ? new THREE.FogExp2(0x5a4030, 0.028)
      : new THREE.FogExp2(0x5c4838, 0.018);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.2, 90);
    if (this.preview) {
      camera.position.set(-1.4, 5.8, 9.2);
      camera.lookAt(-2.4, 0.45, 0);
    } else {
      // Góc thấp hơn — thấy điện/tháp phía sau, không chỉ nhìn đỉnh đầu
      camera.position.set(0, 6.8, 13.2);
      camera.lookAt(0, 0.55, -0.4);
    }
    this.camera = camera;

    this.buildArena(scene);
    prefetchBattleVfx();
    prefetchBattleActors();
    this.resize();
    window.addEventListener("resize", this.onResizeBound);
    this.running = true;
    this.t0 = performance.now();
    this.last = this.t0;
    this.tick();
  }

  private buildArena(scene: THREE.Scene): void {
    const loader = new THREE.TextureLoader();
    const load = (url: string) => {
      const t = loader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    scene.add(new THREE.HemisphereLight(0xffe8d0, 0x3a2820, 1.15));
    const sun = new THREE.DirectionalLight(0xffe0b8, 1.65);
    sun.position.set(-3, 11, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x7a6050, 0.5));

    // Sàn đá bán trong — để ảnh cung CSS lộ quanh mép (kiểu NL)
    const courtyard = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, 9.2),
      new THREE.MeshStandardMaterial({
        color: 0x8f7358,
        roughness: 0.94,
        metalness: 0.04,
        transparent: true,
        opacity: 0.88,
      })
    );
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.receiveShadow = true;
    scene.add(courtyard);

    const grain = new THREE.Mesh(
      new THREE.PlaneGeometry(13.8, 8.6),
      new THREE.MeshBasicMaterial({
        map: load("assets/fx/particles/scorch_01.png"),
        color: 0x6b5340,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
    );
    grain.rotation.x = -Math.PI / 2;
    grain.position.y = 0.01;
    scene.add(grain);

    const medal = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 40),
      new THREE.MeshBasicMaterial({
        map: load("assets/fx/particles/circle_02.png"),
        color: 0xc4a060,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      })
    );
    medal.rotation.x = -Math.PI / 2;
    medal.position.y = 0.02;
    scene.add(medal);

    const addBillboard = (
      url: string,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      tint = 0xffffff
    ) => {
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: load(url),
          color: tint,
          transparent: true,
          depthWrite: false,
          alphaTest: 0.12,
        })
      );
      spr.position.set(x, y, z);
      spr.scale.set(w, h, 1);
      spr.center.set(0.5, 0);
      scene.add(spr);
      return spr;
    };

    // Chỉ asset cùng style (FreeGameSprites 2.5D) — bỏ cổng pixel lệch
    addBillboard("assets/city/cn-palace/chinese-temple.webp", 0, 0, -4.5, 6.2, 4.9);
    addBillboard("assets/city/cn-palace/chinese-pagoda-tower.webp", -6.8, 0, -2.8, 2.6, 3.8);
    addBillboard("assets/city/cn-palace/pagoda.webp", 6.8, 0, -2.8, 2.6, 3.8);
    addBillboard("assets/city/cn-palace/cherry-blossom-tree.png", -7.6, 0, 1.4, 2.1, 2.9);
    addBillboard("assets/city/cn-palace/cherry-blossom-tree.png", 7.6, 0, 1.4, 2.1, 2.9);
    addBillboard("assets/city/cn-palace/chinese-lantern-red.png", -5.8, 0, 3.5, 0.65, 1.05);
    addBillboard("assets/city/cn-palace/chinese-lantern-red.png", 5.8, 0, 3.5, 0.65, 1.05);
  }

  spawn(allies: BattleUnitSpec[], foes: BattleUnitSpec[], _playerFaction = "shu"): void {
    if (!this.scene) return;
    this.clearFighters();
    const scene = this.scene;
    const add = async (u: BattleUnitSpec, enemy: boolean) => {
      const slot = clampSlot(u.slot);
      const seed = (u.uid || u.name || "").length * 17 + slot * 31 + (enemy ? 99 : 3);
      const { x, z } = slotXZ(slot, enemy);
      const rimHex = enemy ? 0xef4444 : 0x2dd4bf;
      try {
        const tier = u.troopTier != null ? u.troopTier : 1;
        const actor = await createBattleActor(u.troop || "infantry", enemy, seed, u.name, tier);
        actor.root.position.set(x, 0, z);
        scene.add(actor.root);
        const hud = this.createHud(u.name, enemy, u.troop || "infantry", tier);
        this.fighters.set(u.uid, {
          uid: u.uid,
          side: enemy ? "enemy" : "ally",
          slot,
          name: u.name,
          troop: u.troop || "infantry",
          actor,
          seed,
          dead: false,
          home: new THREE.Vector3(x, 0, z),
          hitFlashUntil: 0,
          hp: u.hp != null ? u.hp : 1,
          maxHp: u.maxHp != null ? u.maxHp : 1,
          morale: 50,
          maxMorale: 100,
          rimHex,
          hud,
          lunge: null,
          statuses: [],
        });
        this.paintHud(this.fighters.get(u.uid)!);
      } catch (err) {
        console.warn("[battle] load unit fail", u.name, err);
      }
    };
    void Promise.all([
      ...(allies || []).map((u) => add(u, false)),
      ...(foes || []).map((u) => add(u, true)),
    ]);
  }

  private createHud(name: string, enemy: boolean, troop: string, tier = 1): HTMLElement | null {
    if (!this.hudLayer || this.preview) return null;
    const el = document.createElement("div");
    el.className = "unit-overhead" + (enemy ? " enemy" : " ally");
    const src = troopArtUrl(troop, tier);
    el.innerHTML =
      '<div class="uo-chip"><img class="uo-face" src="' +
      src +
      '" alt="" /><div class="uo-meta"><div class="uo-name"></div>' +
      '<div class="uo-hp"><i></i></div><div class="uo-morale"><i></i></div>' +
      '<div class="uo-status"></div></div></div>';
    (el.querySelector(".uo-name") as HTMLElement).textContent = name;
    this.hudLayer.appendChild(el);
    return el;
  }

  private paintHud(f: Fighter): void {
    if (!f.hud) return;
    const hpPct = Math.max(0, Math.min(100, (f.hp / (f.maxHp || 1)) * 100));
    const mPct = Math.max(0, Math.min(100, (f.morale / (f.maxMorale || 100)) * 100));
    const hp = f.hud.querySelector(".uo-hp > i") as HTMLElement | null;
    const mo = f.hud.querySelector(".uo-morale > i") as HTMLElement | null;
    if (hp) hp.style.width = hpPct + "%";
    if (mo) mo.style.width = mPct + "%";
    f.hud.classList.toggle("dead", f.dead || f.hp <= 0);
    const row = f.hud.querySelector(".uo-status") as HTMLElement | null;
    if (row) {
      const chips = (f.statuses || []).slice(0, 4);
      row.innerHTML = chips
        .map(
          (s) =>
            '<span class="uo-st uo-st-' +
            s.kind +
            '" title="' +
            s.label +
            '">' +
            s.label +
            "</span>"
        )
        .join("");
    }
  }

  private syncHudPositions(): void {
    if (!this.camera || !this.renderer || !this.host) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const hostRect = this.host.getBoundingClientRect();
    this.fighters.forEach((f) => {
      if (!f.hud) return;
      // Neo sát đỉnh thủ lĩnh (~0.85) — máu gần nhân, không bay cao trên cờ
      this.tmp.set(f.actor.root.position.x, 0.92, f.actor.root.position.z);
      this.tmp.project(this.camera!);
      if (this.tmp.z > 1) {
        f.hud.style.visibility = "hidden";
        return;
      }
      f.hud.style.visibility = "visible";
      const x = ((this.tmp.x + 1) / 2) * rect.width + (rect.left - hostRect.left);
      const y = ((-this.tmp.y + 1) / 2) * rect.height + (rect.top - hostRect.top);
      f.hud.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    });
  }

  setHp(uid: string, hp: number, maxHp: number): void {
    const f = this.fighters.get(uid);
    if (!f) return;
    f.hp = hp;
    f.maxHp = maxHp || 1;
    this.paintHud(f);
    if (hp <= 0) this.setDead(uid);
  }

  setMorale(uid: string, value: number, max = 100): void {
    const f = this.fighters.get(uid);
    if (!f) return;
    f.morale = value;
    f.maxMorale = max || 100;
    this.paintHud(f);
  }

  setDead(uid: string): void {
    const f = this.fighters.get(uid);
    if (!f || f.dead) return;
    f.dead = true;
    f.lunge = null;
    playActor(f.actor, "death", 0.1);
    this.paintHud(f);
  }

  /** Icon trạng thái wiki (Trúng độc / Anh dũng / Hỗn loạn…) trên HUD cụm */
  setStatuses(uid: string, statuses: StatusChip[]): void {
    const f = this.fighters.get(uid);
    if (!f) return;
    f.statuses = statuses || [];
    this.paintHud(f);
    if (this.scene && statuses && statuses.length) {
      const last = statuses[statuses.length - 1];
      spawnStatusOrb(this.scene, f.actor.root.position.clone(), last.kind === "buff" ? "buff" : "debuff");
    }
  }

  attack(fromUid: string, toUid: string, missed = false): void {
    const from = this.fighters.get(fromUid);
    const to = this.fighters.get(toUid);
    if (!from || from.dead || !this.scene) return;
    playActor(from.actor, "attack", 0.08);
    const dir =
      to && !to.dead
        ? to.home.clone().sub(from.home)
        : new THREE.Vector3(from.side === "ally" ? 1 : -1, 0, 0);
    dir.y = 0;
    if (dir.lengthSq() > 0.01) dir.normalize();
    const ranged = from.troop === "archer" || from.troop === "strategist";
    const peak = from.home.clone().addScaledVector(dir, missed ? 0.25 : ranged ? 0.35 : 0.85);
    from.lunge = {
      from: from.home.clone(),
      peak,
      t0: performance.now(),
      durOut: ranged ? 110 : 130,
      durBack: ranged ? 200 : 240,
    };
    if (to && !to.dead && !missed) {
      const atkTroop = from.troop;
      if (atkTroop === "archer" || atkTroop === "strategist") {
        spawnSkillBeam(
          this.scene,
          from.actor.root.position.clone(),
          to.home,
          atkTroop === "strategist" ? "bagua" : "gold",
          performance.now()
        );
      } else {
        spawnSlashArc(this.scene, from.actor.root.position.clone(), to.home, performance.now());
      }
      setTimeout(() => {
        if (!to.dead && this.scene) {
          to.hitFlashUntil = performance.now() + 300;
          playActor(to.actor, "hit", 0.05);
          spawnHitBurst(this.scene, to.actor.root.position.clone());
        }
      }, 130);
    }
  }

  skillFlash(uid: string, flash = "gold", targetUids: string[] = []): void {
    const f = this.fighters.get(uid);
    if (!f || f.dead || !this.scene) return;
    playActor(f.actor, "skill", 0.1);
    const now = performance.now();
    const at = f.actor.root.position.clone();
    // Ưu tiên flash từ skills.json (theo phẩm/chiêu); troop chỉ fallback
    const kind =
      flash && flash !== "gold"
        ? flash
        : f.troop === "strategist"
          ? "bagua"
          : f.troop === "archer"
            ? "thunder"
            : "fire";
    // Wiki NL: 1 aura (không chồng LightEffect → hết viền vuông) → đạn → impact
    spawnSkillAura(this.scene, at, kind, now);
    const isBuffFlash =
      kind === "gold_soft" || kind === "wind" || kind === "teal" || kind === "gold";
    spawnStatusOrb(this.scene, at, isBuffFlash ? "buff" : "debuff");
    f.lunge = {
      from: f.home.clone(),
      peak: f.home.clone().add(new THREE.Vector3(f.side === "ally" ? 0.28 : -0.28, 0, 0)),
      t0: now,
      durOut: 200,
      durBack: 360,
    };
    const targets = targetUids.length ? targetUids : [];
    targets.forEach((tid, i) => {
      const to = this.fighters.get(tid);
      if (!to || to.dead || !this.scene) return;
      const delay = 120 + i * 110;
      setTimeout(() => {
        if (!this.scene || to.dead) return;
        const dest = to.actor.root.position.clone();
        spawnSkillBeam(this.scene, at, dest, kind, performance.now());
        playActor(to.actor, "hit", 0.05);
        to.hitFlashUntil = performance.now() + 520;
        spawnStatusOrb(this.scene, dest, "debuff");
      }, delay);
      // Nhịp 2 — sát thương lần hai (pattern Hổ Sát / Lướt Nhanh)
      setTimeout(() => {
        if (!this.scene || to.dead) return;
        const dest = to.actor.root.position.clone();
        spawnSkillBeam(this.scene, at, dest, kind, performance.now());
        spawnHitBurst(this.scene, dest);
        to.hitFlashUntil = performance.now() + 480;
      }, delay + 320);
    });
  }

  screenPos(uid: string): { x: number; y: number } | null {
    const f = this.fighters.get(uid);
    if (!f || !this.camera || !this.renderer || !this.host) return null;
    this.tmp.set(f.actor.root.position.x, 0.9, f.actor.root.position.z);
    this.tmp.project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    const hostRect = this.host.getBoundingClientRect();
    return {
      x: ((this.tmp.x + 1) / 2) * rect.width + (rect.left - hostRect.left),
      y: ((-this.tmp.y + 1) / 2) * rect.height + (rect.top - hostRect.top),
    };
  }

  dispose(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener("resize", this.onResizeBound);
    this.clearFighters();
    if (this.hudLayer) {
      this.hudLayer.innerHTML = "";
      this.hudLayer = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    if (this.host) this.host.classList.remove("has-battle-gl");
    this.host = null;
    this.preview = false;
  }

  private clearFighters(): void {
    this.fighters.forEach((f) => {
      f.actor.root.parent?.remove(f.actor.root);
      if (f.hud) f.hud.remove();
    });
    this.fighters.clear();
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  private updateLunge(f: Fighter, now: number): void {
    if (!f.lunge) return;
    const L = f.lunge;
    const elapsed = now - L.t0;
    const total = L.durOut + L.durBack;
    const spr = f.actor.sprite;
    const bx = f.actor.baseScale.x;
    const by = f.actor.baseScale.y;
    if (elapsed >= total) {
      f.actor.root.position.copy(f.home);
      spr.scale.set(bx, by, 1);
      f.lunge = null;
      return;
    }
    let pos: THREE.Vector3;
    let squash = 1;
    if (elapsed <= L.durOut) {
      const u = this.easeInOut(elapsed / L.durOut);
      pos = L.from.clone().lerp(L.peak, u);
      // Windup → strike: kéo dài theo hướng đánh
      squash = 1 + u * 0.12;
    } else {
      const u = this.easeInOut((elapsed - L.durOut) / L.durBack);
      pos = L.peak.clone().lerp(L.from, u);
      squash = 1.12 - u * 0.12;
    }
    f.actor.root.position.copy(pos);
    spr.scale.set(bx * squash, by * (2 - squash), 1);
  }

  private applyHitFlash(f: Fighter, now: number): void {
    const mat = f.actor.sprite.material as THREE.SpriteMaterial;
    if (f.dead) return;
    if (now < f.hitFlashUntil) {
      const pulse = 0.55 + 0.45 * Math.sin(now * 0.04);
      mat.color.setRGB(1, pulse * 0.55, pulse * 0.45);
    } else if (f.side === "enemy") {
      mat.color.setHex(0xffe4e0);
    } else {
      mat.color.setHex(0xffffff);
    }
  }

  private resize(): void {
    if (!this.host || !this.renderer || !this.camera) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private tick = (): void => {
    if (!this.running || !this.renderer || !this.scene || !this.camera) return;
    this.raf = requestAnimationFrame(this.tick);
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const t = (now - this.t0) / 1000;

    this.fighters.forEach((f) => {
      f.actor.mixer.update(dt);
      if (f.dead) {
        this.applyHitFlash(f, now);
        return;
      }
      this.updateLunge(f, now);
      this.applyHitFlash(f, now);
      // Idle bob cụm + từng lính phụ lệch pha
      if (!f.lunge) {
        const bob = Math.sin(t * 2.1 + f.seed * 0.37) * 0.022;
        f.actor.root.position.y = bob;
        f.actor.members.forEach((m, i) => {
          if (i === 0) return;
          const ph = (m.userData.bobPhase as number) || i;
          m.position.y = 0.02 + Math.sin(t * 2.4 + ph) * 0.018;
        });
      }
    });

    tickBattleVfx(this.scene, now, dt);
    this.syncHudPositions();
    this.renderer.render(this.scene, this.camera);
  };
}
