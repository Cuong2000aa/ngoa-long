import * as THREE from "three";

/**
 * VFX chiến trường — sprite only (không geometry procedural).
 *
 * Nguồn:
 * - Kenney Particle Pack → assets/fx/particles/
 * - Cethiel Arcane / Earth / Fire-Wrath / Slash / Blood / Water / Pure
 * - Starsteel / SpritePilot / Nineball dragon…
 * - **Pixel Ability FX Forge** (Apache-2.0) → assets/fx/forge/* — generate:
 *   `node scripts/forge-generate-fx.mjs`
 *
 * Flash → sheet: ưu tiên forge pack theo element, fallback Kenney/Cethiel.
 */

/** 12-frame packs từ Pixel Ability FX Forge */
function forgePack(id: string): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `assets/fx/forge/${id}/frame_${n}.png`;
  });
}

const TEX = {
  slash: [
    "assets/fx/particles/slash_01.png",
    "assets/fx/particles/slash_02.png",
    "assets/fx/particles/slash_03.png",
    "assets/fx/particles/slash_04.png",
  ],
  /** Cethiel Weapon Slash — classic (Thường / vật lý cơ bản) */
  slashClassic: [
    "assets/fx/slash/classic_classic_1_classic_01.png",
    "assets/fx/slash/classic_classic_1_classic_02.png",
    "assets/fx/slash/classic_classic_1_classic_03.png",
    "assets/fx/slash/classic_classic_1_classic_04.png",
    "assets/fx/slash/classic_classic_1_classic_05.png",
    "assets/fx/slash/classic_classic_1_classic_06.png",
  ],
  slashBlue: [
    "assets/fx/slash/blue_alternative_2_1_alternative_2_01.png",
    "assets/fx/slash/blue_alternative_2_1_alternative_2_02.png",
    "assets/fx/slash/blue_alternative_2_1_alternative_2_03.png",
    "assets/fx/slash/blue_alternative_2_1_alternative_2_04.png",
    "assets/fx/slash/blue_alternative_2_1_alternative_2_05.png",
    "assets/fx/slash/blue_alternative_2_1_alternative_2_06.png",
  ],
  slashPurple: [
    "assets/fx/slash/purple_alternative_1_1_alternative_1_01.png",
    "assets/fx/slash/purple_alternative_1_1_alternative_1_02.png",
    "assets/fx/slash/purple_alternative_1_1_alternative_1_03.png",
    "assets/fx/slash/purple_alternative_1_1_alternative_1_04.png",
    "assets/fx/slash/purple_alternative_1_1_alternative_1_05.png",
    "assets/fx/slash/purple_alternative_1_1_alternative_1_06.png",
  ],
  slashFire: [
    "assets/fx/slash/fire_alternative_3_1_alternative_3_01.png",
    "assets/fx/slash/fire_alternative_3_1_alternative_3_02.png",
    "assets/fx/slash/fire_alternative_3_1_alternative_3_03.png",
    "assets/fx/slash/fire_alternative_3_1_alternative_3_04.png",
    "assets/fx/slash/fire_alternative_3_1_alternative_3_05.png",
    "assets/fx/slash/fire_alternative_3_1_alternative_3_06.png",
  ],
  hit: [
    "assets/fx/particles/flare_01.png",
    "assets/fx/particles/star_01.png",
    "assets/fx/particles/spark_02.png",
    "assets/fx/particles/magic_02.png",
  ],
  fire: [
    "assets/fx/particles/flame_01.png",
    "assets/fx/particles/flame_02.png",
    "assets/fx/particles/flame_03.png",
    "assets/fx/particles/flame_04.png",
  ],
  /** Cethiel Fire Wrath — ultimate / Thần Hoàng hỏa */
  fireWrath: [
    "assets/fx/fire-wrath/sd_1_fire-wrath__01.png",
    "assets/fx/fire-wrath/sd_1_fire-wrath__02.png",
    "assets/fx/fire-wrath/sd_1_fire-wrath__03.png",
    "assets/fx/fire-wrath/sd_1_fire-wrath__04.png",
    "assets/fx/fire-wrath/sd_1_fire-wrath__05.png",
  ],
  blood: [
    "assets/fx/blood/blood-magic-effect_01.png",
    "assets/fx/blood/blood-magic-effect_02.png",
    "assets/fx/blood/blood-magic-effect_03.png",
    "assets/fx/blood/blood-magic-effect_04.png",
    "assets/fx/blood/blood-magic-effect_05.png",
  ],
  water: [
    "assets/fx/water/01_water__01.png",
    "assets/fx/water/01_water__02.png",
    "assets/fx/water/01_water__03.png",
    "assets/fx/water/01_water__04.png",
    "assets/fx/water/01_water__05.png",
  ],
  pure: [
    "assets/fx/pure/files_pure_01.png",
    "assets/fx/pure/files_pure_02.png",
    "assets/fx/pure/files_pure_03.png",
    "assets/fx/pure/files_pure_04.png",
    "assets/fx/pure/files_pure_05.png",
  ],
  thunderSpell: [
    "assets/fx/skill/starsteel/Thundersphere1.png",
    "assets/fx/skill/starsteel/Thundersphere2.png",
    "assets/fx/skill/starsteel/Thundersphere3.png",
    "assets/fx/skill/starsteel/Thundersphere4.png",
    "assets/fx/skill/starsteel/Thundersphere5.png",
    "assets/fx/skill/starsteel/Thundersphere6.png",
    "assets/fx/skill/starsteel/Thundersphere7.png",
    "assets/fx/skill/starsteel/Thundersphere8.png",
  ],
  fireballSpell: [
    "assets/fx/skill/starsteel/Fireball1.png",
    "assets/fx/skill/starsteel/Fireball2.png",
    "assets/fx/skill/starsteel/Fireball3.png",
    "assets/fx/skill/starsteel/Fireball4.png",
    "assets/fx/skill/starsteel/Fireball5.png",
    "assets/fx/skill/starsteel/Fireball6.png",
    "assets/fx/skill/starsteel/Fireball7.png",
    "assets/fx/skill/starsteel/Fireball8.png",
    "assets/fx/skill/starsteel/Fireball9.png",
  ],
  magic: [
    "assets/fx/arcane/Arcane_Effect_1.png",
    "assets/fx/arcane/Arcane_Effect_2.png",
    "assets/fx/arcane/Arcane_Effect_3.png",
    "assets/fx/arcane/Arcane_Effect_4.png",
    "assets/fx/arcane/Arcane_Effect_5.png",
    "assets/fx/arcane/Arcane_Effect_6.png",
    "assets/fx/arcane/Arcane_Effect_7.png",
  ],
  earth: [
    "assets/fx/earth/1_Earth-Impact_01.png",
    "assets/fx/earth/1_Earth-Impact_02.png",
    "assets/fx/earth/1_Earth-Impact_03.png",
    "assets/fx/earth/1_Earth-Impact_04.png",
    "assets/fx/earth/1_Earth-Impact_05.png",
  ],
  /** Nineball Fire Dragon Roller — CC0 (OpenGameArt) */
  dragon: [
    "assets/fx/dragon/dragon_01.png",
    "assets/fx/dragon/dragon_03.png",
    "assets/fx/dragon/dragon_05.png",
    "assets/fx/dragon/dragon_07.png",
    "assets/fx/dragon/dragon_09.png",
    "assets/fx/dragon/dragon_11.png",
  ],
  /** Kenney + tint xanh — rắn / độc (không geometry tự vẽ) */
  snake: [
    "assets/fx/particles/magic_02.png",
    "assets/fx/particles/twirl_01.png",
    "assets/fx/particles/twirl_02.png",
    "assets/fx/particles/trace_01.png",
    "assets/fx/water/01_water__03.png",
  ],
  /** n4 — Whirlwind for effects (OGA, CC0) */
  whirlwind: [
    "assets/fx/whirlwind/whirl_01.png",
    "assets/fx/whirlwind/whirl_02.png",
    "assets/fx/whirlwind/whirl_03.png",
    "assets/fx/whirlwind/whirl_04.png",
  ],
  /** Segel2D Wolf Attack frames (OGA, CC0) — tint tối cho bóng sói */
  wolf: [
    "assets/fx/wolf/wolf_01.png",
    "assets/fx/wolf/wolf_02.png",
    "assets/fx/wolf/wolf_03.png",
    "assets/fx/wolf/wolf_04.png",
    "assets/fx/wolf/wolf_05.png",
    "assets/fx/wolf/wolf_06.png",
    "assets/fx/wolf/wolf_07.png",
    "assets/fx/wolf/wolf_08.png",
  ],
  /**
   * SpritePilot Combat (CC0) — Hổ Khiếu / motif tiger:
   * roar = shockwave (tiếng gầm lan), claw = cào thú, slam/crit = phụ
   */
  tigerRoar: [
    "assets/fx/tiger/roar_01.png",
    "assets/fx/tiger/roar_02.png",
    "assets/fx/tiger/roar_03.png",
    "assets/fx/tiger/roar_04.png",
    "assets/fx/tiger/roar_05.png",
    "assets/fx/tiger/roar_06.png",
    "assets/fx/tiger/roar_07.png",
    "assets/fx/tiger/roar_08.png",
  ],
  tigerClaw: [
    "assets/fx/tiger/claw_01.png",
    "assets/fx/tiger/claw_02.png",
    "assets/fx/tiger/claw_03.png",
    "assets/fx/tiger/claw_04.png",
    "assets/fx/tiger/claw_05.png",
    "assets/fx/tiger/claw_06.png",
    "assets/fx/tiger/claw_07.png",
    "assets/fx/tiger/claw_08.png",
  ],
  tigerSlam: [
    "assets/fx/tiger/slam_01.png",
    "assets/fx/tiger/slam_02.png",
    "assets/fx/tiger/slam_03.png",
    "assets/fx/tiger/slam_04.png",
    "assets/fx/tiger/slam_05.png",
    "assets/fx/tiger/slam_06.png",
    "assets/fx/tiger/slam_07.png",
    "assets/fx/tiger/slam_08.png",
    "assets/fx/tiger/slam_09.png",
  ],
  // Chỉ grayscale particle — tint xanh độc (tránh Arcane tím → vàng bẩn khi multiply)
  poison: [
    "assets/fx/particles/magic_03.png",
    "assets/fx/particles/circle_03.png",
    "assets/fx/particles/magic_05.png",
    "assets/fx/particles/star_01.png",
    "assets/fx/particles/smoke_04.png",
  ],
  /** Kenney đã có alpha — aura chân sạch, tránh LightEffect hộp đen */
  kenneyAura: [
    "assets/fx/particles/flare_01.png",
    "assets/fx/particles/magic_02.png",
    "assets/fx/particles/star_01.png",
  ],
  /** Bụi / đất — dấu vó ngựa khi kỵ xung kích */
  dirt: [
    "assets/fx/particles/dirt_01.png",
    "assets/fx/particles/dirt_02.png",
    "assets/fx/particles/dirt_03.png",
  ],
  smoke: [
    "assets/fx/particles/smoke_01.png",
    "assets/fx/particles/smoke_03.png",
    "assets/fx/particles/smoke_05.png",
    "assets/fx/particles/smoke_07.png",
  ],
  muzzle: [
    "assets/fx/particles/muzzle_01.png",
    "assets/fx/particles/muzzle_03.png",
    "assets/fx/particles/muzzle_05.png",
  ],
  /** Vòng khiên / barrier (Thiết Bích) */
  circle: [
    "assets/fx/particles/circle_01.png",
    "assets/fx/particles/circle_02.png",
    "assets/fx/particles/circle_03.png",
    "assets/fx/particles/circle_04.png",
    "assets/fx/particles/circle_05.png",
  ],
  light: [
    "assets/fx/particles/light_01.png",
    "assets/fx/particles/light_02.png",
    "assets/fx/particles/light_03.png",
  ],
  /** Pixel Ability FX Forge — element packs (scripts/forge-generate-fx.mjs) */
  forgeFrost: forgePack("frost_burst"),
  forgeStorm: forgePack("storm_burst"),
  forgeEmber: forgePack("ember_burst"),
  forgeShadow: forgePack("shadow_burst"),
  forgeBlood: forgePack("blood_burst"),
  forgeEarth: forgePack("earth_burst"),
  forgeNature: forgePack("nature_burst"),
  forgeTide: forgePack("tide_burst"),
  forgeArcane: forgePack("arcane_burst"),
  forgeRadiance: forgePack("radiance_aura"),
  forgeFrostAura: forgePack("frost_aura"),
  forgeWard: forgePack("ward_barrier"),
};

const cache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

/**
 * Sheet FX thường nền đen đặc (Kenney particles cũng vậy — không có alpha!).
 * Luma → alpha, premultiply RGB, cắt fringe tối → hết “bóng hộp” khi additive.
 */
function prepareFxTexture(src: THREE.Texture, threshold = 48): THREE.Texture {
  const img = src.image as HTMLImageElement | ImageBitmap | undefined;
  if (!img || !(img as HTMLImageElement).width) return src;
  const w = (img as HTMLImageElement).width;
  const h = (img as HTMLImageElement).height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return src;
  ctx.drawImage(img as CanvasImageSource, 0, 0);
  let id: ImageData;
  try {
    id = ctx.getImageData(0, 0, w, h);
  } catch {
    return src;
  }
  const d = id.data;
  const soft = threshold + 72;
  let opaqueNearBlack = 0;
  let alreadyTransparent = 0;
  const n = w * h;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 12) alreadyTransparent++;
    const luma = Math.max(d[i], d[i + 1], d[i + 2]);
    if (luma < threshold && d[i + 3] > 200) opaqueNearBlack++;
  }
  // Đã có alpha sạch + ít nền đen opaque → chỉ premultiply nhẹ
  const forceKey = opaqueNearBlack / n > 0.08 || alreadyTransparent / n < 0.05;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    let a = d[i + 3];
    const luma = Math.max(r, g, b);

    if (forceKey) {
      if (luma <= threshold) {
        d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
        continue;
      }
      // Soft falloff: fringe tối → alpha thấp
      const t = luma < soft ? (luma - threshold) / (soft - threshold) : 1;
      a = Math.min(a, Math.round(t * t * 255));
    } else if (luma <= threshold && a > 200) {
      // Sheet đã alpha nhưng còn pixel đen “bẩn”
      d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
      continue;
    }

    if (a < 10) {
      d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
      continue;
    }

    // Premultiply — CustomBlending One/One không tạo veil xám
    const af = a / 255;
    d[i] = Math.round(r * af);
    d[i + 1] = Math.round(g * af);
    d[i + 2] = Math.round(b * af);
    d[i + 3] = a;
  }
  ctx.putImageData(id, 0, 0);
  const out = new THREE.CanvasTexture(canvas);
  out.colorSpace = THREE.SRGBColorSpace;
  out.needsUpdate = true;
  out.premultiplyAlpha = true;
  out.magFilter = THREE.LinearFilter;
  out.minFilter = THREE.LinearMipmapLinearFilter;
  out.generateMipmaps = true;
  return out;
}

function loadTex(url: string): Promise<THREE.Texture> {
  if (cache.has(url)) return Promise.resolve(cache.get(url)!);
  return new Promise((resolve) => {
    loader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        // Icon wiki UI đã có alpha sạch — không key đen (tránh thủng icon)
        if (url.includes("assets/ui/status/")) {
          t.needsUpdate = true;
          cache.set(url, t);
          resolve(t);
          return;
        }
        // FX sheet qua prepare (Kenney particles nền đen đặc)
        const keyed = prepareFxTexture(t);
        keyed.needsUpdate = true;
        cache.set(url, keyed);
        resolve(keyed);
      },
      undefined,
      () => {
        const t = new THREE.Texture();
        cache.set(url, t);
        resolve(t);
      }
    );
  });
}

type FxSprite = THREE.Sprite & {
  userData: {
    born: number;
    life: number;
    frames?: string[];
    frameI?: number;
    nextFrame?: number;
    flightFrom?: THREE.Vector3;
    flightTo?: THREE.Vector3;
    baseSize?: number;
    /** Độ cao cung bay (mặc định 0.35) */
    flightArc?: number;
    /** Lệch ngang kiểu thân rắn (sin) */
    flightSide?: number;
  };
};

function makeSprite(tex: THREE.Texture, size: number, color = 0xffffff): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: tex,
    color,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    premultipliedAlpha: true,
    // Premultiplied additive: RGB đã * alpha trong prepareFxTexture — đen tuyệt đối = 0
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    alphaTest: 0.01,
    opacity: 1,
  });
  const s = new THREE.Sprite(mat) as FxSprite;
  s.scale.set(size, size, 1);
  s.name = "fx-sprite";
  s.renderOrder = 40;
  s.frustumCulled = false;
  return s;
}

/** Active FX list — tránh scan toàn scene mỗi frame */
const ACTIVE_FX = new Set<THREE.Sprite>();
/** Tăng mỗi lần clearBattleVfx — hủy spawn async (playSheet/loadTex + setTimeout) còn treo */
let fxEpoch = 0;
export function battleVfxEpoch(): number {
  return fxEpoch;
}

/** setTimeout gắn epoch — clearFx bỏ qua callback cũ */
function afterFx(ms: number, fn: () => void): void {
  const epoch = fxEpoch;
  setTimeout(() => {
    if (epoch !== fxEpoch) return;
    fn();
  }, ms);
}

function disposeLater(obj: THREE.Object3D, ms: number, host: THREE.Object3D): void {
  const epoch = fxEpoch;
  setTimeout(() => {
    if (epoch !== fxEpoch) {
      // Đã clear — chỉ gỡ nếu vẫn còn trên host
      if (obj.parent === host) host.remove(obj);
      ACTIVE_FX.delete(obj as THREE.Sprite);
      return;
    }
    host.remove(obj);
    ACTIVE_FX.delete(obj as THREE.Sprite);
    obj.traverse((o) => {
      const sp = o as THREE.Sprite;
      if (sp.isSprite && sp.material) {
        ACTIVE_FX.delete(sp);
        // không dispose shared textures
        (sp.material as THREE.SpriteMaterial).dispose();
      }
    });
  }, ms);
}

/**
 * Public sheet spawn — skillFxLibrary + choreography dùng chung (CC0 sprites only).
 * Giữ cùng prepareFxTexture / CustomBlending / ACTIVE_FX cleanup.
 */
export async function spawnFxSheet(
  scene: THREE.Scene,
  at: THREE.Vector3,
  frames: string[],
  opts: {
    size?: number;
    life?: number;
    color?: number;
    y?: number;
    yMode?: "add" | "abs";
    /** Gắn vào tướng — FX đi theo lunge/root, không đứng yên giữa sân */
    parent?: THREE.Object3D;
  } = {}
): Promise<void> {
  return playSheet(scene, at, frames, opts);
}

async function playSheet(
  scene: THREE.Scene,
  at: THREE.Vector3,
  frames: string[],
  opts: {
    size?: number;
    life?: number;
    color?: number;
    y?: number;
    yMode?: "add" | "abs";
    /** Gắn vào tướng — FX đi theo lunge/root, không đứng yên giữa sân */
    parent?: THREE.Object3D;
  } = {}
): Promise<void> {
  if (!frames.length) return;
  const epoch = fxEpoch;
  const size = opts.size ?? 1.6;
  const life = opts.life ?? 480;
  const tex = await loadTex(frames[0]);
  if (epoch !== fxEpoch) return; // clearFx trong lúc load — bỏ spawn sót
  const spr = makeSprite(tex, size, opts.color ?? 0xffffff) as FxSprite;
  spr.center.set(0.5, 0.5);
  const host = opts.parent ?? scene;
  spr.position.copy(at);
  // abs = at đã là điểm ngực tướng; add = at sàn + offset (cũ)
  if (opts.yMode === "abs") {
    spr.position.y = at.y + (opts.y ?? 0);
  } else {
    spr.position.y = (opts.y ?? 1.1) + at.y;
  }
  spr.userData.born = performance.now();
  spr.userData.life = life;
  spr.userData.frames = frames;
  spr.userData.frameI = 0;
  spr.userData.nextFrame = performance.now() + life / frames.length;
  host.add(spr);
  ACTIVE_FX.add(spr);
  disposeLater(spr, life + 40, host);
}

/**
 * Motif có sheet/recipe RIÊNG — thắng flash generic (vd tiger ≠ orange/fireball).
 * slash / arcane / heal / buff / shadow: giữ flash chi tiết trong data (white/crimson/…).
 */
export const MOTIF_DEDICATED_FLASH: Record<string, string> = {
  tiger: "tiger",
  wolf: "wolf",
  whirlwind: "whirlwind",
  dragon: "dragon",
  snake: "snake",
  poison: "green_poison",
  fire: "fire_rain",
  thunder: "thunder",
  water: "blue_water",
  bagua: "bagua",
  shield: "gold_soft",
};

/** Fallback khi thiếu flash */
export const MOTIF_FALLBACK_FLASH: Record<string, string> = {
  ...MOTIF_DEDICATED_FLASH,
  slash: "steel",
  arcane: "blue",
  heal: "gold_soft",
  buff: "gold_soft",
  shadow: "purple",
};

/** @deprecated dùng MOTIF_DEDICATED_FLASH — giữ alias */
export const MOTIF_TO_FLASH = MOTIF_FALLBACK_FLASH;

/** Motif dedicated thắng; còn lại ưu tiên flash data. */
export function resolveFxKey(flash?: string | null, motif?: string | null): string {
  const m = (motif || "").trim();
  const f = (flash || "").trim();
  if (m && MOTIF_DEDICATED_FLASH[m]) return MOTIF_DEDICATED_FLASH[m];
  if (f) return f;
  if (m && MOTIF_FALLBACK_FLASH[m]) return MOTIF_FALLBACK_FLASH[m];
  return "gold";
}

function sheetForFlash(flash: string): string[] {
  // Hổ — gầm (shockwave); claw dùng overlay riêng
  if (flash === "tiger") return TEX.tigerRoar.length ? TEX.tigerRoar : TEX.slashFire;
  // Hỏa / ultimate — forge ember + fire-wrath
  if (flash === "fire_rain" || flash === "red_fire")
    return TEX.forgeEmber.length ? TEX.forgeEmber : TEX.fireWrath;
  if (flash === "fire_green") return TEX.forgeNature.length ? TEX.forgeNature : TEX.poison;
  if (flash === "fire" || flash === "orange")
    return TEX.forgeEmber.length ? TEX.forgeEmber : TEX.fireballSpell;
  // Sét / kim quang
  if (flash === "thunder") return TEX.forgeStorm.length ? TEX.forgeStorm : TEX.thunderSpell;
  if (flash === "gold" || flash === "gold_soft" || flash === "gold_pierce" || flash === "yellow" || flash === "yellow_cult" || flash === "pure")
    return TEX.forgeRadiance.length ? TEX.forgeRadiance : TEX.pure;
  // Lốc / gió
  if (flash === "wind" || flash === "whirlwind")
    return TEX.whirlwind.length ? TEX.whirlwind : TEX.water;
  // Thủy / băng — forge tide / frost
  if (flash === "blue_water" || flash === "cyan" || flash === "teal" || flash === "white_blue")
    return TEX.forgeTide.length ? TEX.forgeTide : TEX.water.length ? TEX.water : TEX.kenneyAura;
  if (flash === "frost" || flash === "ice") return TEX.forgeFrost.length ? TEX.forgeFrost : TEX.forgeFrostAura;
  // Sói
  if (flash === "wolf") return TEX.wolf.length ? TEX.wolf : TEX.blood;
  // Huyết / son
  if (flash === "crimson" || flash === "dark_red" || flash === "red" || flash === "gold_red")
    return TEX.forgeBlood.length ? TEX.forgeBlood : TEX.blood;
  // Độc / rắn / rồng (wiki chiêu cao)
  if (flash === "green_poison" || flash === "poison")
    return TEX.forgeNature.length ? TEX.forgeNature : TEX.poison;
  if (flash === "snake") return TEX.snake;
  if (flash === "dragon") return TEX.dragon;
  // Bát quái / thần / ám — forge arcane / shadow
  if (flash === "bagua") return TEX.forgeArcane.length ? TEX.forgeArcane : TEX.magic;
  if (flash === "purple" || flash === "violet")
    return TEX.forgeShadow.length ? TEX.forgeShadow : TEX.magic;
  // Kỵ xung kích
  if (flash === "charge") return TEX.whirlwind.length ? TEX.whirlwind : TEX.earth;
  if (flash === "rush") return TEX.slashClassic.length ? TEX.slashClassic : TEX.slash;
  if (flash === "shield") return TEX.forgeWard.length ? TEX.forgeWard : TEX.circle.length ? TEX.circle : TEX.pure;
  // Vật lý / thép / đất
  if (flash === "brown") return TEX.forgeEarth.length ? TEX.forgeEarth : TEX.slashClassic;
  if (flash === "white" || flash === "steel" || flash === "iron" || flash === "silver" || flash === "chain")
    return TEX.slashClassic;
  if (flash === "blue") return TEX.forgeArcane.length ? TEX.forgeArcane : TEX.slashBlue;
  return TEX.kenneyAura;
}

/** Slash sheet theo flash (physical cut / tier màu) */
function slashSheetForFlash(flash: string): string[] {
  if (flash === "crimson" || flash === "red" || flash === "gold_red" || flash === "orange" || flash === "fire_rain")
    return TEX.slashFire;
  if (flash === "purple" || flash === "violet" || flash === "dark_red" || flash === "bagua") return TEX.slashPurple;
  if (flash === "blue" || flash === "cyan" || flash === "blue_water" || flash === "white_blue" || flash === "teal")
    return TEX.slashBlue;
  // Độc / rắn — dùng sheet độc (không classic trắng)
  if (flash === "green_poison" || flash === "poison" || flash === "snake" || flash === "fire_green")
    return TEX.poison.length ? TEX.poison : TEX.slashBlue;
  if (flash === "dragon") return TEX.dragon.length ? TEX.dragon : TEX.slashFire;
  if (flash === "thunder") return TEX.thunderSpell.length ? TEX.thunderSpell : TEX.slashPurple;
  if (flash === "wind" || flash === "whirlwind")
    return TEX.whirlwind.length ? TEX.whirlwind : TEX.slashBlue;
  if (flash === "tiger") return TEX.tigerRoar.length ? TEX.tigerRoar : TEX.slashFire;
  if (flash === "wolf") return TEX.wolf.length ? TEX.wolf : TEX.slashFire;
  return TEX.slashClassic.length ? TEX.slashClassic : TEX.slash;
}

function auraTint(flash: string): number {
  if (flash === "green_poison" || flash === "poison" || flash === "snake" || flash === "fire_green") return 0x4ade80;
  if (flash === "dragon") return 0xffb347;
  if (flash === "tiger") return 0xfbbf24;
  if (flash === "thunder") return 0xc4b5fd;
  if (flash === "blue" || flash === "cyan" || flash === "blue_water" || flash === "teal" || flash === "white_blue")
    return 0x7dd3fc;
  if (flash === "wind" || flash === "whirlwind") return 0xa7f3d0;
  if (flash === "crimson" || flash === "red" || flash === "gold_red" || flash === "wolf") return 0xfca5a5;
  if (flash === "purple" || flash === "violet" || flash === "bagua" || flash === "dark_red") return 0xc4b5fd;
  if (flash === "gold_soft" || flash === "pure" || flash === "gold" || flash === "yellow" || flash === "yellow_cult" || flash === "gold_pierce")
    return 0xfde68a;
  if (flash === "fire_rain" || flash === "red_fire" || flash === "orange" || flash === "fire") return 0xfb923c;
  if (flash === "charge" || flash === "brown") return 0xd4b896;
  if (flash === "rush") return 0xe2e8f0;
  if (flash === "shield") return 0xffe08a;
  return 0xffe8a0;
}

type AuraRecipe = {
  main: string[];
  mainSize?: number;
  mainLife?: number;
  mainY?: number;
  mainColor?: number;
  overlay?: string[];
  overlaySize?: number;
  overlayLife?: number;
  overlayY?: number;
  overlayColor?: number;
  ground?: string[];
  groundSize?: number;
  groundColor?: number;
  footSize?: number;
};

/**
 * Recipe VFX — `mainY`/`overlayY` là lệch so với ngực thủ lĩnh (thường 0…0.15).
 * Size gọn quanh tướng, không phủ nửa sân.
 */
function auraRecipe(flash: string): AuraRecipe {
  switch (flash) {
    case "tiger":
      return {
        main: TEX.tigerRoar.length ? TEX.tigerRoar : TEX.slashFire,
        mainSize: 1.55,
        mainLife: 620,
        mainY: 0.05,
        mainColor: 0xfbbf24,
        overlay: TEX.tigerClaw.length ? TEX.tigerClaw : TEX.slashFire,
        overlaySize: 1.35,
        overlayLife: 500,
        overlayY: 0.1,
        overlayColor: 0xfdba74,
        ground: TEX.tigerSlam.length ? TEX.tigerSlam : TEX.earth,
        groundSize: 1.25,
        groundColor: 0xf59e0b,
        footSize: 0.85,
      };
    case "wolf":
      return {
        main: TEX.wolf.length ? TEX.wolf : TEX.blood,
        mainSize: 1.5,
        mainLife: 580,
        mainY: 0.05,
        mainColor: 0xb0b0b0,
        overlay: TEX.slashFire,
        overlaySize: 1.2,
        overlayLife: 440,
        overlayY: 0.08,
        overlayColor: 0xfca5a5,
        ground: TEX.earth,
        groundSize: 1.1,
        groundColor: 0x94a3b8,
        footSize: 0.8,
      };
    case "whirlwind":
    case "wind":
      return {
        main: TEX.whirlwind.length ? TEX.whirlwind : TEX.water,
        mainSize: 1.45,
        mainLife: 600,
        mainY: 0.05,
        mainColor: 0xa7f3d0,
        overlay: TEX.kenneyAura,
        overlaySize: 1.1,
        overlayLife: 460,
        overlayY: 0,
        overlayColor: 0x6ee7b7,
        footSize: 0.85,
      };
    case "dragon":
      return {
        main: TEX.dragon,
        mainSize: 1.7,
        mainLife: 640,
        mainY: 0.1,
        mainColor: 0xffb347,
        overlay: TEX.fireWrath,
        overlaySize: 1.35,
        overlayLife: 500,
        overlayY: 0.05,
        overlayColor: 0xff8844,
        footSize: 0.9,
      };
    case "snake":
      return {
        main: TEX.snake.length ? TEX.snake : TEX.poison,
        mainSize: 1.4,
        mainLife: 540,
        mainY: 0.05,
        mainColor: 0x4ade80,
        overlay: TEX.poison,
        overlaySize: 1.15,
        overlayLife: 440,
        overlayY: 0.08,
        overlayColor: 0x86efac,
        ground: TEX.circle.length ? TEX.circle : TEX.poison,
        groundColor: 0x22c55e,
        footSize: 0.8,
      };
    case "green_poison":
    case "poison":
    case "fire_green":
      return {
        main: TEX.poison,
        mainSize: 1.45,
        mainLife: 560,
        mainY: 0.05,
        // Xanh độc bão hòa (additive × grayscale → rõ lá/chanh)
        mainColor: 0x4ade80,
        overlay: TEX.poison,
        overlaySize: 1.15,
        overlayLife: 460,
        overlayY: 0.08,
        overlayColor: 0xa3e635,
        ground: TEX.circle.length ? TEX.circle : TEX.poison,
        groundSize: 1.05,
        groundColor: 0x22c55e,
        footSize: 0.8,
      };
    case "fire_rain":
    case "red_fire":
      return {
        main: TEX.fireWrath,
        mainSize: 1.65,
        mainLife: 620,
        mainY: 0.08,
        mainColor: 0xfb923c,
        overlay: TEX.fireballSpell,
        overlaySize: 1.2,
        overlayLife: 480,
        overlayY: 0.12,
        overlayColor: 0xff8844,
        ground: TEX.earth,
        groundSize: 1.15,
        groundColor: 0xea580c,
        footSize: 0.85,
      };
    case "fire":
    case "orange":
      return {
        main: TEX.fireballSpell,
        mainSize: 1.35,
        mainLife: 520,
        mainY: 0.08,
        mainColor: 0xfb923c,
        overlay: TEX.fire,
        overlaySize: 1.05,
        overlayLife: 400,
        overlayY: 0.05,
        overlayColor: 0xfed7aa,
        footSize: 0.75,
      };
    case "thunder":
      return {
        main: TEX.thunderSpell,
        mainSize: 1.55,
        mainLife: 560,
        mainY: 0.15,
        mainColor: 0xc4b5fd,
        overlay: TEX.hit,
        overlaySize: 1.05,
        overlayLife: 400,
        overlayY: 0.05,
        overlayColor: 0xe9d5ff,
        footSize: 0.8,
      };
    case "blue_water":
    case "cyan":
    case "teal":
    case "white_blue":
      return {
        main: TEX.water.length ? TEX.water : TEX.kenneyAura,
        mainSize: 1.4,
        mainLife: 560,
        mainY: 0.05,
        mainColor: 0x7dd3fc,
        overlay: TEX.slashBlue,
        overlaySize: 1.15,
        overlayLife: 420,
        overlayY: 0.08,
        overlayColor: 0x38bdf8,
        footSize: 0.8,
      };
    case "bagua":
      return {
        main: TEX.magic,
        mainSize: 1.55,
        mainLife: 620,
        mainY: 0.05,
        mainColor: 0xfde047,
        overlay: TEX.hit,
        overlaySize: 1.15,
        overlayLife: 480,
        overlayY: 0.05,
        overlayColor: 0x67e8f9,
        footSize: 0.9,
      };
    case "purple":
    case "violet":
    case "dark_red":
      return {
        main: TEX.magic,
        mainSize: 1.35,
        mainLife: 540,
        mainY: 0.05,
        mainColor: 0xc4b5fd,
        overlay: TEX.slashPurple,
        overlaySize: 1.15,
        overlayLife: 420,
        overlayY: 0.08,
        overlayColor: 0xa78bfa,
        footSize: 0.75,
      };
    case "gold_soft":
    case "pure":
    case "gold":
    case "yellow":
    case "yellow_cult":
      // Khiên / buff — hào quang ôm ngực thủ lĩnh + chân
      return {
        main: TEX.kenneyAura,
        mainSize: 1.35,
        mainLife: 720,
        mainY: 0.02,
        mainColor: 0xffe8a0,
        overlay: TEX.pure.length ? TEX.pure : TEX.kenneyAura,
        overlaySize: 1.05,
        overlayLife: 580,
        overlayY: 0.04,
        overlayColor: 0xfff3c4,
        footSize: 0.9,
      };
    case "gold_pierce":
      return {
        main: TEX.pure,
        mainSize: 1.35,
        mainLife: 500,
        mainY: 0.05,
        mainColor: 0xfde68a,
        overlay: TEX.slash,
        overlaySize: 1.1,
        overlayLife: 380,
        overlayY: 0.05,
        overlayColor: 0xfef3c7,
        footSize: 0.75,
      };
    case "crimson":
    case "red":
    case "gold_red":
      return {
        main: TEX.blood,
        mainSize: 1.4,
        mainLife: 540,
        mainY: 0.05,
        mainColor: 0xfca5a5,
        overlay: TEX.slashFire,
        overlaySize: 1.2,
        overlayLife: 420,
        overlayY: 0.08,
        overlayColor: 0xfb7185,
        footSize: 0.8,
      };
    case "blue":
      return {
        main: TEX.slashBlue,
        mainSize: 1.3,
        mainLife: 500,
        mainY: 0.05,
        mainColor: 0x7dd3fc,
        overlay: TEX.magic,
        overlaySize: 1.0,
        overlayLife: 380,
        overlayY: 0.05,
        overlayColor: 0x38bdf8,
        footSize: 0.75,
      };
    case "charge":
      // Kỵ xung kích — bụi + đất + gió (không slash kiếm)
      return {
        main: TEX.whirlwind,
        mainSize: 1.55,
        mainLife: 520,
        mainY: 0.08,
        mainColor: 0xe8d4b0,
        overlay: TEX.earth,
        overlaySize: 1.35,
        overlayLife: 480,
        overlayY: 0.02,
        overlayColor: 0xc4a070,
        ground: TEX.dirt,
        groundColor: 0xb8956a,
        footSize: 1.05,
      };
    case "rush":
      // Đột kích thương/bộ — vệt đâm thép
      return {
        main: TEX.slashClassic.length ? TEX.slashClassic : TEX.slash,
        mainSize: 1.45,
        mainLife: 420,
        mainY: 0.06,
        mainColor: 0xe2e8f0,
        overlay: TEX.muzzle,
        overlaySize: 1.15,
        overlayLife: 360,
        overlayY: 0.08,
        overlayColor: 0xffe8c8,
        ground: TEX.dirt,
        groundColor: 0xc4a882,
        footSize: 0.85,
      };
    case "shield":
      // Thiết Bích — vòng khiên vàng ôm tướng
      return {
        main: TEX.circle.length ? TEX.circle : TEX.kenneyAura,
        mainSize: 1.85,
        mainLife: 900,
        mainY: 0.15,
        mainColor: 0xffe08a,
        overlay: TEX.light.length ? TEX.light : TEX.pure,
        overlaySize: 1.45,
        overlayLife: 780,
        overlayY: 0.2,
        overlayColor: 0xfff3c4,
        ground: TEX.pure.length ? TEX.pure : TEX.kenneyAura,
        groundColor: 0xfde68a,
        footSize: 1.15,
      };
    case "white":
    case "steel":
    case "iron":
    case "silver":
    case "chain":
    case "brown":
    default:
      return {
        main: sheetForFlash(flash),
        mainSize: 1.3,
        mainLife: 480,
        mainY: 0.05,
        mainColor: auraTint(flash),
        overlay: TEX.slash,
        overlaySize: 1.05,
        overlayLife: 340,
        overlayY: 0.08,
        overlayColor: 0xffe8c8,
        footSize: 0.7,
      };
  }
}

/**
 * Aura chiêu trên tướng thí triển.
 * `attach` = root cụm lính → FX local theo thủ lĩnh, đi theo lunge.
 * Không truyền attach → dùng `at` world (tương thích cũ).
 */
/** Scale S/M/L từ skill-design — mọi chiêu dùng chung */
export function fxScaleMul(scale?: string | null): number {
  if (scale === "L") return 1.38;
  if (scale === "S") return 0.88;
  return 1.12; // M hơi lớn hơn cũ cho cảm giác “xịn”
}

export type SkillAuraAttach = { root: THREE.Object3D; leader: THREE.Object3D };
export type SkillAuraOpts = {
  scale?: string | null;
  /** Phase: windup nhỏ hơn, cast/emission full */
  phase?: "windup" | "cast" | "emission" | "full";
};

export function spawnSkillAura(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash: string,
  _now: number,
  attach?: SkillAuraAttach,
  opts?: SkillAuraOpts
): void {
  const r = auraRecipe(flash);
  const tint = r.mainColor ?? auraTint(flash);
  const body = { yMode: "abs" as const };
  const mul = fxScaleMul(opts?.scale);
  const phase = opts?.phase || "full";
  const phaseMul = phase === "windup" ? 0.55 : phase === "cast" ? 0.85 : 1;
  const sm = mul * phaseMul;

  // Local ngực thủ lĩnh (sprite center chân → +Y ngực)
  const chestLocal = attach
    ? new THREE.Vector3(attach.leader.position.x, 0.48, attach.leader.position.z)
    : at.clone();
  const parent = attach?.root;

  // Size giữ vừa ngực tướng — tránh aura che nửa sân
  const mainSz = Math.min(1.45, (r.mainSize ?? 1.35) * sm);
  void playSheet(scene, chestLocal, r.main, {
    size: mainSz,
    life: Math.round((r.mainLife ?? 480) * (phase === "windup" ? 0.7 : 1)),
    y: r.mainY ?? 0,
    color: tint,
    parent,
    ...body,
  });
  if (r.overlay?.length && phase !== "windup") {
    void playSheet(scene, chestLocal, r.overlay, {
      size: Math.min(1.2, (r.overlaySize ?? 1.05) * sm),
      life: Math.round((r.overlayLife ?? 400) * 1.05),
      y: r.overlayY ?? 0.05,
      color: r.overlayColor ?? tint,
      parent,
      ...body,
    });
  }
  const footLocal = attach
    ? new THREE.Vector3(attach.leader.position.x, 0.07, attach.leader.position.z)
    : at.clone().setY(0.07);
  if (r.ground?.length && phase !== "windup") {
    void playSheet(scene, footLocal, r.ground, {
      size: (r.groundSize ?? 1.2) * sm,
      life: 520,
      y: 0,
      color: r.groundColor ?? tint,
      yMode: "abs",
      parent,
    });
  }
  void playSheet(scene, footLocal, TEX.kenneyAura, {
    size: (r.footSize ?? 0.9) * sm,
    life: phase === "windup" ? 280 : 440,
    y: 0,
    color: tint,
    yMode: "abs",
    parent,
  });
}

/** Tụ khí trước chiêu — mọi skill */
export function spawnSkillWindup(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const tint = auraTint(flash);
  void playSheet(scene, at, TEX.light.length ? TEX.light : TEX.kenneyAura, {
    size: 0.85 * mul,
    life: 320,
    y: 0.55,
    color: tint,
  });
  void playSheet(scene, at, TEX.circle.length ? TEX.circle : TEX.kenneyAura, {
    size: 0.65 * mul,
    life: 280,
    y: 0.35,
    color: tint,
  });
}

/** Impact premium theo flash — dùng cho mọi chiêu lúc phase impact */
export function spawnPremiumImpact(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const r = auraRecipe(flash);
  const tint = r.overlayColor ?? r.mainColor ?? auraTint(flash);
  const main = r.overlay?.length ? r.overlay : r.main;
  void playSheet(scene, at, main, {
    size: Math.min(2.4, (r.overlaySize ?? r.mainSize ?? 1.5) * 0.95 * mul),
    life: 520,
    y: 0.75,
    color: tint,
  });
  void playSheet(scene, at, r.ground?.length ? r.ground : TEX.earth, {
    size: 1.45 * mul,
    life: 480,
    y: 0.28,
    color: r.groundColor ?? tint,
  });
  void playSheet(scene, at, TEX.hit, {
    size: 1.05 * mul,
    life: 360,
    y: 0.65,
    color: tint,
  });
  // Lớp 2 trễ nhẹ — đọc được “nổ”
  afterFx(70, () => {
    if (!scene) return;
    void playSheet(scene, at, TEX.muzzle.length ? TEX.muzzle : TEX.hit, {
      size: 1.25 * mul,
      life: 300,
      y: 0.55,
      color: tint,
    });
  });
}

/** Quả cầu lửa / đạn pháp bay từ caster → mục tiêu (Kenney flame / light) */
function projectileFrames(flash: string): string[] {
  if (flash === "tiger" && TEX.tigerClaw.length) return TEX.tigerClaw;
  if (flash === "wolf" && TEX.wolf.length) return TEX.wolf;
  if (flash === "whirlwind" || flash === "wind")
    return TEX.whirlwind.length ? TEX.whirlwind : sheetForFlash(flash);
  if (flash === "dragon") return TEX.dragon;
  if (flash === "fire_rain" || flash === "red_fire" || flash === "fire" || flash === "orange")
    return TEX.fireballSpell;
  if (flash === "thunder") return TEX.thunderSpell;
  if (flash === "blue_water" || flash === "cyan" || flash === "teal" || flash === "white_blue")
    return TEX.water.length ? TEX.water : sheetForFlash(flash);
  if (flash === "green_poison" || flash === "poison" || flash === "snake") return TEX.poison;
  return sheetForFlash(flash);
}

/**
 * Sprite bay từ→đến, animate frames — dùng cho rồng / đạn pháp (skillFxLibrary).
 */
export function spawnFlyingFx(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  frames: string[],
  opts: {
    size?: number;
    life?: number;
    color?: number;
    arc?: number;
    side?: number;
    frameMs?: number;
    now?: number;
  } = {}
): void {
  if (!frames.length) return;
  const size = opts.size ?? 1.2;
  const life = opts.life ?? 480;
  const now = opts.now ?? performance.now();
  const tint = opts.color ?? 0xffffff;
  const yFrom = Math.max(from.y, 0.7);
  const yTo = Math.max(to.y, 0.65);
  void loadTex(frames[0]).then((tex) => {
    const spr = makeSprite(tex, size, tint) as FxSprite;
    spr.position.set(from.x, yFrom, from.z);
    spr.userData.born = now;
    spr.userData.life = life;
    spr.userData.frames = frames;
    spr.userData.frameI = 0;
    spr.userData.nextFrame = now + (opts.frameMs ?? Math.max(40, life / frames.length));
    spr.userData.flightFrom = new THREE.Vector3(from.x, yFrom, from.z);
    spr.userData.flightTo = new THREE.Vector3(to.x, yTo, to.z);
    spr.userData.baseSize = size;
    spr.userData.flightArc = opts.arc ?? 0.35;
    spr.userData.flightSide = opts.side ?? 0;
    spr.renderOrder = 48;
    scene.add(spr);
    ACTIVE_FX.add(spr);
    disposeLater(spr, life + 60, scene);
  });
}

export function spawnSkillProjectile(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  flash: string,
  now: number
): void {
  const frames = projectileFrames(flash);
  const tint = auraTint(flash);
  const big =
    flash === "tiger" ||
    flash === "dragon" ||
    flash === "wolf" ||
    flash === "fire_rain" ||
    flash === "bagua";
  spawnFlyingFx(scene, from, to, frames, {
    size: big ? (flash === "dragon" ? 2.2 : 1.15) : 0.95,
    life: flash === "dragon" ? 520 : 420,
    color: tint,
    arc: flash === "dragon" ? 0.55 : 0.35,
    frameMs: flash === "dragon" ? 48 : 70,
    now,
  });
  const mid = from.clone().lerp(to, 0.45);
  void playSheet(scene, mid, ["assets/fx/particles/flare_01.png", "assets/fx/particles/trace_01.png"], {
    size: 0.9,
    life: 280,
    y: 0.95,
    color: tint,
  });
}

/** Impact tại mục tiêu — 2 layer theo recipe (tránh chồng 3 sheet hộp đen). */
function spawnImpactAt(scene: THREE.Scene, to: THREE.Vector3, flash: string): void {
  const r = auraRecipe(flash);
  const impactMain = r.overlay?.length ? r.overlay : r.main;
  void playSheet(scene, to, impactMain, {
    size: Math.min(1.9, (r.overlaySize ?? r.mainSize ?? 1.6) * 0.85),
    life: 460,
    y: 0.85,
    color: r.overlayColor ?? r.mainColor ?? auraTint(flash),
  });
  const ground = r.ground?.length ? r.ground : TEX.earth;
  void playSheet(scene, to, ground, {
    size: 1.35,
    life: 400,
    y: 0.35,
    color: r.groundColor ?? auraTint(flash),
  });
}

export function spawnSkillBeam(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  flash: string,
  now: number
): void {
  spawnSkillProjectile(scene, from, to, flash, now);
  afterFx(280, () => spawnImpactAt(scene, to, flash));
}

/** Icon trạng thái bay trên đầu cụm (wiki skill buff/debuff) — pop khi apply */
export function spawnStatusOrb(
  scene: THREE.Scene,
  at: THREE.Vector3,
  kind: "buff" | "debuff" = "debuff"
): void {
  const frames =
    kind === "buff"
      ? ["assets/fx/particles/magic_02.png", "assets/fx/particles/star_01.png"]
      : ["assets/fx/arcane/Arcane_Effect_3.png", "assets/fx/arcane/Arcane_Effect_5.png"];
  void playSheet(scene, at, frames, {
    size: 0.55,
    life: 1400,
    y: 1.55,
    color: kind === "buff" ? 0xfbbf24 : 0xc084fc,
  });
}

type StatusMarkSpec = {
  id: string;
  kind: "buff" | "debuff" | "control";
  icon?: string | null;
};

/** Texture + tint — ưu tiên icon wiki local (mờ trên đầu); fallback particle */
function statusMarkStyle(st: StatusMarkSpec): {
  url: string;
  color: number;
  size: number;
  opacity: number;
  additive: boolean;
} {
  const id = st.id;
  const kind = st.kind;
  // Icon wiki hieu-ung đã tải về assets/ui/status — mờ, không additive
  if (st.icon && !/^https?:\/\//i.test(st.icon)) {
    return { url: st.icon, color: 0xffffff, size: 0.32, opacity: 0.55, additive: false };
  }
  if (id === "def_up" || id === "thiet_bich")
    return { url: "assets/fx/particles/light_02.png", color: 0xfde68a, size: 0.34, opacity: 0.45, additive: true };
  if (id === "atk_up")
    return { url: "assets/fx/particles/star_01.png", color: 0xfbbf24, size: 0.32, opacity: 0.45, additive: true };
  if (id === "poison")
    return { url: "assets/fx/particles/magic_03.png", color: 0xa3e635, size: 0.3, opacity: 0.45, additive: true };
  if (id === "burn")
    return { url: "assets/fx/particles/flame_01.png", color: 0xfb923c, size: 0.3, opacity: 0.45, additive: true };
  if (id === "silence")
    return { url: "assets/fx/particles/magic_04.png", color: 0xa78bfa, size: 0.3, opacity: 0.45, additive: true };
  if (id === "stun" || kind === "control")
    return { url: "assets/fx/particles/magic_05.png", color: 0xf472b6, size: 0.32, opacity: 0.45, additive: true };
  if (kind === "buff")
    return { url: "assets/fx/particles/magic_02.png", color: 0xfde68a, size: 0.3, opacity: 0.4, additive: true };
  return { url: "assets/fx/particles/magic_04.png", color: 0xc084fc, size: 0.3, opacity: 0.4, additive: true };
}

/**
 * Icon buff/debuff gắn trên đầu thủ lĩnh — giữ đến khi status hết
 * (Thiết Bích → def_up vàng trên đầu suốt lượt giáp).
 */
export function syncStatusMarkers(
  root: THREE.Object3D,
  leader: THREE.Object3D,
  statuses: StatusMarkSpec[]
): void {
  // Gỡ marker cũ
  const doomed: THREE.Object3D[] = [];
  root.children.forEach((ch) => {
    if (ch.name === "status-mark") doomed.push(ch);
  });
  doomed.forEach((ch) => {
    root.remove(ch);
    const sp = ch as THREE.Sprite;
    if (sp.material) (sp.material as THREE.SpriteMaterial).dispose();
  });

  const list = (statuses || []).slice(0, 3);
  const gen = ((root.userData.statusGen as number) || 0) + 1;
  root.userData.statusGen = gen;
  if (!list.length) return;

  const lx = leader.position.x;
  const lz = leader.position.z;
  const baseY = 0.98;
  list.forEach((st, i) => {
    const style = statusMarkStyle(st);
    void loadTex(style.url).then((tex) => {
      if (root.userData.statusGen !== gen) return;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: style.color,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: style.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        opacity: style.opacity,
      });
      const spr = new THREE.Sprite(mat);
      spr.name = "status-mark";
      spr.userData.statusId = st.id;
      spr.userData.baseSize = style.size;
      spr.center.set(0.5, 0.5);
      const ox = (i - (list.length - 1) / 2) * 0.26;
      spr.position.set(lx + ox, baseY, lz);
      spr.scale.set(style.size, style.size, 1);
      spr.renderOrder = 45;
      root.add(spr);
    });
  });
}

/** Nhịp thở nhẹ icon trạng thái trên đầu */
export function tickStatusMarkers(root: THREE.Object3D, now: number): void {
  root.children.forEach((ch) => {
    if (ch.name !== "status-mark") return;
    if (ch.userData.baseSize == null) ch.userData.baseSize = ch.scale.x;
    const pulse = 0.92 + 0.08 * Math.sin(now * 0.005 + ch.position.x * 3);
    ch.scale.setScalar((ch.userData.baseSize as number) * pulse);
  });
}

export function spawnSlashArc(
  scene: THREE.Scene,
  at: THREE.Vector3,
  toward: THREE.Vector3,
  _now: number,
  flash = "white"
): void {
  // Neo giữa caster→đích, cao ngực — tránh slash khổng lồ / lệch sàn
  const mid = at.clone().lerp(toward, 0.4);
  mid.y = Math.max(at.y, toward.y * 0.15 + 0.55, 0.65);
  const sheet = slashSheetForFlash(flash);
  const tint = auraTint(flash);
  void playSheet(scene, mid, sheet, { size: 1.35, life: 360, y: 0, yMode: "abs", color: tint });
  void playSheet(scene, mid, slashSheetForFlash(flash), {
    size: 1.05,
    life: 280,
    y: 0.08,
    yMode: "abs",
    color: tint,
  });
}

/**
 * Kỵ binh xung kích — bụi vó ngựa dọc đường tông + impact đất khi chạm địch.
 * Premium: nhiều bước + gió + nổ đất (scale S/M/L).
 */
export function spawnCavalryCharge(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  now: number,
  scale?: string | null
): void {
  const basic = scale === "S";
  const mul = basic ? 0.72 : fxScaleMul(scale);
  // Ít sprite hơn — tránh spike khi nhiều kỵ cùng đánh
  const steps = basic ? 3 : 5;
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.2) / steps;
    const p = from.clone().lerp(to, t);
    const delay = Math.round(i * (basic ? 32 : 42));
    afterFx(delay, () => {
      if (!scene) return;
      void playSheet(scene, p, TEX.dirt, {
        size: (0.8 + i * 0.12) * mul,
        life: basic ? 300 : 420,
        y: 0.12,
        color: 0xd2b48c,
      });
      if (!basic && i % 2 === 0) {
        void playSheet(scene, p, TEX.smoke, {
          size: (0.95 + i * 0.1) * mul,
          life: 480,
          y: 0.3,
          color: 0xe8dcc8,
        });
      }
      if (!basic && i === 2) {
        void playSheet(scene, p, TEX.whirlwind, {
          size: 1.5 * mul,
          life: 360,
          y: 0.42,
          color: 0xf5e6c8,
        });
      }
    });
  }
  if (!basic) {
    void playSheet(scene, from.clone().lerp(to, 0.12), TEX.whirlwind, {
      size: 1.75 * mul,
      life: 420,
      y: 0.5,
      color: 0xfff1d6,
    });
  }
  void playSheet(scene, from, TEX.muzzle, {
    size: (basic ? 0.85 : 1.25) * mul,
    life: basic ? 200 : 280,
    y: 0.34,
    color: 0xffe8c8,
  });
  afterFx(basic ? 140 : 200, () => {
    if (!scene) return;
    if (basic) {
      void playSheet(scene, to, TEX.dirt, { size: 1.05 * mul, life: 340, y: 0.16, color: 0xb8956a });
      void playSheet(scene, to, TEX.hit, { size: 0.9 * mul, life: 280, y: 0.55 });
      return;
    }
    void playSheet(scene, to, TEX.earth, { size: 2.1 * mul, life: 560, y: 0.32, color: 0xc9a070 });
    void playSheet(scene, to, TEX.muzzle, { size: 1.85 * mul, life: 400, y: 0.58, color: 0xffe8c8 });
    void playSheet(scene, to, TEX.whirlwind, { size: 2.0 * mul, life: 440, y: 0.55, color: 0xf5e6c8 });
  });
  void now;
}

export function spawnHitBurst(scene: THREE.Scene, at: THREE.Vector3): void {
  void playSheet(scene, at, TEX.hit, { size: 0.95, life: 360, y: 0.7 });
  void playSheet(scene, at, TEX.earth, { size: 1.0, life: 380, y: 0.45 });
}

/** Thiết Bích / hộ thể — vòng khiên vàng quanh caster (đọc được ngay). */
export function spawnShieldBarrier(
  scene: THREE.Scene,
  at: THREE.Vector3,
  _now: number,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  void playSheet(scene, at, TEX.circle.length ? TEX.circle : TEX.kenneyAura, {
    size: 2.25 * mul,
    life: 1100,
    y: 0.55,
    color: 0xffe08a,
  });
  void playSheet(scene, at, TEX.light.length ? TEX.light : TEX.pure, {
    size: 1.7 * mul,
    life: 920,
    y: 0.72,
    color: 0xfff7d6,
  });
  void playSheet(scene, at, TEX.pure.length ? TEX.pure : TEX.kenneyAura, {
    size: 1.4 * mul,
    life: 780,
    y: 0.35,
    color: 0xfde68a,
  });
  afterFx(260, () => {
    if (!scene) return;
    void playSheet(scene, at, TEX.circle.length ? TEX.circle : TEX.kenneyAura, {
      size: 1.95 * mul,
      life: 720,
      y: 0.5,
      color: 0xfbbf24,
    });
    void playSheet(scene, at, TEX.kenneyAura, {
      size: 1.15 * mul,
      life: 500,
      y: 0.8,
      color: 0xfffbeb,
    });
  });
}

/**
 * Đột kích thương/bộ — xông thẳng + vệt đâm (khác ngựa tông).
 */
export function spawnRushAssault(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  _now: number,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const mid = from.clone().lerp(to, 0.4);
  const mid2 = from.clone().lerp(to, 0.7);
  void playSheet(scene, from, TEX.dirt, { size: 0.95 * mul, life: 340, y: 0.12, color: 0xc4a882 });
  void playSheet(scene, mid, TEX.slashClassic.length ? TEX.slashClassic : TEX.slash, {
    size: 1.7 * mul,
    life: 400,
    y: 0.65,
    color: 0xe2e8f0,
  });
  void playSheet(scene, mid, TEX.muzzle, { size: 1.35 * mul, life: 320, y: 0.55, color: 0xffe8c8 });
  void playSheet(scene, mid2, TEX.slash, { size: 1.25 * mul, life: 300, y: 0.6, color: 0xf8fafc });
  afterFx(130, () => {
    if (!scene) return;
    void playSheet(scene, to, TEX.slash.length ? TEX.slash : TEX.hit, {
      size: 1.55 * mul,
      life: 400,
      y: 0.72,
      color: 0xffe8c8,
    });
    void playSheet(scene, to, TEX.earth, { size: 1.45 * mul, life: 440, y: 0.3, color: 0xc9a070 });
    void playSheet(scene, to, TEX.muzzle, { size: 1.35 * mul, life: 360, y: 0.55, color: 0xf8fafc });
    void playSheet(scene, to, TEX.hit, { size: 1.1 * mul, life: 320, y: 0.7, color: 0xffffff });
  });
}

/**
 * Hàng dọc — tia đâm theo cột (Lang Tuyền / Thương Long…):
 * vệt từ caster → từng mục tiêu trên cùng cột + motif sheet.
 */
export function spawnColumnStrike(
  scene: THREE.Scene,
  from: THREE.Vector3,
  targets: THREE.Vector3[],
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const r = auraRecipe(flash);
  const tint = r.mainColor ?? auraTint(flash);
  const sheet = r.main.length ? r.main : sheetForFlash(flash);
  const ordered = targets.slice().sort((a, b) => a.z - b.z);
  // Trục dọc sân: nhiều nút sáng nối caster → đích xa nhất
  const farthest = ordered[ordered.length - 1] || from;
  const steps = Math.max(4, Math.min(7, 3 + ordered.length));
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.15) / steps;
    const p = from.clone().lerp(farthest, t);
    afterFx(i * 45, () => {
      if (!scene) return;
      void playSheet(scene, p, sheet, {
        size: (1.05 + i * 0.08) * mul,
        life: 380 + i * 20,
        y: 0.55 + (i % 2) * 0.12,
        color: tint,
      });
      if (i % 2 === 0) {
        void playSheet(scene, p, TEX.hit, {
          size: 0.7 * mul,
          life: 280,
          y: 0.7,
          color: tint,
        });
      }
    });
  }
  ordered.forEach((to, i) => {
    afterFx(90 + i * 70, () => {
      if (!scene) return;
      spawnImpactAt(scene, to, flash);
      void playSheet(scene, to, slashSheetForFlash(flash), {
        size: 1.35 * mul,
        life: 360,
        y: 0.75,
        color: tint,
      });
    });
  });
}

/**
 * Hàng ngang — quét ngang hàng (vệt slash nối các mục tiêu).
 */
export function spawnRowSweep(
  scene: THREE.Scene,
  from: THREE.Vector3,
  targets: THREE.Vector3[],
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const r = auraRecipe(flash);
  const tint = r.mainColor ?? auraTint(flash);
  const midSheet = r.main.length ? r.main : slashSheetForFlash(flash);
  const edgeSheet = r.overlay?.length ? r.overlay : slashSheetForFlash(flash);
  const ordered = targets.slice().sort((a, b) => a.x - b.x);
  if (ordered.length >= 2) {
    const a = ordered[0];
    const b = ordered[ordered.length - 1];
    const mid = a.clone().lerp(b, 0.5);
    mid.y = Math.max(from.y, 0.7);
    void playSheet(scene, mid, midSheet, {
      size: (1.8 + ordered.length * 0.15) * mul,
      life: 420,
      y: 0,
      yMode: "abs",
      color: tint,
    });
    // Viền motif — giữ tint (không cream wash làm mất xanh độc / lam thủy)
    void playSheet(scene, mid, edgeSheet, {
      size: 1.4 * mul,
      life: 360,
      y: 0.05,
      yMode: "abs",
      color: r.overlayColor ?? tint,
    });
  }
  ordered.forEach((to, i) => {
    afterFx(i * 55, () => {
      if (!scene) return;
      spawnSlashArc(scene, from, to, performance.now(), flash);
      spawnImpactAt(scene, to, flash);
    });
  });
}

/**
 * Toàn địch — nổ vòng + mưa motif trên từng mục tiêu.
 */
export function spawnAoENova(
  scene: THREE.Scene,
  origin: THREE.Vector3,
  targets: THREE.Vector3[],
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const r = auraRecipe(flash);
  const tint = r.mainColor ?? auraTint(flash);
  void playSheet(scene, origin, TEX.circle.length ? TEX.circle : TEX.kenneyAura, {
    size: 2.4 * mul,
    life: 700,
    y: 0.35,
    color: tint,
  });
  void playSheet(scene, origin, r.main.length ? r.main : sheetForFlash(flash), {
    size: 1.8 * mul,
    life: 560,
    y: 0.65,
    color: tint,
  });
  targets.forEach((to, i) => {
    afterFx(40 + i * 50, () => {
      if (!scene) return;
      void playSheet(scene, to, r.overlay?.length ? r.overlay : TEX.hit, {
        size: 1.2 * mul,
        life: 440,
        y: 0.9,
        color: r.overlayColor ?? tint,
      });
      spawnImpactAt(scene, to, flash);
      // «mưa» motif — cùng tint, không cream wash
      void playSheet(scene, to, r.main.length ? r.main : TEX.hit, {
        size: 0.85 * mul,
        life: 360,
        y: 1.35,
        color: tint,
      });
    });
  });
}

/** Phe ta — hào quang trị liệu / buff vàng trên từng đồng minh. */
export function spawnAllyBless(
  scene: THREE.Scene,
  targets: THREE.Vector3[],
  flash: string,
  scale?: string | null
): void {
  const mul = fxScaleMul(scale);
  const tint = auraTint(flash);
  targets.forEach((to, i) => {
    afterFx(i * 60, () => {
      if (!scene) return;
      void playSheet(scene, to, TEX.circle.length ? TEX.circle : TEX.kenneyAura, {
        size: 1.55 * mul,
        life: 820,
        y: 0.4,
        color: tint,
      });
      void playSheet(scene, to, TEX.pure.length ? TEX.pure : TEX.kenneyAura, {
        size: 1.15 * mul,
        life: 700,
        y: 0.75,
        color: 0xfffbeb,
      });
      void playSheet(scene, to, TEX.hit, {
        size: 0.85 * mul,
        life: 480,
        y: 0.95,
        color: tint,
      });
    });
  });
}

/**
 * Emission theo pattern trận — bám mô tả «hàng dọc / ngang / toàn địch».
 */
export function spawnPatternEmission(
  scene: THREE.Scene,
  from: THREE.Vector3,
  targets: THREE.Vector3[],
  flash: string,
  pattern: string | null | undefined,
  scale?: string | null
): void {
  const pat = (pattern || "single").toLowerCase();
  if (!targets.length) {
    if (pat === "self" || pat === "ally_all") {
      spawnAllyBless(scene, [from], flash, scale);
    }
    return;
  }
  if (pat === "column") {
    spawnColumnStrike(scene, from, targets, flash, scale);
    return;
  }
  if (pat === "row" || pat === "front_row") {
    spawnRowSweep(scene, from, targets, flash, scale);
    return;
  }
  if (pat === "all") {
    spawnAoENova(scene, from, targets, flash, scale);
    return;
  }
  if (pat === "ally_all" || pat === "self") {
    spawnAllyBless(scene, targets.length ? targets : [from], flash, scale);
    return;
  }
  // single — beam / slash theo flash
  targets.forEach((to, i) => {
    afterFx(i * 40, () => {
      if (!scene) return;
      spawnSkillBeam(scene, from, to, flash, performance.now());
    });
  });
}

/** Animate sprite sheets + fade + đạn bay */
/** Xóa toàn bộ FX đang chạy (QA / đổi chiêu sạch khung hình) */
export function clearBattleVfx(scene?: THREE.Scene | null): void {
  fxEpoch++;
  const list = Array.from(ACTIVE_FX);
  ACTIVE_FX.clear();
  list.forEach((spr) => {
    if (!spr) return;
    if (spr.parent) spr.parent.remove(spr);
    else if (scene) scene.remove(spr);
    try {
      (spr.material as THREE.SpriteMaterial).dispose();
    } catch {
      /* ignore */
    }
  });
  if (scene) {
    const doomed: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Sprite).isSprite && (o as FxSprite).userData?.born != null) doomed.push(o);
    });
    doomed.forEach((o) => {
      o.parent?.remove(o);
      const mat = (o as THREE.Sprite).material as THREE.SpriteMaterial | undefined;
      try {
        mat?.dispose();
      } catch {
        /* ignore */
      }
    });
  }
}

export function tickBattleVfx(_scene: THREE.Scene, now: number, _dt: number): void {
  if (!ACTIVE_FX.size) return;
  ACTIVE_FX.forEach((ch) => {
    const spr = ch as FxSprite;
    if (!spr.parent) {
      ACTIVE_FX.delete(spr);
      return;
    }
    const frames = spr.userData.frames;
    if (frames && frames.length > 1 && now >= (spr.userData.nextFrame || 0)) {
      const i = Math.min((spr.userData.frameI || 0) + 1, frames.length - 1);
      spr.userData.frameI = i;
      spr.userData.nextFrame = now + (spr.userData.life || 400) / frames.length;
      // loadTex đã cache — sync map, không spam promise mỗi frame nếu đã có
      void loadTex(frames[i]).then((t) => {
        const mat = spr.material as THREE.SpriteMaterial;
        if (mat.map !== t) {
          mat.map = t;
          mat.needsUpdate = true;
        }
      });
    }
    const age = now - (spr.userData.born || now);
    const life = spr.userData.life || 400;
    const mat = spr.material as THREE.SpriteMaterial;
    const from = spr.userData.flightFrom;
    const to = spr.userData.flightTo;
    if (from && to) {
      const t = Math.min(1, age / life);
      const e = t * t * (3 - 2 * t);
      spr.position.lerpVectors(from, to, e);
      const arc = spr.userData.flightArc ?? 0.35;
      spr.position.y += Math.sin(t * Math.PI) * arc;
      const side = spr.userData.flightSide ?? 0;
      if (side) {
        // Lệch ngang vuông góc hướng bay — thân rắn uốn
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const len = Math.hypot(dx, dz) || 1;
        spr.position.x += (-dz / len) * Math.sin(t * Math.PI * 2) * side;
        spr.position.z += (dx / len) * Math.sin(t * Math.PI * 2) * side;
      }
      const base = spr.userData.baseSize || 0.95;
      const pulse = base * (1 + 0.18 * Math.sin(t * Math.PI * 2.5));
      spr.scale.set(pulse, pulse, 1);
      mat.opacity = t < 0.88 ? 1 : Math.max(0, 1 - (t - 0.88) / 0.12);
    } else {
      mat.opacity = Math.max(0, 1 - age / life);
      const s = spr.scale.x * (1 + 0.012);
      spr.scale.set(s, s, 1);
    }
  });
}

/** Prefetch sprites dùng trong trận */
export function prefetchBattleVfx(): void {
  const all = [
    ...TEX.slash,
    ...TEX.slashClassic,
    ...TEX.hit,
    ...TEX.fire,
    ...TEX.kenneyAura,
    TEX.fireWrath[0],
    TEX.blood[0],
    TEX.water[0],
    TEX.pure[0],
    TEX.thunderSpell[0],
    TEX.fireballSpell[0],
    TEX.magic[0],
    TEX.earth[0],
    TEX.dragon[0],
    TEX.snake[0],
    TEX.poison[0],
    TEX.whirlwind[0],
    TEX.wolf[0],
    TEX.tigerRoar[0],
    TEX.tigerClaw[0],
    TEX.tigerSlam[0],
  ];
  all.forEach((u) => void loadTex(u));
}
