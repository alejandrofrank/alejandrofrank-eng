# Project arcade: After Hours

The original green homepage remains the default at `/`. The shared view picker links directly to Original, Tech and Arcade. The selected project carries between views, without a saved preference or automatic redirect on a later visit.

## The room

`/play` presents six original SVG cabinets on a perspective floor. Each cabinet has a project-specific illustration, marquee, color, joystick and coin slot. Selecting one lights its screen, moves a fictional pixel character to it, and opens the matching console below the floor. Correct catalog decisions and painting trigger a brief character reaction. There is no perpetual animation or sound.

The room uses native radio controls: click, tap, or Tab into the group and use arrow keys. On narrow screens the floor scrolls horizontally and centers the selected cabinet. A direct action below the room jumps to its game or concept. The URL records the project; both project fragments and console anchors survive reloads. Reduced-motion preferences remove movement and transitions.

The character is original artwork, not a likeness of Alejandro. All room artwork is code-native; it has no external image dependencies.

## What visitors can play

| Project | Cabinet | Interaction | Status |
| --- | --- | --- | --- |
| Bakiano | Market run | A proposed comparable-basket challenge involving stale prices and pack differences. | Concept |
| GCP Ingestion Lab | Delivery room | A proposed duplicate/late-event challenge with receipt and merge decisions. | Concept |
| Catalog Match Lab | Same or different? | Judge three listing pairs, then inspect normalized evidence. Replay with a fresh score. | Playable introduction |
| BigQuery Query Guard | Query budget | A proposed challenge about preserving answers while reducing unnecessary reads. | Concept |
| Raster Lab | Pixel workshop | Paint an 8 × 8 sprite using four indexed colors; swap between three palettes, undo strokes, clear, and save a 512 × 512 PNG. | Playable workshop |
| Vesti | Outfit puzzle | A proposed garment-replacement puzzle that preserves outfit context. | Concept |

## Interaction and evidence

- The matching challenge uses three hand-authored fictional pairs. It illustrates identity decisions; it does not invoke the standalone matcher or a trained model.
- The pixel workshop is a small drawing toy, separate from the full Raster Lab. Its project link opens the actual image-processing tool. Canvas colors are palette indices, so changing palettes preserves the drawing. One drag is one undo step; clear is undoable, and unchanged strokes do not add history.
- Pixel controls support mouse, touch and keyboard. The canvas has one tab stop; arrows move between pixels, and Enter or Space paints. Swatches have text labels, each pixel exposes its row, column and ink, and status messages describe changes.
- The PNG export renders the indexed grid directly at 64 pixels per source pixel, with no smoothing or server request. It exports the chosen background as an opaque color.
- Scores, artwork and undo history live in memory. Leaving or reloading resets them. No accounts, analytics, API calls, timers, leaderboards or score gates are introduced.
- Each cabinet links to its full project story. Concept panels explicitly distinguish the project from a future game.
- Without JavaScript, all six project descriptions and reading links remain available; interactive controls stay hidden. Print also exposes every project panel.

## Source map

- `src/play/art.ts`: cabinet illustrations and the fictional player sprite.
- `src/play/page.ts`: room and console markup; project/game copy.
- `src/play/styles.ts`: room, cabinet, console and responsive styles.
- `public/play/arcade.mjs`: project selection, avatar movement and matching UI.
- `public/play/catalog-game.mjs`: matching challenge state.
- `public/play/pixel-canvas.mjs`: indexed canvas and undo state, independent of the DOM.
- `public/play/pixel-workshop.mjs`: accessible drawing controls and PNG export.
- `tests/`: scoring/replay and pixel stroke/undo/input-boundary checks.

## Future cabinets

Build Delivery room from the ingestion lab's real local core, preserving inspectable operations and clearly labeling in-memory adapters. Query budget should use recorded evidence, not invented timings or live cloud queries. Bakiano's challenge needs explicit fictional fixtures. Vesti remains a concept until its flow is demonstrable.

A game earns its place when a visitor can explain the project's central tradeoff after playing and reach the engineering evidence in one action.
