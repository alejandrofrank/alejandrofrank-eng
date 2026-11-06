# Order Flow

[Play Order Flow](https://me.alejandrofranks.workers.dev/play#concept-madrid-delivery-sim).

A deterministic, turn-based coordination puzzle in the Agents in GCP arcade cabinet. Original art; mechanic inspired by [Bus Traffic Fever](https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow). Synthetic orders, no AI or GCP calls, no Python agents, map or real-time clock.

## Rules

Tap a bot whose arrow has a clear path. It enters the first free bay slot. Only parked bots work, and only the front order can be served. A bot's number is its remaining capacity; it leaves at zero. Colors also have skill letters and accessible names.

- **Handoff:** a completed Picker order publishes one bag to the Courier belt. Only Couriers collect bags. That belt holds four bags; producing a fifth loses. A ready Courier collects before the next pick.
- **Memory:** limited-view levels show the next four orders. Parking Memory reveals up to eight. It consumes a bay slot and serves nothing. Tap parked Memory again to release it for one move. The extra preview disappears.
- **Locks:** a skill-colored lock opens after a bot of that skill finishes and departs, not merely when it parks.
- **Retries:** a striped order returns to the back once. Its second handling uses capacity again. A retried Picker order publishes its bag only after the second handling, so the retry does not create two bags.

Finish both belts and clear all bots, including releasing Memory. A full bay with no usable worker and no Memory bot to release means **Out of slots**. A fifth bag means **Courier belt overflow**. Passing the move budget means **Out of moves**. Each has a separate cause, highlight and Retry control.

Three undos are available per attempt. Undo restores the board but does not refund spent moves; using it gives a one-star completion. It is unavailable after an **Out of moves** loss. Retry starts a fresh attempt. Three stars requires the BFS minimum with no Undo; other completions within budget earn two stars, or one if Undo was used. Invalid blocked/locked taps explain the issue without consuming a move.

## Ten levels

The first two requested tutorials introduce the basic mechanic and blocking; planning traps start at level three. Bot numbers correspond to accessible button labels.

| Level | Bay | Minimum | Budget | One BFS solution |
| --- | ---: | ---: | ---: | --- |
| 1 · Front first | 3 | 2 | 4 | 1, 2 |
| 2 · After you | 3 | 3 | 5 | 2, 1, 3 |
| 3 · One spare slot | 2 | 3 | 5 | 2, 3, 1 |
| 4 · Pass the bag | 3 | 4 | 6 | 1, 3, 2, 4 |
| 5 · A narrow handoff | 2 | 5 | 7 | 2, 3, 4, 1, 5 |
| 6 · Room to remember | 2 | 5 | 7 | 2, 2, 3, 4, 1 |
| 7 · Wait for the signal | 2 | 4 | 6 | 2, 3, 4, 1 |
| 8 · Once more | 3 | 4 | 6 | 1, 3, 4, 2 |
| 9 · Read, unlock, hand off | 3 | 8 | 10 | 1, 2, 2, 3, 4, 6, 5, 7 |
| 10 · Every slot counts | 3 | 10 | 11 | 1, 2, 2, 3, 4, 5, 7, 6, 8, 9 |

Repeated Memory IDs mean enter, then release. The baseline greedy policy picks a free front-matching bot, otherwise the first free yard bot in authored order, and releases Memory only when no yard move remains. It loses levels 3–10. This is an explicit deterministic baseline, not a claim that every possible greedy tie-break loses.

## Controls and progress

Before committing a legal tap, the game checks whether the resulting position can still finish within the remaining moves. A dead-end warning offers **Keep planning** or **Play anyway**. Cancelling spends no move or Undo and clears queued intentions. The warning is advisory: deliberately continuing still permits the original losses. **Next move?** highlights one verified continuation on request; it does not play the move. Hints are optional and do not affect stars.

The position reported in the 5 November play-test was level 6 after bots 2 and 3: Memory and Support occupy the bay. It remains solvable in three moves: release Memory (2), send Picker (4), then Courier (1). Parked Memory now visibly says **Release**, with the one-move cost in the status and accessible label.

Use click/tap or Tab then Enter/Space. Taps during serving enter a visible FIFO queue. One animation loop displays one order hop per 150ms; input never waits for it. Hold **Hold to speed up** (pointer or keyboard) for 6× playback. Reduced motion settles immediately. There are no gameplay timers.

The label, belt accessibility description, capacities and lock state are derived together from each displayed state. Departed bot elements are hidden and transient hop markers are cleared.

Local storage keeps the current level, completed stars and a validated action history, including Undo. Reload reconstructs the board through the same reducer. The numbered level button opens earned levels. Corrupt saves reset safely; denied storage does not prevent play. Saving is local to this browser/device. The previous six-level campaign's different boards are not imported.

The win-card explanation opens in a new tab with opener isolation. It is separated from Next level by the explanation block. Sound starts off. Other arcade games are unchanged.

## Proof of solvability

The certificate is generated from the actual transition rules, not hand-written solutions. Treat every reachable settled position as a graph node, and each legal bot tap as a directed edge. The current ten levels contain **903 nodes and 1,636 edges**, including losing branches. Reverse breadth-first search from all winning nodes calculates the shortest remaining distance:

```text
d(s) = 0                                      if s is a win
d(s) = 1 + min(d(next(s, a)))                  over legal taps a
d(s) = infinity                               if no win is reachable
can_finish(s) = d(s) <= move_budget - moves_spent
```

The key includes yard occupancy, bay capacities, ordered tokens and retry flags, bags, departed skills, and terminal status. Spent moves are checked separately, so Undo cannot refund the budget in the proof. All edges are enumerated; exceeding the generation safety limit fails instead of certifying a partial search.

The browser reads the generated table, avoiding a live search during input. A test regenerates it to catch drift and compares **every reachable position** with the independent forward BFS solver. Another verifies the reported Memory position. Signature mismatches or absent positions are reported as unverified, never silently declared solvable. The claim applies to this deterministic puzzle's encoded rules, not to real AI-agent reliability.

Regenerate after changing puzzle mechanics or layouts:

```bash
node scripts/build-order-flow-proof.mjs
npm test
```

## Larger board

The yard and bay are measured independently; a short bay no longer shrinks every yard bot. Roomy boards allow 132px yard bots and 112px parked bots, and order discs are 40px instead of 24px. Wide screens place the bay beside the yard below the belt; portrait retains the stacked sequence. Unused bottom rows are omitted without changing authored bot coordinates or blockers. Phone controls combine the Back action with the level header. At very short heights, scrolling preserves usable controls and the result stays in view.

## Connection to the real system

The puzzle is an analogy, not a cloud execution trace.

| Puzzle | Real project behavior | Source |
| --- | --- | --- |
| Bounded belts and bay | Queue capacity/backpressure and bounded work | src/delivery/queue.py; role.json limits |
| Picker to Courier | Fulfillment emits ready/handoff events before dispatch/custody | config/agents/fulfillment/role.json |
| Memory bot | Scoped, bounded recall available to roles; **not** a separate production agent or a literal bay slot | src/delivery/memory_profiles.py |
| Locks | Downstream work waits for a completed handoff | fulfillment and inventory manifests |
| Striped retry | At-least-once queue delivery with idempotent transactional effects | src/delivery/queue.py |

The real memory scope includes run, store, role and context; the game only demonstrates the information-versus-capacity trade-off. The real system prevents duplicate committed picking; the game repeats handling without publishing a duplicate bag. Every win links to the relevant real agent.

## Source

| File | Responsibility |
| --- | --- |
| public/play/games/order-flow-model.mjs | Ten boards, immutable rules, BFS, greedy baseline and rating |
| public/play/games/order-flow-progress.mjs | Attempt history, limited Undo and validated save/restore |
| public/play/games/order-flow-proof.mjs, order-flow-proof-data.mjs, order-flow-position.mjs | Position certificate, exact distance lookup and pre-move advice |
| scripts/build-order-flow-proof.mjs, tests/order-flow-proof.test.mjs | Complete graph generation, drift gate and independent verification |
| public/play/games/order-flow.mjs | Input queue, 150ms trace, accessibility, sound and rendering |
| src/play/games/order-flow.ts | Cabinet-scoped board, outcomes and responsive CSS |
| tests/order-flow-model.test.mjs | Solvability, greedy failures, handoffs, locks, retries, budgets and saves |
| tests/order-flow-ui.test.mjs | Campaign controls, all losses, progress, queued taps and live labels |

The playfield is one warm toy cabinet: chunky skill tokens, packages on a conveyor, molded bay docks and a tiled yard. Proof, the next-move hint and fast-forward sit in the More menu. Undo, Retry and sound stay on the primary row. Native buttons, 44px minimum bot targets, and labels of at least 14px. No new dependencies.

## Verification

On 4 November 2026, all **158 repository tests** and TypeScript checking passed. The 26 dedicated Order Flow tests cover all ten solver minima, greedy losses on levels 3–10, every rule and loss, saved wins/active boards/losses, limited Undo, corrupt/denied storage, queued input (including Memory enter/release), 150ms event steps, hold acceleration, accessible belt labels, keyboard focus and removal of departed markers.

All ten levels were completed through browser controls. Level 3 was deliberately lost and retried; reload restored both that loss and a mid-level handoff. Level 6 was played on a phone-sized viewport. Level 10, its nine bot targets and final win card fit at 390×700; desktop captures use 1280×800. Bot rectangles measured at least 44×44px without overlap in the final mobile yard. The captured browser console contained no errors. These checks do not claim a universal latency measurement across devices.

On 5 November 2026, the proof/enlargement update passed all **166 repository tests**, including **34 Order Flow tests**, and TypeScript checking. Browser play reproduced and completed the reported level 6 position, cancelled a prospective overflow in level 10 and finished it, and caught level 3's future dead end before the first move. Captures cover 1280×800, 753×947 and 390×700, including mobile warnings and the final win. Saved progress still restores. No console errors were captured. Independent layout review found no material clipping or overlap.

One source-only Impeccable detector pass for this update returned no findings. Rendered screenshots, rather than that source scan, provide the layout evidence.

On 6 November 2026, the warm cabinet's sizing was corrected without changing its art, rules, or saves. The frame is capped at 1280×960px; the conveyor uses a shorter single-row view when its orders fit. Bay and yard headings now have their own grid tracks, so the yard cannot take the full parent height and push its bottom row out of view. Phone layouts put the bay beside the yard; screens narrower than 360px retain scrolling instead of overlapping tap targets. Parked Memory keeps its Release label readable at small sizes.

All 167 repository tests and TypeScript checking passed. Chromium viewport checks covered 1280×800, 1280×720, 768×800 and 390×700, including the expanded Memory preview, a cancelled overflow warning and the final level win. No console errors were captured. These were resized browser checks, not physical-device or Safari testing. The single Impeccable detector pass returned no findings.
