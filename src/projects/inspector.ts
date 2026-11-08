import { matchMarkup, imageMarkup } from './inspectors';

export function projectInspector(slug: string): string {
  const match = slug === 'catalog-match-lab';
  if (!match && slug !== 'ascii-art') return '';
  return `<section class="project-inspector" id="try-it" data-project-inspector="${match ? 'match' : 'image'}" aria-labelledby="inspector-title">
<header><h2 id="inspector-title">${match ? 'Try the matching rules' : 'Compare conversion methods'}</h2><p>${match ? 'Change the product names or choose an example. See which attributes agree, conflict, or need more evidence.' : 'Use the same source, grid and palette for both methods. Change one setting and inspect what happens to the picture.'}</p></header>
<div class="inspector-launch"><button class="action primary" type="button" data-inspector-launch hidden>${match ? 'Load the matcher' : 'Render the comparison'}</button><p data-inspector-status role="status"></p></div>
${match ? matchMarkup() : imageMarkup()}
<noscript><p>This comparison needs JavaScript. You can still read the project and inspect its source.</p></noscript>
</section>`;
}

export const inspectorStyles = `
.project-inspector { margin-top:30px; padding:24px; border:1px solid var(--line); border-radius:8px; background:var(--surface); }
.project-inspector>header { max-width:75ch; margin-bottom:20px; }
.project-inspector h2 { font-size:21px; margin-bottom:8px; }
.project-inspector>header p { color:var(--muted); }
.project-inspector .match-demo,.project-inspector .image-demo { min-width:0; padding:0; }
.project-inspector .inspector-launch p:empty { display:none; }
.project-inspector button { font:inherit; cursor:pointer; }
.project-inspector :is(button,input,select):focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
.project-inspector button:disabled { opacity:.6; cursor:default; }
.project-inspector .match-presets { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
.project-inspector .match-presets button { min-height:44px; padding:8px 12px; border:1px solid var(--line); border-radius:5px; background:var(--bg); color:var(--fg); font-size:14px; }
.project-inspector .match-presets button[aria-pressed=true] { border-color:var(--accent); background:color-mix(in srgb,var(--accent) 14%,var(--bg)); }
.project-inspector .match-inputs { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.project-inspector :is(.match-inputs,.image-demo-controls) label { display:grid; gap:8px; color:var(--muted); font-size:14px; min-width:0; }
.project-inspector :is(input,select) { width:100%; min-width:0; min-height:44px; padding:10px 12px; border:1px solid var(--line); border-radius:5px; background:var(--bg); color:var(--fg); font:16px var(--sans); }
.project-inspector .action:not(.primary) { background:var(--bg); color:var(--fg); }
.project-inspector .match-results { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:24px 0; }
.project-inspector .match-results>div { padding:18px; border:1px solid var(--line); border-radius:6px; background:var(--bg); }
.project-inspector .match-results span { display:block; font:12px/1.6 var(--mono); color:var(--muted); margin-bottom:8px; }
.project-inspector .match-results strong { display:block; font-size:18px; line-height:1.4; }
.project-inspector .match-results p { color:var(--muted); font-size:14px; margin-top:8px; }
.project-inspector .match-results [data-decision=no] { border-color:#e4ad71; }
.project-inspector .match-results [data-decision=yes] { border-color:#a5cb85; }
.project-inspector .match-results [data-decision=uncertain] { border-color:#c5a2f6; }
.project-inspector .match-table-wrap { overflow-x:auto; }
.project-inspector table { border-collapse:collapse; width:100%; font-size:14px; }
.project-inspector caption { text-align:left; margin-bottom:12px; color:var(--muted); font:12px/1.6 var(--mono); }
.project-inspector :is(th,td) { text-align:left; padding:10px 12px; border-bottom:1px solid var(--line); overflow-wrap:anywhere; }
.project-inspector tbody th { font-weight:500; }
.project-inspector tr[data-result=conflict] { background:#e4ad7114; color:#f0c394; }
.project-inspector tr[data-result=missing],.project-inspector tr[data-result=unsupported] { background:#c5a2f614; color:#dbc4f6; }
.project-inspector .arcade-note { margin-top:20px; color:var(--muted); font-size:13px; max-width:85ch; }
.project-inspector .image-demo-controls { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.project-inspector .image-source { display:flex; align-items:center; gap:20px; margin:24px 0; }
.project-inspector .image-source canvas { width:160px; height:120px; max-width:40%; object-fit:contain; }
.project-inspector .image-source strong { display:block; font-size:14px; margin-bottom:8px; }
.project-inspector .image-source span { display:block; color:var(--muted); max-width:48ch; font-size:14px; }
.project-inspector .image-results { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
.project-inspector .image-results figure { margin:0; min-width:0; }
.project-inspector .image-results figcaption { font-size:16px; margin-bottom:10px; }
.project-inspector .image-results canvas { display:block; width:100%; aspect-ratio:4/3; height:auto; border:1px solid var(--line); background:var(--bg); image-rendering:pixelated; }
.project-inspector .image-results p { margin-top:10px; color:var(--accent); font:12px/1.6 var(--mono); }
.project-inspector .image-results span { display:block; color:var(--muted); font-size:14px; margin-top:8px; }
.project-inspector .image-evidence { border-top:1px solid var(--line); padding-top:20px; margin-top:24px; }
.project-inspector .image-evidence p { color:var(--muted); margin-bottom:16px; }
.project-inspector .image-demo-status { margin-top:16px; font:13px/1.7 var(--mono); }
@media (max-width:600px) { .project-inspector { padding:18px 14px; }.project-inspector .match-inputs,.project-inspector .match-results { grid-template-columns:1fr; }.project-inspector .image-demo-controls { grid-template-columns:1fr; gap:12px; }.project-inspector .image-results { gap:12px; }.project-inspector .image-results figcaption { font-size:14px; }.project-inspector .image-results p { font-size:11px; }.project-inspector .image-source { gap:12px; }.project-inspector :is(th,td) { padding:8px 6px; }.project-inspector table { font-size:12px; } }
@media print { .project-inspector { display:none; } }
`;
