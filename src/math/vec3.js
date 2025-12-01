/**
 * 3D Vector Utilities
 * Basic vec3 operations for graphics calculations.
 */

/**
 * Create a new vec3
 * @param {number} [x=0] - X component
 * @param {number} [y=0] - Y component
 * @param {number} [z=0] - Z component
 * @returns {Float32Array} New vec3
 */
export function create(x = 0, y = 0, z = 0) {
  const out = new Float32Array(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Set the components of a vec3
 * @param {Float32Array} out - Destination vector
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @returns {Float32Array} out
 */
export function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Copy a vec3
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - Source vector
 * @returns {Float32Array} out
 */
export function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Add two vec3s
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - First operand
 * @param {Float32Array} b - Second operand
 * @returns {Float32Array} out
 */
export function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

/**
 * Subtract vec3 b from vec3 a
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - First operand
 * @param {Float32Array} b - Second operand
 * @returns {Float32Array} out
 */
export function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

/**
 * Scale a vec3 by a scalar
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - Vector to scale
 * @param {number} s - Scalar
 * @returns {Float32Array} out
 */
export function scale(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  return out;
}

/**
 * Normalize a vec3
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - Vector to normalize
 * @returns {Float32Array} out
 */
export function normalize(out, a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let len = x * x + y * y + z * z;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
  } else {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}

/**
 * Calculate the length of a vec3
 * @param {Float32Array} a - Vector
 * @returns {number} Length
 */
export function length(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

/**
 * Calculate the squared length of a vec3
 * @param {Float32Array} a - Vector
 * @returns {number} Squared length
 */
export function squaredLength(a) {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
}

/**
 * Calculate the dot product of two vec3s
 * @param {Float32Array} a - First operand
 * @param {Float32Array} b - Second operand
 * @returns {number} Dot product
 */
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Calculate the cross product of two vec3s
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - First operand
 * @param {Float32Array} b - Second operand
 * @returns {Float32Array} out
 */
export function cross(out, a, b) {
  const ax = a[0],
    ay = a[1],
    az = a[2];
  const bx = b[0],
    by = b[1],
    bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;

  return out;
}

/**
 * Negate a vec3
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - Vector to negate
 * @returns {Float32Array} out
 */
export function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}

/**
 * Transform a vec3 by a mat4
 * @param {Float32Array} out - Destination vector
 * @param {Float32Array} a - Vector to transform
 * @param {Float32Array} m - Matrix to transform with
 * @returns {Float32Array} out
 */
export function transformMat4(out, a, m) {
  const x = a[0],
    y = a[1],
    z = a[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1.0;

  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;

  return out;
}
