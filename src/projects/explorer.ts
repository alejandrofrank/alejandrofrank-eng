import { PROJECTS, projectPath } from './catalog';
import { esc } from '../panels/helpers';

const COLORS = ['#abedac', '#8ccfff', '#c3abff', '#f2c47b', '#f2a9bf', '#93e3d6'];
const SYMBOLS = ['↗', '⇣', '≍', '⌁', '@', '◇'];

const box = (x: number, y: number, width: number, title: string, detail: string) => `<g class="sketch-node"><rect x="${x}" y="${y}" width="${width}" height="64" rx="8"/><text x="${x + 14}" y="${y + 27}" class="sketch-label">${title}</text><text x="${x + 14}" y="${y + 46}" class="sketch-small">${detail}</text></g>`;
const wire = (d: string) => `<path class="sketch-wire" d="${d}"/>`;
const sketches: Record<string, { caption: string; body: string }> = {
  bakiano: { caption: 'From scattered sources to a connected market view.', body:
    wire('M164 48H202V115H250M164 115H250M164 182H202V115M390 115H448') +
    box(20, 16, 144, 'Retail', 'source snapshots') + box(20, 83, 144, 'Real estate', 'source snapshots') + box(20, 150, 144, 'Telecom', 'source snapshots') +
    box(250, 83, 140, 'Market data', 'identity + history') + box(448, 83, 172, 'AI analyst', 'traceable answers') },
  'gcp-ingestion-lab': { caption: 'Repeated delivery. One completed receipt.', body:
    wire('M158 65H205V115H260M158 165H205V115M406 115H465') +
    box(20, 33, 138, 'event / 01', 'first delivery') + box(20, 133, 138, 'event / 01', 'delivered again') +
    box(260, 83, 146, 'Object version', 'validate + merge') + box(465, 83, 155, 'Receipt', 'already handled') +
    '<g class="sketch-node"><path d="m522 185 12 12 26-30" class="sketch-check"/><text x="305" y="202" class="sketch-small">replay without duplicating</text></g>' },
  'catalog-match-lab': { caption: 'A matching name can hide a different presentation.', body:
    wire('M224 108H285M355 108H416') +
    '<g class="sketch-node"><path class="sketch-carton" d="M132 55h60l22 26v102h-82V81l22-26M132 81h82M154 55v26"/><text x="153" y="117" class="sketch-label">LOMA</text><text x="156" y="152" class="sketch-volume">1 L</text></g>' +
    '<g class="sketch-node"><path class="sketch-carton" d="M433 94h43l17 20v69h-60v-69l17-20M433 114h60M450 94v20"/><text x="444" y="139" class="sketch-small">LOMA</text><text x="440" y="165" class="sketch-label">200 ml</text></g>' +
    '<g class="sketch-node"><circle cx="320" cy="108" r="35"/><text x="320" y="122" text-anchor="middle" class="sketch-symbol">≠</text></g><text x="160" y="215" class="sketch-small">same brand</text><text x="423" y="215" class="sketch-small">different size</text>' },
  'bigquery-query-guard': { caption: 'Authorization and a byte budget before execution.', body:
    wire('M206 114H253M390 69H431V115H476M390 163H431V115') +
    '<g class="sketch-node"><rect x="20" y="57" width="186" height="114" rx="8"/><text x="38" y="87" class="sketch-label">SELECT …</text><text x="38" y="113" class="sketch-small">WHERE scope = …</text><text x="38" y="139" class="sketch-small">AND date = …</text></g>' +
    box(253, 37, 137, '01 / Authorize', 'scope + cache') + box(253, 131, 137, '02 / Estimate', 'enforce byte cap') + box(476, 83, 144, 'Execute', 'bounded request') },
  'ascii-art': { caption: 'Pixels, dithering or characters. Compare what survives.', body:
    wire('M232 115H288M354 115H410') +
    '<g class="sketch-node"><rect x="45" y="30" width="188" height="170" rx="8"/><circle cx="184" cy="72" r="17" class="sketch-fill"/><path class="sketch-land" d="m58 184 55-89 30 42 22-25 56 72Z"/><text x="107" y="220" class="sketch-small">IMAGE</text></g>' +
    '<g class="sketch-node"><text x="320" y="128" text-anchor="middle" class="sketch-symbol">@</text></g>' +
    '<g class="sketch-node"><rect x="410" y="30" width="188" height="170" rx="8"/><text x="426" y="60" class="sketch-ascii"><tspan x="426" dy="0">. . . . . : o o .</tspan><tspan x="426" dy="17">. . . . . o @ @ o</tspan><tspan x="426" dy="17">. . /\\ . . : o .</tspan><tspan x="426" dy="17">. /##\\ . . . . .</tspan><tspan x="426" dy="17">./####\\ ./\\. . .</tspan><tspan x="426" dy="17">/######V####\\. .</tspan><tspan x="426" dy="17">##############\\.</tspan><tspan x="426" dy="17">################</tspan></text><text x="483" y="220" class="sketch-small">TEXT</text></g>' },
  vesti: { caption: 'Planned flow: keep the outfit, replace one piece.', body:
    wire('M215 110H277M362 110H425') +
    '<g class="sketch-node"><path class="sketch-carton" d="m121 38-42 24 21 39 22-12v74h91V89l22 12 21-39-43-24c-25 24-65 24-92 0Z"/><path class="sketch-land" d="m130 173-9 48h34l13-29 12 29h34l-10-48Z"/></g>' +
    '<g class="sketch-node"><rect x="277" y="74" width="85" height="72" rx="8"/><text x="288" y="106" class="sketch-small">selected</text><text x="297" y="127" class="sketch-label">piece</text></g>' +
    box(425, 30, 195, 'Visual similarity', 'compare alternatives') + box(425, 135, 195, 'Outfit context', 'retain the intent') },
};

export function renderProjectExplorer(): string {
  return `<div class="explorer-toolbar" id="explorer-tools" hidden><span>${String(PROJECTS.length).padStart(2, '0')} projects <span aria-hidden="true">/</span> pick your next rabbit hole</span><button type="button" id="explorer-view-toggle" aria-pressed="false">Read as a list <span aria-hidden="true">☷</span></button></div>
<div class="project-explorer" id="project-explorer" hidden>
<fieldset class="project-rail"><legend>Choose a project</legend><div class="project-choices">${PROJECTS.map((p, i) => `<label class="project-choice" style="--project-color:${COLORS[i]}"><input type="radio" name="project-choice" value="${p.slug}" aria-controls="preview-${p.slug}"${i === 0 ? ' checked' : ''}><span class="choice-body"><span class="choice-number">${String(i + 1).padStart(2, '0')}</span><span class="choice-copy"><strong>${esc(p.title)}</strong><small>${esc(p.category)}</small></span><span class="choice-symbol" aria-hidden="true">${SYMBOLS[i]}</span></span></label>`).join('')}</div><p class="rail-help">Tab to select. Arrow keys to explore.</p></fieldset>
<div class="project-stage"><div class="stage-chrome"><span><i aria-hidden="true"></i> PROJECT / <span id="explorer-position">01</span></span><div><button type="button" id="project-previous" aria-label="Previous project">←</button><button type="button" id="project-next" aria-label="Next project">→</button></div></div>
${PROJECTS.map((p, i) => `<article class="project-preview" id="preview-${p.slug}" data-preview="${p.slug}" style="--project-color:${COLORS[i]}" aria-labelledby="preview-title-${p.slug}"${i ? ' hidden' : ''}>
<div class="preview-heading reveal-part"><span class="preview-category">${esc(p.category)}</span><span class="preview-status">${esc(p.status)}</span></div><h3 class="reveal-part" id="preview-title-${p.slug}">${esc(p.title)}<span aria-hidden="true">${SYMBOLS[i]}</span></h3>
<figure class="project-sketch reveal-part"><svg viewBox="0 0 640 235" aria-hidden="true" focusable="false">${sketches[p.slug].body}</svg><figcaption>${esc(sketches[p.slug].caption)}</figcaption></figure>
<div class="preview-story reveal-part"><p class="preview-question">${esc(p.question)}</p><p>${esc(p.summary)}</p></div><ol class="preview-flow reveal-part" aria-label="System flow">${p.flow.map(step => `<li>${esc(step)}</li>`).join('')}</ol>
<div class="preview-actions reveal-part"><a class="project-open" href="${projectPath(p)}">Read the project <span aria-hidden="true">↗</span></a><a class="project-play" href="/play#${p.slug}">${p.slug === 'catalog-match-lab' ? 'Play the matching game' : 'Explore the game concept'} <span aria-hidden="true">→</span></a></div>
</article>`).join('')}<p class="explorer-announcement" id="explorer-announcement" role="status" aria-live="polite" aria-atomic="true"></p></div></div>`;
}
