# Marble Roulette - Component Documentation

## Core Components

### Roulette (`src/roulette.ts:19`)

**Purpose**: Main game controller orchestrating all game systems.

**Responsibilities**:
- Game loop management (60fps)
- Physics simulation coordination
- Marble lifecycle management
- Winner determination
- Event dispatching
- UI component coordination

**Key State**:
```typescript
private _marbles: Marble[] = [];      // Active marbles
private _winners: Marble[] = [];       // Finished marbles
private _isRunning: boolean = false;   // Race in progress
private _stage: StageDef | null;       // Current map
private _winnerRank = 0;               // Target winner position
private _effects: GameObject[] = [];   // Visual effects
```

**Dependencies**:
- `IPhysics` - Physics engine
- `Camera` - Viewport
- `RouletteRenderer` - Rendering
- `ParticleManager` - Celebration effects
- `VideoRecorder` - Screen capture
- `UIObject[]` - UI components

---

### Marble (`src/marble.ts:8`)

**Purpose**: Individual marble entity with physics and rendering.

**Responsibilities**:
- Position/rotation tracking via physics
- Skill cooldown management
- Stuck detection and auto-shake
- Self-rendering (normal and minimap modes)

**Key State**:
```typescript
id: number;               // Physics body identifier
name: string;             // Display name
weight: number;           // Affects skill rate
skill: Skills;            // Current active skill
isActive: boolean;        // Physics enabled
private _coolTime: number;  // Skill cooldown
private _stuckTime: number; // Stuck duration
```

**Skill System**:
- Cooldown: 1000-5000ms based on weight
- Skill rate: 0-20% based on weight
- `Skills.Impact`: Pushes nearby marbles

---

### Box2dPhysics (`src/physics-box2d.ts:6`)

**Purpose**: Box2D physics engine wrapper implementing `IPhysics`.

**Responsibilities**:
- Physics world management
- Body creation/destruction
- Collision handling
- Step simulation

**Key Features**:
- WebAssembly-based Box2D
- Gravity: (0, 10) - downward
- Shape support: box, circle, polyline (edge chain)
- Body types: static (walls), kinematic (rotating), dynamic (marbles)

**Marble Physics**:
```typescript
// Radius: 0.25
// Density: 1 + random (0-1)
// Initial state: sleeping, disabled
```

**Impact Implementation**:
```typescript
// Affects marbles within radius 10
// Force = (1 - distance/10)² × 5
// Applied as linear impulse
```

---

### Camera (`src/camera.ts:6`)

**Purpose**: Viewport management with smooth tracking.

**Responsibilities**:
- Follow target marble (leader or custom)
- Smooth position interpolation
- Dynamic zoom near finish line
- Transform world coordinates to screen

**Interpolation**:
```typescript
// Movement: current + (target - current) / 10
// Threshold: 1/initialZoom (snaps when close)
```

**Zoom Behavior**:
```typescript
// Normal: 1x
// Near goal: up to 4x (based on distance to zoomY)
// Threshold distance: zoomThreshold (5 units)
```

---

### RouletteRenderer (`src/rouletteRenderer.ts:24`)

**Purpose**: Canvas 2D rendering pipeline.

**Responsibilities**:
- Canvas setup and resize handling
- Entity rendering (obstacles)
- Marble rendering with camera transform
- Effect rendering
- UI component delegation
- Winner display overlay

**Render Pipeline**:
1. Clear canvas (black)
2. Apply initial zoom scale
3. Camera scene transform
4. Render entities (obstacles)
5. Render effects (skill visuals)
6. Render marbles
7. Render UI objects
8. Render particles
9. Render winner overlay

**Image Loading**:
- Preloads custom marble skins
- Currently supports "챔루" special skin

---

## UI Components

### Minimap (`src/minimap.ts:9`)

**Purpose**: Overview map with viewport navigation.

**Implementation**: `UIObject`

**Features**:
- Real-time marble positions
- Current viewport indicator
- Click-to-navigate functionality
- Scales map 4x for visibility

**Interaction**:
- `onMouseMove`: Updates viewport position
- `onViewportChange`: Callback to lock camera

**Bounding Box**: `{ x: 10, y: 10, w: 104, h: goalY×4 }`

---

### RankRenderer (`src/rankRenderer.ts:6`)

**Purpose**: Real-time ranking list display.

**Implementation**: `UIObject`

**Features**:
- Scrollable ranking list
- Winner highlighting (☆)
- Finished marble checkmarks (✓)
- Auto-scroll to current leader
- Manual scroll with wheel

**Rendering**:
- Right-aligned text
- Winners: bold 11pt
- Active: 10pt
- Color-coded by marble hue

---

## Effect Components

### ParticleManager (`src/particleManager.ts:3`)

**Purpose**: Celebration particle system.

**Responsibilities**:
- Particle lifecycle management
- Bulk particle creation on goal
- Update and render delegation

**Usage**:
```typescript
// On winner finish:
particleManager.shot(width, height); // Creates 200 particles
```

---

### Particle (`src/particle.ts:7`)

**Purpose**: Individual celebration particle.

**Properties**:
- Position with velocity
- Random color (HSL)
- Gravity simulation
- Alpha fade over lifetime

**Lifetime**: 3000ms

---

### SkillEffect (`src/skillEffect.ts:6`)

**Purpose**: Impact skill visual effect.

**Implementation**: `GameObject`

**Visual**: Expanding white circle with fade

**Properties**:
- Position (skill origin)
- Size (0 → 10 over lifetime)
- Alpha fade (quadratic)

**Lifetime**: 500ms

---

## Data Components

### Options (`src/options.ts`)

**Purpose**: Global game configuration singleton.

**Properties**:
| Property | Type | Default |
|----------|------|---------|
| `useSkills` | boolean | true |
| `winningRank` | number | 0 |
| `autoRecording` | boolean | true |

---

### Constants (`src/data/constants.ts`)

**Purpose**: Game-wide constant values.

| Constant | Value | Usage |
|----------|-------|-------|
| `initialZoom` | 30 | Base zoom level |
| `canvasWidth` | 1600 | Default width |
| `canvasHeight` | 900 | Default height |
| `zoomThreshold` | 5 | Zoom trigger distance |
| `STUCK_DELAY` | 5000 | Stuck detection ms |

---

### Maps (`src/data/maps.ts`)

**Purpose**: Stage/level definitions.

**Stage Structure**:
```typescript
{
  title: string;           // Display name
  entities: MapEntity[];   // Obstacle definitions
  goalY: number;           // Finish line Y
  zoomY: number;           // Camera zoom threshold
}
```

---

## Utility Components

### VideoRecorder (`src/utils/videoRecorder.ts:3`)

**Purpose**: Canvas video capture and download.

**Features**:
- MediaRecorder API
- WebM output format
- 6 Mbps bitrate
- Auto-download on stop

**Filename Format**: `marble_roulette_YYYYMMDDHHMMSS.webm`

---

### Localization (`src/localization.ts`)

**Purpose**: Multi-language support.

**Features**:
- Browser language detection
- DOM element translation
- Attribute-based translation (`data-trans`)
- Default: English

**Translation Flow**:
1. Detect browser language
2. Match against available translations
3. Translate all `[data-trans]` elements
4. Update `lang` attribute on `<html>`

---

### Vector (`src/utils/Vector.ts:3`)

**Purpose**: 2D vector math utilities.

**Static Methods**:
- `sub(v1, v2)` - Subtraction
- `add(v1, v2)` - Addition
- `mul(v, scalar)` - Scalar multiply
- `len(v)` - Magnitude
- `lenSq(v)` - Squared magnitude

---

### bound Decorator (`src/utils/bound.decorator.ts`)

**Purpose**: Auto-bind methods to instance.

**Usage**:
```typescript
class Example {
  @bound
  handleEvent() {
    // 'this' always refers to instance
  }
}
```

---

## Component Relationships

```
                    ┌──────────────────┐
                    │    Roulette      │
                    │  (Orchestrator)  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Box2dPhysics │   │RouletteRenderer│   │    UIObject   │
│   (Physics)   │   │   (Render)    │   │   (Interface) │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼           ┌───────┴───────┐
┌───────────────┐   ┌───────────────┐   ▼               ▼
│    Marble     │   │    Camera     │ Minimap    RankRenderer
│   (Entity)    │   │  (Viewport)   │
└───────────────┘   └───────────────┘

        │
        ├── ParticleManager ── Particle[]
        │
        └── SkillEffect (implements GameObject)
```

## Lifecycle Hooks

### Initialization
```
Roulette.constructor()
    └── RouletteRenderer.init()
        └── _init()
            ├── VideoRecorder creation
            ├── Box2dPhysics.init()
            ├── RankRenderer added
            ├── Event listeners attached
            ├── Minimap added
            └── Default map loaded
```

### Game Start
```
Roulette.start()
    ├── Set _isRunning = true
    ├── Calculate winnerRank
    ├── [If autoRecording] VideoRecorder.start()
    ├── physics.start()
    └── marbles.forEach(isActive = true)
```

### Winner Detection
```
_updateMarbles()
    └── marble.y > stage.goalY
        ├── Push to _winners
        ├── Check if target winner
        │   ├── Dispatch 'goal' event
        │   ├── Set _winner
        │   ├── _isRunning = false
        │   ├── particleManager.shot()
        │   └── [Delayed] recorder.stop()
        └── [Delayed] physics.removeMarble()
```
