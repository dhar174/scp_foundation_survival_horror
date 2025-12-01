/**
 * Object pool for reusing vectors and matrices to reduce GC pressure.
 * Provides temporary objects for per-frame calculations.
 */

import * as vec3 from '../math/vec3.js';
import * as mat4 from '../math/mat4.js';

/**
 * Generic object pool.
 * @template T
 */
class Pool {
  /**
   * Create a new pool.
   * @param {function(): T} factory - Factory function to create new objects
   * @param {function(T): T} reset - Function to reset an object for reuse
   * @param {number} [initialSize=16] - Initial pool size
   */
  constructor(factory, reset, initialSize = 16) {
    /** @type {function(): T} */
    this._factory = factory;

    /** @type {function(T): T} */
    this._reset = reset;

    /** @type {Array<T>} Available objects */
    this._available = [];

    /** @type {number} Total objects created */
    this._totalCreated = 0;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this._available.push(this._factory());
      this._totalCreated++;
    }
  }

  /**
   * Get an object from the pool.
   * @returns {T} Pooled object
   */
  get() {
    if (this._available.length > 0) {
      return this._reset(this._available.pop());
    }
    this._totalCreated++;
    return this._factory();
  }

  /**
   * Return an object to the pool.
   * @param {T} obj - Object to return
   */
  release(obj) {
    this._available.push(obj);
  }

  /**
   * Get pool statistics.
   * @returns {{available: number, totalCreated: number}}
   */
  getStats() {
    return {
      available: this._available.length,
      totalCreated: this._totalCreated,
    };
  }
}

// Vec3 pool
const vec3Factory = () => new Float32Array(3);
const vec3Reset = (v) => {
  v[0] = 0;
  v[1] = 0;
  v[2] = 0;
  return v;
};

/** @type {Pool<Float32Array>} */
const vec3Pool = new Pool(vec3Factory, vec3Reset, 32);

// Mat4 pool
const mat4Factory = () => new Float32Array(16);
const mat4Reset = (m) => {
  mat4.identity(m);
  return m;
};

/** @type {Pool<Float32Array>} */
const mat4Pool = new Pool(mat4Factory, mat4Reset, 8);

// Array for tracking temporary objects to release at frame end
/** @type {Array<{pool: Pool, obj: any}>} */
let tempObjects = [];

/**
 * Get a temporary vec3 from the pool.
 * Will be automatically released at frame end.
 * @param {number} [x=0] - X component
 * @param {number} [y=0] - Y component
 * @param {number} [z=0] - Z component
 * @returns {Float32Array} Temporary vec3
 */
export function tempVec3(x = 0, y = 0, z = 0) {
  const v = vec3Pool.get();
  v[0] = x;
  v[1] = y;
  v[2] = z;
  tempObjects.push({ pool: vec3Pool, obj: v });
  return v;
}

/**
 * Get a temporary mat4 from the pool.
 * Will be automatically released at frame end.
 * @returns {Float32Array} Temporary mat4 (identity)
 */
export function tempMat4() {
  const m = mat4Pool.get();
  tempObjects.push({ pool: mat4Pool, obj: m });
  return m;
}

/**
 * Get a permanent vec3 from the pool.
 * Must be manually released with releaseVec3.
 * @param {number} [x=0] - X component
 * @param {number} [y=0] - Y component
 * @param {number} [z=0] - Z component
 * @returns {Float32Array} Pooled vec3
 */
export function getVec3(x = 0, y = 0, z = 0) {
  const v = vec3Pool.get();
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}

/**
 * Release a vec3 back to the pool.
 * @param {Float32Array} v - Vec3 to release
 */
export function releaseVec3(v) {
  vec3Pool.release(v);
}

/**
 * Get a permanent mat4 from the pool.
 * Must be manually released with releaseMat4.
 * @returns {Float32Array} Pooled mat4 (identity)
 */
export function getMat4() {
  return mat4Pool.get();
}

/**
 * Release a mat4 back to the pool.
 * @param {Float32Array} m - Mat4 to release
 */
export function releaseMat4(m) {
  mat4Pool.release(m);
}

/**
 * Release all temporary objects. Call at end of each frame.
 */
export function releaseAllTemp() {
  for (const { pool, obj } of tempObjects) {
    pool.release(obj);
  }
  tempObjects = [];
}

/**
 * Get pool statistics for debugging.
 * @returns {{vec3: {available: number, totalCreated: number}, mat4: {available: number, totalCreated: number}}}
 */
export function getPoolStats() {
  return {
    vec3: vec3Pool.getStats(),
    mat4: mat4Pool.getStats(),
  };
}

// Export vec3 operations that work with pooled vectors
export { vec3, mat4 };
