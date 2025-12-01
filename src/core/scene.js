/**
 * Scene manages all entities and coordinates update/render cycles.
 * Provides entity lifecycle management with creation/destruction queues.
 */
export class Scene {
  constructor() {
    /** @type {Array<import('./entity.js').Entity>} All active entities in the scene */
    this.entities = [];

    /** @type {Array<import('./entity.js').Entity>} Entities to add at end of frame */
    this.entitiesToAdd = [];

    /** @type {Array<import('./entity.js').Entity>} Entities to remove at end of frame */
    this.entitiesToRemove = [];

    /** @type {Map<string, Set<import('./entity.js').Entity>>} Tag to entity lookup */
    this.taggedEntities = new Map();
  }

  /**
   * Add an entity to the scene.
   * Entity will be added at the end of the current frame.
   * @param {import('./entity.js').Entity} entity - Entity to add
   * @returns {import('./entity.js').Entity} The added entity
   */
  addEntity(entity) {
    this.entitiesToAdd.push(entity);
    return entity;
  }

  /**
   * Add an entity to the scene immediately (bypasses queue).
   * Use with caution - prefer addEntity for safe addition during updates.
   * @param {import('./entity.js').Entity} entity - Entity to add
   * @returns {import('./entity.js').Entity} The added entity
   */
  addEntityImmediate(entity) {
    entity.scene = this;
    this.entities.push(entity);

    // Add to tag index
    for (const tag of entity.tags) {
      this._addEntityToTagIndex(entity, tag);
    }

    // Call start on all components
    entity._onAddedToScene();

    return entity;
  }

  /**
   * Remove an entity from the scene.
   * Entity will be removed at the end of the current frame.
   * @param {import('./entity.js').Entity} entity - Entity to remove
   */
  removeEntity(entity) {
    if (!this.entitiesToRemove.includes(entity)) {
      this.entitiesToRemove.push(entity);
    }
  }

  /**
   * Process pending entity additions and removals.
   * Called at the end of each frame.
   */
  processPendingChanges() {
    // Process removals first to avoid issues with re-adding
    for (const entity of this.entitiesToRemove) {
      const index = this.entities.indexOf(entity);
      if (index >= 0) {
        // Remove from tag index
        for (const tag of entity.tags) {
          this._removeEntityFromTagIndex(entity, tag);
        }

        // Destroy entity if not already destroyed
        if (!entity._destroyed) {
          // Temporarily clear scene to prevent recursive removal
          const scene = entity.scene;
          entity.scene = null;
          entity.destroy();
          entity.scene = scene;
        }

        entity.scene = null;
        this.entities.splice(index, 1);
      }
    }
    this.entitiesToRemove = [];

    // Process additions
    for (const entity of this.entitiesToAdd) {
      // Skip if entity was already destroyed
      if (entity._destroyed) continue;

      entity.scene = this;
      this.entities.push(entity);

      // Add to tag index
      for (const tag of entity.tags) {
        this._addEntityToTagIndex(entity, tag);
      }

      // Call start on all components
      entity._onAddedToScene();
    }
    this.entitiesToAdd = [];
  }

  /**
   * Add entity to tag index.
   * @param {import('./entity.js').Entity} entity - Entity to add
   * @param {string} tag - Tag to add entity under
   * @private
   */
  _addEntityToTagIndex(entity, tag) {
    if (!this.taggedEntities.has(tag)) {
      this.taggedEntities.set(tag, new Set());
    }
    this.taggedEntities.get(tag).add(entity);
  }

  /**
   * Remove entity from tag index.
   * @param {import('./entity.js').Entity} entity - Entity to remove
   * @param {string} tag - Tag to remove entity from
   * @private
   */
  _removeEntityFromTagIndex(entity, tag) {
    const tagSet = this.taggedEntities.get(tag);
    if (tagSet) {
      tagSet.delete(entity);
      if (tagSet.size === 0) {
        this.taggedEntities.delete(tag);
      }
    }
  }

  /**
   * Find entities with a specific tag.
   * @param {string} tag - Tag to search for
   * @returns {Array<import('./entity.js').Entity>} Array of entities with tag
   */
  findByTag(tag) {
    const tagSet = this.taggedEntities.get(tag);
    return tagSet ? Array.from(tagSet) : [];
  }

  /**
   * Find the first entity with a specific tag.
   * @param {string} tag - Tag to search for
   * @returns {import('./entity.js').Entity|null} Entity with tag or null
   */
  findOneByTag(tag) {
    const tagSet = this.taggedEntities.get(tag);
    if (tagSet && tagSet.size > 0) {
      return tagSet.values().next().value;
    }
    return null;
  }

  /**
   * Get all components of a specific type from all entities.
   * @param {Function} componentClass - Component class constructor
   * @returns {Array<import('./component.js').Component>} Array of components
   */
  getComponents(componentClass) {
    const result = [];
    for (const entity of this.entities) {
      const components = entity.getComponents(componentClass);
      result.push(...components);
    }
    return result;
  }

  /**
   * Update all active entities.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    for (const entity of this.entities) {
      if (entity.active && !entity._destroyed) {
        entity.update(dt);
      }
    }

    this.processPendingChanges();
  }

  /**
   * Get the number of entities in the scene.
   * @returns {number} Entity count
   */
  getEntityCount() {
    return this.entities.length;
  }

  /**
   * Clear all entities from the scene.
   */
  clear() {
    // Destroy all entities
    for (const entity of this.entities) {
      if (!entity._destroyed) {
        entity.scene = null;
        entity.destroy();
      }
    }

    this.entities = [];
    this.entitiesToAdd = [];
    this.entitiesToRemove = [];
    this.taggedEntities.clear();
  }
}
