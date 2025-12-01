/**
 * Material and Texture Utilities
 * Handles texture creation from canvas, ImageData, and sampler setup.
 */

/**
 * Create a WebGL texture from a canvas element
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {HTMLCanvasElement} canvas - Source canvas with pixel data
 * @param {Object} [options] - Texture options
 * @param {boolean} [options.generateMipmaps=true] - Generate mipmaps
 * @param {number} [options.wrapS=gl.REPEAT] - Wrap mode for S coordinate
 * @param {number} [options.wrapT=gl.REPEAT] - Wrap mode for T coordinate
 * @param {number} [options.minFilter] - Minification filter
 * @param {number} [options.magFilter=gl.LINEAR] - Magnification filter
 * @returns {WebGLTexture} Created texture
 */
export function createTextureFromCanvas(gl, canvas, options = {}) {
  const {
    generateMipmaps = true,
    wrapS = gl.REPEAT,
    wrapT = gl.REPEAT,
    minFilter = generateMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
    magFilter = gl.LINEAR,
  } = options;

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  if (generateMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}

/**
 * Create a WebGL texture from ImageData
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {ImageData} imageData - Source image data
 * @param {Object} [options] - Texture options (same as createTextureFromCanvas)
 * @returns {WebGLTexture} Created texture
 */
export function createTextureFromImageData(gl, imageData, options = {}) {
  const {
    generateMipmaps = true,
    wrapS = gl.REPEAT,
    wrapT = gl.REPEAT,
    minFilter = generateMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
    magFilter = gl.LINEAR,
  } = options;

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    imageData.width,
    imageData.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    imageData.data
  );

  if (generateMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}

/**
 * Create a solid color texture (1x1 pixel)
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @param {number} [a=255] - Alpha component (0-255)
 * @returns {WebGLTexture} Created texture
 */
export function createSolidColorTexture(gl, r, g, b, a = 255) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  const data = new Uint8Array([r, g, b, a]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}

/**
 * Delete a texture and free GPU resources
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {WebGLTexture} texture - Texture to delete
 */
export function deleteTexture(gl, texture) {
  if (texture) {
    gl.deleteTexture(texture);
  }
}

/**
 * Material class for managing shader uniforms and textures
 */
export class Material {
  /**
   * Create a new material
   * @param {Object} options - Material options
   * @param {WebGLTexture} [options.diffuseMap] - Diffuse texture
   * @param {number[]} [options.color] - Base color [r, g, b] (0-1)
   */
  constructor(options = {}) {
    this.diffuseMap = options.diffuseMap || null;
    this.color = options.color || [1, 1, 1];
  }

  /**
   * Bind this material's textures for rendering
   * @param {WebGL2RenderingContext} gl - The WebGL2 context
   * @param {number} [textureUnit=0] - Texture unit to bind diffuse map
   */
  bind(gl, textureUnit = 0) {
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    if (this.diffuseMap) {
      gl.bindTexture(gl.TEXTURE_2D, this.diffuseMap);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}
