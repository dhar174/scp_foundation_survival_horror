/**
 * Mesh Creation Utilities
 * Handles VAO/VBO creation from attribute arrays (positions, normals, UVs, indices).
 */

/**
 * Create a mesh from geometry data with VAO/VBO setup
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {Object} data - Geometry data object
 * @param {Float32Array} data.positions - Vertex positions (xyz per vertex)
 * @param {Float32Array} [data.normals] - Vertex normals (xyz per vertex)
 * @param {Float32Array} [data.uvs] - Texture coordinates (uv per vertex)
 * @param {Uint16Array|Uint32Array} [data.indices] - Triangle indices
 * @returns {Object} Mesh object with VAO and index count
 */
export function createMesh(gl, data) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffers = [];

  // Positions (location = 0)
  if (data.positions) {
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    buffers.push(vboPos);
  }

  // Normals (location = 1)
  if (data.normals) {
    const vboNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
    gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    buffers.push(vboNorm);
  }

  // UVs (location = 2)
  if (data.uvs) {
    const vboUV = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUV);
    gl.bufferData(gl.ARRAY_BUFFER, data.uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    buffers.push(vboUV);
  }

  // Indices
  let indexCount = 0;
  let indexBuffer = null;
  let indexType = gl.UNSIGNED_SHORT;

  if (data.indices) {
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);
    indexCount = data.indices.length;
    indexType =
      data.indices instanceof Uint32Array
        ? gl.UNSIGNED_INT
        : gl.UNSIGNED_SHORT;
    buffers.push(indexBuffer);
  }

  gl.bindVertexArray(null);

  return {
    vao,
    indexCount,
    indexType,
    buffers,
    /**
     * Delete this mesh's GPU resources
     */
    dispose() {
      gl.deleteVertexArray(vao);
      for (const buffer of buffers) {
        gl.deleteBuffer(buffer);
      }
    },
  };
}

/**
 * Build box geometry with correct normals and UVs (24 vertices, 6 faces × 4 verts)
 * @param {number} width - Box width (X axis)
 * @param {number} height - Box height (Y axis)
 * @param {number} depth - Box depth (Z axis)
 * @returns {Object} Geometry data with positions, normals, uvs, and indices
 */
export function buildBox(width, height, depth) {
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  // 24 vertices, 6 faces × 4 verts each
  // prettier-ignore
  const positions = new Float32Array([
    // +Z (front)
    -w, -h, d,   w, -h, d,   w, h, d,  -w, h, d,
    // -Z (back)
     w, -h, -d,  -w, -h, -d,  -w, h, -d,   w, h, -d,
    // +X (right)
     w, -h, d,   w, -h, -d,   w, h, -d,   w, h, d,
    // -X (left)
    -w, -h, -d,  -w, -h, d,  -w, h, d,  -w, h, -d,
    // +Y (top)
    -w, h, d,   w, h, d,   w, h, -d,  -w, h, -d,
    // -Y (bottom)
    -w, -h, -d,   w, -h, -d,   w, -h, d,  -w, -h, d
  ]);

  // prettier-ignore
  const normals = new Float32Array([
    // front (+Z)
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // back (-Z)
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    // right (+X)
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    // left (-X)
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    // top (+Y)
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // bottom (-Y)
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0
  ]);

  // prettier-ignore
  const uvs = new Float32Array([
    // each face: 0,0  1,0  1,1  0,1
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1
  ]);

  // prettier-ignore
  const indices = new Uint16Array([
    0, 1, 2,  0, 2, 3,      // front
    4, 5, 6,  4, 6, 7,      // back
    8, 9, 10,  8, 10, 11,   // right
    12, 13, 14,  12, 14, 15, // left
    16, 17, 18,  16, 18, 19, // top
    20, 21, 22,  20, 22, 23  // bottom
  ]);

  return { positions, normals, uvs, indices };
}
