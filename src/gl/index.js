/**
 * WebGL Rendering Layer
 * Contains WebGL context initialization and rendering utilities.
 */

export { initGL } from './glContext.js';
export {
  createShader,
  createProgram,
  getUniformLocations,
  getAttributeLocations,
  defaultVertexShader,
  defaultFragmentShader,
} from './shader.js';
export { createMesh, buildBox } from './mesh.js';
export {
  createTextureFromCanvas,
  createTextureFromImageData,
  createSolidColorTexture,
  deleteTexture,
  Material,
} from './material.js';
export { Renderer } from './renderer.js';
