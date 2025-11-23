# SCP Foundation WebGL MVP Implementation Plan

This plan outlines a detailed path to build a playable MVP of the SCP Foundation survival horror game described in the README. It covers scope, milestones, task breakdowns, dependencies, and acceptance criteria to reach a working browser-based SCP-173 demo with procedurally generated visuals.

## 1) MVP Scope & Success Criteria

**Target experience:** A short, replayable facility slice navigated in first-person where the player walks through corridors, opens a gated door with a keycard, encounters SCP-173, and must follow containment rules to avoid death. All geometry and textures are procedurally generated; no external art assets are loaded.

**Success criteria:**
- WebGL2 rendering works in modern browsers with depth + face culling enabled.
- Procedural textures for walls, floors, ceilings, doors, and SCP-173 are generated at runtime.
- Player can move (WASD + mouse look), collide with walls, and interact (raycast) with doors/keycards.
- Level layout: short corridor sequence leading to a room with one locked door requiring a Level 1 keycard.
- SCP-173 is modeled from procedural box geometry, freezes when in view, teleports toward the player when unseen, and kills on contact, triggering a death screen.
- Game loop runs at interactive frame rate with a basic HUD (crosshair, prompt text, minimal UI for death/containment success).

## 2) Project Structure (aligned to README)

Create the file/folder layout early to avoid churn:
- `index.html`: canvas and script tags.
- `src/main.js`: entry point, bootstrap, and main loop.
- `src/gl/`: WebGL context, shader, mesh, material, and renderer utilities.
- `src/math/`: vector/matrix math (or gl-matrix integration).
- `src/core/`: entities, components, scene management, input, and time.
- `src/game/`: gameplay-specific systems (player, SCP behaviors, doors, keycards, levels, game state).

## 3) Milestones & Order of Execution

1. **Project bootstrap & tooling**
   - Set up `index.html`, basic canvas, and module bundling strategy (vanilla ES modules to keep scope minimal).
   - Add dev server script (e.g., simple `npm` script using `http-server` or `vite` in static mode) and lint/format defaults.

2. **Rendering foundation**
   - Implement WebGL2 context initialization with depth test and face culling.
   - Build shader compilation/linking helpers and a minimal PBR-ish or lambertian shader with diffuse texturing and simple directional light.
   - Create mesh helpers for box geometry (positions, normals, UVs, indices) and VAO/VBO setup.
   - Renderer: camera matrices, draw loop, frustum-correct depth testing.

3. **Procedural texture/mesh generation**
   - Texture generators: concrete (walls/ceiling), metal floor, door color variants, SCP-173 skin.
   - Mesh generation: box builder utility; `buildSCP173Parts()` composing multiple boxes for head/torso/limbs.

4. **Core systems**
   - Entity/component base classes; scene registry for update/render iteration.
   - Input handler with pointer lock, WASD, sprint modifier, and mouse sensitivity settings.
   - Time/delta tracking; basic debug overlay toggle for FPS readout.

5. **Player controller & camera**
   - First-person movement with acceleration, gravity, jump toggle (optional), and collision volume (capsule or AABB).
   - Camera attached to player; mouse look with clamped pitch; crosshair rendering (2D overlay).

6. **Level assembly**
   - Procedural corridor generator (`generateCorridor(count)`) building repeated wall/floor/ceiling segments.
   - Room builder at corridor end with enough space for SCP-173 encounter.
   - Spawn points for player start, keycard pickup, door placement, and SCP-173 initial position.

7. **Interaction & gating**
   - Raycast from camera for interactables; prompt text when looking at door/keycard.
   - Keycard item pickup and inventory flag.
   - Door component with security level requirement; open/close animation via simple lerp of angle/position.

8. **SCP-173 behavior**
   - Visibility check (in view and unobstructed).
   - Movement: frozen when seen; teleports/steps toward player when not seen; respects nav collision.
   - Kill check on proximity; triggers death screen.

9. **Game states & UI**
   - Simple HUD: crosshair, interact prompt, keycard indicator.
   - State machine: gameplay, paused (Esc), death, and recontainment success (if door closes behind SCP or timer condition achieved).

10. **Polish & validation**
    - Audio stubs (optional) or simple procedural beep for doors.
    - Performance pass (reduce overdraw, reuse geometry buffers, texture atlas if needed).
    - QA checklist against success criteria.

## 4) Detailed Task Breakdown

### 4.1 Bootstrap & Tooling
- Initialize npm project; add `npm run dev` (static server) and `npm run build` (if bundling needed).
- Configure ESLint/Prettier (optional but recommended for consistency).
- Create `index.html` with canvas and root script tags loading `src/main.js` as ES module.

### 4.2 Rendering Layer (`src/gl/`)
- **`glContext.js`**: `initGL(canvas)` enabling depth test and cull face.
- **`shader.js`**: utilities for `createShader`, `createProgram`, uniform setters, and compile/link error logging.
- **`mesh.js`**: functions to create VAOs/VBOs from attribute arrays; support positions, normals, UVs, indices.
- **`material.js`**: texture creation from `ImageData`/canvas; sampler setup; parameter binding (diffuse, normal optional).
- **`renderer.js`**: maintain camera matrices, bind shader, draw meshes with materials, handle light uniforms; clear color/depth each frame.

### 4.3 Math (`src/math/`)
- Choose gl-matrix or custom minimal vec3/mat4 functions.
- Provide helpers for perspective matrix, lookAt, normalize, dot, cross, and matrix transforms.

### 4.4 Core Systems (`src/core/`)
- **Entity/component model**: components have `start`, `update(dt)`, `onDestroy` hooks; entities hold position/rotation/scale and component list.
- **Scene**: manages entities, creation/destruction queue, and central `update(dt)` call; exposes `findByTag`/`getComponents` utilities.
- **Input**: pointer lock acquisition on click; keydown/up tracking; mouse delta accumulation per frame; sensitivity configuration.
- **Time**: frame delta computation and clamped `dt` to avoid giant steps on tab switch.

### 4.5 Geometry & Textures (`src/game/` helpers)
- **`proceduralGeometry.js`**: `buildBox(width, height, depth)` returning positions/normals/UVs/indices; `buildSCP173Parts()` returning array of part definitions.
- **`proceduralTextures.js`**: `generateConcreteTexture(size, seed)`, `generateMetalFloorTexture(size)`, `generateDoorTexture(level, size)`, `generate173Texture(size)` using canvas noise, gradients, and line patterns.

### 4.6 Level Construction (`src/game/levels.js`)
- Implement `generateCorridor(count, segmentLength)` instantiating boxes for floor/ceiling/walls with appropriate transforms and materials.
- Build end room (fixed dimensions) with interior props (optional pillars/crates from boxes).
- Place entities: player spawn at start, keycard on a table/stand (simple box), locked door between corridor and room, SCP-173 in room.

### 4.7 Player (`src/game/player.js`)
- Movement state (position, velocity); resolve collisions against static geometry AABBs.
- Camera pitch/yaw update from mouse delta; clamp pitch.
- Interaction raycast: cast from camera forward; detect door/keycard colliders.
- HUD rendering (crosshair via simple 2D canvas overlay or WebGL overlay pass).

### 4.8 Doors & Keycards (`src/game/doors.js`, `src/game/keycards.js`)
- Door entity with collider, open state, required level, and animation; responds to interaction if player has keycard.
- Keycard entity with pickup component toggling player inventory; UI prompt and pickup sound stub.

### 4.9 SCP-173 (`src/game/scp173.js`)
- Compose mesh parts into a single entity with multiple render components sharing one texture/material.
- Behavior component:
  - **Visibility check**: project into view frustum and ensure dot product facing test; optional raycast against level geometry for occlusion.
  - **Movement**: if not visible, step/teleport toward player by speed per frame; snap to nav nodes to avoid clipping into walls.
  - **Attack**: distance threshold triggers death; play snap animation placeholder and show death UI.

### 4.10 Game State & UI (`src/game/gameState.js`)
- Global state machine for `PLAYING`, `PAUSED`, `DEAD`, `SUCCESS`.
- Pause on `Esc`; stop updates except UI.
- Death screen overlay with restart button (reload scene).
- Success condition: e.g., lure SCP-173 past door, close it, and start a short timer; on completion show containment success screen.

### 4.11 Testing & QA
- Manual checks: movement smoothness, collision correctness, door interaction, keycard gating, SCP behavior responsiveness.
- Performance: ensure frame pacing stable; verify texture generation does not block main thread excessively (consider lazy/init splash screen).
- Cross-browser smoke test (Chrome/Firefox desktop). Record known issues.

## 5) Dependency Notes & Risks
- WebGL2 support is mandatory; include error messaging fallback for unsupported browsers.
- Pointer lock and keyboard controls require user gestures; add clear on-screen instructions.
- Collision/raycast accuracy depends on geometry scale consistency; document units (meters) and keep SCP speed balanced to avoid unfair deaths.
- If gl-matrix is used, ensure tree-shakable imports or local copies to avoid bundler bloat; otherwise implement minimal math inline.

## 6) Implementation Timeline (suggested)
- **Day 1–2:** Bootstrap project, WebGL context, shader pipeline, box mesh, camera rendering.
- **Day 3–4:** Procedural textures/geometry utilities; corridor + room generation; renderer draws environment.
- **Day 5:** Player controller with collision, pointer lock, crosshair.
- **Day 6:** Door/keycard interaction and inventory; UI prompts.
- **Day 7:** SCP-173 model + behavior; death screen.
- **Day 8:** Success condition, polish, performance pass, and smoke testing.

## 7) Acceptance Checklist (ready-to-ship MVP)
- [ ] Builds and runs in browser via `npm run dev` without external assets.
- [ ] Player can traverse corridor → pick up keycard → open locked door → enter room.
- [ ] SCP-173 freezes while seen, moves when unseen, kills on contact.
- [ ] All environment and character visuals are procedurally generated at runtime.
- [ ] Basic UI: crosshair, interaction prompt, death/success overlays.
- [ ] No critical console errors; performance acceptable on mid-tier hardware.

