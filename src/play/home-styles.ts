export const arcadeHomeStyles = `
:root { color-scheme:dark; --bg:#11121b; --surface:#1a1c28; --line:#363749; --fg:#f1edde; --muted:#b1afbf; --accent:#c5a2f6; --mint:#b8df97; --sans:'Inter Tight',system-ui,sans-serif; --mono:'JetBrains Mono',monospace; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.5 var(--sans); -webkit-font-smoothing:antialiased; }
body.arcade-home { --fg:#f1edde; }
h1,h2,h3,p { margin:0; } a { color:inherit; text-underline-offset:4px; } button,select { font:inherit; } button { cursor:pointer; } button:disabled { cursor:wait; opacity:.5; }
[hidden] { display:none!important; } :is(a,button,summary,select):focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
.skip-link { position:absolute; left:20px; top:-80px; z-index:10; padding:12px; background:var(--fg); color:var(--bg); }.skip-link:focus { top:8px; }
.lobby-wrap { max-width:1320px; padding:0 32px 28px; margin:auto; }
.lobby-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; padding:20px 0; border-bottom:1px solid var(--line); }
.lobby-name { text-decoration:none; font:500 14px var(--mono); }
.lobby-intro { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:24px 0 20px; }
.lobby-intro h1 { font:600 clamp(20px,2vw,27px)/1.3 var(--sans); }.lobby-intro p { margin-top:6px; color:var(--muted); font-size:14px; }
.lobby-tag,.range-kicker { font:10px/1.4 var(--mono); letter-spacing:.1em; color:var(--accent); }
.lobby-menu { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; position:relative; margin-bottom:22px; }
.lobby-card { display:flex; align-items:center; gap:12px; padding:18px 16px; min-height:92px; height:100%; background:var(--surface); border:1px solid var(--line); border-radius:5px; text-decoration:none; list-style:none; cursor:pointer; transition:background .15s,border-color .15s; }
.lobby-card::-webkit-details-marker { display:none; }.lobby-card b { font-size:16px; font-weight:600; }.lobby-card small { display:block; font-size:12px; margin-top:3px; color:var(--muted); }
.menu-icon { display:grid; place-items:center; width:34px; height:40px; flex:none; color:var(--accent); }.menu-icon svg { width:32px; height:32px; }.menu-icon .player-sprite { height:40px; }
.menu-arrow { margin-left:auto; font:20px var(--mono); color:var(--muted); }
.lobby-card:hover,.lobby-panel[open] .lobby-card { border-color:var(--accent); background:#242435; }.lobby-card:hover .menu-icon { color:var(--fg); }
.lobby-panel-body { position:absolute; top:calc(100% + 8px); left:0; right:0; z-index:6; padding:24px; background:#222332; border:1px solid var(--accent); border-radius:5px; box-shadow:0 16px 40px #0007; }
.lobby-panel-body h2 { font:600 18px var(--mono); margin-bottom:12px; }.lobby-panel-body p { max-width:66ch; color:var(--muted); }.lobby-panel-body nav { display:flex; flex-wrap:wrap; gap:12px 28px; margin-top:16px; }.lobby-panel-body a { display:inline-block; padding:10px 0; }
.lobby-panel-body dl { display:flex; gap:36px; flex-wrap:wrap; margin:16px 0; }.lobby-panel-body dl>div { display:flex; flex-direction:column-reverse; }.lobby-panel-body dt { font-size:12px; color:var(--muted); }.lobby-panel-body dd { font:22px var(--mono); margin:0 0 4px; }
.aim-range { margin-top:32px; padding:22px 0 12px; border-top:1px solid var(--line); }
.range-caption { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; color:var(--muted); font:12px/1.5 var(--mono); }
.range-caption a { text-decoration:none; color:var(--mint); }.range-caption a:hover { text-decoration:underline; }
.range-launch { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:16px 24px; min-height:84px; padding:16px 0; }
.range-primary { display:inline-flex; justify-content:center; align-items:center; gap:9px; min-height:44px; padding:10px 28px; border:1px solid #759d79; border-radius:5px; background:#253e35; color:#d4edb8; font:600 13px var(--mono); cursor:pointer; }
.range-primary:hover { background:#355244; border-color:var(--mint); }.range-primary span { font-size:11px; }
.aim-range[data-status=ready] .range-primary:not(:disabled) { animation:play-breathe 2.4s ease-in-out infinite; }
@keyframes play-breathe { 50% { box-shadow:0 0 0 4px #b8df9710; border-color:#c0dba3; } }
.range-launch>[data-stage] { font:11px var(--mono); color:var(--mint); }
.range-metrics { display:flex; flex-wrap:wrap; justify-content:center; gap:16px 28px; }.range-metrics>div { display:flex; align-items:baseline; gap:8px; }.range-metrics span { font:10px var(--mono); color:var(--muted); }.range-metrics b { font:500 17px var(--mono); font-variant-numeric:tabular-nums; }.range-metrics [data-stat=time] { color:var(--mint); }
.range-board { position:relative; outline-offset:5px; }
.range-scroll { overflow-x:auto; padding:4px 0 12px; scrollbar-width:thin; scrollbar-color:#52705c transparent; overscroll-behavior-x:contain; }
.range-grid { --gap:4px; --cell-min:16px; position:relative; display:grid; grid-template-columns:repeat(var(--columns),minmax(0,1fr)); grid-template-rows:repeat(7,minmax(0,1fr)); gap:var(--gap); width:100%; min-width:calc(var(--columns) * (var(--cell-min) + var(--gap)) - var(--gap)); isolation:isolate; }
.range-day { display:block; aspect-ratio:1; border-radius:3px; background:var(--cell); transition:background-color .22s,box-shadow .22s; }
.range-grid[data-boot=lit] .range-day { background:#b8df97; box-shadow:0 0 8px #b8df9740; }
.range-grid[data-boot=dark] .range-day,.aim-range[data-status=running] .range-day { background:#233130; box-shadow:none; }
.aim-range[data-status=running] .range-day.is-target { background:#c4ee96; box-shadow:0 0 10px #b6eb8e45; }
.aim-range[data-status=running] .range-day.is-urgent { background:#eac286; box-shadow:0 0 8px #eac28635; }
.aim-range[data-status=running] .range-day.is-burst { background:color-mix(in srgb,#ff626b calc(var(--burst) * 100%),#233130); box-shadow:0 0 calc(var(--burst) * 12px) #ff626b70; transition:none; }
.range-targets { display:contents; }
.aim-target { position:relative; align-self:stretch; justify-self:stretch; z-index:2; min-width:0; min-height:0; padding:0; background:transparent; color:#17251b; border:0; border-radius:4px; cursor:crosshair; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
.aim-target::after { content:''; position:absolute; bottom:-2px; left:0; height:2px; width:100%; background:#e6ffd0; transform:scaleX(var(--life,1)); transform-origin:left; pointer-events:none; }
.aim-target:focus-visible { outline:2px solid #fff; outline-offset:3px; }.target-key { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); padding:1px 4px; border-radius:3px; background:#e5ffd6; font:600 12px var(--mono); pointer-events:none; }.target-key:empty { display:none; }
.aim-range[data-status=running] .range-board { cursor:crosshair; touch-action:manipulation; }
.range-feedback { position:absolute; inset:0; pointer-events:none; z-index:3; }.shot-mark { position:absolute; transform:translate(-50%,-50%); color:#fff; font:600 12px var(--mono); text-shadow:0 1px 4px #000,0 1px 4px #000; animation:shot-fade .4s ease-out both; }.shot-mark.miss { color:#ffc5aa; }
@keyframes shot-fade { to { opacity:0; transform:translate(-50%,-90%); } }
.range-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:14px 0 6px; }.range-toolbar p { color:var(--muted); font-size:13px; }.range-controls { display:flex; align-items:center; gap:8px; }.range-controls :is(button,select) { min-height:40px; padding:6px 12px; border:1px solid var(--line); border-radius:4px; background:var(--bg); color:var(--fg); font-size:12px; }.range-controls button:hover { border-color:var(--accent); }
.range-progress { height:2px; background:var(--line); margin-top:4px; }.range-progress span { display:block; height:100%; width:100%; background:var(--mint); transform:scaleX(var(--remaining,1)); transform-origin:left; }
.range-result { margin:10px 0; padding:12px 16px; border-left:2px solid var(--mint); background:var(--surface); font:12px/1.7 var(--mono); }
.range-note,.lobby-footnote { color:var(--muted); font-size:11px; margin-top:10px; }.range-note span { margin-left:8px; }.lobby-footnote { margin-top:20px; }
@media(max-width:900px) { .lobby-menu { grid-template-columns:repeat(2,minmax(0,1fr)); }.lobby-tag { display:none; } }
@media(max-width:600px) { .lobby-wrap { padding:0 14px 24px; }.lobby-header { gap:14px; padding:18px 0; }.lobby-intro { padding:20px 0 16px; }.lobby-card { padding:12px; gap:9px; min-height:82px; }.lobby-card b { font-size:14px; }.lobby-card small { font-size:11px; }.menu-arrow { display:none; }.menu-icon { width:28px; }.aim-range { margin-top:22px; }.range-caption { font-size:10px; }.range-caption>span { flex-basis:100%; }.range-grid { --cell-min:22px; }.range-launch { gap:10px 20px; }.range-metrics { gap:12px; }.range-metrics>div { gap:5px; }.range-metrics b { font-size:14px; }.range-metrics span { font-size:9px; }.range-toolbar p { font-size:12px; }.range-note span { display:block; margin-left:0; } }
@media(pointer:coarse) { .range-grid { --cell-min:22px; } }
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }
@media(prefers-reduced-motion:reduce) { .aim-range[data-status=running] .range-day.is-burst { background:#a65055; box-shadow:none; } }
`;
