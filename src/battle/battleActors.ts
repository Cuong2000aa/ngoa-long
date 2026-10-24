import * as THREE from "three";
import sheetsIndex from "../../assets/units/sheets/index.json";

/**
 * Unit chiến trường: sheet wiki (icon → attack 8×2).
 * index.json: types (loại×bậc) + byWikiId (từng binh chủng) + byTroopTier (pool skin).
 */

type SheetMeta = {
  sheet: string;
  cols: number;
  rows: number;
  kind: string;
  icon: string;
  name?: string;
  troop?: string;
  tier?: number;
  wikiId?: string;
  attackFrames?: number;
};

type SheetsFile = {
  schemaVersion?: number;
  types?: Record<string, Record<string, SheetMeta>>;
  byWikiId?: Record<string, SheetMeta>;
  byTroopTier?: Record<string, Record<string, string[]>>;
} & Record<string, unknown>;

const RAW = sheetsIndex as SheetsFile;
const BY_WIKI = RAW.byWikiId || {};

function typeTable(troop: string): Record<string, SheetMeta> | undefined {
  if (RAW.types?.[troop]) return RAW.types[troop];
  const flat = RAW[troop];
  if (flat && typeof flat === "object" && !Array.isArray(flat)) {
    return flat as Record<string, SheetMeta>;
  }
  return undefined;
}

function clampTier(tier: number | undefined): number {
  const n = tier == null ? 1 : Math.floor(tier);
  return Math.max(1, Math.min(6, n));
}

function typeMeta(troop: string, tier: number): SheetMeta {
  const table = typeTable(troop) || typeTable("infantry") || {};
  return table[String(tier)] || table["1"] || {
    sheet: `assets/units/sheets/infantry-t1.png`,
    cols: 8,
    rows: 2,
    kind: "wiki-derived",
    icon: `assets/units/battle/wiki-infantry-t1.png`,
  };
}

/**
 * Map art ổn định: wikiId → khớp tên wiki → đại diện loại×bậc.
 * Không random pool (tránh skin lệch / sprite vỡ).
 */
function resolveMeta(
  troop: string,
  tier: number,
  _seed: number,
  wikiId?: string | null,
  name?: string | null
): SheetMeta {
  if (wikiId && BY_WIKI[wikiId]) return BY_WIKI[wikiId];
  if (name) {
    const n = name.trim().toLowerCase();
    for (const m of Object.values(BY_WIKI)) {
      if (m.name && m.name.trim().toLowerCase() === n && m.troop === troop) return m;
    }
  }
  return typeMeta(troop, tier);
}

export function troopArtUrl(troop: string, tier = 1, seed = 0, wikiId?: string): string {
  const t = clampTier(tier);
  const kind = troop && typeTable(troop) ? troop : "infantry";
  const meta = resolveMeta(kind, t, seed, wikiId);
  return meta.icon || `assets/units/battle/wiki-${kind}-t${t}.png`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("img fail " + url));
    img.src = url;
  });
}

type Clip = { row: number; start: number; frames: number; fps: number; loop: boolean };

export const CLIPS_WIKI: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Sheet solo mặc định (fallback): idle tĩnh 1f, skill vận khí 4f, hit lùi thế 1f */
export const CLIPS_SOLO: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Bộ binh — chém xả dứt khoát 8 frames */
const CLIPS_INFANTRY: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Thương binh — nhấp nháy lùi rồi đâm thẳng cực nhanh 8 frames */
const CLIPS_SPEAR: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Kỵ binh — lướt vó ngựa vung đao dũng mãnh 8 frames */
const CLIPS_CAVALRY: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Cung thủ — kéo cung nhắm rồi buông tên 8 frames */
const CLIPS_ARCHER: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Mưu sĩ — vung quạt phất lệnh niệm thuật uyển chuyển 8 frames */
const CLIPS_STRATEGIST: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 10, loop: false },
  hit: { row: 1, start: 2, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 2, frames: 1, fps: 1, loop: false },
};

/** Hổ Báo Kỵ — kỵ binh tinh nhuệ bậc cao (tier >= 5) */
const CLIPS_HOBAO: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 16, loop: false },
  skill: { row: 1, start: 0, frames: 8, fps: 14, loop: false },
  hit: { row: 0, start: 1, frames: 1, fps: 8, loop: false },
  death: { row: 0, start: 1, frames: 1, fps: 1, loop: false },
};

/** Chọn bộ clip diễn hoạt tối ưu theo từng loại binh chủng */
function clipsForTroop(
  troop?: string,
  kind?: string,
  sheetPath?: string,
  meta?: SheetMeta
): Record<string, Clip> {
  if (kind === "hobao" || (sheetPath && sheetPath.includes("hobao"))) {
    return CLIPS_HOBAO;
  }
  let base: Record<string, Clip>;
  switch (troop) {
    case "spear":
      base = CLIPS_SPEAR;
      break;
    case "cavalry":
      base = CLIPS_CAVALRY;
      break;
    case "archer":
      base = CLIPS_ARCHER;
      break;
    case "strategist":
      base = CLIPS_STRATEGIST;
      break;
    case "infantry":
    default:
      base = CLIPS_INFANTRY;
      break;
  }
  const attackFrames =
    meta?.attackFrames || (meta?.cols && meta.cols > 8 ? meta.cols : base.attack.frames);
  const attackFps = attackFrames >= 12 ? 18 : base.attack.fps;
  if (attackFrames !== base.attack.frames) {
    return {
      ...base,
      attack: { ...base.attack, frames: attackFrames, fps: attackFps },
    };
  }
  return base;
}

/* ──────────────────────────────────────────────────────────────
 *  Swing profiles — xoay sprite quanh chân khi vung vũ khí.
 *  Âm = rút đà / giương vũ khí (lean away from enemy).
 *  Dương = vung chém / đâm tới (lean forward into swing).
 *  Sprite quay quanh tâm chân (0.5, 0) giữ chắc trên mặt đất.
 * ─────────────────────────────────────────────────────────────── */
const ATTACK_SWING: Record<string, number[]> = {
  /* Bộ binh: 8f — lùi đà giương đao → chém xả dứt khoát → thu đao */
  infantry:   [0, -0.04, -0.08,  0.08,  0.10,  0.05,  0.02, 0],
  /* Thương binh: 8f — rút giáo co lực → phóng đâm dứt khoát */
  spear:      [0, -0.04, -0.08,  0.08,  0.10,  0.04,  0.02, 0],
  /* Kỵ binh: 8f — vung đao từ lưng ngựa chém xuống */
  cavalry:    [0, -0.05, -0.10,  0.09,  0.12,  0.06,  0.02, 0],
  /* Cung thủ: 8f — ngả người kéo căng dây cung → buông tên bật nhẹ */
  archer:     [0, -0.03, -0.06,  0.04,  0.06,  0.02,  0,    0],
  /* Mưu sĩ: 8f — nâng quạt tụ phong → phất mạnh quạt ra chiêu */
  strategist: [0, -0.03, -0.06,  0.06,  0.08,  0.04,  0.01, 0],
};

/** Skill vận khí: 4f — tụ lực → bung tỏa hào quang. */
const SKILL_SWING: number[] = [-0.04, -0.08, 0.08, 0.02];

/** Base Y position of sprite (chân trên mặt đất, cố định không nảy). */
const SPRITE_BASE_Y = 0.02;

type SheetRuntime = {
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  cols: number;
  rows: number;
  fw: number;
  fh: number;
  clips: Record<string, Clip>;
  clip: Clip;
  playing: string;
  frame: number;
  acc: number;
  /** Wiki sheet mặc định nhìn TRÁI — true = lật canvas nhìn PHẢI (địch bên trái) */
  mirror: boolean;
  /** Cache key frame đã paint — tránh getImageData lặp khi idle */
  paintKey?: string;
};

function paintFrame(sh: SheetRuntime): void {
  const fi = Math.min(sh.frame, sh.clip.frames - 1);
  const col = sh.clip.start + fi;
  const key = `${sh.clip.row}:${col}:${sh.mirror ? 1 : 0}`;
  if (sh.paintKey === key) return;
  sh.paintKey = key;
  const { ctx, fw, fh } = sh;
  ctx.clearRect(0, 0, fw, fh);
  ctx.save();
  if (sh.mirror) {
    ctx.translate(fw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sh.img, col * fw, sh.clip.row * fh, fw, fh, 0, 0, fw, fh);
  ctx.restore();
  sh.tex.needsUpdate = true;
}

async function loadSheetFromMeta(meta: SheetMeta, troop?: string): Promise<SheetRuntime> {
  const url = meta.sheet.startsWith("assets/") ? meta.sheet : `assets/units/sheets/${meta.sheet}`;
  const img = await loadImage(url);
  let cols = meta.cols || 8;
  const rows = meta.rows || 2;
  const fh = Math.floor(img.naturalHeight / rows);
  let fw = Math.floor(img.naturalWidth / cols);
  // Các ô sheet trong Ngọa Long luôn vuông (fw == fh).
  // Nếu cols bị lệch làm rách frame (fw != fh), tự động sửa cols = naturalWidth / fh.
  if (fh > 0 && fw !== fh && img.naturalWidth % fh === 0) {
    cols = Math.round(img.naturalWidth / fh);
    fw = fh;
  }
  const canvas = document.createElement("canvas");
  canvas.width = fw;
  canvas.height = fh;
  const ctx = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const clips = clipsForTroop(troop || meta.troop, meta.kind, meta.sheet, meta);
  const sh: SheetRuntime = {
    img,
    canvas,
    ctx,
    tex,
    cols,
    rows,
    fw,
    fh,
    clips,
    clip: clips.idle,
    playing: "idle",
    frame: 0,
    acc: 0,
    mirror: false,
  };
  paintFrame(sh);
  return sh;
}

export type BattleActor = {
  root: THREE.Group;
  sprite: THREE.Sprite;
  mixer: { update: (dt: number) => void };
  current: string | null;
  troop: string;
  tier: number;
  baseScale: THREE.Vector2;
  sheet: SheetRuntime;
  members: THREE.Sprite[];
  enemy: boolean;
  /** true = đã lật canvas nhìn phải (địch); phe ta giữ nhìn trái */
  faceRight: boolean;
  /** -1 phe ta (sang trái) / +1 địch (sang phải) — hướng tới đối phương */
  toward: number;
};

/** 1 chủ lực / ô — ~70% size đợt trước (1.35 → 0.95) */
/** Chiều cao world sprite tướng — cân với VFX (trước 0.95 hơi nhỏ so với vòng/ấn) */
const SOLO_LEADER_H = 1.28;

export async function createBattleActor(
  troop: string | undefined,
  enemy: boolean,
  seed: number,
  name?: string,
  troopTier?: number,
  wikiId?: string | null
): Promise<BattleActor> {
  const kind = troop && typeTable(troop) ? troop : "infantry";
  const tier = clampTier(troopTier);
  const meta = resolveMeta(kind, tier, seed, wikiId, name);
  // Wiki mặc định nhìn TRÁI → quân ta (phải sân) giữ nguyên; địch (trái sân) lật nhìn phải
  const faceRight = !!enemy;
  const toward = enemy ? 1 : -1;

  let sheet: SheetRuntime;
  try {
    sheet = await loadSheetFromMeta(meta, kind);
  } catch (err) {
    console.warn("[battle] sheet fail", kind, tier, meta.sheet, err);
    const wikiFallback = meta.icon || `assets/units/battle/wiki-${kind}-t1.png`;
    const img = await loadImage(wikiFallback).catch(() => loadImage(troopArtUrl("infantry", 1)));
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const fallbackClips = clipsForTroop(kind, meta.kind, meta.sheet, meta);
    sheet = {
      img,
      canvas,
      ctx,
      tex,
      cols: 1,
      rows: 1,
      fw: 128,
      fh: 128,
      clips: fallbackClips,
      clip: fallbackClips.idle,
      playing: "idle",
      frame: 0,
      acc: 0,
      mirror: false,
    };
  }

  sheet.mirror = faceRight;
  sheet.frame = 0;
  sheet.acc = 0;
  paintFrame(sheet);

  const root = new THREE.Group();
  const members: THREE.Sprite[] = [];

  // 1 chủ lực / ô — không lính nhỏ; scale ~70% đợt trước
  const leadMat = new THREE.SpriteMaterial({
    map: sheet.tex,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.01,
    color: enemy ? 0xffe4e0 : 0xffffff,
  });
  const leader = new THREE.Sprite(leadMat);
  const leadAspect = sheet.fw / Math.max(sheet.fh, 1);
  // Cùng world-height mọi ô — BattleRenderer bù perspective để nhìn bằng nhau
  const lh = SOLO_LEADER_H;
  const baseScale = new THREE.Vector2(lh * leadAspect, lh);
  leader.scale.set(baseScale.x, baseScale.y, 1);
  leader.center.set(0.5, 0);
  leader.position.set(0, 0.02, 0);
  leader.renderOrder = 3;
  root.add(leader);
  members.push(leader);

  const actor: BattleActor = {
    root,
    sprite: leader,
    mixer: {
      update(dt: number) {
        const sh = actor.sheet;
        const mat = leader.material as THREE.SpriteMaterial;

        // Idle 1 frame — không tốn CPU mỗi tick; reset xoay nếu cần
        if (sh.playing === "idle" && sh.clip.frames <= 1) {
          if (mat.rotation !== 0) mat.rotation = 0;
          if (leader.position.y !== SPRITE_BASE_Y) leader.position.y = SPRITE_BASE_Y;
          return;
        }

        sh.acc += dt;
        const step = 1 / Math.max(1, sh.clip.fps);
        while (sh.acc >= step) {
          sh.acc -= step;
          sh.frame++;
          if (sh.frame >= sh.clip.frames) {
            if (sh.clip.loop) sh.frame = 0;
            else {
              sh.playing = "idle";
              sh.clip = sh.clips.idle;
              sh.frame = 0;
              actor.current = "idle";
            }
          }
          paintFrame(sh);
        }

        /* ── Swing rotation: xoay vung vũ khí dứt khoát quanh chân ── */
        const isAttack = sh.playing === "attack";
        const isSkill = sh.playing === "skill";
        const isHit = sh.playing === "hit";

        if (isAttack || isSkill) {
          const swingArr = isSkill
            ? SKILL_SWING
            : (ATTACK_SWING[actor.troop] || ATTACK_SWING.infantry);
          const fi = Math.min(sh.frame, swingArr.length - 1);
          // Nếu sheet đã có chuỗi frame diễn hoạt động tác đầy đủ (>8f) thì dùng trực tiếp chuyển động frame
          const angle = isAttack && sh.clip.frames > 8 ? 0 : (swingArr[fi] || 0);
          // faceRight (enemy) → đảo hướng xoay để cả 2 phe vung đúng chiều
          const sign = actor.faceRight ? -1 : 1;
          mat.rotation = angle * sign;
        } else if (isHit) {
          // Bị trúng đòn → giật lùi thế ngửa người
          const sign = actor.faceRight ? -1 : 1;
          mat.rotation = -0.16 * sign;
        } else {
          // idle / death — đứng thẳng
          if (mat.rotation !== 0) mat.rotation = 0;
        }
        if (leader.position.y !== SPRITE_BASE_Y) leader.position.y = SPRITE_BASE_Y;
      },
    },
    current: "idle",
    troop: kind,
    tier,
    baseScale,
    sheet,
    members,
    enemy,
    faceRight,
    toward,
  };
  return actor;
}

export function playActor(actor: BattleActor, name: string, _fade = 0.15): void {
  actor.current = name;
  const sh = actor.sheet;
  const clip = sh.clips[name] || sh.clips.attack;
  sh.playing = name;
  sh.clip = clip;
  sh.frame = 0;
  sh.acc = 0;
  // Reset xoay khi chuyển trạng thái — mixer sẽ áp lại đúng swing cho trạng thái mới
  const mat = actor.sprite.material as THREE.SpriteMaterial;
  mat.rotation = 0;
  actor.sprite.position.y = SPRITE_BASE_Y;
  if (name === "death") {
    actor.members.forEach((m, i) => {
      const mat = m.material as THREE.SpriteMaterial;
      mat.opacity = i === 0 ? 0.35 : 0.15;
      m.scale.y *= 0.55;
    });
  }
  if ((name === "skill" || name === "attack") && actor.members.length > 1) {
    const toward = actor.toward || (actor.enemy ? 1 : -1);
    actor.members.forEach((m, i) => {
      if (i === 0) return;
      m.position.x += 0.05 * toward;
    });
  }
  paintFrame(sh);
}

export function prefetchBattleActors(): void {
  const warm = (troop: string, tier: number) =>
    void loadSheetFromMeta(resolveMeta(troop, tier, 0), troop).catch(() => undefined);
  warm("infantry", 1);
  warm("cavalry", 1);
  warm("cavalry", 5);
  warm("spear", 1);
  warm("archer", 1);
  warm("strategist", 1);
}
