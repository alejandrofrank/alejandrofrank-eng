# Alejandro Frank — engineering portfolio

An engineering portfolio with a direct **Original / Tech / Arcade** view picker. The original green gradients and expandable sections open by default. Choose **Tech** for an animated project explorer and engineering case studies, or **Arcade** for the optional game view.

**[Explore the live site](https://me.alejandrofranks.workers.dev)** · **[Career timeline](https://me.alejandrofranks.workers.dev/timeline)** · **[Bakiano case study](https://github.com/alejandrofrank/bakiano-showcase)**

**[Agents in GCP](https://me.alejandrofranks.workers.dev/projects/madrid-delivery-sim)** explains how agents with different tools, memory, permissions and decision rules work together. A delivery simulation in Madrid is the example, with a clickable city replay, 3D store, agent anatomy, a GCP architecture guide, evidence boundaries and MIT source. The demo runs entirely in the browser from recorded synthetic data. It makes no live model calls or Google Cloud queries; the existing portfolio hosts its static files. The existing project URL and source repository name remain stable.

## What you can explore

- **Original homepage:** green gradients, expandable About me and Projects sections, experience and contact links. All seven projects remain accessible here.
- **Tech project explorer:** `/tech` has seven selectable projects, each with its own system sketch, color and animated entrance. Use the project rail, arrow keys or previous/next controls; the selected project stays in the URL and carries into the arcade. “Read as a list” restores the complete reading index.
- **View picker:** three visible links with distinct icons and a highlighted current view. One click switches between Original, Tech and Arcade; the selected project carries across all three. The control expands to the available width on phones.
- **Project pages:** `/projects/:slug` explains the problem, approach, inspectable evidence and limitations. Three runnable labs include local setup instructions. Bakiano and Vesti retain their technical walkthroughs.
- **Experience:** a career timeline with role-by-role system diagrams and written explanations.
- **Live activity:** a GitHub contribution calendar fetched at the edge, with a profile link available if the API is unavailable.
- **Reading interface:** compact titles, direct project links, keyboard navigation, responsive layouts and print styles. Reading the projects requires no JavaScript.
- **Optional Arcade view:** `/play` has seven illustrated cabinets and 48 stages. Play Basket Run, Packet Factory, Catalog Customs, Partition Sweep, Pixel Shuffle, Complete the rack and Order Flow. The Agents in GCP game opens at `/play#concept-madrid-delivery-sim`: twenty puzzles use touching grids of 16 to 72 identical two-seat cars, showing only a central arrow and highlights. Clear a path into parking and serve the front passenger's color. From level 6, incognito cars reveal their color only when unblocked. From 7, only the front passenger is visible. From 13, a countdown starts on the first released car. Levels 19–20 reduce parking to two spaces. Queue, parking and yard have a verified complete solution; the proof does not guarantee a player will discover it within the time limit. Losing choices commit immediately without a warning or confirmation. Existing stars carry over, and three undos and an optional hint support retrying. Reload and Undo do not reset the clock. This original browser puzzle has no map or AI/GCP calls. Results link to the real agent in a new tab. The other six games remain unchanged. Keyboard, touch and reduced motion are supported. [Arcade designs and evidence](docs/project-arcade.md) · [Order Flow rules and proof](docs/order-flow.md).

The appearance choices are ordinary links, so they work without JavaScript. The full project list is the fallback when scripts are unavailable and is used for printing. Motion follows the system's reduced-motion preference; animations are finite and run on selection. `/` always opens the original homepage. Neither visiting a project nor playing a game changes the default for later visits.

## How it works

Hono renders HTML on Cloudflare Workers. Content, page layouts, visual effects, and data panels are separate modules. Public GitHub data uses the REST API; an optional token enables the contribution calendar through GraphQL. Responses are cached to limit repeated upstream requests.

The experience walkthroughs use a Python scene builder that produces JSON for an SVG player. The same roles are available as readable text and a print layout.

## Run locally

```bash
git clone https://github.com/alejandrofrank/alejandrofrank-eng.git
cd alejandrofrank-eng
npm ci
npm run dev
```

The basic site runs without a GitHub token. To enable the contribution calendar locally, add your token as `GITHUB_TOKEN` in a gitignored `.dev.vars` file. `GITHUB_USER` is configured in `wrangler.jsonc`.

```bash
npm run deploy
```

Deployment requires your own Cloudflare account and Worker configuration. Set the `GITHUB_TOKEN` Worker secret separately if you want the calendar in production.

### Maintenance approach

This is a personal portfolio: prioritize small changes and quick fixes. No manual testing is expected from the owner. Do not add test infrastructure or run the full suite for routine edits. Use a targeted automated check only when it resolves a concrete concern; deployment already builds the site.

Existing tests remain available for debugging with `npm test`, and TypeScript diagnostics with `npm run typecheck`. They are optional tools, not a release checklist. Documentation changes do not require a website deployment.

## Project map

| Path | Purpose |
| --- | --- |
| `src/content.ts` | Shared product links and career context |
| `src/projects/catalog.ts` | Project descriptions, evidence, status and reading order |
| `src/appearance.ts`, `public/appearance.mjs` | Original / Tech / Arcade navigation and selected-project links |
| `src/projects/page.ts`, `src/projects/styles.ts` | Project index and individual reading pages |
| `src/projects/explorer.ts`, `src/projects/explorer-styles.ts`, `public/projects/` | Project picker, system sketches and interruptible native browser animations |
| `src/play/`, `public/play/` | Seven-game arcade, real-code matching/image demonstrations and pinned engine sources |
| `src/play/games/order-flow.ts`, `public/play/games/order-flow*.mjs` | Order Flow packed grids, passenger queue, parking, saved progress, complete-state certificates and independent BFS |
| `public/projects/agents-demo/theme.css` | Existing warm palette for the recorded Agents in GCP demo |
| `src/index.ts` | Routes: homepage, `/tech`, `/projects/:slug`, `/play`, `/timeline`, `/resume`, and `/health` |
| `src/layout.ts` | Original green homepage and expandable project panels |
| `src/panels/` | Project panels, technical explanations, and GitHub data |
| `src/timeline/` | Interactive career timeline |
| `src/resume/` | Role walkthroughs, SVG player, and readable text |
| `resume/` | Python scene builder and role definitions |
| `src/styles.ts`, `src/personal-styles.ts` | Shared and homepage styling |
| `public/` | Static assets |

## Status

Projects described inside the portfolio have their own status. Bakiano is live, the three engineering labs run locally, Image to Pixels is a live browser tool for pixels, dithering and ASCII, and Vesti is in development. Branch changes can be reviewed locally before deployment.

### Updating the interactive agent demo

The isolated static bundle lives in `public/projects/agents-demo/`. The city loads first; the shared Three.js runtime, SimReady models and recordings load when a visitor opens Store or Agent parts. Pause, seek and reduced-motion settings apply to recorded time, with no catch-up jumps after a hidden tab. WebGL failure leaves a recorded floor plan or the agent’s accessible part inspector.

Couriers, agent roles and robot parts share a searchable selector in `picker.mjs` and `picker.css`. Courier names are grouped by their recorded fleet, with vehicle icons; search also accepts district names and original IDs. The native select remains the value source and fallback. Arrow keys explore, Enter selects, Escape cancels, and Tab leaves the control. Menus fit the visible viewport, including the space above a mobile keyboard. Selector behavior and positioning are covered by `tests/agents-picker.test.mjs`.

To refresh the committed public inputs from a verified source checkout:

```bash
python3 scripts/sync-agents-demo.py /path/to/madrid-delivery-sim
npm test
npm run typecheck
```

`provenance.json` records the source revision, input hashes and transformations. The city preserves its measured road trajectories; the separate store example retains the first ten simulation minutes through completed delivery. Source MIT, Three.js and SimReady / OpenStreetMap credits ship with the bundle. Re-run the browser checks after refreshing renderer modules. Do not add live API or model endpoints to this public example.
