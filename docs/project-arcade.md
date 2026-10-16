# Project demos: input, result, evidence

The arcade room is an optional project selector. The interaction inside each station should demonstrate an engineering decision in under a minute. A visitor changes one input, sees the result, and can inspect the source. Scores, guessing and unrelated drawing activities do not serve that purpose.

The default green homepage remains at `/`. Original, Tech and Arcade carry the selected project between views; `/play` keeps its existing URL. Cabinets, keyboard navigation, mobile scrolling and reduced-motion support remain available.

## Implemented examples

### Image to Pixels — keep shading with fewer colors

The public tool is now named **Image to Pixels**. Its existing deployment URL and legacy recipe identifiers remain compatible. The 8 × 8 drawing toy has been removed.

The station runs the image repo's renderer against its original procedural fixtures. Nearest palette color and Floyd–Steinberg error diffusion receive the same source, grid, palette and adjustments. Visitors choose a sample, 16/32/64/128 columns and a two- or four-color palette. Actual output dimensions, cell counts and palette usage appear below both results.

**Check repeatability** executes both methods again and compares all RGBA bytes and dimensions with the preceding outputs. It does not return a prewritten success result. Processing runs in a browser worker; a new request terminates the preceding worker and stale results are ignored.

This demonstrates controlled representation and reproducibility. It does not claim that dithering always looks better, reduces PNG file size or reconstructs missing detail. The full tool provides image upload, ASCII, additional algorithms, palette editing and recipe export.

### Catalog Match Lab — inspect a product match

The scored quiz has been replaced with the actual public matcher and keyword baseline. Visitors select a size conflict, aliases/units or missing-detail pair, or edit both names. Each run displays both decisions and the matcher's normalized attributes and check statuses.

The default case exposes a keyword false accept: a 200 ml carton shares words with a 1 L request but has a conflicting size. The chicken case exposes a keyword false rejection: Spanish/English aliases and kg/g normalize to the same presentation. Incomplete or unsupported details remain uncertain.

The fixtures are fictional. The small offline vocabulary is neither a trained model nor the private production matcher. The keyword rule is deliberately simple, not a claim about Bakiano's previous implementation. There is no provider request, score or timer.

## Next experiment designs

These are proposals, not shipped compact demos. The source repositories already provide the evidence described where noted.

| Project | Visitor action | Visible evidence | What it demonstrates |
| --- | --- | --- | --- |
| GCP Ingestion Lab | Deliver a file twice; toggle completed receipts. | Same final rows, archive reads and merge calls counted by the actual in-memory adapters. | Idempotency preserves the result; a receipt also avoids repeated work. |
| BigQuery Query Guard | Switch between two recorded latest-day SQL variants. | SQL, captured output equality, recorded scan estimates, billed bytes and execution samples. Include the separate date lookup. | An equivalent answer can read much less data; scan, billing and runtime are separate measures. |
| Bakiano | Select a listing and inspect the observations behind its comparable price. | Source amount/currency, observation date, exchange-rate date, normalized price and identity decision. | A price comparison is a traceable pipeline rather than an isolated number. |
| Vesti | Select one garment and compare it with a whole-image retrieval. | An actual segmentation mask and saved retrieval outputs, with their provenance. | Whether selecting the intended piece changes the alternatives usefully. |

### Priority 1: duplicate delivery

Use `gcp-ingestion-lab/src/engine.js` with its `src/memory.js` adapters and the bounded comparison controls in `examples/techniques.js`. The existing **Send it twice** scenario returns eight rows on both sides while completed receipts avoid the second archive read and merge call. Show actual counters, not a canned number animation. In-memory merge calls are not cloud job totals, timings or billing.

A second action can replay an older observation after a newer one and expose why observation time matters. Both comparisons must use the same synthetic input and reset their state together.

### Priority 2: equal output, different scan

Use `bigquery-query-guard/data/market-recording.js` and its bundled SQL. The existing latest-day recording compares 826.70 MB and 3.66 MB dry-run estimates for the main queries, with four matching captured listings. The separate lookup has its own cost. Label the source, recording date, sample count and output comparison scope; do not turn these observations into a universal speed claim.

An optional next interaction could exercise the actual query guard with a local adapter: lower the byte cap and verify that a blocked estimate produces zero execute calls. Keep this simulated-adapter experiment separate from recorded warehouse measurements.

### Bakiano and Vesti boundaries

Bakiano's source is private. Its public case study explains the pipeline, but a compact trace needs a reviewed public example or an explicitly synthetic fixture. Do not suggest the portfolio is querying live production data.

Vesti has no public measured outcome yet. Keep the station proposed until real saved outputs exist; invented segmentation masks or rankings would conceal the very engineering this view should show.

## Source provenance and maintenance

`public/play/sources.json` records the repository, exact commit, source path and LF-normalized SHA-256 of each embedded engine file. Copies are unchanged apart from the matcher's `.js` → `.mjs` filename. The matcher MIT notice accompanies its source. Tests detect unreviewed changes to those snapshots.

The UI links to those exact source commits. To update an engine, review upstream changes, copy the source, refresh its recorded revision/hash, and rerun behavioral and browser checks. Do not quietly modify the snapshot to make a demo appear successful.

Tests cover equal comparison constraints, palette bounds, repeatable image output, known matcher false accepts/rejections, uncertainty and snapshot integrity. Browser verification covers input edits, preset changes, rapid image-control changes, worker results, repeatability, direct links, and phone/tablet layouts.

No account, analytics, paid API or cloud query is introduced. Without JavaScript, project explanations and links remain readable. The original larger tools remain available from their project pages.
