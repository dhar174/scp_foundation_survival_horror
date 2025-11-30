/**
 * Shader Compilation and Linking Utilities
 * Handles WebGL2 shader creation with detailed error logging.
 */

/**
 * Create and compile a shader from source
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - GLSL shader source code
 * @returns {WebGLShader} Compiled shader object
 * @throws {Error} If shader compilation fails
 */
export function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Failed to create shader object');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    const typeName = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';
    console.error(`${typeName} shader compilation failed:\n${info}`);
    gl.deleteShader(shader);
    throw new Error(`${typeName} shader compilation failed: ${info}`);
  }

  return shader;
}

/**
 * Create and link a shader program from vertex and fragment shader sources
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {string} vsSource - Vertex shader GLSL source
 * @param {string} fsSource - Fragment shader GLSL source
 * @returns {WebGLProgram} Linked shader program
 * @throws {Error} If program linking fails
 */
export function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error('Failed to create program object');
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    console.error(`Program linking failed:\n${info}`);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(`Program linking failed: ${info}`);
  }

  // Clean up shaders after successful linking (they are no longer needed)
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return program;
}

/**
 * Get all active uniform locations from a program
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {WebGLProgram} program - The shader program
 * @returns {Object} Map of uniform names to their locations
 */
export function getUniformLocations(gl, program) {
  const uniforms = {};
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) {
      const location = gl.getUniformLocation(program, info.name);
      uniforms[info.name] = location;
    }
  }

  return uniforms;
}

/**
 * Get all active attribute locations from a program
 * @param {WebGL2RenderingContext} gl - The WebGL2 context
 * @param {WebGLProgram} program - The shader program
 * @returns {Object} Map of attribute names to their locations
 */
export function getAttributeLocations(gl, program) {
  const attributes = {};
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < numAttributes; i++) {
    const info = gl.getActiveAttrib(program, i);
    if (info) {
      const location = gl.getAttribLocation(program, info.name);
      attributes[info.name] = location;
    }
  }

  return attributes;
}

// Default vertex shader source (GLSL 300 ES)
export const defaultVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projMatrix;

out vec3 v_worldPos;
out vec3 v_worldNormal;
out vec2 v_uv;

void main() {
  vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_worldNormal = mat3(u_modelMatrix) * a_normal;
  v_uv = a_uv;
  gl_Position = u_projMatrix * u_viewMatrix * worldPos;
}
`;

// Default fragment shader source with basic Lambertian lighting (GLSL 300 ES)
export const defaultFragmentShader = `#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_worldNormal;
in vec2 v_uv;

uniform vec3 u_ambientColor;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform sampler2D u_diffuseMap;

out vec4 outColor;

void main() {
  vec3 baseColor = texture(u_diffuseMap, v_uv).rgb;

  vec3 N = normalize(v_worldNormal);
  vec3 L = normalize(-u_lightDir);

  // Lambertian diffuse lighting
  float ndotl = max(dot(N, L), 0.0);
  vec3 diffuse = ndotl * u_lightColor;

  vec3 color = baseColor * (u_ambientColor + diffuse);

  outColor = vec4(color, 1.0);
}
`;
