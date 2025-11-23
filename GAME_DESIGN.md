# SCP Foundation Survival Horror Game - Design Document

## Game Overview
A 3D browser-based survival horror game using custom WebGL, inspired by the SCP Foundation lore. Players must navigate a containment facility, recontain escaped SCPs, and survive while progressing through increasingly difficult challenges.

## Core Mechanics

### Movement & Controls
- **WASD**: Move player character
- **Mouse**: Look around (third-person camera)
- **Shift**: Sprint (drains stamina)
- **E**: Interact with objects (doors, items, containment controls)
- **Tab**: Open inventory
- **ESC**: Pause menu

### Player Stats
- **Health**: 100 HP, decreases when attacked by SCPs
- **Stamina**: 100, depletes while sprinting, regenerates when walking/standing
- **Keycard Level**: Determines which doors can be accessed (0 to 6)

### Progression System
The game features a linear progression through keycard levels:

1. **Level 1 Keycard** - Obtained after containing SCP-173
2. **Level 2-3 Keycards** - Obtained after containing SCP-096
3. **Level 4-5 Keycards** - Obtained after containing SCP-682
4. **Omni Keycard** - Obtained after containing SCP-106

Each keycard unlocks new areas of the facility and access to more dangerous SCP containment chambers.

## SCP Entities

### SCP-173 "The Sculpture" (Easiest)
- **Behavior**: Only moves when not being looked at
- **Strategy**: Keep camera focused on it while maneuvering
- **Danger Level**: Instant kill on contact
- **Reward**: Level 1 Keycard

### SCP-096 "The Shy Guy" (Medium)
- **Behavior**: Docile until looked at, then becomes enraged
- **States**: 
  - Calm: Wanders randomly
  - Triggered: 2-second warning period
  - Enraged: Chases player at high speed for 10 seconds
- **Strategy**: Avoid looking directly at it
- **Danger Level**: High damage during rage
- **Reward**: Level 2-3 Keycard

### SCP-682 "Hard-to-Destroy Reptile" (Hard)
- **Behavior**: Always aggressive, chases player relentlessly
- **Health**: 500 HP (requires multiple containment attempts)
- **Attack**: 40 damage per hit, 1.5 second cooldown
- **Strategy**: Kite and use facility hazards
- **Reward**: Level 4-5 Keycard

### SCP-106 "The Old Man" (Very Hard)
- **Behavior**: Phases through walls, teleports near player
- **Abilities**: 
  - Teleportation every 8 seconds
  - Wall phasing
  - Continuous damage on contact
- **Strategy**: Constant movement, use containment procedures
- **Reward**: Omni Keycard (game completion)

## Facility Layout

### Areas
1. **Main Corridor**: Starting area, basic navigation
2. **Containment Chambers**: Each SCP has a designated chamber
3. **Security Rooms**: Keycard locations and control stations
4. **Restricted Zones**: Require higher keycard levels

### Door System
- Doors are color-coded by required keycard level:
  - Gray: Level 1
  - Yellow: Level 2
  - Orange: Level 3
  - Red: Level 4+
  - Purple: Omni

## Win/Lose Conditions

### Victory
- Contain all 4 SCPs
- Obtain the Omni Keycard
- Survive the entire experience

### Defeat
- Player health reaches 0
- Death by any SCP entity

## Technical Implementation

### Graphics Engine
- Custom WebGL renderer
- Real-time 3D rendering
- Dynamic lighting system
- Third-person camera with smooth following

### Physics & Collision
- AABB collision detection for walls/doors
- Sphere collision for player/SCP interactions
- Basic physics for movement

### AI Systems
- Pathfinding for SCP navigation
- State machines for SCP behaviors
- Line-of-sight detection for SCP-173 and SCP-096

## Future Enhancements
- Additional SCP entities
- More complex facility layouts
- Audio system with atmospheric sounds
- Particle effects for SCP abilities
- Save/checkpoint system
- Multiple difficulty levels
- Multiplayer co-op mode
