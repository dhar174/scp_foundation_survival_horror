# SCP Foundation: Containment Breach

A 3D browser-based survival horror game built with custom WebGL, set in the SCP Foundation universe.

## Overview

You are a security officer at an SCP Foundation facility where multiple containment breaches have occurred. Your mission is to navigate the facility, recontain escaped SCPs, and survive the experience. Progress through the game by obtaining higher-level keycards, each granted after successfully containing increasingly dangerous SCP entities.

## Features

- **Custom WebGL 3D Engine**: Built from scratch without external 3D libraries
- **Third-Person Survival Horror**: Resident Evil-style gameplay
- **Progressive Difficulty**: Face increasingly dangerous SCPs
- **Keycard Progression System**: Level 1 → Level 5 → Omni Keycard
- **Multiple SCP Entities**: Including SCP-173, SCP-096, SCP-682, and SCP-106
- **Atmospheric Facility Environment**: Explore a contained SCP Foundation site

## How to Play

### Installation

1. Clone this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)
3. No build process or dependencies required!

### Controls

- **W/A/S/D** - Move character
- **Mouse** - Look around
- **Shift** - Sprint (uses stamina)
- **E** - Interact with objects (doors, keycards)
- **Tab** - Open inventory (future feature)
- **ESC** - Pause menu

### Gameplay

1. **Find Keycards**: Explore the facility to locate keycards
2. **Access New Areas**: Higher-level keycards unlock more restricted zones
3. **Contain SCPs**: Use facility controls and strategies to recontain each SCP
4. **Survive**: Avoid or escape from SCP entities while managing health and stamina
5. **Progress**: Each contained SCP grants access to the next level

### SCP Entities

- **SCP-173 "The Sculpture"** (Easiest) - Don't blink! Only moves when not observed
- **SCP-096 "The Shy Guy"** (Medium) - Don't look at its face or it becomes enraged
- **SCP-682 "Hard-to-Destroy Reptile"** (Hard) - Extremely aggressive and durable
- **SCP-106 "The Old Man"** (Very Hard) - Phases through walls and teleports

## Project Structure

```
├── index.html              # Main game page
├── css/
│   └── style.css          # Game styling
├── js/
│   ├── engine/            # Core WebGL engine
│   │   ├── webgl.js       # WebGL context and rendering
│   │   ├── shader.js      # Shader programs and mesh generation
│   │   ├── camera.js      # Third-person camera system
│   │   ├── input.js       # Keyboard and mouse input handling
│   │   └── math.js        # 3D math utilities (vectors, matrices)
│   ├── game/              # Game systems
│   │   ├── player.js      # Player controller
│   │   ├── world.js       # Level and world management
│   │   ├── collision.js   # Collision detection
│   │   └── inventory.js   # Inventory system
│   ├── entities/          # SCP entities
│   │   ├── scp173.js      # The Sculpture
│   │   ├── scp096.js      # The Shy Guy
│   │   ├── scp682.js      # Hard-to-Destroy Reptile
│   │   └── scp106.js      # The Old Man
│   ├── ui/                # User interface
│   │   ├── hud.js         # Heads-up display
│   │   └── menu.js        # Menu system
│   └── main.js            # Main game loop and initialization
├── GAME_DESIGN.md         # Detailed game design document
└── README.md              # This file
```

## Technical Details

### WebGL Implementation

This game uses custom WebGL without any 3D frameworks like Three.js:

- **Vertex and Fragment Shaders**: Custom GLSL shaders for rendering
- **Matrix Math**: Hand-coded matrix operations for transformations
- **Mesh Generation**: Procedural geometry generation
- **Lighting**: Basic diffuse and ambient lighting model
- **Camera**: Third-person follow camera with rotation

### Game Architecture

- **Entity-Component Pattern**: Modular game objects
- **State Machine**: SCP AI behavior management
- **Event-Driven UI**: Menu and HUD system
- **Game Loop**: RequestAnimationFrame-based rendering

## Browser Compatibility

- Chrome 90+ ✓
- Firefox 88+ ✓
- Edge 90+ ✓
- Safari 14+ ✓ (may have performance issues)

WebGL must be enabled in your browser.

## Development

This project is written in vanilla JavaScript with no build tools or dependencies. Simply edit the files and refresh your browser to see changes.

## Credits

- Inspired by the [SCP Foundation](http://www.scp-wiki.net/) collaborative writing project
- Game concept based on "SCP: Containment Breach"
- Built as a demonstration of custom WebGL game development

## License

This project is for educational purposes. The SCP Foundation and all related concepts are under Creative Commons Attribution-ShareAlike 3.0 License.

## Future Improvements

- Audio system with ambient sounds and SCP-specific effects
- More complex facility layouts with procedural generation
- Additional SCP entities
- Particle effects for visual feedback
- Save/checkpoint system
- Mobile device support
- Multiplayer support
