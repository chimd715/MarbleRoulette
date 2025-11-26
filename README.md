# Marble Roulette

A lucky draw application by dropping marbles.

## Demo

- **This Fork**: [https://chimd715.github.io/MarbleRoulette/](https://chimd715.github.io/MarbleRoulette/)
- **Original**: [https://lazygyu.github.io/roulette](https://lazygyu.github.io/roulette)

## Credits

- **Original Author**: [lazygyu](https://github.com/lazygyu)
- **Original Repository**: [https://github.com/lazygyu/roulette](https://github.com/lazygyu/roulette)

## Changes from Upstream

This fork includes the following enhancements and modifications:

### UI/UX Improvements
- **Modern Glassmorphism Design**: Updated UI with backdrop blur effects and modern styling
- **Settings Panel**: Reorganized settings with collapsible sections (Display, Game, Skill settings)
- **Probability Display**: Show probability per option with visual progress bars
- **Game Result Panel**: New result panel showing winner with trophy and podium (top 3)
- **Download in Result Panel**: Save results directly from the game result panel

### Game Controls
- **Speed Control**: Adjustable game speed (0.5x - 2.5x) with dedicated buttons
- **Zoom Control**: Manual zoom in/out for the game view
- **Freeze/Pause**: Pause the game at any time
- **Shake All**: Shake all marbles at once
- **Auto-Reset on Start**: Automatically reset and start when clicking start button after game ends

### Settings Synchronization
- **Map Selector Sync**: Map selection synchronized between side panel and settings panel
- **Persistent Settings**: Settings saved to localStorage and restored on reload

### Translations
- **Korean Localization**: Full Korean translation for all UI elements
- **Dynamic Translation**: Real-time translation support for dynamically generated content

### Bug Fixes
- **Ball Stuck Fix**: Fixed issue where balls get stuck at the right corner
- **Reset Behavior**: Reset button no longer resets game speed (separate speed reset button available)
- **Shuffle Behavior**: Shuffle button now closes game result panel if open

### Icons
- **Google Material Icons**: Updated save/download icon using Google Material Icons

## Requirements

- Node.js
- Yarn
- TypeScript
- Parcel
- box2d-wasm

## Development

```shell
yarn
yarn dev
```

## Build

```shell
yarn build
```

## License

This project is freeware and may be used freely anywhere, including in broadcasts and videos.
