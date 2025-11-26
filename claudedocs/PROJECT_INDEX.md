# Marble Roulette - Project Documentation Index

## Project Overview

**Name**: Marble Roulette
**Version**: 1.0.0
**License**: MIT
**Demo**: https://chimd715.github.io/MarbleRoulette/
**Original Demo**: https://lazygyu.github.io/roulette

A physics-based lucky draw application where marbles race through obstacle courses to determine winners. Built with TypeScript and Box2D physics engine.

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.6 |
| Physics Engine | box2d-wasm 7.0 |
| Bundler | Parcel 2.13 |
| Deployment | gh-pages |
| Linting | ESLint 9 + Prettier 3 |

## Quick Reference

### Commands
```bash
yarn          # Install dependencies
yarn dev      # Start development server (port 1235)
yarn build    # Build for production
yarn deploy   # Deploy to GitHub Pages
yarn lint     # Run ESLint with auto-fix
```

## Project Structure

```
MarbleRoulette/
├── src/                          # Source code
│   ├── index.ts                  # Entry point
│   ├── roulette.ts               # Main game controller
│   ├── marble.ts                 # Marble entity
│   ├── camera.ts                 # Camera system
│   ├── IPhysics.ts               # Physics interface
│   ├── physics-box2d.ts          # Box2D implementation
│   ├── rouletteRenderer.ts       # Canvas rendering
│   ├── minimap.ts                # Minimap UI component
│   ├── rankRenderer.ts           # Ranking display
│   ├── particle.ts               # Particle entity
│   ├── particleManager.ts        # Particle system
│   ├── skillEffect.ts            # Skill visual effects
│   ├── gameObject.ts             # GameObject interface
│   ├── UIObject.ts               # UI component interface
│   ├── options.ts                # Game options singleton
│   ├── localization.ts           # i18n system
│   ├── data/
│   │   ├── constants.ts          # Game constants
│   │   ├── maps.ts               # Stage definitions
│   │   └── languages.ts          # Translation strings
│   ├── types/
│   │   ├── VectorLike.ts         # Vector type
│   │   ├── rect.type.ts          # Rectangle type
│   │   └── MapEntity.type.ts     # Map entity types
│   └── utils/
│       ├── Vector.ts             # Vector math utilities
│       ├── utils.ts              # General utilities
│       ├── bound.decorator.ts    # Method binding decorator
│       └── videoRecorder.ts      # Video recording utility
├── assets/                       # Static assets
│   ├── images/                   # SVG icons and images
│   ├── manifest.json             # PWA manifest
│   └── [icons]                   # App icons (various sizes)
├── index.html                    # Main HTML entry
├── package.json                  # Project configuration
├── tsconfig.json                 # TypeScript config
├── eslint.config.js              # ESLint config
└── .github/workflows/deploy.yml  # CI/CD workflow
```

## Documentation Files

| File | Description |
|------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and component relationships |
| [API_REFERENCE.md](./API_REFERENCE.md) | Public API documentation |
| [COMPONENTS.md](./COMPONENTS.md) | Component breakdown and responsibilities |
| [DATA_FLOW.md](./DATA_FLOW.md) | Data flow and state management |

## Architecture Summary

### Core Systems

1. **Game Controller** (`Roulette`) - Main orchestrator managing game loop, physics, and state
2. **Physics System** (`IPhysics` / `Box2dPhysics`) - Box2D-based collision and movement
3. **Rendering System** (`RouletteRenderer`) - Canvas 2D rendering pipeline
4. **Camera System** (`Camera`) - Viewport management with smooth interpolation
5. **UI System** (`UIObject`) - Modular UI components

### Key Patterns

- **Interface Abstraction**: Physics engine abstracted via `IPhysics` interface
- **Event-Driven**: Custom events for game state changes (`goal`, `shakeAvailableChanged`)
- **Singleton Options**: Global game options via `Options` singleton
- **Decorator Pattern**: `@bound` decorator for method binding
- **Component-Based UI**: `UIObject` interface for pluggable UI elements

## Feature Highlights

- Multiple race maps with unique obstacle layouts
- Configurable winner selection (first, last, or custom rank)
- Skill system with impact effects
- Automatic video recording
- Minimap with viewport navigation
- Real-time ranking display
- Multi-language support (i18n)
- Responsive design with mobile support

## Entry Points

### Main Application Flow
```
index.html → src/index.ts → Roulette.constructor() → _init() → _update() loop
```

### User Interaction Flow
```
Settings Panel → getReady() → roulette.setMarbles() → roulette.start()
```

## Key Classes Reference

| Class | File | Purpose |
|-------|------|---------|
| `Roulette` | roulette.ts:19 | Main game controller |
| `Marble` | marble.ts:8 | Individual marble entity |
| `Box2dPhysics` | physics-box2d.ts:6 | Physics engine wrapper |
| `Camera` | camera.ts:6 | Viewport management |
| `RouletteRenderer` | rouletteRenderer.ts:24 | Canvas rendering |
| `Minimap` | minimap.ts:9 | Minimap UI component |
| `RankRenderer` | rankRenderer.ts:6 | Ranking list UI |
| `ParticleManager` | particleManager.ts:3 | Particle system |
| `VideoRecorder` | videoRecorder.ts:3 | Screen recording |

## Configuration

### Game Constants (`src/data/constants.ts`)
- `initialZoom`: 30 (base zoom level)
- `canvasWidth`: 1600
- `canvasHeight`: 900
- `zoomThreshold`: 5 (distance to trigger zoom)
- `STUCK_DELAY`: 5000ms (stuck detection threshold)

### Options (`src/options.ts`)
- `useSkills`: Enable/disable skill system
- `winningRank`: Target winner position
- `autoRecording`: Auto-start recording
