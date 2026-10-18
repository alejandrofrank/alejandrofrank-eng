import { PLAYER } from '../play/art';

export function timelineRunner(): string {
  return `<div class="runner-invitation" data-runner-invitation hidden><button type="button" class="runner-start" data-runner-start><span aria-hidden="true">▶</span> Play the timeline</button><span>Jump. Crouch. Sometimes, just run.</span></div>
  <div class="runner-avatar" data-runner-avatar hidden aria-hidden="true">${PLAYER}</div>
  <section class="timeline-runner" data-timeline-runner hidden tabindex="0" aria-label="Experience runner" aria-describedby="runner-help">
    <div class="runner-generated" data-runner-generated aria-hidden="true"></div><div class="runner-ground" data-runner-ground aria-hidden="true"></div>
    <div class="runner-hud"><div><span class="runner-phase" data-runner-phase>Your real experience</span><span data-runner-progress>0 / 11 roles</span></div><div class="runner-scores"><span>Score <b data-runner-score>00000</b></span><span>Best <b data-runner-best>00000</b></span></div><button type="button" data-runner-exit aria-label="Exit game and return to timeline">Exit <kbd>Esc</kbd></button></div>
    <div class="runner-message" data-runner-message hidden><h2 data-runner-title>Paused</h2><p data-runner-result></p><button type="button" data-runner-retry>Try again</button></div>
    <div class="runner-bottom"><p id="runner-help"><kbd>Space / ↑</kbd> jump · Hold <kbd>↓</kbd> crouch · Release to run</p><div class="runner-controls"><button type="button" data-runner-jump>↑ Jump</button><button type="button" data-runner-duck aria-pressed="false">↓ Hold to crouch</button><button type="button" data-runner-pause>Pause</button></div></div>
    <p class="runner-announcement" data-runner-announcement role="status" aria-live="polite"></p>
  </section>`;
}

export const runnerStyles = `
.timeline-stage { position:relative; margin-top:22px; isolation:isolate; }
.timeline-stage .tlp-scroll { margin-top:0; }
.timeline-stage [hidden] { display:none!important; }
.runner-invitation { position:absolute; z-index:3; top:26px; left:50%; transform:translateX(-50%); display:grid; justify-items:center; gap:10px; width:max-content; max-width:90%; text-align:center; }
.runner-invitation>span { font:11px/1.6 var(--mono); color:var(--muted); }
.runner-start { display:flex; align-items:center; gap:12px; padding:14px 20px; background:var(--accent); color:var(--bg); border:1px solid #eadbff; box-shadow:4px 4px 0 #060810; font:600 14px var(--mono); cursor:pointer; animation:runner-beacon 1.8s steps(2,end) infinite; }
.runner-start:hover,.runner-start:focus-visible { animation:none; background:#e2caff; }
@keyframes runner-beacon { 50% { opacity:.58; } }
.runner-avatar { position:absolute; width:32px; height:44px; z-index:4; pointer-events:none; transform-origin:50% 100%; }
.runner-avatar .player-sprite { display:block; width:32px; height:44px; }
.runner-avatar[data-duck=true] .player-sprite { transform:scaleY(.48) scaleX(1.18); transform-origin:50% 100%; }
.runner-avatar[data-running=true] .player-leg.left { animation:runner-stride .22s steps(2,end) infinite; }
.runner-avatar[data-running=true] .player-leg.right { animation:runner-stride .22s steps(2,end) infinite reverse; }
@keyframes runner-stride { 50% { transform:translateY(-3px); } }
.timeline-stage.is-running .tlp-scroll { overflow:hidden; }
.timeline-stage.is-running .tlp { will-change:transform; pointer-events:none; }
.timeline-runner { position:absolute; inset:0; z-index:3; overflow:hidden; border-radius:4px; outline-offset:5px; pointer-events:none; }
.timeline-runner button { pointer-events:auto; font:500 12px var(--mono); min-height:42px; border:1px solid var(--line); background:var(--bg); color:var(--fg); padding:10px 14px; cursor:pointer; border-radius:4px; }
.timeline-runner button:hover { border-color:var(--accent); }
.runner-hud { position:absolute; top:14px; left:16px; right:16px; display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding:10px 12px; background:var(--surface); border-bottom:1px solid var(--line); }
.runner-hud>div:first-child { display:grid; gap:6px; font:10px var(--mono); color:var(--muted); }
.runner-phase { color:var(--accent); font:600 12px var(--mono); }
.runner-scores { display:flex; gap:22px; margin-left:auto; font:10px var(--mono); color:var(--muted); }
.runner-scores span { display:grid; gap:5px; }.runner-scores b { font-size:17px; color:var(--fg); font-variant-numeric:tabular-nums; }
.runner-generated { position:absolute; inset:0; }
.runner-obstacle { position:absolute; background:var(--job); }
.runner-obstacle.contract { background:var(--contract); }.runner-obstacle.project { background:transparent; box-shadow:inset 0 0 0 1px var(--project); }
.runner-obstacle span { position:absolute; bottom:20px; white-space:nowrap; font:11px var(--mono); color:var(--muted); }
.runner-ground { position:absolute; left:0; right:0; height:1px; background:var(--line); }
.runner-bottom { position:absolute; bottom:8px; left:12px; right:12px; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:8px 20px; }
.runner-bottom p { margin:0; font:10px/1.6 var(--mono); color:var(--muted); background:var(--surface); padding:4px 8px; }
.runner-controls { display:flex; gap:6px; }.runner-controls button { touch-action:none; user-select:none; }
.runner-controls [aria-pressed=true] { background:var(--accent); color:var(--bg); }
.runner-message { position:absolute; z-index:2; top:42%; left:50%; transform:translate(-50%,-50%); width:min(360px,88%); padding:20px; border:1px solid var(--accent); background:var(--bg); box-shadow:6px 6px 0 #070910; text-align:center; }
.runner-message h2 { margin:0 0 10px; font:600 21px var(--mono); }.runner-message p { margin:0 0 16px; font:13px/1.6 var(--sans); color:var(--muted); }
.runner-message button { background:var(--accent); color:var(--bg); }
.runner-announcement { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media(max-width:700px) { .runner-hud { left:8px; right:8px; padding:8px; gap:8px; }.runner-scores { gap:10px; }.runner-scores b { font-size:14px; }.runner-hud button kbd { display:none; }.runner-bottom p { display:none; }.runner-controls button { padding:10px; font-size:11px; } }
@media(prefers-reduced-motion:reduce) { .runner-start,.runner-avatar .player-leg { animation:none!important; } }
@media print { .runner-invitation,.runner-avatar,.timeline-runner { display:none!important; }.timeline-stage .tlp { transform:none!important; } }
`;
