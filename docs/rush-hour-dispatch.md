# Rush Hour Dispatch

An original five-round coordination game in the existing Agents in GCP cabinet at `/play#concept-madrid-delivery-sim`. The arcade still contains seven cabinets and 33 authored stages. The game takes inspiration from [Mini Metro](https://dinopoloclub.com/games/mini-metro/); its map, symbols, interface, scenarios and code are original.

Route arriving orders while a 50-second shift runs. Drag a pin into a lane, or tap the pin and then its lane, before the deadline ring empties. Move bots toward waiting work, stamp claims, pin new facts and send a changed address to a human. These actions affect current jobs immediately where applicable. Replay keeps the same orders and timing so a different decision has a visible effect.

This is a browser simulation with synthetic orders, separate from the project's Python agents and recorded city/store playback. It makes no live AI or GCP calls and changes no real stock. Delivery counts, wasted trips and human escalations are game outcomes, not model-quality, production-latency or cloud-cost measurements. The illustrated geography and travel times are not a street-routing model.

## Direction contract

The working interface leads: a compact round title, playback controls, score and failure explanation sit above a large map. The three queue lanes attach to its lower edge. A narrow shared-notes board sits alongside on desktop and becomes a compact bottom dock on phones. Results appear in a centered overlay over the arena, keeping the score, Replay and real-agent link in the playing area.

Dark arcade chrome contains the established warm map: cream paper, green ink and green, amber and blue lane colors. Red marks failure; color is paired with labels and state cues. The cabinet is 92vw wide and 90dvh tall on desktop; the measured desktop map area takes about 79% of the board width. At widths up to 700px the cabinet fills the viewport. Text and the synthetic-data footnote are at least 14px; the compact title is 20px on desktop and 18px on phones. Interactive buttons have a minimum 44px height, with 66px order pins on desktop and 54px pins on phones.

The map's warm values align with `public/projects/agents-demo/theme.css`, while the cabinet's live controls and dark surfaces are scoped in `src/play/games/dispatch.ts`. Original SVG geography, draining rings, queued order tokens and moving couriers make work visible. This is an extension of the existing arcade and demo identity; it does not establish a replacement portfolio design system.

## Controls

- **Run shift / Pause / Continue:** start or pause the current shift. Routing, bot moves and note pinning remain available while paused. Continue resumes from the same simulation time.
- **Order pins and lanes:** drag a pin into Normal, Urgent or Problem, or tap the pin and then the lane. Normal is steady, Urgent is fast, and Problem handles address checks. Use deadlines and available capacity to decide; a cold bag in Normal is slow, while an address-check order in another lane wastes a trip. A count badge groups orders sharing a map slot; routing the visible order reveals the next.
- **Keyboard:** focus and activate the same native buttons. After selecting a pin or bot, press **1**, **2** or **3** for Normal, Urgent or Problem. The lane buttons also work with normal keyboard activation.
- **Bot tokens:** four bots are fixed during shift 1. From shift 2, drag or tap a bot into another lane to redistribute the fixed six-bot budget. A busy bot finishes its current bag before taking work from its new lane.
- **Stamp Claim:** unlocks in shift 3 and gives each bag one owner. It suppresses queued retries and turns back a duplicate picker that has not yet completed the wasted trip. The enabled claim rule carries into later shifts.
- **Shared notes:** from shift 4, tap a new note to pin it or drag it onto the notes board. Pinning the milk note redirects affected pickers from Sol to Chamberí; pinning the offline-courier note releases its abandoned bag for another bot. Facts belong to the current shift and must be pinned again when new notes arrive.
- **Send to Human:** unlocks in shift 5. Select the changed-address pin and activate Human, or drag the pin onto that control. Confirmation updates an affected courier's destination. Unnecessary human checks count as escalations and shorten that order's deadline.
- **First failure / Change rules:** the first failure pauses, explains the cause and spotlights the affected pin or lane. Change rules clears the spotlight so the player can repair the current work while it stays paused; it does not reset the shift. Continue resumes. Later failures flash and update counters without another automatic pause.
- **Replay shift / Restart:** restart the current shift with seed 17, preserving the current team allocation and enabled claim rule. New facts reset with the scenario. Restart is available in the desktop toolbar; Replay is in the result overlay on both layouts. **Next shift** appears only after a successful result and carries unlocked tools forward.
- **Sound off / Sound on:** optional quiet generated cues for actions, deliveries and failures. Sound starts off.

Changing browser focus, hiding the tab or cabinet, or changing the reduced-motion preference pauses playback. Resume does not charge hidden time. Reduced motion removes courier interpolation and decorative CSS motion while retaining the model updates and visible state. Back to arcade, Escape and browser Back use the existing cabinet dialog behavior and preserve the live game while returning to the floor.

## Five-round walkthrough

Keep routing as each lesson adds a new responsibility. Capacity becomes movable in shift 2; later shifts retain the team allocation and enabled claims. These are working approaches, not the only valid allocations.

| Shift | Pressure | Action | Verified complete result |
| --- | --- | --- | --- |
| 1. Find a free lane | Fifteen arrivals compete for four fixed bots and short deadlines. | Route every pin promptly. Use Urgent for short timers and available capacity, and Problem for address checks. | 15/15 on time, zero waste, zero human checks. |
| 2. Move the team | A lunch rush overwhelms the initial single Urgent bot. | Move bots from Normal toward Urgent while continuing to route; keep capacity in Problem. Busy bots finish their current bag first. | 19/19 on time, zero waste, zero human checks. |
| 3. One bag. One owner. | Retries can send two pickers to the same bag. | Stamp Claim before the retry trips complete, then keep routing. The claim rule persists into later shifts. | 17/17 on time, zero waste, zero human checks. |
| 4. Tell the next bot | Sol runs out of milk while work is in flight. | Pin the new stock note immediately so current and future affected pickers use Chamberí. Keep claims enabled and orders moving. | 17/17 on time, zero waste, zero human checks. |
| 5. Madrid, all at once | Rain slows couriers, Sol runs out of milk, a courier goes offline and an address changes. | Pin the new stock and offline-courier notes as they arrive, redistribute available bots and send the changed-address pin to Human once. | 19/19 on time, zero waste, one human check. |

A shift wins with at least 70% of its orders delivered on time and at most three wasted trips. The model also requires a player-action count of at least 70% of the order count. Three stars require at least 95% on time, no waste and no more than the expected human checks: zero in shifts 1–4 and one in shift 5. Perfect results are achievable but are not required to advance. Continue playing until the 50-second result overlay appears, then choose Next shift or replay the same scenario.

## Model and source mapping

One `requestAnimationFrame` loop advances the model in fixed 50ms steps. The browser seed is 17 and each shift lasts 50 simulated seconds. Courier nodes persist and move through transforms; `ResizeObserver` caches map geometry. Actions synchronously update the model and visible state. Brief arrivals, queue snaps, score deltas and wasted-trip puffs explain changes; reduced motion suppresses their animation.

Capacity changes queue waits. Claims record a bag's ownership and suppress duplicate work. Pinned stock facts redirect pickers; a pinned offline note releases abandoned work. Rain slows delivery, and human confirmation resolves a changed destination. These are deliberately small teaching rules, not a reproduction of the Python runtime, permissions or memory implementation. The source and anatomy links document the relevant real role's responsibility; the browser game owns its synthetic state and does not invoke that role.

| File | Responsibility |
| --- | --- |
| `src/play/games/dispatch.ts` | Server-rendered map, controls, accessibility labels and responsive styles. |
| `public/play/games/dispatch.mjs` | Live input, playback, persistent couriers, failure feedback, focus handling and result links. |
| `public/play/games/dispatch-live-model.mjs` | Authored shifts, seeded orders, timed queues, workers, claims, shared facts and scoring; replaces the removed `dispatch-model.mjs`. |
| `public/projects/agents-demo/theme.css` | Existing recorded-demo palette used as the warm visual reference. |
| `public/projects/agents-demo/agents.json`, `provenance.json` | Recorded agent descriptions and source provenance used by the separate anatomy demo. |
| `tests/dispatch-live-model.test.mjs`, `tests/dispatch-ui.test.mjs` | Model behavior and interactions with the shipped controls. |

Every result includes a short engineering connection and a direct anatomy link. Shifts 1–2 link to the dispatcher, shift 3 to fulfillment, shift 4 to inventory and shift 5 to customer service through `/projects/agents-demo/?view=agents&agent=<role>`. The anatomy view presents the project's recorded role descriptions and source references; the game does not claim to execute those roles.

## Verification

Verification on 4 November 2026 passed all 150 repository tests, `npm run typecheck` and `git diff --check`. Nine model tests cover active routing, capacity, duplicate suppression, stock and offline facts, address escalation, deterministic seeds, persistent tools and clustered pins. Nine UI tests cover progression through the five shifts, pointer drag and cancellation, tap and keyboard routing, live bot moves, first-failure pause and repair, hidden-view pauses, results, reduced motion and the current integration. The nine UI tests passed again after two small CSS fixes.

Browser checks separately completed all five shifts through real controls at 1280×800 and 390×844. Both campaigns finished with 19/19 on-time deliveries, zero wasted trips and one human escalation, with no console errors. Pointer dragging, tap routing and keyboard controls were exercised. An independent finish reviewer inspected the following six rendered captures and returned **SHIP**, with no material fixes:

- `.impeccable/review/round1-mid.jpg` — desktop paused during an active shift.
- `.impeccable/review/failure-desktop.jpg` — desktop first-failure spotlight.
- `.impeccable/review/mobile.jpg` — active shift at 390px width.
- `.impeccable/review/failure-mobile.jpg` — phone first-failure spotlight.
- `.impeccable/review/round5-results.jpg` — desktop final result overlay.
- `.impeccable/review/round5-mobile.jpg` — phone final result overlay.

Measured synchronous input handlers took 0.2–0.5ms. The embedded preview throttled animation frames to roughly 1Hz, so unrestricted next-paint latency below 100ms was not verified. These checks do not establish a universal frame rate or paint-time guarantee.

These are local review artifacts, not production telemetry. DOM tests support behavior claims; separate rendered checks support the tested desktop and phone layouts. The captures are not a cross-browser or assistive-technology certification. The other six games' files were untouched and retain their existing implementation and verification scope.
