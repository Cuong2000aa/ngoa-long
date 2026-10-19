import * as THREE from "three";
import sheetsIndex from "../../assets/units/sheets/index.json";

/**
 * Unit chiến trường kiểu Ngọa Long H5:
 * mỗi ô = cụm lính (wiki icon), không token đơn.
 * Cavalry tier≥5: sheet Hổ Báo cho thủ lĩnh.
 */

type SheetMeta = {
  sheet: string;
  cols: number;
  rows: number;
  kind: string;
  icon: string;
};

type SheetsIndex = Record<string, Record<string, SheetMeta>>;
const INDEX = sheetsIndex as SheetsIndex;

function sheetUrl(troop: string, tier: number): string {
  const meta = INDEX[troop]?.[String(tier)] || INDEX[troop]?.["1"] || INDEX.infantry["1"];
  return meta.sheet.startsWith("assets/") ? meta.sheet : `assets/units/sheets/${troop}-t${tier}.png`;
}

function clampTier(tier: number | undefined): number {
  const n = tier == null ? 1 : Math.floor(tier);
  return Math.max(1, Math.min(6, n));
}

export function troopArtUrl(troop: string, tier = 1): string {
  const t = clampTier(tier);
  const meta = INDEX[troop]?.[String(t)] || INDEX.infantry?.["1"];
  return meta?.icon || `assets/units/battle/wiki-${troop}-t${t}.png`;
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
  /** Wiki sheet mặc định nhìn TRÁI — true = lật canvas để nhìn PHẢI (phe ta) */
  mirror: boolean;
};

function paintFrame(sh: SheetRuntime): void {
  const col = sh.clip.start + Math.min(sh.frame, sh.clip.frames - 1);
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

async function loadSheet(troop: string, tier: number): Promise<SheetRuntime> {
  const meta = INDEX[troop]?.[String(tier)] || INDEX[troop]?.["1"] || INDEX.infantry["1"];
  const url = sheetUrl(troop, tier);
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
  const clips = meta.kind === "hobao" ? CLIPS_HOBAO : CLIPS_WIKI;
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

async function iconTexture(troop: string, tier: number, mirror = false): Promise<THREE.CanvasTexture> {
  const url = troopArtUrl(troop, tier);
  const img = await loadImage(url);
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight) * 0.92;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (size - w) / 2;
  const y = size - h - 2;
  ctx.save();
  if (mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Offset cục bộ: +X = hướng ĐỐI PHƯƠNG (phe ta sang phải, địch sang trái).
 * Hàng 3–2–3 gọn, không loang.
 */
const SQUAD_OFFSETS: [number, number][] = [
  [0.22, 0.0], // thủ lĩnh phía trước
  [0.05, 0.2],
  [0.05, -0.2],
  [-0.12, 0.0],
  [-0.28, 0.22],
  [-0.28, -0.22],
  [-0.42, 0.1],
  [-0.42, -0.1],
];

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
  /** true = đã lật canvas nhìn phải (phe ta) */
  faceRight: boolean;
  /** +1 phe ta / -1 địch — hướng tới đối phương trên trục X sân */
  toward: number;
};

const LEADER_H = 0.82;
const MEMBER_H = 0.48;

export async function createBattleActor(
  troop: string | undefined,
  enemy: boolean,
  seed: number,
  _name?: string,
  troopTier?: number
): Promise<BattleActor> {
  const kind = troop && INDEX[troop] ? troop : "infantry";
  const tier = clampTier(troopTier);
  // Wiki mặc định nhìn TRÁI → phe ta lật canvas nhìn PHẢI (đối địch)
  const faceRight = !enemy;
  const toward = enemy ? -1 : 1;

  let sheet: SheetRuntime;
  try {
    sheet = await loadSheet(kind, tier);
  } catch (err) {
    console.warn("[battle] sheet fail", kind, tier, err);
    const wikiFallback = `assets/units/battle/wiki-${kind}-t1.png`;
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
  sheet.frame = seed % Math.max(1, sheet.clips.idle.frames);
  sheet.acc = (seed % 7) * 0.05;
  paintFrame(sheet);

  const root = new THREE.Group();
  const members: THREE.Sprite[] = [];
  const iconTex = await iconTexture(kind, tier, faceRight).catch(() => sheet.tex);

  // Thủ lĩnh — sheet anim (scale luôn dương; hướng nằm ở canvas mirror)
  const leadMat = new THREE.SpriteMaterial({
    map: sheet.tex,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.04,
    color: enemy ? 0xffe4e0 : 0xffffff,
  });
  const leader = new THREE.Sprite(leadMat);
  const leadAspect = sheet.fw / Math.max(sheet.fh, 1);
  const hobao = INDEX[kind]?.[String(tier)]?.kind === "hobao";
  const lh = LEADER_H * (hobao ? 1.12 : 1) * (0.97 + (seed % 4) * 0.01);
  const baseScale = new THREE.Vector2(lh * leadAspect, lh);
  leader.scale.set(baseScale.x, baseScale.y, 1);
  leader.center.set(0.5, 0);
  leader.position.set(SQUAD_OFFSETS[0][0] * toward, 0.02, SQUAD_OFFSETS[0][1]);
  leader.renderOrder = 3;
  root.add(leader);
  members.push(leader);

  // Lính phụ — hàng gọn hướng địch
  const nMembers = kind === "cavalry" ? 6 : kind === "strategist" ? 5 : 8;
  for (let i = 1; i < nMembers && i < SQUAD_OFFSETS.length; i++) {
    const mat = new THREE.SpriteMaterial({
      map: iconTex,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.05,
      color: enemy ? 0xffd5d0 : 0xffffff,
    });
    const sp = new THREE.Sprite(mat);
    const h = MEMBER_H * (0.94 + ((seed + i * 3) % 5) * 0.015);
    sp.scale.set(h, h, 1);
    sp.center.set(0.5, 0);
    const [ox, oz] = SQUAD_OFFSETS[i];
    sp.position.set(ox * toward, 0.02, oz);
    sp.renderOrder = 2;
    sp.userData.bobPhase = seed * 0.4 + i * 1.1;
    root.add(sp);
    members.push(sp);
  }

  // Đế vòng phe nhỏ hơn — bớt chồng chéo
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 28),
    new THREE.MeshStandardMaterial({
      color: enemy ? 0x3a1818 : 0x1a3028,
      roughness: 0.92,
      metalness: 0.04,
      transparent: true,
      opacity: 0.8,
    })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.006;
  pad.receiveShadow = true;
  root.add(pad);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.43, 0.5, 40),
    new THREE.MeshBasicMaterial({
      color: enemy ? 0xb91c1c : 0x166534,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.014;
  ring.renderOrder = 1;
  root.add(ring);

  const actor: BattleActor = {
    root,
    sprite: leader,
    mixer: {
      update(dt: number) {
        const sh = actor.sheet;
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
  if (name === "skill" || name === "attack") {
    // Lính phụ dồn về phía đối phương
    const toward = actor.toward || (actor.enemy ? -1 : 1);
    actor.members.forEach((m, i) => {
      if (i === 0) return;
      m.position.x += 0.05 * toward;
    });
  }
  paintFrame(sh);
}

export function prefetchBattleActors(): void {
  void loadSheet("infantry", 1).catch(() => undefined);
  void loadSheet("cavalry", 1).catch(() => undefined);
  void loadSheet("cavalry", 5).catch(() => undefined);
  void loadSheet("spear", 1).catch(() => undefined);
  void loadSheet("archer", 1).catch(() => undefined);
}
