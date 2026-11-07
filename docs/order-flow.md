# Order Flow

[Play Order Flow](https://me.alejandrofranks.workers.dev/play#concept-madrid-delivery-sim).

A calm puzzle about dependencies, queues and limited working space. Release two-seat cars from a touching grid into parking, then serve passengers in order. Original browser art; mechanic inspired by [Bus Traffic Fever](https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow). Synthetic passengers, no AI or GCP calls.

## Rules

Every square starts occupied. Tap a car whose central arrow has an unobstructed path all the way to the edge. It enters the first empty parking space. Cars cannot turn or move sideways through the yard.

There are three parking spaces. Only the passenger at the front can board, and only a parked car of the same color. Every car takes exactly two passengers. A car with one passenger waits; a full car leaves and frees its space. If several cars match, the first parking space is served first. Clear both the passenger queue and the yard, leaving parking empty, to win.

Squares contain only a central arrow and subtle highlights—no capacity numbers, wheel dashes, seat decorations or role badges. Two small occupancy dots beside a parked car show whether it is empty or half full. There are no Memory/Release cars, locks, retry orders, second courier belt, timers or maps.

A blocked tap leaves the puzzle unchanged and highlights the nearest blocker. An unblocked car can still be the wrong choice for the queue: filling all three spaces with the wrong colors causes **Out of slots**. Every legal move commits immediately, even when it makes completion impossible. There is no predictive warning or confirmation. A loss highlights the stuck spaces, names the front passenger's color and offers Undo or Retry.

- **Three stars:** no blocked taps, hints or Undo.
- **Two stars:** at most two blocked taps and one hint, without Undo.
- **One star:** a completion with Undo, more blocked taps or more hints.
- **Undo:** three per attempt; restores yard, parking and passenger position together.
- **Hint:** highlights an unblocked car whose move still has a complete solution.
- **Retry:** resets the same deterministic puzzle.

Every winning solution releases each car once, so minimum moves equal the number of cars. Stars measure careful planning rather than claiming a shorter route exists.

## Ten packed yards

All cells are occupied at the start. Fixed seeds reproduce the same board and queue on every retry.

| Level | Title | Grid | Cars / minimum moves | Passengers | Seed | Reachable states |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | Find the opening | 4 × 4 | 16 | 32 | 67 | 73 |
| 2 | Across the grain | 4 × 5 | 20 | 40 | 15 | 53 |
| 3 | Inside out | 5 × 5 | 25 | 50 | 197 | 336 |
| 4 | One way through | 5 × 6 | 30 | 60 | 30 | 343 |
| 5 | Long chain | 6 × 6 | 36 | 72 | 139 | 205 |
| 6 | Crossed paths | 6 × 7 | 42 | 84 | 194 | 9,865 |
| 7 | Deep in the yard | 7 × 7 | 49 | 98 | 147 | 8,436 |
| 8 | Unravel it | 7 × 8 | 56 | 112 | 50 | 17,640 |
| 9 | A packed house | 8 × 8 | 64 | 128 | 190 | 3,741 |
| 10 | The whole chain | 8 × 9 | 72 | 144 | 97 | 29,253 |

## Generating a solution for an X × Y board

`generatePuzzle(cols, rows, seed, {slots, wave})` accepts dimensions from 2 to 12 on each axis, an integer seed, 2–5 parking spaces and a passenger wave no larger than the parking bay. The campaign uses three spaces and waves of three cars (two in the first level).

1. Generate a completely packed grid and a legal clearing order. Each car's blockers appear earlier in that order.
2. Split that clearing order into groups no larger than the parking bay.
3. For each group, reverse its car colors and append that sequence twice to the passenger queue.
4. Replay the clearing order through the actual parking and boarding rules; reject the puzzle unless it wins.

The construction supplies a complete solution, not just a clearable yard. Each group has at most as many cars as parking spaces and exactly two passengers per car. Cars may wait for one another, but once the group is parked its passengers can all board. Parking is empty before the next group. This establishes a winning witness by induction over groups, including groups with repeated colors.

The generator guarantees a solution for supported dimensions. It does not claim every size or seed has equally interesting difficulty, or that exhaustive state enumeration is cheap for arbitrary large boards.

## Full puzzle proof

A state includes the remaining yard cars, the passenger cursor, and every parking slot's car and remaining seats. The yard alone is insufficient: identical remaining cars can have different outcomes depending on parking and passenger order.

```text
S = (remaining yard, passenger cursor, ordered parking slots)
legal(S) = unblocked yard cars, if a parking space is free
T(S, car) = park car, serve matching front passengers, remove full cars
winning(S) = true if both queue and yard are empty and parking is empty
winning(S) = any winning(T(S, car)) for car in legal(S), otherwise
```

Every move removes one yard car, so the state graph is finite and acyclic. The build script explores every legal successor, storing a safe next car, a win, or a dead end for every reachable state. Across the campaign, **69,945 states** are covered. Tests regenerate the certificates and verify every transition and terminal result. An independent BFS finds a winning minimum-length solution for each level; on the first level it also checks every reachable state against the certificate.

Certificates verify the levels and supply the optional Hint action. Normal taps do not consult the solver or prevent mistakes. A dead end is allowed to play out until parking fills. Missing states, invalid saves or changed level definitions cannot receive a verified safe hint. Search limits throw an error; an unfinished search is never reported as an impossible puzzle. BigInt state keys support the 72-car yard without a 32-bit occupancy limit.

```bash
node scripts/build-order-flow-proof.mjs
npm test
npm run typecheck
```

## Controls, layout and saves

Click or tap a car. Tab enters the grid, arrow keys move focus and Enter/Space releases. Accessible names identify role, row, column, direction and blockers. The front label and passenger accessibility list are derived from current game state on every change.

Logical input commits immediately. One animation loop draws car arrivals, approximately 150ms passenger hops and departures. A new tap settles previous visual effects without delaying its decision. Geometry is cached before animation; there are no layout reads on every frame. Reduced motion settles immediately. Sound starts off.

The grid has touching tiles, at least 44px tap targets and no internal decoration beyond arrows and highlights. Labels are at least 14px. Board dimensions respond to both width and height. Short windows can scroll rather than clipping the bottom or shrinking targets. Results and losses stay in an overlay; Next level is separated from the outbound explanation link.

Progress, best stars and validated action history use `portfolio.order-flow.boarding-v1`. Reload replays actions through the same rules, including parked or half-full cars. Invalid saves reset safely; blocked storage does not stop play. Earlier campaign saves remain untouched, but their stars are not imported into these different puzzles. The level button opens earned yards.

## Connection to Agents in GCP

Arrows illustrate dependencies, parking illustrates limited concurrency, and the passenger queue illustrates ordered work. A task being ready does not mean occupying a worker with it is useful for the next item. Each win gives a short connection and opens the relevant real agent in a new tab.

This is an analogy, not the Python agent system. It does not model memory policy, token cost, cloud reliability or live agent decisions.

## Source

| File | Responsibility |
| --- | --- |
| public/play/games/order-flow-model.mjs | Seeded layouts and queues, immutable rules, exact solver, independent BFS and stars |
| public/play/games/order-flow-progress.mjs | Attempt history, Undo and validated save/restore |
| public/play/games/order-flow-proof.mjs, order-flow-proof-data.mjs | Complete-state certificates and safe hints |
| scripts/build-order-flow-proof.mjs | Reproducible exhaustive certificate generation |
| public/play/games/order-flow.mjs | Immediate input, accessibility, sound and one animation loop |
| src/play/games/order-flow.ts | Cabinet markup, responsive grid, queue, bay and outcomes |
| tests/order-flow-{model,proof,ui}.test.mjs | Rules, proofs, complete campaigns, saves and interactions |

## Verification

The queue-and-parking revision passes **172 repository tests**, including **40 Order Flow tests**, plus TypeScript checking. Tests complete all ten levels through the shipped markup and controls and independently solve every complete puzzle. They also follow losing paths on every level, asserting that every legal tap commits immediately with no predictive warning or confirmation. Coverage includes passenger supply, partial cars, full parking, loss, Undo, saved attempts, keyboard focus, rapid input and reduced motion.

The queue-and-parking campaign was also completed through Chromium browser controls. Undo restored the queue and parking, and reload preserved a partly completed final board. Predictive warning and confirmation controls have since been removed at the user's request; the loss condition and saved-game format remain unchanged. In the latest browser check, a losing choice left two occupied spaces with no overlay; the next move filled parking and showed Out of slots immediately. The captured console had no warnings or errors.

The 72-car board, queue, parking and footer fit at 1280×800 and 390×700. At 840×474, scrolling and keyboard focus reached the last row and footer. These are resized browser checks, not physical-device or Safari tests. The Impeccable source check returned no findings; visual review then corrected the desktop height allowance so the footer remained visible.
