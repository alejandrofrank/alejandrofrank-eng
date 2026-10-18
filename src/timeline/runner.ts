import { PLAYER } from '../play/art';

const PING_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h17v12H2zM7 20h7M10 16v4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 8h3v3H6zM12 8h3v3h-3z" fill="currentColor"/><circle cx="19" cy="5" r="5" fill="#ff929d"/><path d="M19 2v4m0 1v1" stroke="#25213c" stroke-width="1.5"/></svg>';
const PINGS = ['quick call?', 'just circling back', '@everyone', 'tiny request…', 'can you see my screen?'];
const NOTIFICATION_PATTERN = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="44" viewBox="0 0 64 44"><g fill="none" stroke="#bba4ef" opacity=".24" stroke-width="2"><path d="M8 8h24v17H8zM15 30h10M20 25v5M44 25h13v9H44zM48 38h5"/><path d="M13 13h4m5 0h5M14 20h12"/></g><circle cx="33" cy="8" r="4" fill="#f8a1ad" opacity=".55"/></svg>')}")`;

export function timelineRunner(): string {
  const notices = [...PINGS, ...PINGS, ...PINGS].map(text => `<span class="runner-ping">${PING_ICON}<span>${text}</span></span>`).join('');
  return `<div class="runner-invitation" data-runner-invitation hidden><button type="button" class="runner-start" data-runner-start><span aria-hidden="true">▶</span> Play the timeline</button><span>The floor is notifications. Get to higher ground.</span></div>
  <div class="runner-avatar" data-runner-avatar hidden aria-hidden="true">${PLAYER}</div>
  <section class="timeline-runner" data-timeline-runner hidden tabindex="0" aria-label="Experience platformer" aria-describedby="runner-help">
    <div class="runner-generated" data-runner-generated aria-hidden="true"></div><div class="runner-ground" data-runner-ground aria-hidden="true"></div>
    <div class="runner-flood" data-runner-flood aria-hidden="true"><div class="runner-flood-notices">${notices}</div><div class="runner-flood-notices runner-flood-notices-back">${notices}</div></div>
    <div class="runner-hud"><div><span class="runner-phase" data-runner-phase>Explore the experience</span><span data-runner-progress>0 roles reached · 0 diamonds</span><span data-runner-checkpoint>Checkpoint: Start</span></div><div class="runner-scores"><span>Score <b data-runner-score>00000</b></span><span>Best <b data-runner-best>00000</b></span></div><button type="button" data-runner-exit aria-label="Exit game and return to timeline">Exit <kbd>Esc</kbd></button></div>
    <div class="runner-message" data-runner-message hidden><h2 data-runner-title>Paused</h2><p data-runner-result></p><div class="runner-message-actions"><button type="button" data-runner-retry>Resume</button><button type="button" data-runner-restart>Start over</button></div></div>
    <div class="runner-bottom"><div class="runner-flood-status" data-runner-flood-status><span class="runner-unread" data-runner-unread aria-label="Unread notifications">0</span><span data-runner-flood-warning>Notifications in 8s</span><button type="button" data-runner-snooze aria-label="Do not disturb: drain notifications for five seconds. Shortcut M.">Do not disturb <kbd>M</kbd></button></div><div class="runner-inputs"><p id="runner-help"><kbd>← → / A D</kbd> move · <kbd>Space / ↑</kbd> jump · <kbd>↓</kbd> crouch · <kbd>↓ + jump</kbd> drop · <kbd>M</kbd> snooze</p><div class="runner-controls"><button type="button" data-runner-left aria-label="Move left" aria-pressed="false">←</button><button type="button" data-runner-right aria-label="Move right" aria-pressed="false">→</button><button type="button" data-runner-jump>↑ Jump</button><button type="button" data-runner-duck aria-label="Hold to crouch; jump while holding to drop through a platform" aria-pressed="false">↓ Duck</button><button type="button" data-runner-pause>Pause</button></div></div></div>
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
.runner-avatar[data-facing=left] .player-sprite { scale:-1 1; }
.runner-avatar[data-duck=true] .player-sprite { transform:scaleY(.48) scaleX(1.18); transform-origin:50% 100%; }
.runner-avatar[data-running=true] .player-leg.left { animation:runner-stride .22s steps(2,end) infinite; }
.runner-avatar[data-running=true] .player-leg.right { animation:runner-stride .22s steps(2,end) infinite reverse; }
@keyframes runner-stride { 50% { transform:translateY(-3px); } }
.timeline-stage.is-running .tlp-scroll { overflow:hidden; }
.timeline-stage.is-running { overflow:hidden; }
.timeline-stage.is-running .tlp { will-change:transform; pointer-events:none; }
.timeline-stage.is-running .tlp-bar[data-landed=true] { box-shadow:0 3px 0 #a3dfb8; }
.timeline-stage.is-running .tlp-bar.project[data-landed=true] { box-shadow:inset 0 0 0 1px var(--project),0 3px 0 #a3dfb8; }
.timeline-runner { position:absolute; inset:0; z-index:3; overflow:hidden; border-radius:4px; outline-offset:5px; pointer-events:none; }
.timeline-runner button { pointer-events:auto; font:500 12px var(--mono); min-height:42px; border:1px solid var(--line); background:var(--bg); color:var(--fg); padding:10px 14px; cursor:pointer; border-radius:4px; }
.timeline-runner button:hover { border-color:var(--accent); }
.runner-hud { position:absolute; z-index:2; top:14px; left:16px; right:16px; display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding:10px 12px; background:var(--surface); border-bottom:1px solid var(--line); }
.runner-hud>div:first-child { display:grid; gap:6px; font:10px var(--mono); color:var(--muted); }
.runner-phase { color:var(--accent); font:600 12px var(--mono); }
.runner-scores { display:flex; gap:22px; margin-left:auto; font:10px var(--mono); color:var(--muted); }
.runner-scores span { display:grid; gap:5px; }.runner-scores b { font-size:17px; color:var(--fg); font-variant-numeric:tabular-nums; }
.runner-generated { position:absolute; inset:0; }
.runner-platform { position:absolute; background:#35534b; border:1px solid #759f90; border-top:3px solid #b7dbb9; box-shadow:0 4px 0 #0c1418; }
.runner-platform[data-visited=true] { background:#527c62; border-top-color:#e0f3bc; }
.runner-spike { position:absolute; background:#ff858c; clip-path:polygon(0 100%,25% 0,50% 100%,75% 0,100% 100%); }
.runner-gem { position:absolute; background:#f4cf7d; border:2px solid #ffedbd; transform:rotate(45deg); box-shadow:0 0 9px #f4cf7d50; }
.runner-ground { position:absolute; left:0; right:0; height:1px; background:var(--line); }
.runner-flood { position:absolute; z-index:1; left:0; right:0; bottom:0; overflow:hidden; border-top:4px solid #d3bdff; background-color:#504078f2; background-image:${NOTIFICATION_PATTERN}; box-shadow:0 -5px 0 #a78cda40; pointer-events:none; }
.runner-flood::before { content:""; position:absolute; inset:0 0 auto; height:7px; background:repeating-linear-gradient(90deg,#a891d5 0 16px,transparent 16px 32px); }
.runner-flood[data-phase=muted] { background-color:#29483ee8; border-color:#a6edc6; }
.runner-flood[data-phase=muted] .runner-flood-notices { opacity:.4; }
.runner-flood-notices { position:absolute; top:16px; left:0; display:flex; gap:16px; width:max-content; transform:translate3d(calc(-1 * var(--flood-drift,0px)),var(--flood-bob,0px),0); }
.runner-flood-notices-back { top:86px; left:-780px; opacity:.65; transform:translate3d(var(--flood-drift,0px),calc(-1 * var(--flood-bob,0px)),0); }
.runner-ping { display:flex; align-items:center; gap:8px; width:140px; height:46px; padding:6px 9px; border:1px solid #b69fdf; border-left:4px solid #b69fdf; background:#292339; color:#f1e7ff; font:10px/1.35 var(--mono); box-shadow:3px 3px 0 #29203770; transform:rotate(-4deg); }
.runner-ping:nth-child(even) { transform:rotate(5deg); }.runner-ping svg { flex:none; width:24px; height:24px; color:#d7c5f7; }
.runner-bottom { position:absolute; z-index:2; bottom:8px; left:12px; right:12px; display:grid; justify-items:center; gap:8px; }
.runner-inputs { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:6px 20px; }
.runner-flood-status { display:flex; align-items:center; gap:10px; max-width:100%; padding:5px 6px 5px 10px; border:1px solid var(--line); background:var(--bg); color:var(--muted); font:11px/1.4 var(--mono); }
.runner-unread { display:grid; place-items:center; flex:none; min-width:25px; height:25px; padding:0 4px; background:#7858a2; color:#fff; font:600 10px var(--mono); border-radius:4px; }
.runner-flood-status[data-phase=warning],.runner-flood-status[data-phase=rising],.runner-flood-status[data-phase=high] { border-color:#e4a3a6; color:#ffe0d1; }.runner-flood-status[data-phase=muted] { color:#a6edc6; border-color:#629a7a; }
.runner-flood-status button { flex:none; font-size:10px; min-height:34px; padding:6px 8px; border-color:#8f77af; }.runner-flood-status button[aria-disabled=true] { opacity:.65; cursor:default; }
.runner-bottom p { margin:0; font:10px/1.6 var(--mono); color:var(--muted); background:var(--surface); padding:4px 8px; }
.runner-controls { display:flex; gap:6px; }.runner-controls button { touch-action:none; user-select:none; min-width:44px; }
.runner-controls [aria-pressed=true] { background:var(--accent); color:var(--bg); }
.runner-message { position:absolute; z-index:3; top:42%; left:50%; transform:translate(-50%,-50%); width:min(360px,88%); padding:20px; border:1px solid var(--accent); background:var(--bg); box-shadow:6px 6px 0 #070910; text-align:center; }
.runner-message h2 { margin:0 0 10px; font:600 21px var(--mono); }.runner-message p { margin:0 0 16px; font:13px/1.6 var(--sans); color:var(--muted); }
.runner-message-actions { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.runner-message [data-runner-retry] { background:var(--accent); color:var(--bg); }
.runner-announcement { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media(max-width:700px) { .runner-hud { left:8px; right:8px; padding:8px; gap:8px; }.runner-hud>div:first-child { flex:1 1 100%; gap:4px; }.runner-phase { font-size:11px; }.runner-scores { margin-left:0; gap:18px; }.runner-scores span { display:flex; align-items:baseline; }.runner-scores b { font-size:14px; }.runner-hud button { margin-left:auto; min-height:32px; padding:6px 10px; }.runner-hud button kbd { display:none; }.runner-bottom p { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); }.runner-controls { gap:4px; }.runner-controls button { padding:10px 8px; font-size:11px; }.runner-flood-status { gap:6px; width:100%; font-size:10px; }.runner-flood-status button { margin-left:auto; max-width:112px; }.runner-flood-status kbd { display:none; } }
@media(prefers-reduced-motion:reduce) { .runner-start,.runner-avatar .player-leg { animation:none!important; }.runner-flood-notices,.runner-ping { transform:none!important; } }
@media print { .runner-invitation,.runner-avatar,.timeline-runner { display:none!important; }.timeline-stage .tlp { transform:none!important; } }
`;
