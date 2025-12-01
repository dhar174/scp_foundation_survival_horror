/**
 * Base Entity class with transform and component management.
 * Entities are simple containers; all behavior is in components.
 */
export class Entity {
  constructor() {
    /** @type {Float32Array} Position [x, y, z] */
    this.position = new Float32Array([0, 0, 0]);

    /** @type {Float32Array} Rotation [pitch, yaw, roll] in radians */
    this.rotation = new Float32Array([0, 0, 0]);

    /** @type {Float32Array} Scale [x, y, z] */
    this.scale = new Float32Array([1, 1, 1]);

    /** @type {Array<import('./component.js').Component>} List of attached components */
    this.components = [];

    /** @type {boolean} Whether entity is active and should update */
    this.active = true;

    /** @type {Set<string>} Tags for entity lookup */
    this.tags = new Set();

    /** @type {import('./scene.js').Scene|null} Scene this entity belongs to */
    this.scene = null;

    /** @type {boolean} Whether entity has been destroyed */
    this._destroyed = false;
  }

  /**
   * Add a component to this entity.
   * @param {import('./component.js').Component} component - Component instance to add
   * @returns {import('./component.js').Component} The added component
   */
  addComponent(component) {
    component.entity = this;
    this.components.push(component);

    // Call start if entity is already in scene
    if (this.scene && component.start) {
      component.start();
    }

    return component;
  }

  /**
   * Remove a component from this entity.
   * @param {import('./component.js').Component} component - Component to remove
   */
  removeComponent(component) {
    const index = this.components.indexOf(component);
    if (index >= 0) {
      if (component.onDestroy) {
        component.onDestroy();
      }
      component.entity = null;
      this.components.splice(index, 1);
    }
  }

  /**
   * Get first component of specified type.
   * @param {Function} componentClass - Component class constructor
   * @returns {import('./component.js').Component|null} Found component or null
   */
  getComponent(componentClass) {
    return this.components.find((c) => c instanceof componentClass) || null;
  }

  /**
   * Get all components of specified type.
   * @param {Function} componentClass - Component class constructor
   * @returns {Array<import('./component.js').Component>} Array of matching components
   */
  getComponents(componentClass) {
    return this.components.filter((c) => c instanceof componentClass);
  }

  /**
   * Check if entity has a component of specified type.
   * @param {Function} componentClass - Component class constructor
   * @returns {boolean} True if entity has component
   */
  hasComponent(componentClass) {
    return this.components.some((c) => c instanceof componentClass);
  }

  /**
   * Add a tag for entity lookup.
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    this.tags.add(tag);

    // Update scene tag index if in scene
    if (this.scene) {
      this.scene._addEntityToTagIndex(this, tag);
    }
  }

  /**
   * Remove a tag from the entity.
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    this.tags.delete(tag);

    // Update scene tag index if in scene
    if (this.scene) {
      this.scene._removeEntityFromTagIndex(this, tag);
    }
  }

  /**
   * Check if entity has a tag.
   * @param {string} tag - Tag to check
   * @returns {boolean} True if entity has tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * Update all components.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    if (!this.active || this._destroyed) return;

    for (const component of this.components) {
      if (component.update) {
        component.update(dt);
      }
    }
  }

  /**
   * Called when entity is added to scene.
   * Calls start on all components.
   */
  _onAddedToScene() {
    for (const component of this.components) {
      if (component.start) {
        component.start();
      }
    }
  }

  /**
   * Destroy this entity and all components.
   * Removes entity from scene if attached.
   */
  destroy() {
    if (this._destroyed) return;

    this._destroyed = true;

    // Call onDestroy on all components
    for (const component of this.components) {
      if (component.onDestroy) {
        component.onDestroy();
      }
      component.entity = null;
    }
    this.components = [];

    // Remove from scene if attached
    if (this.scene) {
      this.scene.removeEntity(this);
    }

    this.active = false;
  }
}
