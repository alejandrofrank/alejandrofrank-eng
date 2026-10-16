# Alejandro Frank — engineering portfolio

An engineering portfolio with a direct **Original / Tech / Arcade** view picker. The original green gradients and expandable sections open by default. Choose **Tech** for an animated project explorer and engineering case studies, or **Arcade** for the optional game view.

**[Explore the live site](https://me.alejandrofranks.workers.dev)** · **[Career timeline](https://me.alejandrofranks.workers.dev/timeline)** · **[Bakiano case study](https://github.com/alejandrofrank/bakiano-showcase)**

## What you can explore

- **Original homepage:** green gradients, expandable About me and Projects sections, experience and contact links. All six projects remain accessible here.
- **Tech project explorer:** `/tech` has six selectable projects, each with its own system sketch, color and animated entrance. Use the project rail, arrow keys or previous/next controls; the selected project stays in the URL and carries into the arcade. “Read as a list” restores the complete reading index.
- **View picker:** three visible links with distinct icons and a highlighted current view. One click switches between Original, Tech and Arcade; the selected project carries across all three. The control expands to the available width on phones.
- **Project pages:** `/projects/:slug` explains the problem, approach, inspectable evidence and limitations. Three runnable labs include local setup instructions. Bakiano and Vesti retain their technical walkthroughs.
- **Experience:** a career timeline with role-by-role system diagrams and written explanations.
- **Live activity:** a GitHub contribution calendar fetched at the edge, with a profile link available if the API is unavailable.
- **Reading interface:** compact titles, direct project links, keyboard navigation, responsive layouts and print styles. Reading the projects requires no JavaScript.
- **Optional Arcade view:** `/play` is an illustrated arcade room with six distinct cabinets and a pixel character that walks between them. Play the three-pair identity challenge or draw in the 8 × 8 pixel workshop, with three palettes, stroke undo and PNG export. Four other games are labeled concepts. Choose Tech or Original to continue with the same project. Keyboard, touch and reduced-motion support are included. [Direction and next steps](docs/project-arcade.md).

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
npm run typecheck
npm test
npm run deploy
```

Deployment requires your own Cloudflare account and Worker configuration. Set the `GITHUB_TOKEN` Worker secret separately if you want the calendar in production.

## Project map

| Path | Purpose |
| --- | --- |
| `src/content.ts` | Shared product links and career context |
| `src/projects/catalog.ts` | Project descriptions, evidence, status and reading order |
| `src/appearance.ts`, `public/appearance.mjs` | Original / Tech / Arcade navigation and selected-project links |
| `src/projects/page.ts`, `src/projects/styles.ts` | Project index and individual reading pages |
| `src/projects/explorer.ts`, `src/projects/explorer-styles.ts`, `public/projects/` | Project picker, system sketches and interruptible native browser animations |
| `src/play/`, `public/play/` | Illustrated arcade, original SVG art, matching challenge and pixel workshop |
| `src/index.ts` | Routes: homepage, `/tech`, `/projects/:slug`, `/play`, `/timeline`, `/resume`, and `/health` |
| `src/layout.ts` | Original green homepage and expandable project panels |
| `src/panels/` | Project panels, technical explanations, and GitHub data |
| `src/timeline/` | Interactive career timeline |
| `src/resume/` | Role walkthroughs, SVG player, and readable text |
| `resume/` | Python scene builder and role definitions |
| `src/styles.ts`, `src/personal-styles.ts` | Shared and homepage styling |
| `public/` | Static assets |

## Status

Projects described inside the portfolio have their own status. Bakiano is live, the three engineering labs run locally, Raster Lab is a live browser workbench for pixels, dithering and ASCII, and Vesti is in development. Branch changes can be reviewed locally before deployment.
