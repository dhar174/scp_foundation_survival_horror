/**
 * WebGL2 Renderer
 * Main rendering pipeline with camera matrices, lighting, and draw calls.
 */

import * as mat4 from '../math/mat4.js';
import * as vec3 from '../math/vec3.js';
import {
  createProgram,
  getUniformLocations,
  defaultVertexShader,
  defaultFragmentShader,
} from './shader.js';

/**
 * Renderer class for managing WebGL2 rendering
 */
export class Renderer {
  /**
   * Create a new renderer
   * @param {WebGL2RenderingContext} gl - The WebGL2 context
   */
  constructor(gl) {
    this.gl = gl;

    // Create default shader program
    this.program = createProgram(gl, defaultVertexShader, defaultFragmentShader);
    this.uniformLocations = getUniformLocations(gl, this.program);

    // Camera matrices
    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();

    // Camera settings
    this.fov = Math.PI / 4; // 45 degrees
    this.near = 0.1;
    this.far = 100.0;

    // Camera position and orientation
    this.cameraPosition = vec3.create(0, 1, 5);
    this.cameraTarget = vec3.create(0, 0, 0);
    this.cameraUp = vec3.create(0, 1, 0);

    // Lighting settings (directional light)
    this.lightDir = vec3.create(-0.5, -1.0, -0.5);
    vec3.normalize(this.lightDir, this.lightDir);
    this.lightColor = vec3.create(1.0, 0.95, 0.9);
    this.ambientColor = vec3.create(0.2, 0.2, 0.25);

    // Render list
    this.renderables = [];

    // Temp matrices for transforms
    this._modelMatrix = mat4.create();

    // Update initial projection matrix
    this.updateProjectionMatrix();
  }

  /**
   * Update the projection matrix based on canvas size
   */
  updateProjectionMatrix() {
    const gl = this.gl;
    const aspect = gl.canvas.width / gl.canvas.height;
    mat4.perspective(this.projectionMatrix, this.fov, aspect, this.near, this.far);
  }

  /**
   * Update the view matrix based on camera position and target
   */
  updateViewMatrix() {
    mat4.lookAt(
      this.viewMatrix,
      this.cameraPosition,
      this.cameraTarget,
      this.cameraUp
    );
  }

  /**
   * Set camera position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setCameraPosition(x, y, z) {
    vec3.set(this.cameraPosition, x, y, z);
  }

  /**
   * Set camera target (look-at point)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setCameraTarget(x, y, z) {
    vec3.set(this.cameraTarget, x, y, z);
  }

  /**
   * Set directional light direction
   * @param {number} x - X direction
   * @param {number} y - Y direction
   * @param {number} z - Z direction
   */
  setLightDirection(x, y, z) {
    vec3.set(this.lightDir, x, y, z);
    vec3.normalize(this.lightDir, this.lightDir);
  }

  /**
   * Set light color
   * @param {number} r - Red (0-1)
   * @param {number} g - Green (0-1)
   * @param {number} b - Blue (0-1)
   */
  setLightColor(r, g, b) {
    vec3.set(this.lightColor, r, g, b);
  }

  /**
   * Set ambient light color
   * @param {number} r - Red (0-1)
   * @param {number} g - Green (0-1)
   * @param {number} b - Blue (0-1)
   */
  setAmbientColor(r, g, b) {
    vec3.set(this.ambientColor, r, g, b);
  }

  /**
   * Add a renderable object to the render list
   * @param {Object} renderable - Object with mesh, material, and transform
   * @param {Object} renderable.mesh - Mesh object from createMesh
   * @param {Object} [renderable.material] - Material object
   * @param {Float32Array} [renderable.position] - Position [x, y, z]
   * @param {Float32Array} [renderable.rotation] - Rotation [x, y, z] in radians
   * @param {Float32Array} [renderable.scale] - Scale [x, y, z]
   */
  addRenderable(renderable) {
    this.renderables.push(renderable);
  }

  /**
   * Remove a renderable from the render list
   * @param {Object} renderable - Object to remove
   */
  removeRenderable(renderable) {
    const index = this.renderables.indexOf(renderable);
    if (index !== -1) {
      this.renderables.splice(index, 1);
    }
  }

  /**
   * Clear the render list
   */
  clearRenderables() {
    this.renderables = [];
  }

  /**
   * Basic frustum culling stub - returns true if object might be visible
   * @param {Object} _renderable - Object to check
   * @returns {boolean} True if object should be rendered
   */
  isInFrustum(_renderable) {
    // TODO: Implement proper frustum culling with AABB checks
    // For MVP, always return true (render everything)
    return true;
  }

  /**
   * Build model matrix from position, rotation, and scale
   * @param {Float32Array} out - Output matrix
   * @param {Float32Array} position - Position [x, y, z]
   * @param {Float32Array} rotation - Rotation [x, y, z] in radians
   * @param {Float32Array} scale - Scale [x, y, z]
   * @returns {Float32Array} out
   */
  buildModelMatrix(out, position, rotation, scale) {
    mat4.identity(out);

    if (position) {
      mat4.translate(out, out, position);
    }

    if (rotation) {
      mat4.rotateY(out, out, rotation[1]);
      mat4.rotateX(out, out, rotation[0]);
      mat4.rotateZ(out, out, rotation[2]);
    }

    if (scale) {
      mat4.scale(out, out, scale);
    }

    return out;
  }

  /**
   * Render all objects in the render list
   */
  render() {
    const gl = this.gl;

    // Update view matrix
    this.updateViewMatrix();

    // Use shader program
    gl.useProgram(this.program);

    // Set view and projection matrices
    const loc = this.uniformLocations;
    gl.uniformMatrix4fv(loc.u_viewMatrix, false, this.viewMatrix);
    gl.uniformMatrix4fv(loc.u_projMatrix, false, this.projectionMatrix);

    // Set lighting uniforms
    gl.uniform3fv(loc.u_lightDir, this.lightDir);
    gl.uniform3fv(loc.u_lightColor, this.lightColor);
    gl.uniform3fv(loc.u_ambientColor, this.ambientColor);

    // Set diffuse map texture unit
    gl.uniform1i(loc.u_diffuseMap, 0);

    // Render each object
    for (const obj of this.renderables) {
      // Frustum culling check
      if (!this.isInFrustum(obj)) {
        continue;
      }

      // Build model matrix
      this.buildModelMatrix(
        this._modelMatrix,
        obj.position || null,
        obj.rotation || null,
        obj.scale || null
      );

      // Set model matrix uniform
      gl.uniformMatrix4fv(loc.u_modelMatrix, false, this._modelMatrix);

      // Bind material texture
      if (obj.material && obj.material.bind) {
        obj.material.bind(gl, 0);
      }

      // Draw mesh
      if (obj.mesh && obj.mesh.vao) {
        gl.bindVertexArray(obj.mesh.vao);
        if (obj.mesh.indexCount > 0) {
          gl.drawElements(
            gl.TRIANGLES,
            obj.mesh.indexCount,
            obj.mesh.indexType,
            0
          );
        }
        gl.bindVertexArray(null);
      }
    }
  }

  /**
   * Handle canvas resize
   */
  handleResize() {
    this.updateProjectionMatrix();
  }

  /**
   * Clean up renderer resources
   */
  dispose() {
    const gl = this.gl;
    if (this.program) {
      gl.deleteProgram(this.program);
    }
  }
}
