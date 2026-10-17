# Project arcade

Six compact games turn a project's engineering decisions into actions, constraints and visible outcomes. The default green homepage remains at `/`; the optional Arcade view stays at `/play`. Every station links back to its project. The room supports native radio-keyboard navigation, mobile scrolling, direct links and reduced motion.

## Games and references

All interfaces, artwork, fixtures and game code are original. The references below supply recognizable mechanics, not copied assets or levels.

| Project / game | Mechanic reference | Play | Engineering connection |
| --- | --- | --- | --- |
| Bakiano / Basket Run | [Grocery Game](https://cbs.priceisright.com/game-page/?id=grocery-game) | Choose grocery quantities to fill an exact order under budget; three checks per market. | Normalize pack sizes and currencies; reject stale observations and mismatched rate dates. |
| GCP Ingestion Lab / Packet Factory | [Human Resource Machine](https://tomorrowcorporation.com/humanresourcemachine) | Reorder and toggle commands; run or step a delivery line under an operation budget. | Completed receipts avoid duplicate work, observation time beats arrival order, and receipts must follow successful commits. |
| Catalog Match Lab / Catalog Customs | [Papers, Please](https://papersplea.se/presskit/) | Inspect nine documents across three shifts; approve, reject or hold. Three errors close the desk. | Units, variants, pack sizes and missing attributes determine product identity. |
| BigQuery Query Guard / Partition Sweep | [Opus Magnum](https://www.zachtronics.com/opus-magnum/) | Produce an exact output while shrinking a grid's read footprint to fit a budget. | Projection and partition filters reduce reads; LIMIT alone does not. |
| Image to Pixels / Palette Lock | [Mastermind](https://instructions.hasbro.com/en-ca/instruction/mastermind) | Recover four palette colors and a rendering method from image feedback in five attempts. | Fixed inputs and deterministic settings reproduce identical pixels under a bounded palette. |
| Vesti / Complete the rack | [SET](https://playmonster.com/product/set/) | Complete a three-card rack where each attribute is all the same or all different; two tries per rack. | Multiple independent attributes must be checked, rather than treating overall resemblance as identity. |

Each game has three authored stages, explicit instructions, results, inspection evidence and replay/reset. Stages are intentionally small. The goal is to expose a decision and its consequences in a short visit, not to claim a full game or benchmark.

## What actually runs

**Catalog Customs** calls the pinned public repository's `compareNames` function for every verdict. The expected answers are not stored. The fixtures are fictional, and the vocabulary is deliberately limited. Unknown qualifiers remain uncertain. This is neither a trained model nor Bakiano's private production matcher.

**Palette Lock** calls the pinned image renderer on an original 48 × 32 procedural source. All attempts use the same source and seed. Feedback reports palette overlap, method equality and the number of identical RGB pixels against the target. Palette order is irrelevant and is sorted before rendering. A win requires the recipe and all 1,536 output pixels to match. Each level has exactly one successful palette/method combination among the provided choices.

The previous unrestricted product-name inspector and worker-backed image A/B comparison remain in expandable sections under their games. The image comparison still holds source, grid and palette constant, ignores stale worker responses and compares bytes when checking repeatability.

**Packet Factory** is a deterministic teaching model of the public ingestion repository's receipt/read/merge ordering, not an embedded GCP loader. Reads and attempted merges count operations in this model, not cloud jobs, timing or billing. A third level injects a failure before commit. The run pauses when its station or browser tab becomes hidden.

**Partition Sweep** is an executable column-store simulation, not the Query Guard, a SQL interpreter or live BigQuery. Tile costs are fictional units. Product remains a read dependency for ordering even when omitted from the output. Dates are partition metadata. The UI separates this model from the repository's recorded measurements and links their source. Compression, clustering, cache effects and billing minimums are outside the model.

**Basket Run** uses synthetic grocery offers, amounts, dates and exchange rates. Its simulated market day is fixed at 16 October 2026, never presented as today's real market. Conversion uses the rate attached to an observation; an eligible VES observation needs a rate with the same date. The game illustrates the public Bakiano case study without exposing private source or data.

**Complete the rack** uses explicit shape/color/pattern tags and original SVG garments. It does not run Vesti's segmentation or retrieval pipeline and makes no claim about AI quality. Its connection is attribute reasoning; a real image-based Vesti demo still requires actual saved model outputs and provenance.

## Source provenance

`public/play/sources.json` records each embedded engine's repository, exact commit, source path and LF-normalized SHA-256. Engine copies remain unchanged apart from the matcher's `.js` → `.mjs` filename. Its MIT notice accompanies the source. The interface links to exact revisions; snapshot tests detect drift. Review upstream changes and update the manifest before replacing an engine.

## Verification

Run `npm test` and `npm run typecheck`. Tests cover solvability, exact output matching, duplicate and failure behavior, stale/rate-date rejection, palette limits and reproducibility, unknown matcher attributes, finite attempts, replay state and pinned source integrity. DOM interaction tests use the shipped markup and event listeners to play every stage, check failure paths, reset and keyboard focus. Canvas calls are captured in those tests; separate renderer tests verify real pixel buffers. DOM tests do not measure layout or replace visual browser checks.

Browser checks should exercise wrong and correct moves, advancing/resetting, keyboard focus, station switching, narrow layouts and the two free inspectors. No account, paid API, cloud query, persistence or analytics is introduced. Without JavaScript, project descriptions, limitations and reading links remain available.

### Short walkthroughs

- **Basket:** stage 1 buy B twice and D once ($6.60); stage 2 B twice and D once ($5.80); stage 3 C twice and E once ($5.90). Inspect the receipt to see normalization and dates.
- **Factory:** stage 1 move Check receipt above Read file; stage 2 keep the newest observation; stage 3 move Save receipt after Merge rows.
- **Customs:** Approve, Hold, Reject / Reject, Approve, Hold / Reject, Approve, Hold.
- **Query:** stage 1 deselect Notes and Image; stage 2 also deselect 14/15 October; stage 3 use the same footprint with an output limit of one.
- **Palette:** Ink/Cream/Moss/Clay with Nearest color; Ink/Cream/Sea/Peach with Error diffusion; Ink/Cream/Plum/Mist with Ordered dots.
- **Garments:** choose cards 3, 5, then 1.
