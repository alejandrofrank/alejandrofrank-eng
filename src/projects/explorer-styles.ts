export const explorerStyles = `
.explorer-intro { display:flex; justify-content:space-between; align-items:flex-end; max-width:none; gap:32px; padding:32px 0 26px; }
.explorer-intro p { max-width:46ch; margin:0; font-size:14px; }
.explorer-intro .eyebrow { margin-bottom:9px; }
.explorer-intro h1 { font-size:30px; }
.explorer-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:0 0 16px; color:var(--muted); font:11px/1.6 var(--mono); }
.explorer-toolbar>span>span { padding:0 9px; color:var(--line); }
.explorer-toolbar button { font:12px var(--sans); background:none; color:var(--fg); cursor:pointer; border:1px solid var(--line); border-radius:6px; padding:9px 13px; min-height:38px; }
.explorer-toolbar button span { margin-left:12px; }
.project-explorer { display:grid; grid-template-columns:265px minmax(0,1fr); gap:20px; align-items:start; margin-bottom:38px; }
.project-rail { border:0; padding:0; margin:0; min-width:0; }
.project-rail legend { padding:0; margin-bottom:14px; font:11px var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:.1em; }
.project-choices { display:grid; gap:8px; }
.project-choice { position:relative; display:block; cursor:pointer; }
.project-choice input { position:absolute; width:1px; height:1px; opacity:0; }
.choice-body { position:relative; display:grid; grid-template-columns:22px minmax(0,1fr) 24px; gap:12px; align-items:center; min-height:80px; padding:16px 14px; border:1px solid var(--line); border-radius:8px; background:var(--bg); transition:transform .25s cubic-bezier(.2,.8,.2,1),background .25s,border-color .25s; overflow:hidden; }
.choice-body::before { content:''; position:absolute; inset:0 auto 0 0; width:3px; background:var(--project-color); transform:scaleY(0); transition:transform .3s cubic-bezier(.2,.8,.2,1); }
.choice-number { color:var(--muted); font:11px var(--mono); }
.choice-copy strong { display:block; font-size:14px; line-height:1.35; font-weight:550; }
.choice-copy small { display:block; color:var(--muted); font:10px/1.6 var(--mono); margin-top:4px; }
.choice-symbol { color:var(--project-color); font:22px var(--mono); text-align:center; opacity:.5; transition:transform .3s,opacity .3s; }
.project-choice:hover .choice-body { background:var(--surface); transform:translateX(3px); }
.project-choice input:checked+.choice-body { border-color:var(--project-color); background:var(--surface); transform:translateX(5px); }
.project-choice input:checked+.choice-body::before { transform:scaleY(1); }
.project-choice input:checked+.choice-body .choice-symbol { opacity:1; transform:rotate(-10deg) scale(1.15); }
.project-choice input:focus-visible+.choice-body { outline:2px solid var(--project-color); outline-offset:3px; }
.rail-help { margin-top:16px; color:var(--muted); font:10px/1.6 var(--mono); }
.project-stage { min-width:0; border:1px solid var(--line); border-radius:12px; background:#131c28; box-shadow:0 18px 50px #0003; overflow:hidden; perspective:1000px; }
.stage-chrome { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 18px; border-bottom:1px solid var(--line); background:#0d141e; color:var(--muted); font:10px var(--mono); letter-spacing:.08em; }
.stage-chrome>span { display:flex; gap:9px; align-items:center; }
.stage-chrome i { display:block; width:6px; height:6px; border-radius:50%; background:#abedac; }
.stage-chrome>div { display:flex; gap:6px; }
.stage-chrome button { width:35px; height:32px; border:1px solid var(--line); background:transparent; color:var(--fg); font:18px var(--mono); cursor:pointer; border-radius:4px; transition:background .2s,transform .15s; }
.stage-chrome button:hover { background:var(--surface); }
.stage-chrome button:active { transform:scale(.9); }
.project-preview { padding:24px 26px 26px; transform-origin:50% 30%; }
.preview-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; font:10px/1.6 var(--mono); color:var(--muted); }
.preview-category { text-transform:uppercase; letter-spacing:.08em; }
.preview-status { color:var(--project-color); display:flex; align-items:center; gap:7px; }
.preview-status::before { content:''; width:5px; height:5px; border:1px solid currentColor; border-radius:50%; }
.project-preview h3 { display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:29px; margin:12px 0 18px; font-weight:550; }
.project-preview h3>span { font:30px var(--mono); color:var(--project-color); }
.project-sketch { margin:0 0 22px; border:1px solid #ffffff16; border-radius:8px; background-color:#0c131e; background-image:radial-gradient(#71849b30 .7px,transparent .7px); background-size:15px 15px; overflow:hidden; }
.project-sketch svg { display:block; width:100%; height:auto; padding:8px 4px 0; transform:perspective(850px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)); transition:transform .18s ease-out; }
.project-sketch figcaption { padding:10px 15px; border-top:1px solid #ffffff12; font:10px/1.6 var(--mono); color:var(--muted); background:#0c131ec9; }
.sketch-node { transform-box:fill-box; transform-origin:center; }
.sketch-node rect,.sketch-node circle { fill:#182333; stroke:var(--project-color); stroke-opacity:.7; }
.sketch-wire { stroke:var(--project-color); stroke-width:1.5; fill:none; }
.project-sketch text { font:13px var(--mono); fill:var(--fg); }
.project-sketch .sketch-small { font-size:10px; fill:var(--muted); }
.project-sketch .sketch-symbol { font-size:40px; fill:var(--project-color); }
.project-sketch .sketch-volume { font-size:24px; fill:var(--project-color); }
.sketch-carton { fill:#182333; stroke:var(--project-color); stroke-width:2; }
.sketch-check { fill:none; stroke:var(--project-color); stroke-width:3; }
.project-sketch .sketch-fill,.sketch-land { fill:var(--project-color); fill-opacity:.2; stroke:var(--project-color); }
.project-sketch .sketch-ascii { font:12px var(--mono); fill:var(--project-color); white-space:pre; }
.preview-story p { font-size:14px; color:var(--muted); max-width:63ch; }
.preview-story .preview-question { color:var(--fg); font-size:18px; line-height:1.5; margin-bottom:7px; }
.preview-story p+p { margin-top:0; }
.preview-flow { display:flex; flex-wrap:wrap; gap:7px 0; list-style:none; padding:0; margin:20px 0; font:10px/1.7 var(--mono); color:var(--project-color); }
.preview-flow li+li::before { content:'→'; margin:0 10px; color:var(--muted); }
.preview-actions { display:flex; align-items:center; flex-wrap:wrap; gap:12px 22px; padding-top:19px; border-top:1px solid var(--line); }
.project-open { display:flex; align-items:center; gap:25px; background:var(--project-color); color:#0b131c; padding:11px 15px; border-radius:5px; text-decoration:none; font-size:13px; font-weight:600; }
.project-open:hover { filter:brightness(1.07); }
.project-open span { font-size:18px; transition:transform .2s; }
.project-open:hover span { transform:translate(2px,-2px); }
.project-play { font-size:12px; text-decoration:none; color:var(--muted); padding:10px 0; }
.project-play:hover { color:var(--fg); text-decoration:underline; }
.explorer-announcement,.explorer-section-title { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@media(max-width:900px) { .project-explorer { grid-template-columns:220px minmax(0,1fr); gap:14px; }.choice-body { gap:8px; padding:14px 10px; }.choice-copy strong { font-size:13px; }.project-preview { padding:20px; }.project-preview h3 { font-size:26px; } }
@media(max-width:680px) {
  .explorer-intro { align-items:flex-start; flex-direction:column; gap:12px; padding:25px 0; }.explorer-intro h1 { font-size:26px; }
  .project-explorer { grid-template-columns:1fr; gap:16px; }.project-rail legend { margin-bottom:10px; }
  .project-choices { display:flex; overflow-x:auto; gap:8px; padding:4px 3px 10px; scroll-snap-type:x proximity; }.project-choice { flex:0 0 188px; scroll-snap-align:start; }
  .choice-body { min-height:72px; }.project-choice:hover .choice-body,.project-choice input:checked+.choice-body { transform:none; }.rail-help { margin-top:4px; }
  .project-preview { padding:18px; }.preview-heading { font-size:9px; gap:8px; }.project-preview h3 { font-size:25px; }
  .explorer-toolbar { align-items:flex-start; }.explorer-toolbar>span { max-width:160px; }.explorer-toolbar>span>span { padding:0 3px; }
  .preview-story .preview-question { font-size:17px; }.project-sketch { margin-left:-6px; margin-right:-6px; }.project-sketch figcaption { font-size:9px; }
}
@media(prefers-reduced-motion:reduce) { .project-explorer *,.explorer-toolbar * { transition:none!important; animation:none!important; scroll-behavior:auto!important; } }
@media print { .project-explorer,.explorer-toolbar { display:none!important; }[data-project-list][hidden] { display:block!important; } }
`;
