/**
 * Game Systems
 * This module will contain game-specific logic: player, SCPs, doors, levels.
 */

// Procedural geometry utilities
export {
  buildSCP173Parts,
  buildSCP106Parts,
  buildSCP049Parts,
  mergeMeshParts,
  generateCorridorSegment,
  generateRoom,
  generateDoorGeometry,
} from './proceduralGeometry.js';

// Procedural texture utilities
export {
  generateConcreteTexture,
  generateMetalFloorTexture,
  generateDoorTexture,
  generate173Texture,
  generate106Texture,
  generate049Texture,
  generateKeycardTexture,
  prewarmTextures,
} from './proceduralTextures.js';

// Placeholder for future game systems
// Will include Player, SCP behaviors, Doors, Keycards, Levels, GameState
