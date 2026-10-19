/**
 * Sinh GLB props stylized (khớp folk) — Node + Three GLTFExporter.
 * Polyfill FileReader/Blob vì exporter dùng browser APIs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Blob } from "node:buffer";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.Blob === "undefined") globalThis.Blob = Blob;
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    onerror = null;
    onload = null;
    readAsArrayBuffer(blob) {
      Promise.resolve()
        .then(() => (blob.arrayBuffer ? blob.arrayBuffer() : blob))
        .then((buf) => {
          this.result = buf;
          const ev = { target: this };
          if (this.onload) this.onload(ev);
          if (this.onloadend) this.onloadend(ev);
        })
        .catch((err) => {
          if (this.onerror) this.onerror(err);
        });
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../assets/units/props");

function mat(color, metal = 0.2, rough = 0.55) {
  return new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
}

function mesh(geo, m) {
  const o = new THREE.Mesh(geo, m);
  o.castShadow = true;
  return o;
}

function spear() {
  const g = new THREE.Group();
  const wood = mat(0x6b4a2a, 0, 0.9);
  const steel = mat(0xd0d4e0, 0.75, 0.35);
  const shaft = mesh(new THREE.CylinderGeometry(0.018, 0.016, 1.1, 8), wood);
  shaft.rotation.z = Math.PI / 2;
  const tip = mesh(new THREE.ConeGeometry(0.035, 0.16, 8), steel);
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 0.62;
  g.add(shaft, tip);
  return g;
}

function sword() {
  const g = new THREE.Group();
  const wood = mat(0x5a3a22, 0, 0.9);
  const steel = mat(0xc8ccd4, 0.8, 0.3);
  const handle = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), wood);
  handle.rotation.z = Math.PI / 2;
  const blade = mesh(new THREE.BoxGeometry(0.55, 0.035, 0.08), steel);
  blade.position.x = 0.35;
  const guard = mesh(new THREE.BoxGeometry(0.04, 0.08, 0.14), steel);
  guard.position.x = 0.12;
  g.add(handle, blade, guard);
  return g;
}

function bow() {
  const g = new THREE.Group();
  const wood = mat(0x8a6236, 0, 0.85);
  const limb = mesh(new THREE.TorusGeometry(0.28, 0.015, 6, 16, Math.PI), wood);
  limb.rotation.y = Math.PI / 2;
  const string = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.5, 4), mat(0xe8dcc8, 0, 0.7));
  string.position.x = 0.28;
  g.add(limb, string);
  return g;
}

function shield() {
  const g = new THREE.Group();
  const face = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), mat(0x3b7a3c, 0.15, 0.7));
  face.rotation.x = Math.PI / 2;
  const boss = mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(0xffe08a, 0.7, 0.35));
  boss.position.z = 0.04;
  g.add(face, boss);
  return g;
}

function staff() {
  const g = new THREE.Group();
  const wood = mat(0x6b4a2a, 0, 0.9);
  const shaft = mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.95, 8), wood);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = 0.2;
  const orb = mesh(new THREE.SphereGeometry(0.055, 10, 8), mat(0x5eead4, 0.4, 0.25));
  orb.position.x = 0.7;
  g.add(shaft, orb);
  return g;
}

function horse() {
  const g = new THREE.Group();
  const bodyMat = mat(0x5a4030, 0.05, 0.85);
  const body = mesh(new THREE.BoxGeometry(0.7, 0.38, 0.28), bodyMat);
  body.position.y = 0.45;
  const neck = mesh(new THREE.BoxGeometry(0.16, 0.32, 0.14), bodyMat);
  neck.position.set(0.35, 0.68, 0);
  neck.rotation.z = -0.35;
  const head = mesh(new THREE.BoxGeometry(0.22, 0.14, 0.14), bodyMat);
  head.position.set(0.52, 0.78, 0);
  const legGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.42, 6);
  [
    [0.22, 0.1],
    [0.22, -0.1],
    [-0.22, 0.1],
    [-0.22, -0.1],
  ].forEach(([x, z]) => {
    const leg = mesh(legGeo, bodyMat);
    leg.position.set(x, 0.22, z);
    g.add(leg);
  });
  g.add(body, neck, head);
  return g;
}

function helm() {
  const g = new THREE.Group();
  const steel = mat(0xffc857, 0.75, 0.3);
  const dome = mesh(new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel);
  dome.position.y = 0.02;
  const plume = mesh(new THREE.ConeGeometry(0.035, 0.22, 6), mat(0xc4281c, 0.1, 0.6));
  plume.position.y = 0.2;
  g.add(dome, plume);
  return g;
}

function armor() {
  const g = new THREE.Group();
  const steel = mat(0xd0d4e0, 0.7, 0.35);
  const chest = mesh(new THREE.BoxGeometry(0.36, 0.28, 0.18), steel);
  const pauldronL = mesh(new THREE.SphereGeometry(0.08, 8, 6), steel);
  pauldronL.position.set(0.2, 0.08, 0);
  const pauldronR = pauldronL.clone();
  pauldronR.position.x = -0.2;
  g.add(chest, pauldronL, pauldronR);
  return g;
}

function exportGlb(object, fileName) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        const buf = Buffer.from(result);
        fs.writeFileSync(path.join(OUT, fileName), buf);
        console.log("wrote", fileName, buf.length, "bytes");
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  ["spear.glb", spear()],
  ["sword.glb", sword()],
  ["bow.glb", bow()],
  ["shield.glb", shield()],
  ["staff.glb", staff()],
  ["horse.glb", horse()],
  ["helm_t5.glb", helm()],
  ["armor_t5.glb", armor()],
];

for (const [name, obj] of jobs) {
  await exportGlb(obj, name);
}
console.log("done", jobs.length, "props →", OUT);
