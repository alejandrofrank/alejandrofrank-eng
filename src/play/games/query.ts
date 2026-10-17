export function renderQueryGame(): string {
  return `<section class="query-game" id="query-game" aria-label="Partition Sweep query puzzle" hidden>
    <div class="qg-top"><span>PARTITION SWEEP</span><span id="qg-progress">01 / 03</span></div>
    <h3 id="qg-heading" tabindex="-1">Cut the baggage</h3>
    <p id="qg-instruction"></p>
    <p class="qg-how">Switch dates and fields off to shape your read. Then run the plan.</p>
    <div class="qg-budget"><div><span>Planned read</span><strong id="qg-scan"></strong></div><div><span>Budget</span><strong id="qg-cap"></strong></div><div><span>Rows returned</span><strong id="qg-rows"></strong></div></div>
    <div class="qg-meter" aria-hidden="true"><span id="qg-meter-fill"></span><i id="qg-meter-cap"></i></div>
    <div class="qg-board-wrap"><table class="qg-board"><caption>Each square is one column block in a daily partition.</caption><thead><tr><th scope="col">Dates ↓<br>Fields →</th>${[['product', 'Product'], ['price', 'Price'], ['notes', 'Notes'], ['image', 'Image']].map(([id, label]) => `<th scope="col"><button type="button" data-qg-field="${id}" aria-pressed="true">${label}</button></th>`).join('')}</tr></thead><tbody>${['14', '15', '16'].map(day => `<tr><th scope="row"><button type="button" data-qg-partition="2026-10-${day}" aria-pressed="true">${day} OCT<span>2 rows</span></button></th>${['product', 'price', 'notes', 'image'].map(field => `<td data-qg-cell="2026-10-${day}/${field}"><span class="qg-cell-cost"></span><span class="qg-cell-target" aria-hidden="true">◆</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="qg-legend"><span><i class="qg-key-read"></i> Will read</span><span><b>◆</b> Required block</span><span>Numbers = scan units</span></div>
    <div class="qg-controls"><label>Output limit<select id="qg-limit"><option value="all">All rows</option><option value="1">1 row</option><option value="2">2 rows</option><option value="4">4 rows</option></select></label><button type="button" class="action" id="qg-run">Run plan →</button><button type="button" class="qg-reset" id="qg-reset">Reset</button></div>
    <div class="qg-result" id="qg-result" role="status" aria-live="polite" aria-atomic="true"><strong id="qg-result-title">Keep the answer. Cut the read.</strong><p id="qg-result-detail">Match the requested rows and fields within the budget.</p></div>
    <button type="button" class="action qg-next" id="qg-next" hidden>Next challenge →</button>
    <details class="qg-evidence"><summary>Inspect the plan and returned rows</summary><pre id="qg-sql"></pre><p id="qg-trace"></p><div class="qg-output-wrap"><table id="qg-output"><caption>Current plan preview · fictional records</caption><thead></thead><tbody></tbody></table></div><p class="qg-fine">Dates are partition metadata. Product is also read for the fixed ordering, even if you omit it from the output. LIMIT changes returned rows after scanning. This toy ignores compression, clustering, metadata shortcuts, caching and billing minimums.</p></details>
    <details class="qg-evidence"><summary>What this demonstrates in the repository</summary><p>The Query Guard checks an estimate before execution and passes a byte cap to BigQuery. This puzzle uses fictional blocks to make query shape visible; it does not execute the guard or BigQuery.</p><p>In the repository’s recorded price-card example, selecting three fields instead of all fields changed the estimated read from 18.71 MB to 6.30 MB. Lowering LIMIT from 20 to five left the estimate at 18.71 MB. These are recorded observations, not this game’s scores.</p><a href="https://github.com/alejandrofrank/bigquery-query-guard/blob/main/docs/market-lab.md" target="_blank" rel="noopener noreferrer">Inspect the recorded evidence ↗</a></details>
    <p class="qg-fine">An original miniature of the “same output, fewer resources” puzzle loop in <a href="https://www.zachtronics.com/opus-magnum/" target="_blank" rel="noopener noreferrer">Opus Magnum</a>. No copied art or levels. Fictional scan units are not MB, execution time or billed cost.</p>
  </section>`;
}

export const queryStyles = `
.query-game { padding:25px; min-width:0; --qg-ink:#eee384; --qg-ok:#b9e58a; }
.query-game[hidden] { display:none; }
.query-game .qg-top { display:flex; justify-content:space-between; font:10px var(--mono); letter-spacing:.08em; color:var(--qg-ink); }
.query-game h3 { font-size:21px; margin:13px 0 8px; }
.query-game>p { font-size:13px; color:var(--muted); margin:8px 0; }
.query-game .qg-how { font-size:11px; }
.query-game .qg-budget { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:20px; }
.query-game .qg-budget>div { display:flex; flex-direction:column; gap:2px; }
.query-game .qg-budget span { font:10px var(--mono); color:var(--muted); }
.query-game .qg-budget strong { font:600 23px var(--mono); }
.query-game .qg-budget [data-over=true] { color:#f6b56b; }
.query-game .qg-meter { height:7px; background:#343344; border-radius:2px; margin:12px 0 20px; position:relative; }
.query-game .qg-meter>span { display:block; height:100%; background:var(--qg-ink); border-radius:2px; }
.query-game .qg-meter>i { position:absolute; height:15px; width:2px; top:-4px; background:var(--fg); }
.query-game .qg-board-wrap { max-width:100%; overflow-x:auto; }
.query-game .qg-board { border-collapse:separate; border-spacing:4px; width:100%; font:11px var(--mono); table-layout:fixed; }
.query-game .qg-board caption { text-align:left; font:10px/1.6 var(--mono); color:var(--muted); padding-bottom:8px; }
.query-game .qg-board th:first-child { width:68px; }
.query-game .qg-board th { padding:0; font-weight:400; color:var(--muted); text-align:center; font-size:9px; }
.query-game .qg-board button { width:100%; min-height:44px; border:1px solid #59576a; border-radius:5px; background:#242433; color:var(--muted); font:11px var(--mono); cursor:pointer; padding:4px; }
.query-game .qg-board button[aria-pressed=true] { color:var(--fg); background:#454033; border-color:#8e8559; }
.query-game .qg-board button span { display:block; font-size:9px; opacity:.65; }
.query-game .qg-board td { position:relative; height:52px; border:1px solid #3a3948; border-radius:4px; text-align:center; background:#1f202b; color:#777585; }
.query-game .qg-board td[data-scanned=true] { border-color:#847c52; background:#5e5836; color:#fff4bf; }
.query-game .qg-board td[data-target=true] { outline:1px solid var(--qg-ok); outline-offset:-4px; }
.query-game .qg-cell-cost { font-size:16px; }
.query-game .qg-cell-target { display:none; position:absolute; top:3px; right:5px; color:var(--qg-ok); font-size:8px; }
.query-game [data-target=true] .qg-cell-target { display:block; }
.query-game .qg-legend { display:flex; flex-wrap:wrap; align-items:center; gap:7px 14px; font:9px var(--mono); color:var(--muted); margin-top:10px; }
.query-game .qg-legend>span { display:inline-flex; align-items:center; gap:5px; }
.query-game .qg-legend b { color:var(--qg-ok); }
.query-game .qg-key-read { width:10px; height:10px; background:#5e5836; border:1px solid #847c52; }
.query-game .qg-controls { display:flex; flex-wrap:wrap; align-items:end; gap:10px; margin:19px 0; }
.query-game .qg-controls label { display:grid; gap:5px; font:10px var(--mono); color:var(--muted); }
.query-game .qg-controls select { min-height:44px; border:1px solid #5a546b; background:#242433; color:var(--fg); padding:8px; border-radius:5px; font:12px var(--mono); }
.query-game .action { min-height:44px; font-size:12px; }
.query-game .qg-reset { border:0; background:transparent; color:var(--muted); padding:10px; min-height:44px; text-decoration:underline; cursor:pointer; }
.query-game .qg-result { border-left:2px solid #696174; padding:10px 13px; background:#222331; font-size:12px; }
.query-game .qg-result strong { font-weight:600; }
.query-game .qg-result p { margin:5px 0 0; color:var(--muted); font-size:12px; }
.query-game .qg-result[data-outcome=won] { border-color:var(--qg-ok); }
.query-game .qg-result[data-outcome=won] strong { color:var(--qg-ok); }
.query-game .qg-result[data-outcome=retry] { border-color:#f6b56b; }
.query-game .qg-next { margin-top:12px; }
.query-game .qg-next[hidden] { display:none; }
.query-game .qg-evidence { margin-top:18px; border-top:1px solid #393548; padding-top:12px; font-size:11px; color:var(--muted); }
.query-game .qg-evidence summary { cursor:pointer; color:var(--fg); padding:5px 0; }
.query-game .qg-evidence pre { white-space:pre-wrap; overflow-wrap:anywhere; font:10px/1.7 var(--mono); background:#12141d; padding:12px; border-radius:5px; }
.query-game .qg-output-wrap { overflow-x:auto; }
.query-game #qg-output { border-collapse:collapse; min-width:100%; font-size:10px; }
.query-game #qg-output caption { text-align:left; margin:8px 0; font-size:10px; }
.query-game #qg-output :is(th,td) { text-align:left; padding:6px; border-bottom:1px solid #393548; }
.query-game .qg-fine { font-size:10px; color:var(--muted); line-height:1.7; margin-top:16px; }
.query-game button:focus-visible,.query-game summary:focus-visible { outline:2px solid var(--qg-ink); outline-offset:3px; }
@media(max-width:780px) { .query-game { padding:20px; } }
@media(max-width:420px) { .query-game { padding:16px; }.query-game .qg-board { border-spacing:3px; }.query-game .qg-board th:first-child { width:55px; }.query-game .qg-board button { font-size:10px; }.query-game .qg-budget span { font-size:9px; }.query-game .qg-budget strong { font-size:20px; } }
`;
