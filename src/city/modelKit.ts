import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { normalize, type Footprint } from "./modelUtils";

/**
 * Model công trình (Tripo AI gallery), đã nén bằng scripts/optimize-models.mjs.
 * Bỏ hall-a.fbx / mine-a.fbx — mesh lỗi (Ty Vũ cụt, mỏ = đống đá).
 */
const FILES = {
  "hall-b": new URL("../../assets/city/buildings3d/hall-b.glb", import.meta.url).href,
  "hall-c": new URL("../../assets/city/buildings3d/hall-c.glb", import.meta.url).href,
  "granary-a": new URL("../../assets/city/buildings3d/granary-a.glb", import.meta.url).href,
  "granary-b": new URL("../../assets/city/buildings3d/granary-b.glb", import.meta.url).href,
  "granary-c": new URL("../../assets/city/buildings3d/granary-c.glb", import.meta.url).href,
  "farm-house": new URL("../../assets/city/buildings3d/farm-house.glb", import.meta.url).href,
  barracks: new URL("../../assets/city/buildings3d/barracks.glb", import.meta.url).href,
  "mine-b": new URL("../../assets/city/buildings3d/mine-b.glb", import.meta.url).href,
  "weapon-rack": new URL("../../assets/city/buildings3d/weapon-rack.glb", import.meta.url).href,
  pavilion: new URL("../../assets/city/buildings3d/pavilion.glb", import.meta.url).href,
} as const;

export type ModelName = keyof typeof FILES;

export class ModelKit {
  constructor(private readonly templates: Record<ModelName, THREE.Group>) {}

  /** Bản sao model, chiều ngang lớn nhất = size, đặt tại (x, z) trong group cha. */
  place(parent: THREE.Object3D, name: ModelName, size: number, x = 0, z = 0, yaw = 0): THREE.Group {
    const tpl = this.templates[name];
    const fp = tpl.userData.fp as Footprint;
    const g = tpl.clone(true);
    g.scale.setScalar(size / Math.max(fp.x, fp.z, 0.001));
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    parent.add(g);
    return g;
  }
}

let kitPromise: Promise<ModelKit> | null = null;

export function loadModelKit(): Promise<ModelKit> {
  kitPromise ??= (async () => {
    await MeshoptDecoder.ready;
    const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const fbx = new FBXLoader();
    const names = Object.keys(FILES) as ModelName[];
    const loaded = await Promise.all(
      names.map(async (name) => {
        const url = FILES[name];
        const obj = url.endsWith(".fbx") ? await fbx.loadAsync(url) : (await gltf.loadAsync(url)).scene;
        return [name, normalize(obj)] as const;
      }),
    );
    return new ModelKit(Object.fromEntries(loaded) as Record<ModelName, THREE.Group>);
  })();
  return kitPromise;
}
