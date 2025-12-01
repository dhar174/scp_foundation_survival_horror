/**
 * SCP Foundation Survival Horror - Main Entry Point
 * Initializes WebGL2 context and starts the game loop.
 */

import {
  initGL,
  buildBox,
  createMesh,
  createTextureFromCanvas,
  Material,
  Renderer,
} from './gl/index.js';
import * as vec3 from './math/vec3.js';
import {
  generateConcreteTexture,
  generateMetalFloorTexture,
  buildSCP173Parts,
  generate173Texture,
  mergeMeshParts,
} from './game/index.js';

/**
 * Handle canvas resize to match display size
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {Renderer} [renderer] - Optional renderer to update
 */
function resizeCanvas(canvas, gl, renderer) {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const width = Math.round(displayWidth * dpr);
  const height = Math.round(displayHeight * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    if (renderer) {
      renderer.handleResize();
    }
  }
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  console.error(message);
  const errorDiv = document.getElementById('error-message');
  const instructions = document.getElementById('instructions');

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  if (instructions) {
    instructions.style.display = 'none';
  }
}

/**
 * Main initialization function
 */
function main() {
  const canvas = document.getElementById('game-canvas');

  if (!canvas) {
    showError('Fatal Error: Canvas element not found.');
    return;
  }

  const gl = initGL(canvas);

  if (!gl) {
    showError(
      'WebGL2 is not supported by your browser.\n' +
        'Please use a modern browser with WebGL2 support.'
    );
    return;
  }

  // Log successful initialization
  console.log('WebGL2 context initialized successfully');
  console.log('Vendor:', gl.getParameter(gl.VENDOR));
  console.log('Renderer:', gl.getParameter(gl.RENDERER));

  // Create renderer
  const renderer = new Renderer(gl);

  // Initial resize
  resizeCanvas(canvas, gl, renderer);

  // Handle window resize
  window.addEventListener('resize', () => resizeCanvas(canvas, gl, renderer));

  // Generate procedural textures
  console.log('Generating procedural textures...');
  const concreteCanvas = generateConcreteTexture(512, 12345);
  const metalFloorCanvas = generateMetalFloorTexture(512);
  const scp173Canvas = generate173Texture(256);

  const concreteTexture = createTextureFromCanvas(gl, concreteCanvas);
  const metalFloorTexture = createTextureFromCanvas(gl, metalFloorCanvas);
  const scp173Texture = createTextureFromCanvas(gl, scp173Canvas);
  console.log('Procedural textures generated successfully');

  // Create a wall box with concrete texture
  const boxGeometry = buildBox(1, 1, 1);
  const boxMesh = createMesh(gl, boxGeometry);
  const boxMaterial = new Material({ diffuseMap: concreteTexture });

  // Add a box to render - positioned at origin
  const box1 = {
    mesh: boxMesh,
    material: boxMaterial,
    position: vec3.create(0, 0, 0),
    rotation: vec3.create(0, 0, 0),
    scale: vec3.create(1, 1, 1),
  };
  renderer.addRenderable(box1);

  // Add a floor with metal floor texture
  const floorGeometry = buildBox(10, 0.1, 10);
  const floorMesh = createMesh(gl, floorGeometry);
  const floorMaterial = new Material({ diffuseMap: metalFloorTexture });

  const floor = {
    mesh: floorMesh,
    material: floorMaterial,
    position: vec3.create(0, -0.55, 0),
    rotation: vec3.create(0, 0, 0),
    scale: vec3.create(1, 1, 1),
  };
  renderer.addRenderable(floor);

  // Build and add SCP-173 using procedural geometry
  console.log('Building SCP-173 model...');
  const scp173Parts = buildSCP173Parts();
  const scp173Merged = mergeMeshParts(scp173Parts);
  const scp173Mesh = createMesh(gl, scp173Merged);
  const scp173Material = new Material({ diffuseMap: scp173Texture });

  const scp173 = {
    mesh: scp173Mesh,
    material: scp173Material,
    position: vec3.create(-2, -0.5, 0),
    rotation: vec3.create(0, 0, 0),
    scale: vec3.create(1, 1, 1),
  };
  renderer.addRenderable(scp173);
  console.log('SCP-173 model built successfully');

  // Set camera position for good view
  renderer.setCameraPosition(4, 2, 6);
  renderer.setCameraTarget(0, 0, 0);

  // Set lighting
  renderer.setLightDirection(-0.5, -1.0, -0.3);
  renderer.setLightColor(1.0, 0.95, 0.9);
  renderer.setAmbientColor(0.15, 0.15, 0.2);

  // Hide instructions when rendering starts
  const instructions = document.getElementById('instructions');
  if (instructions) {
    instructions.style.display = 'none';
  }

  // Track delta time for updates
  let lastTime = 0;

  /**
   * Main game loop
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  function gameLoop(currentTime) {
    // Calculate delta time in seconds, clamped to avoid large steps
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // Rotate the box for visual demonstration
    box1.rotation[1] += dt * 0.5; // Rotate around Y axis

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render the scene
    renderer.render();

    // Continue the loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
