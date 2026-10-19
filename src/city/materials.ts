import * as THREE from "three";

function mat(
  color: number,
  roughness: number,
  metalness = 0,
  extra: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function canvasTexture(c: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roofTex(hex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 64, 128);
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1;
  for (let y = 4; y < 128; y += 7) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(64, y);
    ctx.stroke();
  }
  return canvasTexture(c);
}

function noiseTex(hex: string, dots: number, repeat: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < dots; i++) {
    const g = 30 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgba(${g},${g + 16},${Math.max(0, g - 12)},${0.12 + Math.random() * 0.28})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  return canvasTexture(c, repeat);
}

const ROOF_TIER_COLORS = ["#9a7340", "#6a7278", "#2c7a50", "#24588a", "#a33a26", "#b8893a"];

export function createMaterials() {
  return {
    wood: mat(0x7a4e32, 0.86),
    woodDark: mat(0x3a2618, 0.9),
    plaster: mat(0xf3ead8, 0.78),
    pillar: mat(0x8e221c, 0.55, 0.05),
    door: mat(0x4a2416, 0.7),
    stone: mat(0xa7a39a, 0.88, 0.02),
    gold: mat(0xe6c56a, 0.38, 0.45),
    crop: mat(0x67a84a, 0.9),
    cropDark: mat(0x3d7a34, 0.9),
    rock: mat(0x6e6a64, 0.95, 0.02),
    cave: mat(0x14110e, 1),
    sand: mat(0xd2b48a, 0.95),
    straw: mat(0xc6a15a, 0.9),
    banner: mat(0x9c2b24, 0.6, 0, { side: THREE.DoubleSide }),
    silver: mat(0xd5dde6, 0.25, 0.7, { emissive: 0x9eb0c0, emissiveIntensity: 0.55 }),
    water: mat(0x2f6a74, 0.18, 0.12),
    hill: mat(0x8d7d68, 1),
    grass: mat(0x6d8a4e, 0.95, 0, { map: noiseTex("#6d8a4e", 1800, 10) }),
    court: mat(0xdcc9a4, 0.92, 0, { map: noiseTex("#dcc9a4", 900, 4) }),
    path: mat(0xc3b099, 0.9),
    roof: ROOF_TIER_COLORS.map((hex, i) =>
      mat(parseInt(hex.slice(1), 16), i >= 4 ? 0.5 : 0.74, i >= 4 ? 0.18 : 0.02, { map: roofTex(hex) }),
    ),
  };
}

export type Materials = ReturnType<typeof createMaterials>;
