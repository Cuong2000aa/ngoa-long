import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { normalize, type Footprint } from "./modelUtils";

const FILES = {
  fence: new URL("../../assets/city/scape/fence.glb", import.meta.url).href,
  deer: new URL("../../assets/city/scape/deer.glb", import.meta.url).href,
  boar: new URL("../../assets/city/scape/boar.glb", import.meta.url).href,
  waterfall: new URL("../../assets/city/scape/waterfall.glb", import.meta.url).href,
  mountain: new URL("../../assets/city/scape/mountain.glb", import.meta.url).href,
  peak: new URL("../../assets/city/scape/peak.glb", import.meta.url).href,
  tree: new URL("../../assets/city/scape/tree.glb", import.meta.url).href,
  dirtpath: new URL("../../assets/city/scape/dirtpath.glb", import.meta.url).href,
  bamboo: new URL("../../assets/city/scape/bamboo.glb", import.meta.url).href,
  target: new URL("../../assets/city/scape/target.fbx", import.meta.url).href,
} as const;

export type ScapeName = keyof typeof FILES;

export class ScapeKit {
  constructor(private readonly templates: Record<ScapeName, THREE.Group>) {}

  place(
    parent: THREE.Object3D,
    name: ScapeName,
    size: number,
    x: number,
    z: number,
    yaw = 0,
    opts: { height?: number; y?: number } = {},
  ): THREE.Group {
    const tpl = this.templates[name];
    const fp = tpl.userData.fp as Footprint;
    const g = tpl.clone(true);
    const s = opts.height != null ? opts.height / Math.max(fp.y, 0.001) : size / Math.max(fp.x, fp.z, 0.001);
    g.scale.setScalar(s);
    g.position.set(x, opts.y ?? 0, z);
    g.rotation.y = yaw;
    parent.add(g);
    return g;
  }
}

let cache: Promise<ScapeKit> | null = null;

export function loadScapeKit(): Promise<ScapeKit> {
  cache ??= (async () => {
    await MeshoptDecoder.ready;
    const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const fbx = new FBXLoader();
    const names = Object.keys(FILES) as ScapeName[];
    const loaded = await Promise.all(
      names.map(async (name) => {
        const url = FILES[name];
        const obj = url.endsWith(".fbx") ? await fbx.loadAsync(url) : (await gltf.loadAsync(url)).scene;
        return [name, normalize(obj)] as const;
      }),
    );
    return new ScapeKit(Object.fromEntries(loaded) as Record<ScapeName, THREE.Group>);
  })();
  return cache;
}
