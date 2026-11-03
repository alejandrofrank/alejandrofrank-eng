# Bot Workshop

The seventh game in the existing project arcade introduces Agents in GCP through five deterministic build–run–repair rounds. Open `/play#concept-madrid-delivery-sim` to equip three robots, watch a delivery shift, repair the failing attachment and replay the same incident. The arcade now has 33 authored stages: the previous 28 plus these five rounds.

## Direction contract

THESIS: Equip the team, watch a concrete failure, repair one part, then replay the same incident. Robot attachments are functional controls, not decoration around a quiz.

OWN-WORLD: Inherit the arcade’s dark cabinet, type and tactile controls. Inventory is sage, dispatch amber and support blue. A cutaway workshop separates shelves, the courier lane and the support office. Authored SVG represents runtime game state; no new raster assets.

STORY: The visitor learns that useful agents need tools, message contracts, bounded memory and economical decisions. Synthetic missions expose attempted actions and their enforced boundaries.

FIRST VIEWPORT: The cabinet names Bot Workshop first, with Agents in GCP as the project context. A compact mission and round counter lead into the delivery target, credit budget and always-on safety indicator. Run shift and Step, followed by the live caption, sit above the large robot scene. A part bench sits beside it, with two or three meaningful attachment choices. Moving order packets, visible attachments and a robot remark explain each event; results, the trace and GCP mappings sit underneath. Rounds progress in sequence after a completed successful shift; there is no round selector.

FORM: Code-led extension of the approved arcade cabinet, with build–run–repair interaction already confirmed by the user. No concept roll applies to this local extension.

FINISH: The implementation has a SHIP finish-review verdict and the evidence record below. This is an ordinary extension of a coherent incumbent arcade. No global `PRODUCT.md`, `DESIGN.md` or design sidecar is created or inferred. The game uses authored SVG; the desktop review screenshots are local evidence, not shipping imagery.

## Existing design preserved

`src/play/styles.ts` remains the authority for the dark cabinet, compact title, site font variables, bounded scrolling dialog, navigation, focus treatment and reduced-motion behavior. Bot Workshop adds scoped styles in `src/play/games/bots.ts`, retaining those patterns. Its local sage, amber and blue identify Inventory, Dispatch and Support; blocked actions also have explicit captions and trace entries.

The three SVG robots occupy distinct stock-room, courier-lane and support-office workspaces. Arms, antenna, memory tank and engine markings reflect the fitted loadout. Robot buttons provide the same selection as clicking the scene. At widths of 800px and below the workbench moves below the scene; at 480px and below attachment choices form one column. These are implemented responsive rules, not a claim of mobile visual approval.

## Controls and progression

- Choose Inventory, Dispatch or Support, then a part and attachment. Only the current round's challenge is editable in the first four rounds; all five parts unlock in the final round. Other fitted parts remain inspectable.
- **Run shift** advances the trace automatically and becomes **Pause**. Resume continues the same shift; **Replay shift** repeats it after completion. **Step** starts a shift or advances one event while paused, and is disabled once the result is reached.
- **Back to workbench** stops the shift, clears the visible trace and counters, preserves the loadout and focuses the fitted challenge attachment. Change a part and rerun the same incident. Safety gates cannot be disabled.
- **Next round** appears only after the successful result has been reached. **Start over** resets all five rounds and their loadouts. There is no round-skipping control.
- **Need a hint?**, **Inside this build · the real GCP project** and **Inspect the shift** expose help, source mappings and the observed event log. Counters and trace show the current event, not the future outcome.

Buttons support keyboard and touch without dragging. Part switches and attachment replacement preserve keyboard focus; advancing focuses Run shift. The caption is a polite live region. Leaving the cabinet, hiding or blurring the browser, or changing the reduced-motion preference pauses autoplay without charging hidden time. Reduced motion suppresses robot motion and packet travel; the entire campaign remains playable with Step. The existing cabinet supplies Home, Back to arcade, Escape and focus restoration.

## Five-round walkthrough

Each round begins with a failing loadout. Run it first to observe the problem, use Back to workbench, fit the repair below and replay through the result before advancing.

| Round | Repair | Successful shift | Budget |
| --- | --- | --- | --- |
| 1 · Wrong tool for the job | Dispatch → Tools → **Dispatch arm** | 3 delivered; 4 credits | 8 credits |
| 2 · Can you hear me? | Dispatch → Talk → **Addressed request** | 3 delivered; 4 credits | 8 credits |
| 3 · You already asked me that | Support → Memory → **Order notebook** | 3 delivered; 5 credits | 9 credits |
| 4 · Expensive taste | Dispatch → Engine → **Rules + reasoning** | 3 delivered; 9 credits | 9 credits |
| 5 · Friday evening | Inventory → Stock → **Reserve first**, plus all four repairs above | 4 delivered, 1 safely declined; 10 credits | 10 credits |

Broadcasting orders and reading another order's notes are blocked. Rules alone cannot resolve the unfamiliar detour; reasoning about every route exhausts the budget. The final shift combines rain, the detour, a courier dropout and five orders competing for four baskets. It succeeds only when no orders are missed and no unsafe requests are attempted; safely declining the fifth order is part of the goal.

## Source mapping

| Game part | Simplified lesson | Linked project source |
| --- | --- | --- |
| Tool arm | A message cannot replace a permitted action tool. | [`config/agents/dispatcher/role.json`](https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/config/agents/dispatcher/role.json) |
| Communication antenna | Send a typed, addressed handoff within the receiver's scope. | [`docs/A2A.md`](https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/docs/A2A.md) |
| Memory tank | Recall only unexpired facts for this run, order and role. | [`docs/AGENT-MEMORY.md`](https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/docs/AGENT-MEMORY.md) |
| Reasoning engine | Use routine rules first; reserve reasoning for the unfamiliar case. | [`docs/ADK-RESTAURANT.md`](https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/docs/ADK-RESTAURANT.md) |
| Stock gripper | Reserve physical stock before making a promise. | [`config/agents/inventory/role.json`](https://github.com/alejandrofrank/madrid-delivery-sim/blob/main/config/agents/inventory/role.json) |

These are explanatory links to the project's `main` branch, not pinned embedded engines. The architecture panel describes Cloud Run services and BigQuery outcomes separately from the optional private Cloud SQL / Vertex Vector Search tier, which still needs qualification.

The local implementation is split between `src/play/games/bots.ts` (markup and scoped styles), `public/play/games/bots.mjs` (SVG scene, controls and playback) and `public/play/games/bot-model.mjs` (parts, rounds, policy gates and deterministic events). `src/play/page.ts` registers the cabinet and project route. The model keeps the browser seed fixed at 17 for comparable retries; tests also exercise other seeds.

## Evidence boundary

This is an original deterministic teaching game, not the Python simulator, an ADK runtime, an A2A implementation or a model-quality evaluation. Credits are game units, never GCP prices. The real source links explain the implementation behind each simplified mechanic. Policy gates remain enforced even with a bad loadout. No account, API, model inference, analytics or network request is needed to play.

The game does not execute cloud services, change real inventory or produce real billing. Scoped recall and stock, privacy and budget locks are local model rules. The existing recorded city/store demo remains a separate artifact, linked from the architecture panel. All new game artwork is authored inline SVG; no new raster asset or third-party imagery is introduced.

## Verification and finish review

The 3 November 2026 finish reviewer, `bot_finish_reviewer`, returned **SHIP** after four corrections: preserving focus when changing part tabs, returning Repair focus to the editable fitted attachment, replacing stale completion helper text, and placing the game title above its project context. Desktop evidence is saved locally in `.impeccable/review/desktop.jpg` and `.impeccable/review/blocked.jpg`. Those original captures are review evidence only and are not shipped as game imagery.

The design detector ran once and returned an empty array in `.wrangler/bot-design-scan.json`. This is a detector result, not a substitute for the finish review.

Verification passed: **143/143 tests**, with no failures or skips; TypeScript checking; and `git diff --check`. The targeted coverage comprises six model tests and five UI tests. It checks deterministic retry, all final-round loadouts, scope expiry, enforced stock and budget limits, distinct reasoning failures, sequential progression, visible event/counter timing, repaired focus, paused playback and completion of all five rounds with reduced motion.

Mobile visual approval is **not recorded**: the permitted browser had no mobile emulation. Responsive CSS and DOM interaction checks exist, but neither establishes a rendered mobile result. The SHIP verdict therefore includes this explicit visual-evidence limitation.
