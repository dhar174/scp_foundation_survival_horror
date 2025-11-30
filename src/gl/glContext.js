/**
 * GL Context Initialization
 * Handles WebGL2 context creation and configuration.
 */

/**
 * Initialize WebGL2 rendering context with default settings
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {WebGL2RenderingContext|null} The WebGL2 context or null if unsupported
 */
export function initGL(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });

  if (!gl) {
    return null;
  }

  // Enable depth testing for 3D rendering
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Enable back-face culling for performance
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // Set clear color to dark gray (SCP facility aesthetic)
  gl.clearColor(0.1, 0.1, 0.1, 1.0);

  return gl;
}
