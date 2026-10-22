/** Fx3d — resolve style + hon packs + play theo style (emitter vẫn ở battleVfx3d). */
export type { Fx3dStyle, HonPackId } from "./resolveStyle";
export { resolveFx3dStyle, honPackForStyle } from "./resolveStyle";
export type { HonPackPaths } from "./honPacks";
export { HON_PACKS, clampHonTargetSize, fxSeq } from "./honPacks";
export type { StylePlayApi, StylePlayParams, Fx3dHandle, HostileTimeline } from "./stylePlay";
export {
  runStyleEmission,
  runStyleCharge,
  runStyleFlight,
  runStyleImpact,
  hostileTimeline,
  honHostileTimeline,
  patternVariant,
  beamFlashTint,
} from "./stylePlay";
