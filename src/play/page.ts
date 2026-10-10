import { PROJECTS, projectPath } from '../projects/catalog';
import { readingShell } from '../projects/page';
import { esc } from '../panels/helpers';

const CONCEPTS: Record<string, { name: string; task: string; lesson: string }> = {
  bakiano: { name: 'Market run', task: 'Build a comparable shopping basket across stores. Spot the stale price or mismatched pack before choosing the cheapest basket.', lesson: 'A useful price needs identity, currency and time context.' },
  'gcp-ingestion-lab': { name: 'Delivery room', task: 'Receive a file twice, then receive an older observation. Choose the receipt and merge rules that preserve the right rows.', lesson: 'Event delivery and correct warehouse state are different things.' },
  'catalog-match-lab': { name: 'Same or different?', task: 'Judge three pairs of fictional listings. Match the presentation, reject a conflict, or ask for more evidence.', lesson: 'Similar words do not establish product identity.' },
  'bigquery-query-guard': { name: 'Query budget', task: 'Choose between two recorded queries. Keep the required answer while reducing unnecessary reads, then inspect the recorded evidence.', lesson: 'Output size, scan size, billed bytes and runtime answer different questions.' },
  'ascii-art': { name: 'Pixel workshop', task: 'Rebuild an image with a limited character palette. Compare how detail, brightness and character choice affect the result.', lesson: 'Representation is a tradeoff: choose which detail to preserve.' },
  vesti: { name: 'Outfit puzzle', task: 'Select a garment, keep the outfit context, and compare possible replacements. This station stays a concept while Vesti develops.', lesson: 'Visual resemblance and a useful replacement are separate decisions.' },
};

// Original, intentionally generic marker. This is not a portrait of Alejandro.
const AVATAR = `<svg class="avatar" viewBox="0 0 16 22" aria-hidden="true" shape-rendering="crispEdges"><path fill="#e8b286" d="M5 2h6v7H5z"/><path fill="#101b16" d="M4 1h8v4H4zM4 4h2v2H4zM7 5h1v1H7zM10 5h1v1h-1z"/><path fill="#a9c9b5" d="M4 10h8v7H4zM2 11h2v5H2zM12 11h2v5h-2z"/><path fill="#e8b286" d="M2 16h2v2H2zM12 16h2v2h-2z"/><path fill="#718dba" d="M4 17h3v4H4zM9 17h3v4H9z"/><path fill="#f1ecdf" d="M3 21h4v1H3zM9 21h4v1H9z"/></svg>`;

const playStyles = `
.arcade-intro { max-width:850px; padding-bottom:24px; }
.arcade-intro p { max-width:72ch; }
.arcade-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:28px; align-items:start; }
.arcade-map { min-width:0; }
.arcade-map fieldset { border:0; margin:0; padding:0; min-width:0; }
.arcade-map legend { font-size:14px; font-weight:600; padding:0 0 12px; }
.stations { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.station { position:relative; min-width:0; }
.station input { position:absolute; width:1px; height:1px; opacity:0; }
.station label { display:flex; flex-direction:column; align-items:center; justify-content:flex-start; min-height:170px; padding:14px 8px 38px; border:1px solid var(--line); border-radius:8px; background:var(--surface); text-align:center; cursor:pointer; position:relative; }
.station input:checked+label { border:2px solid var(--accent); padding:13px 7px 37px; }
.station input:focus-visible+label { outline:2px solid var(--accent); outline-offset:4px; }
.station-number { font:11px var(--mono); color:var(--muted); }
.station-screen { display:grid; place-items:center; width:64px; height:40px; margin:10px 0; border:1px solid var(--line); border-bottom:4px solid var(--line); background:var(--bg); font:16px var(--mono); }
.station label strong { font-size:13px; line-height:1.3; }
.station label small { color:var(--muted); font:10px/1.5 var(--mono); margin-top:5px; }
.avatar { width:24px; height:33px; image-rendering:pixelated; }
.station .avatar { display:none; position:absolute; bottom:3px; }
.station input:checked+label .avatar { display:block; }
.map-help { font-size:12px; color:var(--muted); margin-top:14px; }
.phone-tip { display:none; }
.station-panel { padding:24px; border:1px solid var(--line); border-radius:8px; background:var(--surface); margin-bottom:20px; }
.station-panel h2 { margin:8px 0 12px; font-size:23px; }
.station-panel p { color:var(--muted); font-size:14px; }
.station-panel .lesson { margin-top:18px; border-top:1px solid var(--line); padding-top:14px; color:var(--fg); }
.station-panel .read-link { display:inline-block; margin-top:18px; }
.game { margin-top:24px; padding-top:22px; border-top:1px solid var(--line); }
.game h3 { font-size:17px; margin:12px 0; }
.game-progress { display:flex; justify-content:space-between; gap:12px; color:var(--muted); font:11px/1.6 var(--mono); }
.listings { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0; }
.listing { background:var(--bg); border:1px solid var(--line); padding:12px; border-radius:5px; }
.listing span { display:block; color:var(--muted); font:10px var(--mono); margin-bottom:8px; }
.listing strong { font-size:15px; line-height:1.5; display:block; }
.game-choices { display:flex; flex-wrap:wrap; gap:8px; }
.game button { cursor:pointer; background:var(--bg); color:var(--fg); }
.game button:hover:not(:disabled) { border-color:var(--accent); }
.game button:disabled { cursor:default; opacity:.55; }
.game-feedback { margin-top:18px; border-left:2px solid var(--accent); padding-left:14px; }
.game-feedback[data-correct=true] { border-color:#b6ddb5; }
.game-feedback strong { display:block; margin-bottom:6px; }
.evidence-table { border-collapse:collapse; width:100%; margin-top:16px; font-size:12px; }
.evidence-table caption { text-align:left; margin-bottom:8px; font-weight:600; }
.evidence-table :is(th,td) { text-align:left; padding:8px 6px; border-bottom:1px solid var(--line); vertical-align:top; }
.game-next { margin-top:16px; }
.arcade-note { color:var(--muted); font-size:13px; margin-top:18px; }
@media(max-width:900px) { .arcade-layout { grid-template-columns:1fr; }.stations { grid-template-columns:repeat(3,minmax(0,1fr)); }.station label { min-height:160px; } }
@media(max-width:480px) { .stations { grid-template-columns:repeat(6,135px); overflow-x:auto; padding:5px; }.phone-tip { display:inline; }.station-panel { padding:18px; }.game-choices { flex-direction:column; }.listing { padding:10px; } }
`;

export function renderPlayPage(origin: string): string {
  const symbols = ['$', '⇣', '≍', 'SQL', '@', '▧'];
  return readingShell('Project arcade · prototype', 'An optional arcade concept: one project per station, with a playable catalog identity challenge.', '/play', origin, `
<header class="intro arcade-intro"><p class="eyebrow">Fun mode · early prototype</p><h1>Project arcade</h1><p>Each station turns a project’s central question into a small game. Start with Catalog Match: it’s playable. The other five stations describe the games we could build next.</p></header>
<div class="arcade-layout"><div class="arcade-map"><fieldset id="station-controls" hidden><legend>Choose a project station</legend><div class="stations">${PROJECTS.map((p,i) => `<div class="station"><input type="radio" name="station" id="station-${p.slug}" value="${p.slug}"${p.slug === 'catalog-match-lab' ? ' checked' : ''} aria-controls="concept-${p.slug}"><label for="station-${p.slug}"><span class="station-number">${String(i+1).padStart(2,'0')}</span><span class="station-screen" aria-hidden="true">${symbols[i]}</span><strong>${esc(p.title)}</strong><small>${p.slug === 'catalog-match-lab' ? 'Playable' : 'Game concept'}</small>${AVATAR}</label></div>`).join('')}</div></fieldset>
<p class="map-help"><span class="phone-tip">Swipe for more stations. </span>Choose a station by touch, mouse or keyboard. Tab into the station choices and use the arrow keys. The avatar marks your selection.</p><p class="arcade-note">Placeholder avatar · no sound, timer or account. All project stories are also available in <a href="/#projects">reading mode</a>.</p><noscript><p>JavaScript is needed for the station selector and matching challenge. All project concepts and reading links are available below.</p></noscript></div>
<div class="station-panels">${PROJECTS.map(p => { const concept = CONCEPTS[p.slug]; return `<section class="station-panel" id="concept-${p.slug}" data-station-panel="${p.slug}" aria-labelledby="concept-title-${p.slug}"><p class="eyebrow">${esc(p.title)} · ${p.slug === 'catalog-match-lab' ? 'Playable sample' : 'Game concept'}</p><h2 id="concept-title-${p.slug}">${esc(concept.name)}</h2><p>${esc(concept.task)}</p><p class="lesson">${esc(concept.lesson)}</p>${p.slug === 'catalog-match-lab' ? gameMarkup() : ''}<a class="read-link" href="${projectPath(p)}">Read ${esc(p.title)} →</a></section>`; }).join('')}</div></div>`, playStyles, `import { initArcade } from '/play/arcade.mjs'; initArcade();`);
}

function gameMarkup(): string {
  return `<section class="game" id="catalog-game" aria-label="Catalog identity challenge" hidden>
<div class="game-progress"><span id="round-label"></span><span id="score-label"></span></div>
<h3 id="round-question" tabindex="-1">Same product presentation?</h3>
<div class="listings"><div class="listing"><span>LISTING A</span><strong id="listing-a"></strong></div><div class="listing"><span>LISTING B</span><strong id="listing-b"></strong></div></div>
<div class="game-choices" role="group" aria-label="Your identity decision"><button class="action" type="button" data-answer="same">Same presentation</button><button class="action" type="button" data-answer="different">Different</button><button class="action" type="button" data-answer="uncertain">Not enough evidence</button></div>
<div class="game-feedback" id="game-feedback" role="status" aria-live="polite" aria-atomic="true" hidden><strong id="feedback-title"></strong><p id="feedback-reason"></p></div>
<table class="evidence-table" id="game-evidence" hidden><caption>Normalized evidence for this pair</caption><thead><tr><th scope="col">Check</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody id="evidence-rows"></tbody></table>
<button class="action game-next" type="button" id="next-round" hidden>Next pair →</button>
<p class="arcade-note">Three hand-authored fictional pairs. This introductory challenge illustrates the project’s question; it does not call the lab’s matcher or a live AI model.</p></section>`;
}
