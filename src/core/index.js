/**
 * Core Systems
 * Entity/component system, scene management, input handling, time management.
 */

// Entity/Component system
export { Entity } from './entity.js';
export { Component } from './component.js';
export { Scene } from './scene.js';

// Input handling
export { Input } from './input.js';

// Time management
export { Time } from './time.js';

// Debug overlay
export { DebugOverlay } from './debugOverlay.js';

// Object pooling for reduced GC pressure
export {
  tempVec3,
  tempMat4,
  getVec3,
  releaseVec3,
  getMat4,
  releaseMat4,
  releaseAllTemp,
  getPoolStats,
} from './pool.js';

// Frustum culling
export { AABB, Frustum, createViewProjectionMatrix } from './frustumCulling.js';
