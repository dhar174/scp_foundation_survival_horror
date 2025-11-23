# scp_foundation_survival_horror
A survival horror game set in the SCP Foundation universe

This is a browser-based SCP Foundation survival horror game where you explore a procedurally generated containment site during a catastrophic breach and try to recontain the anomalies before they kill you. Built on custom WebGL with all graphics generated in code, the game creates stark concrete corridors, metal floors, secure doors, and minimalist SCP models without any external art assets. You navigate the facility in first-person, using keycards to open higher-security areas while conserving resources and paying attention to each SCP’s unique rules—like SCP-173, which only moves when you’re not looking and can snap your neck in an instant. Progression comes from locking down escaped SCPs via environmental puzzles and containment procedures rather than just killing enemies, turning each encounter into a tense, rule-based challenge. The MVP focuses on a short but replayable slice of the site, culminating in a terrifying recontainment of SCP-173 that showcases the game’s core loop of exploration, observation, and barely controlled fear.

Here’s a single, self-contained document you can copy and hand to the team.

---

# SCP Foundation Web Game – Custom WebGL MVP Spec (Procedural Graphics Only)

## 1. Goals & Constraints

**Goal:**
Build a browser-based SCP Foundation survival horror demo where you recontain escaped SCPs, running on **custom WebGL** with **no external art assets**. All graphics (meshes, textures) are **generated procedurally in code**, either at startup or in-engine.

**Core demo target (MVP):**

* Single level: a small SCP facility slice with:

  * Corridors and a room
  * Doors gated by keycard level
  * SCP-173 encounter (primary)
* Third-person or first-person controller (you can decide, but below assumes FPS-style camera)
* Procedural geometry and textures for:

  * Walls, floors, ceilings, doors
  * Simple SCP models (173, 106, 049, but MVP can start with 173 only)

This document focuses on:

* Engine structure (custom WebGL)
* How to generate all graphics procedurally
* How to wire it into a playable SCP-173 demo

---

## 2. Project Structure

### 2.1 Files & Folders

Basic layout:

```text
index.html        # Canvas + script tags
src/
  main.js         # Entry point, game loop
  gl/
    glContext.js  # WebGL2 setup
    shader.js     # Shader compilation/linking
    mesh.js       # VAO/VBO helpers
    material.js   # Textures, uniforms
    renderer.js   # Render pipeline (camera, lights)
  math/
    vec3.js
    mat4.js       # Or use gl-matrix instead of rolling your own
  core/
    entity.js     # Base entity + components
    component.js  # Base component
    scene.js      # Scene graph, entity list
    input.js      # Keyboard/mouse handling
    time.js       # deltaTime
  game/
    player.js     # Player movement, camera
    scp173.js     # SCP-173 behavior
    scp106.js     # (later)
    scp049.js     # (later)
    doors.js      # Door & keycard logic
    keycards.js
    levels.js     # Procedural level generation
    gameState.js  # Mission/state machine
```

No external assets (models/textures) are required: everything is generated in code.

---

## 3. WebGL Setup & Rendering Pipeline

### 3.1 WebGL2 Context

`gl/glContext.js`:

```js
export function initGL(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: true });
  if (!gl) {
    throw new Error('WebGL2 not supported');
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  return gl;
}
```

### 3.2 Shader Compilation

`gl/shader.js` (skeleton):

```js
export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Shader compile failed');
  }
  return shader;
}

export function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Program link failed');
  }
  return program;
}
```

### 3.3 Base Shader (Single General-Purpose)

**Vertex shader (GLSL):**

```glsl
#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

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
```

**Fragment shader (GLSL, basic diffuse + flashlight):**

```glsl
#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_worldNormal;
in vec2 v_uv;

uniform vec3 u_ambientColor;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_flashlightPos;
uniform vec3 u_flashlightDir;
uniform float u_flashlightAngle; // cos(angle)
uniform sampler2D u_diffuseMap;

out vec4 outColor;

void main() {
  vec3 baseColor = texture(u_diffuseMap, v_uv).rgb;

  vec3 N = normalize(v_worldNormal);
  vec3 L = normalize(-u_lightDir);

  float ndotl = max(dot(N, L), 0.0);
  vec3 diffuse = ndotl * u_lightColor;

  // Simple spotlight
  vec3 toFragment = normalize(v_worldPos - u_flashlightPos);
  float spotFactor = dot(-toFragment, normalize(u_flashlightDir));
  float spotlight = smoothstep(u_flashlightAngle, u_flashlightAngle + 0.05, spotFactor);

  vec3 color = baseColor * (u_ambientColor + diffuse + spotlight * 0.6 * u_lightColor);

  outColor = vec4(color, 1.0);
}
```

This single shader can handle all environment & SCP rendering for the MVP.

---

## 4. Core Engine Structures

### 4.1 Entity & Components

`core/entity.js`:

```js
export class Entity {
  constructor() {
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0]; // Euler or use quaternions if you prefer
    this.scale = [1, 1, 1];
    this.components = [];
    this.active = true;
  }

  addComponent(component) {
    component.entity = this;
    this.components.push(component);
  }

  update(dt) {
    if (!this.active) return;
    for (const c of this.components) {
      if (c.update) c.update(dt);
    }
  }
}
```

`core/scene.js`:

```js
export class Scene {
  constructor() {
    this.entities = [];
  }

  addEntity(ent) {
    this.entities.push(ent);
  }

  update(dt) {
    for (const e of this.entities) e.update(dt);
  }

  render(renderer) {
    renderer.renderScene(this);
  }
}
```

### 4.2 Mesh Creation Helper

`gl/mesh.js` (simplified):

```js
export function createMesh(gl, data) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Positions
  const vboPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
  gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  // Normals
  const vboNorm = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
  gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

  // UVs
  const vboUV = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboUV);
  gl.bufferData(gl.ARRAY_BUFFER, data.uvs, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

  // Indices
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  return {
    vao,
    indexCount: data.indices.length
  };
}
```

---

## 5. Procedural Geometry: Boxes, Corridors, Rooms, Doors

Everything 3D is built from code.

### 5.1 Core Primitive: Box Mesh Generator

Use 24 vertices (4 per face) for correct normals & UVs:

```js
export function buildBox(width, height, depth) {
  const w = width / 2, h = height / 2, d = depth / 2;

  // 24 vertices, 6 faces x 4 verts
  const positions = new Float32Array([
    // +Z (front)
    -w,-h, d,   w,-h, d,   w, h, d,  -w, h, d,
    // -Z (back)
     w,-h,-d,  -w,-h,-d,  -w, h,-d,   w, h,-d,
    // +X (right)
     w,-h, d,   w,-h,-d,   w, h,-d,   w, h, d,
    // -X (left)
    -w,-h,-d,  -w,-h, d,  -w, h, d,  -w, h,-d,
    // +Y (top)
    -w, h, d,   w, h, d,   w, h,-d,  -w, h,-d,
    // -Y (bottom)
    -w,-h,-d,   w,-h,-d,   w,-h, d,  -w,-h, d
  ]);

  const normals = new Float32Array([
    // front
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    // back
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    // right
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    // left
    -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    // top
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    // bottom
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0
  ]);

  const uvs = new Float32Array([
    // each face: 0,0  1,0  1,1  0,1
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1
  ]);

  const indices = new Uint16Array([
    0,1,2, 0,2,3,      // front
    4,5,6, 4,6,7,      // back
    8,9,10, 8,10,11,   // right
    12,13,14, 12,14,15,// left
    16,17,18, 16,18,19,// top
    20,21,22, 20,22,23 // bottom
  ]);

  return { positions, normals, uvs, indices };
}
```

### 5.2 Corridor Segments

Corridor segment: 4m long, 3m wide, 2.6m high.

```js
function buildCorridorSegment() {
  const pieces = [];

  // Floor
  pieces.push({
    mesh: buildBox(4, 0.1, 3),
    position: [0, -1.3, 0],
    textureType: 'floor'
  });

  // Ceiling
  pieces.push({
    mesh: buildBox(4, 0.1, 3),
    position: [0,  1.3, 0],
    textureType: 'ceiling'
  });

  // Left wall
  pieces.push({
    mesh: buildBox(4, 2.6, 0.1),
    position: [0, 0, -1.5],
    textureType: 'wall'
  });

  // Right wall
  pieces.push({
    mesh: buildBox(4, 2.6, 0.1),
    position: [0, 0,  1.5],
    textureType: 'wall'
  });

  return pieces;
}
```

Create a corridor:

```js
export function generateCorridor(lengthSegments) {
  const pieces = [];
  const segmentLength = 4;
  for (let i = 0; i < lengthSegments; i++) {
    const seg = buildCorridorSegment();
    const offsetX = i * segmentLength;
    for (const p of seg) {
      pieces.push({
        mesh: p.mesh,
        position: [p.position[0] + offsetX, p.position[1], p.position[2]],
        textureType: p.textureType
      });
    }
  }
  return pieces;
}
```

### 5.3 Rooms

A simple rectangular room made of boxes:

* Floor box
* Ceiling box
* Four wall boxes
* Optional door opening (just omit a wall and place a door)

---

## 6. Procedural Textures (Canvas → WebGL)

All textures are generated during initialization using `<canvas>`.

### 6.1 Utility: Canvas to Texture

```js
export function createTextureFromCanvas(gl, canvas) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}
```

### 6.2 Concrete Wall Texture

```js
export function generateConcreteTexture(size, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base fill
  ctx.fillStyle = '#777b80';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Simple PRNG
  let rnd = seed;
  const rand = () => {
    rnd = (rnd * 1664525 + 1013904223) >>> 0;
    return rnd / 0xffffffff;
  };

  // Noise
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 30;
    data[i]   = Math.max(0, Math.min(255, data[i]   + n));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + n));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Panel lines
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
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
```

### 6.3 Metal Floor Texture

```js
export function generateMetalFloorTexture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3b3e44';
  ctx.fillRect(0, 0, size, size);

  const plateSize = size / 4;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((i + j) % 2 === 0) continue;
      ctx.fillStyle = '#45494f';
      ctx.fillRect(i * plateSize, j * plateSize, plateSize, plateSize);
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
```

### 6.4 Door Textures by Key Level

```js
const doorColors = {
  L1:   { base: '#6b7078', stripe: '#3cb0ff' },
  L2:   { base: '#6b7078', stripe: '#3cff77' },
  L3:   { base: '#6b7078', stripe: '#ffc83c' },
  L4:   { base: '#6b7078', stripe: '#ff6b3c' },
  Omni: { base: '#6b7078', stripe: '#ff3ce2' }
};

export function generateDoorTexture(size, baseColor, stripeColor) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * 2; // tall

  const ctx = canvas.getContext('2d');

  // Base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Panel grooves
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  for (let y = 40; y < canvas.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Key level stripe
  ctx.fillStyle = stripeColor;
  const stripeHeight = canvas.height * 0.1;
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, stripeHeight);

  // “Label” bar (just a rectangle)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, canvas.width - 20, 20);

  return canvas;
}
```

### 6.5 SCP Textures (Example: SCP-173)

```js
export function generate173Texture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d1c9b8';
  ctx.fillRect(0, 0, size, size);

  // Add some noise (same pattern as concrete, with lower strength)

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 20;
    data[i]   = Math.max(0, Math.min(255, data[i]   + n));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + n));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // “Face” mark
  const cx = size * 0.5;
  const cy = size * 0.35;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff2f2f';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}
```

Similar concept for SCP-106 (dark noisy) and SCP-049 (black robe base with lighter mask region).

---

## 7. Procedural SCP Models (Built From Boxes)

No modeling software: SCPs are composed at runtime from scaled boxes.

### 7.1 SCP-173

```js
export function buildSCP173Parts() {
  const parts = [];

  // Base
  parts.push({
    mesh: buildBox(0.6, 0.2, 0.6),
    offset: [0, 0.1, 0]
  });

  // Torso
  parts.push({
    mesh: buildBox(0.5, 1.4, 0.4),
    offset: [0, 1.0, 0]
  });

  // Head
  parts.push({
    mesh: buildBox(0.4, 0.4, 0.4),
    offset: [0, 1.9, 0]
  });

  // Left arm
  parts.push({
    mesh: buildBox(0.15, 0.8, 0.15),
    offset: [-0.3, 1.2, 0]
  });

  // Right arm
  parts.push({
    mesh: buildBox(0.15, 0.8, 0.15),
    offset: [0.3, 1.2, 0]
  });

  return parts;
}
```

At render time, you either:

* Merge all parts into a single mesh once, or
* Draw each part with `modelMatrix = entityTransform * partOffset`.

### 7.2 SCP-106 (Example)

```js
export function buildSCP106Parts() {
  const parts = [];

  parts.push({ // torso
    mesh: buildBox(0.6, 1.2, 0.3),
    offset: [0, 1.0, 0]
  });
  parts.push({ // head
    mesh: buildBox(0.4, 0.4, 0.3),
    offset: [0, 1.8, 0]
  });
  parts.push({ // left arm
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [-0.45, 1.1, 0]
  });
  parts.push({ // right arm
    mesh: buildBox(0.2, 0.9, 0.2),
    offset: [0.45, 1.1, 0]
  });
  parts.push({ // left leg
    mesh: buildBox(0.25, 1.0, 0.25),
    offset: [-0.2, 0.5, 0]
  });
  parts.push({ // right leg
    mesh: buildBox(0.25, 1.0, 0.25),
    offset: [0.2, 0.5, 0]
  });

  return parts;
}
```

---

## 8. Basic Gameplay Systems

### 8.1 Player Controller (FPS-style)

* WASD = movement
* Mouse = look (pointer lock)
* Space = jump (optional)
* Shift = sprint
* E = interact

Implement collision with simple AABBs around walls/floors.

### 8.2 Door & Keycard Logic

* Player has `keyLevel` (0–4, plus Omni flag).
* Door has `requiredKeyLevel`.
* Player presses E → raycast from camera center → if hit door & level sufficient → toggle open/close (translation of door panel).

---

## 9. SCP-173 Behavior (Core MVP Encounter)

Behavior:

* If player is looking directly at SCP-173 and no obstacle is in between, SCP-173 is **frozen**.
* If player is **not** looking (or line-of-sight is blocked), 173 **teleports** toward the player or a target position in small steps.
* If SCP-173’s bounding box intersects the player → **instant death**.

Pseudo-code:

```js
export class SCP173Behavior {
  constructor(player, scene) {
    this.player = player;
    this.scene = scene;
    this.speed = 6.0;      // movement speed for teleport offset
    this.minDistance = 1.0; // kill distance
  }

  update(dt) {
    const ent = this.entity;
    if (!ent) return;

    const isSeen = this.isInPlayerView();

    if (!isSeen) {
      this.moveTowardsPlayer(dt);
    }

    if (this.isTouchingPlayer()) {
      // trigger death / game over
    }
  }

  isInPlayerView() {
    // Approach: take vector from player camera to SCP-173 position.
    // If angle between camera forward and that vector is small AND
    // a raycast hits SCP-173 with no walls in between → return true.
    //
    // For MVP, a simplified version:
    // - project SCP position into screen space
    // - check if near center of screen and in front of camera
    return /* boolean */;
  }

  moveTowardsPlayer(dt) {
    // Teleport-style movement:
    // - Compute direction from 173 to player
    // - Step along that direction by speed * dt
    // - Optionally snap to nav points (simplify)
    const pPos = this.player.position;
    const sPos = this.entity.position;
    // sPos += normalize(pPos - sPos) * (speed * dt)
  }

  isTouchingPlayer() {
    // AABB or simple distance check
    const pPos = this.player.position;
    const sPos = this.entity.position;
    const dx = pPos[0] - sPos[0];
    const dy = pPos[1] - sPos[1];
    const dz = pPos[2] - sPos[2];
    const distSq = dx*dx + dy*dy + dz*dz;
    return distSq < this.minDistance * this.minDistance;
  }
}
```

---

## 10. Initialization Flow

At game start (`main.js`):

1. **Create canvas & WebGL context**

   * `const gl = initGL(canvas);`

2. **Compile shaders & create program**

   * `const program = createProgram(gl, vsSource, fsSource);`

3. **Generate textures (in memory)**

   * Wall: `const wallTex = createTextureFromCanvas(gl, generateConcreteTexture(512, 123));`
   * Floor: `const floorTex = createTextureFromCanvas(gl, generateMetalFloorTexture(512));`
   * Doors: generate from `doorColors` for each level.
   * SCP textures: `generate173Texture(512)` etc.

4. **Generate meshes**

   * Generic box: `buildBox(...)`, then `createMesh(gl, boxData)`.
   * SCP parts: `buildSCP173Parts()` → create meshes from each part’s box data.

5. **Build scene**

   * Create a `Scene`.
   * Use `generateCorridor(n)` to instantiate corridor entities with appropriate textures.
   * Create a small room at the end (manual or simple function that places floor/walls).
   * Add one door between corridor and room.

6. **Create player**

   * Entity with `PlayerController` and camera.

7. **Create SCP-173**

   * Entity at far end of room.
   * Attach `MeshRenderer` components for its parts.
   * Attach `SCP173Behavior` with reference to player.

8. **Main loop**

   * `requestAnimationFrame(loop);`
   * Each frame:

     * Compute `dt`.
     * Update input.
     * `scene.update(dt);`
     * `renderer.renderScene(scene);`

---

## 11. First Playable Demo Checklist

To get a working procedural WebGL SCP demo:

1. **Rendering & camera**

   * WebGL2 up, base shader working.
   * Camera moves with WASD + mouse look (pointer lock).

2. **Procedural textures**

   * Implement `generateConcreteTexture` & `generateMetalFloorTexture`.
   * Bind wall vs floor textures with UVs.

3. **Procedural environment**

   * Implement `buildBox` and `generateCorridor(5)`.
   * Add a simple room at the end.
   * Player can walk from start to room and collide with walls.

4. **Door & key**

   * Generate one Level 1 door texture, apply to a door panel box.
   * Raycast interact to toggle open/close.

5. **SCP-173**

   * Procedurally build model from boxes (`buildSCP173Parts`).
   * Apply `generate173Texture` to materials.
   * Implement `SCP173Behavior`:

     * Freezes while in player’s view.
     * Teleports closer when unseen.
     * Kills player on contact → “You Died” screen.

Once this is done, you have a fully procedural, playable SCP-173 WebGL demo, and the same system can scale to more SCPs, more rooms, and a full recontainment loop.

