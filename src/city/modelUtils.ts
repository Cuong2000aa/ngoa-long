import * as THREE from "three";

export interface Footprint {
  x: number;
  y: number;
  z: number;
}

function prepareMeshes(obj: THREE.Object3D) {
  const drop: THREE.Object3D[] = [];
  obj.traverse((o) => {
    if ((o as THREE.Light).isLight || (o as THREE.Camera).isCamera) drop.push(o);
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  for (const o of drop) o.removeFromParent();
}

/**
 * Bọc model: tâm XZ về gốc, đáy chạm y=0, ghi kích thước vào userData.fp.
 * alignLongZ: xoay để trục dài nằm theo Z (dùng cho tường).
 */
export function normalize(obj: THREE.Object3D, alignLongZ = false): THREE.Group {
  prepareMeshes(obj);
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const inner = new THREE.Group();
  inner.position.set(-center.x, -box.min.y, -center.z);
  inner.add(obj);
  const wrap = new THREE.Group();
  if (alignLongZ && size.x > size.z) {
    wrap.rotation.y = Math.PI / 2;
    [size.x, size.z] = [size.z, size.x];
  }
  wrap.add(inner);
  const root = new THREE.Group();
  root.add(wrap);
  root.userData.fp = { x: size.x, y: size.y, z: size.z } satisfies Footprint;
  return root;
}
