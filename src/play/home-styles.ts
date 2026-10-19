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
.aim-range { border:1px solid var(--line); border-top:3px solid var(--accent); border-radius:7px; overflow:hidden; background:var(--surface); }
.range-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:16px 22px; border-bottom:1px solid var(--line); }
.range-header h2 { margin-top:4px; font:600 19px var(--mono); }.range-metrics { display:flex; gap:32px; }.range-metrics span { display:block; font:10px var(--mono); color:var(--muted); margin-bottom:6px; }.range-metrics b { font:500 20px var(--mono); font-variant-numeric:tabular-nums; }.range-metrics [data-stat=time] { color:var(--mint); }
.range-board { position:relative; aspect-ratio:1000/500; min-height:320px; max-height:590px; overflow:hidden; background:#101622; isolation:isolate; outline-offset:-3px; }
.range-board[data-status=running] { cursor:crosshair; touch-action:manipulation; }
.range-floor { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; opacity:.75; }
.range-wall-label { position:absolute; left:50%; top:20%; transform:translateX(-50%); font:11px var(--mono); letter-spacing:.15em; color:#8290aa; white-space:nowrap; }
.range-stage { position:absolute; left:22px; right:22px; top:18px; display:flex; justify-content:space-between; gap:12px; font:10px var(--mono); letter-spacing:.1em; color:var(--muted); pointer-events:none; }.range-stage [data-stage] { color:var(--accent); }
.range-targets,.range-feedback { position:absolute; inset:0; pointer-events:none; }
.aim-target { position:absolute; width:var(--size); height:var(--size); min-width:44px; min-height:44px; padding:0; transform:translate(-50%,-50%); border:0; border-radius:50%; background:transparent; pointer-events:auto; cursor:crosshair; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
.aim-orb { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 32% 25%,#f4fff0 0%,#b7ecb9 18%,#6abfa6 52%,#2d777c 80%); border:2px solid #c5f2d9; box-shadow:inset -5px -7px 12px #163b5a55,0 0 22px #8de0bf35; }
.aim-target:focus-visible { outline:3px solid #fff; outline-offset:6px; }.aim-target::after { content:''; position:absolute; top:calc(100% + 15px); left:-20%; width:140%; height:12px; border:1px solid #bbe9d566; background:#080e1677; border-radius:50%; pointer-events:none; }
.aim-life { position:absolute; inset:-6px; width:calc(100% + 12px); height:calc(100% + 12px); transform:rotate(-90deg); pointer-events:none; }.aim-life circle { fill:none; stroke:var(--accent); stroke-width:2; stroke-dasharray:100; stroke-dashoffset:var(--elapsed,0); }
.aim-target[data-urgent=true] .aim-life circle { stroke:#f6b56b; }.aim-target .target-key { position:relative; z-index:1; font:600 14px var(--mono); color:#122d30; }.aim-target * { pointer-events:none; }
.shot-mark { position:absolute; transform:translate(-50%,-50%); color:var(--mint); font:600 14px var(--mono); text-shadow:0 2px 3px #000; animation:shot-fade .45s ease-out both; }.shot-mark.miss { color:#ffac96; }.shot-mark::before { content:'×'; display:block; text-align:center; font-size:24px; line-height:1; }
@keyframes shot-fade { to { opacity:0; transform:translate(-50%,-100%); } }
.range-overlay { position:absolute; inset:0; z-index:4; display:grid; place-items:center; padding:18px; background:#10121b5c; backdrop-filter:blur(2px); }
.range-overlay-card { width:min(410px,100%); padding:26px 30px; border:1px solid #626176; border-top:2px solid var(--accent); background:#181b28ed; box-shadow:0 12px 48px #0005; text-align:center; }
.range-overlay h3 { font:600 23px/1.3 var(--sans); margin:10px 0; }.range-overlay p { font-size:14px; color:var(--muted); max-width:36ch; margin:auto; }.range-overlay .range-loading { font:11px var(--mono); margin-top:10px; }
.range-options { display:flex; justify-content:center; align-items:center; gap:12px; margin-top:18px; font-size:12px; }.range-options label { color:var(--muted); }.range-options select { min-height:40px; max-width:100%; padding:6px; background:#11121b; border:1px solid var(--line); border-radius:4px; color:var(--fg); }
.range-primary { display:block; width:100%; min-height:46px; margin-top:18px; border:1px solid var(--accent); border-radius:4px; color:#171322; background:var(--accent); font:600 13px var(--mono); }.range-primary:hover { background:#dbc0ff; }
.range-toolbar { padding:12px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; min-height:66px; }.range-toolbar p { color:var(--muted); font:11px/1.6 var(--mono); }.range-toolbar>div { display:flex; gap:8px; }.range-toolbar button { min-height:40px; padding:6px 14px; border:1px solid var(--line); border-radius:4px; background:#11121b; color:var(--fg); font-size:13px; }.range-toolbar button:hover { border-color:var(--accent); }
.range-progress { height:3px; background:var(--line); }.range-progress span { display:block; height:100%; width:100%; background:var(--accent); transform:scaleX(var(--remaining,1)); transform-origin:left; }
.range-caption { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:18px 20px 12px; color:var(--muted); font:11px/1.5 var(--mono); }.range-caption a { color:var(--mint); }
.activity-details { margin:0 20px 18px; font-size:12px; color:var(--muted); }.activity-details summary { cursor:pointer; display:list-item; padding:5px 0; }.activity-scroll { overflow:auto; margin:12px 0; }.activity-grid { display:flex; gap:3px; min-width:650px; }.activity-grid>div { display:grid; grid-template-rows:repeat(7,1fr); gap:3px; flex:1; }.activity-grid>div>span { display:block; aspect-ratio:1; background:var(--cell); border-radius:2px; }
.aim-range>p:not(.sr-only) { color:var(--muted); font-size:12px; padding:0 20px 18px; }.lobby-footnote { margin-top:14px; color:var(--muted); font-size:12px; }
@media(min-width:900px) { .range-board { aspect-ratio:1000/430; } }
@media(max-width:900px) { .lobby-menu { grid-template-columns:repeat(2,minmax(0,1fr)); }.range-metrics { gap:18px; }.lobby-tag { display:none; } }
@media(max-width:600px) { .lobby-wrap { padding:0 14px 24px; }.lobby-header { gap:14px; padding:18px 0; }.lobby-intro { padding:20px 0 16px; }.lobby-card { padding:12px; gap:9px; min-height:82px; }.lobby-card b { font-size:14px; }.lobby-card small { font-size:11px; }.menu-arrow { display:none; }.menu-icon { width:28px; }.range-header { padding:14px; flex-wrap:wrap; gap:14px; }.range-header>div:first-child { display:flex; align-items:center; justify-content:space-between; width:100%; }.range-header h2 { margin:0; font-size:16px; }.range-metrics { width:100%; justify-content:space-between; }.range-metrics b { font-size:18px; }.range-board { min-height:350px; aspect-ratio:auto; }.range-wall-label { font-size:8px; }.range-stage { left:12px; right:12px; font-size:8px; }.range-overlay-card { padding:20px; }.range-overlay h3 { font-size:21px; }.range-caption { font-size:10px; }.range-toolbar { padding:10px 14px; }.range-toolbar p { font-size:10px; }.range-caption { padding:14px; }.activity-details { margin:0 14px 14px; } }
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; }.shot-mark { opacity:1; } }
`;
