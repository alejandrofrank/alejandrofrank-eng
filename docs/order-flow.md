# Order Flow

[Play Order Flow](https://me.alejandrofranks.workers.dev/play#concept-madrid-delivery-sim).

A calm puzzle about dependencies, queues and limited working space. Two groups of two-seat cars share a yard. Release a car whose arrow is clear, then serve the passengers in order. Original browser art; mechanic inspired by [Bus Traffic Fever](https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow). Synthetic passengers, no AI or GCP calls.

## Rules

Every square starts occupied. The yard is two groups, split by a gap. Tap a car whose central arrow has an unobstructed path all the way to the edge of its group. It enters the first empty parking space. Cars cannot turn or move sideways through the yard.

There are three parking spaces. Only the passenger at the front can board, and only a parked car of the same color. Every car takes exactly two passengers. On the intended line, the car you tap matches the front pair, takes both passengers, and leaves immediately. The other open car can wait in parking instead. A car with one passenger waits; a full car leaves and frees its space. If several cars match, the first parking space is served first. Clear both the passenger queue and the yard, leaving parking empty, to win. Holding too many cars that do not match the front fills the bay.

Squares contain only a central arrow and subtle highlights. There are no capacity numbers, wheel dashes, seat decorations or role badges. Two small occupancy dots beside a parked car show whether it is empty or half full. There are no Memory/Release cars, locks, retry orders, second courier belt, timers or maps.

A blocked tap leaves the puzzle unchanged and highlights the nearest blocker. An unblocked car can still be the wrong choice for the queue: filling all three spaces with the wrong colors causes **Out of slots**. Before a move that makes completion impossible, a warning offers **Keep planning** or **Release anyway**. A loss highlights the stuck spaces, names the front passenger's color and offers Undo or Retry.

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
| 1 | Find the opening | 4 × 4 | 16 | 32 | 67 | 89 |
| 2 | Across the grain | 4 × 5 | 20 | 40 | 15 | 117 |
| 3 | Inside out | 5 × 5 | 25 | 50 | 197 | 128 |
| 4 | Side by side | 5 × 6 | 30 | 60 | 30 | 187 |
| 5 | Open choice | 6 × 6 | 36 | 72 | 139 | 229 |
| 6 | Crossed paths | 6 × 7 | 42 | 84 | 194 | 247 |
| 7 | Deep in the yard | 7 × 7 | 49 | 98 | 147 | 284 |
| 8 | Unravel it | 7 × 8 | 56 | 112 | 50 | 369 |
| 9 | A packed house | 8 × 8 | 64 | 128 | 190 | 425 |
| 10 | Full yard | 8 × 9 | 72 | 144 | 97 | 481 |

## Generating a solution for an X × Y board

`generatePuzzle(cols, rows, seed, {slots, wave})` accepts dimensions from 2 to 12 on each axis, an integer seed, and 2 to 5 parking spaces. `wave` is still validated so older callers keep working, but it no longer batches cars into one automatic boarding run. The campaign uses three spaces.

1. Split the grid into two groups along rows or columns, chosen from the seed.
2. Fill each group with a snake of arrows that only point back along that snake, so each group has one free car at a time.
3. Give the two groups different pairs of colors, alternating along each snake.
4. Build the witness by taking turns between the groups. Append each car's color twice to the passenger queue.
5. Replay that order through the actual parking and boarding rules. Each tap boards that car's two passengers and the car leaves. Reject the puzzle unless it wins with parking empty.

The construction supplies a complete solution, not just a clearable yard. At almost every step two cars can leave: the front color, which clears at once, and the other group's car, which can wait in parking. Filling all three spaces with colors the front passenger cannot board loses. The generator guarantees a solution for supported dimensions. It does not claim every size or seed has equally interesting difficulty, or that exhaustive state enumeration is cheap for arbitrary large boards.

## Full puzzle proof and dead-end warnings

A state includes the remaining yard cars, the passenger cursor, and every parking slot's car and remaining seats. The yard alone is insufficient: identical remaining cars can have different outcomes depending on parking and passenger order.

```text
S = (remaining yard, passenger cursor, ordered parking slots)
legal(S) = unblocked yard cars, if a parking space is free
T(S, car) = park car, serve matching front passengers, remove full cars
winning(S) = true if both queue and yard are empty and parking is empty
winning(S) = any winning(T(S, car)) for car in legal(S), otherwise
```

Every move removes one yard car, so the state graph is finite and acyclic. The build script explores every legal successor, storing a safe next car, a win, or a dead end for every reachable state. Across the campaign, **2,556 states** are covered. Tests regenerate the certificates and verify every transition and terminal result. An independent BFS finds a winning minimum-length solution for each level; on the first level it also checks every reachable state against the certificate.

The browser uses a certificate lookup before committing a move, not a large search on the input thread. Missing states, invalid saves or changed level definitions are reported as unverified rather than falsely called safe. Search limits throw an error; an unfinished search is never reported as an impossible puzzle. BigInt state keys support the 72-car yard without a 32-bit occupancy limit.

```bash
node scripts/build-order-flow-proof.mjs
npm test
npm run typecheck
```

## Controls, layout and saves

Click or tap a car. Tab enters the grid, arrow keys move focus and Enter/Space releases. Accessible names identify role, row, column, direction and blockers. The front label and passenger accessibility list are derived from current game state on every change.

Logical input commits immediately. One animation loop draws car arrivals, approximately 150ms passenger hops and departures. A new tap settles previous visual effects without delaying its decision. Geometry is cached before animation; there are no layout reads on every frame. Reduced motion settles immediately. Sound starts off.

Each group is a touching block of tiles. A gap separates the two groups. Tap targets are at least 48px, and cars have no internal decoration beyond the arrow and a highlight. The car that matches the front passenger has a dark ring. The other open car has a light ring. Blocked cars stay dim. Labels are at least 14px. Passengers are drawn in pairs, one pair per car. Board dimensions respond to both width and height. Short windows can scroll rather than clipping the bottom or shrinking targets. Results, warnings and losses stay in an overlay; Next level is separated from the outbound explanation link.

Progress, best stars and validated action history use `portfolio.order-flow.boarding-v2`. Reload replays actions through the same rules, including parked or half-full cars. Invalid saves reset safely; blocked storage does not stop play. Earlier campaign saves remain untouched, but their stars are not imported into these different puzzles. The level button opens earned yards.

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

The two-group revision passes the repository suite, including **41 Order Flow tests**, plus TypeScript checking. Tests complete all ten levels through the shipped markup and controls and independently solve every complete puzzle. They cover generated rectangular boards, one-car clears, passenger supply, partial cars, full parking, safe/unsafe moves, warnings, loss, Undo, saved attempts, keyboard focus, rapid input and reduced motion.

Chromium checks covered level 1 at 1280×800 and 390×844, and the 72-car board at the same sizes. Two cars start open. Tapping the front color removes that car and its pair. Reduced motion leaves no boarding ghosts. Arrow keys move between cars. These are resized browser checks, not physical-device or Safari tests. The 72-car board fits the phone width. The short desktop window can scroll to the footer.
