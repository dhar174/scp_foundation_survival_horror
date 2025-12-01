/**
 * Procedural Texture Generation
 * Creates textures at runtime using Canvas 2D API (no external images).
 */

/**
 * Simple seeded PRNG for deterministic noise generation.
 * @param {number} seed - Initial seed value
 * @returns {function(): number} Random number generator returning values in [0, 1)
 */
function createPRNG(seed) {
  let state = seed >>> 0;
  return function () {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Generate a concrete wall texture with noise and panel grid lines.
 * @param {number} size - Texture size (power of 2, e.g., 256, 512)
 * @param {number} [seed=12345] - Random seed for noise variation
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generateConcreteTexture(size, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base concrete color (#777b80)
  ctx.fillStyle = '#777b80';
  ctx.fillRect(0, 0, size, size);

  // Add noise for texture variation
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Create seeded PRNG for deterministic noise
  const rand = createPRNG(seed);

  // Apply noise to each pixel
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw panel grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  const step = size / 4;

  for (let x = step; x < size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  for (let y = step; y < size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Generate a metal floor texture with checkered plates and bolt details.
 * @param {number} size - Texture size (power of 2, e.g., 256, 512)
 * @param {number} [seed=54321] - Random seed for bolt placement
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generateMetalFloorTexture(size, seed = 54321) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base metal color (#3b3e44)
  ctx.fillStyle = '#3b3e44';
  ctx.fillRect(0, 0, size, size);

  // Checkered plates
  const plateSize = size / 4;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((i + j) % 2 === 0) continue;
      ctx.fillStyle = '#45494f';
      ctx.fillRect(i * plateSize, j * plateSize, plateSize, plateSize);
    }
  }

  // Bolt details using seeded random for consistency
  const rand = createPRNG(seed);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  const boltCount = Math.floor(size / 20);
  const boltRadius = size * 0.004;
  for (let i = 0; i < boltCount; i++) {
    const x = rand() * size;
    const y = rand() * size;
    ctx.beginPath();
    ctx.arc(x, y, boltRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add subtle noise for texture variation
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

/**
 * Door stripe colors by security level
 */
const doorColors = {
  L1: { base: '#6b7078', stripe: '#3cb0ff' }, // Blue
  L2: { base: '#6b7078', stripe: '#3cff77' }, // Green
  L3: { base: '#6b7078', stripe: '#ffc83c' }, // Yellow
  L4: { base: '#6b7078', stripe: '#ff6b3c' }, // Red
  Omni: { base: '#6b7078', stripe: '#ff3ce2' }, // Magenta
};

/**
 * Generate a door texture with color-coded security stripes.
 * @param {string} level - Security level ('L1', 'L2', 'L3', 'L4', 'Omni')
 * @param {number} size - Texture width (height will be size * 2 for tall door)
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generateDoorTexture(level, size) {
  const colors = doorColors[level] || doorColors.L1;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * 2; // Tall door aspect ratio

  const ctx = canvas.getContext('2d');

  // Base door color
  ctx.fillStyle = colors.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Panel grooves
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 2;
  const grooveStart = canvas.height * 0.15;
  const grooveSpacing = canvas.height * 0.3;
  for (let y = grooveStart; y < canvas.height; y += grooveSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Key level stripe (color band)
  ctx.fillStyle = colors.stripe;
  const stripeHeight = canvas.height * 0.1;
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, stripeHeight);

  // "Label" bar (identifier plate)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const margin = size * 0.04;
  const labelHeight = size * 0.1;
  ctx.fillRect(margin, margin, canvas.width - 2 * margin, labelHeight);

  // Add subtle noise for texture
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const rand = createPRNG(
    level && typeof level === 'string' && level.length > 0
      ? level.charCodeAt(0) * 1000
      : 1000
  );

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 10;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

/**
 * Generate SCP-173 skin texture with mottled surface and eye marking.
 * @param {number} size - Texture size (power of 2, e.g., 256, 512)
 * @param {number} [seed=17317] - Random seed for noise variation
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generate173Texture(size, seed = 17317) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base beige/tan color (#d1c9b8)
  ctx.fillStyle = '#d1c9b8';
  ctx.fillRect(0, 0, size, size);

  // Add noise for mottled surface
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const rand = createPRNG(seed);

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  // Face marking - dark circle background
  const cx = size * 0.5;
  const cy = size * 0.35;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Red eye/marking
  ctx.fillStyle = '#ff2f2f';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

/**
 * Generate SCP-106 ("The Old Man") dark decayed skin texture.
 * @param {number} size - Texture size (power of 2, e.g., 256, 512)
 * @param {number} [seed=10610] - Random seed for noise variation
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generate106Texture(size, seed = 10610) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base dark, decayed skin color
  ctx.fillStyle = '#2a2018';
  ctx.fillRect(0, 0, size, size);

  // Add noise for decayed, corroded surface
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const rand = createPRNG(seed);

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 25;
    // Slightly brownish variation
    data[i] = Math.max(0, Math.min(255, data[i] + noise * 1.2)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.8)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  // Add dark splotches for decay effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  for (let i = 0; i < 12; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = rand() * size * 0.04 + size * 0.01;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Generate SCP-049 ("Plague Doctor") robe texture with mask region.
 * @param {number} size - Texture size (power of 2, e.g., 256, 512)
 * @param {number} [seed=4949] - Random seed for noise variation
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generate049Texture(size, seed = 4949) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base black robe color
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);

  // Add subtle fabric texture noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const rand = createPRNG(seed);

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 12;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Lighter mask region (upper portion of texture)
  ctx.fillStyle = '#d4cfc5';
  const maskCx = size * 0.5;
  const maskCy = size * 0.25;
  ctx.beginPath();
  ctx.ellipse(maskCx, maskCy, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask eye holes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(maskCx - size * 0.08, maskCy, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(maskCx + size * 0.08, maskCy, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

/**
 * Generate a keycard texture with color-coded band.
 * @param {string} level - Security level ('L1', 'L2', 'L3', 'L4', 'Omni')
 * @param {number} [size=64] - Texture size
 * @returns {HTMLCanvasElement} Canvas element ready for WebGL upload
 */
export function generateKeycardTexture(level, size = 64) {
  const colors = doorColors[level] || doorColors.L1;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  const cardHeight = Math.round(size * 0.6); // Card aspect ratio, integer for compatibility
  canvas.height = cardHeight;

  const ctx = canvas.getContext('2d');

  // Card base (white/off-white)
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, cardHeight);

  // Color band stripe
  ctx.fillStyle = colors.stripe;
  ctx.fillRect(0, cardHeight * 0.7, canvas.width, cardHeight * 0.3);

  // Border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, cardHeight - 2);

  return canvas;
}

/**
 * Pre-generate and cache common textures.
 * Call this at startup to avoid texture generation during gameplay.
 * @param {Object} [options] - Options for texture generation
 * @param {number} [options.wallSize=512] - Size for wall textures
 * @param {number} [options.floorSize=512] - Size for floor textures
 * @param {number} [options.doorSize=256] - Size for door textures
 * @param {number} [options.scpSize=256] - Size for SCP textures
 * @returns {Object} Cache object with all generated textures
 */
export function prewarmTextures(options = {}) {
  const { wallSize = 512, floorSize = 512, doorSize = 256, scpSize = 256 } = options;

  return {
    concrete: generateConcreteTexture(wallSize),
    metalFloor: generateMetalFloorTexture(floorSize),
    doors: {
      L1: generateDoorTexture('L1', doorSize),
      L2: generateDoorTexture('L2', doorSize),
      L3: generateDoorTexture('L3', doorSize),
      L4: generateDoorTexture('L4', doorSize),
      Omni: generateDoorTexture('Omni', doorSize),
    },
    keycards: {
      L1: generateKeycardTexture('L1'),
      L2: generateKeycardTexture('L2'),
      L3: generateKeycardTexture('L3'),
      L4: generateKeycardTexture('L4'),
      Omni: generateKeycardTexture('Omni'),
    },
    scp173: generate173Texture(scpSize),
    scp106: generate106Texture(scpSize),
    scp049: generate049Texture(scpSize),
  };
}
