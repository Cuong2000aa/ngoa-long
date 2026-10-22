import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import type { BuildingInfo, GameState } from "../types/legacy";
import { BuildingFactory, SITE_SCALE, SITES, type Site } from "./buildings";
import { Crowd } from "./crowd";
import { createMaterials, type Materials } from "./materials";
import { buildFromKit } from "./modelBuildings";
import { loadModelKit, type ModelKit } from "./modelKit";
import { loadFolk } from "./folk";
import { loadFolkInstance } from "./folkInstance";
import { loadRaven } from "./raven";
import { Scape } from "./scape";
import { buildTerrain } from "./terrain";
import { tierOf, type Tier } from "./tiers";
import { composeFort, fallbackFort, FORT, loadWallTemplates, wallScaleFor } from "./walls";

/** Đoạn tuần tra trên tường khi tường ở tỉ lệ 1: tránh tháp giữa mặt và cổng nam. */
const PATROL_SEGMENTS: [number, number, number, number][] = (() => {
  const h = FORT.side / 2;
  const c = h - 2.5;
  return [
    [-c, -h, -6, -h], [6, -h, c, -h],
    [h, -c, h, -6], [h, 6, h, c],
    [-h, -c, -h, -6], [-h, 6, -h, c],
    [-c, h, -10.5, h], [10.5, h, c, h],
  ];
})();

/**
 * Framing map-first: target lệch nam (+Z = cổng) + camera lùi để thành nằm
 * trong band an toàn giữa top bar và bottom nav (không sát tường/cổng bị đè).
 */
const CAMERA_TARGET = new THREE.Vector3(-3, 0, 10);
const CAMERA_HOME = CAMERA_TARGET.clone().add(new THREE.Vector3(48, 64, 70));
/** Offset camera khi focus một nhà (cùng hướng nhìn xiên, gần hơn home). */
const FOCUS_OFFSET = new THREE.Vector3(28, 38, 40);
/** Giới hạn kéo bản đồ quanh thành. */
const PAN_LIMIT = 30;
/** px — bias projection để tâm nhìn nằm trên dock dưới / dưới top bar. */
const HUD_TOP_SAFE = 52;
const HUD_BOTTOM_SAFE = 92;
/** Ngưỡng px: vượt = kéo map, không pick. Touch rộng hơn chuột. */
const CLICK_SLOP_MOUSE = 8;
const CLICK_SLOP_TOUCH = 16;
const HOVER_EMISSIVE = 0x332208;
const SELECT_EMISSIVE = 0x554410;
const LEVEL_UP_MS = 700;
const HINT_KEY = "nl-city-hint-v1";

/**
 * Thành Chính: một scene Three.js, HUD vẫn là HTML phía trên canvas.
 * API giữ như bản cũ để js/app.js gọi: new CityRenderer(null, labelsEl), refresh(state), onBuildingClick.
 */
export class CityRenderer {
  onBuildingClick: ((id: string) => void) | null = null;
  /** Hotspot nhanh Bày trận — Nhân vật/Phó bản/Lôi đài ở bottom nav */
  onDeployClick: (() => void) | null = null;

  private state: GameState | null = null;
  private readonly labelsEl: HTMLElement | null;
  private readonly stageEl: HTMLElement | null;
  private mapEl: HTMLElement | null = null;

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: MapControls | null = null;
  private pressAt: { x: number; y: number } | null = null;
  private M: Materials | null = null;
  private factory: BuildingFactory | null = null;
  private kit: ModelKit | null = null;
  private readonly crowd = new Crowd();
  private readonly scape = new Scape();
  private patrols: [THREE.Vector3, THREE.Vector3][] = [];

  private actors = new Map<string, THREE.Group>();
  private tiers = new Map<string, Tier>();
  private levels = new Map<string, number>();
  private flags: THREE.Object3D[] = [];
  private wallGroup: THREE.Group | null = null;
  private wallTier: Tier | -1 = -1;
  /** Khói billboard nhẹ (farm / hall) — không particle system. */
  private smokes: { mesh: THREE.Mesh; phase: number; baseY: number; site: string }[] = [];
  private smokeMat: THREE.MeshBasicMaterial | null = null;
  private hudActionsEl: HTMLElement | null = null;
  private bootOverlay: HTMLElement | null = null;
  private readonly coarsePointer =
    typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

  private hoverId: string | null = null;
  private selectedId: string | null = null;
  /** Tween camera: focusBuilding / focusHome. */
  private camTween: {
    t0: number;
    dur: number;
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null = null;

  private readonly timer = new THREE.Timer();
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly tmp = new THREE.Vector3();
  private readonly reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  /** Resolve khi tường + công trình + (scape/folk soft) xong — FE loading dùng. */
  private bootPromise: Promise<void> | null = null;
  /** Tạm dừng loop khi mở trận / overlay — tránh 2 WebGL cùng chạy. */
  private paused = false;

  constructor(_canvas: HTMLCanvasElement | null, labelsEl: HTMLElement | null) {
    this.labelsEl = labelsEl;
    this.stageEl = labelsEl?.parentElement ?? document.querySelector<HTMLElement>(".game-stage");
    this.ensureScene();
  }

  /** Chờ scene Thành Chính sẵn sàng (fallback/timeout không reject). */
  whenReady(): Promise<void> {
    return this.bootPromise ?? Promise.resolve();
  }

  bindInput(): void {}

  setState(state: GameState): void {
    this.state = state;
  }

  refresh(state: GameState): void {
    this.state = state;
    if (!state) return;
    this.ensureScene();
    if (!this.renderer) return;
    this.mapEl?.setAttribute("data-faction", state.faction || "shu");
    this.syncActors();
  }

  private ensureScene(): void {
    if (this.renderer || !this.stageEl) return;
    let map = document.getElementById("iso-town-map");
    if (!map) {
      map = document.createElement("div");
      map.id = "iso-town-map";
      this.stageEl.insertBefore(map, this.stageEl.firstChild);
    }
    this.mapEl = map;
    map.className = "world-viewport";
    map.setAttribute("data-city", "booting");
    map.innerHTML = "";
    if (this.labelsEl) {
      map.appendChild(this.labelsEl);
      this.labelsEl.className = "city-labels";
      this.labelsEl.innerHTML = "";
    }
    this.showBootOverlay("Đang dựng thành…");

    // Mobile: DPR 1, tắt AA/shadow — tránh OOM khi xoay. Desktop giữ nét.
    const mobile = this.coarsePointer;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      powerPreference: mobile ? "low-power" : "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
    renderer.setPixelRatio(dpr);
    renderer.shadowMap.enabled = !mobile;
    if (!mobile) renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = "city-gl";
    map.insertBefore(renderer.domElement, map.firstChild);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcbbba6);
    scene.fog = new THREE.Fog(0xcbbba6, 90, 190);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 500);
    this.camera.position.copy(CAMERA_HOME);
    this.camera.lookAt(CAMERA_TARGET);

    scene.add(new THREE.HemisphereLight(0xfff3dd, 0x4a5a38, 1.15));
    const sun = new THREE.DirectionalLight(0xffe2bf, mobile ? 1.8 : 2.4);
    sun.position.set(30, 46, 22);
    sun.castShadow = !mobile;
    if (!mobile) {
      sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { near: 5, far: 150, left: -44, right: 44, top: 44, bottom: -44 });
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.02;
      sun.shadow.radius = 2;
    }
    scene.add(sun);

    this.M = createMaterials();
    this.factory = new BuildingFactory(this.M);
    scene.add(buildTerrain(this.M));
    scene.add(this.crowd.group);
    scene.add(this.scape.group);
    this.bootPromise = this.bootCityAssets();

    this.setupControls(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", (ev) => {
      this.pressAt = { x: ev.clientX, y: ev.clientY };
    });
    renderer.domElement.addEventListener("pointermove", (ev) => {
      if (this.pressAt) return; // đang kéo — không đổi hover
      if (this.coarsePointer) return; // mobile: không hover
      this.setHover(this.hitBuilding(ev));
    });
    renderer.domElement.addEventListener("pointerleave", () => {
      if (!this.pressAt) this.setHover(null);
    });
    renderer.domElement.addEventListener("pointerup", (ev) => {
      const p = this.pressAt;
      this.pressAt = null;
      const slop = ev.pointerType === "touch" || this.coarsePointer ? CLICK_SLOP_TOUCH : CLICK_SLOP_MOUSE;
      if (p && Math.hypot(ev.clientX - p.x, ev.clientY - p.y) <= slop) this.pick(ev);
    });
    renderer.domElement.addEventListener("pointercancel", () => {
      this.pressAt = null;
    });
    let resizeRaf = 0;
    new ResizeObserver(() => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        this.resize();
      });
    }).observe(map);
    this.resize();
    // Mobile xoay màn: giữ context, tránh browser kill tab / reload về trang chủ
    renderer.domElement.addEventListener(
      "webglcontextlost",
      (ev) => {
        ev.preventDefault();
        console.warn("[NLCity] WebGL context lost — pause");
        this.pause();
      },
      false
    );
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      () => {
        console.warn("[NLCity] WebGL context restored — resize + resume");
        this.resize();
        const combat = document.getElementById("combat-overlay");
        if (!combat || combat.hidden) this.resume();
      },
      false
    );
    const onOrientBegin = () => this.pause();
    const onOrientEnd = () => {
      this.resize();
      const combat = document.getElementById("combat-overlay");
      if (!combat || combat.hidden) this.resume();
    };
    window.addEventListener("nl-orientation-begin", onOrientBegin);
    window.addEventListener("nl-orientation-end", onOrientEnd);
    renderer.setAnimationLoop(() => this.tick());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pause();
      else if (!document.getElementById("combat-overlay") || document.getElementById("combat-overlay")!.hidden) {
        this.resume();
      }
    });
  }

  /** Dừng render Thành Chính (khi mở trận / bày trận). */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.renderer?.setAnimationLoop(null);
  }

  /** Tiếp tục render Thành Chính. */
  resume(): void {
    if (!this.paused || !this.renderer) return;
    this.paused = false;
    this.renderer.setAnimationLoop(() => this.tick());
  }

  isPaused(): boolean {
    return this.paused;
  }

  /** Lerp camera + target tới một nhà (~400–600ms). */
  focusBuilding(id: string, ms = 500): void {
    const site = SITES.find((s) => s.id === id);
    if (!site || !this.camera || !this.controls) return;
    const target = new THREE.Vector3(site.x, 0, site.z);
    const pos = target.clone().add(FOCUS_OFFSET);
    this.startCamTween(pos, target, ms);
  }

  /** Về trung tâm bản đồ (CAMERA_HOME / CAMERA_TARGET). */
  focusHome(ms = 500): void {
    this.startCamTween(CAMERA_HOME.clone(), CAMERA_TARGET.clone(), ms);
  }

  /** Soft timeout: asset phụ fail/chậm không chặn UI. */
  private softWait(task: Promise<unknown>, ms: number): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      task.then(finish, finish);
      setTimeout(finish, ms);
    });
  }

  private async bootCityAssets(): Promise<void> {
    if (!this.M) return;
    const folkLoader = new URLSearchParams(location.search).has("irig") ? loadFolkInstance : loadFolk;
    const folkTask = folkLoader()
      .then((kit) => this.crowd.useFolk(kit))
      .catch((err) => console.error("[NLCity] không tải được model người, giữ người khối", err));
    const ravenTask = loadRaven()
      .then((tpl) => this.crowd.useRaven(tpl))
      .catch((err) => console.error("[NLCity] không tải được model quạ, giữ chim khối", err));

    // Tường + công trình: bắt buộc → first paint / whenReady.
    // Scape/folk/raven: soft nền, không chặn ready.
    await Promise.all([this.installWalls(), this.installModels()]);
    this.markCityReady();

    void Promise.all([
      this.softWait(this.scape.install(this.M!), 14000),
      this.softWait(folkTask, 14000),
      this.softWait(ravenTask, 10000),
    ]).then(() => {
      this.mapEl?.setAttribute("data-city-extra", "ready");
    });
  }

  private markCityReady(): void {
    this.mapEl?.setAttribute("data-city", "ready");
    this.hideBootOverlay();
    this.ensureHudActions();
    this.showFirstHint();
    window.dispatchEvent(new Event("nl-city-scene-ready"));
  }

  private showBootOverlay(label: string): void {
    if (!this.mapEl) return;
    let el = this.bootOverlay;
    if (!el) {
      el = document.createElement("div");
      el.className = "city-boot-overlay";
      el.innerHTML =
        `<div class="city-boot-card">` +
        `<div class="city-boot-spin" aria-hidden="true"></div>` +
        `<p class="city-boot-label"></p></div>`;
      this.mapEl.appendChild(el);
      this.bootOverlay = el;
    }
    const text = el.querySelector(".city-boot-label");
    if (text) text.textContent = label;
    el.hidden = false;
    el.classList.remove("is-done");
  }

  private hideBootOverlay(): void {
    const el = this.bootOverlay;
    if (!el) return;
    el.classList.add("is-done");
    window.setTimeout(() => {
      el.hidden = true;
    }, 320);
  }

  private showFirstHint(): void {
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {
      /* private mode */
    }
    const tip = document.getElementById("nl-tip");
    if (!tip) return;
    tip.hidden = false;
    tip.textContent = "Chạm nhà để nâng cấp · nút Quản lý / Bày trận bên trái";
    tip.classList.add("is-show");
    tip.setAttribute("role", "status");
    const dismiss = () => {
      tip.classList.remove("is-show");
      tip.hidden = true;
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* ignore */
      }
      tip.removeEventListener("click", dismiss);
      this.renderer?.domElement.removeEventListener("pointerdown", dismiss);
    };
    tip.addEventListener("click", dismiss);
    this.renderer?.domElement.addEventListener("pointerdown", dismiss, { once: true });
    window.setTimeout(dismiss, 6000);
  }

  private async installWalls(): Promise<void> {
    if (!this.scene || !this.M) return;
    let fort: THREE.Group;
    let status = "ready";
    try {
      fort = composeFort(await loadWallTemplates(), this.M);
    } catch (err) {
      console.error("[NLCity] không tải được model tường, dùng tường dựng sẵn", err);
      fort = fallbackFort(this.M);
      status = "fallback";
    }
    if (this.wallGroup) this.scene.remove(this.wallGroup);
    this.wallGroup = fort;
    this.scene.add(fort);
    this.wallTier = -1;
    this.fitWallTier();
    this.syncCrowd();
    this.mapEl?.setAttribute("data-walls", status);
  }

  /** Độ cao mặt tường lấy bằng tia chiếu xuống, để lính tuần đứng đúng trên tường mọi tier. */
  private computePatrols(): void {
    this.patrols = [];
    if (!this.wallGroup) return;
    this.wallGroup.updateMatrixWorld(true);
    const mul = this.wallGroup.scale.x;
    const down = new THREE.Vector3(0, -1, 0);
    const caster = new THREE.Raycaster();
    for (const [ax, az, bx, bz] of PATROL_SEGMENTS) {
      caster.set(new THREE.Vector3(((ax + bx) / 2) * mul, 60, ((az + bz) / 2) * mul), down);
      const hit = caster.intersectObject(this.wallGroup, true).find((h) => h.point.y > 0.5);
      if (!hit) continue;
      const y = hit.point.y + 0.02;
      this.patrols.push([new THREE.Vector3(ax * mul, y, az * mul), new THREE.Vector3(bx * mul, y, bz * mul)]);
    }
  }

  private syncCrowd(): void {
    if (!this.state) return;
    const tier = (id: string) => this.tiers.get(id) ?? 0;
    const built = (id: string) => (this.levels.get(id) ?? 1) > 0;
    this.crowd.sync({
      tiers: {
        hall: tier("hall"), farm: tier("farm"), barracks: tier("barracks"),
        mine: tier("mine"), academy: tier("academy"),
      },
      built: {
        hall: built("hall"), farm: built("farm"), barracks: built("barracks"),
        mine: built("mine"), academy: built("academy"),
      },
      patrols: this.patrols,
      faction: this.state.faction || "shu",
    });
  }

  private async installModels(): Promise<void> {
    try {
      this.kit = await loadModelKit();
    } catch (err) {
      console.error("[NLCity] không tải được model công trình, giữ bản khối", err);
      this.mapEl?.setAttribute("data-buildings", "fallback");
      return;
    }
    this.tiers.clear();
    if (this.state) this.syncActors();
    this.mapEl?.setAttribute("data-buildings", "ready");
  }

  private resize(): void {
    if (!this.renderer || !this.camera || !this.mapEl) return;
    const w = this.mapEl.clientWidth;
    const h = this.mapEl.clientHeight;
    // Xoay transient: bỏ qua size 0
    if (w < 8 || h < 8) return;
    // Hạ DPR động nếu CSS box lớn (tablet) — giữ aspect đúng viewport
    const maxArea = this.coarsePointer ? 900 * 500 : 1920 * 1080;
    const pr = this.renderer.getPixelRatio() || 1;
    if (w * h * pr * pr > maxArea && pr > 1) {
      const next = Math.max(1, Math.sqrt(maxArea / (w * h)));
      this.renderer.setPixelRatio(next);
    }
    this.camera.aspect = w / h;
    // Lệch frustum: tâm thành lên band an toàn (tránh bottom nav đè cổng/tường)
    const top = Math.min(HUD_TOP_SAFE, Math.round(h * 0.09));
    const bottom = Math.min(HUD_BOTTOM_SAFE, Math.round(h * 0.16));
    this.camera.setViewOffset(w, h, 0, (top - bottom) * 0.5, w, h);
    this.camera.updateProjectionMatrix();
    try {
      this.renderer.setSize(w, h, false);
    } catch (err) {
      console.warn("[NLCity] resize setSize", err);
    }
  }

  /** Kéo = pan, pinch/lăn = zoom, chuột phải = xoay. Touch-friendly. */
  private setupControls(dom: HTMLElement): void {
    if (!this.camera) return;
    const c = new MapControls(this.camera, dom);
    c.target.copy(CAMERA_TARGET);
    c.enableDamping = !this.reducedMotion;
    c.dampingFactor = this.coarsePointer ? 0.12 : 0.08;
    c.screenSpacePanning = false;
    c.minDistance = this.coarsePointer ? 22 : 28;
    c.maxDistance = this.coarsePointer ? 150 : 135;
    c.minPolarAngle = 0.45;
    c.maxPolarAngle = 1.12;
    c.zoomToCursor = !this.coarsePointer;
    c.enablePan = true;
    c.enableZoom = true;
    c.enableRotate = true;
    // 1 ngón kéo = pan (MapControls); tránh xoay nhầm trên mobile
    if (this.coarsePointer) {
      c.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
    }
    c.update();
    this.controls = c;
  }

  private tick(): void {
    if (this.paused || !this.renderer || !this.scene || !this.camera) return;
    try {
      this.timer.update();
      const t = this.timer.getElapsed();
      const dt = this.timer.getDelta();
      const motion = this.reducedMotion ? 0.15 : 1;
      this.crowd.update(dt, t, motion);
      if (!this.reducedMotion) this.scape.update(dt, t);
      this.stepCamTween();
      if (this.controls && !this.camTween) {
        const tg = this.controls.target;
        const cx = THREE.MathUtils.clamp(tg.x, -PAN_LIMIT, PAN_LIMIT) - tg.x;
        const cz = THREE.MathUtils.clamp(tg.z, -PAN_LIMIT, PAN_LIMIT) - tg.z;
        if (cx || cz || tg.y) {
          tg.add(new THREE.Vector3(cx, -tg.y, cz));
          this.camera.position.x += cx;
          this.camera.position.z += cz;
        }
        this.controls.update();
      } else if (this.controls && this.camTween) {
        this.controls.update();
      }
      if (!this.reducedMotion) {
        this.flags.forEach((f, i) => {
          f.rotation.y = Math.sin(t * 1.8 + i) * 0.35;
        });
      }
      this.updateSmoke(t);
      const now = performance.now();
      for (const actor of this.actors.values()) {
        const base = (actor.userData.baseScale as number) || 1;
        let mul = 1;
        const until = actor.userData.levelUpUntil as number | undefined;
        if (until && until > now && !this.reducedMotion) {
          const u = 1 - (until - now) / LEVEL_UP_MS;
          mul *= 1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
        } else if (until && until <= now) {
          delete actor.userData.levelUpUntil;
        }
        if (actor.userData.upgrading && !this.reducedMotion) {
          mul *= 1 + Math.sin(t * 4) * 0.015;
        }
        actor.scale.setScalar(base * mul);
      }
      this.projectLabels();
      this.renderer.render(this.scene, this.camera);
    } catch (err) {
      // Giữ loop sống trên mobile — 1 frame lỗi không được giết Thành Chính
      console.warn("[NLCity] tick", err);
    }
  }

  private hitBuilding(ev: PointerEvent): string | null {
    if (!this.camera || !this.renderer || this.actors.size === 0) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    this.ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    for (const hit of this.ray.intersectObjects([...this.actors.values()], true)) {
      let o: THREE.Object3D | null = hit.object;
      while (o) {
        if (o.userData.bid) return o.userData.bid as string;
        o = o.parent;
      }
    }
    return null;
  }

  private pick(ev: PointerEvent): void {
    const bid = this.hitBuilding(ev);
    if (bid) {
      this.setSelect(bid);
      this.onBuildingClick?.(bid);
      return;
    }
    this.setSelect(null);
  }

  private setHover(id: string | null): void {
    if (id === this.hoverId) return;
    const prev = this.hoverId;
    this.hoverId = id;
    if (prev && prev !== this.selectedId) this.applyHighlight(prev, null);
    if (id && id !== this.selectedId) this.applyHighlight(id, "hover");
    else if (id && id === this.selectedId) this.applyHighlight(id, "select");
    this.syncPinClasses();
    if (this.renderer?.domElement) {
      this.renderer.domElement.style.cursor = id ? "pointer" : "";
    }
  }

  private setSelect(id: string | null): void {
    if (id === this.selectedId) {
      this.syncPinClasses();
      return;
    }
    const prev = this.selectedId;
    this.selectedId = id;
    if (prev && prev !== this.hoverId) this.applyHighlight(prev, null);
    else if (prev && prev === this.hoverId) this.applyHighlight(prev, "hover");
    if (id) this.applyHighlight(id, "select");
    this.syncPinClasses();
  }

  private syncPinClasses(): void {
    if (!this.labelsEl) return;
    this.labelsEl.querySelectorAll<HTMLElement>(".city-pin").forEach((node) => {
      const bid = node.dataset.bid || "";
      node.classList.toggle("is-hot", bid === this.hoverId);
      node.classList.toggle("is-selected", bid === this.selectedId);
    });
  }

  private applyHighlight(id: string, mode: "hover" | "select" | null): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    const add = mode === "select" ? SELECT_EMISSIVE : mode === "hover" ? HOVER_EMISSIVE : 0;
    actor.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        const m = mat as THREE.MeshStandardMaterial;
        if (!m || !("emissive" in m) || !m.emissive) continue;
        if (m.userData._em0 === undefined) {
          m.userData._em0 = m.emissive.getHex();
        }
        const base = m.userData._em0 as number;
        m.emissive.setHex(base);
        if (add) m.emissive.add(new THREE.Color(add));
      }
    });
  }

  private startCamTween(toPos: THREE.Vector3, toTarget: THREE.Vector3, ms: number): void {
    if (!this.camera || !this.controls) return;
    toTarget.y = 0;
    toTarget.x = THREE.MathUtils.clamp(toTarget.x, -PAN_LIMIT, PAN_LIMIT);
    toTarget.z = THREE.MathUtils.clamp(toTarget.z, -PAN_LIMIT, PAN_LIMIT);
    if (this.reducedMotion || ms <= 0) {
      this.camera.position.copy(toPos);
      this.controls.target.copy(toTarget);
      this.controls.update();
      this.camTween = null;
      return;
    }
    this.camTween = {
      t0: performance.now(),
      dur: Math.max(200, Math.min(800, ms)),
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: toPos.clone(),
      toTarget: toTarget.clone(),
    };
  }

  private stepCamTween(): void {
    if (!this.camTween || !this.camera || !this.controls) return;
    const { t0, dur, fromPos, fromTarget, toPos, toTarget } = this.camTween;
    const u = Math.min(1, (performance.now() - t0) / dur);
    const e = u * u * (3 - 2 * u);
    this.camera.position.lerpVectors(fromPos, toPos, e);
    this.controls.target.lerpVectors(fromTarget, toTarget, e);
    if (u >= 1) this.camTween = null;
  }

  private fitWallTier(): void {
    if (!this.wallGroup || !this.state) return;
    const hall = this.buildingList().find((b) => b.id === "hall" || b.building_id === "ty_vu");
    const lv = hall?.level ?? this.state.buildings?.hall ?? this.state.buildings?.ty_vu ?? 1;
    const tier = tierOf(lv);
    if (tier === this.wallTier) return;
    this.wallGroup.scale.setScalar(wallScaleFor(tier));
    // Merlon / đỉnh tường: hiện dần theo tier (nếu fallback có userData.merlons)
    this.wallGroup.traverse((o) => {
      if (o.userData.wallTierMin != null) {
        o.visible = tier >= (o.userData.wallTierMin as number);
      }
    });
    this.wallTier = tier;
    this.computePatrols();
    this.syncCrowd();
  }

  /** Khói billboard tại farm / hall — 2 plane, opacity thấp. */
  private ensureSmoke(): void {
    if (!this.scene || this.smokes.length) return;
    if (!this.smokeMat) {
      this.smokeMat = new THREE.MeshBasicMaterial({
        color: 0xc9c4b8,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    }
    const spots: [string, number, number, number][] = [
      ["farm", -13, 3.6, 4],
      ["hall", 0, 5.2, -10],
    ];
    for (const [site, x, y, z] of spots) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), this.smokeMat.clone());
      mesh.position.set(x, y, z);
      mesh.renderOrder = 2;
      mesh.visible = false;
      this.scene.add(mesh);
      this.smokes.push({ mesh, phase: Math.random() * 6, baseY: y, site });
    }
  }

  private syncSmokeVisibility(): void {
    this.ensureSmoke();
    const farmLv = this.levels.get("farm") ?? 0;
    const hallLv = this.levels.get("hall") ?? 0;
    for (const s of this.smokes) {
      const on =
        !this.reducedMotion &&
        ((s.site === "farm" && farmLv > 0) || (s.site === "hall" && hallLv >= 2));
      s.mesh.visible = on;
    }
  }

  private updateSmoke(t: number): void {
    if (!this.camera || this.reducedMotion) return;
    for (const s of this.smokes) {
      if (!s.mesh.visible) continue;
      s.mesh.quaternion.copy(this.camera.quaternion);
      s.mesh.position.y = s.baseY + Math.sin(t * 0.9 + s.phase) * 0.35;
      const mat = s.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + 0.1 * (0.5 + 0.5 * Math.sin(t * 1.1 + s.phase));
      const sc = 0.9 + 0.15 * Math.sin(t * 0.7 + s.phase * 0.5);
      s.mesh.scale.set(sc, sc * 1.15, 1);
    }
  }

  /** Nút Bày trận nhanh — không trùng bottom nav. */
  private ensureHudActions(): void {
    if (!this.labelsEl || this.hudActionsEl) return;
    const el = document.createElement("div");
    el.className = "city-hud-actions";
    el.innerHTML = `<button type="button" class="city-hotspot" data-act="deploy">Bày trận</button>`;
    el.addEventListener("pointerup", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
      if (!btn || btn.dataset.act !== "deploy") return;
      e.stopPropagation();
      e.preventDefault();
      this.onDeployClick?.();
    });
    el.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("[data-act]")) e.stopPropagation();
    });
    this.labelsEl.appendChild(el);
    this.hudActionsEl = el;
  }

  private buildingList(): BuildingInfo[] {
    return this.state ? window.NLGame?.getBuildingList?.(this.state) ?? [] : [];
  }

  private mountActor(site: Site, tier: Tier): void {
    if (!this.scene || !this.factory) return;
    const old = this.actors.get(site.id);
    if (old) {
      this.scene.remove(old);
      // model thật dùng chung geometry với template, chỉ dọn bản khối
      if (old.userData.baseScale !== 1) old.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    }
    const fromKit = this.kit && this.M ? buildFromKit(this.kit, this.M, site.kind, tier) : null;
    const group = fromKit ?? this.factory.build(site.kind, tier);
    group.userData.baseScale = fromKit ? 1 : SITE_SCALE;
    group.position.set(site.x, 0, site.z);
    group.scale.setScalar(group.userData.baseScale as number);
    group.userData.bid = site.id;
    const anchor = new THREE.Object3D();
    anchor.position.y = (group.userData.anchorY as number) || 3;
    group.add(anchor);
    group.userData.anchor = anchor;
    this.scene.add(group);
    this.actors.set(site.id, group);
    this.tiers.set(site.id, tier);
  }

  private projectLabels(): void {
    if (!this.labelsEl || !this.camera || !this.mapEl) return;
    const w = this.mapEl.clientWidth;
    const h = this.mapEl.clientHeight;
    for (const [id, actor] of this.actors) {
      const node = this.labelsEl.querySelector<HTMLElement>(`.city-pin[data-bid="${id}"]`);
      const anchor = actor.userData.anchor as THREE.Object3D | undefined;
      if (!node || !anchor) continue;
      anchor.getWorldPosition(this.tmp).project(this.camera);
      if (this.tmp.z > 1) {
        node.style.visibility = "hidden";
        continue;
      }
      node.style.visibility = "visible";
      node.style.left = `${(this.tmp.x * 0.5 + 0.5) * w}px`;
      node.style.top = `${(-this.tmp.y * 0.5 + 0.5) * h}px`;
    }
  }

  private syncActors(): void {
    if (!this.state) return;
    const byId = new Map<string, BuildingInfo>();
    for (const item of this.buildingList()) {
      byId.set(item.id, item);
      if (item.building_id) byId.set(item.building_id, item);
    }
    this.fitWallTier();

    const firstPaint = !!this.labelsEl && !this.labelsEl.querySelector(".city-pin");
    let html = "";
    for (const site of SITES) {
      const info = byId.get(site.id) ?? byId.get(site.building_id);
      const lv = Number(info?.level ?? this.state.buildings?.[site.id] ?? this.state.buildings?.[site.building_id] ?? 1) || 0;
      const tier = tierOf(lv);
      const prevLv = this.levels.get(site.id);
      const leveledUp = prevLv != null && lv > prevLv;
      this.levels.set(site.id, lv);
      const remount = this.tiers.get(site.id) !== tier || !this.actors.has(site.id);
      if (remount) this.mountActor(site, tier);
      const actor = this.actors.get(site.id);
      if (actor) {
        actor.userData.upgrading = !!info?.upgrading;
        if (leveledUp) actor.userData.levelUpUntil = performance.now() + LEVEL_UP_MS;
        // remount mất emissive state — gắn lại hover/select
        if (remount) {
          if (site.id === this.selectedId) this.applyHighlight(site.id, "select");
          else if (site.id === this.hoverId) this.applyHighlight(site.id, "hover");
        }
      }

      if (firstPaint) {
        html +=
          `<div class="city-pin${info?.upgrading ? " is-upgrading" : ""}" data-bid="${site.id}">` +
          `<button type="button" class="blabel iso-nameplate" data-bid="${site.id}">` +
          `<span class="iso-nameplate-title">${site.name}</span>` +
          `<span class="lv iso-nameplate-lv">Lv.${lv}</span></button>` +
          `<div class="iso-upgrade-banner"${info?.upgrading ? "" : " hidden"}>` +
          `Đang nâng cấp: <b class="iso-cd-time">${info?.countdown ?? ""}</b></div></div>`;
      } else if (this.labelsEl) {
        const node = this.labelsEl.querySelector<HTMLElement>(`.city-pin[data-bid="${site.id}"]`);
        if (!node) continue;
        node.classList.toggle("is-upgrading", !!info?.upgrading);
        const lvEl = node.querySelector(".iso-nameplate-lv");
        if (lvEl) lvEl.textContent = `Lv.${lv}`;
        const banner = node.querySelector<HTMLElement>(".iso-upgrade-banner");
        if (banner) {
          banner.hidden = !info?.upgrading;
          const cd = banner.querySelector(".iso-cd-time");
          if (cd) cd.textContent = info?.countdown ?? "";
        }
      }
    }

    if (firstPaint && this.labelsEl) {
      this.labelsEl.innerHTML = html;
      this.labelsEl.querySelectorAll<HTMLElement>(".city-pin").forEach((node) => {
        node.addEventListener("click", (e) => {
          e.stopPropagation();
          const bid = node.dataset.bid;
          if (!bid) return;
          this.setSelect(bid);
          this.onBuildingClick?.(bid);
        });
      });
      this.syncPinClasses();
    }
    this.rescanFlags();
    this.syncSmokeVisibility();
    if (this.mapEl?.getAttribute("data-city") === "ready") this.ensureHudActions();
    this.syncCrowd();
  }

  private rescanFlags(): void {
    const list: THREE.Object3D[] = [];
    for (const actor of this.actors.values()) {
      actor.traverse((o) => {
        if (o.userData.isFlag) list.push(o);
      });
    }
    this.flags = list;
  }
}
