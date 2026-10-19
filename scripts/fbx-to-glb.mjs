/**
 * Convert Quaternius FBX → GLB (CC0).
 * FBXLoader đọc màu material bị tối gần đen — gán lại palette theo tên material.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Blob } from "node:buffer";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.Blob === "undefined") globalThis.Blob = Blob;
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    onerror = null;
    onload = null;
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer ? blob.arrayBuffer() : blob)
        .then((buf) => {
          this.result = buf;
          const ev = { target: this };
          this.onload?.(ev);
          this.onloadend?.(ev);
        })
        .catch((e) => this.onerror?.(e));
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pack = path.resolve(root, "_dl/quaternius/Ultimate Animated Character Pack - Nov 2019/FBX");

/** Palette Quaternius-style theo tên material (không phụ thuộc màu FBX bị tối). */
const PALETTES = {
  ally: {
    Skin: 0xe8b896,
    Face: 0xe8b896,
    Main: 0x2d6a4f,
    Helmet: 0x1b4332,
    Grey: 0xa8b0bc,
    Black: 0x1c1917,
    White: 0xf5f0e8,
    Metal: 0xc0c8d0,
    Gold: 0xd4a017,
    Hair: 0x1c1917,
    Cloth: 0x40916c,
  },
  foe: {
    Skin: 0xe0ac69,
    Face: 0xe0ac69,
    Main: 0x1d3557,
    Helmet: 0x0d1b2a,
    Grey: 0x8d99ae,
    Black: 0x1a1a1a,
    White: 0xf0ebe3,
    Metal: 0xb0b8c4,
    Gold: 0xc9a227,
    Hair: 0x1a1a1a,
    Cloth: 0x457b9d,
  },
  knight: {
    Skin: 0xe8c4a0,
    Face: 0xe8c4a0,
    Main: 0x6c757d,
    Helmet: 0xc9a227,
    Grey: 0xadb5bd,
    Black: 0x212529,
    White: 0xf8f9fa,
    Metal: 0xdee2e6,
    Gold: 0xffc300,
    Hair: 0x212529,
    Cloth: 0x495057,
  },
  ninja: {
    Skin: 0xd4a574,
    Face: 0xd4a574,
    Main: 0x1a1a2e,
    Helmet: 0x16213e,
    Grey: 0x4a4e69,
    Black: 0x0f0f0f,
    White: 0xe8e8e8,
    Metal: 0x9a8c98,
    Gold: 0xc9a227,
    Hair: 0x0f0f0f,
    Cloth: 0x22223b,
  },
  kimono: {
    Skin: 0xe8b896,
    Face: 0xe8b896,
    Main: 0x9b2226,
    Helmet: 0x660708,
    Grey: 0xadb5bd,
    Black: 0x1a1a1a,
    White: 0xf5f0e8,
    Metal: 0xc0c8d0,
    Gold: 0xd4a017,
    Hair: 0x1a1a1a,
    Cloth: 0xae2012,
  },
};

function paint(obj, paletteName) {
  const pal = PALETTES[paletteName] || PALETTES.ally;
  obj.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map((m) => {
      const key = Object.keys(pal).find((k) => (m.name || "").toLowerCase().includes(k.toLowerCase()));
      const hex = key ? pal[key] : pal.Main;
      return new THREE.MeshStandardMaterial({
        name: m.name || key || "Main",
        color: hex,
        roughness: key === "Metal" || key === "Grey" || key === "Gold" || key === "Helmet" ? 0.35 : 0.72,
        metalness: key === "Metal" || key === "Grey" || key === "Gold" || key === "Helmet" ? 0.55 : 0.05,
      });
    });
    o.material = next.length === 1 ? next[0] : next;
  });
}

async function convert(fbxName, outRel, palette, scale = 0.012) {
  const fbxPath = path.join(pack, fbxName);
  const outPath = path.resolve(root, outRel);
  const buf = fs.readFileSync(fbxPath);
  const loader = new FBXLoader();
  const obj = loader.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    path.dirname(fbxPath) + "/"
  );
  obj.scale.setScalar(scale);
  obj.updateMatrixWorld(true);
  paint(obj, palette);
  await new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      obj,
      (result) => {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, Buffer.from(result));
        console.log("OK", outRel, fs.statSync(outPath).size, palette);
        resolve();
      },
      reject,
      { binary: true, animations: obj.animations || [] }
    );
  });
}

await convert("BlueSoldier_Male.fbx", "assets/units/battle/soldier-ally.glb", "ally");
await convert("Soldier_Male.fbx", "assets/units/battle/soldier-foe.glb", "foe");
await convert("Knight_Golden_Male.fbx", "assets/units/battle/knight.glb", "knight");
await convert("Ninja_Male.fbx", "assets/units/battle/ninja.glb", "ninja");
await convert("Kimono_Male.fbx", "assets/units/battle/kimono.glb", "kimono");
await convert("Knight_Male.fbx", "assets/units/battle/knight-iron.glb", "knight");
console.log("done");
