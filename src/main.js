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
import {
  generateConcreteTexture,
  generateMetalFloorTexture,
  buildSCP173Parts,
  generate173Texture,
  mergeMeshParts,
} from './game/index.js';
import {
  Scene,
  Entity,
  Component,
  Input,
  Time,
  DebugOverlay,
  releaseAllTemp,
} from './core/index.js';

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
 * Rotating component for demo purposes
 */
class RotatingComponent extends Component {
  constructor(speed = 0.5) {
    super();
    this.speed = speed;
  }

  update(dt) {
    if (this.entity) {
      this.entity.rotation[1] += dt * this.speed;
    }
  }
}

/**
 * Renderable component that bridges entity and renderer
 */
class RenderableComponent extends Component {
  constructor(mesh, material) {
    super();
    this.mesh = mesh;
    this.material = material;
    this._renderable = null;
  }

  start() {
    // Create renderable object for the renderer
    this._renderable = {
      mesh: this.mesh,
      material: this.material,
      position: this.entity.position,
      rotation: this.entity.rotation,
      scale: this.entity.scale,
    };
  }

  /**
   * Get the renderable object. Initializes if not yet created.
   * @returns {Object|null} Renderable object or null if entity not set
   */
  getRenderable() {
    if (!this._renderable && this.entity) {
      this.start();
    }
    return this._renderable;
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

  // Initialize core systems
  const time = new Time();
  const input = new Input(canvas);
  const debugOverlay = new DebugOverlay(time);
  const scene = new Scene();

  console.log('Core systems initialized');

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

  // Create meshes
  const boxGeometry = buildBox(1, 1, 1);
  const boxMesh = createMesh(gl, boxGeometry);
  const boxMaterial = new Material({ diffuseMap: concreteTexture });

  const floorGeometry = buildBox(10, 0.1, 10);
  const floorMesh = createMesh(gl, floorGeometry);
  const floorMaterial = new Material({ diffuseMap: metalFloorTexture });

  console.log('Building SCP-173 model...');
  const scp173Parts = buildSCP173Parts();
  const scp173Merged = mergeMeshParts(scp173Parts);
  const scp173Mesh = createMesh(gl, scp173Merged);
  const scp173Material = new Material({ diffuseMap: scp173Texture });
  console.log('SCP-173 model built successfully');

  // Create entities using the entity-component system
  // Rotating box entity
  const boxEntity = new Entity();
  boxEntity.position[0] = 0;
  boxEntity.position[1] = 0;
  boxEntity.position[2] = 0;
  boxEntity.addTag('demo');
  boxEntity.addComponent(new RotatingComponent(0.5));
  boxEntity.addComponent(new RenderableComponent(boxMesh, boxMaterial));
  scene.addEntityImmediate(boxEntity);

  // Floor entity
  const floorEntity = new Entity();
  floorEntity.position[0] = 0;
  floorEntity.position[1] = -0.55;
  floorEntity.position[2] = 0;
  floorEntity.addTag('floor');
  floorEntity.addComponent(new RenderableComponent(floorMesh, floorMaterial));
  scene.addEntityImmediate(floorEntity);

  // SCP-173 entity
  const scp173Entity = new Entity();
  scp173Entity.position[0] = -2;
  scp173Entity.position[1] = -0.5;
  scp173Entity.position[2] = 0;
  scp173Entity.addTag('scp');
  scp173Entity.addTag('scp-173');
  scp173Entity.addComponent(new RenderableComponent(scp173Mesh, scp173Material));
  scene.addEntityImmediate(scp173Entity);

  // Add all renderables to the renderer
  for (const entity of scene.entities) {
    const renderableComponent = entity.getComponent(RenderableComponent);
    if (renderableComponent) {
      const renderable = renderableComponent.getRenderable();
      if (renderable) {
        renderer.addRenderable(renderable);
      }
    }
  }

  console.log(`Scene initialized with ${scene.getEntityCount()} entities`);

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

  console.log('Press Tab to toggle debug overlay (FPS, frame time)');

  /**
   * Main game loop
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  function gameLoop(currentTime) {
    // Update time system
    const dt = time.update(currentTime);

    // Update debug overlay
    debugOverlay.setValue('Entities', scene.getEntityCount());
    debugOverlay.setValue('Pointer Lock', input.isPointerLocked ? 'Yes' : 'No');
    debugOverlay.update();

    // Update scene (all entities and their components)
    scene.update(dt);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render the scene
    renderer.render();

    // Clear per-frame input state
    input.clearFrameState();

    // Release temporary pooled objects
    releaseAllTemp();

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
