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
};

type SheetsFile = {
  schemaVersion?: number;
  types?: Record<string, Record<string, SheetMeta>>;
  byWikiId?: Record<string, SheetMeta>;
  byTroopTier?: Record<string, Record<string, string[]>>;
} & Record<string, unknown>;

const RAW = sheetsIndex as SheetsFile;
const BY_WIKI = RAW.byWikiId || {};
const BY_TROOP_TIER = RAW.byTroopTier || {};

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

/** Ưu tiên wikiId → khớp tên → pool bậc (seed) → đại diện loại×bậc */
function resolveMeta(
  troop: string,
  tier: number,
  seed: number,
  wikiId?: string | null,
  name?: string | null
): SheetMeta {
  if (wikiId && BY_WIKI[wikiId]) return BY_WIKI[wikiId];
  if (name) {
    const n = name.trim().toLowerCase();
    for (const m of Object.values(BY_WIKI)) {
      if (m.name && m.name.trim().toLowerCase() === n) return m;
    }
  }
  const pool = BY_TROOP_TIER[troop]?.[String(tier)] || [];
  if (pool.length) {
    const id = pool[Math.abs(seed | 0) % pool.length];
    if (id && BY_WIKI[id]) return BY_WIKI[id];
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

const CLIPS_WIKI: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 4, fps: 5, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 18, loop: false },
  skill: { row: 1, start: 4, frames: 4, fps: 12, loop: false },
  hit: { row: 0, start: 5, frames: 2, fps: 10, loop: false },
  death: { row: 1, start: 0, frames: 1, fps: 1, loop: false },
};

/** Sheet solo: idle đứng yên (1 frame — không rung), attack có trail */
const CLIPS_SOLO: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 1, fps: 1, loop: true },
  attack: { row: 0, start: 1, frames: 6, fps: 14, loop: false },
  skill: { row: 0, start: 2, frames: 4, fps: 12, loop: false },
  hit: { row: 1, start: 6, frames: 1, fps: 8, loop: false },
  death: { row: 1, start: 6, frames: 1, fps: 1, loop: false },
};

const CLIPS_HOBAO: Record<string, Clip> = {
  idle: { row: 1, start: 0, frames: 2, fps: 4, loop: true },
  attack: { row: 0, start: 0, frames: 8, fps: 15, loop: false },
  skill: { row: 1, start: 0, frames: 8, fps: 12, loop: false },
  hit: { row: 1, start: 0, frames: 2, fps: 8, loop: false },
  death: { row: 1, start: 0, frames: 1, fps: 1, loop: false },
};

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
  try {
    const id = ctx.getImageData(0, 0, fw, fh);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) d[i + 3] = 0;
    }
    ctx.putImageData(id, 0, 0);
  } catch {
    /* ignore */
  }
  sh.tex.needsUpdate = true;
}

async function loadSheetFromMeta(meta: SheetMeta): Promise<SheetRuntime> {
  const url = meta.sheet.startsWith("assets/") ? meta.sheet : `assets/units/sheets/${meta.sheet}`;
  const img = await loadImage(url);
  const cols = meta.cols || 8;
  const rows = meta.rows || 2;
  const fw = Math.floor(img.naturalWidth / cols);
  const fh = Math.floor(img.naturalHeight / rows);
  const canvas = document.createElement("canvas");
  canvas.width = fw;
  canvas.height = fh;
  const ctx = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const clips = meta.kind === "hobao" ? CLIPS_HOBAO : CLIPS_SOLO;
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
const SOLO_LEADER_H = 0.95;

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
    sheet = await loadSheetFromMeta(meta);
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
    sheet = {
      img,
      canvas,
      ctx,
      tex,
      cols: 1,
      rows: 1,
      fw: 128,
      fh: 128,
      clips: CLIPS_WIKI,
      clip: CLIPS_WIKI.idle,
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
    alphaTest: 0.04,
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

  // Pad tròn kiểu Ngọa Long — xanh phe ta / đỏ địch (như ảnh có unit)
  const padR = 0.34;
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(padR, 32),
    new THREE.MeshBasicMaterial({
      color: enemy ? 0xdc2626 : 0x22c55e,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.008;
  pad.renderOrder = 1;
  root.add(pad);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(padR + 0.01, padR + 0.06, 16),
    new THREE.MeshBasicMaterial({
      color: enemy ? 0xfca5a5 : 0x86efac,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.renderOrder = 2;
  root.add(ring);

  const actor: BattleActor = {
    root,
    sprite: leader,
    mixer: {
      update(dt: number) {
        const sh = actor.sheet;
        // Idle 1 frame — không tốn CPU mỗi tick
        if (sh.playing === "idle" && sh.clip.frames <= 1) return;
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
    void loadSheetFromMeta(resolveMeta(troop, tier, 0)).catch(() => undefined);
  warm("infantry", 1);
  warm("cavalry", 1);
  warm("cavalry", 5);
  warm("spear", 1);
  warm("archer", 1);
}
