# GitHub Copilot Custom Agents

This directory contains specialized GitHub Copilot agent profiles for the SCP Foundation WebGL survival horror game project. Each agent is an expert in a specific domain and follows the project's conventions, constraints, and MVP scope.

## Available Agents

### Core Development Agents

#### @webgl-renderer
**File:** `webgl-renderer.agent.md`  
**Focus:** WebGL2 rendering pipeline, shaders, meshes, materials, and camera systems  
**Directories:** `src/gl/`, rendering-related components  
**Use when:** Working on graphics, shader code, mesh handling, or the render loop

#### @procedural-gen
**File:** `procedural-gen.agent.md`  
**Focus:** Procedural geometry and texture generation (all visual assets from code)  
**Directories:** `src/game/proceduralGeometry.js`, `src/game/proceduralTextures.js`  
**Use when:** Creating meshes, textures, corridors, rooms, or SCP models algorithmically

#### @gameplay-systems
**File:** `gameplay-systems.agent.md`  
**Focus:** Player controls, SCP behaviors, game state, doors, keycards, and core gameplay mechanics  
**Directories:** `src/game/` (player, SCP entities, interactions, levels, gameState)  
**Use when:** Implementing or modifying gameplay features, SCP AI, or interaction systems

#### @core-systems
**File:** `core-systems.agent.md`  
**Focus:** Entity-component architecture, scene management, input handling, and engine infrastructure  
**Directories:** `src/core/` (entity, component, scene, input, time)  
**Use when:** Working on the foundational engine systems or entity-component patterns

### Quality & Documentation Agents

#### @testing
**File:** `testing.agent.md`  
**Focus:** Unit tests, integration tests, and test infrastructure  
**Directories:** `tests/`, `src/**/*.test.js`  
**Use when:** Writing tests for game systems, math utilities, or validating functionality

#### @docs
**File:** `docs.agent.md`  
**Focus:** Documentation, README updates, API docs, and technical writing  
**Directories:** `README.md`, `MVP_IMPLEMENTATION_PLAN.md`, `docs/`, inline JSDoc  
**Use when:** Creating or updating documentation, API references, or guides

#### @performance
**File:** `performance.agent.md`  
**Focus:** Performance optimization, profiling, and efficient resource management  
**Directories:** All (optimizes existing code)  
**Use when:** Addressing performance bottlenecks, optimizing rendering, or reducing memory usage

### Meta Agent

#### @agents_md_author
**File:** `agents_md_author.agent.md`  
**Focus:** Designing and maintaining agent profiles themselves  
**Directories:** `.github/agents/`  
**Use when:** Creating new agents, updating agent boundaries, or refining agent profiles

## Agent Selection Guide

Choose the right agent based on what you're working on:

| Task | Agent | Why |
|------|-------|-----|
| Adding a new shader or fixing rendering bugs | @webgl-renderer | Expert in WebGL2 pipeline and graphics |
| Creating new room layouts or SCP models | @procedural-gen | Specializes in algorithmic content generation |
| Implementing SCP-106 behavior or player jump | @gameplay-systems | Focuses on gameplay mechanics and SCP lore |
| Adding a new component type or fixing scene updates | @core-systems | Expert in engine architecture patterns |
| Writing tests for SCP-173 visibility check | @testing | Specializes in test creation and coverage |
| Documenting the rendering pipeline | @docs | Expert in technical writing and API docs |
| Optimizing draw calls or reducing allocations | @performance | Focuses on profiling and optimization |
| Creating a new specialized agent | @agents_md_author | Meta-agent for agent management |

## Agent Conventions

All agents follow these common conventions:

### YAML Frontmatter
```yaml
---
name: agent-name
description: One-line description of agent's purpose
tools: ['read', 'search', 'edit', 'shell']
target: github-copilot
---
```

### Standard Sections
1. **Your role** - Agent's focus and responsibilities
2. **Project knowledge** - Tech stack, file structure, constraints
3. **Commands you can run** - CLI commands and tools
4. **Workflow** - Step-by-step process to follow
5. **Boundaries** - Always/Ask/Never rules
6. **Example of good output** - Representative code examples

### Boundary Tiers
- ✅ **Always:** Actions the agent must take for quality and safety
- ⚠️ **Ask before:** Actions requiring user confirmation or coordination
- 🚫 **Never:** Actions that could break functionality or violate constraints

## Project Context

All agents are aware of:

- **Product vision:** Browser-based SCP Foundation survival horror demo
- **Technical constraint:** Custom WebGL2 with procedurally generated graphics (no external assets)
- **MVP scope:** Short facility slice with SCP-173 encounter and keycard progression
- **Architecture:** Entity-component system with vanilla JavaScript ES modules

Key documents agents reference:
- `README.md` - High-level vision and architecture specification
- `MVP_IMPLEMENTATION_PLAN.md` - Detailed implementation roadmap and milestones

## Using Agents in GitHub Copilot

To invoke an agent in GitHub Copilot:

1. Type `@` followed by the agent name in your prompt
2. Describe what you need in natural language
3. The agent will operate within its defined scope and boundaries

Example:
```
@webgl-renderer implement frustum culling for the renderer

@procedural-gen create a texture generator for SCP-106's dark, corroded appearance

@gameplay-systems add a blink mechanic where the screen briefly goes black every 5 seconds

@testing write integration tests for the door/keycard interaction system
```

## Extending the Agent Family

To add a new agent:

1. Ask @agents_md_author to create it:
   ```
   @agents_md_author create a new agent for audio systems (Web Audio API for procedural sound effects)
   ```

2. The new agent will:
   - Follow the standard template and structure
   - Inherit project knowledge and conventions
   - Define clear boundaries and workflows
   - Include relevant code examples

3. Update this file to list the new agent in the appropriate category

## Contributing

When creating or updating agents:

- Keep agents narrowly focused on specific domains
- Encode project conventions and constraints in each profile
- Provide concrete examples of good output
- Define clear boundaries to prevent scope creep
- Maintain consistency with existing agent structure

For questions about agents or to propose new specialized agents, consult @agents_md_author.
