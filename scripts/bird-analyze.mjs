// Phân tích lưới quạ: node scripts/bird-analyze.mjs
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read("assets-src/birds/raven.glb");
const node = doc.getRoot().listNodes().find((n) => n.getMesh());
console.log("node T/R/S", node.getTranslation(), node.getRotation(), node.getScale());
const prim = node.getMesh().listPrimitives()[0];
const pos = prim.getAttribute("POSITION");
const n = pos.getCount();
const p = [0, 0, 0];
for (const side of [-1, 1]) {
  const bins = Array.from({ length: 24 }, () => ({ c: 0, x0: 9, x1: -9, z0: 9, z1: -9 }));
  for (let i = 0; i < n; i++) {
    pos.getElement(i, p);
    if (Math.sign(p[2]) !== side) continue;
    const b = Math.min(23, Math.floor(((p[1] + 0.27) / 0.54) * 24));
    const o = bins[b];
    o.c++; o.x0 = Math.min(o.x0, p[0]); o.x1 = Math.max(o.x1, p[0]); o.z0 = Math.min(o.z0, p[2]); o.z1 = Math.max(o.z1, p[2]);
  }
  console.log(`side z${side > 0 ? "+" : "-"}`);
  bins.forEach((o, i) => o.c && console.log(` y${(-0.27 + (i * 0.54) / 24).toFixed(3)} n=${o.c} x[${o.x0.toFixed(3)},${o.x1.toFixed(3)}] z[${o.z0.toFixed(3)},${o.z1.toFixed(3)}]`));
}
