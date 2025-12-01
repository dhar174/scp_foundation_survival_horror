/**
 * Procedural Geometry Generation
 * Builds meshes for environment and characters from code (no external assets).
 */

import { buildBox } from '../gl/mesh.js';

/**
 * Build SCP-173 model parts from boxes.
 * Returns an array of part definitions with mesh data and relative offsets.
 * @returns {Array<{mesh: Object, offset: number[]}>} Array of mesh parts with offsets
 */
export function buildSCP173Parts() {
  const parts = [];

  // Base (pedestal/feet)
  parts.push({
    mesh: buildBox(0.6, 0.2, 0.6),
    offset: [0, 0.1, 0],
  });

  // Torso (main body)
  parts.push({
    mesh: buildBox(0.5, 1.4, 0.4),
    offset: [0, 1.0, 0],
  });

  // Head
  parts.push({
    mesh: buildBox(0.4, 0.4, 0.4),
    offset: [0, 1.9, 0],
  });

  // Left arm
  parts.push({
    mesh: buildBox(0.15, 0.8, 0.15),
    offset: [-0.3, 1.2, 0],
  });

  // Right arm
  parts.push({
    mesh: buildBox(0.15, 0.8, 0.15),
    offset: [0.3, 1.2, 0],
  });

  return parts;
}

/**
 * Build SCP-106 ("The Old Man") model parts from boxes.
 * Returns an array of part definitions with mesh data and relative offsets.
 * @returns {Array<{mesh: Object, offset: number[]}>} Array of mesh parts with offsets
 */
export function buildSCP106Parts() {
  const parts = [];

  // Torso
  parts.push({
    mesh: buildBox(0.6, 1.2, 0.3),
    offset: [0, 1.0, 0],
  });

  // Head
  parts.push({
    mesh: buildBox(0.4, 0.4, 0.3),
    offset: [0, 1.8, 0],
  });

  // Left arm
  parts.push({
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [-0.45, 1.1, 0],
  });

  // Right arm
  parts.push({
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [0.45, 1.1, 0],
  });

  // Left leg
  parts.push({
    mesh: buildBox(0.25, 1.0, 0.25),
    offset: [-0.2, 0.5, 0],
  });

  // Right leg
  parts.push({
    mesh: buildBox(0.25, 1.0, 0.25),
    offset: [0.2, 0.5, 0],
  });

  return parts;
}

/**
 * Build SCP-049 ("Plague Doctor") model parts from boxes.
 * Returns an array of part definitions with mesh data and relative offsets.
 * @returns {Array<{mesh: Object, offset: number[]}>} Array of mesh parts with offsets
 */
export function buildSCP049Parts() {
  const parts = [];

  // Torso (robed body)
  parts.push({
    mesh: buildBox(0.7, 1.4, 0.4),
    offset: [0, 1.0, 0],
  });

  // Head (with plague doctor mask shape - elongated)
  parts.push({
    mesh: buildBox(0.35, 0.4, 0.5),
    offset: [0, 1.9, 0],
  });

  // Left arm (sleeved)
  parts.push({
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [-0.5, 1.1, 0],
  });

  // Right arm (sleeved)
  parts.push({
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [0.5, 1.1, 0],
  });

  // Robe base (wider at bottom)
  parts.push({
    mesh: buildBox(0.8, 0.3, 0.5),
    offset: [0, 0.15, 0],
  });

  return parts;
}

/**
 * Merge multiple mesh parts into a single combined mesh.
 * Useful for reducing draw calls by combining SCP body parts.
 * @param {Array<{mesh: Object, offset: number[]}>} parts - Array of mesh parts with offsets
 * @returns {Object} Combined mesh data with positions, normals, uvs, indices
 */
export function mergeMeshParts(parts) {
  // Calculate total vertex and index counts
  let totalVertices = 0;
  let totalIndices = 0;

  for (const part of parts) {
    totalVertices += part.mesh.positions.length / 3;
    totalIndices += part.mesh.indices.length;
  }

  // Allocate typed arrays for combined mesh
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const indices = new Uint16Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;
  let vertexCount = 0;

  for (const part of parts) {
    const mesh = part.mesh;
    const offset = part.offset;

    // Copy positions with offset applied
    const numVerts = mesh.positions.length / 3;
    for (let i = 0; i < numVerts; i++) {
      positions[vertexOffset + i * 3 + 0] = mesh.positions[i * 3 + 0] + offset[0];
      positions[vertexOffset + i * 3 + 1] = mesh.positions[i * 3 + 1] + offset[1];
      positions[vertexOffset + i * 3 + 2] = mesh.positions[i * 3 + 2] + offset[2];
    }

    // Copy normals (unchanged)
    normals.set(mesh.normals, vertexOffset);

    // Copy UVs
    const uvOffset = (vertexOffset / 3) * 2;
    uvs.set(mesh.uvs, uvOffset);

    // Copy indices with vertex offset
    for (let i = 0; i < mesh.indices.length; i++) {
      indices[indexOffset + i] = mesh.indices[i] + vertexCount;
    }

    vertexOffset += mesh.positions.length;
    indexOffset += mesh.indices.length;
    vertexCount += numVerts;
  }

  return { positions, normals, uvs, indices };
}

/**
 * Generate corridor segment geometry.
 * Creates floor, ceiling, and walls for a single corridor segment.
 * @param {number} length - Corridor segment length (Z axis)
 * @param {number} [width=3] - Corridor width (X axis)
 * @param {number} [height=2.6] - Corridor height (Y axis)
 * @returns {Object} Corridor segment with floor, ceiling, leftWall, rightWall meshes and colliders
 */
export function generateCorridorSegment(length, width = 3, height = 2.6) {
  const wallThickness = 0.1;

  return {
    floor: {
      mesh: buildBox(width, wallThickness, length),
      offset: [0, 0, 0],
    },
    ceiling: {
      mesh: buildBox(width, wallThickness, length),
      offset: [0, height, 0],
    },
    leftWall: {
      mesh: buildBox(wallThickness, height, length),
      offset: [-width / 2, height / 2, 0],
    },
    rightWall: {
      mesh: buildBox(wallThickness, height, length),
      offset: [width / 2, height / 2, 0],
    },
    colliders: [
      // Floor collider
      { min: [-width / 2, -wallThickness, -length / 2], max: [width / 2, 0, length / 2] },
      // Ceiling collider
      { min: [-width / 2, height, -length / 2], max: [width / 2, height + wallThickness, length / 2] },
      // Left wall collider
      { min: [-width / 2 - wallThickness, 0, -length / 2], max: [-width / 2, height, length / 2] },
      // Right wall collider
      { min: [width / 2, 0, -length / 2], max: [width / 2 + wallThickness, height, length / 2] },
    ],
    dimensions: { width, height, length },
  };
}

/**
 * Generate a basic room geometry.
 * Creates floor, ceiling, and walls for a rectangular room.
 * @param {Object} config - Room configuration
 * @param {number} config.width - Room width (X axis)
 * @param {number} config.depth - Room depth (Z axis)
 * @param {number} [config.height=2.6] - Room height (Y axis)
 * @param {boolean} [config.openFront=false] - Leave front wall open (for door placement)
 * @returns {Object} Room geometry with floor, ceiling, walls, spawn points, and colliders
 */
export function generateRoom(config) {
  const { width, depth, height = 2.6, openFront = false } = config;
  const wallThickness = 0.1;

  const parts = {
    floor: {
      mesh: buildBox(width, wallThickness, depth),
      offset: [0, 0, 0],
    },
    ceiling: {
      mesh: buildBox(width, wallThickness, depth),
      offset: [0, height, 0],
    },
    backWall: {
      mesh: buildBox(width, height, wallThickness),
      offset: [0, height / 2, -depth / 2],
    },
    leftWall: {
      mesh: buildBox(wallThickness, height, depth),
      offset: [-width / 2, height / 2, 0],
    },
    rightWall: {
      mesh: buildBox(wallThickness, height, depth),
      offset: [width / 2, height / 2, 0],
    },
  };

  // Optionally add front wall
  if (!openFront) {
    parts.frontWall = {
      mesh: buildBox(width, height, wallThickness),
      offset: [0, height / 2, depth / 2],
    };
  }

  // Define spawn points within the room
  const spawnPoints = {
    playerStart: [0, 0.1, depth / 2 - 1], // Near front of room
    scpSpawn: [0, 0.1, -depth / 2 + 1], // Near back of room
    keycardSpawn: [width / 4, 0.5, 0], // Side of room on a stand
    doorPosition: [0, 0, depth / 2], // Center of front wall
  };

  // Define colliders for collision detection
  const colliders = [
    // Floor
    { min: [-width / 2, -wallThickness, -depth / 2], max: [width / 2, 0, depth / 2] },
    // Ceiling
    { min: [-width / 2, height, -depth / 2], max: [width / 2, height + wallThickness, depth / 2] },
    // Back wall
    { min: [-width / 2, 0, -depth / 2 - wallThickness], max: [width / 2, height, -depth / 2] },
    // Left wall
    { min: [-width / 2 - wallThickness, 0, -depth / 2], max: [-width / 2, height, depth / 2] },
    // Right wall
    { min: [width / 2, 0, -depth / 2], max: [width / 2 + wallThickness, height, depth / 2] },
  ];

  // Add front wall collider if not open
  if (!openFront) {
    colliders.push({
      min: [-width / 2, 0, depth / 2],
      max: [width / 2, height, depth / 2 + wallThickness],
    });
  }

  // Navigation waypoints for SCP movement
  const navNodes = [
    [0, 0.1, 0], // Center
    [width / 4, 0.1, depth / 4], // Front-right quadrant
    [-width / 4, 0.1, depth / 4], // Front-left quadrant
    [width / 4, 0.1, -depth / 4], // Back-right quadrant
    [-width / 4, 0.1, -depth / 4], // Back-left quadrant
  ];

  return {
    parts,
    colliders,
    spawnPoints,
    navNodes,
    dimensions: { width, height, depth },
  };
}

/**
 * Generate a simple door frame geometry.
 * Creates the door panel and frame.
 * @param {number} [doorWidth=1.2] - Door width
 * @param {number} [doorHeight=2.2] - Door height
 * @param {number} [doorDepth=0.1] - Door thickness
 * @returns {Object} Door geometry with panel mesh and collider
 */
export function generateDoorGeometry(doorWidth = 1.2, doorHeight = 2.2, doorDepth = 0.1) {
  return {
    panel: {
      mesh: buildBox(doorWidth, doorHeight, doorDepth),
      offset: [0, doorHeight / 2, 0],
    },
    collider: {
      min: [-doorWidth / 2, 0, -doorDepth / 2],
      max: [doorWidth / 2, doorHeight, doorDepth / 2],
    },
    dimensions: { width: doorWidth, height: doorHeight, depth: doorDepth },
  };
}
