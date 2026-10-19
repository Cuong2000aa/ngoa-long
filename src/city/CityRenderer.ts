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

const CAMERA_TARGET = new THREE.Vector3(-6, 0, 6);
const CAMERA_HOME = CAMERA_TARGET.clone().add(new THREE.Vector3(38, 50, 54));
/** Giới hạn kéo bản đồ quanh thành. */
const PAN_LIMIT = 26;
/** Di chuột quá ngưỡng này (px) thì coi là kéo, không phải bấm. */
const CLICK_SLOP = 6;

/**
 * Thành Chính: một scene Three.js, HUD vẫn là HTML phía trên canvas.
 * API giữ như bản cũ để js/app.js gọi: new CityRenderer(null, labelsEl), refresh(state), onBuildingClick.
 */
export class CityRenderer {
  onBuildingClick: ((id: string) => void) | null = null;

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

  private readonly timer = new THREE.Timer();
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly tmp = new THREE.Vector3();
  private readonly reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  /** Resolve khi tường + công trình + (scape/folk soft) xong — FE loading dùng. */
  private bootPromise: Promise<void> | null = null;

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
    map.innerHTML = "";
    if (this.labelsEl) {
      map.appendChild(this.labelsEl);
      this.labelsEl.className = "city-labels";
      this.labelsEl.innerHTML = "";
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
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
    const sun = new THREE.DirectionalLight(0xffe2bf, 2.4);
    sun.position.set(30, 46, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { near: 5, far: 150, left: -44, right: 44, top: 44, bottom: -44 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 3;
    scene.add(sun);

    this.M = createMaterials();
    this.factory = new BuildingFactory(this.M);
    scene.add(buildTerrain(this.M));
    scene.add(this.crowd.group);
    scene.add(this.scape.group);
    this.bootPromise = this.bootCityAssets();

    this.setupControls(renderer.domElement);
    renderer.domElement.addEventListener("pointerdown", (ev) => {
      this.pressAt = { x: ev.clientX, y: ev.clientY };
    });
    renderer.domElement.addEventListener("pointerup", (ev) => {
      const p = this.pressAt;
      this.pressAt = null;
      if (p && Math.hypot(ev.clientX - p.x, ev.clientY - p.y) <= CLICK_SLOP) this.pick(ev);
    });
    new ResizeObserver(() => this.resize()).observe(map);
    this.resize();
    renderer.setAnimationLoop(() => this.tick());
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

    // Tường + công trình: bắt buộc (đã có fallback nội bộ). Scape/folk/raven: soft.
    await Promise.all([
      this.installWalls(),
      this.installModels(),
      this.softWait(this.scape.install(this.M), 14000),
      this.softWait(folkTask, 14000),
      this.softWait(ravenTask, 10000),
    ]);
    this.mapEl?.setAttribute("data-city", "ready");
    window.dispatchEvent(new Event("nl-city-scene-ready"));
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
    if (w < 2 || h < 2) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  /** Kéo trái = di chuyển, chuột phải = xoay, lăn = zoom. Góc nhìn khoá trong khoảng nhìn xiên. */
  private setupControls(dom: HTMLElement): void {
    if (!this.camera) return;
    const c = new MapControls(this.camera, dom);
    c.target.copy(CAMERA_TARGET);
    c.enableDamping = !this.reducedMotion;
    c.dampingFactor = 0.08;
    c.screenSpacePanning = false;
    c.minDistance = 22;
    c.maxDistance = 110;
    c.minPolarAngle = 0.45;
    c.maxPolarAngle = 1.12;
    c.zoomToCursor = true;
    c.update();
    this.controls = c;
  }

  private tick(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.timer.update();
    const t = this.timer.getElapsed();
    const dt = this.timer.getDelta();
    this.crowd.update(dt, t);
    this.scape.update(dt, t);
    if (this.controls) {
      const tg = this.controls.target;
      const cx = THREE.MathUtils.clamp(tg.x, -PAN_LIMIT, PAN_LIMIT) - tg.x;
      const cz = THREE.MathUtils.clamp(tg.z, -PAN_LIMIT, PAN_LIMIT) - tg.z;
      if (cx || cz || tg.y) {
        tg.add(new THREE.Vector3(cx, -tg.y, cz));
        this.camera.position.x += cx;
        this.camera.position.z += cz;
      }
      this.controls.update();
    }
    this.flags.forEach((f, i) => {
      f.rotation.y = Math.sin(t * 1.8 + i) * 0.35;
    });
    for (const actor of this.actors.values()) {
      const pulse = actor.userData.upgrading && !this.reducedMotion ? 1 + Math.sin(t * 4) * 0.015 : 1;
      actor.scale.setScalar(((actor.userData.baseScale as number) || 1) * pulse);
    }
    this.projectLabels();
    this.renderer.render(this.scene, this.camera);
  }

  private pick(ev: PointerEvent): void {
    if (!this.camera || !this.scene || !this.renderer || !this.onBuildingClick) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    for (const hit of this.ray.intersectObjects([...this.actors.values()], true)) {
      let o: THREE.Object3D | null = hit.object;
      while (o) {
        if (o.userData.bid) {
          this.onBuildingClick(o.userData.bid as string);
          return;
        }
        o = o.parent;
      }
    }
  }

  private fitWallTier(): void {
    if (!this.wallGroup || !this.state) return;
    const hall = this.buildingList().find((b) => b.id === "hall" || b.building_id === "ty_vu");
    const lv = hall?.level ?? this.state.buildings?.hall ?? this.state.buildings?.ty_vu ?? 1;
    const tier = tierOf(lv);
    if (tier === this.wallTier) return;
    this.wallGroup.scale.setScalar(wallScaleFor(tier));
    this.wallTier = tier;
    this.computePatrols();
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
      const lv = info?.level ?? this.state.buildings?.[site.id] ?? this.state.buildings?.[site.building_id] ?? 1;
      const tier = tierOf(lv);
      this.levels.set(site.id, Number(lv) || 0);
      if (this.tiers.get(site.id) !== tier || !this.actors.has(site.id)) this.mountActor(site, tier);
      const actor = this.actors.get(site.id);
      if (actor) actor.userData.upgrading = !!info?.upgrading;

      if (firstPaint) {
        html +=
          `<div class="city-pin" data-bid="${site.id}">` +
          `<button type="button" class="blabel iso-nameplate" data-bid="${site.id}">` +
          `<span class="iso-nameplate-title">${site.name}</span>` +
          `<span class="lv iso-nameplate-lv">Lv.${lv}</span></button>` +
          `<div class="iso-upgrade-banner"${info?.upgrading ? "" : " hidden"}>` +
          `Đang nâng cấp: <b class="iso-cd-time">${info?.countdown ?? ""}</b></div></div>`;
      } else if (this.labelsEl) {
        const node = this.labelsEl.querySelector(`.city-pin[data-bid="${site.id}"]`);
        if (!node) continue;
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
          if (bid) this.onBuildingClick?.(bid);
        });
      });
    }
    this.rescanFlags();
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
