/**
 * Player Controller Component
 * First-person movement with WASD, mouse look, sprint modifier, and optional jump.
 * Handles collision with environment geometry using AABB collision volumes.
 */

import { Component } from '../core/component.js';
import * as vec3 from '../math/vec3.js';

/**
 * PlayerController component for first-person movement and camera control.
 * Attaches to a player entity and updates its position/rotation based on input.
 */
export class PlayerController extends Component {
  /**
   * Create a new PlayerController.
   * @param {import('../core/input.js').Input} input - Input handler
   * @param {import('../gl/renderer.js').Renderer} renderer - Renderer for camera updates
   */
  constructor(input, renderer) {
    super();
    /** @type {import('../core/input.js').Input} */
    this.input = input;
    /** @type {import('../gl/renderer.js').Renderer} */
    this.renderer = renderer;

    // Movement settings
    /** @type {number} Base movement speed in meters/second */
    this.moveSpeed = 4.0;
    /** @type {number} Sprint speed multiplier */
    this.sprintMultiplier = 1.6;
    /** @type {number} Movement acceleration */
    this.acceleration = 20.0;
    /** @type {number} Movement deceleration (friction) */
    this.deceleration = 10.0;

    // Jump settings
    /** @type {boolean} Whether jump is enabled */
    this.jumpEnabled = true;
    /** @type {number} Jump force (vertical velocity) */
    this.jumpForce = 5.0;
    /** @type {number} Gravity in meters/second^2 */
    this.gravity = 15.0;
    /** @type {boolean} Whether player is on the ground */
    this.isGrounded = true;
    /** @type {number} Ground level (Y position of floor) */
    this.groundLevel = 0.0;

    // Camera settings
    /** @type {number} Player eye height in meters */
    this.eyeHeight = 1.7;
    /** @type {number} Camera yaw (horizontal rotation) in radians */
    this.yaw = 0;
    /** @type {number} Camera pitch (vertical rotation) in radians */
    this.pitch = 0;
    /** @type {number} Maximum pitch angle (prevents over-rotation) */
    this.maxPitch = Math.PI / 2 - 0.1;

    // Velocity tracking
    /** @type {Float32Array} Current velocity [x, y, z] */
    this.velocity = new Float32Array([0, 0, 0]);

    // Collision settings
    /** @type {number} Player collision radius (capsule approximated as cylinder) */
    this.collisionRadius = 0.3;
    /** @type {number} Player collision height */
    this.collisionHeight = 1.8;
    /** @type {Array<Object>} Static colliders in the scene */
    this.staticColliders = [];

    // Temp vectors for calculations
    this._tempForward = vec3.create();
    this._tempRight = vec3.create();
    this._tempVelocity = vec3.create();
  }

  /**
   * Called when component is added to scene.
   */
  start() {
    // Set initial ground level based on entity position
    if (this.entity) {
      this.groundLevel = this.entity.position[1];
    }
  }

  /**
   * Update player movement and camera each frame.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    if (!this.entity || !this.input) return;

    // Only process movement when pointer is locked
    if (this.input.isPointerLocked) {
      this.updateCamera();
      this.updateMovement(dt);
    }

    // Sync camera with entity
    this.syncCameraToEntity();
  }

  /**
   * Update camera rotation from mouse input.
   */
  updateCamera() {
    const mouseDelta = this.input.getMouseDelta();

    // Update yaw (horizontal rotation) and pitch (vertical rotation)
    this.yaw -= mouseDelta.x;
    this.pitch -= mouseDelta.y;

    // Clamp pitch to prevent over-rotation
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));

    // Store rotation in entity (pitch in X, yaw in Y)
    this.entity.rotation[0] = this.pitch;
    this.entity.rotation[1] = this.yaw;
  }

  /**
   * Update player movement from keyboard input.
   * @param {number} dt - Delta time in seconds
   */
  updateMovement(dt) {
    // Get forward and right vectors (horizontal only)
    this.getForwardVector(this._tempForward);
    this.getRightVector(this._tempRight);

    // Calculate desired movement direction
    let moveX = 0;
    let moveZ = 0;

    if (this.input.isMoveForward()) {
      moveX += this._tempForward[0];
      moveZ += this._tempForward[2];
    }
    if (this.input.isMoveBackward()) {
      moveX -= this._tempForward[0];
      moveZ -= this._tempForward[2];
    }
    if (this.input.isMoveLeft()) {
      moveX -= this._tempRight[0];
      moveZ -= this._tempRight[2];
    }
    if (this.input.isMoveRight()) {
      moveX += this._tempRight[0];
      moveZ += this._tempRight[2];
    }

    // Normalize diagonal movement
    const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (mag > 0.001) {
      moveX /= mag;
      moveZ /= mag;
    }

    // Apply sprint modifier
    const targetSpeed = this.input.isSprinting()
      ? this.moveSpeed * this.sprintMultiplier
      : this.moveSpeed;

    // Calculate target velocity
    const targetVelX = moveX * targetSpeed;
    const targetVelZ = moveZ * targetSpeed;

    // Smoothly interpolate velocity (acceleration/deceleration)
    const hasInput = mag > 0.001;
    const lerpFactor = hasInput
      ? this.acceleration * dt
      : this.deceleration * dt;

    this.velocity[0] += (targetVelX - this.velocity[0]) * Math.min(lerpFactor, 1);
    this.velocity[2] += (targetVelZ - this.velocity[2]) * Math.min(lerpFactor, 1);

    // Handle jump
    if (this.jumpEnabled && this.isGrounded && this.input.isJumpPressed()) {
      this.velocity[1] = this.jumpForce;
      this.isGrounded = false;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity[1] -= this.gravity * dt;
    }

    // Calculate new position
    const newX = this.entity.position[0] + this.velocity[0] * dt;
    const newY = this.entity.position[1] + this.velocity[1] * dt;
    const newZ = this.entity.position[2] + this.velocity[2] * dt;

    // Apply collision detection and resolve
    const resolvedPos = this.resolveCollisions(newX, newY, newZ);

    // Update entity position
    this.entity.position[0] = resolvedPos[0];
    this.entity.position[1] = resolvedPos[1];
    this.entity.position[2] = resolvedPos[2];

    // Check ground collision
    if (this.entity.position[1] <= this.groundLevel) {
      this.entity.position[1] = this.groundLevel;
      this.velocity[1] = 0;
      this.isGrounded = true;
    }
  }

  /**
   * Resolve collisions with static geometry.
   * @param {number} newX - Proposed X position
   * @param {number} newY - Proposed Y position
   * @param {number} newZ - Proposed Z position
   * @returns {Float32Array} Resolved position [x, y, z]
   */
  resolveCollisions(newX, newY, newZ) {
    const result = new Float32Array([newX, newY, newZ]);
    const currentPos = this.entity.position;

    // Player AABB (using cylinder approximation)
    const playerMinX = newX - this.collisionRadius;
    const playerMaxX = newX + this.collisionRadius;
    const playerMinY = newY;
    const playerMaxY = newY + this.collisionHeight;
    const playerMinZ = newZ - this.collisionRadius;
    const playerMaxZ = newZ + this.collisionRadius;

    // Check each static collider
    for (const collider of this.staticColliders) {
      // Get collider bounds
      const colMinX = collider.position[0] - collider.halfSize[0];
      const colMaxX = collider.position[0] + collider.halfSize[0];
      const colMinY = collider.position[1] - collider.halfSize[1];
      const colMaxY = collider.position[1] + collider.halfSize[1];
      const colMinZ = collider.position[2] - collider.halfSize[2];
      const colMaxZ = collider.position[2] + collider.halfSize[2];

      // Check for AABB overlap
      if (
        playerMaxX > colMinX &&
        playerMinX < colMaxX &&
        playerMaxY > colMinY &&
        playerMinY < colMaxY &&
        playerMaxZ > colMinZ &&
        playerMinZ < colMaxZ
      ) {
        // Resolve collision by pushing player out on the axis with smallest penetration
        const overlapX =
          Math.min(playerMaxX - colMinX, colMaxX - playerMinX);
        const overlapY =
          Math.min(playerMaxY - colMinY, colMaxY - playerMinY);
        const overlapZ =
          Math.min(playerMaxZ - colMinZ, colMaxZ - playerMinZ);

        // Find minimum overlap axis
        if (overlapX <= overlapY && overlapX <= overlapZ) {
          // Push on X axis
          if (currentPos[0] < collider.position[0]) {
            result[0] = colMinX - this.collisionRadius;
          } else {
            result[0] = colMaxX + this.collisionRadius;
          }
          this.velocity[0] = 0;
        } else if (overlapZ <= overlapY) {
          // Push on Z axis
          if (currentPos[2] < collider.position[2]) {
            result[2] = colMinZ - this.collisionRadius;
          } else {
            result[2] = colMaxZ + this.collisionRadius;
          }
          this.velocity[2] = 0;
        } else {
          // Push on Y axis
          if (currentPos[1] < collider.position[1]) {
            result[1] = colMinY - this.collisionHeight;
            this.velocity[1] = 0;
          } else {
            result[1] = colMaxY;
            this.velocity[1] = 0;
            this.isGrounded = true;
          }
        }
      }
    }

    return result;
  }

  /**
   * Add a static collider for collision detection.
   * @param {Object} collider - Collider object
   * @param {Float32Array} collider.position - Center position [x, y, z]
   * @param {Float32Array} collider.halfSize - Half-size [x, y, z]
   */
  addStaticCollider(collider) {
    this.staticColliders.push(collider);
  }

  /**
   * Clear all static colliders.
   */
  clearStaticColliders() {
    this.staticColliders = [];
  }

  /**
   * Get the forward vector (horizontal only, for movement).
   * @param {Float32Array} out - Output vector
   * @returns {Float32Array} Forward vector
   */
  getForwardVector(out) {
    out[0] = Math.sin(this.yaw);
    out[1] = 0;
    out[2] = Math.cos(this.yaw);
    return out;
  }

  /**
   * Get the right vector (horizontal only, for strafing).
   * @param {Float32Array} out - Output vector
   * @returns {Float32Array} Right vector
   */
  getRightVector(out) {
    out[0] = Math.cos(this.yaw);
    out[1] = 0;
    out[2] = -Math.sin(this.yaw);
    return out;
  }

  /**
   * Get the camera forward vector (includes pitch for look direction).
   * @param {Float32Array} out - Output vector
   * @returns {Float32Array} Camera forward vector
   */
  getCameraForward(out) {
    const cosPitch = Math.cos(this.pitch);
    out[0] = Math.sin(this.yaw) * cosPitch;
    out[1] = Math.sin(this.pitch);
    out[2] = Math.cos(this.yaw) * cosPitch;
    return out;
  }

  /**
   * Sync renderer camera to player position and orientation.
   */
  syncCameraToEntity() {
    if (!this.renderer || !this.entity) return;

    // Camera position at player eye height
    const camX = this.entity.position[0];
    const camY = this.entity.position[1] + this.eyeHeight;
    const camZ = this.entity.position[2];

    this.renderer.setCameraPosition(camX, camY, camZ);

    // Calculate look-at target
    const forward = this.getCameraForward(this._tempForward);
    this.renderer.setCameraTarget(
      camX + forward[0],
      camY + forward[1],
      camZ + forward[2]
    );
  }

  /**
   * Set player position directly.
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setPosition(x, y, z) {
    if (this.entity) {
      this.entity.position[0] = x;
      this.entity.position[1] = y;
      this.entity.position[2] = z;
      this.groundLevel = y;
    }
  }

  /**
   * Set player yaw (horizontal look direction).
   * @param {number} yaw - Yaw in radians
   */
  setYaw(yaw) {
    this.yaw = yaw;
    if (this.entity) {
      this.entity.rotation[1] = yaw;
    }
  }
}
