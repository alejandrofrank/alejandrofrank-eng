# Order Flow

[Play Order Flow](https://me.alejandrofranks.workers.dev/play#concept-madrid-delivery-sim).

This original browser puzzle replaces the Agents in GCP dispatch game in the same cabinet. It has six deterministic levels, no clock and no city or map. The mechanic is inspired by [Bus Traffic Fever](https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow); all artwork is original. Orders are synthetic. The puzzle makes no AI or GCP calls and does not execute the project's Python agents.

## Playing

The U-shaped belt holds an ordered queue. Only the front token at the pickup point can be served. Green **P** is Picker, blue **C** is Courier, orange **S** is Support and purple **I** is Inventory. Letters supplement color throughout.

Tap a bot whose exit arrow has a clear path through the yard. It takes the first free bay slot. Its number is the number of matching orders it can serve. Matching orders at the front hop in one at a time; a full bot leaves and frees its slot. Parked bots can wait for a later matching group. Bots cannot skip orders, pass through other bots or work from the yard.

If every slot is occupied and no parked bot can serve the front order, the bay turns red and explains **Out of slots**. Undo is unlimited and restores the exact previous turn. Replay resets the current level. Winning requires both an empty queue and a cleared yard. The result stays over the board and links to the relevant agent in Meet the agents.

Use Tab and Shift+Tab to choose a control, then Enter or Space to activate it. Bot labels include skill, capacity, exit direction and the blocking bot when applicable. Sound starts off. Reduced motion skips the visual transitions. No gameplay depends on animation or elapsed time; after the page and its modules have loaded, the puzzle needs no network connection.

## Six levels

The two introductory puzzles were removed after play-testing found them too easy. The game now opens with a blocked-bot dependency; the remaining puzzles keep their original boards and rules.

The bot numbers below identify the accessible button labels, not an extra control. Each listed solution is found by breadth-first search over actual game states.

| Level | Idea | Bay slots | Minimum moves | One minimum solution |
| --- | --- | --- | --- | --- |
| 1 · After you | Clear a dependency | 4 | 3 | 2, 1, 3 |
| 2 · Room for three | Preserve concurrency capacity | 3 | 5 | 1, 2, 3, 5, 4 |
| 3 · Two can do it | Scale out with another worker | 4 | 5 | 1, 2, 3, 4, 5 |
| 4 · Park ahead | Reserve capacity to unblock work | 4 | 5 | 2, 1, 3, 4, 5 |
| 5 · Stock comes first | Inventory before Courier | 4 | 4 | 2, 1, 3, 4 |
| 6 · All together | Combine ordering, capacity and dependencies | 5 | 10 | 3, 2, 1, 4, 5, 6, 8, 7, 9, 10 |

Three stars requires the minimum number of successful taps and no undos. Two stars allows up to two undos and two extra taps; every other completed solution earns one star. Blocked taps do not count. Undo restores the board, while the move and undo totals retain the attempt's history.

To reproduce a loss, start level 2 and tap bots **2, 3, 4**. All three slots hold Courier or Support while the front requires Picker. Undo the last tap, then use **1, 5, 4** to finish without restarting.

## Source and design

| File | Responsibility |
| --- | --- |
| `public/play/games/order-flow-model.mjs` | Authored boards, skill colors, immutable turn reducer, validation, star rating and BFS solver |
| `public/play/games/order-flow.mjs` | Native button input, history, accessible feedback, sound and visual turn trace |
| `src/play/games/order-flow.ts` | Server-rendered board and CSS scoped to this cabinet |
| `src/play/art.ts` | Original belt-and-bot cabinet illustration |
| `src/play/page.ts`, `public/play/arcade.mjs` | Existing arcade slot and initialization |
| `tests/order-flow-model.test.mjs`, `tests/order-flow-ui.test.mjs` | Solver, rules, full campaign, loss/undo and input/animation checks |

The cabinet retains the existing dark shell and typeface. Order Flow alone adjusts the cabinet dimensions, marquee spacing and viewport, and hides the decorative rim and station brief to fit the board. The warm board uses rounded slots and original vector bot faces. Skill colors communicate capabilities; a dark ring marks the front token, dashed bot borders indicate unavailable yard bots, and red slot borders indicate a loss. Skill names and letters ensure color is not the only cue. Gameplay buttons have a minimum height of 44px, bot targets are at least 44px square, and gameplay labels are at least 14px. No layout or style changes apply to the other six games.

The reducer commits a complete turn synchronously. A single requestAnimationFrame loop can replay its enter, serve and leave snapshots for at most 650ms. Another tap or Undo flushes that visual trace immediately. Backgrounding and reduced motion also flush it. Geometry is read only when the board is measured, including correction for the cabinet's opening scale; frame rendering uses cached positions. Delayed frames skip ahead instead of stretching a short animation into a long wait.

## Verification

On 4 November 2026, all **147 repository tests** and TypeScript checking passed. The 15 puzzle-specific tests verify all six levels through button controls, numbering, Inventory's introduction, final-screen wraparound, every level's BFS minimum, full arrow paths, only-front serving, immediate loss, unlimited history restoration, deterministic replay, keyboard focus, reduced motion, delayed frames and the removal of old map/game files. The model tests also traverse every reachable playing state to check that no unexplained deadlock is possible.

After trimming the tutorials, all six remaining levels were also completed through browser controls. The final screen reads “All 6 cleared!” and offers “Play from level 1”. That run had no console errors.

Before the two tutorials were removed, browser play completed all eight original levels, including a deliberate full-bay loss and recovery. Desktop was checked at 1280×800; the final board and win card also fit at 390×700 and 390×844 without scrolling. That run had no console errors. Input state changes do not wait for frames; automated checks include a second tap and Undo before the previous animation completes. The host's browser automation occasionally delayed commands, so these checks do not claim a universal end-to-end paint latency.

Impeccable's detector ran once over the UI source with regex matching. It reported no findings, but parsed-page rules were unavailable; this is not a substitute for the rendered desktop/mobile review.

The original implementation received an independent finish review and a documentation check. Subsequent user play-testing requested a UI improvement and removal of the two easy tutorials. This update only trims the campaign; it does not claim to complete that broader visual revision.
