# Project arcade: first direction

## Reading comes first

The original green homepage remains the default at `/`, with its gradients and expandable sections. The **Appearance** picker previews both views. **Tech** opens the animated project explorer at `/tech`: a project rail drives a system sketch and its story in the same selection. “Read as a list” reveals the complete reading index, which is also the no-JavaScript and print fallback. Each project has a stable `/projects/:slug` page with the problem, approach, evidence, limitations and a next-project link.

The fun-mode control lives inside Tech. “Turn fun mode on” enters the arcade; “Turn fun mode off” returns to the selected project in `/tech`. From a project page, switching on selects that project's station. The appearance control offers a direct return to Original. Both controls use normal navigation links, so navigation works without JavaScript. There is no saved preference or automatic redirect that changes the homepage on a later visit.

The reading order follows a system: Bakiano → ingestion → product identity → query controls. Image to ASCII adds a creative experiment; Vesti closes with work in progress. Status and evidence distinguish a live product from a runnable lab or an idea.

## What the reference suggests

[dataconale.com](https://dataconale.com/) was inspected on 2026-10-10. Its visible navigation, selectable work stories, skill inspector and personal introduction make the portfolio feel authored. Our direction takes the principle of discoverable depth: a project should invite inspection and connect to the person behind it. The typography, content and avatar here are original; this implementation does not reuse the reference's assets or code.

## Recommended avatar direction

A small pixel-art arcade with one station per project. The avatar is a navigation aid: move to a station, try one decision from that project, inspect the evidence, then open the full story. A short game should explain something the underlying system actually does.

The first `/play` prototype uses an original generic pixel marker. It is not a finalized likeness. Selection places it directly at the station; there is no walking animation or physics yet. Touch, pointer and native radio-group arrow keys all work. The URL fragment records the selected project.

Two alternatives worth comparing before investing in art:

- **Illustrated desk:** the avatar sits at a desk and each project is a console. More personal, less navigation, but requires a stronger illustration direction.
- **Project map:** the avatar follows the path from ingestion to serving. It explains the system well, but makes the independent art and outfit projects feel less naturally connected.

The arcade is the most flexible starting point because every project can have a distinct game while sharing the same controls and reading pages.

## One project, one game loop

| Project | Game | Decision and feedback | Status |
| --- | --- | --- | --- |
| Bakiano | Market run | Build a comparable basket; explain stale prices, currencies and pack differences before comparing totals. | Concept |
| GCP Ingestion Lab | Delivery room | Replay duplicate and late events; choose receipt and merge rules, then inspect rows and actual operations. | Concept |
| Catalog Match Lab | Same or different? | Accept an equivalent presentation, reject a size conflict, or defer when an attribute is missing. Show normalized evidence. | Three-pair playable introduction |
| BigQuery Query Guard | Query budget | Choose a query that preserves the requested answer; inspect recorded scan estimates, billed bytes and timing separately. | Concept |
| Image to ASCII | Pixel workshop | Adjust character density and palette; compare the retained visual detail with the source. | Concept |
| Vesti | Outfit puzzle | Select a garment and compare replacements while retaining outfit context. Label the product's unfinished parts. | Concept |

## Prototype boundaries

- The playable introduction uses three hand-authored fictional pairs. It illustrates identity decisions; it does not invoke the standalone matcher or simulate a trained model.
- Scores are local, in-memory state. There is no account, tracking, API call, timer or leaderboard.
- No project is locked behind a score. Every station links directly to its reading page.
- Missing JavaScript leaves every game concept and project link readable. The station controls and game only appear after their script initializes.
- Native controls, visible focus, textual feedback and evidence tables carry the interaction. The avatar and color are supplementary. Station selection has a short avatar entrance and panel transition; system reduced-motion preferences disable these. There is no sound or idle animation.

## Next implementation sequence

1. Choose the avatar art direction and make a recognizable original character, with a static reduced-motion state.
2. Replace the introductory catalog quiz with a bounded interaction that invokes a pinned, reviewed version of the public matching core. Keep synthetic fixtures and visible uncertainty.
3. Build Delivery room from the ingestion lab's real local core, preserving measured operations and labeling the in-memory adapters.
4. Add Query budget using recorded evidence. Never invent timings or trigger cloud queries from play mode.
5. Add the creative stations after their interactions and source assets are ready. Keep Vesti labeled as a concept until it has a demonstrable flow.

Evaluate each addition by whether a visitor can explain the project's central tradeoff after playing, and can reach the technical evidence in one action. A game should be a useful entry point into the work.
