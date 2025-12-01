/**
 * Base Component class with lifecycle hooks.
 * Extend this class to create custom components.
 * Components encapsulate behaviors and are attached to entities.
 */
export class Component {
  constructor() {
    /**
     * The entity this component is attached to.
     * Set by entity.addComponent().
     * @type {import('./entity.js').Entity|null}
     */
    this.entity = null;

    /**
     * Whether this component is enabled and should update.
     * @type {boolean}
     */
    this.enabled = true;
  }

  /**
   * Called once when component is first added to an active entity in a scene.
   * Use for initialization and caching references.
   */
  start() {
    // Override in subclasses
  }

  /**
   * Called every frame while entity is active and component is enabled.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Override in subclasses
    // Prevent unused parameter warning
    void dt;
  }

  /**
   * Called when component is removed or entity is destroyed.
   * Use for cleanup: remove event listeners, release resources.
   */
  onDestroy() {
    // Override in subclasses
  }

  /**
   * Get the scene this component's entity belongs to.
   * @returns {import('./scene.js').Scene|null} Scene or null
   */
  getScene() {
    return this.entity ? this.entity.scene : null;
  }
}
