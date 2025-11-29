/**
 * SCP Foundation Survival Horror - Main Entry Point
 * Initializes WebGL2 context and starts the game loop.
 */

/**
 * Initialize WebGL2 rendering context
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {WebGL2RenderingContext|null} The WebGL2 context or null if unsupported
 */
function initWebGL(canvas) {
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    return null;
  }

  // Enable depth testing for 3D rendering
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Enable back-face culling for performance
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // Set clear color to dark gray
  gl.clearColor(0.1, 0.1, 0.1, 1.0);

  return gl;
}

/**
 * Handle canvas resize to match display size
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 */
function resizeCanvas(canvas, gl) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
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

  const gl = initWebGL(canvas);

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

  // Initial resize
  resizeCanvas(canvas, gl);

  // Handle window resize
  window.addEventListener('resize', () => resizeCanvas(canvas, gl));

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

    // Resize canvas if needed
    resizeCanvas(canvas, gl);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: Update game state
    // TODO: Render scene

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
