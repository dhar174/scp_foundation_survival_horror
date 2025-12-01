/**
 * Basic frustum culling utilities.
 * Provides AABB-based visibility testing against view frustum.
 */

import * as vec3 from '../math/vec3.js';
import * as mat4 from '../math/mat4.js';

/**
 * Axis-Aligned Bounding Box for collision and culling.
 */
export class AABB {
  /**
   * Create an AABB.
   * @param {Float32Array} [min] - Minimum corner [x, y, z]
   * @param {Float32Array} [max] - Maximum corner [x, y, z]
   */
  constructor(min, max) {
    /** @type {Float32Array} Minimum corner */
    this.min = min || new Float32Array([-0.5, -0.5, -0.5]);

    /** @type {Float32Array} Maximum corner */
    this.max = max || new Float32Array([0.5, 0.5, 0.5]);
  }

  /**
   * Set AABB from center and half-extents.
   * @param {Float32Array} center - Center position
   * @param {Float32Array} halfExtents - Half-size in each dimension
   */
  setFromCenterAndHalfExtents(center, halfExtents) {
    this.min[0] = center[0] - halfExtents[0];
    this.min[1] = center[1] - halfExtents[1];
    this.min[2] = center[2] - halfExtents[2];
    this.max[0] = center[0] + halfExtents[0];
    this.max[1] = center[1] + halfExtents[1];
    this.max[2] = center[2] + halfExtents[2];
  }

  /**
   * Get the center of the AABB.
   * @param {Float32Array} out - Output vector
   * @returns {Float32Array} Center point
   */
  getCenter(out) {
    out[0] = (this.min[0] + this.max[0]) * 0.5;
    out[1] = (this.min[1] + this.max[1]) * 0.5;
    out[2] = (this.min[2] + this.max[2]) * 0.5;
    return out;
  }

  /**
   * Get the half-extents of the AABB.
   * @param {Float32Array} out - Output vector
   * @returns {Float32Array} Half-extents
   */
  getHalfExtents(out) {
    out[0] = (this.max[0] - this.min[0]) * 0.5;
    out[1] = (this.max[1] - this.min[1]) * 0.5;
    out[2] = (this.max[2] - this.min[2]) * 0.5;
    return out;
  }

  /**
   * Transform the AABB by a matrix.
   * @param {Float32Array} matrix - 4x4 transformation matrix
   * @returns {AABB} Transformed AABB (new instance)
   */
  transform(matrix) {
    // Reuse a single Float32Array for all corners to reduce allocations
    const corner = new Float32Array(3);
    const newMin = new Float32Array([Infinity, Infinity, Infinity]);
    const newMax = new Float32Array([-Infinity, -Infinity, -Infinity]);

    // Process all 8 corners of the AABB
    const cornerCoords = [
      [this.min[0], this.min[1], this.min[2]],
      [this.max[0], this.min[1], this.min[2]],
      [this.min[0], this.max[1], this.min[2]],
      [this.max[0], this.max[1], this.min[2]],
      [this.min[0], this.min[1], this.max[2]],
      [this.max[0], this.min[1], this.max[2]],
      [this.min[0], this.max[1], this.max[2]],
      [this.max[0], this.max[1], this.max[2]],
    ];

    for (const coords of cornerCoords) {
      corner[0] = coords[0];
      corner[1] = coords[1];
      corner[2] = coords[2];
      vec3.transformMat4(corner, corner, matrix);

      for (let i = 0; i < 3; i++) {
        if (corner[i] < newMin[i]) newMin[i] = corner[i];
        if (corner[i] > newMax[i]) newMax[i] = corner[i];
      }
    }

    return new AABB(newMin, newMax);
  }

  /**
   * Check if this AABB intersects another AABB.
   * @param {AABB} other - Other AABB
   * @returns {boolean} True if intersecting
   */
  intersects(other) {
    return (
      this.min[0] <= other.max[0] &&
      this.max[0] >= other.min[0] &&
      this.min[1] <= other.max[1] &&
      this.max[1] >= other.min[1] &&
      this.min[2] <= other.max[2] &&
      this.max[2] >= other.min[2]
    );
  }

  /**
   * Check if a point is inside the AABB.
   * @param {Float32Array} point - Point to test
   * @returns {boolean} True if inside
   */
  containsPoint(point) {
    return (
      point[0] >= this.min[0] &&
      point[0] <= this.max[0] &&
      point[1] >= this.min[1] &&
      point[1] <= this.max[1] &&
      point[2] >= this.min[2] &&
      point[2] <= this.max[2]
    );
  }
}

/**
 * Frustum for visibility culling.
 * Represents the view volume of a camera.
 */
export class Frustum {
  constructor() {
    /**
     * Frustum planes [A, B, C, D] where Ax + By + Cz + D = 0
     * Order: left, right, bottom, top, near, far
     * @type {Array<Float32Array>}
     */
    this.planes = [];
    for (let i = 0; i < 6; i++) {
      this.planes.push(new Float32Array(4));
    }
  }

  /**
   * Extract frustum planes from view-projection matrix.
   * @param {Float32Array} viewProjMatrix - Combined view * projection matrix
   */
  setFromViewProjectionMatrix(viewProjMatrix) {
    const m = viewProjMatrix;

    // Left plane
    this.planes[0][0] = m[3] + m[0];
    this.planes[0][1] = m[7] + m[4];
    this.planes[0][2] = m[11] + m[8];
    this.planes[0][3] = m[15] + m[12];
    this._normalizePlane(this.planes[0]);

    // Right plane
    this.planes[1][0] = m[3] - m[0];
    this.planes[1][1] = m[7] - m[4];
    this.planes[1][2] = m[11] - m[8];
    this.planes[1][3] = m[15] - m[12];
    this._normalizePlane(this.planes[1]);

    // Bottom plane
    this.planes[2][0] = m[3] + m[1];
    this.planes[2][1] = m[7] + m[5];
    this.planes[2][2] = m[11] + m[9];
    this.planes[2][3] = m[15] + m[13];
    this._normalizePlane(this.planes[2]);

    // Top plane
    this.planes[3][0] = m[3] - m[1];
    this.planes[3][1] = m[7] - m[5];
    this.planes[3][2] = m[11] - m[9];
    this.planes[3][3] = m[15] - m[13];
    this._normalizePlane(this.planes[3]);

    // Near plane
    this.planes[4][0] = m[3] + m[2];
    this.planes[4][1] = m[7] + m[6];
    this.planes[4][2] = m[11] + m[10];
    this.planes[4][3] = m[15] + m[14];
    this._normalizePlane(this.planes[4]);

    // Far plane
    this.planes[5][0] = m[3] - m[2];
    this.planes[5][1] = m[7] - m[6];
    this.planes[5][2] = m[11] - m[10];
    this.planes[5][3] = m[15] - m[14];
    this._normalizePlane(this.planes[5]);
  }

  /**
   * Normalize a plane.
   * @param {Float32Array} plane - Plane to normalize
   * @private
   */
  _normalizePlane(plane) {
    const length = Math.sqrt(
      plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]
    );
    if (length > 0) {
      const invLength = 1 / length;
      plane[0] *= invLength;
      plane[1] *= invLength;
      plane[2] *= invLength;
      plane[3] *= invLength;
    }
  }

  /**
   * Check if a point is inside the frustum.
   * @param {Float32Array} point - Point to test
   * @returns {boolean} True if inside
   */
  containsPoint(point) {
    for (const plane of this.planes) {
      const distance =
        plane[0] * point[0] +
        plane[1] * point[1] +
        plane[2] * point[2] +
        plane[3];
      if (distance < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if an AABB is visible in the frustum.
   * Uses conservative intersection test.
   * @param {AABB} aabb - AABB to test
   * @returns {boolean} True if visible (or partially visible)
   */
  intersectsAABB(aabb) {
    for (const plane of this.planes) {
      // Find the vertex of the AABB furthest in the direction of the plane normal
      const px = plane[0] > 0 ? aabb.max[0] : aabb.min[0];
      const py = plane[1] > 0 ? aabb.max[1] : aabb.min[1];
      const pz = plane[2] > 0 ? aabb.max[2] : aabb.min[2];

      // If the furthest vertex is behind the plane, the AABB is outside
      const distance = plane[0] * px + plane[1] * py + plane[2] * pz + plane[3];
      if (distance < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a sphere is visible in the frustum.
   * @param {Float32Array} center - Sphere center
   * @param {number} radius - Sphere radius
   * @returns {boolean} True if visible (or partially visible)
   */
  intersectsSphere(center, radius) {
    for (const plane of this.planes) {
      const distance =
        plane[0] * center[0] +
        plane[1] * center[1] +
        plane[2] * center[2] +
        plane[3];
      if (distance < -radius) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Create view-projection matrix for frustum culling.
 * @param {Float32Array} out - Output matrix
 * @param {Float32Array} viewMatrix - View matrix
 * @param {Float32Array} projMatrix - Projection matrix
 * @returns {Float32Array} View-projection matrix
 */
export function createViewProjectionMatrix(out, viewMatrix, projMatrix) {
  return mat4.multiply(out, projMatrix, viewMatrix);
}
