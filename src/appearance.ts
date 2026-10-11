/** Two explicit views: the original homepage remains the default at /. */
export function appearanceSwitch(active: 'original' | 'tech'): string {
  return `<details class="appearance-picker"><summary><span class="appearance-dot ${active}" aria-hidden="true"></span><span>Appearance <b>${active === 'original' ? 'Original' : 'Tech'}</b></span><span class="appearance-chevron" aria-hidden="true">⌄</span></summary><nav class="appearance-menu" aria-label="Choose appearance"><p>Choose your view</p>${(['original', 'tech'] as const).map(view => `<a href="${view === 'original' ? '/' : '/tech'}" class="appearance-option"${active === view ? ' aria-current="true"' : ''}><span class="appearance-preview ${view}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="appearance-option-copy"><strong>${view === 'original' ? 'Original' : 'Tech'}<span aria-hidden="true">${active === view ? '✓' : '↗'}</span></strong><small>${view === 'original' ? 'Green, gradients & a little more me.' : 'Explore the systems. Enter the arcade.'}</small></span></a>`).join('')}</nav></details>`;
}

export const appearanceStyles = `
.appearance-picker { position:relative; color:var(--fg); font:500 12px/1.4 var(--sans); z-index:30; }
.appearance-picker>summary { display:flex; align-items:center; gap:10px; min-height:44px; padding:10px 13px; border:1px solid var(--line); border-radius:8px; background:var(--panel,var(--surface)); cursor:pointer; list-style:none; }
.appearance-picker>summary::-webkit-details-marker { display:none; }
.appearance-picker summary b { margin-left:7px; font-weight:600; }
.appearance-dot { width:9px; height:9px; border-radius:50%; background:#a5c9a0; box-shadow:0 0 0 3px #a5c9a01c; }
.appearance-dot.tech { background:#8cbcff; box-shadow:0 0 0 3px #8cbcff1c; }
.appearance-chevron { font-size:16px; transition:transform .2s; }
.appearance-picker[open] .appearance-chevron { transform:rotate(180deg); }
.appearance-menu { position:absolute; top:calc(100% + 10px); right:0; width:min(320px,calc(100vw - 36px)); padding:16px; border:1px solid var(--line); border-radius:14px; background:var(--panel,var(--surface)); box-shadow:0 18px 70px #0008; }
.appearance-picker[open] .appearance-menu { animation:appearance-arrive .24s cubic-bezier(.2,.8,.2,1) both; }
.appearance-menu>p { margin:0 0 12px; font:11px/1.4 var(--mono); text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
.appearance-option { display:grid; grid-template-columns:82px 1fr; align-items:center; gap:13px; padding:10px; margin-top:8px; border:1px solid var(--line); border-radius:9px; text-decoration:none; color:var(--fg); transition:border-color .2s,transform .2s; }
.appearance-option:hover { border-color:var(--accent); transform:translateY(-2px); text-decoration:none; }
.appearance-option[aria-current] { border-color:var(--fg); }
.appearance-option-copy strong { display:flex; justify-content:space-between; font-size:14px; margin-bottom:5px; }
.appearance-option-copy small { display:block; color:var(--muted); font-size:11px; line-height:1.5; }
.appearance-preview { height:62px; border:1px solid #ffffff20; border-radius:5px; overflow:hidden; position:relative; }
.appearance-preview.original { background:radial-gradient(ellipse at 20% 100%,#d8955e,transparent 75%),linear-gradient(125deg,#477b65,#172a25); }
.appearance-preview.original i { position:absolute; left:28%; right:28%; height:3px; background:#f1ecdf; border-radius:3px; top:22px; }
.appearance-preview.original i:nth-child(2) { top:29px; left:36%; right:36%; opacity:.5; }
.appearance-preview.original i:nth-child(3) { top:42px; left:15%; right:54%; height:5px; opacity:.45; }
.appearance-preview.original i:nth-child(4) { top:42px; left:54%; right:15%; height:5px; opacity:.45; }
.appearance-preview.tech { background:#0c121d; }
.appearance-preview.tech i { position:absolute; top:12px; left:8px; width:16px; height:7px; border:1px solid #7896bf; }
.appearance-preview.tech i:nth-child(2) { top:26px; background:#8cbcff; }
.appearance-preview.tech i:nth-child(3) { top:40px; }
.appearance-preview.tech i:nth-child(4) { top:12px; left:31px; width:39px; height:36px; border-color:#8cbcff; background:linear-gradient(145deg,#8cbcff30,transparent); }
.appearance-picker :is(summary,a):focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
.original-appearance { position:absolute; top:22px; right:36px; z-index:30; }
.view-controls { display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
.view-controls .mode-toggle { margin-left:0; }
@media(max-width:760px) { .original-appearance { right:22px; } }
@media(max-width:480px) { .view-controls { gap:8px; margin-top:6px; }.view-controls .appearance-menu { left:0; right:auto; } }
@keyframes appearance-arrive { from { opacity:0; transform:translateY(-7px) scale(.97); } to { opacity:1; transform:none; } }
@media(prefers-reduced-motion:reduce) { .appearance-picker * { animation:none!important; transition:none!important; } }
@media print { .appearance-picker,.view-controls,.original-appearance { display:none; } }
`;
