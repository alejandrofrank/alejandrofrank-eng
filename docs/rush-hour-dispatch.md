# Rush Hour Dispatch

An original five-round coordination game in the existing Agents in GCP cabinet at `/play#concept-madrid-delivery-sim`. The arcade still contains seven cabinets and 33 authored stages. The game takes inspiration from [Mini Metro](https://dinopoloclub.com/games/mini-metro/); its map, symbols, interface, scenarios and code are original.

Set routing, staffing, shared-memory and escalation rules, then watch a timed shift unfold. Orders enter queues, workers claim bags, visit stores and deliver to doorsteps. A failed handoff leaves an explanation and an inspectable order record. Retrying keeps the same orders and timing so a changed rule has a visible effect.

This is a browser simulation with synthetic orders, separate from the project's Python agents and recorded city/store playback. It makes no live AI or GCP calls and changes no real stock. Delivery counts, wasted trips and human escalations are game outcomes, not model-quality, production-latency or cloud-cost measurements. The illustrated geography and travel times are not a street-routing model.

## Direction contract

The working interface leads: a compact round title, playback controls, score and failure explanation sit above the map. Queue bars sit immediately below it; a rules sheet sits alongside at desktop widths. On phones the map comes first, with Set rules and Run these rules shortcuts connecting it to the rules sheet. Failure feedback stays beside playback rather than opening a modal.

The surface uses the established Agents in GCP cream paper, green ink and warm accents. Those existing palette values are shared unchanged in `public/projects/agents-demo/theme.css`; the game and selected cabinet scope their styling without changing the global portfolio design. Original SVG geography, labeled queues and stateful pins make the work visible. This is an extension of the existing arcade and demo identity.

## Controls

- **Before the shift:** select a queue for each order type. Later shifts reveal staffing, shared-memory and human-escalation controls. At most six agents can be assigned; reduce one queue before increasing another.
- **Run shift / Pause / Continue:** start or pause playback. The first failure pauses automatically and explains the broken handoff. Continue resumes that same run without repeatedly stopping at later failures.
- **Step:** pause and advance one quarter-second of simulation time. It can start a shift and finish the campaign without continuous animation.
- **Change rules:** discard the current run, keep the current settings and focus the relevant repair. The next run uses the same scenario. Rules are fixed during a run.
- **Replay shift:** restart the completed shift with its current rules. **Next shift** appears only after success. **Start over** returns to the first shift and its starting rules.
- **Orders & shared notes:** inspect arrived orders, their states, failure explanations and shared facts. Queue bars show waiting work; labels also show assigned and busy agents.
- **On phones:** Set rules jumps to the current lesson's controls; Run these rules returns focus and scroll position to playback. Native buttons, selects and checkboxes support touch and keyboard without dragging.

Changing browser focus, hiding the tab or cabinet, or changing the reduced-motion preference pauses playback. Resume does not charge hidden time. Reduced motion removes interpolation between simulation updates and CSS animation; the map and score still reflect each step. Back to arcade, Escape and browser Back use the existing cabinet dialog behavior and preserve the live game while returning to the floor.

## Five-round walkthrough

Each shift starts with authored rules for its lesson; settings do not carry automatically from the previous shift. These are working repairs, not the only possible staffing allocation.

| Shift | What breaks | Repair | Successful result |
| --- | --- | --- | --- |
| 1. Every order needs a lane | Urgent and problem orders enter the normal queue. | Send normal orders to Normal, urgent orders to Urgent and problem orders to Problem. Keep the initial 2 / 3 / 1 staffing. | 6/6 on time, zero waste, zero escalations. |
| 2. The lunch rush | Six urgent orders overwhelm their single worker. | Set staffing to 1 normal, 4 urgent and 1 problem. Reduce normal three times, then increase urgent three times. Matching routes are already set. | 8/8 on time, zero waste, zero escalations. |
| 3. One bag. Two pickers? | A delayed receipt creates a duplicate attempt. | Enable **Claim a bag before picking it**. The retry sees the existing claim and leaves the real order alone. | 7/7 on time, zero waste, zero escalations. |
| 4. Who told the next shift? | Sol runs out of milk; later pickers reuse stale stock information. | Keep claims enabled and enable **Stock changes**. The shared note redirects waiting and travelling pickers to Chamberí. | 8/8 on time, zero waste, zero escalations. |
| 5. Madrid, all at once | Rain slows delivery; a courier goes offline and a customer changes address. | Keep claims and stock notes enabled. Enable **Offline couriers** and choose **An address is uncertain** for escalation. Keep 2 normal / 3 urgent / 1 problem. | 10/10 on time, zero waste, one human escalation. |

Run or Step until a result appears, then choose Next shift. A successful shift delivers every order on time with no wasted trips or recorded failures. Three stars additionally require no unnecessary human checks: zero escalations in shifts 1–4 and at most one in shift 5. Asking a human at every handoff adds delay and escalations, making the tradeoff visible.

## Model and source mapping

The model uses fixed steps of up to a quarter second, a fixed browser seed of 17 and a maximum shift duration of 28 simulated seconds. Staffing changes actual queue waits. Claims suppress duplicate work; an offline note releases the abandoned claim for reassignment. Stock notes redirect pickers. Rain slows delivery travel, and an uncertain address needs confirmation before the destination is changed. These are deliberately small teaching rules, not a reproduction of the full agent runtime or its permission and memory boundaries.

| File | Responsibility |
| --- | --- |
| `src/play/games/dispatch.ts` | Server-rendered controls, accessibility labels and responsive styles. |
| `public/play/games/dispatch.mjs` | Original SVG map, playback, failure feedback, focus handling and result links. |
| `public/play/games/dispatch-model.mjs` | Authored shifts, seeded orders, timed queues, workers, claims, shared facts and scoring. |
| `public/projects/agents-demo/theme.css` | Shared existing demo palette. |
| `public/projects/agents-demo/agents.json`, `provenance.json` | Recorded agent descriptions and source provenance used by the separate anatomy demo. |
| `tests/dispatch-model.test.mjs`, `tests/dispatch-ui.test.mjs` | Model behavior and interactions with the shipped controls. |

Every result includes a short engineering connection and a direct anatomy link. Shifts 1–2 link to the dispatcher, shift 3 to fulfillment, shift 4 to inventory and shift 5 to customer service through `/projects/agents-demo/?view=agents&agent=<role>`. The anatomy view presents the project's recorded role descriptions and source references; the game does not claim to execute those roles.

## Verification

Verification on 4 November 2026 passed all 146 repository tests, `npm run typecheck` and `git diff --check`. Seven model tests cover the intended failures and repairs, several valid staffing allocations, duplicate suppression and reassignment, stock-note propagation, rain and address escalation, reproducible seeds and worker interpolation. Seven UI tests cover all five shifts at desktop and phone DOM sizes, the first-failure pause and Continue behavior, locked rules and staffing limits, hidden-view pauses, rendering updates, phone focus and the current integration.

Browser checks separately completed all five shifts through real controls at 1280×800 and 390×844. Both campaigns finished with 10/10 on-time deliveries, zero wasted trips and one human escalation, with no reported browser errors. The customer-service result link opened the corresponding agent anatomy. An independent finish reviewer inspected the following four rendered captures and returned **SHIP**, with no material fixes:

- `.impeccable/review/round1.jpg` — desktop routing failure and repair controls.
- `.impeccable/review/round5.jpg` — desktop combined incident.
- `.impeccable/review/mobile-round1.jpg` — phone routing surface.
- `.impeccable/review/mobile-round5.jpg` — phone combined incident.

These are local review artifacts, not production telemetry. DOM tests support behavior claims; the separate rendered checks support the tested desktop and phone layouts. The captures are not a cross-browser or assistive-technology certification. Other cabinets retain their existing implementation and verification scope.
