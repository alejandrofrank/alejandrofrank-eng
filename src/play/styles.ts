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
.cabinet { display:block; width:100%; max-width:156px; overflow:visible; transform-origin:50% 90%; transition:transform .28s cubic-bezier(.2,.8,.2,1),filter .28s; }
.station input:checked+label .cabinet { transform:translateY(-8px); filter:drop-shadow(0 0 9px color-mix(in srgb,var(--station) 24%,transparent)); }
.station input:checked+label::before { opacity:1; }
.station input:checked+label strong { color:var(--station); }
.station input:checked+label .screen-wash { opacity:.19; }
.station input:checked+label .screen-art { animation:screen-boot .4s ease-out both; transform-origin:70px 90px; }
@media(hover:hover) { .station label:hover .cabinet { transform:translateY(-9px) rotate(-2deg); } }
.room-player { position:absolute; top:calc(100% - 86px); left:0; width:54px; text-align:center; pointer-events:none; transition:transform .6s cubic-bezier(.4,0,.2,1); }
.player-tag { display:inline-block; padding:1px 6px; border-radius:3px; background:#e9e1cf; color:#262030; font:700 9px/1.4 var(--mono); margin-bottom:2px; }
.player-sprite { display:block; width:42px; height:57px; margin:auto; }
.room-player[data-facing=left] .player-sprite { scale:-1 1; }
.room-player.is-walking .player-body { animation:walk-body .15s steps(2,end) 4; }
.room-player.is-walking .player-leg.left { animation:walk-leg .15s steps(2,end) 4; }
.room-player.is-walking .player-leg.right { animation:walk-leg .15s steps(2,end) 4 reverse; }
.room-player.is-celebrating .player-sprite { animation:player-win .5s ease 2; }
.room-bottomline { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 20px; background:#1c1d2a; border-top:1px solid #373448; color:var(--muted); font:10px/1.7 var(--mono); }
.room-bottomline kbd { font:inherit; border:1px solid #5a546b; padding:1px 4px; border-radius:3px; color:var(--fg); }
.room-position { color:#dfc4fd; white-space:nowrap; }
.room-enter { color:var(--fg); padding:8px 10px; border:1px solid #5a506e; border-radius:5px; background:#2a2538; text-decoration:none; white-space:nowrap; }
.room-enter:hover { border-color:#c5a2f6; background:#3a304d; }
.phone-tip { display:none; }
.station-panels { margin-top:20px; }
.station-panel { border:1px solid #454153; border-radius:12px; overflow:hidden; margin-top:18px; background:#1a1b27; --station:#c5a2f6; }
.station-panel:not([hidden]) { animation:console-arrive .28s ease-out both; }
.console-header { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 22px; border-bottom:1px solid #393548; background:color-mix(in srgb,var(--station) 6%,#1a1b27); font:10px var(--mono); }
.console-header .console-slot { color:var(--station); }
.console-lights { display:flex; gap:5px; }
.console-lights i { width:5px; height:5px; border-radius:50%; background:var(--station); }
.console-lights i+i { opacity:.25; }
.console-body { display:grid; grid-template-columns:280px minmax(0,1fr); }
.station-brief { padding:25px; border-right:1px solid #393548; }
.station-brief h2 { font-size:24px; margin:8px 0 13px; }
.station-brief p { color:var(--muted); font-size:14px; }
.station-brief .lesson { margin-top:20px; padding-top:16px; border-top:1px solid #393548; font-size:12px; }
.station-brief .lesson span { display:block; font:10px var(--mono); color:var(--station); text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; }
.station-brief .read-link { display:inline-block; margin-top:22px; color:var(--fg); font-size:13px; }
.game,.concept-preview,.pixel-workshop { min-width:0; padding:25px; }
.game-progress { display:flex; justify-content:space-between; align-items:center; gap:12px; font:11px var(--mono); color:var(--muted); }
.round-dots { display:flex; gap:5px; }
.round-dots i { display:block; width:18px; height:5px; background:#494356; border-radius:1px; }
.round-dots i[data-state=current] { background:var(--station); }
.round-dots i[data-state=done] { background:#7a9e67; }
.game h3 { font-size:18px; margin:20px 0 12px; }
.listings { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
.listing { position:relative; border:1px solid #4d465c; background:#11131e; padding:16px; border-radius:6px; }
.listing>span { display:block; color:var(--station); font:10px var(--mono); margin-bottom:12px; }
.listing strong { display:block; font-size:16px; line-height:1.5; font-weight:500; }
.listing::after { content:''; display:block; width:48px; height:10px; margin-top:17px; background:repeating-linear-gradient(90deg,#837d92 0 1px,transparent 1px 3px,#837d92 3px 5px,transparent 5px 7px); opacity:.5; }
.game-choices { display:grid; grid-template-columns:1fr 1fr 1.25fr; gap:8px; }
.game button,.pixel-workshop button { color:var(--fg); background:#272435; cursor:pointer; }
.game-choices button { font-size:12px; padding:10px; min-height:48px; line-height:1.4; border-color:#5c536b; box-shadow:0 3px 0 #090b13; transition:transform .15s,background .15s; }
.game-choices button:hover:not(:disabled) { background:color-mix(in srgb,var(--station) 15%,#272435); border-color:var(--station); transform:translateY(-2px); }
.game-choices button:active:not(:disabled) { transform:translateY(2px); box-shadow:none; }
.game button:disabled { cursor:default; opacity:.5; }
.game button[data-picked=true] { opacity:1; border-color:var(--station); background:color-mix(in srgb,var(--station) 15%,#272435); }
.game-feedback { margin-top:20px; padding:14px; border:1px solid #c29b65; border-radius:5px; background:#c29b650c; font-size:14px; }
.game-feedback[data-correct=true] { border-color:#a5cb85; background:#a5cb850c; }
.game-feedback strong { display:block; margin-bottom:6px; }
.game-feedback p { color:var(--muted); font-size:13px; }
.evidence-table { border-collapse:collapse; width:100%; margin-top:18px; font-size:12px; }
.evidence-table caption { text-align:left; margin-bottom:8px; color:var(--muted); font:10px/1.5 var(--mono); }
.evidence-table :is(th,td) { text-align:left; padding:8px; border-bottom:1px solid #393548; vertical-align:top; }
.game-next { margin-top:16px; }
.arcade-note { color:var(--muted); font-size:11px; line-height:1.7; margin-top:17px; }
.concept-preview { display:flex; flex-direction:column; justify-content:center; min-height:300px; position:relative; overflow:hidden; }
.concept-diagram { display:flex; gap:12px; align-items:center; justify-content:center; padding:30px 0; color:var(--station); }
.concept-diagram span { border:1px solid color-mix(in srgb,var(--station) 35%,transparent); border-radius:8px; padding:16px 20px; font:12px var(--mono); background:color-mix(in srgb,var(--station) 5%,transparent); }
.concept-preview h3 { font-size:16px; margin:12px 0 8px; }
.concept-preview p { color:var(--muted); font-size:13px; max-width:52ch; }
.concept-preview .action { align-self:flex-start; margin-top:18px; border-color:var(--station); }
.arcade-colophon { display:flex; justify-content:space-between; gap:16px; font:10px/1.8 var(--mono); color:#aaa4b7; margin-top:20px; }
.pixel-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
.pixel-toolbar label { font:11px var(--mono); color:var(--muted); }
.pixel-toolbar select { font:11px var(--mono); color:var(--fg); background:#252233; border:1px solid #5b526c; border-radius:4px; min-height:38px; max-width:160px; padding:6px; margin-left:5px; }
.pixel-desk { display:flex; align-items:start; justify-content:center; gap:22px; }
.pixel-board { display:grid; grid-template-columns:repeat(8,1fr); width:280px; max-width:calc(100% - 70px); aspect-ratio:1; background:#5c536b; border:1px solid #5c536b; gap:1px; touch-action:none; }
.pixel-board button { display:block; border:0; border-radius:0; min-width:0; padding:0; aspect-ratio:1; }
.pixel-board button:focus-visible { position:relative; outline:2px solid #fff; outline-offset:-4px; z-index:1; }
.pixel-tools { width:48px; flex-shrink:0; display:grid; gap:10px; }
.pixel-tools fieldset { margin:0; padding:0; border:0; display:grid; gap:6px; }
.pixel-tools legend { font:10px var(--mono); color:var(--muted); margin-bottom:6px; text-align:center; }
.pixel-tools label { position:relative; cursor:pointer; }
.pixel-tools input { position:absolute; width:1px; height:1px; opacity:0; }
.pixel-tools label span { display:grid; place-items:center; width:44px; height:44px; border:1px solid #686076; border-radius:4px; font:11px var(--mono); }
.pixel-tools input:checked+span { outline:2px solid var(--fg); outline-offset:2px; }
.pixel-tools input:focus-visible+span { outline:2px dashed var(--station); outline-offset:3px; }
.pixel-tools .action { padding:4px; min-height:44px; font-size:11px; }
.pixel-tools button:disabled { opacity:.45; cursor:default; }
.pixel-bottom { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:18px; }
.pixel-bottom p { color:var(--muted); font:11px/1.7 var(--mono); }
.pixel-bottom .action { flex-shrink:0; font-size:12px; }
select:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
@keyframes screen-boot { from { opacity:.2; transform:scaleY(.1); } to { opacity:1; transform:scaleY(1); } }
@keyframes console-arrive { from { opacity:.3; transform:translateY(7px); } to { opacity:1; transform:none; } }
@keyframes walk-leg { to { transform:translateY(-3px); } }
@keyframes walk-body { to { transform:translateY(-1px); } }
@keyframes player-win { 40% { transform:translateY(-13px) rotate(-7deg); } 70% { transform:translateY(0) rotate(5deg); } }
@media(max-width:780px) { .arcade-intro { align-items:start; }.arcade-intro>p { max-width:27ch; }.console-body { grid-template-columns:230px minmax(0,1fr); }.station-brief,.game,.concept-preview,.pixel-workshop { padding:20px; }.game-choices { grid-template-columns:1fr; }.concept-diagram { gap:6px; }.concept-diagram span { padding:12px; } }
@media(max-width:600px) { .arcade-intro { display:block; padding-top:24px; }.arcade-intro>p { max-width:none; text-align:left; margin-top:10px; }.arcade-intro h1 { font-size:25px; }.room-topline { padding:12px; }.room-sign { font-size:10px; gap:9px; }.room-status { font-size:9px; }.room-status .status-divider { display:none; }.room-status span { display:block; }.arcade-floor { min-width:810px; }.stations { padding:36px 18px 81px; gap:8px; }.station label strong { font-size:11px; }.station label small { font-size:9px; }.room-player { top:calc(100% - 74px); }.player-sprite { width:35px; height:47px; }.room-bottomline { padding:10px 12px; font-size:9px; }.desktop-tip { display:none; }.phone-tip { display:inline; }.console-body { grid-template-columns:1fr; }.station-brief { border-right:0; border-bottom:1px solid #393548; padding:20px; }.station-brief h2 { font-size:22px; }.station-brief .lesson { display:none; }.station-brief .read-link { margin-top:12px; }.game-choices { grid-template-columns:1fr 1fr 1fr; }.game-choices button { font-size:11px; }.console-header { padding:12px 18px; }.arcade-colophon { display:block; }.concept-preview { min-height:240px; }.listing { padding:13px; }.listing strong { font-size:14px; } }
@media(prefers-reduced-motion:reduce) { .arcade-room *,.station-panels * { animation:none!important; transition:none!important; } }
@media print { .arcade-room,.game,.pixel-workshop { display:none!important; }.station-panel[hidden] { display:block!important; }.console-body { display:block; }.station-brief { border:0; }.arcade-colophon { display:none; } }
`;
