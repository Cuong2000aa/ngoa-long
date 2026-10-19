// Tách 1 con quạ khỏi tượng (bỏ con còn lại + bệ gỗ): node scripts/bird-prep.mjs
// Ra assets-src/birds/raven-solo.glb, sau đó tối ưu bằng gltf-transform optimize.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";

const SRC = "assets-src/birds/raven.glb";
const OUT = "assets-src/birds/raven-solo.glb";
/** Con quạ nửa z- (mỏ há, thân chúi về trước); bệ gỗ nằm dưới y này. */
const PEDESTAL_TOP = Number(process.argv[2] ?? -0.185);

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(SRC);
for (const ext of doc.getRoot().listExtensionsUsed()) {
  if (ext.extensionName === "EXT_meshopt_compression") ext.dispose();
}
const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const pos = prim.getAttribute("POSITION");
const idx = prim.getIndices();
const src = idx.getArray();
const keep = [];
const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
for (let t = 0; t < src.length; t += 3) {
  pos.getElement(src[t], a);
  pos.getElement(src[t + 1], b);
  pos.getElement(src[t + 2], c);
  if (a[2] + b[2] + c[2] >= 0) continue;
  if (Math.min(a[1], b[1], c[1]) < PEDESTAL_TOP) continue;
  keep.push(src[t], src[t + 1], src[t + 2]);
}
idx.setArray(new Uint32Array(keep));
await doc.transform(prune());
await io.write(OUT, doc);
console.log(`giữ ${keep.length / 3} / ${src.length / 3} tam giác -> ${OUT}`);
