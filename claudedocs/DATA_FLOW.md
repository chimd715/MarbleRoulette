# Marble Roulette - Data Flow Documentation

## Overview

This document describes the data flow patterns, state management, and communication between components in the Marble Roulette application.

## Application State

### Global State Locations

| Location | Data | Access Pattern |
|----------|------|----------------|
| `Roulette` instance | Game state, marbles, physics | `window.roullete` |
| `Options` singleton | User preferences | `window.options` |
| `localStorage` | Persisted names | `mbr_names` key |

### State Hierarchy

```
┌────────────────────────────────────────────────────────────────────┐
│ Global (window)                                                     │
│ ├── roullete: Roulette                                             │
│ │   ├── _marbles: Marble[]                                         │
│ │   ├── _winners: Marble[]                                         │
│ │   ├── _isRunning: boolean                                        │
│ │   ├── _stage: StageDef                                           │
│ │   ├── physics: IPhysics                                          │
│ │   │   └── marbleMap: { [id]: Box2D.b2Body }                     │
│ │   ├── _camera: Camera                                            │
│ │   │   ├── _position: VectorLike                                 │
│ │   │   └── _zoom: number                                         │
│ │   └── _renderer: RouletteRenderer                               │
│ │       └── _images: { [name]: HTMLImageElement }                 │
│ └── options: Options                                               │
│     ├── useSkills: boolean                                         │
│     ├── winningRank: number                                        │
│     └── autoRecording: boolean                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### 1. User Input → Game State

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  HTML Input  │ ──→ │ Event Handler │ ──→ │  Roulette    │
│  (textarea)  │     │ (index.html)  │     │  API Call    │
└──────────────┘     └───────────────┘     └──────────────┘
       │                                          │
       │                                          ▼
       │                                   ┌──────────────┐
       │                                   │   Marble[]   │
       │                                   │   Creation   │
       │                                   └──────────────┘
       ▼
┌──────────────┐
│ localStorage │
│   Persist    │
└──────────────┘
```

**Flow Details**:
1. User types names in `#in_names` textarea
2. `input` event triggers `getReady()`
3. `roullete.setMarbles(names)` parses and creates marbles
4. Names persisted to `localStorage.mbr_names`
5. Physics bodies created via `Box2dPhysics.createMarble()`

### 2. Physics → Marble Position

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│   Box2D      │ ──→ │  physics.step │ ──→ │ marbleMap    │
│   World      │     │    (10ms)     │     │  Update      │
└──────────────┘     └───────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│   Render     │ ←── │ Marble.render │ ←── │ position get │
│   Frame      │     │               │     │ (from body)  │
└──────────────┘     └───────────────┘     └──────────────┘
```

**Key Insight**: Marble position is always read from physics body, not stored locally.

```typescript
// In Marble class
get position() {
  return this.physics.getMarblePosition(this.id) || { x: 0, y: 0, angle: 0 };
}
```

### 3. Game Loop Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                         Frame (16.67ms)                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Time Accumulation                                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ _elapsed += (currentTime - _lastTime) * _speed               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Physics Steps (while _elapsed >= 10ms)                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ physics.step() → marble.update() → effects.update()          │ │
│  │        ↓               ↓                  ↓                  │ │
│  │   World Step      Skill Check      Lifetime Check            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Sort & Calculate                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ marbles.sort(by Y) → goalDist calc → timeScale calc          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Camera Update                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ camera.update({ marbles, stage, needToZoom, targetIndex })   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Render                                                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ renderer.render() → UI render → particles → winner overlay   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 4. Event Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Flow                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Roulette                    HTML Event Listeners               │
│  ┌──────────┐                ┌──────────────────┐               │
│  │ 'goal'   │ ─────────────→ │ Show settings    │               │
│  │ event    │                │ panel (delayed)  │               │
│  └──────────┘                └──────────────────┘               │
│                                                                  │
│  ┌──────────┐                ┌──────────────────┐               │
│  │ 'shake   │ ─────────────→ │ Toggle shake     │               │
│  │ Available│                │ button visibility│               │
│  │ Changed' │                └──────────────────┘               │
│  └──────────┘                                                    │
│                                                                  │
│  User Actions                Roulette Methods                   │
│  ┌──────────┐                ┌──────────────────┐               │
│  │ Start    │ ─────────────→ │ roullete.start() │               │
│  │ button   │                └──────────────────┘               │
│  └──────────┘                                                    │
│                                                                  │
│  ┌──────────┐                ┌──────────────────┐               │
│  │ Shuffle  │ ─────────────→ │ setMarbles()     │               │
│  │ button   │                └──────────────────┘               │
│  └──────────┘                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Winner Detection Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    Winner Detection                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Marble Y Position Check                                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ marble.y > stage.goalY  (crossed finish line)                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Winner Array Update                                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ _winners.push(marble)                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Target Winner Check                                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ _winners.length === _winnerRank + 1                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│           │                                    │                   │
│           │ YES                                │ NO                │
│           ▼                                    ▼                   │
│  ┌──────────────────┐                 ┌──────────────────┐       │
│  │ • Dispatch 'goal'│                 │ Continue racing  │       │
│  │ • Set _winner    │                 │                  │       │
│  │ • _isRunning=false│                └──────────────────┘       │
│  │ • Particle shot  │                                             │
│  │ • Stop recording │                                             │
│  └──────────────────┘                                             │
│                              │                                     │
│                              ▼                                     │
│  Marble Cleanup (delayed 500ms)                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ physics.removeMarble(marble.id)                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 6. Camera Follow Logic

```
┌────────────────────────────────────────────────────────────────────┐
│                    Camera Target Selection                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Target Index Calculation                                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ targetIndex = winnerRank - winners.length                    │ │
│  │                                                               │ │
│  │ Example: winnerRank=0 (first), winners=[]                    │ │
│  │          targetIndex = 0 (follow first place)                │ │
│  │                                                               │ │
│  │ Example: winnerRank=4 (5th place), winners=[a,b,c]          │ │
│  │          targetIndex = 1 (follow 2nd remaining marble)       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Position Interpolation                                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ newPos = currentPos + (targetPos - currentPos) / 10          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  Zoom Calculation                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ if (goalDist < zoomThreshold):                               │ │
│  │   zoom = max(1, (1 - goalDist/zoomThreshold) * 4)           │ │
│  │ else:                                                         │ │
│  │   zoom = 1                                                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## State Mutations

### Marble State Changes

| Trigger | State Change | Location |
|---------|--------------|----------|
| `setMarbles()` | Create all marbles | `roulette.ts:329` |
| `start()` | `isActive = true` | `roulette.ts:306` |
| Cross goal | Remove from `_marbles` | `roulette.ts:187` |
| Stuck > 5s | `shakeMarble()` impulse | `marble.ts:90` |

### Physics State Changes

| Trigger | State Change | Location |
|---------|--------------|----------|
| `createMarble()` | Create body (sleeping) | `physics-box2d.ts:111` |
| `start()` | Wake and enable all | `physics-box2d.ts:186` |
| `step()` | Advance simulation | `physics-box2d.ts:194` |
| `impact()` | Apply impulses | `physics-box2d.ts:163` |
| `removeMarble()` | Destroy body | `physics-box2d.ts:136` |

### UI State Changes

| Trigger | State Change | Location |
|---------|--------------|----------|
| `start()` | Hide settings panel | `index.html:457` |
| `goal` event | Show settings (3s delay) | `index.html:497` |
| `shakeAvailableChanged` | Toggle shake button | `index.html:501` |
| Wheel event | Scroll rank list | `rankRenderer.ts:18` |

## Data Persistence

### localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `mbr_names` | string | Comma-separated names |

### Save Pattern
```javascript
// On input change
localStorage.setItem('mbr_names', names.join(','));
```

### Load Pattern
```javascript
// On DOMContentLoaded
const savedNames = localStorage.getItem('mbr_names');
if (savedNames) {
  document.querySelector('#in_names').value = savedNames;
}
```

## Timing and Synchronization

### Fixed vs Variable Timestep

```
┌────────────────────────────────────────────────────────────────────┐
│              Timestep Architecture                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Variable: Render Loop                                             │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ requestAnimationFrame (~60fps, ~16.67ms)                       ││
│  └────────────────────────────────────────────────────────────────┘│
│                              │                                     │
│                              ▼                                     │
│  Fixed: Physics Steps                                              │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ while (elapsed >= 10ms) { physics.step(10ms); elapsed -= 10 } ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Benefits:                                                          │
│  • Deterministic physics regardless of frame rate                  │
│  • Prevents spiral of death (capped at 100ms accumulated)          │
│  • Smooth interpolation between physics steps                      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Time Scale System

```typescript
// Slow-motion near finish
_calcTimeScale(): number {
  if (goalDist < zoomThreshold && competitor exists) {
    return max(0.2, goalDist / zoomThreshold);
  }
  return 1;
}
```

## Error Handling

### Validation Points

| Location | Validation | Error |
|----------|------------|-------|
| `setSpeed()` | `value > 0` | "Speed multiplier must larger than 0" |
| `setMap()` | `0 <= index < stages.length` | "Incorrect map number" |
| `_loadMap()` | `_stage !== null` | "No map has been selected" |

### Graceful Degradation

- Missing marble skin: Falls back to colored circle
- Invalid name format: `parseName()` returns null, skipped
- Physics body not found: Returns `{ x: 0, y: 0, angle: 0 }`
