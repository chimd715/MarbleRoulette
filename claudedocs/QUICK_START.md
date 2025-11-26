# Marble Roulette - Quick Start Guide

## For Users

### Basic Usage

1. **Enter Names**: Type participant names in the textarea (comma or newline separated)
2. **Click Shuffle**: Randomize marble positions
3. **Click Start**: Begin the race
4. **Watch**: The marbles race down, winner announced at finish

### Name Format Options

| Format | Example | Result |
|--------|---------|--------|
| Basic | `Alice` | 1 marble |
| With count | `Bob*3` | 3 marbles named "Bob" |
| With weight | `Charlie/5` | Higher weight = faster skills |
| Combined | `Dave/2*5` | 5 marbles, weight 2 |

### Options

- **Map**: Choose different race courses
- **Recording**: Auto-record race as video (WebM)
- **Winner**: First place, Last place, or custom rank
- **Skills**: Enable/disable impact abilities

---

## For Developers

### Setup

```bash
git clone https://github.com/chimd715/MarbleRoulette.git
cd MarbleRoulette
yarn
yarn dev
```

Opens at `http://localhost:1235`

### Build & Deploy

```bash
yarn build    # Production build in dist/
yarn deploy   # Deploy to GitHub Pages
```

### Project Structure (Key Files)

```
src/
├── index.ts           # Entry point
├── roulette.ts        # Main controller
├── marble.ts          # Marble entity
├── physics-box2d.ts   # Physics engine
└── rouletteRenderer.ts # Rendering
```

### API Quick Reference

```javascript
// Access via window
const game = window.roullete;
const opts = window.options;

// Basic operations
game.setMarbles(['Alice', 'Bob*3']);
game.start();
game.setMap(0);
game.setSpeed(2);  // 2x speed

// Events
game.addEventListener('goal', (e) => {
  console.log('Winner:', e.detail.winner);
});

// Options
opts.useSkills = false;
opts.winningRank = 0;  // First place wins
```

### Adding a New Map

Edit `src/data/maps.ts`:

```typescript
export const stages: StageDef[] = [
  // ... existing maps
  {
    title: 'My New Map',
    goalY: 100,    // Finish line Y
    zoomY: 95,     // Zoom threshold
    entities: [
      // Walls
      {
        type: 'static',
        position: { x: 0, y: 0 },
        shape: { type: 'polyline', points: [[x1, y1], [x2, y2]], rotation: 0 },
        props: { density: 1, restitution: 0, angularVelocity: 0 }
      },
      // Obstacles
      {
        type: 'kinematic',  // Can rotate
        position: { x: 15, y: 50 },
        shape: { type: 'box', width: 2, height: 0.1, rotation: 0 },
        props: { density: 1, restitution: 0.5, angularVelocity: 2 }
      }
    ]
  }
];
```

### Shape Types

| Type | Properties |
|------|------------|
| `polyline` | `points: [[x,y], ...]`, `rotation` |
| `box` | `width`, `height`, `rotation` |
| `circle` | `radius` |

### Physics Properties

| Property | Description |
|----------|-------------|
| `density` | Mass (affects collision) |
| `restitution` | Bounciness (0-1) |
| `angularVelocity` | Rotation speed (kinematic only) |
| `life` | Destroyed on collision (optional) |

---

## Common Tasks

### Change Canvas Size

Edit `src/data/constants.ts`:
```typescript
export const canvasWidth = 1600;
export const canvasHeight = 900;
```

### Add New Skill

1. Add to `Skills` enum in `constants.ts`
2. Implement in `Marble._updateSkillInformation()`
3. Handle in `Roulette._updateMarbles()`
4. Add visual in `skillEffect.ts` (optional)

### Add Translation

Edit `src/data/languages.ts`:
```typescript
export const Translations = {
  en: { ... },
  ko: { ... },
  // Add new language:
  fr: {
    'Start': 'Démarrer',
    'Shuffle': 'Mélanger',
    // ...
  }
};
```

---

## Documentation Index

| Document | Contents |
|----------|----------|
| [PROJECT_INDEX.md](./PROJECT_INDEX.md) | Overview & structure |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design |
| [API_REFERENCE.md](./API_REFERENCE.md) | Full API docs |
| [COMPONENTS.md](./COMPONENTS.md) | Component breakdown |
| [DATA_FLOW.md](./DATA_FLOW.md) | State & data flow |
