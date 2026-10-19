import * as THREE from "three";
import {
  createBattleActor,
  playActor,
  prefetchBattleActors,
  type BattleActor,
} from "./battleActors";
import {
  prefetchBattleVfx,
  clearBattleVfx,
  spawnAllyBless,
  spawnCavalryCharge,
  spawnHitBurst,
  spawnPatternEmission,
  spawnPremiumImpact,
  spawnRushAssault,
  spawnShieldBarrier,
  spawnSkillAura,
  spawnSkillBeam,
  spawnSkillWindup,
  spawnSlashArc,
  spawnStatusOrb,
  tickBattleVfx,
} from "./battleVfx";


type SkillFlashOpts = {
  /** skill_wave — chỉ impact mục tiêu, không aura / cast lại */
  wave?: boolean;
  /** single | column | row | front_row | all | ally_all | self */
  pattern?: string | null;
  /** white…gold — scale aura/impact */
  quality?: string | null;
  motif?: string | null;
  hits?: number | null;
};

function qualityToScale(q?: string | null, fallback?: string | null): string {
  const id = (q || "").toLowerCase();
  if (id === "orange" || id === "red" || id === "gold") return "L";
  if (id === "blue" || id === "purple") return "M";
  if (id === "white" || id === "green") return "S";
  return fallback || "M";
}

type SkillProfileLite = {
  delivery?: string;
  movement?: string;
  emission?: string;
  visual?: string;
  scale?: string;
  durations?: {
    windupMs?: number;
    castMs?: number;
    emissionMs?: number;
    impactMs?: number;
    recoveryMs?: number;
  };
};

type SkillDesignApi = {
  resolve?: (f: string) => SkillProfileLite;
  playTimeline?: (
    flash: string,
    onPhase: (phase: string, profile: SkillProfileLite) => void,
    onDone?: (profile: SkillProfileLite) => void
  ) => { cancel: () => void };
};

function skillDesign(): SkillDesignApi | undefined {
  return (globalThis as unknown as { NLSkillDesign?: SkillDesignApi }).NLSkillDesign;
}

function resolveSkillProfile(flash: string): SkillProfileLite {
  return skillDesign()?.resolve?.(flash) || {};
}

export type BattleUnitSpec = {
  uid: string;
  name: string;
  slot: number;
  side: "ally" | "enemy";
  troop?: string;
  troopTier?: number;
  wikiId?: string | null;
  wikiTroopId?: string | null;
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

export type BattleSpawnOpts = {
  allyFormation?: string;
  enemyFormation?: string;
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
 * Lưới 3×3 theo trận pháp wiki — quân ta PHẢI / địch TRÁI (icon nhìn trái).
 */
const COL_Z = [-2.45, 0, 2.45] as const;
const ROW_DEPTH = [2.55, 3.95, 5.35] as const;

type Cell = { col: 0 | 1 | 2; row: 0 | 1 | 2 };

const FORM_LAYOUT: Record<string, Cell[]> = {
  crane_wing: [
    { col: 0, row: 0 },
    { col: 2, row: 0 },
    { col: 0, row: 2 },
    { col: 1, row: 2 },
    { col: 2, row: 2 },
  ],
  long_snake: [
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 2, row: 2 },
  ],
  square: [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 0, row: 1 },
    { col: 2, row: 1 },
  ],
  fish_scale: [
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 1, row: 2 },
  ],
  arrow: [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 1, row: 1 },
    { col: 1, row: 2 },
  ],
  qi_xing: [
    { col: 0, row: 0 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 0, row: 2 },
    { col: 2, row: 2 },
  ],
  chaotic_sword: [
    { col: 0, row: 0 },
    { col: 2, row: 0 },
    { col: 1, row: 1 },
    { col: 0, row: 2 },
    { col: 2, row: 2 },
  ],
  wild_goose: [
    { col: 0, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 2, row: 2 },
  ],
  hammer_march: [
    { col: 1, row: 0 },
    { col: 1, row: 1 },
    { col: 0, row: 2 },
    { col: 1, row: 2 },
    { col: 2, row: 2 },
  ],
  tiger_strategy: [
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 2, row: 1 },
    { col: 0, row: 2 },
    { col: 2, row: 2 },
  ],
};

function readFormLayout(formationId?: string | null): Cell[] {
  const fid = formationId || "crane_wing";
  try {
    type FormDb = {
      formations?: {
        list?: Record<string, { layout?: Array<{ col: number; row: number }> }>;
      };
    };
    const w =
      typeof window !== "undefined" ? (window as unknown as { NL_DB?: FormDb }) : null;
    const form = w?.NL_DB?.formations?.list?.[fid];
    if (form?.layout && form.layout.length >= 5) {
      return form.layout.slice(0, 5).map((c) => ({
        col: Math.max(0, Math.min(2, c.col | 0)) as 0 | 1 | 2,
        row: Math.max(0, Math.min(2, c.row | 0)) as 0 | 1 | 2,
      }));
    }
  } catch {
    /* ignore */
  }
  return FORM_LAYOUT[fid] || FORM_LAYOUT.crane_wing;
}

function slotXZ(
  slot: number,
  enemy: boolean,
  formationId?: string | null
): { x: number; z: number } {
  const s = Math.max(0, Math.min(4, slot | 0));
  const layout = readFormLayout(formationId);
  const cell = layout[s] || layout[0];
  const depth = ROW_DEPTH[cell.row];
  const z = COL_Z[cell.col];
  // Quân ta +X (phải), địch −X (trái)
  const x = enemy ? -depth : depth;
  return { x, z };
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
  /** QA: đóng băng lunge/cam — VFX vẫn tick để chụp motif */
  pausedForShot = false;
  private refDist = 14.4;
  private readonly tmp = new THREE.Vector3();
  private readonly camHome = new THREE.Vector3();
  private readonly camLook = new THREE.Vector3(0, 0.35, -0.2);
  private camPunchUntil = 0;
  private camPunchAmp = 0;
  private hitStopUntil = 0;
  private skillPlayCancel: (() => void) | null = null;
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

    const dpr = this.preview
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = "battle-gl";
    mount.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const bg = 0x8a7358;
    scene.background = new THREE.Color(bg);
    scene.fog = this.preview
      ? new THREE.FogExp2(0x8a7358, 0.012)
      : new THREE.FogExp2(0x8a7358, 0.0035);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.2, 90);
    if (this.preview) {
      camera.position.set(-1.4, 5.8, 9.2);
      camera.lookAt(-2.4, 0.45, 0);
    } else {
      camera.position.set(0, 7.4, 12.4);
      camera.lookAt(0, 0.35, -0.2);
    }
    this.camera = camera;
    this.camHome.copy(camera.position);
    if (this.preview) this.camLook.set(-2.4, 0.45, 0);
    else this.camLook.set(0, 0.35, -0.2);
    this.refDist = camera.position.distanceTo(new THREE.Vector3(0, 0.4, 0));

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
    // Sàn + backdrop texture (arena-floor / arena-back) — không plane nâu trong suốt
    scene.add(new THREE.HemisphereLight(0xe8dcc8, 0x1a1410, 0.9));
    const sun = new THREE.DirectionalLight(0xffe2c8, 0.85);
    sun.position.set(-1.5, 11, 6);
    sun.castShadow = false;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x5a4a3c, 0.4));

    const loader = new THREE.TextureLoader();
    const aniso = Math.min(8, this.renderer?.capabilities.getMaxAnisotropy() || 1);

    const groundMat = new THREE.MeshBasicMaterial({ color: 0xcbb89a, depthWrite: true });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 26), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.04, -1.2);
    scene.add(ground);

    // Sàn y=0 — pad/VFX đặt y>0 nên không bị che
    const floorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 9.8), floorMat);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.position.y = 0;
    scene.add(courtyard);

    loader.load("assets/battle/arena-floor-3k.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      floorMat.map = tex;
      floorMat.needsUpdate = true;
      const tiled = tex.clone();
      tiled.colorSpace = THREE.SRGBColorSpace;
      tiled.wrapS = THREE.RepeatWrapping;
      tiled.wrapT = THREE.RepeatWrapping;
      tiled.repeat.set(2.8, 2.2);
      tiled.anisotropy = aniso;
      tiled.needsUpdate = true;
      groundMat.map = tiled;
      groundMat.color.set(0xe2d2b6);
      groundMat.needsUpdate = true;
    });

    const backMat = new THREE.MeshBasicMaterial({ color: 0xfff6ea });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(32, 11.5), backMat);
    back.position.set(0, 3.85, -6.55);
    scene.add(back);
    loader.load("assets/battle/arena-back-3k.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.offset.set(0, 0.04);
      tex.repeat.set(1, 0.96);
      tex.needsUpdate = true;
      backMat.map = tex;
      backMat.needsUpdate = true;
    });
  }

  spawn(
    allies: BattleUnitSpec[],
    foes: BattleUnitSpec[],
    _playerFaction = "shu",
    opts?: BattleSpawnOpts
  ): void {
    if (!this.scene) return;
    this.clearFighters();
    const scene = this.scene;
    const allyForm = (opts && opts.allyFormation) || "crane_wing";
    const enemyForm = (opts && opts.enemyFormation) || "square";
    const add = async (u: BattleUnitSpec, enemy: boolean) => {
      const slot = clampSlot(u.slot);
      const seed = (u.uid || u.name || "").length * 17 + slot * 31 + (enemy ? 99 : 3);
      const { x, z } = slotXZ(slot, enemy, enemy ? enemyForm : allyForm);
      const rimHex = enemy ? 0xef4444 : 0x2dd4bf;
      try {
        const tier = u.troopTier != null ? u.troopTier : 1;
        const wikiId = u.wikiId || u.wikiTroopId || null;
        const actor = await createBattleActor(
          u.troop || "infantry",
          enemy,
          seed,
          u.name,
          tier,
          wikiId
        );
        actor.root.position.set(x, 0, z);
        scene.add(actor.root);
        // Máu/sĩ khí ở panel 2 góc — không chip trên đầu (che FX)
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
        const ff = this.fighters.get(u.uid)!;
        this.applyScreenEqualScale(ff);
        this.paintHud(ff);
      } catch (err) {
        console.warn("[battle] load unit fail", u.name, err);
      }
    };
    void Promise.all([
      ...(allies || []).map((u) => add(u, false)),
      ...(foes || []).map((u) => add(u, true)),
    ]);
  }

  private createHud(
    _name: string,
    _enemy: boolean,
    _troop: string,
    _tier = 1
  ): HTMLElement | null {
    return null;
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
        : new THREE.Vector3(from.side === "ally" ? -1 : 1, 0, 0);
    dir.y = 0;
    if (dir.lengthSq() > 0.01) dir.normalize();
    const ranged = from.troop === "archer" || from.troop === "strategist";
    const cavalry = from.troop === "cavalry";
    // Ká»µ: xĂ´ng gáº§n Ä‘á»‹ch (ngá»±a tĂ´ng); bá»™/thÆ°Æ¡ng: lunge ngáº¯n; cung/mÆ°u: chá»‰ nghiĂªng ngÆ°á»i
    let reach = 0.85;
    if (missed) reach = 0.25;
    else if (ranged) reach = 0.35;
    else if (cavalry && to && !to.dead) {
      const dist = from.home.distanceTo(to.home);
      reach = Math.min(Math.max(dist * 0.72, 1.35), 2.6);
    }
    const peak = from.home.clone().addScaledVector(dir, reach);
    from.lunge = {
      from: from.home.clone(),
      peak,
      t0: performance.now(),
      durOut: ranged ? 110 : cavalry ? 190 : 130,
      durBack: ranged ? 200 : cavalry ? 300 : 240,
    };
    if (to && !to.dead && !missed) {
      const atkTroop = from.troop;
      const now = performance.now();
      if (atkTroop === "archer" || atkTroop === "strategist") {
        spawnSkillBeam(
          this.scene,
          from.actor.root.position.clone(),
          to.home,
          atkTroop === "strategist" ? "bagua" : "thunder",
          now
        );
      } else if (atkTroop === "cavalry") {
        // ÄĂ¡nh thÆ°á»ng ká»µ â€” tĂ´ng nháº¹ (S). Skill charge dĂ¹ng scale M/L + windup riĂªng.
        spawnCavalryCharge(this.scene, from.home.clone(), to.home.clone(), now, "S");
      } else if (atkTroop === "spear") {
        // ThÆ°Æ¡ng Ä‘Ă¢m â€” slash háº¹p + beam nháº¹ (pierce)
        spawnSlashArc(this.scene, this.casterFxAt(from), to.home, now, "steel");
        spawnSkillBeam(this.scene, this.casterFxAt(from), to.home, "steel", now);
      } else {
        // Bá»™ binh â€” chĂ©m
        spawnSlashArc(this.scene, this.casterFxAt(from), to.home, now, "white");
      }
      const hitDelay = cavalry ? 170 : 130;
      setTimeout(() => {
        if (!to.dead && this.scene) {
          to.hitFlashUntil = performance.now() + (cavalry ? 380 : 300);
          playActor(to.actor, "hit", 0.05);
          spawnHitBurst(this.scene, this.casterFxAt(to));
          // Ká»µ tĂ´ng trĂºng â†’ Ä‘á»‹ch bá»‹ Ä‘áº©y lĂ¹i nháº¹
          if (cavalry) {
            to.lunge = {
              from: to.home.clone(),
              peak: to.home.clone().addScaledVector(dir, 0.32),
              t0: performance.now(),
              durOut: 90,
              durBack: 220,
            };
          }
        }
      }, hitDelay);
    }
  }

  /** Äiá»ƒm neo FX = thá»§ lÄ©nh (khĂ´ng pháº£i gá»‘c cá»¥m â€” trĂ¡nh lá»‡ch trĂ¡i/pháº£i tÆ°á»›ng) */
  private casterFxAt(f: Fighter): THREE.Vector3 {
    const at = new THREE.Vector3();
    if (f.actor.sprite) {
      f.actor.sprite.getWorldPosition(at);
      // Sprite center chĂ¢n (0.5,0) â†’ nĂ¢ng nháº¹ lĂªn ngá»±c
      at.y += 0.42;
    } else {
      at.copy(f.actor.root.position);
      at.y = 0.55;
    }
    return at;
  }

  skillFlash(uid: string, flash = "gold", targetUids: string[] = [], opts?: SkillFlashOpts): void {
    const f = this.fighters.get(uid);
    if (!f || f.dead || !this.scene) return;
    const wave = !!(opts && opts.wave);
    const pattern = (opts && opts.pattern) || "single";
    const kind =
      flash ||
      (f.troop === "strategist" ? "bagua" : f.troop === "archer" ? "thunder" : f.troop === "cavalry" ? "brown" : "steel");
    const profile = resolveSkillProfile(kind);
    const scale = qualityToScale(opts?.quality, profile.scale || "M");
    const movement = profile.movement || "plant";
    const emission = profile.emission || "burst";
    const visual = profile.visual || "default";
    const delivery = profile.delivery || "arcane";
    const support =
      delivery === "buff" ||
      visual === "heal" ||
      kind === "shield" ||
      pattern === "ally_all" ||
      pattern === "self";
    const melee =
      delivery === "cut" || delivery === "crush" || delivery === "pierce" || visual === "slash" || visual === "pierce";
    const isCharge = kind === "charge" || (f.troop === "cavalry" && melee && !support && kind !== "rush");
    const isRush = kind === "rush";
    const isShield = kind === "shield";
    const usePatternChoreo =
      !isCharge &&
      !isRush &&
      !isShield &&
      (pattern === "column" ||
        pattern === "row" ||
        pattern === "front_row" ||
        pattern === "all" ||
        pattern === "ally_all" ||
        pattern === "self");
    const rangedEmit =
      emission === "projectile" ||
      emission === "rain" ||
      visual === "arrow" ||
      visual === "meteor" ||
      visual === "thunder" ||
      visual === "fireball" ||
      visual === "bagua";
    const targets = targetUids.length ? targetUids : [];
    const firstTarget = targets.map((tid) => this.fighters.get(tid)).find((t) => t && !t.dead);
    const attach = { root: f.actor.root, leader: f.actor.sprite };
    const punchAmp = scale === "L" ? 0.28 : scale === "S" ? 0.1 : 0.16;

    const targetPoints = (): THREE.Vector3[] =>
      targets
        .map((tid) => this.fighters.get(tid))
        .filter((t): t is NonNullable<typeof t> => !!t && !t.dead)
        .map((t) => this.casterFxAt(t));

    const deliverToTargets = (mode: "emission" | "impact") => {
      if (!this.scene) return;
      if (mode === "emission" && usePatternChoreo) {
        spawnPatternEmission(this.scene, this.casterFxAt(f), targetPoints(), kind, pattern, scale);
        // Vẫn hit-react từng mục tiêu ở impact phase
        return;
      }
      if (mode === "emission" && support && !isShield) {
        spawnAllyBless(this.scene, targetPoints().length ? targetPoints() : [this.casterFxAt(f)], kind, scale);
        return;
      }
      targets.forEach((tid, i) => {
        const to = this.fighters.get(tid);
        if (!to || to.dead || !this.scene) return;
        const stagger = i * (scale === "L" ? 70 : 55);
        setTimeout(() => {
          if (!this.scene || to.dead) return;
          const dest = this.casterFxAt(to);
          const fromPos = this.casterFxAt(f);
          const tnow = performance.now();
          if (mode === "emission") {
            if (isCharge) {
              spawnCavalryCharge(this.scene, f.home.clone(), to.home.clone(), tnow, scale);
            } else if (isRush) {
              spawnRushAssault(this.scene, f.home.clone(), to.home.clone(), tnow, scale);
            } else if (isShield) {
              spawnShieldBarrier(this.scene, this.casterFxAt(f), tnow, scale);
            } else if (rangedEmit || (!melee && !support) || support) {
              spawnSkillBeam(this.scene, fromPos, dest, kind, tnow);
            } else if (visual === "pierce" || movement === "thrust") {
              spawnSlashArc(this.scene, fromPos, to.home, tnow, "steel");
              spawnSkillBeam(this.scene, fromPos, dest, "steel", tnow);
            } else {
              spawnSlashArc(this.scene, fromPos, to.home, tnow, kind);
            }
            return;
          }
          // impact
          if (isCharge || isRush) {
            spawnPremiumImpact(this.scene, dest, kind, scale);
            const push = f.side === "ally" ? (isCharge ? -0.4 : -0.3) : isCharge ? 0.4 : 0.3;
            to.lunge = {
              from: to.home.clone(),
              peak: to.home.clone().add(new THREE.Vector3(push, 0, 0)),
              t0: tnow,
              durOut: isCharge ? 100 : 80,
              durBack: isCharge ? 240 : 200,
            };
          } else if (isShield) {
            spawnHitBurst(this.scene, dest);
            spawnShieldBarrier(this.scene, this.casterFxAt(f), tnow, scale);
          } else {
            spawnPremiumImpact(this.scene, dest, kind, scale);
          }
          if (!support || isShield) {
            playActor(to.actor, "hit", 0.05);
            to.hitFlashUntil = tnow + (isShield ? 360 : 560);
          } else {
            to.hitFlashUntil = tnow + 320;
          }
        }, stagger);
      });
      if (mode === "impact") {
        // Pattern choreo: vẫn cần hit-react + premium impact từng mục tiêu
        if (usePatternChoreo) {
          targets.forEach((tid, i) => {
            const to = this.fighters.get(tid);
            if (!to || to.dead || !this.scene) return;
            setTimeout(() => {
              if (!this.scene || to.dead) return;
              const dest = this.casterFxAt(to);
              spawnPremiumImpact(this.scene, dest, kind, scale);
              if (!support) {
                playActor(to.actor, "hit", 0.05);
                to.hitFlashUntil = performance.now() + 560;
              }
            }, i * 45);
          });
        }
        this.triggerCamPunch(punchAmp, scale === "L" ? 260 : 170);
        this.hitStopUntil = performance.now() + (scale === "L" ? 85 : 50);
      }
    };

    const beginLunge = () => {
      const now = performance.now();
      let peak = f.home.clone();
      if ((isCharge || isRush) && firstTarget) {
        const dir = firstTarget.home.clone().sub(f.home);
        dir.y = 0;
        const dist = dir.length();
        if (dist > 0.01) dir.normalize();
        const reach = Math.min(Math.max(dist * (isRush ? 0.82 : 0.75), isRush ? 1.7 : 1.5), 2.9);
        peak = f.home.clone().addScaledVector(dir, reach);
      } else if (!isShield) {
        let reach = 0.14;
        if (movement === "lunge") reach = f.troop === "cavalry" ? 1.4 : 0.6;
        else if (movement === "thrust") reach = 0.9;
        if (scale === "L" && movement !== "plant") reach *= 1.25;
        const toward = f.side === "ally" ? -1 : 1;
        peak = f.home.clone().add(new THREE.Vector3(toward * reach, 0, 0));
      }
      f.lunge = {
        from: f.home.clone(),
        peak,
        t0: now,
        durOut: isCharge || isRush ? 240 : movement === "plant" || isShield ? 150 : 170,
        durBack: isCharge || isRush ? 360 : 300,
      };
    };

    // Wave 2+: chỉ emission + impact gọn
    if (wave) {
      deliverToTargets("emission");
      setTimeout(() => deliverToTargets("impact"), 120);
      return;
    }

    if (this.skillPlayCancel) this.skillPlayCancel();
    playActor(f.actor, "skill", 0.1);
    const at0 = this.casterFxAt(f);
    const design = skillDesign();

    if (design?.playTimeline) {
      const play = design.playTimeline(
        kind,
        (phase) => {
          if (!this.scene || f.dead) return;
          const at = this.casterFxAt(f);
          if (phase === "windup") {
            spawnSkillWindup(this.scene, at, kind, scale);
            // NhĂºn nháº¹ ra sau trÆ°á»›c khi xĂ´ng
            if (!isShield) {
              const back = f.side === "ally" ? 0.18 : -0.18;
              f.lunge = {
                from: f.home.clone(),
                peak: f.home.clone().add(new THREE.Vector3(back, 0, 0)),
                t0: performance.now(),
                durOut: 90,
                durBack: 1,
              };
            }
          } else if (phase === "cast") {
            // 1 aura gắn tướng — không spawn lại ở emission (tránh lửa tím chồng / bay cao)
            spawnSkillAura(this.scene, at, kind, performance.now(), attach, { scale, phase: "cast" });
            if (isShield) spawnShieldBarrier(this.scene, at, performance.now(), scale);
            beginLunge();
          } else if (phase === "emission") {
            deliverToTargets("emission");
            if (isShield && !targets.length) spawnShieldBarrier(this.scene, at, performance.now(), scale);
          } else if (phase === "impact") {
            deliverToTargets("impact");
          }
        },
        () => {
          this.skillPlayCancel = null;
        }
      );
      this.skillPlayCancel = () => play.cancel();
    } else {
      // Fallback náº¿u chÆ°a load skill-design
      spawnSkillWindup(this.scene, at0, kind, scale);
      spawnSkillAura(this.scene, at0, kind, performance.now(), attach, { scale, phase: "full" });
      if (isShield) spawnShieldBarrier(this.scene, at0, performance.now(), scale);
      beginLunge();
      setTimeout(() => deliverToTargets("emission"), 140);
      setTimeout(() => deliverToTargets("impact"), 280);
    }
  }

  private triggerCamPunch(amp: number, ms: number): void {
    if (this.preview) return;
    this.camPunchAmp = amp;
    this.camPunchUntil = performance.now() + ms;
  }

  private updateCamJuice(now: number): void {
    if (!this.camera || this.preview) return;
    if (now < this.camPunchUntil && this.camPunchAmp > 0) {
      const damp = Math.min(1, (this.camPunchUntil - now) / 180);
      const ox = (Math.random() - 0.5) * this.camPunchAmp * damp;
      const oy = (Math.random() - 0.5) * this.camPunchAmp * 0.4 * damp;
      this.camera.position.set(this.camHome.x + ox, this.camHome.y + oy, this.camHome.z);
      this.camera.lookAt(this.camLook);
    } else if (this.camPunchAmp > 0) {
      this.camera.position.copy(this.camHome);
      this.camera.lookAt(this.camLook);
      this.camPunchAmp = 0;
    }
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

  private applyScreenEqualScale(f: Fighter, squashX = 1, squashY = 1): void {
    if (!this.camera) return;
    const p = f.actor.root.position;
    this.tmp.set(p.x, 0.4, p.z);
    const dist = this.camera.position.distanceTo(this.tmp);
    const k = dist / Math.max(this.refDist, 0.001);
    const bx = f.actor.baseScale.x;
    const by = f.actor.baseScale.y;
    f.actor.sprite.scale.set(bx * k * squashX, by * k * squashY, 1);
  }

  private updateLunge(f: Fighter, now: number): void {
    if (!f.lunge) return;
    const L = f.lunge;
    const elapsed = now - L.t0;
    const total = L.durOut + L.durBack;
    if (elapsed >= total) {
      f.actor.root.position.copy(f.home);
      this.applyScreenEqualScale(f);
      f.lunge = null;
      return;
    }
    let pos: THREE.Vector3;
    let squash = 1;
    if (elapsed <= L.durOut) {
      const u = this.easeInOut(elapsed / L.durOut);
      pos = L.from.clone().lerp(L.peak, u);
      // Windup â†’ strike: kĂ©o dĂ i theo hÆ°á»›ng Ä‘Ă¡nh
      squash = 1 + u * 0.12;
    } else {
      const u = this.easeInOut((elapsed - L.durOut) / L.durBack);
      pos = L.peak.clone().lerp(L.from, u);
      squash = 1.12 - u * 0.12;
    }
    f.actor.root.position.copy(pos);
    this.applyScreenEqualScale(f, squash, 2 - squash);
  }

  private applyHitFlash(f: Fighter, now: number): void {
    const mat = f.actor.sprite.material as THREE.SpriteMaterial;
    if (f.dead) return;
    if (now < f.hitFlashUntil) {
      const pulse = 0.55 + 0.45 * Math.sin(now * 0.04);
      mat.color.setRGB(1, pulse * 0.55, pulse * 0.45);
      return;
    }
    // Chá»‰ ghi mĂ u khi vá»«a háº¿t flash â€” trĂ¡nh setHex má»—i frame
    const idle = f.side === "enemy" ? 0xffe4e0 : 0xffffff;
    if (mat.color.getHex() !== idle) mat.color.setHex(idle);
  }

  private resize(): void {
    if (!this.host || !this.renderer || !this.camera) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Hủy timeline chiêu đang chạy */
  cancelSkillPlay(): void {
    if (this.skillPlayCancel) {
      this.skillPlayCancel();
      this.skillPlayCancel = null;
    }
  }

  /** Xóa FX đang chạy — dùng trước khi bắn motif QA */
  clearFx(): void {
    this.cancelSkillPlay();
    clearBattleVfx(this.scene);
  }

  private tick = (): void => {
    if (!this.running || !this.renderer || !this.scene || !this.camera) return;
    this.raf = requestAnimationFrame(this.tick);
    const now = performance.now();
    let dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (now < this.hitStopUntil) dt *= 0.15;
    const freezeUnits = this.pausedForShot;

    this.fighters.forEach((f) => {
      if (!freezeUnits) f.actor.mixer.update(dt);
      if (f.dead) {
        this.applyHitFlash(f, now);
        return;
      }
      const wasLunge = !!f.lunge;
      if (!freezeUnits) this.updateLunge(f, now);
      this.applyHitFlash(f, now);
      if (!f.lunge) {
        f.actor.root.position.y = 0;
        if (wasLunge) this.applyScreenEqualScale(f);
      }
    });

    if (!freezeUnits) this.updateCamJuice(now);
    tickBattleVfx(this.scene, now, dt);
    this.syncHudPositions();
    this.renderer.render(this.scene, this.camera);
  };
}
