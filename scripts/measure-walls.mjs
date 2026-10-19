// Đo hình học model tường (cần dev server): node scripts/measure-walls.mjs
import { chromium } from "playwright-core";

const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5173/", { waitUntil: "load" });
const report = await page.evaluate(async () => {
  const THREE = await import("/node_modules/three/build/three.module.js");
  const { loadWallTemplates } = await import("/src/city/walls.ts");
  const t = await loadWallTemplates();
  const out = {};
  for (const key of ["long", "arch", "gate"]) {
    const g = t[key];
    const fp = g.userData.fp;
    const longAxis = fp.z > fp.x ? "z" : "x";
    const len = Math.max(fp.x, fp.z);
    const bins = 40;
    const maxY = new Array(bins).fill(0);
    const v = new THREE.Vector3();
    g.updateMatrixWorld(true);
    g.traverse((o) => {
      if (!o.isMesh) return;
      const pos = o.geometry.attributes.position;
      const step = Math.max(1, Math.floor(pos.count / 40000));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        const a = (v[longAxis] + len / 2) / len;
        const b = Math.min(bins - 1, Math.max(0, Math.floor(a * bins)));
        maxY[b] = Math.max(maxY[b], v.y / fp.y);
      }
    });
    let meshes = 0;
    g.traverse((o) => { if (o.isMesh) meshes++; });
    out[key] = { fp, longAxis, meshes, profile: maxY.map((y) => y.toFixed(2)).join(" ") };
  }
  return out;
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
