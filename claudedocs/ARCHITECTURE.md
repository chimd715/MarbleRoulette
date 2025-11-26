# Marble Roulette - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         index.html (UI Layer)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ Settings     │ │ Name Input   │ │ Map Selector │ │ Winner Mode │ │
│  │ Panel        │ │ Textarea     │ │ Dropdown     │ │ Buttons     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Roulette (Game Controller)                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ State Management                                               │  │
│  │ • _marbles: Marble[]         • _winners: Marble[]             │  │
│  │ • _isRunning: boolean        • _winnerRank: number            │  │
│  │ • _stage: StageDef           • _effects: GameObject[]         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────┐ ┌─────────────────┐ ┌────────────────────┐  │
│  │ Game Loop         │ │ Event System    │ │ Public API         │  │
│  │ • _update()       │ │ • goal          │ │ • setMarbles()     │  │
│  │ • _render()       │ │ • shakeChanged  │ │ • start()          │  │
│  │ • _updateMarbles()│ │                 │ │ • setMap()         │  │
│  └───────────────────┘ └─────────────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
│   Physics        │ │   Rendering      │ │   UI Components          │
│   (Box2D)        │ │   System         │ │                          │
│ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌───────┐ ┌───────────┐ │
│ │IPhysics      │ │ │ │Roulette     │ │ │ │Minimap│ │RankRenderer│ │
│ │Interface     │ │ │ │Renderer     │ │ │ │       │ │           │ │
│ └──────────────┘ │ │ └──────────────┘ │ │ └───────┘ └───────────┘ │
│ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌─────────────────────┐ │
│ │Box2dPhysics │ │ │ │Camera       │ │ │ │ UIObject Interface  │ │
│ │(implements) │ │ │ │             │ │ │ │ • update()          │ │
│ └──────────────┘ │ │ └──────────────┘ │ │ │ • render()          │ │
└──────────────────┘ └──────────────────┘ │ │ • getBoundingBox()  │ │
                                          │ └─────────────────────┘ │
                                          └──────────────────────────┘
```

## Component Architecture

### 1. Game Controller (`Roulette`)

**File**: `src/roulette.ts:19`

The central orchestrator that manages:
- Game loop (60fps via `requestAnimationFrame`)
- Physics simulation stepping
- Marble state updates
- Winner determination
- Event dispatching

```typescript
class Roulette extends EventTarget {
  // Core game state
  private _marbles: Marble[];
  private _winners: Marble[];
  private _isRunning: boolean;
  private _stage: StageDef | null;

  // Systems
  private physics: IPhysics;
  private _camera: Camera;
  private _renderer: RouletteRenderer;
  private _particleManager: ParticleManager;

  // Main loop
  private _update(): void;
}
```

### 2. Physics System

**Interface**: `src/IPhysics.ts:4`
**Implementation**: `src/physics-box2d.ts:6`

Abstracts the physics engine for potential future replacements.

```typescript
interface IPhysics {
  init(): Promise<void>;
  createStage(stage: StageDef): void;
  createMarble(id: number, x: number, y: number): void;
  step(deltaSeconds: number): void;
  getMarblePosition(id: number): { x, y, angle };
  impact(id: number): void;
  // ...
}
```

**Box2D Integration**:
- Static bodies for walls/obstacles
- Kinematic bodies for rotating elements
- Dynamic bodies for marbles
- Collision detection via contact lists

### 3. Rendering Pipeline

**File**: `src/rouletteRenderer.ts:24`

Three-phase rendering:
1. **Entity Layer**: Map obstacles (boxes, circles, polylines)
2. **Game Objects**: Marbles and skill effects
3. **UI Layer**: Minimap, rankings, winner display

```
Frame Render Flow:
┌────────────┐    ┌──────────────┐    ┌────────────┐
│ Clear      │ → │ Transform    │ → │ Render     │
│ Canvas     │    │ (Camera)     │    │ Entities   │
└────────────┘    └──────────────┘    └────────────┘
                                            │
                                            ▼
┌────────────┐    ┌──────────────┐    ┌────────────┐
│ UI Layer   │ ← │ Particles    │ ← │ Marbles &  │
│ (Fixed)    │    │ (Screen)     │    │ Effects    │
└────────────┘    └──────────────┘    └────────────┘
```

### 4. Camera System

**File**: `src/camera.ts:6`

Features:
- Smooth position interpolation
- Dynamic zoom based on marble proximity to goal
- Viewport transformation for world-to-screen conversion
- Manual lock/unlock for minimap navigation

```typescript
class Camera {
  private _position: VectorLike;
  private _targetPosition: VectorLike;
  private _zoom: number;
  private _targetZoom: number;

  update({ marbles, stage, needToZoom, targetIndex }): void;
  renderScene(ctx, callback): void;
}
```

### 5. Entity Architecture

```
                    ┌─────────────┐
                    │ GameObject  │ (Interface)
                    │ • isDestroy │
                    │ • update()  │
                    │ • render()  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ SkillEffect │  │ Particle   │  │ (Future)   │
    │             │  │            │  │            │
    └────────────┘  └────────────┘  └────────────┘

                    ┌─────────────┐
                    │  UIObject   │ (Interface)
                    │ • update()  │
                    │ • render()  │
                    │ • onWheel?  │
                    │ • onMouse?  │
                    └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
        ┌────────────┐          ┌────────────┐
        │  Minimap   │          │RankRenderer│
        └────────────┘          └────────────┘
```

## Data Flow

### Game Loop Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│                        _update() @ 60fps                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Time Delta Calculation                                       │
│     └── Accumulate elapsed time, clamp to 100ms                  │
│                                                                   │
│  2. Physics Step (while elapsed >= updateInterval)               │
│     ├── physics.step(interval)                                   │
│     ├── _updateMarbles(deltaTime)                                │
│     │   ├── Check marble positions                               │
│     │   ├── Handle skill activation (Impact)                     │
│     │   ├── Detect goal crossing                                 │
│     │   └── Filter finished marbles                              │
│     ├── particleManager.update()                                 │
│     ├── _updateEffects()                                         │
│     └── uiObjects.forEach(update)                                │
│                                                                   │
│  3. Sort marbles by Y position                                   │
│                                                                   │
│  4. Camera Update                                                │
│     ├── Calculate target position (follow leading marble)        │
│     └── Calculate zoom (based on goal proximity)                 │
│                                                                   │
│  5. Render                                                       │
│     └── _render() → RouletteRenderer.render()                    │
│                                                                   │
│  6. Request next frame                                           │
│     └── requestAnimationFrame(_update)                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### State Transitions

```
┌──────────┐   setMarbles()   ┌──────────┐   start()   ┌─────────┐
│  IDLE    │ ───────────────→ │  READY   │ ──────────→ │ RUNNING │
└──────────┘                  └──────────┘             └────┬────┘
     ↑                                                      │
     │                                                      │
     │                           goal event                 │
     │    ┌────────────┐  ←───────────────────────────────┘
     └────│  FINISHED  │
          └────────────┘
```

## Event System

Custom events dispatched by `Roulette`:

| Event | Detail | Trigger |
|-------|--------|---------|
| `goal` | `{ winner: string }` | Target marble crosses finish line |
| `shakeAvailableChanged` | `boolean` | Marbles stuck for 3+ seconds |

## Map Entity System

### Entity Types (`src/types/MapEntity.type.ts`)

```typescript
// Shape variants
type EntityShape =
  | EntityBoxShape      // width, height, rotation
  | EntityCircleShape   // radius
  | EntityPolylineShape // points array

// Physical properties
type EntityPhysicalProps = {
  density: number;
  restitution: number;  // bounciness
  angularVelocity: number;
  life?: number;  // for destructible entities
}

// Body types
type: 'static' | 'kinematic'
```

### Stage Definition (`src/data/maps.ts`)

```typescript
type StageDef = {
  title: string;
  entities: MapEntity[];
  goalY: number;    // finish line Y
  zoomY: number;    // camera zoom threshold Y
}
```

## Performance Considerations

1. **Fixed Timestep**: 10ms update interval prevents physics inconsistencies
2. **Elapsed Clamping**: Maximum 100ms prevents spiral of death
3. **Lazy Rendering**: Only visible elements rendered (rank culling)
4. **Object Pooling**: Not implemented; could improve particle performance
5. **Canvas Size Optimization**: Dynamic resize based on viewport

## Extension Points

1. **New Physics Engine**: Implement `IPhysics` interface
2. **New UI Components**: Implement `UIObject` interface
3. **New Effects**: Implement `GameObject` interface
4. **New Maps**: Add entries to `stages` array
5. **New Skills**: Extend `Skills` enum and marble update logic
