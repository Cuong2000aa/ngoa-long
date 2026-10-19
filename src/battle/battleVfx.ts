import * as THREE from "three";

/**
 * VFX chiến trường — CHỈ dùng sprite CC0 (Kenney / Cethiel / Starsteel / SpritePilot).
 * Không tự vẽ geometry ring/beam.
 *
 * Nguồn:
 * - Kenney Particle Pack → assets/fx/particles/
 * - Cethiel Arcane / Earth / Fire-Wrath / Slash / Blood / Water / Pure
 * - Starsteel Spell Effects → assets/fx/skill/starsteel/
 *
 * Flash → sheet (wiki bậc Thường→Thần Hoàng):
 * - Thường / physical cut: slashClassic (Cethiel) + Kenney slash fallback
 * - Chiến (blue/cyan/steel): slashBlue / water / light
 * - Thần (purple/gold_red): slashPurple / pure / arcane
 * - Truyền thuyết (crimson/thunder): blood / thundersphere / fire-wrath
 * - Thần Hoàng (fire_rain/bagua): fireWrath + arcane + pure
 */

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
  poison: [
    "assets/fx/particles/magic_02.png",
    "assets/fx/arcane/Arcane_Effect_3.png",
    "assets/fx/arcane/Arcane_Effect_5.png",
    "assets/fx/particles/flare_01.png",
  ],
  /** Kenney đã có alpha — aura chân sạch, tránh LightEffect hộp đen */
  kenneyAura: [
    "assets/fx/particles/flare_01.png",
    "assets/fx/particles/magic_02.png",
    "assets/fx/particles/star_01.png",
  ],
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
        // Mọi FX sheet qua prepare (Kenney particles cũng nền đen đặc)
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

function disposeLater(obj: THREE.Object3D, ms: number, scene: THREE.Scene): void {
  setTimeout(() => {
    scene.remove(obj);
    obj.traverse((o) => {
      const sp = o as THREE.Sprite;
      if (sp.isSprite && sp.material) {
        // không dispose shared textures
        (sp.material as THREE.SpriteMaterial).dispose();
      }
    });
  }, ms);
}

async function playSheet(
  scene: THREE.Scene,
  at: THREE.Vector3,
  frames: string[],
  opts: { size?: number; life?: number; color?: number; y?: number } = {}
): Promise<void> {
  if (!frames.length) return;
  const size = opts.size ?? 1.6;
  const life = opts.life ?? 480;
  const tex = await loadTex(frames[0]);
  const spr = makeSprite(tex, size, opts.color ?? 0xffffff) as FxSprite;
  spr.position.copy(at);
  spr.position.y = (opts.y ?? 1.1) + at.y;
  spr.userData.born = performance.now();
  spr.userData.life = life;
  spr.userData.frames = frames;
  spr.userData.frameI = 0;
  spr.userData.nextFrame = performance.now() + life / frames.length;
  scene.add(spr);
  disposeLater(spr, life + 40, scene);
}

function sheetForFlash(flash: string): string[] {
  // Hỏa / ultimate
  if (flash === "fire_rain" || flash === "red_fire") return TEX.fireWrath;
  if (flash === "fire_green") return TEX.poison;
  if (flash === "fire" || flash === "orange") return TEX.fireballSpell;
  // Sét / kim quang
  if (flash === "thunder") return TEX.thunderSpell;
  if (flash === "gold" || flash === "gold_soft" || flash === "gold_pierce" || flash === "yellow" || flash === "yellow_cult" || flash === "pure")
    return TEX.pure;
  // Thủy / mưu lục-lam / lốc (whirlwind — dùng water sheet + tint gió cho đến khi có pack lốc)
  if (flash === "blue_water" || flash === "cyan" || flash === "teal" || flash === "white_blue" || flash === "wind" || flash === "whirlwind")
    return TEX.water.length ? TEX.water : TEX.kenneyAura;
  // Huyết / son / sói (wolf — blood sheet cho đến khi có sprite sói)
  if (flash === "crimson" || flash === "dark_red" || flash === "red" || flash === "gold_red" || flash === "wolf")
    return TEX.blood;
  // Độc / rắn / rồng (wiki chiêu cao)
  if (flash === "green_poison" || flash === "poison") return TEX.poison;
  if (flash === "snake") return TEX.snake;
  if (flash === "dragon") return TEX.dragon;
  // Bát quái / thần / ám
  if (flash === "bagua" || flash === "purple" || flash === "violet") return TEX.magic;
  // Vật lý / thép
  if (flash === "white" || flash === "steel" || flash === "iron" || flash === "silver" || flash === "chain" || flash === "brown")
    return TEX.slashClassic;
  if (flash === "blue") return TEX.slashBlue;
  return TEX.kenneyAura;
}

/** Slash sheet theo flash (physical cut / tier màu) */
function slashSheetForFlash(flash: string): string[] {
  if (flash === "crimson" || flash === "red" || flash === "gold_red" || flash === "orange" || flash === "fire_rain")
    return TEX.slashFire;
  if (flash === "purple" || flash === "violet" || flash === "dark_red") return TEX.slashPurple;
  if (flash === "blue" || flash === "cyan" || flash === "blue_water" || flash === "white_blue") return TEX.slashBlue;
  return TEX.slashClassic.length ? TEX.slashClassic : TEX.slash;
}

function auraTint(flash: string): number {
  if (flash === "green_poison" || flash === "poison" || flash === "snake" || flash === "fire_green") return 0x86efac;
  if (flash === "dragon") return 0xffb347;
  if (flash === "thunder") return 0xc4b5fd;
  if (flash === "blue" || flash === "cyan" || flash === "blue_water") return 0x7dd3fc;
  if (flash === "wind" || flash === "whirlwind") return 0xa7f3d0;
  if (flash === "crimson" || flash === "red" || flash === "gold_red" || flash === "wolf") return 0xfca5a5;
  if (flash === "gold_soft" || flash === "pure") return 0xfde68a;
  return 0xffe8a0;
}

export function spawnSkillAura(
  scene: THREE.Scene,
  at: THREE.Vector3,
  flash: string,
  _now: number
): void {
  const sheet = sheetForFlash(flash);
  const isUltimate =
    flash === "fire_rain" || flash === "bagua" || flash === "thunder" || flash === "dragon" || flash === "wolf";
  const tint = auraTint(flash);
  // 1 sheet chính + Kenney chân — không chồng LightEffect (gây viền vuông)
  void playSheet(scene, at, sheet, {
    size: isUltimate ? 2.6 : flash === "snake" || flash === "poison" || flash === "green_poison" || flash === "wind" || flash === "whirlwind" ? 2.0 : 1.85,
    life: isUltimate ? 700 : 520,
    y: flash === "dragon" || flash === "wolf" ? 1.15 : 0.9,
    color: tint,
  });
  if (flash === "dragon") {
    void playSheet(scene, at, TEX.fireWrath, { size: 2.2, life: 560, y: 0.85, color: 0xff8844 });
  }
  if (flash === "wolf") {
    void playSheet(scene, at, TEX.slashFire.length ? TEX.slashFire : TEX.slashClassic, {
      size: 2.0,
      life: 480,
      y: 1.0,
      color: 0x1a1a1a,
    });
  }
  if (flash === "wind" || flash === "whirlwind") {
    void playSheet(scene, at, TEX.kenneyAura, { size: 1.8, life: 560, y: 0.55, color: 0x6ee7b7 });
  }
  void playSheet(scene, at, TEX.kenneyAura, {
    size: 1.15,
    life: 420,
    y: 0.06,
    color: tint,
  });
}

/** Quả cầu lửa / đạn pháp bay từ caster → mục tiêu (Kenney flame / light) */
export function spawnSkillProjectile(
  scene: THREE.Scene,
  from: THREE.Vector3,
  to: THREE.Vector3,
  flash: string,
  now: number
): void {
  const frames = sheetForFlash(flash);
  void loadTex(frames[0]).then((tex) => {
    const spr = makeSprite(tex, 0.95, flash === "thunder" ? 0xc4b5fd : 0xffb347) as FxSprite;
    spr.position.copy(from);
    spr.position.y = 1.05;
    spr.userData.born = now;
    spr.userData.life = 420;
    spr.userData.frames = frames;
    spr.userData.frameI = 0;
    spr.userData.nextFrame = now + 70;
    spr.userData.flightFrom = from.clone().setY(1.05);
    spr.userData.flightTo = to.clone().setY(0.85);
    spr.userData.baseSize = 0.95;
    scene.add(spr);
    disposeLater(spr, 480, scene);
  });
  // Vệt giữa đường
  const mid = from.clone().lerp(to, 0.45);
  void playSheet(scene, mid, ["assets/fx/particles/flare_01.png", "assets/fx/particles/trace_01.png"], {
    size: 0.9,
    life: 280,
    y: 0.95,
    color: 0xffd27a,
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
  const sheet = sheetForFlash(flash);
  setTimeout(() => {
    void playSheet(scene, to, sheet, { size: 1.55, life: 420, y: 0.7 });
    void playSheet(scene, to, TEX.earth, { size: 1.35, life: 400, y: 0.4 });
    void playSheet(scene, to, TEX.hit, { size: 1.1, life: 360, y: 0.85 });
  }, 280);
}

/** Icon trạng thái bay trên đầu cụm (wiki skill buff/debuff) */
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

export function spawnSlashArc(
  scene: THREE.Scene,
  at: THREE.Vector3,
  _toward: THREE.Vector3,
  _now: number,
  flash = "white"
): void {
  const sheet = slashSheetForFlash(flash);
  void playSheet(scene, at, sheet, { size: 1.55, life: 360, y: 0.7 });
  // Kenney slash phụ — đọc được trên sân nhỏ
  void playSheet(scene, at, TEX.slash, { size: 1.15, life: 280, y: 0.85, color: 0xffe8c8 });
}

export function spawnHitBurst(scene: THREE.Scene, at: THREE.Vector3): void {
  void playSheet(scene, at, TEX.hit, { size: 0.95, life: 360, y: 0.7 });
  void playSheet(scene, at, TEX.earth, { size: 1.0, life: 380, y: 0.45 });
}

/** Animate sprite sheets + fade + đạn bay */
export function tickBattleVfx(scene: THREE.Scene, now: number, _dt: number): void {
  scene.children.forEach((ch) => {
    if (ch.name !== "fx-sprite") return;
    const spr = ch as FxSprite;
    const frames = spr.userData.frames;
    if (frames && frames.length > 1 && now >= (spr.userData.nextFrame || 0)) {
      const i = Math.min((spr.userData.frameI || 0) + 1, frames.length - 1);
      spr.userData.frameI = i;
      spr.userData.nextFrame = now + (spr.userData.life || 400) / frames.length;
      void loadTex(frames[i]).then((t) => {
        (spr.material as THREE.SpriteMaterial).map = t;
        (spr.material as THREE.SpriteMaterial).needsUpdate = true;
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
      spr.position.y += Math.sin(t * Math.PI) * 0.35;
      const base = spr.userData.baseSize || 0.95;
      const pulse = base * (1 + 0.25 * Math.sin(t * Math.PI * 3));
      spr.scale.set(pulse, pulse, 1);
      mat.opacity = t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15);
    } else {
      mat.opacity = Math.max(0, 1 - age / life);
      const s = spr.scale.x * (1 + 0.015);
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
  ];
  all.forEach((u) => void loadTex(u));
}
