# Order Flow

[Play Order Flow](https://me.alejandrofranks.workers.dev/play#concept-madrid-delivery-sim).

A calm, deterministic puzzle about dependencies. Clear a fully packed yard of identical two-seat cars by following their arrows. Original browser art; mechanic inspired by [Bus Traffic Fever](https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow). Synthetic agents, no AI or GCP calls.

## Rules

Each square starts occupied. Tap a car whose arrow has an unobstructed path all the way to the edge. The car leaves; the new gap can free another car. Cars do not turn or move into other cells.

Every car has the same two seats, drawn beside its central arrow. There are no capacity numbers, queue belts, parking slots, Memory/Release cars, locks, retry orders or timers. Color identifies an illustrative agent role; it does not change the rules.

A blocked tap leaves the board unchanged, highlights the nearest blocker and explains what to clear first. Clear every car to win. There is no dead-end loss: removing an unblocked car only opens paths. The challenge is reading long, intersecting dependency chains, not guessing which legal move will secretly lose.

- **Three stars:** no blocked taps, hints or Undo.
- **Two stars:** at most two blocked taps and one hint, without Undo.
- **One star:** a completion with Undo, more blocked taps or more hints.
- **Undo:** three per attempt. Retry starts the same board again.
- **Hint:** highlights one car with a clear path; it does not move it.

## Ten packed yards

Every cell is occupied at the start. Fixed seeds generate the same boards on every retry.

| Level | Title | Grid | Cars / minimum removals | Seed | Longest blocking chain |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Find the opening | 4 × 4 | 16 | 67 | 13 |
| 2 | Across the grain | 4 × 5 | 20 | 15 | 15 |
| 3 | Inside out | 5 × 5 | 25 | 197 | 18 |
| 4 | One way through | 5 × 6 | 30 | 30 | 24 |
| 5 | Long chain | 6 × 6 | 36 | 139 | 21 |
| 6 | Crossed paths | 6 × 7 | 42 | 194 | 24 |
| 7 | Deep in the yard | 7 × 7 | 49 | 147 | 26 |
| 8 | Unravel it | 7 × 8 | 56 | 50 | 28 |
| 9 | A packed house | 8 × 8 | 64 | 190 | 34 |
| 10 | The whole chain | 8 × 9 | 72 | 97 | 32 |

## Why every board is solvable

For each car, draw an edge from every car along its exit ray to that car. An edge means “this blocker must leave first.” The generator produces a clearing order; the build script verifies that every blocker appears earlier in that order. This is a topological certificate for a directed acyclic graph (DAG).

For remaining cars R, define:

```text
free(R) = {c in R : no car in R lies along c's exit ray}
next(R, c) = R without c, when c is in free(R)
minimum_remaining(R) = number of cars in R
```

Every nonempty induced subgraph of a DAG has an available car. Removing an available car leaves another DAG. Therefore **every legal sequence can finish**, and it takes exactly one removal per remaining car. A greedy legal-removal policy must succeed under these simpler rules; claiming otherwise would be false. Stars measure careful reading rather than a fictitious shorter solution.

The generated certificate includes each board's signature and clearing order. Tests regenerate the file, reject cycles or signature drift, and independently run BFS on all ten boards. The largest search visits 41,493 states. The browser checks the certificate without running a large search on each tap. Arrays support all 72 cars without a 32-bit occupancy limit.

```bash
node scripts/build-order-flow-proof.mjs
npm test
npm run typecheck
```

## Controls, layout and saves

Click or tap a car. Keyboard users Tab into the grid, move focus with arrow keys and release with Enter/Space. Accessible names identify role, row, column, direction and whether the path is blocked. A blocked car remains focusable and explains its blocker.

The model updates immediately. A single animation loop draws concurrent 180ms departures, so rapid taps do not wait for earlier animations. Geometry is read once per departure, not every frame. Reduced motion settles immediately; closing the cabinet or hiding the tab finishes the visual exits. Sound starts off.

The grid uses touching tiles, central arrows and two visible seat marks. Cars remain at least 44px square. Labels are at least 14px. Board dimensions respond to both viewport width and height. Short or unusually narrow windows scroll instead of clipping bottom rows or shrinking targets below the minimum. Results stay in an overlay, separate from the outbound explanation link.

Progress, best stars and a validated action history are saved under `portfolio.order-flow.packed-v1`. Reload replays the actions through the same rules. Invalid saves reset safely; blocked storage does not stop play. The previous coordination campaign's save remains untouched, but its stars are not imported into these different puzzles. The level button opens earned yards.

## Connection to Agents in GCP

The game illustrates one idea: downstream work waits for its dependencies. For example, fulfillment must finish a bag before dispatch can hand it to a courier. Each win supplies a short example and a link to the relevant real agent, opening in a new tab.

This is an analogy, not the Python agent system. The packed-yard version does not model real queues, concurrency limits, memory policy, token cost or cloud reliability.

## Source

| File | Responsibility |
| --- | --- |
| public/play/games/order-flow-model.mjs | Seeded layouts, immutable rules, exact solver, independent BFS and stars |
| public/play/games/order-flow-progress.mjs | Attempt history, Undo and validated save/restore |
| public/play/games/order-flow-proof.mjs, order-flow-proof-data.mjs | DAG certificate and position/hint verification |
| scripts/build-order-flow-proof.mjs | Reproducible certificate generation |
| public/play/games/order-flow.mjs | Immediate input, accessibility, sound and one animation loop |
| src/play/games/order-flow.ts | Cabinet markup, responsive grid and outcomes |
| tests/order-flow-{model,proof,ui}.test.mjs | Rules, proofs, complete campaigns, saves and interactions |

## Verification

The packed-yard revision passes **166 repository tests**, including **34 Order Flow tests**, plus TypeScript checking. Tests complete all ten levels through the actual shipped markup and controls and independently solve every board. They cover full occupancy, all four exit directions, long rays across gaps, IDs above 32 and 64, blocked feedback, Undo, hints, reloads, keyboard focus, rapid input and reduced motion.

All ten yards were also completed through Chromium browser controls. A blocked tap highlighted its blocker, Retry reset the attempt, and reload restored both a partial yard and the final win. The captured console contained no errors.

The 72-car grid was checked at 1280×800 and 390×700. On the phone-sized viewport, all cars remained 44px square and the full grid and footer fit without horizontal scrolling. At 840×474, scrolling and keyboard focus reached the final row and footer. These are resized browser checks, not physical-device, browser-zoom or Safari tests. The single Impeccable source-detector pass returned no findings; the browser checks caught and corrected the cabinet's scrollbar allowance separately.
