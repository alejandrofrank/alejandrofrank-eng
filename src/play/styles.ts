export const playStyles = `
:root { --bg:#11121b; --surface:#1a1c28; --line:#363749; --fg:#f1edde; --muted:#b1afbf; --accent:#c5a2f6; }
.arcade-intro { display:flex; align-items:end; justify-content:space-between; gap:20px; padding:28px 0 22px; }
.arcade-intro h1 { font-size:28px; margin-top:5px; }
.arcade-intro>p { font-size:14px; color:var(--muted); max-width:38ch; text-align:right; }
.arcade-room { border:1px solid #444056; border-radius:14px; overflow:hidden; background:#161923; box-shadow:0 20px 70px #0003; }
.room-topline { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 22px; background:#1c1d2a; border-bottom:1px solid #373448; }
.room-sign { display:flex; align-items:center; gap:12px; font:600 12px var(--mono); letter-spacing:.13em; }
.room-sign b { display:grid; place-items:center; width:29px; height:29px; border:1px solid #c5a2f6; border-radius:5px; color:#e0c5ff; font-size:11px; letter-spacing:-1px; box-shadow:0 0 14px #c5a2f61c; }
.room-status { font:10px var(--mono); color:var(--muted); }
.room-status span { color:#b9e58a; }
.arcade-room fieldset { border:0; padding:0; margin:0; min-width:0; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.room-scroll { overflow-x:auto; scrollbar-color:#655d7e #181922; scrollbar-width:thin; }
.arcade-floor { position:relative; min-width:900px; isolation:isolate; overflow:hidden; background:radial-gradient(ellipse at 50% 0,#45405e45,transparent 65%),linear-gradient(#181b29 63%,#343040 63%,#1b1b2a 64%); }
.arcade-floor::before { content:''; position:absolute; z-index:-1; inset:63% -30% -60%; transform:perspective(260px) rotateX(38deg); transform-origin:50% 0; background-image:linear-gradient(#a399c11b 1px,transparent 1px),linear-gradient(90deg,#a399c11b 1px,transparent 1px); background-size:56px 40px; }
.arcade-floor::after { content:''; position:absolute; z-index:-1; left:4%; right:4%; top:26px; height:4px; background:linear-gradient(90deg,#f6b56b55,#87b8f855,#b9e58a55,#eee38455,#c5a2f655,#eea1b455); box-shadow:0 0 24px #bc9bff44; }
.stations { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:6px; padding:46px 28px 96px; }
.station { position:relative; min-width:0; color:var(--station); }
.station input { position:absolute; left:50%; top:65%; width:1px; height:1px; opacity:0; }
.station label { position:relative; display:flex; flex-direction:column; align-items:center; cursor:pointer; text-align:center; border-radius:8px; padding:0 2px 7px; }
.station label::before { content:''; position:absolute; width:92%; top:36%; height:35%; background:radial-gradient(ellipse,color-mix(in srgb,var(--station) 22%,transparent),transparent 65%); opacity:0; transition:opacity .3s; pointer-events:none; }
.station label strong { color:#e4dfdb; font-size:12px; font-weight:500; line-height:1.4; margin-top:3px; }
.station label small { display:block; color:#9a97a9; font:10px/1.6 var(--mono); margin-top:4px; }
.station label small[data-playable] { color:#b9e58a; }
.station input:focus-visible+label { outline:2px solid var(--station); outline-offset:4px; }
.cabinet { display:block; width:100%; max-width:156px; overflow:visible; transition:filter .2s; }
.cabinet-body { transform-origin:80px 228px; }
.cabinet-shadow { transform-origin:80px 231px; }
.cabinet-display { transition:filter .18s ease-out; }
.screen-wash { transition:opacity .18s ease-out; }
.screen-bezel { transition:stroke .18s ease-out; }
.screen-art { opacity:.7; transition:opacity .18s ease-out,filter .18s ease-out; }
.station input:checked+label .cabinet { filter:drop-shadow(0 0 9px color-mix(in srgb,var(--station) 24%,transparent)); }
.station input:checked+label::before { opacity:1; }
.station input:checked+label strong { color:var(--station); }
.station input:checked+label .screen-wash { opacity:.19; }
.station input:checked+label .screen-art { opacity:1; }
.station input:focus-visible+label .cabinet-body { animation:cabinet-hop .48s ease-out; }
.station input:focus-visible+label .cabinet-shadow { animation:cabinet-hop-shadow .48s ease-out; }
.station input:focus-visible+label .cabinet-display { filter:drop-shadow(0 0 6px currentColor); }
.station input:focus-visible+label .cabinet-display .screen-wash { opacity:.34; }
.station input:focus-visible+label .screen-bezel { stroke:var(--station); }
.station input:focus-visible+label .cabinet-display .screen-art { opacity:1;filter:brightness(1.25); }
@media(hover:hover) {
  .station label:hover .cabinet-body { animation:cabinet-hop .48s ease-out; }
  .station label:hover .cabinet-shadow { animation:cabinet-hop-shadow .48s ease-out; }
  .station label:hover .cabinet-display { filter:drop-shadow(0 0 6px currentColor); }
  .station label:hover .cabinet-display .screen-wash { opacity:.34; }
  .station label:hover .screen-bezel { stroke:var(--station); }
  .station label:hover .cabinet-display .screen-art { opacity:1;filter:brightness(1.25); }
  .station label:hover::before { opacity:1; }
}
@keyframes cabinet-hop {
  0%,100% { transform:translateY(0) scale(1); }
  16% { transform:translateY(2px) scale(1.025,.975); }
  44% { transform:translateY(-13px) scale(.99,1.015); }
  76% { transform:translateY(0) scale(1.025,.975); }
}
@keyframes cabinet-hop-shadow {
  0%,100% { transform:scaleX(1);opacity:.4; }
  16%,76% { transform:scaleX(1.04);opacity:.45; }
  44% { transform:scaleX(.78);opacity:.2; }
}
.room-player { position:absolute; top:calc(100% - 86px); left:0; width:54px; text-align:center; pointer-events:none; transition:transform .6s cubic-bezier(.4,0,.2,1); }
.player-tag { display:inline-block; padding:1px 6px; border-radius:3px; background:#e9e1cf; color:#262030; font:700 9px/1.4 var(--mono); margin-bottom:2px; }
.player-sprite { display:block; width:42px; height:57px; margin:auto; }
.room-player[data-facing=left] .player-sprite { scale:-1 1; }
.room-player.is-walking .player-body { animation:walk-body .15s steps(2,end) 4; }
.room-player.is-walking .player-leg.left { animation:walk-leg .15s steps(2,end) 4; }
.room-player.is-walking .player-leg.right { animation:walk-leg .15s steps(2,end) 4 reverse; }
.room-bottomline { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 20px; background:#1c1d2a; border-top:1px solid #373448; color:var(--muted); font:10px/1.7 var(--mono); }
.room-bottomline kbd { font:inherit; border:1px solid #5a546b; padding:1px 4px; border-radius:3px; color:var(--fg); }
.room-position { color:#dfc4fd; white-space:nowrap; }
.room-enter { color:var(--fg); padding:8px 10px; border:1px solid #5a506e; border-radius:5px; background:#2a2538; text-decoration:none; white-space:nowrap; }
.room-enter:hover { border-color:#c5a2f6; background:#3a304d; }
.phone-tip { display:none; }
.station-panels { margin-top:20px; }
.arcade-screen{color:var(--fg);background:#11131c;border:2px solid #494457;border-top:7px solid var(--station);border-radius:18px;padding:0;width:min(1260px,calc(100vw - 40px));max-width:none;height:min(940px,94dvh);max-height:94dvh;overflow:hidden;box-shadow:0 0 0 6px #181720,0 36px 100px #000a;transform-origin:var(--screen-origin-x,50%) var(--screen-origin-y,35%)}
.arcade-screen[open]{display:flex;flex-direction:column;animation:cabinet-enter .3s cubic-bezier(.16,1,.3,1) both}.arcade-screen::backdrop{background:#050710dc;backdrop-filter:blur(7px)}
.screen-marquee{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 24px;background:#252332;border-bottom:1px solid #4c455b;flex-shrink:0}.screen-marquee span{font:10px var(--mono);color:var(--station);letter-spacing:.08em}.screen-marquee h2{font-size:20px;margin:5px 0 0;line-height:1.2}.screen-exit{font:12px var(--sans);color:var(--fg);background:#161620;border:1px solid #716779;border-radius:6px;min-height:44px;padding:10px 13px;cursor:pointer;flex-shrink:0}.screen-exit:hover{border-color:var(--station)}.screen-exit:focus-visible{outline:2px solid var(--station);outline-offset:3px}.screen-exit kbd{margin-left:8px;font:10px var(--mono);color:var(--muted);border:1px solid #514b60;padding:2px 4px;border-radius:3px}
.screen-viewport{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-color:#655d7e #181922;scrollbar-gutter:stable}.arcade-screen .station-panels{margin:0}.arcade-screen .station-panel{margin:0;border:0;border-radius:0;background:#181a25;animation:none}.arcade-screen .console-header{display:none}.arcade-screen .console-body{display:flex;flex-direction:column}.arcade-screen .game-content{order:0}.arcade-screen .station-brief{order:1;border:0;border-top:1px solid #393548;display:grid;grid-template-columns:1fr 1fr;gap:8px 30px;padding:20px 26px;background:#151720}.arcade-screen .station-brief .eyebrow{grid-column:1/-1;font-size:10px;margin:0}.arcade-screen .station-brief h2{font-size:17px;margin:0}.arcade-screen .station-brief>p:not(.eyebrow):not(.lesson){grid-column:1;margin:0;font-size:12px}.arcade-screen .station-brief .lesson{grid-column:2;grid-row:2/span 2;display:block;border:0;padding:0;margin:0}.arcade-screen .station-brief .read-link{margin:0;font-size:12px;grid-column:1/-1}.screen-rim{display:flex;align-items:center;justify-content:center;gap:24px;flex-shrink:0;padding:8px;background:#24212c;border-top:1px solid #4c455b;color:#9c96a8;font:9px var(--mono);letter-spacing:.1em}.screen-rim i{width:40px;height:4px;border-top:1px solid #0b0c13;border-bottom:1px solid #3d374a}
@keyframes cabinet-enter{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
@media(max-width:600px){.arcade-screen{width:100%;height:100dvh;max-height:100dvh;border-radius:0;border-width:0;border-top-width:4px}.screen-marquee{padding:12px 14px;gap:10px}.screen-marquee span{font-size:8px}.screen-marquee h2{font-size:17px}.screen-exit{font-size:11px;padding:8px 10px}.screen-exit kbd{display:none}.arcade-screen .station-brief{display:block;padding:18px}.arcade-screen .station-brief>*{margin-bottom:12px!important}.screen-rim{padding-bottom:max(8px,env(safe-area-inset-bottom))}}
@media(prefers-reduced-motion:reduce){.arcade-screen[open]{animation:none}.arcade-screen *{animation:none!important;transition:none!important}}
.station-panel { border:1px solid #454153; border-radius:12px; overflow:hidden; margin-top:18px; background:#1a1b27; --station:#c5a2f6; }
.station-panel:not([hidden]) { animation:console-arrive .28s ease-out both; }
.arcade-screen .station-panel:not([hidden]){animation:none}
.arcade-screen .game-content{max-width:1120px;width:100%;margin-inline:auto}
.console-header { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 22px; border-bottom:1px solid #393548; background:color-mix(in srgb,var(--station) 6%,#1a1b27); font:10px var(--mono); }
.console-header .console-slot { color:var(--station); }
.console-lights { display:flex; gap:5px; }
.console-lights i { width:5px; height:5px; border-radius:50%; background:var(--station); }
.console-lights i+i { opacity:.25; }
.console-body { display:grid; grid-template-columns:280px minmax(0,1fr); }
.game-content{min-width:0}.game-inspector{margin:0 24px 24px;border-top:1px solid #454153;padding-top:16px;font-size:12px}.game-inspector>summary{cursor:pointer;padding:8px 0;color:var(--muted)}.game-inspector .match-demo,.game-inspector .image-demo{padding:20px 0 0}
.station-brief { padding:25px; border-right:1px solid #393548; }
.station-brief h2 { font-size:24px; margin:8px 0 13px; }
.station-brief p { color:var(--muted); font-size:14px; }
.station-brief .lesson { margin-top:20px; padding-top:16px; border-top:1px solid #393548; font-size:12px; }
.station-brief .lesson span { display:block; font:10px var(--mono); color:var(--station); text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; }
.station-brief .read-link { display:inline-block; margin-top:22px; color:var(--fg); font-size:13px; }
.evidence-table { border-collapse:collapse; width:100%; margin-top:18px; font-size:12px; }
.evidence-table caption { text-align:left; margin-bottom:8px; color:var(--muted); font:10px/1.5 var(--mono); }
.evidence-table :is(th,td) { text-align:left; padding:8px; border-bottom:1px solid #393548; vertical-align:top; }
.arcade-note { color:var(--muted); font-size:11px; line-height:1.7; margin-top:17px; }
.concept-preview { display:flex; flex-direction:column; justify-content:center; min-height:300px; position:relative; overflow:hidden; }
.concept-diagram { display:flex; gap:12px; align-items:center; justify-content:center; padding:30px 0; color:var(--station); }
.concept-diagram span { border:1px solid color-mix(in srgb,var(--station) 35%,transparent); border-radius:8px; padding:16px 20px; font:12px var(--mono); background:color-mix(in srgb,var(--station) 5%,transparent); }
.concept-preview h3 { font-size:16px; margin:12px 0 8px; }
.concept-preview p { color:var(--muted); font-size:13px; max-width:52ch; }
.concept-preview .action { align-self:flex-start; margin-top:18px; border-color:var(--station); }
.arcade-colophon { display:flex; justify-content:space-between; gap:16px; font:10px/1.8 var(--mono); color:#aaa4b7; margin-top:20px; }
.match-demo,.image-demo,.concept-preview { min-width:0; padding:24px; }
.match-demo button,.image-demo button { background:#282534; color:var(--fg); cursor:pointer; }
.match-presets { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
.match-presets button { border:1px solid #5c536b; padding:9px 12px; min-height:44px; border-radius:5px; font:12px var(--sans); }
.match-presets button[aria-pressed=true] { border-color:var(--station); background:color-mix(in srgb,var(--station) 12%,#1a1b27); }
.match-inputs { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.match-inputs label,.image-demo-controls label { display:grid; gap:7px; color:var(--muted); font:11px/1.5 var(--mono); min-width:0; }
.match-inputs input,.image-demo-controls select { width:100%; min-width:0; min-height:44px; padding:8px 10px; border:1px solid #5c536b; border-radius:5px; background:#12141e; color:var(--fg); font:13px/1.5 var(--sans); }
.match-results { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px; }
.match-results>div { border:1px solid #4d465c; background:#12141e; border-radius:6px; padding:15px; }
.match-results span { display:block; color:var(--muted); font:10px var(--mono); margin-bottom:10px; }
.match-results strong { display:block; font-size:16px; line-height:1.4; }
.match-results p { font-size:12px; line-height:1.6; margin-top:8px; color:var(--muted); }
.match-results [data-decision=no] { border-color:#dbb27c; }.match-results [data-decision=yes] { border-color:#a5cb85; }.match-results [data-decision=uncertain] { border-color:#b99dd5; }
.match-table-wrap { overflow:auto; }
.match-table-wrap table { min-width:320px; }
.match-table-wrap tr[data-result=conflict] { background:#dbb27c14; color:#edca9a; }
.match-table-wrap tr[data-result=missing],.match-table-wrap tr[data-result=unsupported] { background:#b99dd514; color:#d6bcef; }
.image-demo-controls { display:grid; grid-template-columns:1.15fr 1fr 1fr; gap:12px; }
.image-source { display:flex; align-items:center; gap:18px; margin:20px 0; }
.image-source canvas { width:120px; height:90px; flex-shrink:0; border:1px solid #4d465c; }
.image-source strong { display:block; font:11px var(--mono); margin-bottom:8px; }
.image-source span { display:block; color:var(--muted); font-size:12px; line-height:1.6; max-width:38ch; }
.image-results { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.image-results figure { margin:0; min-width:0; }
.image-results figcaption { font:12px var(--mono); margin-bottom:10px; }
.image-results canvas { display:block; width:100%; aspect-ratio:4/3; height:auto; background:#12141e; border:1px solid #4d465c; image-rendering:pixelated; }
.image-results p { margin-top:9px; color:var(--station); font:10px/1.7 var(--mono); }
.image-results span { display:block; font-size:12px; line-height:1.6; color:var(--muted); margin-top:6px; }
.image-evidence { margin-top:20px; padding-top:16px; border-top:1px solid #393548; }
.image-evidence p { font-size:13px; color:var(--muted); margin-bottom:14px; }
.image-demo-status { margin-top:12px; font:11px/1.7 var(--mono); color:var(--station); }
.image-demo button:disabled { opacity:.5; cursor:default; }
@media(max-width:780px) { .console-body { grid-template-columns:1fr; }.station-brief { border-right:0; border-bottom:1px solid #393548; }.station-brief .lesson { display:none; }.match-demo,.image-demo { padding:20px; } }
@media(max-width:480px) { .match-inputs { grid-template-columns:1fr; }.match-results { gap:8px; }.match-results>div { padding:12px; }.match-results strong { font-size:14px; }.image-demo-controls { gap:7px; }.image-demo-controls label { font-size:9px; }.image-demo-controls select { padding:6px; font-size:12px; }.image-source { gap:12px; }.image-source canvas { width:88px; height:66px; }.image-source strong { font-size:10px; }.image-source span { font-size:11px; }.image-results { gap:10px; }.image-results figcaption { font-size:10px; }.image-results p { font-size:9px; } }
select:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
@keyframes console-arrive { from { opacity:.3; transform:translateY(7px); } to { opacity:1; transform:none; } }
@keyframes walk-leg { to { transform:translateY(-3px); } }
@keyframes walk-body { to { transform:translateY(-1px); } }
@media(max-width:780px) { .arcade-intro { align-items:start; }.arcade-intro>p { max-width:27ch; }.console-body { grid-template-columns:1fr; }.station-brief,.match-demo,.concept-preview,.image-demo { padding:20px; }.concept-diagram { gap:6px; }.concept-diagram span { padding:12px; } }
@media(max-width:600px) { .arcade-intro { display:block; padding-top:24px; }.arcade-intro>p { max-width:none; text-align:left; margin-top:10px; }.arcade-intro h1 { font-size:25px; }.room-topline { padding:12px; }.room-sign { font-size:10px; gap:9px; }.room-status { font-size:9px; }.room-status .status-divider { display:none; }.room-status span { display:block; }.arcade-floor { min-width:810px; }.stations { padding:36px 18px 81px; gap:8px; }.station label strong { font-size:11px; }.station label small { font-size:9px; }.room-player { top:calc(100% - 74px); }.player-sprite { width:35px; height:47px; }.room-bottomline { padding:10px 12px; font-size:9px; }.desktop-tip { display:none; }.phone-tip { display:inline; }.console-body { grid-template-columns:1fr; }.station-brief { border-right:0; border-bottom:1px solid #393548; padding:20px; }.station-brief h2 { font-size:22px; }.station-brief .lesson { display:none; }.station-brief .read-link { margin-top:12px; }.console-header { padding:12px 18px; }.arcade-colophon { display:block; }.concept-preview { min-height:240px; } }
@media(prefers-reduced-motion:reduce) { .arcade-room *,.station-panels * { animation:none!important; transition:none!important; } }
@media print { .arcade-room,.match-demo,.image-demo { display:none!important; }.station-panel[hidden] { display:block!important; }.console-body { display:block; }.station-brief { border:0; }.arcade-colophon { display:none; } }
`;
