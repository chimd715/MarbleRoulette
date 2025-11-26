# Marble Roulette - API Reference

## Roulette Class

**File**: `src/roulette.ts:19`

Main game controller exposed globally as `window.roullete`.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | True when physics engine initialized |

### Methods

#### `setMarbles(names: string[]): void`

Initialize marbles with the given names.

**Parameters**:
- `names`: Array of name strings with optional weight/count modifiers

**Name Format**:
```
name[/weight][*count]

Examples:
"Alice"       → 1 marble, weight 1
"Bob/5"       → 1 marble, weight 5 (heavier = faster skill cooldown)
"Charlie*3"   → 3 marbles named "Charlie"
"Dave/2*5"    → 5 marbles named "Dave", weight 2
```

**Example**:
```javascript
roullete.setMarbles(['Alice', 'Bob/5', 'Charlie*3']);
```

---

#### `start(): void`

Start the race. Enables physics and optionally starts recording.

**Prerequisites**:
- `setMarbles()` must be called first
- Sets `_isRunning = true`

**Side Effects**:
- Awakens all marble physics bodies
- Starts video recording if `autoRecording` enabled
- Hides settings panel

---

#### `setMap(index: number): void`

Change the current stage/map.

**Parameters**:
- `index`: Map index (0 to `stages.length - 1`)

**Throws**: `Error` if index out of bounds

**Example**:
```javascript
const maps = roullete.getMaps();
roullete.setMap(0); // First map
```

---

#### `getMaps(): { index: number, title: string }[]`

Get list of available maps.

**Returns**: Array of map info objects

**Example**:
```javascript
const maps = roullete.getMaps();
// [{ index: 0, title: 'Wheel of fortune' }, ...]
```

---

#### `setSpeed(value: number): void`

Set game speed multiplier.

**Parameters**:
- `value`: Speed multiplier (must be > 0)

**Throws**: `Error` if value <= 0

**Example**:
```javascript
roullete.setSpeed(2); // 2x speed
```

---

#### `getSpeed(): number`

Get current speed multiplier.

**Returns**: Current speed value (default: 1)

---

#### `setWinningRank(rank: number): void`

Set which position determines the winner.

**Parameters**:
- `rank`: 0-indexed rank (0 = first place)

**Example**:
```javascript
roullete.setWinningRank(0);  // First to finish wins
roullete.setWinningRank(9);  // 10th place wins
```

---

#### `setAutoRecording(value: boolean): void`

Enable/disable automatic video recording.

**Parameters**:
- `value`: Recording enabled state

---

#### `getCount(): number`

Get total number of active marbles.

**Returns**: Marble count

---

#### `clearMarbles(): void`

Remove all marbles from the game.

---

#### `reset(): void`

Full reset: clear marbles and reload current map.

---

#### `shake(): void`

Shake stuck marbles (only available when `shakeAvailable` is true).

---

#### `getZoom(): number`

Get current effective zoom level.

**Returns**: `initialZoom * camera.zoom`

---

### Events

Subscribe via `addEventListener()`:

```javascript
roullete.addEventListener('goal', (e) => {
  console.log('Winner:', e.detail.winner);
});
```

#### `goal`

Fired when target winner crosses finish line.

**Detail**:
```typescript
{ winner: string }  // Winner's name
```

---

#### `shakeAvailableChanged`

Fired when shake availability changes (marbles stuck > 3 seconds).

**Detail**:
```typescript
boolean  // true = shake available
```

---

## Options Singleton

**File**: `src/options.ts:7`

Global configuration exposed as `window.options`.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `useSkills` | `boolean` | `true` | Enable marble skills |
| `winningRank` | `number` | `0` | Target winner rank (0-indexed) |
| `autoRecording` | `boolean` | `true` | Auto-record on start |

---

## Marble Class

**File**: `src/marble.ts:8`

Individual marble entity.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique identifier |
| `name` | `string` | Display name |
| `size` | `number` | Radius (default: 0.5) |
| `color` | `string` | HSL color string |
| `hue` | `number` | Color hue value |
| `weight` | `number` | Weight factor (affects skills) |
| `skill` | `Skills` | Current active skill |
| `isActive` | `boolean` | Physics enabled state |
| `x` | `number` | X position |
| `y` | `number` | Y position |
| `angle` | `number` | Rotation angle |

### Skills Enum

```typescript
enum Skills {
  None = 0,
  Impact = 1,
}
```

**Impact**: Creates shockwave pushing nearby marbles

---

## IPhysics Interface

**File**: `src/IPhysics.ts:4`

Physics engine abstraction.

### Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize physics engine |
| `clear()` | Clear all bodies |
| `clearMarbles()` | Clear only marble bodies |
| `createStage(stage)` | Create stage obstacles |
| `createMarble(id, x, y)` | Create marble body |
| `shakeMarble(id)` | Apply random impulse |
| `removeMarble(id)` | Destroy marble body |
| `getMarblePosition(id)` | Get position and angle |
| `getEntities()` | Get obstacle states |
| `impact(id)` | Trigger impact skill |
| `start()` | Enable all marble bodies |
| `step(deltaSeconds)` | Advance simulation |

---

## UIObject Interface

**File**: `src/UIObject.ts:4`

UI component contract.

### Required Methods

```typescript
interface UIObject {
  update(deltaTime: number): void;
  render(ctx, params, width, height): void;
  getBoundingBox(): Rect | null;
}
```

### Optional Methods

```typescript
interface UIObject {
  onWheel?(e: WheelEvent): void;
  onMouseMove?(e?: { x, y }): void;
  onMouseDown?(e: { x, y }): void;
  onMouseUp?(e: { x, y }): void;
}
```

---

## Camera Class

**File**: `src/camera.ts:6`

Viewport management.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `zoom` | `number` | Current zoom level |
| `x` | `number` | X position |
| `y` | `number` | Y position |
| `position` | `VectorLike` | Current position object |

### Methods

| Method | Description |
|--------|-------------|
| `setPosition(v, force?)` | Set camera position |
| `lock(v)` | Lock/unlock auto-follow |
| `update(params)` | Update position/zoom |
| `renderScene(ctx, callback)` | Render with transform |

---

## Type Definitions

### VectorLike

```typescript
interface VectorLike {
  x: number;
  y: number;
}
```

### Rect

```typescript
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
```

### StageDef

```typescript
type StageDef = {
  title: string;
  entities?: MapEntity[];
  goalY: number;
  zoomY: number;
}
```

### MapEntity

```typescript
interface MapEntity {
  position: VectorLike;
  type: 'static' | 'kinematic';
  shape: EntityShape;
  props: EntityPhysicalProps;
}
```

### EntityShape

```typescript
type EntityShape =
  | { type: 'box'; width: number; height: number; rotation: number; color?: string }
  | { type: 'circle'; radius: number; color?: string }
  | { type: 'polyline'; points: [number, number][]; rotation: number; color?: string }
```

### EntityPhysicalProps

```typescript
type EntityPhysicalProps = {
  density: number;
  restitution: number;
  angularVelocity: number;
  life?: number;
}
```

---

## Utility Functions

### `parseName(nameStr: string)`

**File**: `src/utils/utils.ts:10`

Parse name string with optional weight/count.

```typescript
parseName('Alice/5*3')
// { name: 'Alice', weight: 5, count: 3 }
```

### `rad(degree: number)`

**File**: `src/utils/utils.ts:1`

Convert degrees to radians.

### Vector Class

**File**: `src/utils/Vector.ts:3`

Static vector math utilities:
- `Vector.sub(v1, v2)` - Subtraction
- `Vector.add(v1, v2)` - Addition
- `Vector.mul(v, scalar)` - Scalar multiplication
- `Vector.len(v)` - Length
- `Vector.lenSq(v)` - Length squared

---

## Constants

**File**: `src/data/constants.ts`

| Constant | Value | Description |
|----------|-------|-------------|
| `initialZoom` | 30 | Base zoom level |
| `canvasWidth` | 1600 | Canvas width |
| `canvasHeight` | 900 | Canvas height |
| `zoomThreshold` | 5 | Distance to trigger zoom |
| `STUCK_DELAY` | 5000 | Stuck detection ms |

### Default Entity Colors

```typescript
DefaultEntityColor = {
  box: 'cyan',
  circle: 'yellow',
  polyline: 'white',
}
```
