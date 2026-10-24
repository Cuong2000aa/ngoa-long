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
  clearBattleVfx,
  spawnCavalryCharge,
  spawnHitBurst,
  spawnShieldBarrier,
  spawnSkillAura,
  spawnSkillBeam,
  spawnSkillWindup,
  spawnSlashArc,
  spawnStatusOrb,
  syncStatusMarkers,
  tickBattleVfx,
} from "./battleVfx";
import {
  clearBattleVfx3d,
  honPackForStyle,
  hostileTimeline,
  playPatternFx3d,
  playSkillFx3d,
  resolveFx3dStyle,
  tickBattleVfx3d,
} from "./battleVfx3d";


type SkillFlashOpts = {
  /** skill_wave — chỉ impact mục tiêu, không aura / cast lại */
  wave?: boolean;
  /** single | column | row | front_row | all | ally_all | self */
  pattern?: string | null;
  /** white…gold — scale aura/impact */
  quality?: string | null;
  motif?: string | null;
  hits?: number | null;
  /** Chiêu hỗ trợ / sĩ khí — bless đồng minh, không nova thép địch */
  support?: boolean | null;
  /** skill id từ combat-engine — chọn choreography polished */
  skillId?: string | null;
  /** skills.json fx.style (vd beast_dragon) */
  fxStyle?: string | null;
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

type StatusChip = {
  id: string;
  label: string;
  kind: "buff" | "debuff" | "control";
  short?: string;
  icon?: string | null;
};

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
 * Lưới 3×3 theo trận pháp wiki — quân ta +X (phải) / địch −X (trái).
 *
 * Sân đá 15.2×9.8 → X∈[−7.6,7.6] Z∈[−4.9,4.9].
 * Camera (0,7.4,12.4) nhìn về −Z (+Z = đáy màn hình).
 * - COL_Z / ROW_DEPTH nới để VFX AoE (bát quái…) không chồng sát tướng.
 * - Camera (0,7.4,12.4) nhìn về −Z (+Z = đáy màn hình).
 */
const COL_Z = [-2.45, 0.15, 2.75] as const;
const ROW_DEPTH = [2.55, 4.15, 5.75] as const;

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

/** Tâm Z nhìn trên sân (lệch nhẹ +Z vì phối cảnh camera) */
const FORM_Z_CENTER = 0.3;

function slotXZ(
  slot: number,
  enemy: boolean,
  formationId?: string | null,
  /** Căn giữa khối Z theo các slot đang có người — đội 3 cũng cân sân */
  occupiedSlots?: number[] | null
): { x: number; z: number } {
  const s = Math.max(0, Math.min(4, slot | 0));
  const layout = readFormLayout(formationId);
  const cell = layout[s] || layout[0];
  const depth = ROW_DEPTH[cell.row];
  let z = COL_Z[cell.col];
  if (occupiedSlots && occupiedSlots.length > 0) {
    const zs = occupiedSlots.map((os) => {
      const c = layout[Math.max(0, Math.min(4, os | 0))] || layout[0];
      return COL_Z[c.col];
    });
    const mid = (Math.min(...zs) + Math.max(...zs)) / 2;
    z += FORM_Z_CENTER - mid;
  }
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
  /** setTimeout từ skillFlash/wave — phải hủy trong clearFx kẻo FX sót sang chiêu sau */
  private skillFxTimers: ReturnType<typeof setTimeout>[] = [];
  private onResizeBound = () => this.resize();
  private sunLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private skillDimUntil = 0;

  private scheduleSkillFx(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      const i = this.skillFxTimers.indexOf(id);
      if (i >= 0) this.skillFxTimers.splice(i, 1);
      fn();
    }, ms);
    this.skillFxTimers.push(id);
  }

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

    const coarse =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    const dpr = this.preview
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 2);
    const renderer = new THREE.WebGLRenderer({
      antialias: !coarse,
      alpha: true,
      powerPreference: coarse ? "low-power" : "high-performance",
      // Mobile tắt — preserveDrawingBuffer gần như x2 VRAM, dễ OOM khi xoay
      preserveDrawingBuffer: !coarse,
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
    const bg = 0x1a1614;
    scene.background = new THREE.Color(bg);
    scene.fog = this.preview
      ? new THREE.FogExp2(0x221b16, 0.004)
      : new THREE.FogExp2(0x221b16, 0.0025);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.2, 90);
    if (this.preview) {
      camera.position.set(-1.4, 6.0, 11.2);
      camera.lookAt(-2.4, 0.65, 0);
    } else {
      camera.position.set(0, 6.8, 13.6);
      camera.lookAt(0, 0.65, -0.2);
    }
    this.camera = camera;
    this.camHome.copy(camera.position);
    if (this.preview) this.camLook.set(-2.4, 0.65, 0);
    else this.camLook.set(0, 0.65, -0.2);
    this.refDist = camera.position.distanceTo(new THREE.Vector3(0, 0.4, 0));

    this.buildArena(scene);
    prefetchBattleVfx();
    prefetchBattleActors();
    this.resize();
    window.addEventListener("resize", this.onResizeBound);
    renderer.domElement.addEventListener(
      "webglcontextlost",
      (ev) => {
        ev.preventDefault();
        console.warn("[Battle] WebGL context lost");
        this.running = false;
      },
      false
    );
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      () => {
        console.warn("[Battle] WebGL context restored");
        this.resize();
        if (!this.running) {
          this.running = true;
          this.last = performance.now();
          this.tick();
        }
      },
      false
    );
    this.running = true;
    this.t0 = performance.now();
    this.last = this.t0;
    this.tick();
  }

  private buildArena(scene: THREE.Scene): void {
    // Sàn đá cổ kính Tam Quốc + backdrop trường thành
    const hemi = new THREE.HemisphereLight(0xe8dcc8, 0x221c16, 0.95);
    scene.add(hemi);
    this.hemiLight = hemi;

    const sun = new THREE.DirectionalLight(0xffecd4, 0.9);
    sun.position.set(-1.5, 11, 6);
    sun.castShadow = false;
    scene.add(sun);
    this.sunLight = sun;

    const amb = new THREE.AmbientLight(0x605040, 0.45);
    scene.add(amb);
    this.ambientLight = amb;

    const loader = new THREE.TextureLoader();
    const aniso = Math.min(8, this.renderer?.capabilities.getMaxAnisotropy() || 1);

    // 1. Sàn gạch đá liền mạch mở rộng toàn cảnh (ground)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.84,
      metalness: 0.06,
      depthWrite: true,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(48, 30), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -1.2);
    ground.renderOrder = 0;
    scene.add(ground);

    loader.load("assets/battle/arena-ground-tile.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(14, 8);
      tex.anisotropy = aniso;
      tex.needsUpdate = true;
      groundMat.map = tex;
      groundMat.color.set(0xffffff);
      groundMat.needsUpdate = true;
    });

    // 2. Quảng trường đá trung tâm với viền đồng cổ & trận đồ (courtyard)
    // Dùng RGBA png với viền mềm (feathered alpha) chuyển mượt vào nền gạch đá xung quanh — không vết cắt giấy
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      depthWrite: false,
    });
    const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 9.8), floorMat);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.position.set(0, 0.002, 0);
    courtyard.renderOrder = 1;
    scene.add(courtyard);

    loader.load("assets/battle/arena-floor-3k.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      floorMat.map = tex;
      floorMat.needsUpdate = true;
    });

    // 3. Phông thành trì phía sau (backdrop)
    const backMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(34, 5.4), backMat);
    back.position.set(0, 2.7, -6.8);
    scene.add(back);
    loader.load("assets/battle/arena-back-3k.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.offset.set(0, 0);
      tex.repeat.set(1, 1);
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
    const allySlots = allies.map((u) => clampSlot(u.slot));
    const enemySlots = foes.map((u) => clampSlot(u.slot));
    const add = async (u: BattleUnitSpec, enemy: boolean) => {
      const slot = clampSlot(u.slot);
      const seed = (u.uid || u.name || "").length * 17 + slot * 31 + (enemy ? 99 : 3);
      const { x, z } = slotXZ(
        slot,
        enemy,
        enemy ? enemyForm : allyForm,
        enemy ? enemySlots : allySlots
      );
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

  /** Đổi loại binh chủng và cấp bậc của võ tướng linh hoạt trên sân */
  async setFighterTroop(uid: string, troop: string, tier = 1, wikiId?: string | null): Promise<boolean> {
    const f = this.fighters.get(uid);
    if (!f || !this.scene) return false;
    const enemy = f.side === "enemy";
    try {
      const actor = await createBattleActor(
        troop,
        enemy,
        f.seed,
        f.name,
        tier,
        wikiId
      );
      this.scene.remove(f.actor.root);
      actor.root.position.copy(f.home);
      this.scene.add(actor.root);
      f.actor = actor;
      f.troop = troop;
      this.applyScreenEqualScale(f);
      return true;
    } catch (err) {
      console.warn("[battle] setFighterTroop fail", uid, troop, err);
      return false;
    }
  }

  private createHud(
    name: string,
    enemy: boolean,
    troop: string,
    tier = 1
  ): HTMLElement | null {
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
        .map((s) => {
          const text = (s.short || s.label || s.id || "").slice(0, 4);
          const icon =
            s.icon && !/^https?:\/\//i.test(s.icon)
              ? '<img class="uo-st-ico" src="' + s.icon + '" alt="" />'
              : "";
          return (
            '<span class="uo-st uo-st-' +
            s.kind +
            '" title="' +
            (s.label || s.id) +
            '">' +
            icon +
            text +
            "</span>"
          );
        })
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

  /** Icon trạng thái wiki (giáp / độc / Anh dũng…) — chip HUD + marker trên đầu */
  setStatuses(uid: string, statuses: StatusChip[]): void {
    const f = this.fighters.get(uid);
    if (!f) return;
    const prevLen = (f.statuses || []).length;
    f.statuses = statuses || [];
    this.paintHud(f);
    syncStatusMarkers(f.actor.root, f.actor.sprite, f.statuses);
    if (this.scene && statuses && statuses.length > prevLen) {
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
    const spear = from.troop === "spear";
    let reach = 0.85;
    if (missed) reach = 0.25;
    else if (ranged) reach = 0.35;
    else if (spear) reach = 1.05;
    else if (cavalry && to && !to.dead) {
      const dist = from.home.distanceTo(to.home);
      reach = Math.min(Math.max(dist * 0.72, 1.35), 2.6);
    }
    const peak = from.home.clone().addScaledVector(dir, reach);
    from.lunge = {
      from: from.home.clone(),
      peak,
      t0: performance.now(),
      durOut: ranged ? 110 : spear ? 95 : cavalry ? 190 : 125,
      durBack: ranged ? 200 : spear ? 200 : cavalry ? 300 : 220,
    };
    if (to && !to.dead && !missed) {
      const atkTroop = from.troop;
      const swingDelay =
        atkTroop === "spear" ? 45 : atkTroop === "cavalry" ? 70 : atkTroop === "archer" ? 65 : atkTroop === "strategist" ? 60 : 55;
      const hitDelay = cavalry ? 175 : spear ? 100 : ranged ? 145 : 120;

      // Xuất hiện hiệu ứng vũ khí ngay khi tướng vung chém / đâm / buông cung
      setTimeout(() => {
        if (!this.scene || from.dead) return;
        const now = performance.now();
        if (atkTroop === "archer") {
          spawnSkillBeam(
            this.scene,
            this.casterFxAt(from),
            to.home,
            "steel",
            now
          );
        } else if (atkTroop === "strategist") {
          spawnSkillBeam(
            this.scene,
            this.casterFxAt(from),
            to.home,
            "bagua",
            now
          );
        } else if (atkTroop === "cavalry") {
          spawnCavalryCharge(this.scene, from.home.clone(), to.home.clone(), now, "S");
        } else if (atkTroop === "spear") {
          spawnSlashArc(this.scene, this.casterFxAt(from), to.home, now, "steel");
          spawnSkillBeam(this.scene, this.casterFxAt(from), to.home, "steel", now);
        } else {
          spawnSlashArc(this.scene, this.casterFxAt(from), to.home, now, "white");
        }
      }, swingDelay);

      setTimeout(() => {
        if (!to.dead && this.scene) {
          to.hitFlashUntil = performance.now() + (cavalry ? 380 : 300);
          playActor(to.actor, "hit", 0.05);
          spawnHitBurst(this.scene, this.casterFxAt(to));
          this.triggerCamPunch(0.035, 100);
          if (cavalry) {
            to.lunge = {
              from: to.home.clone(),
              peak: to.home.clone().addScaledVector(dir, 0.35),
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
    // Skill luôn to hơn đánh thường (AA dùng scale ẩn / white arc) — white/green rarity vẫn ≥ M
    let scale = qualityToScale(opts?.quality, profile.scale || "M");
    const movement = profile.movement || "plant";
    const emission = profile.emission || "burst";
    const visual = profile.visual || "default";
    const delivery = profile.delivery || "arcane";
    const motif = ((opts && opts.motif) || "").toLowerCase();
    const skillId = (opts && opts.skillId) || null;
    const support =
      !!(opts && opts.support) ||
      delivery === "buff" ||
      visual === "heal" ||
      kind === "shield" ||
      kind === "gold_soft" ||
      kind === "gold" ||
      kind === "pure" ||
      motif === "buff" ||
      motif === "heal" ||
      pattern === "ally_all" ||
      pattern === "self";
    if (!support && scale === "S") scale = "M";
    const melee =
      delivery === "cut" || delivery === "crush" || delivery === "pierce" || visual === "slash" || visual === "pierce";
    const isCharge = kind === "charge" || (f.troop === "cavalry" && melee && !support && kind !== "rush");
    const isRush = kind === "rush";
    const isShield = kind === "shield";
    /** Flash AA trắng → thép skill; tránh chiêu = đúng path đánh thường */
    const skillKind = kind === "white" ? "steel" : kind;
    /** Rebuild 3D — mọi chiêu map style, không còn chỉ 4 polished */
    const fx3dStyle = resolveFx3dStyle({
      flash: skillKind,
      motif,
      pattern,
      support,
      isShield,
      isCharge,
      isRush,
      skillId,
      fxStyle: opts?.fxStyle ?? null,
    });
    /** Qi-stream (rồng/hồn/bát quái…) — bỏ aura/windup 2D cũ kẻo đè FX mới */
    const honQi = honPackForStyle(fx3dStyle, skillKind, skillId);
    // Kích hoạt làm tối nền đấu trường khi xuất đại chiêu (scale L hoặc Hồn khí thế) để FX phát sáng rực rỡ
    if (scale === "L" || honQi) {
      this.skillDimUntil = performance.now() + 850;
    }
    const usePatternChoreo =
      !support &&
      !isCharge &&
      !isRush &&
      !isShield &&
      (pattern === "column" ||
        pattern === "row" ||
        pattern === "front_row" ||
        pattern === "all" ||
        pattern === "ally_all" ||
        pattern === "self");
    void emission;
    void melee;
    const targets = targetUids.length ? targetUids : [];
    const firstTarget = targets.map((tid) => this.fighters.get(tid)).find((t) => t && !t.dead);
    const attach = { root: f.actor.root, leader: f.actor.sprite };
    const punchAmp = scale === "L" ? 0.28 : scale === "S" ? 0.1 : 0.16;

    const targetPoints = (): THREE.Vector3[] =>
      targets
        .map((tid) => this.fighters.get(tid))
        .filter((t): t is NonNullable<typeof t> => !!t && !t.dead)
        .map((t) => this.casterFxAt(t));

    /** Đồng minh còn sống (cùng side caster) — bless hỗ trợ. */
    const allyBlessPoints = (): THREE.Vector3[] => {
      const pts: THREE.Vector3[] = [];
      this.fighters.forEach((unit) => {
        if (!unit || unit.dead) return;
        if (unit.side !== f.side) return;
        pts.push(this.casterFxAt(unit));
      });
      return pts.length ? pts : [this.casterFxAt(f)];
    };

    const deliverToTargets = (mode: "emission" | "impact") => {
      if (!this.scene) return;
      const phase = mode === "emission" ? "emission" : "impact";
      const fromPos = this.casterFxAt(f);

      // Hỗ trợ / khiên — 3D bless/barrier trên đồng minh
      if (mode === "emission" && (support || isShield)) {
        const blessFlash =
          skillKind === "steel" || skillKind === "iron" || skillKind === "brown" ? "gold_soft" : skillKind;
        const pts = isShield ? [fromPos] : allyBlessPoints();
        playPatternFx3d({
          scene: this.scene,
          from: fromPos,
          targets: pts,
          flash: isShield ? "shield" : blessFlash,
          motif,
          pattern: isShield ? "self" : "ally_all",
          scale,
          phase: "emission",
          support: true,
          skillId,
        });
        targets.forEach((tid, i) => {
          const to = this.fighters.get(tid);
          if (!to || to.dead || to.side === f.side || !this.scene) return;
          setTimeout(() => {
            if (!this.scene || to.dead) return;
            playSkillFx3d({
              scene: this.scene,
              from: fromPos,
              to: this.casterFxAt(to),
              flash: "gold_soft",
              scale: "S",
              style: "bless",
              phase: "impact",
              skillId,
              pattern,
            });
          }, 80 + i * 45);
        });
        return;
      }

      // Pattern AoE / hàng — 3D staggered
      if (mode === "emission" && usePatternChoreo) {
        playPatternFx3d({
          scene: this.scene,
          from: fromPos,
          targets: targetPoints(),
          flash: skillKind,
          motif,
          pattern,
          scale,
          phase: "emission",
          skillId,
        });
        return;
      }

      const destList = targets.length
        ? targets
        : isShield || support
          ? ["__self__"]
          : [];

      destList.forEach((tid, i) => {
        const to = tid === "__self__" ? f : this.fighters.get(tid);
        if (!to || to.dead || !this.scene) return;
        const stagger = i * (scale === "L" ? 70 : 55);
        this.scheduleSkillFx(() => {
          if (!this.scene || to.dead) return;
          const dest = this.casterFxAt(to);
          const tnow = performance.now();
          playSkillFx3d({
            scene: this.scene,
            from: fromPos,
            to: dest,
            flash: skillKind,
            scale,
            style: fx3dStyle,
            phase,
            skillId,
            pattern,
          });
          if (mode === "impact") {
            if (!support && !isShield) {
              const pushMag =
                isCharge || fx3dStyle === "charge"
                  ? 0.35
                  : isRush || fx3dStyle === "rush"
                    ? 0.28
                    : scale === "L"
                      ? 0.22
                      : 0.14;
              const push = f.side === "ally" ? -pushMag : pushMag;
              to.lunge = {
                from: to.home.clone(),
                peak: to.home.clone().add(new THREE.Vector3(push, 0, 0)),
                t0: tnow,
                durOut: 65,
                durBack: scale === "L" ? 220 : 170,
              };
              playActor(to.actor, "hit", 0.05);
              to.hitFlashUntil = tnow + 560;
            } else if (isShield) {
              to.hitFlashUntil = tnow + 360;
            } else {
              to.hitFlashUntil = tnow + 320;
            }
          }
        }, stagger);
      });

      if (mode === "impact") {
        if (usePatternChoreo) {
          targets.forEach((tid, i) => {
            const to = this.fighters.get(tid);
            if (!to || to.dead || !this.scene) return;
            this.scheduleSkillFx(() => {
              if (!this.scene || to.dead) return;
              playSkillFx3d({
                scene: this.scene,
                from: fromPos,
                to: this.casterFxAt(to),
                flash: skillKind,
                scale,
                style: fx3dStyle,
                phase: "impact",
                skillId,
                pattern,
              });
              if (!support) {
                const pushMag = scale === "L" ? 0.22 : 0.14;
                const push = f.side === "ally" ? -pushMag : pushMag;
                to.lunge = {
                  from: to.home.clone(),
                  peak: to.home.clone().add(new THREE.Vector3(push, 0, 0)),
                  t0: performance.now(),
                  durOut: 65,
                  durBack: scale === "L" ? 220 : 170,
                };
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
        from: f.actor.root.position.clone(),
        peak,
        t0: now,
        durOut: isCharge || isRush ? 240 : movement === "plant" || isShield ? 150 : 170,
        durBack: isCharge || isRush ? 360 : 300,
      };
    };

    // Wave 2+: emission rồi impact sau đủ charge+flight (không 120ms cắt flight)
    if (wave) {
      const waveTl = hostileTimeline({ style: fx3dStyle, scale, pattern });
      deliverToTargets("emission");
      this.scheduleSkillFx(() => deliverToTargets("impact"), waveTl.impactAtMs);
      return;
    }

    if (this.skillPlayCancel) this.skillPlayCancel();
    playActor(f.actor, "skill", 0.1);
    const at0 = this.casterFxAt(f);
    const design = skillDesign();

    if (design?.playTimeline) {
      const play = design.playTimeline(
        skillKind,
        (phase) => {
          if (!this.scene || f.dead) return;
          const at = this.casterFxAt(f);
          if (phase === "windup") {
            if (!honQi) spawnSkillWindup(this.scene, at, skillKind, scale);
            // Chuẩn bị tụ lực mượt — lùi nhẹ lấy thế, không giật snap
            if (!isShield) {
              const back = f.side === "ally" ? 0.14 : -0.14;
              f.lunge = {
                from: f.home.clone(),
                peak: f.home.clone().add(new THREE.Vector3(back, 0, 0)),
                t0: performance.now(),
                durOut: 110,
                durBack: 40,
              };
            }
          } else if (phase === "cast") {
            // Qi-stream tự có tụ lực — không spawn aura 2D cũ (vòng cam / hộp trắng)
            if (!honQi) {
              spawnSkillAura(this.scene, at, skillKind, performance.now(), attach, { scale, phase: "cast" });
            }
            if (isShield) spawnShieldBarrier(this.scene, at, performance.now(), scale);
            beginLunge();
          } else if (phase === "emission") {
            deliverToTargets("emission");
            if (isShield && !targets.length) spawnShieldBarrier(this.scene, at, performance.now(), scale);
            // Đồng bộ impact của hồn đúng mốc va chạm (hitAt), tránh trễ 400ms
            if (honQi) {
              const honTl = hostileTimeline({ style: fx3dStyle, scale, pattern });
              const hitAtMs = honTl.chargeMs + honTl.flightMs - 35;
              this.scheduleSkillFx(() => deliverToTargets("impact"), hitAtMs);
            }
          } else if (phase === "impact") {
            if (!honQi) {
              deliverToTargets("impact");
            }
          }
        },
        () => {
          this.skillPlayCancel = null;
        }
      );
      this.skillPlayCancel = () => play.cancel();
    } else {
      // Fallback nếu chưa load skill-design
      if (!honQi) {
        spawnSkillWindup(this.scene, at0, skillKind, scale);
        spawnSkillAura(this.scene, at0, skillKind, performance.now(), attach, { scale, phase: "full" });
      }
      if (isShield) spawnShieldBarrier(this.scene, at0, performance.now(), scale);
      beginLunge();
      const fbTl = hostileTimeline({ style: fx3dStyle, scale, pattern });
      this.scheduleSkillFx(() => deliverToTargets("emission"), 140);
      this.scheduleSkillFx(() => deliverToTargets("impact"), 140 + fbTl.impactAtMs);
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
      // Cú giật nén Z mô phỏng sóng xung kích va đập vào ống kính
      const oz = -0.16 * this.camPunchAmp * Math.sin(damp * Math.PI);
      this.camera.position.set(this.camHome.x + ox, this.camHome.y + oy, this.camHome.z + oz);
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
    if (elapsed <= L.durOut) {
      const u = this.easeInOut(elapsed / L.durOut);
      pos = L.from.clone().lerp(L.peak, u);
    } else {
      const u = this.easeInOut((elapsed - L.durOut) / L.durBack);
      pos = L.peak.clone().lerp(L.from, u);
    }
    f.actor.root.position.copy(pos);
    // Giữ nguyên tỉ lệ (squash = 1) — tuyệt đối không bẹp dọc (tránh cảm giác nhúng người)
    this.applyScreenEqualScale(f, 1, 1);
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
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    // Mobile xoay: bỏ frame size 0 — tránh WebGL crash
    if (w < 8 || h < 8) return;
    try {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    } catch (err) {
      console.warn("[Battle] resize", err);
    }
  }

  /** Hủy timeline chiêu đang chạy */
  cancelSkillPlay(): void {
    if (this.skillPlayCancel) {
      this.skillPlayCancel();
      this.skillPlayCancel = null;
    }
    for (const id of this.skillFxTimers) clearTimeout(id);
    this.skillFxTimers.length = 0;
  }

  /** Xóa FX đang chạy — dùng trước khi bắn motif QA */
  clearFx(): void {
    this.cancelSkillPlay();
    clearBattleVfx(this.scene);
    clearBattleVfx3d(this.scene);
    this.fighters.forEach((f) => {
      if (!f.statuses.length) return;
      f.statuses = [];
      this.paintHud(f);
      syncStatusMarkers(f.actor.root, f.actor.sprite, []);
    });
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
    // Dimming ánh sáng sàn khi xuất đại chiêu (tôn vinh ánh sáng phát quang của chiêu)
    if (this.sunLight && this.hemiLight && this.ambientLight) {
      if (now < this.skillDimUntil) {
        const remaining = (this.skillDimUntil - now) / 850;
        const dimFactor = 0.65 + 0.35 * (1 - Math.sin(remaining * Math.PI));
        this.sunLight.intensity = 0.85 * dimFactor;
        this.hemiLight.intensity = 0.9 * dimFactor;
        this.ambientLight.intensity = 0.4 * dimFactor;
      } else if (this.sunLight.intensity !== 0.85) {
        this.sunLight.intensity = 0.85;
        this.hemiLight.intensity = 0.9;
        this.ambientLight.intensity = 0.4;
      }
    }
    tickBattleVfx(this.scene, now, dt);
    tickBattleVfx3d(this.scene, now, dt);
    this.syncHudPositions();
    this.renderer.render(this.scene, this.camera);
  };
}
